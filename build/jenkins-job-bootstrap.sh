
source ~/.bashrc

echo "Build URL: $BUILD_URL"

if [ "$JIGSAW_BUILD_ROOT" == "" ]; then
    echo "Error: invalid JIGSAW_BUILD_ROOT env var!"
    exit 1
fi

changeId=$1
echo "Using changeId: $changeId"

session=`curl -s -k "https://localhost:8083/dev-ops-helper/query-session"`
user=$(echo $session | grep -oP '"X-Emp-No":"\K[^"]*')
auth=$(echo $session | grep -oP '"X-Auth-Value":"\K[^"]*')
if [[ "$user" == "" || "$auth" == "" ]]; then
    echo "Error: 无法读取鉴权信息，和陈旭联系一下吧 ...."
    exit 1
fi

url="https://gerrit.zte.com.cn/a/changes"
cookie="Cookie: PORTALSSOUser=$user; PORTALSSOCookie=$auth;"
contentType="Content-Type: application/json; charset=UTF-8"
changes=`curl -H "$cookie" -H "$contentType" "$url/?q=vmax/rdk/jigsaw+limit:10&O=81&pp=0" | sed "s/)]}'//"`
eval $(node -e "
    console.error('reading change brief info ....');
    const change = $changes.find(ch => ch.change_id == '$changeId');
    console.error('gerrit change found:', !!change);
    if (change) {
        console.log(\`branch=\${change.branch}; change=\${change._number}\`);
    } else {
        console.log(\`branch=; change=\`);
    }
")

if [[ "$branch" == "" || "$change" == "" ]]; then
    echo "Error: 根据 changeId $changeId 找不到对应的 gerrit 代码信息，很奇怪。"
    exit 1
fi

detail=`curl -H "$cookie" -H "$contentType" "$url/$change/detail?O=10004" | sed "s/)]}'//"`
eval $(node -e "
    console.error('reading patch number and revision id ....');
    const revisions = $detail.revisions;
    console.error('gerrit revisions found:', !!revisions);
    let patch = 0, rid;
    for (let r in revisions) {
        if (patch > revisions[r]._number) {
            continue;
        }
        patch = revisions[r]._number;
        rid = r;
    }
    console.log(\`patch=\${patch}; revision=\${rid}\`);
")

if [[ "$patch" == "0" ]]; then
    echo "Error: 根据 changeId $changeId 找不到对应的patch数，很奇怪。"
    exit 1
fi

echo "trigger change: https://gerrit.zte.com.cn/#/c/$change/$patch"
echo "gerrit change branch: $branch"
echo "gerrit change number: $change"
echo "gerrit change patch: $patch"
echo "gerrit change revision: $revision"

if [[ "$change" == "" || "$patch" == "0" || "$branch" == "" || "$revision" == "" ]]; then
    echo "Error: invalid parameters!!"
    exit 1
fi

function markWorkflow() {
    local result=$1
    local score=$2
    echo "marking build message, and set workflow score to $score..."
    local info=`curl -s -i -H "$cookie" "https://gerrit.zte.com.cn/#/c/$change/"`
    local account=`echo $info | grep -oP 'GerritAccount=\K[^;]*'`
    local token=`echo $info | grep -oP 'XSRF_TOKEN=\K[^;]*'`
    local data='{"labels":{"Code-Review":0,"Verified":0,"Workflow":'$score'},"strict_labels":true,
        "message":"Build '$result'. '$BUILD_URL'"}'
    curl -H "Cookie: GerritAccount=$account" -H "$contentType" -H "X-Gerrit-Auth: $token" \
         -X POST -d "$data" "$url/$change/revisions/$revision/review"
}

markWorkflow "Started" -1

overallTimestamp=`date +%s`
echo "self process id: $$"
finishedCode=0

function onExit() {
    echo "the script is exiting, code=$finishedCode"
    test "$finishedCode" == "0" && score="1" || score="-1"
    markWorkflow "Finished" $score
}
trap onExit EXIT

workspace=$JIGSAW_BUILD_ROOT/change-$change-$patch
if [ ! -d $workspace ]; then
    mkdir $workspace
fi
cd $workspace

# 停止当前change正在跑的其他所有任务，避免重复跑，增加不必要的服务器压力
pidList=`ps -eo pid,args | grep -P "change-$change-\d+" | grep build/ci-run.sh | grep -v $$ | grep -v grep | awk '{print $1}'`
if [ "$pidList" != "" ]; then
    echo "kill running old job, pid list: $pidList"
    kill $pidList
fi

function fetch() {
    local flag=`echo $change | grep -Po "\d\d$"`
    local refSpec="refs/changes/$flag/$change/$patch"
    echo "fetching $refSpec ..."
    git fetch ssh://10045812@gerritro.zte.com.cn:29418/vmax/rdk/jigsaw $refSpec
    finishedCode=$?
    if [ "$finishedCode" != "0" ]; then
        echo "Error: unable to fetch $refSpec from gerrit, this is NOT our problem!"
        exit 1
    fi
    git checkout FETCH_HEAD
}

function rebase() {
    git rebase origin/$branch
    finishedCode=$?
    if [ "$finishedCode" != "0" ]; then
        exit 1
    fi
}

cd $workspace
git status > /dev/null 2> /dev/null
if [ "$?" == "0" ]; then
    # 仓库可用，应该是重跑触发的，直接利用
    git rebase --abort
    git checkout .
    git clean -xdf
    git checkout master
    git pull
else
    time git clone ssh://10045812@gerritro.zte.com.cn:29418/vmax/rdk/jigsaw ./
    if [ "$?" != "0" ]; then
        echo "failed to clone Jigsaw repo, fix this problem and try again!"
        exit 1
    fi
fi

fetch
rebase

# 传这个参数没啥用，主要是用于前面grep
sh build/ci-run.sh change-$change-$patch
finishedCode=$?
echo "build/ci-run.sh finished! code = $finishedCode"

exit $finishedCode

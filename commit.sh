#!/bin/bash

function printUsageAndExit() {
    echo "----------------------------------------------------------------------------------------------------"
    echo $1
    echo "----------------------------------------------------------------------------------------------------"
    echo "用法：下面命令之一来提交一个特定类型的修改，其中 wip 参数是可选的"
    echo "  提交一个 [新增]：      sh tools/commit.sh new 本次提交的简要说明（必选），解决了 @123和@456（可选）"
    echo "  提交一个 [故障]：      sh tools/commit.sh fix 本次提交的简要说明（必选），解决了 @123和@456（可选）"
    echo "  提交一个 [优化]：      sh tools/commit.sh opt 本次提交的简要说明（必选），解决了 @123和@456（可选）"
    echo "  提交一个 [破坏性修改]： sh tools/commit.sh bc  本次提交的简要说明（必选），解决了 @123和@456（可选）"
    echo "  提交一个内部修改：      sh tools/commit.sh ot  本次提交的简要说明（必选），解决了 @123和@456（可选）"
    echo "  "
    echo "  重新提交前一次修改：   sh tools/commit.sh amend"
    echo "             或者：   sh tools/commit.sh amd"
    echo "  "
    echo "  将代码推送给服务器：   sh tools/commit.sh push"
    echo "----------------------------------------------------------------------------------------------------"
    echo "其他说明："
    echo "  1. 让当前commit与issue关联的方法，使用“解决”/“关联”这2个关键字（“了”字可选）。"
    echo "     例子1： 解决了 @1111 @2222和@3333"
    echo "     例子2： 与RDC活动混合使用的示例：解决了RDC-WX:WIB-114533，@1111和@2222"
    echo "     例子3： 关联 @1111,@2222,@3333"
    echo "  2. 让当前commit与change关联的方法，使用“关联”关键字（“了”字可选）。"
    echo "     例子1： 关联change-15134311"
    echo "     例子2： 关联change-15134311 @1111 @2222"
    echo "  3. 关于WIP标记：这是一个可选标记，是 Work In Progress 的缩写"
    echo "     使用时机：当一份代码由于任何原因需要告知评审员不能合入时，可添加上这个标记；"
    echo "     添加方法：1)新建commit时可采用wip标记自动添加；2)后续可使用amend指令后手工增加或者去掉"
    exit 1
}

function triggerDevopsJob() {
    echo "正在触发流水线，请稍候....."

    local changeId=`git log -1 | grep 'Change-Id:' | awk '{print $2}'`
    echo "Change Id: $changeId"
    if [ "$changeId" == "" ]; then
        echo "无效的 Change Id，请确认当前仓库已正确克隆，或者使用下面这个命令修复，注意将10045812替换为你的工号"
        echo "scp -p -P 29418 10045812@gerrit.zte.com.cn:hooks/commit-msg .git/hooks/"
        return 1
    fi

    # 等一会再触发，确保流水线可以查询到gerrit代码
    sleep 5
    url="https://cloudci.zte.com.cn/zxvmax-ran/job/ZXWINMO/job/VerifyCI/job/verifyci-jigsaw"
    curl -s "$url/buildWithParameters?token=run-verify-ci-for-jigsaw&changeId=$changeId"
    echo "流水线任务应该已经触发"
}

wip=""
if [[ "$1" == "wip" || "$1" == "WIP" ]]; then
    wip="WIP "
    shift 1
fi

command=$1
shift 1
if [[ "$command" != "new" && "$command" != "fix" && "$command" != "opt" && "$command" != "bc" && \
    "$command" != "amend" && "$command" != "amd" && "$command" != "push" && "$command" != "ot" ]];then
    printUsageAndExit "未支持的指令$command，必须是 new / fix / opt / bc / ot / amend(amd) / push 之一"
fi

if [[ "$command" == "amend" || "$command" == "amd" ]]; then
    git commit --amend --date="`date '+%Y-%m-%d %H:%M:%S'`"
    exit 0
fi

if [[ "$command" == "push" ]]; then
    git push origin HEAD:refs/for/master%r=chen.xu8@zte.com.cn
    triggerDevopsJob
    exit 0
fi

message=$*
if [[ "$message" == "" ]]; then
    printUsageAndExit "提交的信息不能为空！"
fi

if [[ "$command" == "new" ]]; then
    message="[新增] $message"
fi

if [[ "$command" == "fix" ]]; then
    message="[故障] $message"
fi

if [[ "$command" == "opt" ]]; then
    message="[优化] $message"
fi

if [[ "$command" == "bc" ]]; then
    message="[破坏性修改] $message"
fi

echo "正在提交：$message ..."
git commit -m "$message"


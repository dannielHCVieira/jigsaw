const fs = require('fs-extra');
const path = require('path');
const minimist = require('minimist');

require('ts-node').register({
    project: path.join(__dirname, 'tsconfig.json')
});

const {buildFormly, publishFormly} = require("./tasks/build-formly");
const {buildNoviceGuide, buildUnifiedPaging} = require("./tasks/build");
const {ensureUrlMatchesPath} = require("./tasks/ensure-url-matches-path");
const {generateDemoInfo} = require("./tasks/generate-demo-info");
const {
    publishAll, publishGovernanceFormly, publishGovernanceJigsaw, buildGovernanceJigsaw,
    buildGovernanceFormly, npmInstall
} = require("./tasks/publish");

const {cleanAndBuild, publishJigsaw} = require('./tasks/build');

process.chdir(path.join(__dirname, '../../../'));

const task = process.argv[2];
global.ngVersion = process.argv[3] || 'ng18';

const argv = minimist(process.argv.slice(4));
global.inDocker = argv.inDocker;
console.log(`--- build-lib, task: ${task}, ngVersion: ${global.ngVersion}, inDocker: ${global.inDocker} ---`);

if (!task) {
    printUsage('请输入任务名！');
    process.exit(1);
}

if(global.ngVersion && global.ngVersion !== 'ng9' && global.ngVersion !== 'ng18') {
    printUsage('ng版本输入错误！');
}

const param = task.split(':');

switch (param[0]) {
    case 'npmInstall':
        npmInstall('normal');
        break;
    case 'build':
        runBuildTask(param[1]);
        break;
    case 'publish':
        runPublishTask(param[1]);
        break;
    case 'ensure-url-matches-path':
        ensureUrlMatchesPath();
        break;
    case 'generate-demo-info':
        generateDemoInfo();
        break;
}

function runBuildTask(task) {
    switch (task) {
        case 'formly':
            npmInstall('normal');
            buildFormly().then();
            break;
        case 'jigsaw':
        case 'jigsaw-mobile':
        case 'jigsaw-omni':
            npmInstall('normal');
            cleanAndBuild(task).then();
            break;
        case 'governance-jigsaw':
            npmInstall('governance');
            buildGovernanceJigsaw().then();
            break;
        case 'governance-formly':
            npmInstall('governance');
            buildGovernanceFormly().then();
            break;
        case 'jigsaw-unified-paging':
        case 'jigsaw-mobile-unified-paging':
        case 'jigsaw-omni-unified-paging':
            npmInstall('normal');
            buildUnifiedPaging(task.replace('-unified-paging', '')).then();
            break;
        case 'jigsaw-novice-guide':
        case 'jigsaw-mobile-novice-guide':
        case 'jigsaw-omni-novice-guide':
            npmInstall('normal');
            buildNoviceGuide(task.replace('-novice-guide', '')).then();
            break;
        default:
            printUsage('build参数错误！');
    }
}

function runPublishTask(task) {
    switch (task) {
        case 'formly':
            npmInstall('normal');
            publishFormly().then();
            break;
        case 'jigsaw':
        case 'jigsaw-mobile':
        case 'jigsaw-omni':
            npmInstall('normal');
            publishJigsaw().then();
            break;
        case 'all':
            publishAll('all').then();
            break;
        case 'normal':
            publishAll('normal').then();
            break;
        case 'governance':
            publishAll('governance').then();
            break;
        case 'governance-jigsaw':
            npmInstall('governance');
            publishGovernanceJigsaw().then();
            break;
        case 'governance-formly':
            npmInstall('governance');
            publishGovernanceFormly().then();
            break;
        default:
            printUsage('publish参数错误！');
    }
}

function printUsage(extra) {
    console.error('Error:', extra);
    console.error('用法');
    console.error(' ================= 要生成ng9的包需要在以下命令后面加参数 ng9 =================');
    ['jigsaw', 'jigsaw-mobile', 'jigsaw-omni'].forEach(packageName => {
        console.error(` - 构建${packageName}打包：node build-lib.js build:${packageName}`);
        console.error(` - 构建${packageName}统一分页：node build-lib.js build:${packageName}-unified-paging`);
        console.error(` - 构建${packageName}新手指南：node build-lib.js build:${packageName}-novice-guide`);
        console.error(` - 发布${packageName}：node build-lib.js publish:${packageName}`);
    })
    console.error(` - 构建formly：node build-lib.js build:formly`);
    console.error(` - 发布formly：node build-lib.js publish:formly`);
    console.error(` - 发布所有：node build-lib.js publish:all`);
    console.error(` - 构建治理版本jigsaw：node build-lib.js build:governance-jigsaw`);
    console.error(` - 构建治理版本formly：node build-lib.js build:governance-formly`);
    console.error(` - 发布治理版本jigsaw：node build-lib.js publish:governance-jigsaw`);
    console.error(` - 发布治理版本formly：node build-lib.js publish:governance-formly`);
    console.error(' - 检查demo url：node build-lib.js ensure-url-matches-path');
    console.error(' - 生成demo列表的json数据给网站使用：node build-lib.js generate-demo-info');
}

const fs = require('fs-extra');
const {spawn} = require("child_process");
const chokidar = require("chokidar");
const path = require("path");
const generateGetterSetter = require("./scripts/generate-getter-setter");
const processSource = require("./scripts/create-tmp-src");
const {exec, npmInstall} = require("./npm-install");

const app = process.argv[2];
if (app !== 'jigsaw-app-external' && app !== 'jigsaw-app-internal') {
    printUsage(`无效的app "${app}"，必须是 jigsaw-app-external/jigsaw-app-internal 之一`);
    process.exit(1);
}
const ngVersion = process.argv[3];
if (ngVersion !== 'ng9' && ngVersion !== 'ng13') {
    printUsage(`无效的输出类型"${ngVersion}"，必须是 ng9/ng13 之一`);
    process.exit(1);
}
const buildMode = process.argv[4];
if (buildMode !== 'prod' && buildMode !== 'dev') {
    printUsage(`无效的输出类型"${buildMode}"，必须是 prod/dev 之一`);
    process.exit(1);
}

process.chdir(path.join(__dirname, '../'));

npmInstall(ngVersion);

console.log(`building app ${app} in ${buildMode} mode ...`);

exec(`node build/scripts/extract-theme-variables.js`);
exec(`node build/scripts/create-component-wings-theme.js`);
if (app === 'jigsaw-app-external') {
    exec(`node build/scripts/generate-external-demo-info.js`);
    exec(`node build/scripts/generate-external-navigation-info.js`);
}
const docOutput = `src/app/for-external/assets/docs`;
if (buildMode === 'prod') {
    fs.removeSync(docOutput);
}
if (app === 'jigsaw-app-external' && !fs.existsSync(docOutput)) {
    exec(`sh build/scripts/doc-generator/generate.sh ${docOutput}`);
}
processSource();
if (ngVersion !== 'ng9') {
    generateGetterSetter(['src-tmp']);
}

if (buildMode === 'dev') {
    watchFiles();
    runNgServe();
} else {
    runNgBuild();
}

function watchFiles() {
    console.log('watching files ....');
    const dirs = [
        'src'
    ];
    const watcher = chokidar.watch(dirs, {
        ignored: [/.*\.(.*___jb_\w+___|gitkeep)$/, `**/node_modules/**`, `**/mock-data/**`, '**/dist/**'],
        persistent: true, awaitWriteFinish: {stabilityThreshold: 100, pollInterval: 100}
    });
    let isInitialScanComplete = false;
    const callback = debouncePathChange(function (paths) {
        // 初始化的时候会触发一次全量文件的change，需要过滤掉，不然会影响ng serve的编译
        if (!isInitialScanComplete) {
            isInitialScanComplete = true;
            return;
        }
        const tmpTsPaths = [];
        paths.forEach(pt => {
            const tmpPath = path.join(pt.replace(/^src[\/\\]/, 'src-tmp/'));
            console.log(`====Copy file ${pt} to ${tmpPath}`);
            fs.copySync(pt, tmpPath);
            if (path.extname(tmpPath).toLowerCase() === '.ts') {
                tmpTsPaths.push(tmpPath);
            }
        })
        if (ngVersion !== 'ng9') {
            generateGetterSetter(tmpTsPaths);
        }
    }, 2000);

    const callbackUnlink = debouncePathChange(function (paths) {
        console.log('removed paths: ', paths.join('\n'));
        paths.forEach(pt => {
            const tmpPath = path.join(pt.replace(/[\/\\]src[\/\\]/, '/src-tmp/'));
            fs.removeSync(tmpPath);
        })
    }, 2000);
    watcher.on('ready', () => {
        console.log('Initial scan complete. Ready for changes.');
    }).on('add', callback).on('change', callback).on('unlink', callbackUnlink);
}

function debouncePathChange(func, wait) {
    let timeout, paths = [];
    return function (path) {
        paths.push(path);
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            timeout = null;
            func.apply(this, [paths]);
            paths = [];
        }, wait);
    };
}

function runNgServe() {
    const port = process.argv[5] || 4200;
    const servePath = process.argv[6] ? '--serve-path=' + process.argv[6] : '';
    const ngServeParams = ['serve', app, '--poll', '500', '--disable-host-check', '--host', '0.0.0.0',
        '--port', port, '--proxy-config', 'proxy-config.json'];
    if (servePath) {
        ngServeParams.push(servePath);
    }
    console.log('running ng serve in spawn ...');
    const ngServe = spawn('node', [
        '--max_old_space_size=4096',
        'node_modules/@angular/cli/bin/ng',
        ...ngServeParams
    ])

    ngServe.stdout.on('data', (data) => {
        process.stdout.write(data);
    });

    ngServe.stderr.on('data', (data) => {
        process.stderr.write(data);
    });

    ngServe.on('close', (code) => {
        process.stdout.write(`子进程退出，退出码 ${code}`);
    });
}

function runNgBuild() {
    const appOutput = process.argv[5] || 'dist';
    const bh = process.argv[6] || '/latest/';
    const code = exec(`node --max_old_space_size=4096 node_modules/@angular/cli/bin/ng build ${app} ` +
        `--aot --prod --base-href="${bh}" --output-path=${appOutput}`);
    process.exit(code);
}

function printUsage(extra) {
    console.error('Error:', extra);
    console.error('用法');
    console.error(' - 生成环境编译：node build/build.js jigsaw-app-internal ng13 prod [output=dist] [baseHref=/latest/]');
    console.error(' - 开发环境编译：node build/build.js jigsaw-app-internal ng13 dev [port=4200] [baseHref]');
}

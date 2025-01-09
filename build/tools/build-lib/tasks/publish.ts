import {green, grey, yellow} from 'chalk';
import {execSync} from 'child_process';
import {existsSync, readFileSync, removeSync, statSync, writeFileSync} from 'fs-extra';
import {sync as glob} from "glob";
import * as minimist from 'minimist';
import * as path from 'path';
import {join} from 'path';
import {buildConfig} from '../util/build-config';
import {runCommandSync} from "../util/exec";
import {cleanAndBuild, publishFormly, publishJigsaw, validateCheckBundles} from "./build";
import {buildFormly} from "./build-formly";

/** Parse command-line arguments for release task. */
const argv = minimist(process.argv.slice(3));

const npm = process.platform === "win32" ? "npm.cmd" : "npm";

export function whoami() {
    try {
        /** Make sure we're logged in. */
        execSync('npm whoami --registry=https://artsh.zte.com.cn/artifactory/api/npm/rnia-release-npm/', { stdio: 'inherit' });
    } catch (error) {
        console.error("An error occurred:", error);
        console.error('当前环境未登录到npm，无法发布，请先登录后再试');
        process.exit(1);
    }
}

export async function publishPackage(packageName: string) {
    const label = argv['tag'];
    const currentDir = process.cwd();

    console.log('');
    if (!label) {
        console.log(yellow('You can use a label with --tag=labelName.'));
        console.log(yellow('Publishing using the latest tag.'));
    } else {
        console.log(yellow(`Publishing using the ${label} tag.`));
    }
    console.log('');

    await _execNpmPublish(label, `@rdkmaster/${packageName}`);

    process.chdir(currentDir);
}

export async function publishGovernanceJigsaw() {
    whoami();
    _replaceImport();
    await cleanAndBuild('jigsaw-omni');
    validateCheckBundles('jigsaw');
    await publishPackage('jigsaw');
    _restoreImport();
}

export async function buildGovernanceJigsaw() {
    _replaceImport();
    await cleanAndBuild('jigsaw-omni');
    validateCheckBundles('jigsaw');
    _restoreImport();
}

export async function publishGovernanceFormly() {
    whoami();
    _replaceImport();
    await buildFormly();
    await publishPackage('formly');
    _restoreImport();
}

export async function buildGovernanceFormly() {
    _replaceImport();
    await buildFormly();
    _restoreImport();
}

export async function publishAll(type: 'all' | 'normal' | 'governance') {
    if (!argv.nextVersion) {
        argv.nextVersion = _readNextVersion();
    }
    _checkEnv();
    whoami();

    if (type == 'all' || type == 'normal') {
        npmInstall('normal');
        argv.tag = 'latest';
        await publishJigsaw();
        await publishFormly();
    }

    if (type == 'all' || type == 'governance') {
        argv.nextVersion = argv.nextVersion + '-g1';
        argv.tag = 'governance18';
        npmInstall('governance');
        await publishGovernanceJigsaw();
        await publishGovernanceFormly();
    }
}

function _execNpmPublish(label: string, packageName: string): Promise<void> {
    _checkEnv();
    const packageDir = join(buildConfig.outputDir, packageName);
    if (!statSync(packageDir).isDirectory()) {
        return;
    }

    const packageJsonPath = join(packageDir, 'package.json');
    if (!existsSync(packageJsonPath)) {
        throw new Error(`"${packageDir}" does not have a package.json.`);
    }
    const packageJson = JSON.parse(readFileSync(packageJsonPath).toString());
    packageJson.version = argv.nextVersion;
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    if (!existsSync(join(packageDir, 'LICENSE'))) {
        throw new Error(`"${packageDir}" does not have a LICENSE file`);
    }

    process.chdir(packageDir);
    console.log(green(`Publishing ${packageName}...`));

    const tag = label ? '--tag ' + label : '';
    const dry = argv.dry ? '--dry-run' : '';
    const command = `npm publish ${tag} --access public --loglevel=warn --registry=https://artsh.zte.com.cn/artifactory/api/npm/rnia-release-npm/ ${dry}`;
    console.log(grey(`Executing: ${command}`));
    try {
        execSync(command, {stdio: 'inherit'});
        return Promise.resolve();
    } catch (error) {
        return Promise.reject(new Error(`Could not publish ${packageName}, error: ${error.message}`));
    }
}

export function npmInstall(target: 'normal' | 'governance') {
    const inDocker = (global as any).inDocker;
    const currentDir = process.cwd();
    process.chdir(`${__dirname}/../../../../`);

    if (inDocker) {
        execSync('cp package.json package.json.bak', { stdio: 'inherit' });
    } else {
        execSync('git checkout package.json package-lock.json', { stdio: 'inherit' });
    }
    _convertNgDependencies((global as any).ngVersion);
    if (target == 'governance') {
        // 使用governance版的依赖配置
        const packageJson = JSON.parse(readFileSync('package.json').toString());
        packageJson.dependencies = packageJson.dependenciesGovernance;
        writeFileSync('package.json', JSON.stringify(packageJson, null, 4));
    }
    try {
        execSync('npm install --force --ignore-scripts --registry=https://artsh.zte.com.cn/artifactory/api/npm/rnia-npm-virtual/', { stdio: 'inherit' });
    } catch (error) {
        console.error("An error occurred:", error);
    }
    // 恢复npm install过程所修改的文件
    if (inDocker) {
        execSync('rm -f package.json', { stdio: 'inherit' });
        execSync('mv package.json.bak package.json', { stdio: 'inherit' });
    } else {
        execSync('git checkout package.json package-lock.json', { stdio: 'inherit' });
    }
    process.chdir(currentDir);
}

function _convertNgDependencies(ngVersion: 'ng9' | 'ng18') {
    console.log(`installing ${ngVersion} dependencies ...`);
    removeSync('package-lock.json');
    const packageJson = JSON.parse(readFileSync('package.json').toString());
    packageJson.dependencies = {...packageJson[`${ngVersion}Dependencies`], ...packageJson.dependencies};
    packageJson.dependenciesGovernance = {...packageJson[`${ngVersion}Dependencies`], ...packageJson.dependenciesGovernance};
    packageJson.devDependencies = {...packageJson[`${ngVersion}DevDependencies`], ...packageJson.devDependencies};
    writeFileSync('package.json', JSON.stringify(packageJson, null, 4));
}

function _checkEnv() {
    if (!process.version.startsWith('v18.')) {
        throw new Error(`当前仅支持node18来构建和发布，请切换到node18。`);
    }
    const nextVersion = argv.nextVersion;
    if (!/^(\d+)\.(\d+)\.(\d+)(-\w+\d+)?/.test(nextVersion)) {
        throw new Error(`参数nextVersion("${nextVersion}")无效，必须是 10.13.1 这样的格式。`);
    }
}

function _readNextVersion() {
    execSync('npm show --registry=https://artsh.zte.com.cn/artifactory/api/npm/rnia-npm-virtual/ @rdkmaster/jigsaw', {stdio: 'inherit'});
    const prompt = require('prompt-sync')({sigint: true});
    console.log('请输入新版本号：');
    const nextVersion = prompt('>> ');
    console.log(`你输入的新版本号是：${nextVersion}`);
    return nextVersion;
}

// 需要替换的import包名
// 这里只需要修改import包名，ztree和peity是在app的angular.json中引用的，无需处理
const packages = [
    {oldPkgName: "@ngx-translate/core", newPkgName: "@rdkmaster/ngx-translate-core"},
    {oldPkgName: "core-js", newPkgName: "@rdkmaster/core-js"},
    {oldPkgName: "marked", newPkgName: "@rdkmaster/marked"},
    {oldPkgName: "ngx-color-picker", newPkgName: "@rdkmaster/ngx-color-picker"},
    {oldPkgName: "ngx-perfect-scrollbar", newPkgName: "@rdkmaster/ngx-perfect-scrollbar"},
    {oldPkgName: "web-animations-js", newPkgName: "@rdkmaster/web-animations-js"},
    {oldPkgName: "zone.js", newPkgName: "@rdkmaster/zone.js"},
    {oldPkgName: "file-saver", newPkgName: "@rdkmaster/file-saver"}
];
const jigsawHome = buildConfig.projectDir;

function _replaceImport() {
    console.log("replacing all imports ....");
    _replaceFiles(path.join(jigsawHome, "src/jigsaw"));
    _replaceFiles(path.join(jigsawHome, "src/ngx-formly"));
    _replacePackageJson();
    console.log("replace import all done");
}

function _restoreImport() {
    console.log("restoring source ....");
    runCommandSync(`git checkout src`);
    console.log("restore import all done");
}

function _replaceFiles(folder: string) {
    glob('**/*.ts', {cwd: folder}).forEach(fileName => {
        const filePath = path.join(folder, fileName);
        let code = readFileSync(filePath).toString();
        packages.forEach(pkg => {
            // 捕获所有的import语句，包含了不同的import模式
            const oldPkgRegex = new RegExp(`import\\s+([^;]*\\s+from\\s+['"]${pkg.oldPkgName}['"];?)`, 'g');
            code = code.replace(oldPkgRegex, (match) => match.replace(pkg.oldPkgName, pkg.newPkgName));
        })
        writeFileSync(filePath, code);
    });
}

function _replacePackageJson() {
    let pkgPath = path.join(jigsawHome, "src/jigsaw/omni-components/package.json");
    const pkgPcPath = path.join(jigsawHome, "src/jigsaw/pc-components/package.json");
    let packageInfo = JSON.parse(readFileSync(pkgPcPath).toString());
    packageInfo.peerDependencies = packageInfo.peerDependenciesGovernance;
    delete packageInfo.peerDependenciesGovernance;
    writeFileSync(pkgPath, JSON.stringify(packageInfo, null, '  '));

    pkgPath = path.join(jigsawHome, "src/ngx-formly/jigsaw/package.json");
    packageInfo = JSON.parse(readFileSync(pkgPath).toString());
    packageInfo.peerDependencies = packageInfo.peerDependenciesGovernance;
    delete packageInfo.peerDependenciesGovernance;
    writeFileSync(pkgPath, JSON.stringify(packageInfo, null, '  '));
}
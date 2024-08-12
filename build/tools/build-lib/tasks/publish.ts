import { exec, execSync, spawn } from 'child_process';
import { existsSync, statSync, writeFileSync, readFileSync, removeSync } from 'fs-extra';
import * as path from 'path';
import {join} from 'path';
import { green, grey, yellow } from 'chalk';
import * as minimist from 'minimist';
import { sync as glob } from "glob";
import {buildConfig} from '../util/build-config';
import {cleanAndBuild, publish, validateCheckBundles} from "./build";
import {runCommandSync} from "../util/exec";
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

export async function publishAll() {
    _checkEnv();
    whoami();
    npmInstall('normal');
    argv.tag = 'latest';
    await publish('jigsaw');
    await publish('formly');

    argv.nextVersion = argv.nextVersion + '-g1';
    argv.tag = 'governance';
    npmInstall('governance');
    await publishGovernanceJigsaw();
    await publishGovernanceFormly();
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

    const command = npm;

    const args = [
        'publish', '--access', 'public', '--loglevel=warn',
        '--registry=https://artsh.zte.com.cn/artifactory/api/npm/rnia-release-npm/'
    ];
    if (label) {
        args.push('--tag', label);
    }

    return new Promise((resolve, reject) => {
        console.log(grey(`Executing: ${command} ${args.join(' ')}`));
        if (argv['dry']) {
            resolve();
            return;
        }

        const childProcess = spawn(command, args);
        childProcess.stdout.on('data', (data: Buffer) => {
            console.log(`  stdout: ${data.toString().split(/[\n\r]/g).join('\n          ')}`);
        });
        childProcess.stderr.on('data', (data: Buffer) => {
            console.error(`  stderr: ${data.toString().split(/[\n\r]/g).join('\n          ')}`);
        });

        childProcess.on('close', (code: number) => {
            if (code == 0) {
                resolve();
            } else {
                reject(new Error(`Could not publish ${packageName}, status: ${code}.`));
            }
        });
    });
}

export function npmInstall(target: 'normal' | 'governance') {
    const currentDir = process.cwd();
    process.chdir(`${__dirname}/../../../../`);

    execSync('git checkout package.json package-lock.json', { stdio: 'inherit' });
    _convertNgDependencies((global as any).ngVersion);
    if (target == 'governance') {
        // 使用governance版的依赖配置
        const packageJson = JSON.parse(readFileSync('package.json').toString());
        packageJson.dependencies = packageJson.dependenciesGovernance;
        writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    }
    try {
        execSync('npm install --force', { stdio: 'inherit' });
    } catch (error) {
        console.error("An error occurred:", error);
    }
    // 恢复npm install过程所修改的文件
    execSync('git checkout package.json package-lock.json', { stdio: 'inherit' });
    process.chdir(currentDir);
}

function _convertNgDependencies(ngVersion: 'ng9' | 'ng13') {
    console.log(`installing ${ngVersion} dependencies ...`);
    removeSync('package-lock.json');
    const packageJson = JSON.parse(readFileSync('package.json').toString());
    packageJson.dependencies = {...packageJson[`${ngVersion}Dependencies`], ...packageJson.dependencies};
    packageJson.dependenciesGovernance = {...packageJson[`${ngVersion}Dependencies`], ...packageJson.dependenciesGovernance};
    packageJson.devDependencies = {...packageJson[`${ngVersion}DevDependencies`], ...packageJson.devDependencies};
    writeFileSync('package.json', JSON.stringify(packageJson, null, 4));
}

function _checkEnv() {
    if (!process.version.startsWith('v10.')) {
        throw new Error(`当前仅支持node10来构建和发布，请切换到node10。`);
    }
    const nextVersion = argv.nextVersion;
    console.log('Next Version from command line:', nextVersion);
    if (!/^(\d+)\.(\d+)\.(\d+)(-\w+\d+)?/.test(nextVersion)) {
        throw new Error(`参数nextVersion("${nextVersion}")无效，用法：gulp publish:jigsaw --nextVersion 1.0.0`);
    }
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
            code = code.replace(oldPkgRegex, (match, importExpr) => {
                // 直接替换import语句中的包名
                return match.replace(pkg.oldPkgName, pkg.newPkgName);
            });
        })
        writeFileSync(filePath, code);
    });
}

function _replacePackageJson() {
    let pkgPath = path.join(jigsawHome, "src/jigsaw/omni-components/package.json");
    let packageInfo = JSON.parse(readFileSync(pkgPath).toString());
    packageInfo.peerDependencies = packageInfo.peerDependenciesGovernance;
    delete packageInfo.peerDependenciesGovernance;
    writeFileSync(pkgPath, JSON.stringify(packageInfo, null, '  '));

    pkgPath = path.join(jigsawHome, "src/ngx-formly/jigsaw/package.json");
    packageInfo = JSON.parse(readFileSync(pkgPath).toString());
    packageInfo.peerDependencies = packageInfo.peerDependenciesGovernance;
    delete packageInfo.peerDependenciesGovernance;
    writeFileSync(pkgPath, JSON.stringify(packageInfo, null, '  '));
}

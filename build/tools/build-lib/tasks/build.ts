import {runCommandSync} from "../util/exec";
import {join, dirname} from 'path';
import {mkdirpSync} from 'fs-extra';
import {writeFileSync, readdirSync, copyFileSync, readFileSync} from 'fs';
import {Bundler} from 'scss-bundle';
import {green, red} from 'chalk';
import * as glob from 'glob';
import * as sass from 'sass';
import {copyFiles, removeDirOrFile} from '../util/file';
import {bundleScopedScss, createScopedTheme, getScopedThemesConfig} from '../util/create-scoped-theme';
import {buildCandidatePackage} from '../util/build-candidate-package';
import {checkReleasePackage} from '../util/validate-release';
import {publishPackage, whoami} from './publish';
import {cleanAll} from "./clean";
import {buildFormly} from "./build-formly";
const flattenCodes = require("../../../scripts/flatten-codes.js");
const updateFormlyImport = require("../../../scripts/update-formly-import.js");
const generateGetterSetter = require("../../../scripts/generate-getter-setter.js");
const processSource = require("../../../scripts/create-tmp-src.js");
const CleanCSS = require('clean-css');

const packageMap: {[prop: string]: {src: string, dist: string}} = {
    'jigsaw': {src: 'pc-components', dist: 'jigsaw'},
    'jigsaw-mobile': {src: 'mobile-components', dist: 'jigsaw-mobile'},
    'jigsaw-omni': {src: 'omni-components', dist: 'jigsaw'}
};

function buildPackage(packageName: string) {
    runCommandSync(`${join(process.cwd(), 'node_modules/.bin/ng')} build ${packageName} --configuration production`, [], {stdio: 'inherit'});
}

function buildAllThemeFile(srcGlob: string, destPath: string) {
    const files = glob.sync(srcGlob);
    for (const file of files) {
        const result = sass.renderSync({file});
        const output = new CleanCSS().minify(result.css.toString()).styles;
        const outputPath = join(destPath, file.replace(/^.*[\\\/]/, '').replace('.scss', '.css'));
        mkdirpSync(dirname(outputPath));
        writeFileSync(outputPath, output);
    }
}

async function copyAndBundleScss(packageName: string, releasePath: string, jigsawPath: string, jigsawCommonPath: string) {
    const scopedThemeHome = join(releasePath, 'prebuilt-themes', 'scoped-theme');
    const scopedThemeScssHome = join(scopedThemeHome, 'scss');
    const scopedThemeCommonHome = join(scopedThemeScssHome, 'common');
    const scopedThemeComponentHome = join(scopedThemeScssHome, packageName === 'jigsaw' ? 'pc-components' : 'mobile-components');
    copyFiles(jigsawCommonPath, '**/*scss', scopedThemeCommonHome);
    copyFiles(jigsawPath, '**/*scss', scopedThemeComponentHome);
    const allScopedThemingPrebuiltHome = join(scopedThemeComponentHome, 'theming/prebuilt/');
    const scopedThemesConfig = getScopedThemesConfig();
    for (const themeInfo of scopedThemesConfig) {
        await bundleScopedScss(themeInfo, allScopedThemingPrebuiltHome, scopedThemeScssHome);
    }
}

function createScopedThemeTask(releasePath: string) {
    const scopedThemeHome = join(releasePath, 'prebuilt-themes', 'scoped-theme');
    const scopedThemeScssHome = join(scopedThemeHome, 'scss');
    const files = readdirSync(scopedThemeScssHome).filter(file => file.endsWith('.scss'));
    for (const file of files) {
        const result = sass.renderSync({file: join(scopedThemeScssHome, file)});
        const output = new CleanCSS().minify(result.css.toString()).styles;
        const outputPath = join(scopedThemeHome, file.replace('.scss', '.css'));
        writeFileSync(outputPath, output);
        createScopedTheme(scopedThemeHome, file.replace('.scss', '.css'));
    }
}

function removeTmpFiles(releasePath: string) {
    const scopedThemeHome = join(releasePath, 'prebuilt-themes', 'scoped-theme');
    const scopedThemeScssHome = join(scopedThemeHome, 'scss');
    removeDirOrFile(scopedThemeScssHome);
}

async function bundleThemingScss(themingEntryPointPath: string, allScssGlob: string, themingBundlePath: string) {
    const result = await new Bundler().Bundle(themingEntryPointPath, [allScssGlob]);
    writeFileSync(themingBundlePath, result.bundledContent);
}

function copyPrebuiltThemeSettings(srcGlob: string, destPath: string) {
    const files = glob.sync(srcGlob);
    for (const file of files) {
        const outputPath = join(destPath, file.replace(/^.*[\\\/]/, ''));
        mkdirpSync(dirname(outputPath));
        copyFileSync(file, outputPath);
    }
}

function copyMiscFiles(releasePath: string) {
    copyFiles('./', 'LICENSE', releasePath);
    copyFiles('./', 'README.md', releasePath);
    if ((global as any).ngVersion != 'ng9') {
        copyFiles('./build/scripts', 'generate-getter-setter.js', releasePath + '/tools');
        copyFiles('./build/scripts', 'create-tmp-src.js', releasePath + '/tools');
    }
}

export function validateCheckBundles(packageName: string) {
    const releaseFailures = checkReleasePackage(packageName);
    releaseFailures.forEach(failure => console.error(red(`Failure (${packageName}): ${failure}`)));
    if (releaseFailures.length > 0) {
        throw new Error('Release output is not valid and not ready for being released.');
    } else {
        console.log(green('Release output has been checked and everything looks fine.'));
    }
}

async function build(packageName: string) {
    console.log(`----- Run Task: build:${packageName} -----`);
    const projectName = packageName;
    const distDir = './dist';
    const releasePath = join(distDir, `@rdkmaster/${packageMap[packageName].dist}`);

    const jigsawPath = `./src/jigsaw/${packageMap[packageName].src}`;
    const jigsawCommonPath = './src/jigsaw/common';
    const themingEntryPointPath = join(jigsawPath, 'theming/all-theme.scss');
    const themingBundlePath = join(releasePath, 'theming.scss');

    const allScssGlob = join(jigsawPath, '**/*.scss');
    const allThemingStyleGlob = join(jigsawPath, 'theming/prebuilt/*.scss');
    const allComponentThemingStyleGlob = join(jigsawCommonPath, 'core/theming/prebuilt/wings-theme/*.scss');
    const prebuiltThemeSettingsGlob = join(jigsawCommonPath, 'core/theming/prebuilt/settings/*.scss');

    console.log(`----- Run Task: extract-theme-variables -----`);
    runCommandSync('node build/scripts/extract-theme-variables.js');

    console.log(`----- Run Task: create-component-wings-theme -----`);
    runCommandSync('node build/scripts/create-component-wings-theme.js');

    console.log(`----- Run Task: create-omni-components -----`);
    runCommandSync('node build/scripts/create-omni-components.js');

    const ngVersion = (global as any).ngVersion;
    console.log(`----- Run Task: copy src to src-tmp and generate getter setter in src-tmp -----`);
    processSource();
    updateFormlyImport();
    if (ngVersion != 'ng9') {
        generateGetterSetter(['src-tmp']);
        flattenCodes();
    }

    if (ngVersion == 'ng9') {
        const tsConfigPaths = [
            'src-tmp/jigsaw/tsconfig.lib.prod.json',
            'src-tmp/ngx-formly/jigsaw/tsconfig.lib.prod.json'
        ];
        tsConfigPaths.forEach(tsConfigPath => {
            const tsConfig = JSON.parse(readFileSync(tsConfigPath).toString());
            tsConfig.angularCompilerOptions = {
                "enableIvy": false
            }
            writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 4));
        })
    }

    console.log(`----- Run Task: build:${packageName}-package -----`);
    buildPackage(projectName);

    console.log(`----- Run Task: build:${packageName}-styles -----`);
    buildAllThemeFile(allThemingStyleGlob, join(releasePath, 'prebuilt-themes'));

    if (packageName === 'jigsaw') {
        console.log(`----- Run Task: create jigsaw scoped theme -----`);
        await copyAndBundleScss(packageName, releasePath, jigsawPath, jigsawCommonPath);
        createScopedThemeTask(releasePath);
        removeTmpFiles(releasePath);
    }

    await bundleThemingScss(themingEntryPointPath, allScssGlob, themingBundlePath);
    copyPrebuiltThemeSettings(prebuiltThemeSettingsGlob, join(releasePath, 'prebuilt-themes', 'settings'));
    buildAllThemeFile(allComponentThemingStyleGlob, join(releasePath, 'prebuilt-themes', 'wings-theme'));

    console.log(`----- Run Task: build:${packageName}-copy-files -----`);
    copyMiscFiles(releasePath);

    console.log(`----- Run Task: build:${packageName}-novice-guide -----`);
    await buildNoviceGuide(packageName);

    console.log(`----- Run Task: build:${packageName}-unified-paging -----`);
    await buildUnifiedPaging(packageName);

    console.log(`Build for package ${packageName} completed.`);
}

export async function cleanAndBuild(packageName: string) {
    cleanAll();
    if (packageName === 'formly') {
        await buildFormly();
    } else {
        await build(packageName);
    }
}

export async function publishFormly() {
    whoami();
    await buildFormly();
    await publishPackage('formly');
}

export async function publishJigsaw() {
    whoami();
    const packageName: string = 'jigsaw';
    await cleanAndBuild(packageName);
    validateCheckBundles(packageName);
    await publishPackage(packageName);
}

export async function buildNoviceGuide(packageName: string) {
    await buildCandidatePackage({
        packageName: "novice-guide",
        entryPath: "src/jigsaw/common/novice-guide/exports.ts",
        rollupTo: "window.jigsaw=window.jigsaw||{};window.jigsaw",
        distPath: `${packageMap[packageName].dist}`
    });
}

export async function buildUnifiedPaging(packageName: string) {
    await buildCandidatePackage({
        packageName: "unified-paging",
        entryPath: "src/jigsaw/common/core/data/unified-paging/exports.ts",
        rollupTo: "",
        distPath: `${packageMap[packageName].dist}`
    });
}

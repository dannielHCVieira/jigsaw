import { copySync } from 'fs-extra';
import * as path from 'path';
import { buildConfig } from '../util/build-config';
import {publishPackage, whoami} from './publish';
import {copyDir, removeDirOrFile} from "../util/file";
import {runCommandSync} from "../util/exec";
import {cleanAndBuild} from "./build";

const node = process.platform === "win32" ? "node.exe" : "node";
const jigsawDir = path.join(buildConfig.projectDir, 'node_modules', '@rdkmaster', 'jigsaw');
const outputDir = path.join(buildConfig.outputDir, '@rdkmaster', 'jigsaw');

export async function buildFormly() {
    await cleanAndBuild('jigsaw');
    removeDirOrFile(jigsawDir);
    copyDir(outputDir, jigsawDir);
    runCommandSync(node, ['--max_old_space_size=4096', './node_modules/@angular/cli/bin/ng', 'build', '--configuration production', '@rdkmaster/formly'], { stdio: 'inherit' });
    _copyLicense();
}

function _copyLicense() {
    copySync('./LICENSE', './dist/@rdkmaster/formly/LICENSE');
}

export async function publishFormly() {
    await whoami();
    await buildFormly();
    await publishPackage('formly');
}


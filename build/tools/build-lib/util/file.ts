import {copySync, existsSync, mkdirpSync, removeSync} from 'fs-extra';
import {sync as glob} from 'glob';
import {dirname, join} from 'path';

/** Function to copy files that match a glob to another directory. */
export function copyFiles(fromPath: string, fileGlob: string, outDir: string) {
    glob(fileGlob, {cwd: fromPath}).forEach(filePath => {
        const fileDestPath = join(outDir, filePath);
        mkdirpSync(dirname(fileDestPath));
        copySync(join(fromPath, filePath), fileDestPath);
    });
}

export function copyDir(src: string, dest: string) {
    if (existsSync(src)) {
        mkdirpSync(dest);
        copySync(src, dest);
    }
}

export function removeFiles(fileGlob: string) {
   glob(fileGlob).forEach(file => {
       removeDirOrFile(file);
    });
}

export function removeDirOrFile(dirOrFile: string) {
    if (existsSync(dirOrFile)) {
        removeSync(dirOrFile);
    }
}


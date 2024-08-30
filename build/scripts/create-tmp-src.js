const fs = require('fs');
const path = require('path');

module.exports = processSource;

if (require.main === module) {
    processSource();
}

function processSource() {
    const srcDir = 'src';
    const srcTmpDir = 'src-tmp';
    try {
        copyDirectory(srcDir, srcTmpDir, 10);
        console.log('Copied src to src-tmp successfully');
    } catch (err) {
        console.error(`Failed to copy src to src-tmp: ${err}`);
        process.exit(1);
    }
}

function copyDirectory(src, dest, retry = 1) {
    let error;
    for (let i = 0; i < retry; i++) {
        try {
            if (fs.existsSync(dest)) {
                // 清空 src-tmp 目录
                emptyFolderRecursive(dest);
                console.log('Clear src-tmp directory');
            } else {
                // 创建 src-tmp 目录
                fs.mkdirSync(dest);
                console.log('Created src-tmp directory');
            }
            copySync(src, dest);
            return;
        } catch (e) {
            error = e;
            console.warn(`unable to copy dir from ${src} to ${dest}, detail: ${e.message}`);
        }
        console.log('retrying to copy dir from', src, 'to', dest, '..... retry:', i + 1);
        sleepSync(2000);
    }
    if (error) {
        throw error;
    }

    function sleepSync(ms) {
        const sharedBuffer = new SharedArrayBuffer(4);
        const sharedArray = new Int32Array(sharedBuffer);
        Atomics.wait(sharedArray, 0, 0, ms);
    }
}

function emptyFolderRecursive(path) {
    if (!fs.existsSync(path)) {
        return;
    }
    fs.readdirSync(path).forEach(file => {
        const curPath = path + '/' + file;
        if (fs.lstatSync(curPath).isDirectory()) {
            emptyFolderRecursive(curPath);
        } else {
            fs.unlinkSync(curPath);
        }
    });
}

function copySync(src, dest) {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        const entries = fs.readdirSync(src);
        for (const entry of entries) {
            const srcPath = path.join(src, entry);
            const destPath = path.join(dest, entry);
            copySync(srcPath, destPath);
        }
    } else {
        fs.copyFileSync(src, dest);
    }
}

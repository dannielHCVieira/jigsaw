const {readFileSync, existsSync, mkdirpSync, writeFileSync, statSync} = require("fs-extra");
const {execSync} = require("child_process");
const {readdirSync, unlinkSync, rmdirSync} = require("fs");
const path = require("path");
const glob = require('glob').sync;

export function buildCandidatePackage(config: { packageName: string, entryPath: string, rollupTo: string, distPath: string }) {
    let {packageName, entryPath, rollupTo, distPath} = config;
    rollupTo = rollupTo ? rollupTo + '=' : '';
    const strParam = `\n   packageName = ${packageName}\n     entryPath = ${entryPath}\n      rollupTo = ${rollupTo}`;
    if (!packageName || !entryPath) {
        throw `invalid parameters:${strParam}`;
    }
    console.log(`building ${packageName} with parameter:${strParam}`);

    const home = process.cwd();
    const entryPathGlob = path.join(home, `${entryPath.replace(/\/exports\.ts$/, '')}/**/*.ts`);
    glob(entryPathGlob)
        .map((file: string) => readFileSync(file).toString())
        .forEach(src => src.replace(/import\s*(\*.+?|[\s\S]*?)\s*from\s*['"](.*?)['"]/g, (_1, _2, from) => {
            console.log('checking import from path:', from);
            if (!from.startsWith('./')) {
                throw `Error: it is NOT allowed to import from path "${from}"!! ONLY path starts with "./" is allowed!`;
            }
            return '';
        }));
    const dist = path.join(home, `dist/@rdkmaster/${distPath}/${packageName}`);
    if (existsSync(dist)) {
        removeDir(dist);
    }
    mkdirpSync(dist);

    console.log(`compiling ${packageName} with tsc...`);
    const outDir = rollupTo ? path.join(dist, 'tmp') : dist;
    try {
        const tscPath = path.join(home, `node_modules/.bin/tsc`);
        const entryAbsolutePath = path.join(home, entryPath);
        execSync(`"${tscPath}" --module commonjs --target es6 --declaration --outDir "${outDir}" "${entryAbsolutePath}"`);
    } catch (e) {
        console.error('tsc failed, detail:', e.message);
        console.error(e.stderr.toString());
        console.error(e.stdout.toString());
        throw `Error: tsc failed to build ${packageName}`;
    }
    writeFileSync(`${dist}/package.json`, '{"module": "exports.js","typings": "exports.d.ts"}');

    if (!rollupTo) {
        return;
    }

    const webpack = require('webpack');
    return new Promise<void>(resolve => {
        webpack({
            entry: {[packageName]: `${dist}/tmp/exports.js`},
            optimization: {minimize: true},
            resolve: {extensions: ['.js']},
            output: {path: dist, filename: 'index.js'},
        }, (err, stats) => {
            if (err || stats.hasErrors()) {
                const msg = err ? err.toString() : stats.compilation.errors.join('\n');
                throw 'failed to rollup with webpack' + msg;
            }
            readdirSync(`${dist}/tmp`).filter(f => /.+\.d\.ts$/.test(f)).forEach(file => {
                console.log('copying declaration:', file);
                writeFileSync(`${dist}/${file}`, readFileSync(`${dist}/tmp/${file}`));
            });
            removeDir(`${dist}/tmp`);
            const indexJs = `${dist}/index.js`;
            const src = readFileSync(indexJs).toString()
                .replace(/^!/, '(')
                .replace(/,([^,]+?})(\(\[function\()/, ';return $1)$2');
            writeFileSync(indexJs, rollupTo + src);
            resolve();
        });
    });
}

function removeDir(dir: string) {
    readdirSync(dir).forEach(file => {
        const stat = statSync(`${dir}/${file}`);
        if (stat.isDirectory()) {
            removeDir(`${dir}/${file}`);
        } else {
            unlinkSync(`${dir}/${file}`);
        }
    });
    rmdirSync(dir);
}

const fs = require("fs");

process.chdir(`${__dirname}/../../src/jigsaw`);
const omniPath = 'omni-components';
const pcPath = 'pc-components';
const mobilePath = 'mobile-components';

copyPackageJson(`${pcPath}/package.json`, `${omniPath}/package.json`)
mergeAllTheme(`${omniPath}/theming/all-theme.scss`, `${pcPath}/theming/all-theme.scss`, `${mobilePath}/theming/all-theme.scss`);
processModuleFileContent(`${omniPath}/module.ts`, `${pcPath}/module.ts`, `${mobilePath}/module.ts`);
mergePublicApis('omni_public_api.ts', 'public_api.ts', 'mobile_public_api.ts');

function copyPackageJson(source, destination) {
    try {
        fs.copyFileSync(source, destination);
        console.log(`File copied successfully from ${source} to ${destination}`);
    } catch (err) {
        console.error(`Error copying file from ${source} to ${destination}: ${err}`);
    }
    let packageInfo = JSON.parse(fs.readFileSync(destination).toString());
    packageInfo.peerDependencies = packageInfo.peerDependenciesGovernance;
    delete packageInfo.peerDependenciesGovernance;
    fs.writeFileSync(destination, JSON.stringify(packageInfo, null, '  '));
}

function processScssImport(filePath, replacementPath) {
    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        return [];
    }
    const content = fs.readFileSync(filePath).toString();
    return content.split('\n').map(line => {
        return line.replace(/@import\s+["'](\.\.\/[^"']+)["'];/g, (match, p1) => {
            if (p1.startsWith('../../common')) {
                return match;
            }
            // 去掉起始的“../”后再拼接路径
            const newPath = replacementPath + p1.slice(3);
            return `@import "${newPath}";`;
        });
    });
}

function mergeAllTheme(outputFilePath, pcFilePath, mobileFilePath) {
    const pcContent = processScssImport(pcFilePath, '../../pc-components/');
    const mobileContent = processScssImport(mobileFilePath, '../../mobile-components/');
    const mergedContent = [...pcContent, ...mobileContent].filter((row, idx, arr) => idx === arr.indexOf(row));
    fs.writeFileSync(outputFilePath, mergedContent.join('\n'), 'utf8');
    console.log(`Created ${outputFilePath}`);
}

function processPublicApis(filePath) {
    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        return [];
    }
    const content = fs.readFileSync(filePath).toString();
    return content.split('\n').map(row => {
        // 特殊处理行，替换指定内容
        row = row.trim();
        if (row === 'export * from "./pc-components/module";' || row === 'export * from "./mobile-components/module";') {
            return 'export * from "./omni-components/module";'
        }
        return row;
    }).filter(row => row.startsWith('export'));
}

function mergePublicApis(outputFilePath, pcFilePath, mobileFilePath) {
    const pcContent = processPublicApis(pcFilePath);
    const mobileContent = processPublicApis(mobileFilePath);
    const mergedContent = [...pcContent, ...mobileContent].filter((row, idx, arr) => idx === arr.indexOf(row));
    fs.writeFileSync(outputFilePath, mergedContent.join('\n'), 'utf8');
    console.log(`Created ${outputFilePath}`);
}

function processModuleImport(filePath, replacementPath) {
    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        return [];
    }
    const content = fs.readFileSync(filePath).toString();
    return content.split('\n').map(line => {
        return line.replace(/from\s+["'](\.\.\/common\/[^"']+)["'];/g, (match, p1) => `from "${p1}";`)
            // 去掉起始的"./"后再拼接路径
            .replace(/from\s+["'](\.\/[^"']+)["'];/g, (match, p1) => `from "${replacementPath + p1.slice(2)}";`);
    });
}

function processModuleFileContent(outputFilePath, pcFilePath, mobileFilePath) {
    const pcContent = processModuleImport(pcFilePath, '../pc-components/');
    const mobileContent = processModuleImport(mobileFilePath, '../mobile-components/');
    const jigsawModules = [];
    const mergedContent = [...pcContent, ...mobileContent].filter((row, idx, arr) => {
        row = row.trim();
        if (!row.startsWith('import') || idx !== arr.indexOf(row)) {
            return false;
        }
        const match = row.match(/\{(.+?)}/);
        if (match) {
            // 提取出引入的模块，并去掉NgModule
            const modules = match[1].split(',').map(module => module.trim()).filter(module => module !== 'NgModule');
            jigsawModules.push(...modules);
        }
        return true;
    });

    fs.writeFileSync(outputFilePath, mergedContent.join('\n') + `\nconst JIGSAW_MODULE = [${jigsawModules.join(', ')}];\n\n` +
        `@NgModule({exports: JIGSAW_MODULE})\nexport class JigsawModule {}`, 'utf8');
    console.log(`Created ${outputFilePath}`);
}

console.log('All files have been generated successfully.');


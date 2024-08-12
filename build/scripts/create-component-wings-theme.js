const fs = require("fs");
const glob = require('glob').sync;
const sass = require('sass');
const CleanCSS = require('clean-css');
const {join, basename, resolve} = require('path');

console.log('开始创建 wings theme ...');

process.chdir(`${__dirname}/../../src/jigsaw/`);

const tsFiles = [
    ...glob('**/*.ts', {cwd: `pc-components`}).map(f => `pc-components/${f}`),
    ...glob('**/*.ts', {cwd: `common`}).map(f => `common/${f}`),
];
const invalidComponents = [];
const ignoredComponents = [
    'JigsawBox', 'JigsawBreadcrumbItem', 'JigsawTileOption', 'JigsawRadioOption', 'JigsawRoot', 'JigsawEditableBox',
    'JigsawTabPane', 'JigsawViewport', 'JigsawBlock', 'JigsawScrollbar', 'JigsawUploadFileInfoListFallback',
    'JigsawCollapsePane', 'JigsawPieChartIcon', 'JigsawDonutChartIcon', 'JigsawLineChartIcon', 'JigsawBarChartIcon', 'JigsawAutoDisplay',
    'JigsawSystemPrompt'
];
let wingsThemeIds = [];
tsFiles.forEach(file => {
    let src = fs.readFileSync(file).toString();
    while (true) {
        const match = src.match(/@Component\s*\(\s*{([\s\S]*?)}\)/);
        if (!match) {
            break;
        }
        const componentMeta = match[1];
        let comment, wingsThemeId, className;

        // 往前找
        let heading = src.slice(0, match.index);
        let match1 = heading.match(/([\s\S]*)@WingsTheme\s*\((.*?)\)\s*$/);
        if (match1) {
            heading = match1[1];
            wingsThemeId = match1[2];
        }
        match1 = heading.match(/[\s\S]*\/\*([\s\S]*?)\*\/\s*$/);
        if (match1) {
            comment = match1[1];
        }

        // 往后找
        src = src.slice(match.index + match[0].length);
        match1 = src.match(/^\s*@WingsTheme\s*\((.*?)\)/);
        if (match1) {
            src = src.slice(match1[0].length);
            // 被注释掉的不要
            const id = match1[2];
            if (wingsThemeId && id) {
                console.error('一个组件不允许有两个 @WingsTheme 渲染器！');
                console.error(`wingsThemeId=${wingsThemeId}, file=${file}`);
                process.exit(1);
            }
            wingsThemeId = wingsThemeId || id;
        }
        match1 = src.match(/^\s*export\s+class\s+(\w+)/);
        if (!match1) {
            console.error('组件定义格式非法：@Component内部的值包含了“)}”！');
            console.error(`file=${file}`);
            process.exit(1);
        }
        className = match1[1];

        if (comment && comment.indexOf('@internal') !== -1) {
            if (wingsThemeId) {
                console.error('有@internal标记的组件不应该有 @WingsTheme 渲染器！');
                console.error(`wingsThemeId=${wingsThemeId}, file=${file}`);
                process.exit(1);
            }
            continue;
        }
        if (!componentMeta || !componentMeta.match(/\bselector\s*:/)) {
            if (wingsThemeId) {
                console.error('没有selector的组件不应该有 @WingsTheme 渲染器！');
                console.error(`wingsThemeId=${wingsThemeId}, file=${file}`);
                process.exit(1);
            }
            continue;
        }
        if (!wingsThemeId) {
            if (ignoredComponents.indexOf(className) === -1) {
                invalidComponents.push(className);
            }
            continue;
        }
        wingsThemeId = 'jigsaw-' + wingsThemeId.replace(/['"]/g, '')
            .replace(/\.\w+$/, '');
        wingsThemeIds.push(wingsThemeId);
    }
});
if (invalidComponents.length) {
    console.error('下面这些组件没有使用 @WingsTheme 装饰器指明 wings theme id，请添加！');
    console.error('提示：如果确实不需要的，请将组件的类名加入到此脚本的ignoredComponents中去。');
    console.error(invalidComponents.join(', '));
}
if (invalidComponents.length > 0) {
    process.exit(1);
}

console.log(`一共找到 ${wingsThemeIds.length} 处@WingsTheme渲染。`)
wingsThemeIds = wingsThemeIds.filter((id, idx, arr) => idx === arr.indexOf(id));
console.log(`实际需要处理 ${wingsThemeIds.length} 个组件的样式文件。`)
const wingsThemeOutput = 'common/core/theming/prebuilt/wings-theme';
if (fs.existsSync(wingsThemeOutput)) {
    glob('**/*.scss', {cwd: wingsThemeOutput})
        .forEach(file => fs.unlinkSync(`${wingsThemeOutput}/${file}`));
} else {
    fs.mkdirSync(wingsThemeOutput);
}

const styleFiles = styleFilesParser();

const commonImport = `
        @import "../settings/paletx-pro-base.scss";
        @import "../settings/paletx-pro-$THEME.scss";
    `;
const unrefScss = [];
styleFiles.forEach(filePath => {
    const fileName = filePath.split("/").pop();
    const wingsThemeId = `jigsaw-${fileName}`;
    const idx = wingsThemeIds.indexOf(wingsThemeId);
    if (idx === -1) {
        unrefScss.push(`\t${fileName}.scss`);
        return;
    }

    wingsThemeIds.splice(idx, 1);
    let fileContent = fs.readFileSync(`pc-components/theming/${filePath}.scss`).toString();
    // 如果fileContent存在import，则读取import的文件内容并替换 @import 语句
    const importMatch = fileContent.match(/@import\s+"(.*?)"/);
    if (importMatch) {
        const importFile = importMatch[1];
        const importContent = fs.readFileSync(`pc-components/theming/${importFile}.scss`).toString();
        fileContent = fileContent.replace(/@import\s+"(.*?)"/, importContent);
    }

    const scssCode = commonImport + fileContent.replace(/(^\..+)-host\s*{/mg, "$1-host[data-theme='$THEME'] {");
    fs.writeFileSync(`common/core/theming/prebuilt/wings-theme/${wingsThemeId}-dark.scss`,
        scssCode.replace(/\$THEME/g, 'dark'));
    fs.writeFileSync(`common/core/theming/prebuilt/wings-theme/${wingsThemeId}-light.scss`,
        scssCode.replace(/\$THEME/g, 'light'));
});
console.warn('警告：未被@WingsTheme引用的样式文件：\n', unrefScss.join('\n'));

if (wingsThemeIds.length) {
    console.error('有@WingsTheme渲染器，但是all-theme.scss里没有引用的：\n', wingsThemeIds);
    process.exit(1);
}

console.log('编译wings-theme scss文件：src/jigsaw/common/core/theming/prebuilt/wings-theme/*.scss')
compileScssFile(`${__dirname}/../../src/jigsaw/common/core/theming/prebuilt/wings-theme`);
console.log('编译皮肤scss文件：src/jigsaw/common/core/theming/themes/*.scss')
compileScssFile(`${__dirname}/../../src/jigsaw/common/core/theming/themes`);

console.log('所有组件的 wings theme id 校验通过，wings theme 创建完毕！');

function styleFilesParser () {
    const styleFiles = [];
    fs.readFileSync(`${__dirname}/../../src/jigsaw/pc-components/theming/all-theme.scss`).toString()
        .replace(/@import\s+"(.*?)"/g, (_, file) => {
            if (file.startsWith('../../common/assets/scss/') || file.startsWith('../fallback/')) {
                return;
            }
            styleFiles.push(file);
        });
    return styleFiles;
}

function compileScssFile(path) {
    glob(`${path}/*.scss`).forEach(file => {
        const result = sass.renderSync({file, includePaths: [resolve(__dirname, '../../src')]});
        const output = new CleanCSS().minify(result.css.toString()).styles;
        const outputPath = join(path, basename(file).replace('.scss', '.css'));
        fs.writeFileSync(outputPath, output);
    })
}

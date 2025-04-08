const fs = require('fs');
const path = require('path');

const importPathMap = [
    {from: "../../form-field", updatedFrom: "@rdkmaster/formly/form-field"},
    {from: "../../button-bar", updatedFrom: "@rdkmaster/formly/button-bar"},
    {from: "../../input", updatedFrom: "@rdkmaster/formly/input"},
    {from: "../../checkbox", updatedFrom: "@rdkmaster/formly/checkbox"},
    {from: "../../radio", updatedFrom: "@rdkmaster/formly/radio"},
    {from: "../../switch", updatedFrom: "@rdkmaster/formly/switch"},
    {from: "../../textarea", updatedFrom: "@rdkmaster/formly/textarea"},
    {from: "../../select", updatedFrom: "@rdkmaster/formly/select"},
    {from: "../../list-lite", updatedFrom: "@rdkmaster/formly/list-lite"},
    {from: "../../tile-lite", updatedFrom: "@rdkmaster/formly/tile-lite"},
    {from: "../../slider", updatedFrom: "@rdkmaster/formly/slider"},
    {from: "../../cascade", updatedFrom: "@rdkmaster/formly/cascade"},
    {from: "../../time", updatedFrom: "@rdkmaster/formly/time"},
    {from: "../../button", updatedFrom: "@rdkmaster/formly/button"},
    {from: "../../icon", updatedFrom: "@rdkmaster/formly/icon"},
    {from: "../../table", updatedFrom: "@rdkmaster/formly/table"},
    {from: "../../template", updatedFrom: "@rdkmaster/formly/template"},
    {from: "../../header", updatedFrom: "@rdkmaster/formly/header"},
    {from: "../../upload", updatedFrom: "@rdkmaster/formly/upload"},
    {from: "../../repeat", updatedFrom: "@rdkmaster/formly/repeat"},
    {from: "../../tree", updatedFrom: "@rdkmaster/formly/tree"}
];

const directoryPath = 'src-tmp/ngx-formly';

module.exports = updateFormlyImport;

if (require.main === module) {
    updateFormlyImport();
}

function updateFormlyImport() {
    console.log("----- update formly import start -----");
    const startTime = new Date().getTime();
    processDirectory(directoryPath);
    console.log("----- update formly import done ----- 耗时：", new Date().getTime() - startTime, "ms");
}

function processDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            // 递归处理子目录
            processDirectory(fullPath);
        } else if (path.extname(file) === '.ts') {
            // 处理 .ts 文件
            const data = fs.readFileSync(fullPath, 'utf8');

            let updatedData = data;
            importPathMap.forEach(({from, updatedFrom}) => {
                const regex = new RegExp(from, 'g');
                updatedData = updatedData.replace(regex, updatedFrom);
            });

            fs.writeFileSync(fullPath, updatedData, 'utf8');
        }
    });
}
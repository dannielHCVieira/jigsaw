const ts = require('typescript');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

module.exports = flattenCodes;

if (require.main === module) {
    flattenCodes();
}

function flattenCodes() {
    flattenJigsawArray();
}

// 升级到typescript5之后，这个JigsawArray中，有部分函数的签名变了，需要做一些修改
function flattenJigsawArray() {
    const filePath = 'src-tmp/jigsaw/common/core/utils/data-collection-utils.ts';
    const searchRegex = /\/\*\*\s+\* @internal\s+\*\/\s+\[Symbol\.unscopables\][^{]*{[\s\S]*?return iterator\.apply\(this\);\s*}/;

    const replacement = `
    /**
     * 参考这里 https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/flat
     */
    public flat<A, D extends number = 1>(depth?: D): any[] {
        return this._agent.flat.apply(this, arguments);
    }

    /**
     * 参考这里 https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap
     */
    public flatMap<U, This = undefined>(callback: (this: This, value: T, index: number, array: T[]) => U | ReadonlyArray<U>, thisArg?: This): U[] {
        return this._agent.flatMap.apply(this, arguments);
    }

    /**
     * 参考这里 https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/at
     */
    public at(index: number): T | undefined {
        return this._agent.at.apply(this, arguments);
    }

    /**
     * @internal
     */
    get [Symbol.unscopables](): { [K in keyof any[]]?: boolean } {
        return this._agent[Symbol.unscopables];
    }
    `;

    try {
        console.log("----- flatten JigsawArray definition -----");
        let content = fs.readFileSync(filePath, 'utf8');
        content = content.replace(searchRegex, replacement);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log("----- flatten JigsawArray definition Done -----");
    } catch (error) {
        console.error('----- flatten JigsawArray error: ', error);
    }
}
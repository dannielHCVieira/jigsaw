const ts = require('typescript');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

module.exports = generateGetterSetter;

if (require.main === module) {
    const targetPaths = process.argv.slice(2);
    generateGetterSetter(targetPaths);
}

function generateGetterSetter(targetPaths) {
    targetPaths.forEach(targetPath => {
        if (isDirectorySync(targetPath)) {
            translateDirectory(targetPath);
        } else if (isFileSync(targetPath)) {
            translateFile(targetPath);
        }
    })
}

function isDirectorySync(filePath) {
    try {
        const stats = fs.statSync(filePath);
        return stats.isDirectory();
    } catch (err) {
        console.error(err);
        return false;
    }
}

function isFileSync(filePath) {
    try {
        const stats = fs.statSync(filePath);
        return stats.isFile();
    } catch (err) {
        console.error(err);
        return false;
    }
}

function getAllFiles(dir, ext) {
    return glob.sync(path.join(dir, `**/*.${ext}`));
}

function refactorTransform(sourceFile) {
    return (context) => {
        let className;
        return (rootNode) => {
            function visit(node) {
                if (ts.isClassDeclaration(node) && node.name) {
                    const comments = getLeadingComments(node, sourceFile);
                    const hasExcludeComment = comments.some(comment => comment.includes('@getterSetterExclude'));
                    if (hasExcludeComment) {
                        return node; // 不继续遍历该类
                    }
                    className = node.name.escapedText;
                }
                if (ts.isPropertyDeclaration(node)) {
                    const isPrivate = node.modifiers && node.modifiers.some(modifier => modifier.kind === ts.SyntaxKind.PrivateKeyword);
                    const hasOutputDecorator = node.decorators && node.decorators.some(decorator => {
                        const expression = decorator.expression;
                        return ts.isCallExpression(expression) && expression.expression.escapedText === 'Output';
                    });
                    const hasQuestionToken = !!node.questionToken;
                    const isStatic = node.modifiers && node.modifiers.some(modifier => modifier.kind === ts.SyntaxKind.StaticKeyword);
                    const isReadonly = node.modifiers && node.modifiers.some(modifier => modifier.kind === ts.SyntaxKind.ReadonlyKeyword);
                    const propertyName = node.name.escapedText;
                    const startsWithUnderscore = propertyName.startsWith('_$');
                    if (isPrivate || startsWithUnderscore || hasQuestionToken || isReadonly || isStatic) {
                        return node;
                    }

                    return createGetterSetter(node, className);
                }
                return ts.visitEachChild(node, visit, context);
            }

            return ts.visitNode(rootNode, visit);
        };
    }
}

function getLeadingComments(node, sourceFile) {
    const leadingComments = [];
    const commentRanges = ts.getLeadingCommentRanges(sourceFile.getFullText(), node.getFullStart()) || [];

    for (const range of commentRanges) {
        const comment = sourceFile.getFullText().substring(range.pos, range.end);
        leadingComments.push(comment.trim());
    }

    return leadingComments;
}

function createGetterSetter(propertyNode, className) {
    const propertyName = propertyNode.name.escapedText;
    const propertyType = propertyNode.type || ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
    const privateName = `_autoGetterSetter_${className}_${propertyName}`;
    const initializer = propertyNode.initializer || undefined;

    const modifiers = propertyNode.modifiers || [];

    return [
        ts.factory.createPropertyDeclaration(
            [ts.factory.createToken(ts.SyntaxKind.PrivateKeyword)],
            ts.factory.createIdentifier(privateName),
            ts.factory.createToken(ts.SyntaxKind.QuestionToken),
            propertyType,
            initializer
        ),
        ts.factory.createGetAccessorDeclaration(
            modifiers,
            ts.factory.createIdentifier(propertyName),
            [],
            propertyType,
            ts.factory.createBlock(
                [ts.factory.createReturnStatement(ts.factory.createPropertyAccessExpression(
                    ts.factory.createThis(),
                    ts.factory.createIdentifier(privateName)
                ))],
                true
            )
        ),
        ts.factory.createSetAccessorDeclaration(
            modifiers.filter(modifier => modifier.kind !== ts.SyntaxKind.Decorator),
            ts.factory.createIdentifier(propertyName),
            [ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                ts.factory.createIdentifier("value"),
                undefined,
                propertyType,
                undefined
            )],
            ts.factory.createBlock(
                [ts.factory.createExpressionStatement(ts.factory.createBinaryExpression(
                    ts.factory.createPropertyAccessExpression(
                        ts.factory.createThis(),
                        ts.factory.createIdentifier(privateName)
                    ),
                    ts.factory.createToken(ts.SyntaxKind.EqualsToken),
                    ts.factory.createIdentifier("value")
                ))],
                true
            )
        )
    ]
}

function translateDirectory(directory) {
    const files = getAllFiles(directory, 'ts');
    for (const file of files) {
        translateFile(file);
    }
}

function translateFile(file) {
    const sourceFile = ts.createSourceFile(
        file,
        fs.readFileSync(file).toString(),
        ts.ScriptTarget.ES2015,
        false,
        ts.ScriptKind.TS
    );

    const result = ts.transform(sourceFile, [refactorTransform(sourceFile)]);
    const transformedSourceFile = result.transformed[0];

    const printer = ts.createPrinter({
        newLine: ts.NewLineKind.LineFeed,
        removeComments: false
    });

    const newContent = printer.printFile(transformedSourceFile);

    fs.writeFileSync(file, newContent, 'utf8');
}


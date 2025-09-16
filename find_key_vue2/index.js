#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const { parseComponent, compile } = require('vue-template-compiler');


// 递归遍历 Vue AST
function traverseVueAst(node, cb) {
    if (!node) return

    // 表达式 (插值 or 绑定)
    if (node.expression) {
        cb(node.expression)
    }
    if (node.attrsMap) {
        Object.values(node.attrsMap).forEach(val => cb(val))
    }

    if (node.children) {
        node.children.forEach(child => traverseVueAst(child, cb))
    }
}

// 3. Babel 解析表达式 AST，提取 $t 的参数
function extractTKeys(content) {
    try {
        // const ast = babelParser.parseExpression(expr)

        const ast = parse(content, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript']
        });
        const keys = []

        traverse(ast, {
            CallExpression(path) {
                if (
                    (path.node.callee.type === 'MemberExpression' &&
                        path.node.callee.property.name === '$t') ||
                    (path.node.callee.type === 'Identifier' &&
                        path.node.callee.name === '$t')
                ) {
                    const arg = path.node.arguments[0]
                    if (arg && arg.type === 'StringLiteral') {
                        keys.push(arg.value)
                    }
                }
            }
        })

        return keys
    } catch (e) {
        return []
    }
}

function scanTemplate(templateContent) {
    const res = compile(templateContent)

    const allKeys = []
    traverseVueAst(res.ast, expr => {
        // console.log(expr, filePath);
        const keys = extractTKeys(expr)
        if (keys.length) {
            allKeys.push(...keys)
            // for (const key of keys) {
            //     // console.log(key, filePath);
            //     this.addKeyUsage(key, filePath, routePrefix);
            // }
        }
    })

    return allKeys
}


function findI18nCalls(content) {

    const ast = parse(content, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript']
    });

    const keys = []
    traverse(ast, {
        CallExpression(path) {
            if (
                (path.node.callee.type === 'MemberExpression' &&
                    path.node.callee.property.name === '$t') ||
                (path.node.callee.type === 'Identifier' &&
                    path.node.callee.name === '$t')
            ) {
                const arg = path.node.arguments[0]
                if (arg && arg.type === 'StringLiteral') {
                    keys.push(arg.value)
                    // self.addKeyUsage(arg.value, filePath, routePrefix);
                }
            }
        }
    })
    return keys

    // traverse(ast, {
    //     CallExpression(path) {
    //         const { callee, arguments: args } = path.node;

    //         if (callee.type === 'MemberExpression' && 
    //             callee.object.name === '$t' && 
    //             args.length > 0 && 
    //             args[0].type === 'StringLiteral') {

    //             console.log(args[0].value, filePath);

    //             const key = args[0].value;
    //             self.addKeyUsage(key, filePath, routePrefix);
    //         }
    //     }
    // });
}

class I18nKeyFinder {
    constructor(i18nFilePath, outputFilePath) {
        this.i18nFilePath = i18nFilePath;
        this.outputFilePath = outputFilePath;
        this.i18nKeys = new Set();
        this.keyUsageMap = new Map(); // key -> { pages: Set, routes: Set }
        this.projectRoot = this.findProjectRoot();
    }

    findProjectRoot() {
        let currentDir = process.cwd();
        while (currentDir !== path.dirname(currentDir)) {
            if (fs.existsSync(path.join(currentDir, 'nuxt.config.js')) ||
                fs.existsSync(path.join(currentDir, 'nuxt.config.ts')) ||
                fs.existsSync(path.join(currentDir, 'package.json'))) {
                return currentDir;
            }
            currentDir = path.dirname(currentDir);
        }
        return process.cwd();
    }

    loadI18nFile() {
        try {
            const content = fs.readFileSync(this.i18nFilePath, 'utf-8');
            const data = JSON.parse(content);
            this.extractKeys(data);
            console.log(`✅ 成功加载 i18n 文件: ${this.i18nFilePath}`);
            console.log(`📊 发现 ${this.i18nKeys.size} 个 i18n key`);
        } catch (error) {
            console.error(`❌ 加载 i18n 文件失败: ${error.message}`);
            process.exit(1);
        }
    }

    extractKeys(obj, prefix = '') {
        for (const [key, value] of Object.entries(obj)) {
            const currentKey = prefix ? `${prefix}.${key}` : key;
            this.i18nKeys.add(currentKey);

            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                this.extractKeys(value, currentKey);
            }
        }
    }

    scanPagesDirectory() {
        const pagesDir = path.join(this.projectRoot, 'client/pages');
        if (!fs.existsSync(pagesDir)) {
            console.log(`⚠️  pages 目录不存在: ${pagesDir}`);
            return;
        }

        console.log(`🔍 开始扫描页面目录: ${pagesDir}`);
        this.scanDirectory(pagesDir, '');
    }

    scanDirectory(dir, routePrefix) {
        const items = fs.readdirSync(dir);

        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                // 递归扫描子目录
                const newPrefix = routePrefix ? `${routePrefix}/${item}` : item;
                this.scanDirectory(fullPath, newPrefix);
            } else if (this.isPageFile(item)) {
                // 扫描页面文件
                this.scanPageFile(fullPath, routePrefix);
            }
        }
    }

    isPageFile(filename) {
        return filename.endsWith('.vue') || filename.endsWith('.js') || filename.endsWith('.ts');
    }

    scanPageFile(filePath, routePrefix) {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const filename = path.basename(filePath);

            if (filename.endsWith('.vue')) {
                this.scanVueFile(content, filePath, routePrefix);
            } else {
                this.scanJsFile(content, filePath, routePrefix);
            }
        } catch (error) {
            console.error(`⚠️ 扫描文件失败 ${filePath}: ${error.message}`);
        }
    }

    scanVueFile(content, filePath, routePrefix) {
        try {
            const result = parseComponent(content);

            // 扫描 template
            if (result.template) {
                const keys = scanTemplate(result.template.content);
                for (const key of keys) {
                    this.addKeyUsage(key, filePath, routePrefix);
                }
            }

            // 扫描 script
            if (result.script) {
                this.scanScript(result.script.content, filePath, routePrefix);
            }

            // 如果解析成功但没有找到内容，也使用正则表达式作为补充
            if (!result.template) {
                console.log(`📝 Vue 解析成功但未找到模板，使用正则表达式补充扫描`);
                this.scanVueFileWithRegex(content, filePath, routePrefix);
            }
        } catch (error) {
            console.error(`⚠️ 解析 Vue 文件失败 ${filePath}: ${error.message}`);
            // 如果解析失败，尝试使用正则表达式扫描整个文件
            this.scanVueFileWithRegex(content, filePath, routePrefix);
        }
    }

    scanVueFileWithRegex(content, filePath, routePrefix) {
        console.log(`🔍 使用正则表达式扫描 Vue 文件: ${path.basename(filePath)}`);

        // 使用正则表达式查找模板中的 i18n 调用
        const i18nPatterns = [
            /\{\{\s*\$t\(['"`]([^'"`]+)['"`]\)\s*\}\}/g,
            /\{\{\s*\$tc\(['"`]([^'"`]+)['"`]\)\s*\}\}/g,
            /\{\{\s*\$te\(['"`]([^'"`]+)['"`]\)\s*\}\}/g,
            /\{\{\s*\$d\(['"`]([^'"`]+)['"`]\)\s*\}\}/g
        ];

        let totalMatches = 0;
        i18nPatterns.forEach((pattern, index) => {
            let match;
            let matchCount = 0;
            while ((match = pattern.exec(content)) !== null) {
                const key = match[1];
                this.addKeyUsage(key, filePath, routePrefix);
                matchCount++;
                totalMatches++;
            }
            if (matchCount > 0) {
                console.log(`   Pattern ${index + 1} 找到 ${matchCount} 个匹配`);
            }
        });

        console.log(`   📊 模板中总共找到 ${totalMatches} 个 i18n 调用`);

        // 扫描 script 部分
        const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/);
        if (scriptMatch) {
            const scriptContent = scriptMatch[1];
            console.log(`   📜 找到 script 标签，开始扫描...`);
            this.scanScriptWithRegex(scriptContent, filePath, routePrefix);
        } else {
            console.log(`   📜 未找到 script 标签`);
        }
    }

    scanJsFile(content, filePath, routePrefix) {
        try {

            const keys = findI18nCalls(content);
            for (const key of keys) {
                this.addKeyUsage(key, filePath, routePrefix);
            }
        } catch (error) {
            console.error(`⚠️ 解析 JS/TS 文件失败 ${filePath}: ${error.message}`);
        }
    }




    scanScript(scriptContent, filePath, routePrefix) {
        try {

            const keys = findI18nCalls(scriptContent);
            for (const key of keys) {
                this.addKeyUsage(key, filePath, routePrefix);
            }
        } catch (error) {
            // 如果解析失败，尝试使用正则表达式
            this.scanScriptWithRegex(scriptContent, filePath, routePrefix);
        }
    }

    scanScriptWithRegex(scriptContent, filePath, routePrefix) {
        const i18nPatterns = [
            /\$t\(['"`]([^'"`]+)['"`]\)/g,
            /\$tc\(['"`]([^'"`]+)['"`]\)/g,
            /\$te\(['"`]([^'"`]+)['"`]\)/g,
            /\$d\(['"`]([^'"`]+)['"`]\)/g
        ];

        i18nPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(scriptContent)) !== null) {
                const key = match[1];
                this.addKeyUsage(key, filePath, routePrefix);
            }
        });
    }


    addKeyUsage(key, filePath, routePrefix) {
        if (!this.i18nKeys.has(key)) {
            return; // 只关注 i18n 文件中存在的 key
        }

        if (!this.keyUsageMap.has(key)) {
            this.keyUsageMap.set(key, { pages: new Set(), routes: new Set() });
        }

        const usage = this.keyUsageMap.get(key);
        usage.pages.add(filePath);

        // 生成路由路径
        const route = this.generateRoute(filePath, routePrefix);
        if (route) {
            usage.routes.add(route);
        }
    }

    generateRoute(filePath, routePrefix) {
        const relativePath = path.relative(path.join(this.projectRoot, 'pages'), filePath);
        const route = relativePath
            .replace(/\.(vue|js|ts)$/, '')
            .replace(/\/index$/, '')
            .replace(/\/_/, '/:') // 动态路由参数
            .replace(/\\/g, '/'); // Windows 路径分隔符转换

        return route.startsWith('/') ? route : `/${route}`;
    }

    generateReport() {
        console.log('\n' + '='.repeat(80));
        console.log('📋 i18n Key 与页面路由关系报告');
        console.log('='.repeat(80));

        const sortedKeys = Array.from(this.keyUsageMap.keys()).sort();

        if (sortedKeys.length === 0) {
            console.log('❌ 未找到任何 i18n key 的使用情况');
            return;
        }

        console.log(`\n📊 统计信息:`);
        console.log(`   - 总 key 数量: ${this.i18nKeys.size}`);
        console.log(`   - 被使用的 key 数量: ${sortedKeys.length}`);
        console.log(`   - 未使用的 key 数量: ${this.i18nKeys.size - sortedKeys.length}`);

        console.log('\n🔍 详细使用情况:');
        console.log('-'.repeat(80));

        // sortedKeys.forEach(key => {
        // const usage = this.keyUsageMap.get(key);
        // const routes = Array.from(usage.routes).sort();
        // const pages = Array.from(usage.pages).map(p => path.relative(this.projectRoot, p));

        // console.log(`\n🔑 Key: ${key}`);
        // console.log(`   📍 路由: ${routes.join(', ') || '无'}`);
        // console.log(`   📄 文件: ${pages.join(', ')}`);
        // });

        // 显示未使用的 key
        // const unusedKeys = Array.from(this.i18nKeys).filter(key => !this.keyUsageMap.has(key));
        // if (unusedKeys.length > 0) {
        //     console.log('\n⚠️ 未使用的 i18n keys:');
        //     console.log('-'.repeat(80));
        //     unusedKeys.forEach(key => {
        //         console.log(`   ${key}`);
        //     });
        // }

        // 如果指定了输出文件，生成 JSON 文件
        if (this.outputFilePath) {
            this.generateJsonOutput();
        }
    }

    generateJsonOutput() {
        try {
            const sortedKeys = Array.from(this.keyUsageMap.keys()).sort();
            const unusedKeys = Array.from(this.i18nKeys).filter(key => !this.keyUsageMap.has(key)).sort();

            const jsonResult = {
                metadata: {
                    // projectRoot: this.projectRoot,
                    i18nFile: this.i18nFilePath,
                    generatedAt: new Date().toISOString(),
                    totalKeys: this.i18nKeys.size,
                    usedKeys: sortedKeys.length,
                    unusedKeys: unusedKeys.length
                },
                statistics: {
                    totalKeys: this.i18nKeys.size,
                    usedKeys: sortedKeys.length,
                    unusedKeys: unusedKeys.length,
                    usageRate: ((sortedKeys.length / this.i18nKeys.size) * 100).toFixed(2) + '%'
                },
                keyUsage: sortedKeys.map(key => {
                    const usage = this.keyUsageMap.get(key);
                    const routes = Array.from(usage.routes).sort();
                    // const pages = Array.from(usage.pages).map(p => path.relative(this.projectRoot, p));

                    return {
                        key: key,
                        routes: routes?.map(item => {
                            return item.split(':lang')?.[1] || ''
                        }),
                        // pages: pages,
                        // routeCount: routes.length,
                        // pageCount: pages.length
                    };
                }),
                // unusedKeys: unusedKeys,
                summary: {
                    keysWithMultipleRoutes: sortedKeys.filter(key => {
                        const usage = this.keyUsageMap.get(key);
                        return usage.routes.size > 1;
                    }).length,
                    keysWithMultiplePages: sortedKeys.filter(key => {
                        const usage = this.keyUsageMap.get(key);
                        return usage.pages.size > 1;
                    }).length
                }
            };

            // 写入 JSON 文件
            fs.writeFileSync(this.outputFilePath, JSON.stringify(jsonResult, null, 2), 'utf-8');
            console.log(`\n💾 JSON 结果已保存到: ${this.outputFilePath}`);

        } catch (error) {
            console.error(`❌ 生成 JSON 文件失败: ${error.message}`);
        }
    }

    run() {
        console.log('🚀 开始分析 Nuxt2 + Vue i18n 项目...');
        console.log(`📁 项目根目录: ${this.projectRoot}`);
        console.log(`🌐 i18n 文件: ${this.i18nFilePath}`);

        this.loadI18nFile();
        this.scanPagesDirectory();
        this.generateReport();
    }
}

// 命令行参数处理
function parseArguments() {
    const args = process.argv.slice(2);
    let i18nFilePath = null;
    let outputFilePath = null;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '-f' && i + 1 < args.length) {
            i18nFilePath = args[i + 1];
        } else if (args[i] === '-o' && i + 1 < args.length) {
            outputFilePath = args[i + 1];
        }
    }

    if (!i18nFilePath) {
        console.error('❌ 使用方法: find_key_vue2 -f <i18n文件路径> [-o <输出文件路径>]');
        console.error('   示例: find_key_vue2 -f src/locales/en.json');
        console.error('   示例: find_key_vue2 -f src/locales/en.json -o result.json');
        process.exit(1);
    }

    return { i18nFilePath, outputFilePath };
}

// 主函数
function main() {
    try {
        const { i18nFilePath, outputFilePath } = parseArguments();
        const finder = new I18nKeyFinder(i18nFilePath, outputFilePath);
        finder.run();
    } catch (error) {
        console.error('❌ 程序执行失败:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}


module.exports = I18nKeyFinder;

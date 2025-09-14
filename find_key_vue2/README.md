# find_key_vue2

一个命令行工具，用于在 Nuxt2 + Vue i18n 项目中查找 i18n 的 key 与页面路由的关系。

## 功能特性

- 🔍 自动扫描项目中的页面文件（.vue, .js, .ts）
- 🌐 解析 i18n 文件，提取所有可用的 key
- 📍 识别 i18n key 在哪些页面中被使用
- 🛣️ 生成 key 与 Nuxt 路由的映射关系
- 📊 提供详细的统计报告
- ⚠️ 标记未使用的 i18n key
- 💾 支持 JSON 格式输出，便于程序化处理

## 安装

## 方法一：全局安装（推荐）

```bash
# 克隆项目
git clone <repository-url>
cd find_key_vue2

# 安装依赖
npm install

# 全局安装
npm install -g .
```

安装完成后，你可以在任何地方使用 `find_key_vue2` 命令。

## 方法二：本地使用

```bash
# 克隆项目
git clone <repository-url>
cd find_key_vue2

# 安装依赖
npm install

# 直接运行
node index.js -f <i18n文件路径>
```

## 使用方法

### 基本用法

```bash
# 在项目根目录下运行
find_key_vue2 -f <i18n文件路径>

# 示例
find_key_vue2 -f src/locales/en.json
find_key_vue2 -f locales/zh-cn.json
find_key_vue2 -f src/locales/en.json -o result.json
find_key_vue2 -f locales/zh-cn.json -o zh-cn-analysis.json
```

### 参数说明

- `-f`: 指定 i18n 英文文件路径（必需）
- `-o`: 指定 JSON 输出文件路径（可选）

## 输出示例

```
🚀 开始分析 Nuxt2 + Vue i18n 项目...
📁 项目根目录: /path/to/your/project
🌐 i18n 文件: src/locales/en.json
✅ 成功加载 i18n 文件: src/locales/en.json
📊 发现 156 个 i18n key
🔍 开始扫描页面目录: /path/to/your/project/pages

================================================================================
📋 i18n Key 与页面路由关系报告
================================================================================

📊 统计信息:
   - 总 key 数量: 156
   - 被使用的 key 数量: 89
   - 未使用的 key 数量: 67

🔍 详细使用情况:
--------------------------------------------------------------------------------

🔑 Key: common.button.submit
   📍 路由: /login, /register
   📄 文件: pages/login.vue, pages/register.vue

🔑 Key: user.profile.title
   📍 路由: /user/profile
   📄 文件: pages/user/profile.vue

⚠️ 未使用的 i18n keys:
--------------------------------------------------------------------------------
   common.button.old
   user.settings.deprecated
```

## 支持的文件类型

- **Vue 单文件组件** (.vue)
- **JavaScript 文件** (.js)
- **TypeScript 文件** (.ts)

## JSON 输出格式

当使用 `-o` 参数时，工具会生成结构化的 JSON 文件，包含以下信息：

```json
{
  "metadata": {
    "projectRoot": "项目根目录路径",
    "i18nFile": "i18n 文件路径",
    "generatedAt": "生成时间",
    "totalKeys": "总 key 数量",
    "usedKeys": "已使用的 key 数量",
    "unusedKeys": "未使用的 key 数量"
  },
  "statistics": {
    "totalKeys": "总 key 数量",
    "usedKeys": "已使用的 key 数量",
    "unusedKeys": "未使用的 key 数量",
    "usageRate": "使用率百分比"
  },
  "keyUsage": [
    {
      "key": "i18n key",
      "routes": ["使用的路由列表"],
      "pages": ["使用的页面文件列表"],
      "routeCount": "路由数量",
      "pageCount": "页面数量"
    }
  ],
  "unusedKeys": ["未使用的 key 列表"],
  "summary": {
    "keysWithMultipleRoutes": "在多个路由中使用的 key 数量",
    "keysWithMultiplePages": "在多个页面中使用的 key 数量"
  }
}
```

## 支持的 i18n 调用方式

- `$t('key')` - 翻译
- `$tc('key')` - 复数翻译
- `$te('key')` - 检查 key 是否存在
- `$d('key')` - 日期格式化

## 工作原理

1. **项目检测**: 自动查找项目根目录（通过 nuxt.config.js 或 package.json）
2. **i18n 解析**: 解析指定的 JSON 文件，提取所有嵌套的 key
3. **页面扫描**: 递归扫描 pages/ 目录下的所有页面文件
4. **代码分析**: 使用 @babel/parser 和 @vue/compiler-sfc 解析代码
5. **路由映射**: 将页面文件路径转换为 Nuxt 路由格式
6. **结果生成**: 生成详细的 key 使用情况报告

## 注意事项

- 确保在项目根目录下运行命令
- 工具会自动检测 Nuxt 项目结构
- 支持嵌套的 i18n key（如 `common.button.submit`）
- 动态路由参数会被正确识别（如 `_id.vue` → `/:id`）

## 依赖要求

- Node.js >= 14.0.0
- @babel/parser
- @babel/traverse
- @vue/compiler-sfc

## 故障排除

### 常见问题

1. **"pages 目录不存在"**
   - 确保在正确的项目根目录下运行
   - 检查项目是否有 pages/ 目录

2. **"加载 i18n 文件失败"**
   - 检查文件路径是否正确
   - 确保文件是有效的 JSON 格式

3. **"未找到任何 i18n key 的使用情况"**
   - 检查页面文件中是否正确使用了 i18n 函数
   - 确认 i18n 文件路径正确

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

# 快速开始指南

## 🚀 5分钟快速上手

### 1. 安装工具

```bash
# 克隆项目
git clone <repository-url>
cd find_key_vue2

# 安装依赖并全局安装
npm install && npm install -g .
```

### 2. 在 Nuxt2 项目中使用

```bash
# 进入你的 Nuxt2 项目目录
cd /path/to/your/nuxt2-project

# 运行工具，指定 i18n 英文文件路径
find_key_vue2 -f src/locales/en.json
# 或者
find_key_vue2 -f locales/en.json
# 或者
find_key_vue2 -f i18n/en.json
```

### 3. 查看结果

工具会自动：
- 🔍 扫描项目中的页面文件
- 🌐 解析 i18n 文件
- 📍 建立 key 与路由的映射关系
- 📊 生成详细报告

## 📁 项目结构要求

确保你的项目有以下结构：

```
your-nuxt2-project/
├── nuxt.config.js (或 nuxt.config.ts)
├── pages/          # 页面目录
│   ├── index.vue
│   ├── about.vue
│   └── user/
│       └── profile.vue
├── src/
│   └── locales/
│       └── en.json  # i18n 文件
└── package.json
```

## 🔧 常见用法

### 查找特定目录的 i18n 使用情况

```bash
# 在项目根目录运行
find_key_vue2 -f src/locales/en.json
```

### 分析不同语言的 i18n 文件

```bash
# 分析中文
find_key_vue2 -f src/locales/zh-cn.json

# 分析日文
find_key_vue2 -f src/locales/ja.json
```

## 📊 输出示例

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

⚠️ 未使用的 i18n keys:
--------------------------------------------------------------------------------
   common.button.old
   user.settings.deprecated
```

## 🆘 遇到问题？

### 问题：找不到 pages 目录
**解决方案**: 确保在项目根目录（包含 nuxt.config.js 的目录）运行命令

### 问题：i18n 文件加载失败
**解决方案**: 检查文件路径是否正确，确保文件是有效的 JSON 格式

### 问题：没有找到 i18n key 使用情况
**解决方案**: 检查页面文件中是否正确使用了 `$t()`, `$tc()` 等 i18n 函数

## 📞 获取帮助

```bash
# 查看使用说明
find_key_vue2

# 或者
find_key_vue2 --help
```

## 🎯 下一步

- 📖 阅读完整的 [README.md](README.md)
- 🔧 自定义工具配置
- 🚀 集成到你的开发工作流中

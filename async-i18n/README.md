# async-i18n

异步国际化文件同步工具

## 功能特性

- 🎯 **多项目选择**: 支持同时选择多个项目进行同步
- 🔄 **自动更新**: 自动切换到 main 分支并拉取最新代码
- 📁 **文件同步**: 将源路径中的所有 JSON 文件覆盖到目标路径
- 🎨 **友好界面**: 使用简单直观的命令行交互，支持多种选择方式
- ⚡ **错误处理**: 完善的错误处理和日志输出

## 安装

### 自动安装（推荐）

```bash
./install.sh
```

### 手动安装

```bash
pip3 install -r requirements.txt
```

### Python 版本兼容性

- ✅ **Python 3.8+**: 完全支持
- ✅ **Python 3.13**: 已解决 `distutils` 兼容性问题
- ⚠️ **Python 3.12**: 需要安装 `setuptools` 解决 `distutils` 问题

如果遇到 `ModuleNotFoundError: No module named 'distutils'` 错误，请先安装 `setuptools`：

```bash
pip3 install setuptools>=65.0.0
```

## 使用方法

### 基本使用

```bash
python async_i18n.py
```

### 指定配置文件

```bash
python async_i18n.py --config /path/to/your/config.json
```

## 配置文件格式

创建 `config.json` 文件，配置项目信息：

```json
[
    {
        "project_name": "web-language",
        "target_path": "/path/to/target/locales",
        "source_path": "/path/to/source/project"
    },
    {
        "project_name": "trade-language", 
        "target_path": "/path/to/another/target/locales",
        "source_path": "/path/to/another/source/project"
    }
]
```

### 配置说明

- `project_name`: 项目名称，用于显示和识别
- `target_path`: 目标路径，JSON 文件将被同步到这里
- `source_path`: 源路径，包含需要同步的 JSON 文件的 Git 仓库路径

## 工作流程

1. **选择项目**: 工具启动后会显示所有配置的项目，支持多种选择方式：
   - 输入项目编号 (如: `1,2,3` 或 `1-3`)
   - 输入项目名称 (如: `web-language,trade-language`)
   - 输入 `all` 选择所有项目
   - 输入 `q` 退出
2. **确认操作**: 确认要同步的项目列表
3. **更新代码**: 对每个选中的项目：
   - 切换到 main 分支
   - 拉取最新代码
4. **同步文件**: 将源路径中的所有 JSON 文件复制到目标路径
5. **完成报告**: 显示同步结果统计

## 注意事项

- 确保源路径是有效的 Git 仓库
- 确保目标路径存在且有写入权限
- 同步操作会覆盖目标路径中的同名文件
- 支持嵌套目录结构的 JSON 文件同步

## 错误处理

工具包含完善的错误处理机制：

- Git 操作失败时会显示详细错误信息
- 文件路径不存在时会给出明确提示
- 网络中断或用户取消操作时会优雅退出

## 示例输出

```
🌍 async-i18n: 异步国际化文件同步工具
==================================================

📋 可用项目列表:
============================================================
 1. web-language
    源路径: /Users/eli/Documents/weex/projects/web-language
    目标路径: /Users/eli/Documents/weex/projects/web_separation/client/locales

 2. trade-language
    源路径: /Users/eli/Documents/weex/projects/trade-language
    目标路径: /Users/eli/Documents/weex/projects/web-trade/client/locales

选择方式:
1. 输入项目编号 (如: 1,2,3 或 1-3)
2. 输入项目名称 (如: web-language,trade-language)
3. 输入 'all' 选择所有项目
4. 输入 'q' 退出
============================================================

请选择项目: 1

✅ 已选择 1 个项目:
   • web-language

==================================================
确认开始同步？(y/N): y

🚀 开始处理项目: web-language
==================================================
🔄 正在更新项目: web-language
   路径: /Users/eli/Documents/weex/projects/web-language
   📍 切换到 main 分支...
   📥 拉取最新代码...
✅ 项目 web-language 更新完成
📁 正在同步 JSON 文件: web-language
   源路径: /Users/eli/Documents/weex/projects/web-language
   目标路径: /Users/eli/Documents/weex/projects/web_separation/client/locales
   📄 找到 5 个 JSON 文件
   ✅ 同步: en.json
   ✅ 同步: zh-CN.json
   ✅ 同步: ja.json
   ✅ 同步: ko.json
   ✅ 同步: es.json
✅ 项目 web-language 同步完成，共同步 5 个文件
🎉 项目 web-language 处理完成

==================================================
📊 同步完成: 1/1 个项目成功
🎉 所有项目同步成功！
```

# 国际化语言文档同步工具

一个自动化脚本来同步多个国际化语言项目中的 JSON 文件到对应的目标项目。

## 功能特性

- 🌍 支持多选语言项目同步
- 🔧 自动 Git 操作（切换分支、拉取最新代码）
- 📁 智能 JSON 文件同步
- 📊 详细的同步进度和结果统计
- 🛡️ 完善的错误处理机制
- 🎯 支持命令行参数和交互式操作

## 项目配置

### 语言项目列表
```python
language_list = [
    "web-language",
    "trade-language"
]
```

### 项目映射关系
```python
language_project_map = {
    "web-language": "/Users/eli/Documents/project/weex/web_separation/client/locales",
    "trade-language": "/Users/eli/Documents/project/weex/web-trade/client/locales"
}
```

## 使用方法

### 1. 交互式运行
```bash
python upgrade_i18n/index.py
```

### 2. 指定语言项目
```bash
# 同步单个项目
python upgrade_i18n/index.py --languages web-language

# 同步多个项目
python upgrade_i18n/index.py --languages web-language,trade-language
```

### 3. 查看可用项目
```bash
python upgrade_i18n/index.py --list
```

### 4. 自定义路径
```bash
python upgrade_i18n/index.py --language-base-path /custom/path
```

## 全局命令配置

### 方法一：简单别名
在 `~/.zshrc` 中添加：
```bash
alias sync-i18n='python3 /Users/eli/Documents/project/github/auto_shell/upgrade_i18n/index.py'
```

### 方法二：函数方式（推荐）
在 `~/.zshrc` 中添加：
```bash
sync-i18n() {
    local script_path="/Users/eli/Documents/project/github/auto_shell/upgrade_i18n/index.py"
    if [ -f "$script_path" ]; then
        python3 "$script_path" "$@"
    else
        echo "❌ 同步工具不存在: $script_path"
        echo "请检查路径是否正确"
    fi
}
```

### 重新加载配置
```bash
source ~/.zshrc
```

### 使用全局命令
```bash
# 交互式运行
sync-i18n

# 指定项目
sync-i18n --languages web-language,trade-language

# 查看帮助
sync-i18n --help
```

## 工作流程

1. **项目选择**
   - 显示所有可用的语言项目
   - 支持多选（如：输入 "1,3"）
   - 支持全选（输入 "all"）

2. **Git 操作**
   - 自动进入项目目录
   - 切换到 main 分支
   - 执行 `git pull` 更新代码

3. **文件同步**
   - 查找所有 `.json` 文件
   - 保持目录结构
   - 复制到目标路径

4. **结果统计**
   - 显示成功/失败/跳过的文件数量
   - 提供详细的错误信息

## 命令行参数

| 参数 | 说明 | 示例 |
|------|------|------|
| `--language-base-path` | 语言项目基础路径 | `--language-base-path /custom/path` |
| `--languages` | 指定要同步的语言项目 | `--languages web-language,trade-language` |
| `--list` | 列出所有可用的语言项目 | `--list` |

## 示例输出

```
🚀 国际化语言文档同步工具
============================================================

🌍 可用的语言项目:
------------------------------------------------------------
1. ✅ web-language
   📁 目标路径: /Users/eli/Documents/project/weex/web_separation/client/locales
2. ✅ trade-language
   📁 目标路径: /Users/eli/Documents/project/weex/web-trade/client/locales
------------------------------------------------------------

📝 请选择要同步的语言项目 (可多选，用逗号分隔，如: 1,3)
   输入 'q' 退出，输入 'all' 选择所有项目

请选择项目 (1-2): 1,2

⚠️  确认同步操作:
   选择项目: web-language, trade-language
   项目数量: 2

确认执行同步? (y/N): y

🔄 开始同步: web-language
============================================================

🔧 执行 Git 操作: web-language
   路径: /Users/eli/Documents/project/weex/language/web-language
   当前分支: main
   📥 执行 git pull...
   ✅ git pull 成功

📂 同步 JSON 文件:
   源路径: /Users/eli/Documents/project/weex/language/web-language
   目标路径: /Users/eli/Documents/project/weex/web_separation/client/locales
   📁 找到 15 个 JSON 文件
   ✅ en.json
   ✅ zh.json
   ✅ ja.json
   ...

📊 同步结果:
   ✅ 成功: 15
   ❌ 失败: 0
   ⚠️  跳过: 0

============================================================
🎉 同步完成!
📊 总体统计:
   ✅ 成功: 30
   ❌ 失败: 0
   ⚠️  跳过: 0
🎉 所有文件同步成功!
```

## 错误处理

- **Git 操作失败**: 显示详细错误信息，跳过该项目的同步
- **文件不存在**: 显示警告信息，统计为跳过
- **权限问题**: 显示错误信息，统计为失败
- **网络问题**: 显示连接错误，建议检查网络

## 注意事项

1. 确保语言项目目录存在且包含 `.json` 文件
2. 确保目标路径有写入权限
3. 确保 Git 仓库配置正确
4. 建议在同步前备份重要文件

## 扩展配置

如需添加新的语言项目，修改 `index.py` 中的配置：

```python
self.language_list = [
    "web-language",
    "trade-language",
    "new-language"  # 添加新项目
]

self.language_project_map = {
    "web-language": "/path/to/web/locales",
    "trade-language": "/path/to/trade/locales",
    "new-language": "/path/to/new/locales"  # 添加映射关系
}
``` 
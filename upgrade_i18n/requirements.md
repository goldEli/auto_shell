# 国际化语言文档同步工具需求文档

## 项目概述
创建一个自动化脚本来同步多个国际化语言项目中的 JSON 文件到对应的目标项目。

## 项目结构
- **基础路径**: `/Users/eli/Documents/project/weex/language`
- **目标路径**: `/Users/eli/Documents/project/weex/web_separation/client/locales`

## 语言项目列表
```python
language_list = [
    "web-language",
    "trade-language"
]
```

## 项目映射关系
```python
language_project_map = {
    "web-language": "/Users/eli/Documents/project/weex/web_separation/client/locales",
    "trade-language": "/Users/eli/Documents/project/weex/web-trade/client/locales"
}
```

## 功能需求

### 1. 项目选择功能
- 显示所有可用的语言项目列表
- 支持多选语言项目
- 显示每个项目的状态（存在/不存在）
- 提供退出选项

### 2. Git 操作功能
- 自动进入选中的语言项目目录
- 切换到 main 分支
- 执行 `git pull` 更新代码
- 处理 Git 操作异常

### 3. 文件同步功能
- 只同步 `.json` 文件
- 忽略其他文件类型
- 保持目录结构
- 覆盖目标文件
- 显示同步进度和结果

### 4. 错误处理
- Git 操作失败处理
- 文件同步失败处理
- 网络连接问题处理
- 权限问题处理

## 技术实现

### 核心类设计
```python
class I18nSyncTool:
    def __init__(self, language_base_path, target_path)
    def get_available_languages(self)
    def display_languages(self)
    def select_languages(self)
    def git_operations(self, language)
    def sync_json_files(self, source_path, target_path)
    def run(self)
```

### 主要方法
1. **get_available_languages()**: 获取可用的语言项目
2. **display_languages()**: 显示语言项目列表
3. **select_languages()**: 多选语言项目
4. **git_operations()**: 执行 Git 操作
5. **sync_json_files()**: 同步 JSON 文件
6. **run()**: 主运行方法

## 用户交互流程
1. 显示欢迎信息和可用语言项目
2. 用户选择需要同步的语言项目（多选）
3. 确认选择的项目
4. 逐个处理选中的项目：
   - 进入项目目录
   - 切换到 main 分支
   - 执行 git pull
   - 同步 JSON 文件
5. 显示同步结果总结

## 输出格式
- 使用表情符号和颜色增强可读性
- 显示详细的进度信息
- 提供成功/失败统计
- 错误信息清晰明确

## 命令行参数
- `--language-base-path`: 语言项目基础路径
- `--target-path`: 目标路径
- `--languages`: 指定要同步的语言项目（跳过交互选择）

## 安全考虑
- 同步前备份目标文件
- 验证文件路径安全性
- 处理权限问题
- 提供回滚选项

## 扩展性
- 支持添加新的语言项目
- 支持自定义同步规则
- 支持配置文件
- 支持日志记录

## 全局命令配置

### .zshrc 修改建议

为了实现在任何目录下都能使用同步工具，需要在 `~/.zshrc` 文件中添加以下配置：

```bash
# 添加到 ~/.zshrc 文件末尾

# 国际化同步工具别名
alias sync-i18n='python /Users/eli/Documents/project/github/auto_shell/upgrade_i18n/index.py'

# 或者使用完整路径的 Python 解释器
alias sync-i18n='python3 /Users/eli/Documents/project/github/auto_shell/upgrade_i18n/index.py'

# 如果需要使用 uv 运行
alias sync-i18n='uv run python /Users/eli/Documents/project/github/auto_shell/upgrade_i18n/index.py'

# 添加项目目录到 PATH（可选）
export PATH="/Users/eli/Documents/project/github/auto_shell:$PATH"
```

### 使用方法

配置完成后，重新加载 `.zshrc` 或重启终端：

```bash
# 重新加载配置
source ~/.zshrc

# 或者重启终端
```

然后就可以在任何目录下使用全局命令：

```bash
# 交互式运行
sync-i18n

# 指定参数运行
sync-i18n --languages web-language,trade-language

# 查看帮助
sync-i18n --help
```

### 可选配置

如果需要更高级的配置，可以添加以下内容：

```bash
# 添加到 ~/.zshrc

# 国际化同步工具函数（支持参数传递）
sync-i18n() {
    local script_path="/Users/eli/Documents/project/github/auto_shell/upgrade_i18n/index.py"
    if [ -f "$script_path" ]; then
        python3 "$script_path" "$@"
    else
        echo "❌ 同步工具不存在: $script_path"
        echo "请检查路径是否正确"
    fi
}

# 自动补全支持（可选）
_sync-i18n() {
    local cur=${COMP_WORDS[COMP_CWORD]}
    local opts="--help --language-base-path --target-path --languages"
    COMPREPLY=( $(compgen -W "$opts" -- $cur) )
}
complete -F _sync-i18n sync-i18n
```

### 验证配置

配置完成后，可以通过以下命令验证：

```bash
# 检查别名是否生效
alias | grep sync-i18n

# 测试命令
sync-i18n --help

# 检查 Python 脚本是否存在
ls -la /Users/eli/Documents/project/github/auto_shell/upgrade_i18n/index.py
```

---

请确认以上需求是否满足你的要求，如有需要修改的地方请指出。 
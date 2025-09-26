# 全局使用指南 - run-pipeline

## 🚀 快速开始

### 1. 安装全局命令
```bash
# 在项目目录中执行
pnpm link --global
```

### 2. 验证安装
```bash
# 检查命令是否可用
run-pipeline --help
```

### 3. 基本使用
```bash
# 列出所有项目
run-pipeline list

# 交互式选择项目（默认多选）
run-pipeline select

# 选择特定项目
run-pipeline pick 1 3 5

# 搜索项目
run-pipeline search web
```

## 📋 完整命令列表

### 项目列表
```bash
run-pipeline list
```

### 交互式选择
```bash
# 多选（默认）
run-pipeline select

# 多选 + 指定分支
run-pipeline select -b main

# 单选
run-pipeline select --single

# 单选 + 指定分支
run-pipeline select --single -b develop
```

### 搜索项目
```bash
# 搜索包含 "web" 的项目
run-pipeline search web

# 搜索 + 指定分支
run-pipeline search web -b main

# 搜索 + 单选
run-pipeline search admin --single -b develop
```

### 按索引选择
```bash
# 选择第 1, 3, 5 个项目
run-pipeline pick 1 3 5

# 选择 + 指定分支
run-pipeline pick 1 3 5 -b main
```

## 🌿 分支支持

所有命令都支持 `-b` 或 `--branch` 参数来指定分支：

```bash
run-pipeline select -b feature/new-ui
run-pipeline search web -b develop
run-pipeline pick 1 2 3 -b main
```

## 🔧 高级用法

### 组合使用
```bash
# 搜索特定项目并执行管道
run-pipeline search admin -b main

# 选择多个项目并指定分支
run-pipeline pick 1 3 5 -b develop
```

### 帮助信息
```bash
# 查看所有命令
run-pipeline --help

# 查看特定命令帮助
run-pipeline select --help
run-pipeline search --help
run-pipeline pick --help
```

## 🎯 使用场景

### 场景 1: 快速执行多个项目的管道
```bash
# 选择多个项目
run-pipeline select -b main
```

### 场景 2: 执行特定类型项目的管道
```bash
# 执行所有 web 相关项目
run-pipeline search web -b develop
```

### 场景 3: 执行特定项目的管道
```bash
# 执行第 1, 3, 5 个项目
run-pipeline pick 1 3 5 -b feature/new-ui
```

## ⚠️ 注意事项

1. **首次使用**: 确保已经运行 `pnpm link --global` 安装全局命令
2. **网络连接**: 需要能够访问 GitLab 实例
3. **认证**: 确保已经配置了正确的认证信息
4. **浏览器**: 需要安装 Playwright 浏览器

## 🆘 故障排除

### 命令未找到
```bash
# 重新安装全局命令
pnpm link --global
```

### 权限问题
```bash
# 检查可执行权限
chmod +x run_pipeline.js
```

### 依赖问题
```bash
# 重新安装依赖
pnpm install
```

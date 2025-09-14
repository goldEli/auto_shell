#!/bin/bash

echo "🚀 安装 async-i18n 依赖..."

# 检查 Python3 是否安装
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 未安装，请先安装 Python3"
    exit 1
fi

# 检查 pip 是否安装
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 未安装，请先安装 pip3"
    exit 1
fi

# 安装依赖
echo "📦 安装 Python 依赖..."
echo "   安装 setuptools (解决 Python 3.13 distutils 问题)..."
pip3 install setuptools>=65.0.0
echo "   检查其他依赖..."
pip3 install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ 依赖安装完成！"
    echo ""
    echo "🎉 async-i18n 安装成功！"
    echo ""
    echo "使用方法："
    echo "  python3 async_i18n.py"
    echo "  或者"
    echo "  ./async-i18n"
    echo ""
    echo "查看帮助："
    echo "  python3 async_i18n.py --help"
else
    echo "❌ 依赖安装失败"
    exit 1
fi

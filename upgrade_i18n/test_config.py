#!/usr/bin/env python3
"""
配置文件测试脚本
"""

import sys
from pathlib import Path

# 添加当前目录到 Python 路径
sys.path.insert(0, str(Path(__file__).parent))

try:
    from config import (
        LANGUAGE_BASE_PATH,
        LANGUAGE_LIST,
        LANGUAGE_PROJECT_MAP,
        SYNC_CONFIG,
        GIT_CONFIG,
        LOG_CONFIG
    )
    
    print("✅ 配置文件加载成功!")
    print("\n📋 配置信息:")
    print("-" * 50)
    
    print(f"🌍 语言项目基础路径: {LANGUAGE_BASE_PATH}")
    print(f"📁 语言项目列表: {LANGUAGE_LIST}")
    print(f"🎯 项目映射数量: {len(LANGUAGE_PROJECT_MAP)}")
    
    print("\n🔧 同步配置:")
    for key, value in SYNC_CONFIG.items():
        print(f"   {key}: {value}")
    
    print("\n📝 Git 配置:")
    for key, value in GIT_CONFIG.items():
        print(f"   {key}: {value}")
    
    print("\n📊 日志配置:")
    for key, value in LOG_CONFIG.items():
        print(f"   {key}: {value}")
    
    # 验证路径是否存在
    print("\n🔍 路径验证:")
    base_path = Path(LANGUAGE_BASE_PATH)
    if base_path.exists():
        print(f"✅ 基础路径存在: {LANGUAGE_BASE_PATH}")
        
        for language in LANGUAGE_LIST:
            lang_path = base_path / language
            if lang_path.exists():
                print(f"✅ 语言项目存在: {language}")
            else:
                print(f"❌ 语言项目不存在: {language}")
    else:
        print(f"❌ 基础路径不存在: {LANGUAGE_BASE_PATH}")
    
    # 验证目标路径
    print("\n🎯 目标路径验证:")
    for language, target_path in LANGUAGE_PROJECT_MAP.items():
        target = Path(target_path)
        if target.exists():
            print(f"✅ 目标路径存在: {language} -> {target_path}")
        else:
            print(f"⚠️  目标路径不存在: {language} -> {target_path}")
    
    print("\n🎉 配置测试完成!")
    
except ImportError as e:
    print(f"❌ 配置文件导入失败: {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ 配置测试失败: {e}")
    sys.exit(1) 
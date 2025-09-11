#!/usr/bin/env python3
"""
async-i18n: 异步国际化文件同步工具

功能：
1. 选择项目（支持多选）
2. 自动切换到 main 分支并更新代码
3. 将 source_path 中的 JSON 文件覆盖到 target_path
"""

import os
import sys
import json
import shutil
import subprocess
import argparse
from pathlib import Path
from typing import List, Dict, Any


class AsyncI18n:
    def __init__(self, config_file: str = None):
        """初始化工具"""
        self.config_file = config_file or os.path.join(os.path.dirname(__file__), 'config.json')
        self.projects = self.load_projects()
    
    def load_projects(self) -> List[Dict[str, Any]]:
        """加载项目配置"""
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except (json.JSONDecodeError, IOError) as e:
                print(f"❌ 配置文件加载失败: {e}")
                return []
        else:
            # 使用默认配置
            return [
                {
                    "project_name": "web-language",
                    "target_path": "/Users/eli/Documents/weex/projects/web_separation/client/locales",
                    "source_path": "/Users/eli/Documents/weex/projects/web-language",
                },
                {
                    "project_name": "trade-language", 
                    "target_path": "/Users/eli/Documents/weex/projects/web-trade/client/locales",
                    "source_path": "/Users/eli/Documents/weex/projects/trade-language",
                },
            ]
    
    def select_projects(self) -> List[Dict[str, Any]]:
        """选择项目（支持多选）"""
        if not self.projects:
            print("❌ 没有可用的项目配置")
            return []
        
        print("\n📋 可用项目列表:")
        print("=" * 60)
        for i, project in enumerate(self.projects, 1):
            print(f"{i:2d}. {project['project_name']}")
            print(f"    源路径: {project['source_path']}")
            print(f"    目标路径: {project['target_path']}")
            print()
        
        print("选择方式:")
        print("1. 输入项目编号 (如: 1,2,3 或 1-3)")
        print("2. 输入项目名称 (如: web-language,trade-language)")
        print("3. 输入 'all' 选择所有项目")
        print("4. 输入 'q' 退出")
        print("=" * 60)
        
        while True:
            try:
                choice = input("\n请选择项目: ").strip()
                
                if choice.lower() == 'q':
                    print("❌ 用户取消操作")
                    return []
                
                if choice.lower() == 'all':
                    print("✅ 已选择所有项目")
                    return self.projects.copy()
                
                # 解析选择
                selected_projects = self._parse_selection(choice)
                
                if selected_projects:
                    print(f"\n✅ 已选择 {len(selected_projects)} 个项目:")
                    for project in selected_projects:
                        print(f"   • {project['project_name']}")
                    return selected_projects
                else:
                    print("❌ 无效选择，请重新输入")
                    
            except KeyboardInterrupt:
                print("\n❌ 用户取消操作")
                return []
            except Exception as e:
                print(f"❌ 输入错误: {e}")
    
    def _parse_selection(self, choice: str) -> List[Dict[str, Any]]:
        """解析用户选择"""
        selected_projects = []
        
        # 按逗号分割
        parts = [part.strip() for part in choice.split(',')]
        
        for part in parts:
            if '-' in part:
                # 处理范围选择 (如: 1-3)
                try:
                    start, end = map(int, part.split('-'))
                    for i in range(start, end + 1):
                        if 1 <= i <= len(self.projects):
                            selected_projects.append(self.projects[i-1])
                except ValueError:
                    continue
            else:
                # 处理单个选择
                try:
                    # 尝试作为数字
                    index = int(part)
                    if 1 <= index <= len(self.projects):
                        selected_projects.append(self.projects[index-1])
                except ValueError:
                    # 尝试作为项目名称
                    for project in self.projects:
                        if project['project_name'].lower() == part.lower():
                            selected_projects.append(project)
                            break
        
        # 去重
        seen = set()
        unique_projects = []
        for project in selected_projects:
            if project['project_name'] not in seen:
                seen.add(project['project_name'])
                unique_projects.append(project)
        
        return unique_projects
    
    def run_git_command(self, path: str, command: str) -> bool:
        """执行 Git 命令"""
        try:
            result = subprocess.run(
                command.split(),
                cwd=path,
                capture_output=True,
                text=True,
                check=True
            )
            return True
        except subprocess.CalledProcessError as e:
            print(f"❌ Git 命令执行失败: {e}")
            print(f"   命令: {command}")
            print(f"   路径: {path}")
            if e.stderr:
                print(f"   错误: {e.stderr}")
            return False
    
    def update_git_repo(self, project: Dict[str, Any]) -> bool:
        """更新 Git 仓库"""
        source_path = project['source_path']
        project_name = project['project_name']
        
        print(f"🔄 正在更新项目: {project_name}")
        print(f"   路径: {source_path}")
        
        # 检查路径是否存在
        if not os.path.exists(source_path):
            print(f"❌ 源路径不存在: {source_path}")
            return False
        
        # 检查是否为 Git 仓库
        git_dir = os.path.join(source_path, '.git')
        if not os.path.exists(git_dir):
            print(f"❌ 不是 Git 仓库: {source_path}")
            return False
        
        # 切换到 main 分支
        print("   📍 切换到 main 分支...")
        if not self.run_git_command(source_path, "git checkout main"):
            return False
        
        # 拉取最新代码
        print("   📥 拉取最新代码...")
        if not self.run_git_command(source_path, "git pull origin main"):
            return False
        
        print(f"✅ 项目 {project_name} 更新完成")
        return True
    
    def sync_json_files(self, project: Dict[str, Any]) -> bool:
        """同步 JSON 文件"""
        source_path = project['source_path']
        target_path = project['target_path']
        project_name = project['project_name']
        
        print(f"📁 正在同步 JSON 文件: {project_name}")
        print(f"   源路径: {source_path}")
        print(f"   目标路径: {target_path}")
        
        # 检查源路径
        if not os.path.exists(source_path):
            print(f"❌ 源路径不存在: {source_path}")
            return False
        
        # 检查目标路径
        if not os.path.exists(target_path):
            print(f"❌ 目标路径不存在: {target_path}")
            return False
        
        # 查找所有 JSON 文件
        json_files = []
        for root, dirs, files in os.walk(source_path):
            for file in files:
                if file.endswith('.json'):
                    json_files.append(os.path.join(root, file))
        
        if not json_files:
            print(f"⚠️  源路径中没有找到 JSON 文件: {source_path}")
            return True
        
        print(f"   📄 找到 {len(json_files)} 个 JSON 文件")
        
        # 同步文件
        synced_count = 0
        for json_file in json_files:
            try:
                # 计算相对路径
                rel_path = os.path.relpath(json_file, source_path)
                target_file = os.path.join(target_path, rel_path)
                
                # 确保目标目录存在
                target_dir = os.path.dirname(target_file)
                os.makedirs(target_dir, exist_ok=True)
                
                # 复制文件
                shutil.copy2(json_file, target_file)
                synced_count += 1
                print(f"   ✅ 同步: {rel_path}")
                
            except Exception as e:
                print(f"   ❌ 同步失败: {rel_path} - {e}")
        
        print(f"✅ 项目 {project_name} 同步完成，共同步 {synced_count} 个文件")
        return True
    
    def process_project(self, project: Dict[str, Any]) -> bool:
        """处理单个项目"""
        project_name = project['project_name']
        print(f"\n🚀 开始处理项目: {project_name}")
        print("=" * 50)
        
        # 更新 Git 仓库
        if not self.update_git_repo(project):
            return False
        
        # 同步 JSON 文件
        if not self.sync_json_files(project):
            return False
        
        print(f"🎉 项目 {project_name} 处理完成")
        return True
    
    def run(self):
        """运行主程序"""
        print("🌍 async-i18n: 异步国际化文件同步工具")
        print("=" * 50)
        
        # 选择项目
        selected_projects = self.select_projects()
        if not selected_projects:
            return
        
        print(f"\n📋 已选择 {len(selected_projects)} 个项目:")
        for project in selected_projects:
            print(f"   • {project['project_name']}")
        
        # 确认执行
        print("\n" + "=" * 50)
        confirm = input("确认开始同步？(y/N): ").strip().lower()
        if confirm not in ['y', 'yes', '是']:
            print("❌ 用户取消操作")
            return
        
        # 处理每个项目
        success_count = 0
        for project in selected_projects:
            if self.process_project(project):
                success_count += 1
        
        # 输出结果
        print("\n" + "=" * 50)
        print(f"📊 同步完成: {success_count}/{len(selected_projects)} 个项目成功")
        if success_count == len(selected_projects):
            print("🎉 所有项目同步成功！")
        else:
            print("⚠️  部分项目同步失败，请检查错误信息")


def main():
    """主函数"""
    parser = argparse.ArgumentParser(description='async-i18n: 异步国际化文件同步工具')
    parser.add_argument(
        '--config', 
        type=str, 
        help='配置文件路径 (默认: config.json)'
    )
    
    args = parser.parse_args()
    
    try:
        tool = AsyncI18n(args.config)
        tool.run()
    except KeyboardInterrupt:
        print("\n❌ 用户中断操作")
        sys.exit(1)
    except Exception as e:
        print(f"❌ 程序执行出错: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()

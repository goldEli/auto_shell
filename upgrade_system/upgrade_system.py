#!/usr/bin/env python3
"""
文件夹同步工具
用于在 weex 项目之间同步指定的文件夹和文件
"""

import os
import shutil
import sys
from pathlib import Path
from typing import List, Tuple
import argparse
from datetime import datetime


class FolderSyncTool:
    def __init__(self, base_path: str = "/Users/eli/Documents/project/weex"):
        self.base_path = Path(base_path)
        self.sync_paths = [
            "src/clientData",
            "src/components", 
            "src/app/[locale]/(dashboard)/system",
            "src/serverData/system",
            "src/hooks",
            "src/lib",
            "src/providers"
        ]
        self.projects = ["admin-web-ad", "admin-web-fin", "admin-web-op", "admin-web-rd"]
        
    def get_available_projects(self) -> List[str]:
        """获取可用的项目列表"""
        available = []
        for project in self.projects:
            project_path = self.base_path / project
            if project_path.exists():
                available.append(project)
        return available
    
    def display_projects(self, projects: List[str]):
        """显示项目列表"""
        print("\n📁 可用的项目:")
        print("-" * 50)
        for i, project in enumerate(projects, 1):
            project_path = self.base_path / project
            status = "✅" if project_path.exists() else "❌"
            print(f"{i}. {status} {project}")
        print("-" * 50)
    
    def select_project(self, prompt: str, projects: List[str]) -> str:
        """选择项目"""
        while True:
            try:
                choice = input(f"\n{prompt} (1-{len(projects)}): ").strip()
                if choice.lower() == 'q':
                    print("退出程序")
                    sys.exit(0)
                
                index = int(choice) - 1
                if 0 <= index < len(projects):
                    return projects[index]
                else:
                    print(f"❌ 请输入 1-{len(projects)} 之间的数字")
            except ValueError:
                print("❌ 请输入有效的数字")
            except KeyboardInterrupt:
                print("\n\n退出程序")
                sys.exit(0)
    
    def sync_folder(self, source_path: Path, target_path: Path, folder_name: str) -> bool:
        """同步单个文件夹"""
        try:
            if not source_path.exists():
                print(f"⚠️  源路径不存在: {source_path}")
                return False
            
            # 确保目标目录存在
            target_path.parent.mkdir(parents=True, exist_ok=True)
            
            # 如果目标路径存在，先删除
            if target_path.exists():
                if target_path.is_dir():
                    shutil.rmtree(target_path)
                else:
                    target_path.unlink()
            
            # 复制文件夹或文件
            if source_path.is_dir():
                shutil.copytree(source_path, target_path)
            else:
                shutil.copy2(source_path, target_path)
            
            print(f"✅ 同步成功: {folder_name}")
            return True
            
        except Exception as e:
            print(f"❌ 同步失败 {folder_name}: {str(e)}")
            return False
    
    def sync_projects(self, source_project: str, target_project: str):
        """同步两个项目之间的指定文件夹"""
        source_base = self.base_path / source_project
        target_base = self.base_path / target_project
        
        if not source_base.exists():
            print(f"❌ 源项目不存在: {source_base}")
            return
        
        if not target_base.exists():
            print(f"❌ 目标项目不存在: {target_base}")
            return
        
        print(f"\n🔄 开始同步: {source_project} → {target_project}")
        print("=" * 60)
        
        success_count = 0
        total_count = len(self.sync_paths)
        
        for sync_path in self.sync_paths:
            source_path = source_base / sync_path
            target_path = target_base / sync_path
            
            print(f"\n📂 同步: {sync_path}")
            if self.sync_folder(source_path, target_path, sync_path):
                success_count += 1
        
        print("\n" + "=" * 60)
        print(f"📊 同步完成: {success_count}/{total_count} 个文件夹同步成功")
        
        if success_count == total_count:
            print("🎉 所有文件夹同步成功!")
        elif success_count > 0:
            print("⚠️  部分文件夹同步成功，请检查失败的文件夹")
        else:
            print("❌ 没有文件夹同步成功")
    
    def run(self):
        """运行同步工具"""
        print("🚀 文件夹同步工具")
        print("=" * 50)
        
        # 获取可用项目
        available_projects = self.get_available_projects()
        
        if len(available_projects) < 2:
            print("❌ 可用项目数量不足，至少需要2个项目")
            return
        
        # 显示项目列表
        self.display_projects(available_projects)
        
        # 选择源项目
        source_project = self.select_project(
            "请选择源项目 (输入 'q' 退出)", 
            available_projects
        )
        
        # 选择目标项目
        remaining_projects = [p for p in available_projects if p != source_project]
        print(f"\n📁 可用的目标项目 (从 {source_project} 同步到):")
        print("-" * 50)
        for i, project in enumerate(remaining_projects, 1):
            project_path = self.base_path / project
            status = "✅" if project_path.exists() else "❌"
            print(f"{i}. {status} {project}")
        print("-" * 50)
        
        target_project = self.select_project(
            f"请选择目标项目 (从 {source_project} 同步到)", 
            remaining_projects
        )
        
        # 确认同步
        print(f"\n⚠️  确认同步操作:")
        print(f"   源项目: {source_project}")
        print(f"   目标项目: {target_project}")
        print(f"   同步路径: {len(self.sync_paths)} 个文件夹")
        
        confirm = input("\n确认执行同步? (y/N): ").strip().lower()
        if confirm not in ['y', 'yes']:
            print("❌ 取消同步操作")
            return
        
        # 执行同步
        self.sync_projects(source_project, target_project)


def main():
    parser = argparse.ArgumentParser(description="文件夹同步工具")
    parser.add_argument(
        "--base-path", 
        default="/Users/eli/Documents/project/weex",
        help="项目基础路径"
    )
    parser.add_argument(
        "--source", 
        help="源项目名称 (跳过交互选择)"
    )
    parser.add_argument(
        "--target", 
        help="目标项目名称 (跳过交互选择)"
    )
    
    args = parser.parse_args()
    
    # 检查基础路径是否存在
    if not Path(args.base_path).exists():
        print(f"❌ 基础路径不存在: {args.base_path}")
        sys.exit(1)
    
    tool = FolderSyncTool(args.base_path)
    
    # 如果提供了源和目标参数，直接同步
    if args.source and args.target:
        tool.sync_projects(args.source, args.target)
    else:
        # 交互式运行
        tool.run()


if __name__ == "__main__":
    main()

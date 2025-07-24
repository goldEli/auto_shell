#!/usr/bin/env python3
"""
国际化语言文档同步工具
用于同步多个国际化语言项目中的 JSON 文件到对应的目标项目
"""

import os
import shutil
import sys
import subprocess
import json
from pathlib import Path
from typing import List, Dict, Set
import argparse
from datetime import datetime

# 导入配置文件
from config import (
    LANGUAGE_BASE_PATH,
    LANGUAGE_PROJECT_LIST,
    SYNC_CONFIG,
    GIT_CONFIG,
    LOG_CONFIG
)


class I18nSyncTool:
    def __init__(self, language_base_path: str = LANGUAGE_BASE_PATH):
        self.language_base_path = Path(language_base_path)
        self.language_project_list = LANGUAGE_PROJECT_LIST
        self.sync_config = SYNC_CONFIG
        self.git_config = GIT_CONFIG
        self.log_config = LOG_CONFIG
        
    def get_available_projects(self) -> List[Dict]:
        """获取可用的语言项目列表"""
        available = []
        for project in self.language_project_list:
            if not project.get("enabled", True):
                continue
            language_path = project.get("language_path")
            if Path(language_path).exists():
                available.append(project)
        return available
    
    def display_projects(self, projects: List[Dict]):
        """显示项目列表"""
        print("\n🌍 可用的项目:")
        print("-" * 60)
        for i, project in enumerate(projects, 1):
            language_path = project.get("language_path")
            status = "✅" if Path(language_path).exists() else "❌"
            target_path = project.get("target_path", "未配置")
            print(f"{i}. {status} {project['name']}")
            print(f"   📁 目标路径: {target_path}")
        print("-" * 60)
    
    def select_languages(self, languages: List[Dict]) -> List[Dict]:
        """多选语言项目"""
        print(f"\n📝 请选择要同步的语言项目 (可多选，用逗号分隔，如: 1,3)")
        print("   输入 'q' 退出，输入 'all' 选择所有项目")
        
        while True:
            try:
                choice = input(f"\n请选择项目 (1-{len(languages)}): ").strip()
                
                if choice.lower() == 'q':
                    print("退出程序")
                    sys.exit(0)
                
                if choice.lower() == 'all':
                    return languages
                
                # 解析多选输入
                selected_indices = []
                for part in choice.split(','):
                    part = part.strip()
                    if part:
                        index = int(part) - 1
                        if 0 <= index < len(languages):
                            selected_indices.append(index)
                        else:
                            print(f"❌ 无效的选择: {part}")
                            continue
                
                if selected_indices:
                    selected_projects = [languages[i] for i in selected_indices]
                    return selected_projects
                else:
                    print("❌ 请至少选择一个项目")
                    
            except ValueError:
                print("❌ 请输入有效的数字，多个选择用逗号分隔")
            except KeyboardInterrupt:
                print("\n\n退出程序")
                sys.exit(0)
    
    def git_operations(self, project: Dict) -> bool:
        """执行 Git 操作"""
        # 检查是否启用 Git 操作
        if not self.sync_config.get("enable_git_operations", True):
            print(f"⚠️  Git 操作已禁用，跳过: {project['name']}")
            return True
        
        language_path = project.get("language_path")
        
        if not Path(language_path).exists():
            print(f"❌ 语言项目不存在: {language_path}")
            return False
        
        print(f"\n🔧 执行 Git 操作: {project['name']}")
        print(f"   路径: {language_path}")
        
        try:
            # 切换到项目目录
            original_dir = os.getcwd()
            os.chdir(language_path)
            
            # 检查是否为 Git 仓库
            if not Path(".git").exists():
                print(f"⚠️  不是 Git 仓库: {project['name']}")
                return True
            
            # 获取当前分支
            result = subprocess.run(
                ["git", "branch", "--show-current"], 
                capture_output=True, 
                text=True, 
                check=True,
                timeout=self.git_config.get("timeout", 300)
            )
            current_branch = result.stdout.strip()
            print(f"   当前分支: {current_branch}")
            
            # 切换到默认分支
            default_branch = self.git_config.get("default_branch", "main")
            if current_branch != default_branch:
                print(f"   🔄 切换到 {default_branch} 分支...")
                checkout_cmd = ["git", "checkout", default_branch]
                if self.git_config.get("force_checkout", False):
                    checkout_cmd.append("-f")
                subprocess.run(checkout_cmd, check=True, timeout=self.git_config.get("timeout", 300))
                print(f"   ✅ 已切换到 {default_branch} 分支")
            
            # 执行 git fetch
            print(f"   📥 执行 git fetch...")
            result = subprocess.run(
                ["git", "fetch"], 
                capture_output=not self.git_config.get("show_git_output", False), 
                text=True, 
                check=True,
                timeout=self.git_config.get("timeout", 300)
            )
            print(f"   ✅ git fetch 成功")
            
            # 执行 git pull
            print(f"   📥 执行 git pull...")
            result = subprocess.run(
                ["git", "pull"], 
                capture_output=not self.git_config.get("show_git_output", False), 
                text=True, 
                check=True,
                timeout=self.git_config.get("timeout", 300)
            )
            print(f"   ✅ git pull 成功")
            
            # 返回原目录
            os.chdir(original_dir)
            return True
            
        except subprocess.TimeoutExpired:
            print(f"❌ Git 操作超时: {project['name']}")
            os.chdir(original_dir)
            return False
        except subprocess.CalledProcessError as e:
            print(f"❌ Git 操作失败: {e}")
            if e.stderr:
                print(f"   错误输出: {e.stderr}")
            os.chdir(original_dir)
            return False
        except Exception as e:
            print(f"❌ Git 操作异常: {e}")
            os.chdir(original_dir)
            return False
    
    def find_json_files(self, source_path: Path) -> List[Path]:
        """查找所有指定扩展名的文件"""
        files = []
        if Path(source_path).exists():
            extensions = self.sync_config.get("file_extensions", [".json"])
            ignore_patterns = self.sync_config.get("ignore_patterns", [])

            print(f"   📁 查找 JSON 文件: {source_path}")
            
            for file_path in Path(source_path).rglob("*"):
                if file_path.is_file():
                    # 检查文件扩展名
                    if any(file_path.suffix == ext for ext in extensions):
                        # 检查是否在忽略列表中
                        should_ignore = False
                        for pattern in ignore_patterns:
                            if pattern in str(file_path):
                                should_ignore = True
                                break
                        
                        if not should_ignore:
                            files.append(file_path)
        
        return files
    
    def sync_json_files(self, source_path: Path, target_path: Path) -> Dict[str, int]:
        """同步 JSON 文件"""
        stats = {"success": 0, "failed": 0, "skipped": 0}
        
        if not Path(source_path).exists():
            print(f"⚠️  源路径不存在: {source_path}")
            stats["skipped"] += 1
            return stats
        
        json_files = self.find_json_files(source_path)
        
        if not json_files:
            print(f"⚠️  未找到 JSON 文件: {source_path}")
            stats["skipped"] += 1
            return stats
        
        print(f"   📁 找到 {len(json_files)} 个 JSON 文件")
        
        for json_file in json_files:
            try:
                # 计算相对路径
                relative_path = json_file.relative_to(source_path)
                target_file = target_path / relative_path
                
                # 确保目标目录存在
                target_file.parent.mkdir(parents=True, exist_ok=True)
                
                # 复制文件
                shutil.copy2(json_file, target_file)
                print(f"   ✅ {relative_path}")
                stats["success"] += 1
                
            except Exception as e:
                print(f"   ❌ {relative_path}: {e}")
                stats["failed"] += 1
        
        return stats
    
    def sync_language_project(self, project: Dict) -> Dict[str, int]:
        """同步单个语言项目"""
        print(f"\n🔄 开始同步: {project['name']}")
        print("=" * 60)
        
        # 获取源路径和目标路径
        source_path = project.get("language_path")
        target_path_str = project.get("target_path")
        
        if not target_path_str:
            print(f"❌ 未配置目标路径: {project['name']}")
            return {"success": 0, "failed": 0, "skipped": 1}
        
        target_path = Path(target_path_str)
        
        # 执行 Git 操作
        if not self.git_operations(project):
            print(f"❌ Git 操作失败，跳过同步: {project['name']}")
            return {"success": 0, "failed": 0, "skipped": 1}
        
        # 同步 JSON 文件
        print(f"\n📂 同步 JSON 文件:")
        print(f"   源路径: {source_path}")
        print(f"   目标路径: {target_path}")
        
        stats = self.sync_json_files(source_path, target_path)
        
        print(f"\n📊 同步结果:")
        print(f"   ✅ 成功: {stats['success']}")
        print(f"   ❌ 失败: {stats['failed']}")
        print(f"   ⚠️  跳过: {stats['skipped']}")
        
        return stats
    
    def run(self, selected_projects: List[Dict] = None):
        """运行同步工具"""
        print("🚀 国际化语言文档同步工具")
        print("=" * 60)
        
        # 获取可用语言项目
        available_projects = self.get_available_projects()
        
        if not available_projects:
            print("❌ 没有找到可用的项目")
            return
        
        # 如果没有指定语言项目，进行交互选择
        if not selected_projects:
            # 显示语言项目列表
            self.display_projects(available_projects)
            
            # 选择语言项目
            selected_projects = self.select_languages(available_projects)
            
            if not selected_projects:
                print("❌ 未选择任何语言项目")
                return
        
        # 确认同步操作
        print(f"\n⚠️  确认同步操作:")
        project_names = [project["name"] for project in selected_projects]
        print(f"   选择项目: {', '.join(project_names)}")
        print(f"   项目数量: {len(selected_projects)}")
        
        confirm = input("\n确认执行同步? (y/N): ").strip().lower()
        if confirm not in ['y', 'yes']:
            print("❌ 取消同步操作")
            return
        
        # 执行同步
        total_stats = {"success": 0, "failed": 0, "skipped": 0}
        
        for project in selected_projects:
            stats = self.sync_language_project(project)
            total_stats["success"] += stats["success"]
            total_stats["failed"] += stats["failed"]
            total_stats["skipped"] += stats["skipped"]
        
        # 显示总结
        print("\n" + "=" * 60)
        print("🎉 同步完成!")
        print(f"📊 总体统计:")
        print(f"   ✅ 成功: {total_stats['success']}")
        print(f"   ❌ 失败: {total_stats['failed']}")
        print(f"   ⚠️  跳过: {total_stats['skipped']}")
        
        if total_stats["failed"] == 0:
            print("🎉 所有文件同步成功!")
        elif total_stats["success"] > 0:
            print("⚠️  部分文件同步成功，请检查失败的文件")
        else:
            print("❌ 没有文件同步成功")


def main():
    parser = argparse.ArgumentParser(description="国际化语言文档同步工具")
    parser.add_argument(
        "--language-base-path", 
        default=LANGUAGE_BASE_PATH,
        help="语言项目基础路径"
    )
    parser.add_argument(
        "--languages", 
        help="指定要同步的语言项目，用逗号分隔 (如: web-language,trade-language)"
    )
    parser.add_argument(
        "--list", 
        action="store_true",
        help="列出所有可用的语言项目"
    )
    
    args = parser.parse_args()
    
    # 检查基础路径是否存在
    if not Path(args.language_base_path).exists():
        print(f"❌ 语言项目基础路径不存在: {args.language_base_path}")
        sys.exit(1)
    
    tool = I18nSyncTool(args.language_base_path)
    
    # 如果指定了 --list 参数，只显示项目列表
    if args.list:
        available_projects = tool.get_available_projects()
        tool.display_projects(available_projects)
        return
    
    # 解析指定的语言项目
    selected_projects = None
    if args.languages:
        language_names = [lang.strip() for lang in args.languages.split(',')]
        # 验证指定的语言项目是否存在
        available_projects = tool.get_available_projects()
        available_names = [project["name"] for project in available_projects]
        invalid_languages = [lang for lang in language_names if lang not in available_names]
        if invalid_languages:
            print(f"❌ 无效的语言项目: {', '.join(invalid_languages)}")
            print(f"可用的项目: {', '.join(available_names)}")
            sys.exit(1)
        
        # 根据名称找到对应的项目配置
        selected_projects = []
        for name in language_names:
            for project in available_projects:
                if project["name"] == name:
                    selected_projects.append(project)
                    break
    
    # 运行同步工具
    tool.run(selected_projects)


if __name__ == "__main__":
    main()

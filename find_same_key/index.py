import json
import os
from typing import Dict, List, Set

# 语言项目基础路径
LANGUAGE_BASE_PATH = "/Users/eli/Documents/project/weex/language"

LANGUAGE_FILE_LIST = [
    {
        "name": "web_separation",
        "language_path": f"{LANGUAGE_BASE_PATH}/web-language/zh-cn.json",
    },
    {
        "name": "web-trade",
        "language_path": f"{LANGUAGE_BASE_PATH}/trade-language/zh-cn.json",
    },
  
    {
        "name": "activity",
        "language_path": f"{LANGUAGE_BASE_PATH}/activity-language/zh-cn.json",
    }
]

def load_json_file(file_path: str) -> Dict:
    """加载JSON文件"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"文件不存在: {file_path}")
        return {}
    except json.JSONDecodeError:
        print(f"JSON格式错误: {file_path}")
        return {}
    except Exception as e:
        print(f"读取文件时出错 {file_path}: {e}")
        return {}

def get_all_keys(data: Dict, prefix: str = "") -> Set[str]:
    """递归获取JSON对象中的所有key"""
    keys = set()
    for key, value in data.items():
        current_key = f"{prefix}.{key}" if prefix else key
        keys.add(current_key)
        
        if isinstance(value, dict):
            keys.update(get_all_keys(value, current_key))
        elif isinstance(value, list):
            # 处理数组中的对象
            for i, item in enumerate(value):
                if isinstance(item, dict):
                    keys.update(get_all_keys(item, f"{current_key}[{i}]"))
    
    return keys

def find_common_keys() -> Dict:
    """查找所有JSON文件中相同的key"""
    # 加载所有JSON文件
    json_data = {}
    for item in LANGUAGE_FILE_LIST:
        name = item["name"]
        file_path = item["language_path"]
        
        data = load_json_file(file_path)
        if data:
            json_data[name] = data
            print(f"成功加载: {name} - {file_path}")
        else:
            print(f"跳过: {name} - 文件加载失败")
    
    if len(json_data) < 2:
        print("至少需要2个有效的JSON文件才能进行比较")
        return {}
    
    # 获取每个文件的所有key
    all_keys = {}
    for name, data in json_data.items():
        keys = get_all_keys(data)
        all_keys[name] = keys
        print(f"{name} 包含 {len(keys)} 个key")
    
    # 找出所有文件都包含的key
    common_keys_set = set.intersection(*all_keys.values())
    
    # 按字母顺序排序
    common_keys_list = sorted(common_keys_set)
    
    result = {
        "common_keys": common_keys_list,
        "common_count": len(common_keys_list),
        "file_info": {}
    }
    
    # 为每个文件添加统计信息
    for name, keys in all_keys.items():
        result["file_info"][name] = {
            "total_keys": len(keys),
            "common_keys": len(common_keys_list),
            "unique_keys": len(keys - common_keys_set)
        }
    
    return result

def print_results(result: Dict):
    """打印结果"""
    if not result:
        return
    
    print("\n" + "="*50)
    print("查找结果")
    print("="*50)
    
    print(f"\n相同key数量: {result['common_count']}")
    
    if result['common_keys']:
        print("\n相同的key列表:")
        for i, key in enumerate(result['common_keys'], 1):
            print(f"{i:3d}. {key}")
    else:
        print("\n没有找到相同的key")
    
    print("\n文件统计信息:")
    for name, info in result['file_info'].items():
        print(f"  {name}:")
        print(f"    总key数: {info['total_keys']}")
        print(f"    相同key数: {info['common_keys']}")
        print(f"    独有key数: {info['unique_keys']}")

def main():
    """主函数"""
    print("开始查找JSON文件中相同的key...")
    result = find_common_keys()
    print_results(result)

if __name__ == "__main__":
    main()
import pandas as pd
import json
import os
from collections import defaultdict

def split_excel_data(input_file, output_dir):
    """
    将Excel文件中的提示词数据分割成多个小文件
    
    Args:
        input_file (str): 输入Excel文件路径
        output_dir (str): 输出目录路径
    """
    # 读取Excel文件
    df = pd.read_excel(input_file)
    
    # 确保必要的列存在
    required_columns = ['mainCategory', 'subCategory', 'title', 'chinese', 'english']
    for col in required_columns:
        if col not in df.columns:
            raise ValueError(f"缺少必要的列: {col}")
    
    # 转换为字典列表
    prompt_data = []
    for _, row in df.iterrows():
        item = {
            'mainCategory': row['mainCategory'],
            'subCategory': row['subCategory'],
            'title': row['title'],
            'chinese': row['chinese'],
            'english': row['english']
        }
        prompt_data.append(item)
    
    # 创建输出目录
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(os.path.join(output_dir, 'main'), exist_ok=True)
    os.makedirs(os.path.join(output_dir, 'sub'), exist_ok=True)
    
    # 按主分类分割数据
    main_category_data = defaultdict(list)
    sub_category_data = defaultdict(list)
    category_mapping = defaultdict(set)
    
    for item in prompt_data:
        main_cat = item['mainCategory']
        sub_cat = item['subCategory']
        
        main_category_data[main_cat].append(item)
        sub_category_data[sub_cat].append(item)
        category_mapping[main_cat].add(sub_cat)
    
    # 保存主分类数据
    for category, data in main_category_data.items():
        filename = f"{category}.json"
        filepath = os.path.join(output_dir, 'main', filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Created {filename} with {len(data)} items")
    
    # 保存小分类数据
    for category, data in sub_category_data.items():
        filename = f"{category}.json"
        filepath = os.path.join(output_dir, 'sub', filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Created {filename} with {len(data)} items")
    
    # 生成分类索引文件
    category_index = {
        'mainCategories': list(main_category_data.keys()),
        'subCategories': list(sub_category_data.keys()),
        'categoryMapping': {main_cat: list(sub_cats) for main_cat, sub_cats in category_mapping.items()}
    }
    
    index_filepath = os.path.join(output_dir, 'category-index.json')
    with open(index_filepath, 'w', encoding='utf-8') as f:
        json.dump(category_index, f, ensure_ascii=False, indent=2)
    print('Created category index file')
    
    print('Data splitting completed successfully!')

if __name__ == '__main__':
    # 输入文件路径
    input_file = input('输入excle文件路径:')  
    # 输出目录路径
    output_dir = input('输入输出文件目录:')
    
    # 执行数据分割
    try:
        split_excel_data(input_file, output_dir)
    except Exception as e:
        print(f"Error: {e}")
        print("请确保Excel文件存在且格式正确")
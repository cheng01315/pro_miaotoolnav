const fs = require('fs');

// 创建一个简化版本的分析脚本
console.log('开始分析数据...');

// 读取文件并提取数据
const fileContent = fs.readFileSync('./prompt-data.js', 'utf-8');
console.log('文件大小:', fileContent.length, '字符');

// 提取数组部分（简化方法）
const startIndex = fileContent.indexOf('[');
const endIndex = fileContent.lastIndexOf(']') + 1;
const arrayContent = fileContent.substring(startIndex, endIndex);

console.log('数据部分大小:', arrayContent.length, '字符');

// 尝试解析部分数据以获取分类信息
try {
  // 只解析前100项来获取分类信息
  const data = JSON.parse(arrayContent.substring(0, arrayContent.indexOf('},', 10000) + 2) + ']');
  console.log('前100项数据解析成功');
  
  // 提取所有主分类
  const categories = new Set(data.map(item => item.mainCategory));
  console.log('主分类:', Array.from(categories));
} catch (error) {
  console.error('解析数据时出错:', error.message);
}

console.log('分析完成');
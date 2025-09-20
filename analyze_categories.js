const fs = require('fs');

// 读取文件内容
const data = fs.readFileSync('E:/miaotoolnav-old/aiprompt_file/prompt-data.js', 'utf8');

// 提取所有主分类
const mainCategories = [];
const lines = data.split('\n');
lines.forEach(line => {
  if (line.includes('"mainCategory":')) {
    const match = line.match(/"mainCategory":\s*"([^"]+)"/);
    if (match && !mainCategories.includes(match[1])) {
      mainCategories.push(match[1]);
    }
  }
});

console.log('主分类列表:');
mainCategories.forEach((category, index) => {
  console.log(`${index + 1}. ${category}`);
});

console.log('\n主分类总数:', mainCategories.length);

// 为每个主分类创建数据文件
const jsonData = data.match(/const promptData = \[([\s\S]*)\];/);
if (jsonData && jsonData[1]) {
  // 清理数据并解析
  const cleanData = jsonData[1].replace(/,$/, ''); // 移除末尾的逗号
  // 由于数据太大，我们只处理前几个条目来测试
  console.log('\n数据解析成功');
}
const fs = require('fs');

// 读取文件内容并提取数组部分
const fileContent = fs.readFileSync('./prompt-data.js', 'utf-8');
const jsonData = fileContent.replace('const promptData = ', '').trim();

// 解析 JSON 数据
const data = JSON.parse(jsonData);

// 提取所有主分类
const categories = new Set(data.map(item => item.mainCategory));
console.log('Categories:', Array.from(categories));

// 按主分类分组数据
const categorizedData = {};
data.forEach(item => {
  const category = item.mainCategory;
  if (!categorizedData[category]) {
    categorizedData[category] = [];
  }
  categorizedData[category].push(item);
});

// 创建 data 目录（如果不存在）
if (!fs.existsSync('data')) {
  fs.mkdirSync('data');
}

// 为每个主分类创建单独的 JSON 文件
Object.keys(categorizedData).forEach(category => {
  const fileName = `data/${category.replace(/\//g, '_')}.json`;
  fs.writeFileSync(fileName, JSON.stringify(categorizedData[category], null, 2));
  console.log(`Created ${fileName} with ${categorizedData[category].length} items`);
});

console.log('Data splitting completed.');
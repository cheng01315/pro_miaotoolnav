const http = require('http');
const fs = require('fs');
const path = require('path');

const hostname = '127.0.0.1';
const port = 8000;

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
  console.log(`Request: ${req.url}`);
  
  let filePath = path.join(process.cwd(), req.url === '/' ? '/aiprompt.html' : req.url);
  
  // 处理查询参数
  if (filePath.includes('?')) {
    filePath = filePath.split('?')[0];
  }
  
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // 文件未找到
        console.log(`File not found: ${filePath}`);
        res.writeHead(404);
        res.end('404 Not Found');
      } else {
        // 其他错误
        console.log(`Server error: ${error.code}`);
        res.writeHead(500);
        res.end('500 Internal Server Error');
      }
    } else {
      // 成功读取文件
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
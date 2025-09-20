const { exec } = require('child_process');
const fs = require('fs');

// 压缩CSS
exec('npx postcss styles.css -o styles.min.css', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error}`);
    return;
  }
  console.log('CSS压缩完成: styles.min.css');
});

// 压缩JS
exec('npx terser app.js -o app.min.js -c -m', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error}`);
    return;
  }
  console.log('JS压缩完成: app.min.js');
});
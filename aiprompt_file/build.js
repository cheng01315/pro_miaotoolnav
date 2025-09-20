const { exec } = require('child_process');
const fs = require('fs');

// 压缩JavaScript文件
function minifyJS(input, output) {
    const command = `npx terser ${input} -o ${output} -c -m`;
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error minifying ${input}: ${error}`);
            return;
        }
        console.log(`Minified ${input} -> ${output}`);
    });
}

// 压缩CSS文件
function minifyCSS(input, output) {
    const command = `npx cssnano ${input} ${output}`;
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error minifying ${input}: ${error}`);
            return;
        }
        console.log(`Minified ${input} -> ${output}`);
    });
}

// 执行压缩任务
minifyJS('app.js', 'app.min.js');
minifyCSS('styles.css', 'styles.min.css');

console.log('Build process started...');
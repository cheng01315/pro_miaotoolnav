// 调试脚本 - 用于检查移动端按钮事件

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成');
    
    // 检查PC端黑暗模式按钮
    const themeToggle = document.getElementById('theme-toggle');
    console.log('PC端黑暗模式按钮:', themeToggle);
    
    // 检查移动端黑暗模式按钮
    const themeToggleMobile = document.getElementById('theme-toggle-mobile');
    console.log('移动端黑暗模式按钮:', themeToggleMobile);
    
    // 检查返回按钮
    const backButton = document.querySelector('.mobile-back-button a');
    console.log('返回按钮:', backButton);
    
    // 为移动端黑暗模式按钮添加调试事件
    if (themeToggleMobile) {
        console.log('为移动端按钮添加事件监听器');
        themeToggleMobile.addEventListener('click', function(e) {
            console.log('移动端黑暗模式按钮被点击');
            console.log('事件对象:', e);
        });
    } else {
        console.log('未找到移动端黑暗模式按钮');
    }
    
    // 为返回按钮添加调试事件
    if (backButton) {
        console.log('为返回按钮添加事件监听器');
        backButton.addEventListener('click', function(e) {
            console.log('返回按钮被点击');
            console.log('事件对象:', e);
        });
    } else {
        console.log('未找到返回按钮');
    }
});
// 虚拟滚动实现
class VirtualList {
    constructor(container, options) {
        this.container = container;
        this.itemHeight = options.itemHeight || 120;
        this.buffer = options.buffer || 5;  // 缓冲区大小
        this.data = options.data || [];
        this.renderItem = options.renderItem || (() => {});
        
        // 初始化状态
        this.startIndex = 0;
        this.endIndex = 0;
        this.visibleCount = 0;
        
        // 创建容器元素
        this.wrapper = document.createElement('div');
        this.wrapper.className = 'virtual-list-wrapper';
        this.wrapper.style.position = 'relative';
        this.wrapper.style.height = '100%';
        this.wrapper.style.overflow = 'hidden';
        
        this.content = document.createElement('div');
        this.content.className = 'virtual-list-content';
        this.content.style.position = 'relative';
        
        this.wrapper.appendChild(this.content);
        this.container.appendChild(this.wrapper);
        
        // 绑定滚动事件
        this.container.addEventListener('scroll', this.onScroll.bind(this));
        
        // 初始化
        this.init();
    }
    
    init() {
        // 计算可见项数量
        this.visibleCount = Math.ceil(this.container.clientHeight / this.itemHeight);
        this.endIndex = Math.min(this.visibleCount + this.buffer, this.data.length);
        
        // 设置容器高度
        this.wrapper.style.height = (this.data.length * this.itemHeight) + 'px';
        
        // 渲染初始内容
        this.updateContent();
    }
    
    onScroll() {
        const scrollTop = this.container.scrollTop;
        const newStartIndex = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.buffer);
        const newEndIndex = Math.min(
            this.data.length, 
            newStartIndex + this.visibleCount + this.buffer * 2
        );
        
        // 只有当索引发生变化时才重新渲染
        if (newStartIndex !== this.startIndex || newEndIndex !== this.endIndex) {
            this.startIndex = newStartIndex;
            this.endIndex = newEndIndex;
            this.updateContent();
        }
    }
    
    updateContent() {
        // 清空内容
        this.content.innerHTML = '';
        
        // 设置内容偏移
        const offsetTop = this.startIndex * this.itemHeight;
        this.content.style.transform = `translateY(${offsetTop}px)`;
        
        // 创建文档片段
        const fragment = document.createDocumentFragment();
        
        // 渲染可见项
        for (let i = this.startIndex; i < this.endIndex; i++) {
            const itemElement = document.createElement('div');
            itemElement.style.height = this.itemHeight + 'px';
            itemElement.innerHTML = this.renderItem(this.data[i], i);
            fragment.appendChild(itemElement);
        }
        
        // 添加到内容容器
        this.content.appendChild(fragment);
    }
    
    // 更新数据
    updateData(newData) {
        this.data = newData;
        this.init();
    }
}

// 使用示例
function initVirtualList() {
    // 获取容器元素
    const container = document.getElementById('prompt-cards-container');
    
    // 原始数据（实际应用中可能需要从服务器获取）
    const allData = promptData || [];
    
    // 创建虚拟列表实例
    const virtualList = new VirtualList(container, {
        itemHeight: 120,  // 与CSS中卡片高度一致
        buffer: 5,        // 缓冲区大小
        data: allData,    // 数据源
        renderItem: (item, index) => {
            // 渲染单个卡片的函数
            return `
                <div class="prompt-card" data-index="${index}">
                    <h3 class="text-lg font-semibold mb-2">${item.title}</h3>
                    <p class="text-gray-600 text-sm">${item.subCategory}</p>
                </div>
            `;
        }
    });
    
    // 为卡片添加点击事件
    container.addEventListener('click', function(e) {
        const card = e.target.closest('.prompt-card');
        if (card) {
            const index = parseInt(card.getAttribute('data-index'));
            const item = allData[index];
            
            if (item) {
                // 显示模态框
                document.getElementById('modal-title').textContent = item.title;
                document.getElementById('modal-chinese').textContent = item.chinese;
                document.getElementById('modal-english').textContent = item.english;
                document.getElementById('prompt-modal').classList.remove('hidden');
            }
        }
    });
    
    // 搜索功能优化
    const searchInput = document.getElementById('search-input');
    let searchTimer = null;
    
    searchInput.addEventListener('input', function() {
        // 防抖处理
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            const keyword = this.value.trim().toLowerCase();
            if (keyword) {
                // 过滤数据
                const filteredData = allData.filter(item => 
                    item.title.toLowerCase().includes(keyword) ||
                    item.chinese.toLowerCase().includes(keyword) ||
                    item.english.toLowerCase().includes(keyword) ||
                    item.subCategory.toLowerCase().includes(keyword)
                );
                
                // 更新虚拟列表数据
                virtualList.updateData(filteredData);
            } else {
                // 恢复原始数据
                virtualList.updateData(allData);
            }
        }, 300); // 300ms 防抖
    });
    
    return virtualList;
}

// 页面加载完成后初始化虚拟列表
document.addEventListener('DOMContentLoaded', function() {
    // 确保在 promptData 加载完成后初始化
    if (typeof promptData !== 'undefined' && promptData.length > 0) {
        initVirtualList();
    }
});

// 导出类和函数
window.VirtualList = VirtualList;
window.initVirtualList = initVirtualList;
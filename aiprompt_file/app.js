// DOM元素
const mainCategoriesContainer = document.getElementById('main-categories');
const subCategoriesContainer = document.getElementById('sub-categories-container');
const subCategories = document.getElementById('sub-categories');
const promptCardsContainer = document.getElementById('prompt-cards-container');
const searchInput = document.getElementById('search-input');
const noResults = document.getElementById('no-results');
const promptModal = document.getElementById('prompt-modal');
const modalTitle = document.getElementById('modal-title');
const modalChinese = document.getElementById('modal-chinese');
const modalEnglish = document.getElementById('modal-english');
const closeModal = document.getElementById('close-modal');
const copyChinese = document.getElementById('copy-chinese');
const copyEnglish = document.getElementById('copy-english');
const themeToggle = document.getElementById('theme-toggle'); // 夜间模式切换按钮

// 状态管理
let currentMainCategory = null;
let currentSubCategory = null;
let searchQuery = '';
let currentPage = 1;
const ITEMS_PER_PAGE = 20; // 每页显示20个项目
const ITEMS_PER_LOAD = 10; // 移动端每次加载10个项目
let loadedItemsCount = 0; // 已加载的项目数量
let isLoading = false; // 是否正在加载
let isDarkMode = false; // 夜间模式状态

// 处理数据，按分类组织
const categorizedData = {};
const allMainCategories = new Set();
const allSubCategories = new Set();

// 初始化数据结构
promptData.forEach(item => {
    const mainCat = item.mainCategory;
    const subCat = item.subCategory;
    
    allMainCategories.add(mainCat);
    allSubCategories.add(subCat);
    
    if (!categorizedData[mainCat]) {
        categorizedData[mainCat] = {};
    }
    
    if (!categorizedData[mainCat][subCat]) {
        categorizedData[mainCat][subCat] = [];
    }
    
    categorizedData[mainCat][subCat].push(item);
});

// 搜索结果缓存
const searchCache = new Map();

// 渲染大分类（使用文档片段优化DOM操作）
function renderMainCategories() {
    // 创建文档片段以减少重排
    const fragment = document.createDocumentFragment();
    
    // 添加"全部"选项
    const allBtn = document.createElement('div');
    allBtn.className = `category-tag main-category ${currentMainCategory === null ? 'active' : ''}`;
    // 计算总指令数量
    const totalCount = promptData.length;
    allBtn.textContent = `全部 (${totalCount})`;
    allBtn.addEventListener('click', () => {
        currentMainCategory = null;
        currentSubCategory = null;
        currentPage = 1;
        renderMainCategories();
        renderSubCategories();
        renderPromptCards();
    });
    fragment.appendChild(allBtn);
    
    // 添加各个大分类
    Array.from(allMainCategories).forEach(category => {
        const categoryBtn = document.createElement('div');
        categoryBtn.className = `category-tag main-category ${currentMainCategory === category ? 'active' : ''}`;
        // 计算该大分类下的指令数量
        let count = 0;
        if (categorizedData[category]) {
            Object.values(categorizedData[category]).forEach(items => {
                count += items.length;
            });
        }
        categoryBtn.textContent = `${category} (${count})`;
        categoryBtn.addEventListener('click', () => {
            currentMainCategory = category;
            currentSubCategory = null;
            currentPage = 1;
            renderMainCategories();
            renderSubCategories();
            renderPromptCards();
        });
        fragment.appendChild(categoryBtn);
    });
    
    // 一次性更新DOM
    mainCategoriesContainer.innerHTML = '';
    mainCategoriesContainer.appendChild(fragment);
}

// 渲染小分类（使用文档片段优化DOM操作）
function renderSubCategories() {
    // 创建文档片段以减少重排
    const fragment = document.createDocumentFragment();
    
    subCategoriesContainer.classList.toggle('hidden', currentMainCategory === null && !searchQuery);
    
    // 确定当前需要显示的小分类
    let relevantSubCategories = new Set();
    let subCategoryCounts = {}; // 存储每个小分类的指令数量
    
    if (currentMainCategory) {
        // 如果选择了大分类，只显示该大分类下的小分类
        Object.keys(categorizedData[currentMainCategory]).forEach(subCat => {
            relevantSubCategories.add(subCat);
            subCategoryCounts[subCat] = categorizedData[currentMainCategory][subCat].length;
        });
    } else if (searchQuery) {
        // 如果有搜索词，显示所有包含匹配结果的小分类
        promptData.forEach(item => {
            if (isMatch(item, searchQuery)) {
                relevantSubCategories.add(item.subCategory);
                subCategoryCounts[item.subCategory] = (subCategoryCounts[item.subCategory] || 0) + 1;
            }
        });
    } else {
        // 否则显示所有小分类
        relevantSubCategories = allSubCategories;
        // 计算每个小分类的指令数量
        promptData.forEach(item => {
            subCategoryCounts[item.subCategory] = (subCategoryCounts[item.subCategory] || 0) + 1;
        });
    }
    
    // 添加"全部"选项
    const allBtn = document.createElement('div');
    allBtn.className = `category-tag sub-category ${currentSubCategory === null ? 'active' : ''}`;
    allBtn.textContent = '全部';
    allBtn.addEventListener('click', () => {
        currentSubCategory = null;
        currentPage = 1;
        loadedItemsCount = 0; // 修复：在移动端也需要重置已加载项目计数
        renderSubCategories();
        renderPromptCards(true); // 修复：在移动端需要重置卡片渲染
    });
    fragment.appendChild(allBtn);
    
    // 添加各个小分类
        Array.from(relevantSubCategories).forEach(category => {
            const categoryBtn = document.createElement('div');
            categoryBtn.className = `category-tag sub-category ${currentSubCategory === category ? 'active' : ''}`;
            // 添加指令数量
            categoryBtn.textContent = `${category} (${subCategoryCounts[category]})`;
            categoryBtn.addEventListener('click', () => {
                currentSubCategory = category;
                currentPage = 1;
                loadedItemsCount = 0; // 修复：在移动端也需要重置已加载项目计数
                renderSubCategories();
                renderPromptCards(true); // 修复：在移动端需要重置卡片渲染
            });
            fragment.appendChild(categoryBtn);
        });
    
    // 一次性更新DOM
    subCategories.innerHTML = '';
    subCategories.appendChild(fragment);
}

// 渲染提示词卡片（分页/滚动加载）
function renderPromptCards(reset = false) {
    let filteredItems = [];
    
    // 根据当前分类筛选
    if (currentMainCategory && currentSubCategory) {
        filteredItems = categorizedData[currentMainCategory]?.[currentSubCategory] || [];
    } else if (currentMainCategory) {
        // 只筛选大分类
        Object.values(categorizedData[currentMainCategory] || {}).forEach(items => {
            filteredItems = filteredItems.concat(items);
        });
    } else if (currentSubCategory) {
        // 只筛选小分类
        Object.values(categorizedData).forEach(subCats => {
            if (subCats[currentSubCategory]) {
                filteredItems = filteredItems.concat(subCats[currentSubCategory]);
            }
        });
    } else {
        // 没有选择分类，显示全部
        filteredItems = [...promptData];
    }
    
    // 应用搜索筛选（使用缓存）
    if (searchQuery) {
        const cacheKey = searchQuery.toLowerCase();
        if (searchCache.has(cacheKey)) {
            filteredItems = searchCache.get(cacheKey);
        } else {
            filteredItems = filteredItems.filter(item => isMatch(item, searchQuery));
            searchCache.set(cacheKey, filteredItems);
        }
    }
    
    // 显示无结果提示或渲染卡片
    if (filteredItems.length === 0) {
        noResults.classList.remove('hidden');
        // 清除现有内容
        promptCardsContainer.innerHTML = '';
        // 移除加载更多按钮
        removeLoadMoreButton();
    } else {
        noResults.classList.add('hidden');
        
        // 检查是否为移动端
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            // 移动端使用滚动加载模式
            if (reset) {
                // 重置已加载项目计数
                loadedItemsCount = 0;
                // 清除现有内容
                promptCardsContainer.innerHTML = '';
            }
            
            // 计算要加载的项目
            const startIndex = loadedItemsCount;
            const endIndex = Math.min(startIndex + ITEMS_PER_LOAD, filteredItems.length);
            const itemsToLoad = filteredItems.slice(startIndex, endIndex);
            
            // 添加新项目
            itemsToLoad.forEach(item => {
                const card = document.createElement('div');
                card.className = 'prompt-card fade-in';
                card.innerHTML = `
                    <h3 class="mb-1">${item.title}</h3>
                    <div class="text-xs text-gray-500 mt-auto">
                        <span>${item.subCategory}</span>
                    </div>
                `;
                
                card.addEventListener('click', () => openPromptModal(item));
                promptCardsContainer.appendChild(card);
            });
            
            // 更新已加载项目计数
            loadedItemsCount = endIndex;
            
            // 移除现有的加载更多按钮
            removeLoadMoreButton();
            
            // 如果还有更多项目，添加"加载更多"按钮
            if (loadedItemsCount < filteredItems.length) {
                addLoadMoreButton();
            }
        } else {
            // 桌面端使用分页模式
            // 清除现有内容
            promptCardsContainer.innerHTML = '';
            
            // 实现分页
            const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
            const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredItems.length);
            const pageItems = filteredItems.slice(startIndex, endIndex);
            
            pageItems.forEach(item => {
                const card = document.createElement('div');
                card.className = 'prompt-card fade-in';
                card.innerHTML = `
                    <h3 class="mb-1">${item.title}</h3>
                    <div class="text-xs text-gray-500 mt-auto">
                        <span>${item.subCategory}</span>
                    </div>
                `;
                
                card.addEventListener('click', () => openPromptModal(item));
                promptCardsContainer.appendChild(card);
            });
            
            // 添加分页控件
            renderPagination(filteredItems.length);
        }
    }
}

// 添加"加载更多"按钮
function addLoadMoreButton() {
    // 创建加载更多按钮容器
    const loadMoreContainer = document.createElement('div');
    loadMoreContainer.className = 'col-span-full text-center mt-6';
    loadMoreContainer.id = 'load-more-container';
    
    // 创建加载更多按钮
    const loadMoreButton = document.createElement('button');
    loadMoreButton.className = 'bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg transition-colors';
    loadMoreButton.textContent = '加载更多';
    
    // 添加加载状态指示器（默认隐藏）
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'hidden mt-2 text-gray-500';
    loadingIndicator.innerHTML = '<i class="fa fa-spinner fa-spin mr-2"></i>加载中...';
    loadingIndicator.id = 'loading-indicator';
    
    // 点击事件处理
    loadMoreButton.addEventListener('click', () => {
        if (!isLoading) {
            loadMoreItems();
        }
    });
    
    loadMoreContainer.appendChild(loadMoreButton);
    loadMoreContainer.appendChild(loadingIndicator);
    promptCardsContainer.appendChild(loadMoreContainer);
}

// 移除"加载更多"按钮
function removeLoadMoreButton() {
    const loadMoreContainer = document.getElementById('load-more-container');
    if (loadMoreContainer) {
        loadMoreContainer.remove();
    }
}

// 加载更多项目
function loadMoreItems() {
    // 设置加载状态
    isLoading = true;
    
    // 显示加载指示器
    const loadMoreContainer = document.getElementById('load-more-container');
    if (loadMoreContainer) {
        const button = loadMoreContainer.querySelector('button');
        const indicator = document.getElementById('loading-indicator');
        
        if (button && indicator) {
            button.classList.add('hidden');
            indicator.classList.remove('hidden');
        }
    }
    
    // 模拟网络延迟（实际应用中可能不需要）
    setTimeout(() => {
        // 重新渲染卡片（不重置）
        renderPromptCards(false);
        
        // 重置加载状态
        isLoading = false;
        
        // 隐藏加载指示器
        const loadMoreContainer = document.getElementById('load-more-container');
        if (loadMoreContainer) {
            const button = loadMoreContainer.querySelector('button');
            const indicator = document.getElementById('loading-indicator');
            
            if (button && indicator) {
                button.classList.remove('hidden');
                indicator.classList.add('hidden');
            }
        }
    }, 300);
}

// 渲染分页控件
function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    
    // 如果只有一页，不显示分页控件
    if (totalPages <= 1) return;
    
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'col-span-full';
    paginationContainer.id = 'pagination-controls';
    
    // 上一页按钮
    const prevButton = document.createElement('button');
    prevButton.className = `prev-btn ${currentPage === 1 ? 'disabled' : ''}`;
    prevButton.textContent = '上一页';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderPromptCards();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    
    paginationContainer.appendChild(prevButton);
    
    // 页码按钮 (最多显示7个页码)
    let startPage = Math.max(1, currentPage - 3);
    let endPage = Math.min(totalPages, startPage + 6);
    
    if (endPage - startPage < 6) {
        startPage = Math.max(1, endPage - 6);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            currentPage = i;
            renderPromptCards();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        paginationContainer.appendChild(pageButton);
    }
    
    // 下一页按钮
    const nextButton = document.createElement('button');
    nextButton.className = `next-btn ${currentPage === totalPages ? 'disabled' : ''}`;
    nextButton.textContent = '下一页';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderPromptCards();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    
    paginationContainer.appendChild(nextButton);
    
    promptCardsContainer.appendChild(paginationContainer);
}

// 检查项目是否匹配搜索词
function isMatch(item, query) {
    const lowerQuery = query.toLowerCase();
    return (
        item.title.toLowerCase().includes(lowerQuery) ||
        item.chinese.toLowerCase().includes(lowerQuery) ||
        item.english.toLowerCase().includes(lowerQuery)
    );
}

// 打开提示词详情弹窗
function openPromptModal(item) {
    modalTitle.textContent = item.title;
    modalChinese.textContent = item.chinese;
    modalEnglish.textContent = item.english;
    promptModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // 防止背景滚动
}

// 关闭弹窗
function closePromptModal() {
    promptModal.classList.add('hidden');
    document.body.style.overflow = ''; // 恢复滚动
}

// 复制文本到剪贴板
function copyToClipboard(text, label) {
    navigator.clipboard.writeText(text).then(() => {
        // 显示复制成功提示
        const toast = document.createElement('div');
        toast.className = 'copy-toast';
        toast.textContent = `${label}已复制!`;
        document.body.appendChild(toast);
        
        // 显示提示
        setTimeout(() => toast.classList.add('show'), 10);
        
        // 3秒后隐藏并移除提示
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    });
}

// 切换夜间模式
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    
    // 更新按钮图标
    const icon = themeToggle.querySelector('i');
    if (isDarkMode) {
        icon.className = 'fa fa-sun-o';
        // 保存用户偏好到本地存储
        localStorage.setItem('theme', 'dark');
    } else {
        icon.className = 'fa fa-moon-o';
        // 保存用户偏好到本地存储
        localStorage.setItem('theme', 'light');
    }
}

// 检查并应用保存的主题偏好
function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        isDarkMode = true;
        document.body.classList.add('dark-mode');
        const icon = themeToggle.querySelector('i');
        icon.className = 'fa fa-sun-o';
    }
}

// 搜索功能
function handleSearch() {
    searchQuery = searchInput.value.trim();
    currentPage = 1;
    loadedItemsCount = 0; // 重置已加载项目计数
    renderSubCategories();
    renderPromptCards(true); // 重置卡片渲染
}

// 窗口大小改变事件处理
function handleResize() {
    // 重置页码和已加载项目计数
    currentPage = 1;
    loadedItemsCount = 0;
    // 重新渲染卡片
    renderPromptCards(true);
}

// 事件监听
closeModal.addEventListener('click', closePromptModal);
promptModal.addEventListener('click', (e) => {
    if (e.target === promptModal) {
        closePromptModal();
    }
});

copyChinese.addEventListener('click', () => {
    copyToClipboard(modalChinese.textContent, '中文提示词');
});

copyEnglish.addEventListener('click', () => {
    copyToClipboard(modalEnglish.textContent, '英文提示词');
});

searchInput.addEventListener('input', handleSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleSearch();
    }
});

// 添加夜间模式切换事件监听器
themeToggle.addEventListener('click', toggleDarkMode);

// 添加窗口大小改变监听器
window.addEventListener('resize', handleResize);

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    renderMainCategories();
    renderSubCategories();
    renderPromptCards(true); // 初始化时重置卡片渲染
    // 应用保存的主题偏好
    applySavedTheme();
});

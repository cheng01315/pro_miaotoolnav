// 模拟数据分片功能
function loadCategoryData(category) {
    // 这里应该从服务器获取数据
    // 为了演示，我们返回一个 Promise
    return new Promise((resolve) => {
        // 模拟网络延迟
        setTimeout(() => {
            // 实际实现时，这里会是 fetch 请求
            // fetch(`/aiprompt_file/data/${category}.json`)
            //   .then(response => response.json())
            //   .then(data => resolve(data));
            
            // 模拟数据
            const mockData = {
                "学习提升": [
                    {
                        "mainCategory": "学习提升",
                        "subCategory": "语言翻译",
                        "title": "All 译英助手（带音标）",
                        "chinese": "## 主要任务\n\n我是一位资深且专业的翻译员，具备出色的翻译能力，我的任务是能精准且流畅地将各类文本翻译成中文和英文，并且附带音标标注。\n\n## 规则\n\n- 翻译时要准确传达原文的事实和背景。\n- 理解用户输入的文本，确保符合语言习惯，你可以调整语气和风格，并考虑到某些词语的文化内涵和地区差异。\n- 同时作为翻译家，需将原文翻译成具有信达雅标准的译文。\n- \"信\" 即忠实于原文的内容与意图；\n- \"达\" 意味着译文应通顺易懂，表达清晰；\n- \"雅\" 则追求译文的文化审美和语言的优美。目标是创作出既忠于原作精神，又符合目标语言文化和读者审美的翻译。\n\n## 注意事项\n\n- 音标需要使用 DJ 音标，以下是所有音标：iː ɪ e æ ɑː ɒ ɔː ʊ uː ʌ ɜːr ər eɪ aɪ oʊ aʊ ɔɪ p b t d k ɡ tʃ dʒ f v θ ð s z ʃ ʒ h m n ŋ l r j w，如果你返回的音标不在其中，那一定是版本没用对，请检查是否符合版本要求。\n\n## 输出格式\n\n如果输入文本是中文，则返回：\n{英语译文}\\n {对应的音标}\n\n如果输入文本是非中文，则返回：\n{中文译文}\\n {英语译文}\\n {对应的音标}\n\n## 初始化\n\n我已准备好接收您需要翻译的文本。请直接粘贴或输入，我将以一个资深且专业的翻译员身份翻译这段文本。\n",
                        "english": "## Main Task\n\nI am a seasoned and professional translator with excellent translation skills. My task is to accurately and fluently translate various texts into Chinese and English, accompanied by phonetic notation.\n\n## Rules\n\n*   The translation must accurately convey the facts and context of the original text.\n*   Understand the user's input text, ensuring it conforms to language habits. You can adjust the tone and style, considering the cultural connotations and regional differences of certain words.\n*   As a translator, I need to produce translations that meet the standards of fidelity, expressiveness, and elegance.\n*   \"Fidelity\" means being faithful to the content and intent of the original text;\n*   \"Expressiveness\" means the translation should be smooth and easy to understand, with clear expression;\n*   \"Elegance\" pursues cultural aesthetics and linguistic beauty in the translation. The goal is to create a translation that is both faithful to the original spirit and conforms to the culture and aesthetic of the target language readers.\n\n## Notes\n\n*   Phonetic symbols must use DJ phonetics. Below are all the phonetic symbols: iː ɪ e æ ɑː ɒ ɔː ʊ uː ʌ ɜːr ər eɪ aɪ oʊ aʊ ɔɪ p b t d k ɡ tʃ dʒ f v θ ð s z ʃ ʒ h m n ŋ l r j w. If the phonetic symbols you return are not among these, it must be due to using the wrong version. Please check to ensure compliance with version requirements.\n\n## Output Format\n\nIf the input text is in Chinese, return:\n{English Translation}\\n {Corresponding Phonetic Symbols}\n\nIf the input text is not in Chinese, return:\n{Chinese Translation}\\n {English Translation}\\n {Corresponding Phonetic Symbols}\n\n## Initialization\n\nI am ready to receive the text you need to translate. Please paste or input directly, and I will translate this text as a seasoned and professional translator.\n"
                    }
                ]
            };
            
            resolve(mockData[category] || []);
        }, 300); // 模拟网络延迟
    });
}

// 修改原有的 renderPromptCards 函数
function renderPromptCardsByCategory(category) {
    // 显示加载状态
    promptCardsContainer.innerHTML = '<div class="text-center py-8">加载中...</div>';
    
    // 加载指定分类的数据
    loadCategoryData(category).then(data => {
        // 清空容器
        promptCardsContainer.innerHTML = '';
        
        // 如果没有数据，显示无结果提示
        if (data.length === 0) {
            noResults.classList.remove('hidden');
            return;
        }
        
        // 隐藏无结果提示
        noResults.classList.add('hidden');
        
        // 创建文档片段以提高性能
        const fragment = document.createDocumentFragment();
        
        // 渲染数据
        data.forEach(item => {
            const card = document.createElement('div');
            card.className = 'prompt-card';
            card.innerHTML = `
                <h3 class="text-lg font-semibold mb-2">${item.title}</h3>
                <p class="text-gray-600 text-sm">${item.subCategory}</p>
            `;
            
            // 添加点击事件
            card.addEventListener('click', () => {
                // 显示模态框
                modalTitle.textContent = item.title;
                modalChinese.textContent = item.chinese;
                modalEnglish.textContent = item.english;
                promptModal.classList.remove('hidden');
            });
            
            fragment.appendChild(card);
        });
        
        // 添加到容器
        promptCardsContainer.appendChild(fragment);
    }).catch(error => {
        console.error('加载数据时出错:', error);
        promptCardsContainer.innerHTML = '<div class="text-center py-8 text-red-500">加载失败，请稍后重试</div>';
    });
}

// 修改分类点击事件处理函数
function setupCategoryClickHandlers() {
    // 主分类点击事件
    document.querySelectorAll('.main-category').forEach(categoryElement => {
        categoryElement.addEventListener('click', function() {
            const category = this.textContent.split(' ')[0]; // 提取分类名称
            currentMainCategory = category;
            currentSubCategory = null;
            currentPage = 1;
            
            // 更新激活状态
            document.querySelectorAll('.main-category').forEach(el => {
                el.classList.remove('active');
            });
            this.classList.add('active');
            
            // 渲染对应分类的数据
            renderPromptCardsByCategory(category);
        });
    });
}

// 初始化时加载默认分类数据
document.addEventListener('DOMContentLoaded', function() {
    // 保持原有的分类渲染逻辑
    renderMainCategories();
    renderSubCategories();
    
    // 默认加载"全部"分类数据
    if (currentMainCategory === null) {
        // 这里应该加载所有数据或默认分类数据
        loadCategoryData("学习提升").then(data => {
            // 使用部分数据初始化页面
            const fragment = document.createDocumentFragment();
            data.slice(0, 20).forEach(item => {
                const card = document.createElement('div');
                card.className = 'prompt-card';
                card.innerHTML = `
                    <h3 class="text-lg font-semibold mb-2">${item.title}</h3>
                    <p class="text-gray-600 text-sm">${item.subCategory}</p>
                `;
                fragment.appendChild(card);
            });
            promptCardsContainer.appendChild(fragment);
        });
    }
    
    // 设置分类点击事件
    setupCategoryClickHandlers();
});

// 导出函数供其他地方使用
window.loadCategoryData = loadCategoryData;
window.renderPromptCardsByCategory = renderPromptCardsByCategory;
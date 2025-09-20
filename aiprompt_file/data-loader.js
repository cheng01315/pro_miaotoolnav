// 动态加载数据模块
class DataLoader {
    constructor() {
        this.cache = new Map();
    }
    
    // 根据主分类加载数据
    async loadByMainCategory(category) {
        const cacheKey = `main_${category}`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        try {
            // 动态导入对应的分类数据文件
            const module = await import(`./data/main/${category}.js`);
            this.cache.set(cacheKey, module.default || module);
            return module.default || module;
        } catch (error) {
            console.error(`Failed to load data for main category: ${category}`, error);
            return [];
        }
    }
    
    // 根据小分类加载数据
    async loadBySubCategory(category) {
        const cacheKey = `sub_${category}`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        try {
            // 动态导入对应的分类数据文件
            const module = await import(`./data/sub/${category}.js`);
            this.cache.set(cacheKey, module.default || module);
            return module.default || module;
        } catch (error) {
            console.error(`Failed to load data for sub category: ${category}`, error);
            return [];
        }
    }
    
    // 加载分类索引
    async loadCategoryIndex() {
        try {
            const module = await import('./data/category-index.js');
            return module.default || module;
        } catch (error) {
            console.error('Failed to load category index', error);
            return { mainCategories: [], subCategories: [], categoryMapping: {} };
        }
    }
}

export default new DataLoader();
// 定义一个包含多个图标对象的数组，每个图标对象包含名称、图片路径和链接
const icons = [
    {
        name: 'Github仓库', // 图标名称：Github仓库
        icon: 'Resources/Images/Icons/MdiGithub.png', // 图标图片路径
        url: 'https://github.com/Cniuts/Cniuts.github.io/' // 图标链接
    },
    {
        name: 'Bilibili', // 图标名称：Bilibili
        icon: 'Resources/Images/Icons/RiBilibiliFill.png', // 图标图片路径
        url: 'https://www.bilibili.com' // 图标链接
    },
    {
        name: 'Deepseek', // 图标名称：Deepseek
        icon: 'Resources/Images/Icons/ArcticonsDeepseek.png', // 图标图片路径
        url: 'https://chat.deepseek.com' // 图标链接
    },
    {
        name: 'Deepl', // 图标名称：Deepl
        icon: 'Resources/Images/Icons/SimpleIconsDeepl.png', // 图标图片路径
        url: 'https://deepl.com' // 图标链接
    }
];

// 异步函数，用于设置背景图片
async function setBackgroundImage() {
    // 获取id为'background-container'的元素
    const bgContainer = document.getElementById('background-container');
    // 定义背景图片的URL
    const bgUrl = 'https://7ed.net/bing/api';
    
    try {
        // 创建一个新的Image对象
        const img = new Image();
        img.src = bgUrl; // 设置图片的src属性为背景图片URL
        
        // 当图片加载成功时，将其设置为背景图片
        img.onload = () => {
            bgContainer.style.backgroundImage = `url(${bgUrl})`;
            bgContainer.style.backgroundSize = 'cover'; // 设置背景图片大小以覆盖整个容器
            bgContainer.style.backgroundPosition = 'center'; // 设置背景图片位置居中
        };
        
        // 当图片加载失败时，抛出错误
        img.onerror = () => {
            throw new Error('Failed to load image');
        };
        
        // 创建另一个Image对象用于测试API是否可用
        const testImg = new Image();
        testImg.src = `${bgUrl}?t=${Date.now()}`; // 添加时间戳以避免缓存
        testImg.onerror = () => {
            throw new Error('API endpoint not available');
        };
        
    } catch (error) {
        console.error('获取背景图片失败:', error); // 在控制台输出错误信息
        bgContainer.style.backgroundImage = 'none'; // 设置背景图片为无
    }
}

// 创建Dock栏图标
function createDockIcons() {
    // 获取类名为'dock-container'的元素
    const dockContainer = document.querySelector('.dock-container');
    dockContainer.innerHTML = ''; // 清空现有内容

    // 遍历icons数组，为每个图标创建DOM元素
    icons.forEach(icon => {
        const iconElement = document.createElement('div'); // 创建一个div元素用于图标
        iconElement.className = 'dock-icon'; // 设置类名为'dock-icon'
        iconElement.title = icon.name; // 设置鼠标悬停时显示的文本为图标名称
        
        const img = document.createElement('img'); // 创建一个img元素用于图标图片
        img.src = icon.icon; // 设置图片的src属性为图标图片路径
        img.alt = icon.name; // 设置图片的alt属性为图标名称
        img.style.width = '100%'; // 设置图片宽度为100%
        img.style.height = '100%'; // 设置图片高度为100%
        img.style.objectFit = 'contain'; // 设置图片适应容器的样式为contain
        
        iconElement.appendChild(img); // 将img元素添加到iconElement中
        // 为每个图标元素添加点击事件，点击后在新窗口打开对应的链接
        iconElement.addEventListener('click', () => {
            window.open(icon.url, '_blank');
        });
        
        dockContainer.appendChild(iconElement); // 将iconElement添加到dockContainer中
    });
}

// 检查是否是新的一天
function isNewDay() {
    const today = new Date().toDateString(); // 获取当前日期的字符串格式
    const lastDay = sessionStorage.getItem('hitokoto_day'); // 从sessionStorage获取上次记录的日期
    
    // 如果上次记录的日期与今天不同，则更新sessionStorage并返回true
    if (lastDay !== today) {
        sessionStorage.setItem('hitokoto_day', today);
        return true;
    }
    return false; // 否则返回false
}

// 异步函数，用于获取每日一言
async function getHitokoto() {
    try {
        // 如果不是新的一天且sessionStorage中已经有每日一言的数据，则直接返回该数据
        if (!isNewDay() && sessionStorage.getItem('hitokoto_text')) {
            return {
                text: sessionStorage.getItem('hitokoto_text'), // 获取每日一言文本
                from: sessionStorage.getItem('hitokoto_from') || '', // 获取每日一言来源，默认为空字符串
                uuid: sessionStorage.getItem('hitokoto_uuid') || null // 获取每日一言UUID，默认为null
            };
        }

        // 定义两个API请求的端点
        const apiEndpoints = [
            'https://v1.hitokoto.cn/',
            'https://international.v1.hitokoto.cn/'
        ];
        
        let data;
        // 尝试从两个端点获取数据，成功后立即停止尝试
        for (const endpoint of apiEndpoints) {
            try {
                const response = await fetch(endpoint); // 发送fetch请求到API端点
                data = await response.json(); // 将响应解析为JSON格式
                break; // 成功后跳出循环
            } catch (e) {
                continue; // 如果请求失败，继续尝试下一个端点
            }
        }
        
        // 如果所有请求都失败，则抛出错误
        if (!data) throw new Error('所有API请求失败');
        
        // 构造返回结果
        const result = {
            text: data.hitokoto || '每日一言', // 获取每日一言文本，默认为'每日一言'
            from: data.from || '', // 获取每日一言来源，默认为空字符串
            uuid: data.uuid || null // 获取每日一言UUID，默认为null
        };

        // 将每日一言数据存储到sessionStorage
        sessionStorage.setItem('hitokoto_text', result.text);
        sessionStorage.setItem('hitokoto_from', result.from);
        if (result.uuid) {
            sessionStorage.setItem('hitokoto_uuid', result.uuid);
        }

        return result; // 返回结果对象
    } catch (error) {
        console.error('获取一言失败:', error); // 在控制台输出错误信息
        // 返回默认的一言内容
        return {
            text: '微风迎客，软语半茶',
            from: '初桐小栈',
            uuid: null
        };
    }
}

// 更新当前时间和日期
function updateTime() {
    const now = new Date(); // 获取当前时间
    const timeElement = document.getElementById('current-time'); // 获取id为'current-time'的元素
    const dateElement = document.getElementById('current-date'); // 获取id为'current-date'的元素
    
    // 格式化时间字符串为24小时制，包含小时、分钟和秒
    const timeString = now.toLocaleTimeString('zh-CN', {
        hour12: false, // 使用24小时制
        hour: '2-digit', // 小时显示两位数字
        minute: '2-digit', // 分钟显示两位数字
        second: '2-digit' // 秒显示两位数字
    });
    
    // 格式化日期字符串为包含年份、月份、日期和星期几
    const dateString = now.toLocaleDateString('zh-CN', {
        year: 'numeric', // 年份显示完整形式
        month: '2-digit', // 月份显示两位数字
        day: '2-digit', // 日期显示两位数字
        weekday: 'short' // 星期几显示简短形式
    });
    
    timeElement.textContent = timeString; // 将时间字符串设置为timeElement的文本内容
    dateElement.textContent = dateString; // 将日期字符串设置为dateElement的文本内容
}

// 主初始化函数
async function initializeApp() {
    setBackgroundImage(); // 设置背景图片
    createDockIcons(); // 创建Dock栏图标

    // 初始化进度条 - 简化版
    const initProgressBars = () => {
        // 定义一组技能及其掌握程度
        const skills = [
            { name: 'Markdown', percent: 80 },
            { name: 'HTML', percent: 60 },
            { name: 'CSS', percent: 45 },
            { name: 'Python', percent: 40 },
            { name: 'C', percent: 3 },
            { name: 'Linux', percent: 1 }
        ];
        // 获取所有技能卡片
        const cards = document.querySelectorAll('.skill-card');
        cards.forEach((card) => {
            const progressBar = card.querySelector('.linear-progress-bar');
            const percent = parseInt(progressBar.style.width);
            
            if (isNaN(percent)) return;
            
            // 设置初始状态
            progressBar.style.width = '0%';
            
            // 延迟触发动画确保渲染
            setTimeout(() => {
                progressBar.style.transition = 'width 1s ease-out';
                progressBar.style.width = `${percent}%`;
                console.log(`Animated ${card.querySelector('.skill-name').textContent} to ${percent}%`);
            }, 100);
        });
    };

    // DOM加载完成后延迟初始化
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initProgressBars, 500);
    });

    // 初始化interests列表（无动画）
    // 进度条视口动画触发逻辑
    const setupProgressBarAnimations = () => {
        const progressContainers = document.querySelectorAll('.linear-progress-container');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // 进入视口时添加动画类
                    entry.target.classList.add('in-viewport');
                    // 重置动画以便可以重复触发
                    const progressBar = entry.target.querySelector('.linear-progress-bar');
                    progressBar.style.animation = 'none';
                    void progressBar.offsetWidth; // 触发重绘
                    progressBar.style.animation = 'progress-load 1.2s cubic-bezier(0.65, 0, 0.35, 1) forwards';
                } else {
                    // 离开视口时移除动画类
                    entry.target.classList.remove('in-viewport');
                }
            });
        }, {
            threshold: 0.1 // 当10%的元素可见时触发
        });

        progressContainers.forEach(container => {
            observer.observe(container);
        });
    };

    const interestItems = document.querySelectorAll('.interests-list li'); // 获取所有类名为'interests-list'的li元素
    interestItems.forEach(item => { // 遍历每个兴趣项
        item.classList.add('animate'); // 添加'animate'类
    });

    // 初始化进度条动画
    setupProgressBarAnimations();

    // 顶部渐变背景滚动效果
    window.addEventListener('scroll', function() { // 添加滚动事件监听器
        if (window.scrollY > 50) { // 如果垂直滚动距离大于50像素
            document.body.classList.add('scrolling'); // 添加'scrolling'类以应用滚动样式
        } else {
            document.body.classList.remove('scrolling'); // 否则移除'scrolling'类
        }
    });

    // 获取搜索表单、搜索输入框和一言显示元素
    const searchForm = document.querySelector('.home-container form');
    const searchInput = document.querySelector('.home-container input[type="text"]');
    const hitokotoDisplay = document.getElementById('hitokoto-display');

    let hitokotoData;
    try {
        hitokotoData = await getHitokoto(); // 异步获取每日一言数据
    } catch (error) {
        console.error('获取一言数据失败:', error); // 在控制台输出错误信息
        // 设置默认的一言内容
        hitokotoData = {
            text: '微风迎客，软语半茶',
            from: '初桐小栈',
            uuid: null
        };
    }

    // 将每日一言显示在页面上
    hitokotoDisplay.textContent = hitokotoData.from 
        ? `${hitokotoData.text} -- ${hitokotoData.from}` // 如果有来源，则显示来源
        : hitokotoData.text; // 否则只显示文本
    
    // 如果有UUID，则为一言容器添加点击事件以打开详细页面
    if (hitokotoData.uuid) {
        const hitokotoContainer = document.querySelector('.hitokoto-container');
        hitokotoContainer.addEventListener('click', () => {
            window.open(`https://hitokoto.cn?uuid=${hitokotoData.uuid}`, '_blank'); // 在新窗口打开详细页面
        });
    }

    updateTime(); // 初始化时间显示
    setInterval(updateTime, 1000); // 每秒更新一次时间显示

    // 获取logoDock容器，并为其添加点击事件以实现返回顶部功能
    const logoDock = document.querySelector('.logo-dock-container');
    if (logoDock) {
        logoDock.addEventListener('click', () => {
            const duration = 500; // 定义返回顶部动画的持续时间（毫秒）
            const start = window.pageYOffset; // 获取当前垂直滚动距离
            const startTime = performance.now(); // 获取动画开始的时间戳
            
            // 定义缓动函数，用于实现平滑的返回顶部效果
            function easeOutQuad(t) {
                return t * (2 - t);
            }
            
            // 请求动画帧并执行返回顶部动画
            function scrollToTop(timestamp) {
                const elapsed = timestamp - startTime; // 计算已过去的时间
                const progress = Math.min(elapsed / duration, 1); // 计算动画进度（0到1之间）
                const easedProgress = easeOutQuad(progress); // 应用缓动效果
                // 根据缓动效果调整滚动距离
                window.scrollTo(0, start - (start * easedProgress));
                
                if (progress < 1) { // 如果动画未完成，则继续请求动画帧
                    requestAnimationFrame(scrollToTop);
                }
            }
            
            requestAnimationFrame(scrollToTop); // 开始返回顶部动画
        });
    }

    // 获取搜索表单，并为其添加提交事件以实现搜索功能
    if(searchForm) {
        searchForm.addEventListener('submit', (e) => { // 添加提交事件监听器
            e.preventDefault(); // 阻止表单默认提交行为
            const query = searchInput.value.trim(); // 获取输入框内容并去除首尾空格
            if(query) { // 如果输入框不为空
                window.open(`https://cn.bing.com/search?q=${encodeURIComponent(query)}`, '_blank'); // 在新窗口打开Bing搜索结果
            }
        });
    }

    // 获取Dock栏元素及其图标元素
    const dock = document.querySelector('.dock');
    const dockItems = document.querySelectorAll('.dock-icon');
    
    // 更新Dock栏的最小宽度以适应所有图标
    function updateDockSize() {
        const itemWidth = dockItems[0].offsetWidth; // 获取第一个图标的宽度
        const margin = parseInt(window.getComputedStyle(dockItems[0]).marginRight); // 获取第一个图标的右侧外边距
        const totalWidth = (itemWidth + margin * 2) * dockItems.length; // 计算Dock栏所需的总宽度
        dock.style.minWidth = `${totalWidth}px`; // 设置Dock栏的最小宽度
    }

    // 添加窗口大小调整事件监听器，调整窗口大小时更新Dock栏宽度
    window.addEventListener('resize', updateDockSize);
    updateDockSize(); // 初始化Dock栏宽度
}

// 主入口，当DOM内容加载完成后执行初始化函数
document.addEventListener('DOMContentLoaded', () => {
    initializeApp().catch(error => { // 执行initializeApp函数，并捕获可能发生的错误
        console.error('初始化应用失败:', error); // 在控制台输出错误信息
    });
});

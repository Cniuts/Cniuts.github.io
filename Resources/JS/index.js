const icons = [
    {
        name: 'Github仓库',
        icon: 'Resources/Images/Icons/MdiGithub.png',
        url: 'https://github.com/Cniuts/Cniuts.github.io/'
    },
    {
        name: 'Bilibili',
        icon: 'Resources/Images/Icons/RiBilibiliFill.png',
        url: 'https://www.bilibili.com'
    },
    {
        name: 'Deepseek',
        icon: 'Resources/Images/Icons/ArcticonsDeepseek.png',
        url: 'https://chat.deepseek.com'
    },
    {
        name: 'Deepl',
        icon: 'Resources/Images/Icons/SimpleIconsDeepl.png',
        url: 'https://deepl.com'
    }
];

async function setBackgroundImage() {
    const bgContainer = document.getElementById('background-container');
    const bgUrl = 'https://7ed.net/bing/api';
    
    try {
        const img = new Image();
        img.src = bgUrl;
        
        img.onload = () => {
            bgContainer.style.backgroundImage = `url(${bgUrl})`;
            bgContainer.style.backgroundSize = 'cover';
            bgContainer.style.backgroundPosition = 'center';
        };
        
        img.onerror = () => {
            throw new Error('Failed to load image');
        };
        
        const testImg = new Image();
        testImg.src = `${bgUrl}?t=${Date.now()}`;
        testImg.onerror = () => {
            throw new Error('API endpoint not available');
        };
        
    } catch (error) {
        console.error('获取背景图片失败:', error);
        bgContainer.style.backgroundImage = 'none';
    }
}

function createDockIcons() {
    const dockContainer = document.querySelector('.dock-container');
    dockContainer.innerHTML = ''; // 清空现有内容

    icons.forEach(icon => {
        const iconElement = document.createElement('div');
        iconElement.className = 'dock-icon';
        iconElement.title = icon.name;
        
        const img = document.createElement('img');
        img.src = icon.icon;
        img.alt = icon.name;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        
        iconElement.appendChild(img);
        iconElement.addEventListener('click', () => {
            window.open(icon.url, '_blank');
        });
        
        dockContainer.appendChild(iconElement);
    });
}

function isNewDay() {
    const today = new Date().toDateString();
    const lastDay = sessionStorage.getItem('hitokoto_day');
    
    if (lastDay !== today) {
        sessionStorage.setItem('hitokoto_day', today);
        return true;
    }
    return false;
}

async function getHitokoto() {
    try {
        // 检查是否新的一天
        if (!isNewDay() && sessionStorage.getItem('hitokoto_text')) {
            return {
                text: sessionStorage.getItem('hitokoto_text'),
                from: sessionStorage.getItem('hitokoto_from') || '',
                uuid: sessionStorage.getItem('hitokoto_uuid') || null
            };
        }

        const apiEndpoints = [
            'https://v1.hitokoto.cn/',
            'https://international.v1.hitokoto.cn/'
        ];
        
        let data;
        for (const endpoint of apiEndpoints) {
            try {
                const response = await fetch(endpoint);
                data = await response.json();
                break;
            } catch (e) {
                continue;
            }
        }
        
        if (!data) throw new Error('所有API请求失败');
        
        const result = {
            text: data.hitokoto || '每日一言',
            from: data.from || '',
            uuid: data.uuid || null
        };

        // 存储当日一言
        sessionStorage.setItem('hitokoto_text', result.text);
        sessionStorage.setItem('hitokoto_from', result.from);
        if (result.uuid) {
            sessionStorage.setItem('hitokoto_uuid', result.uuid);
        }

        return result;
    } catch (error) {
        console.error('获取一言失败:', error);
        return {
            text: '微风迎客，软语半茶',
            from: '初桐小栈',
            uuid: null
        };
    }
}

function updateTime() {
    const now = new Date();
    const timeElement = document.getElementById('current-time');
    const dateElement = document.getElementById('current-date');
    
    const timeString = now.toLocaleTimeString('zh-CN', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    const dateString = now.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        weekday: 'short'
    });
    
    timeElement.textContent = timeString;
    dateElement.textContent = dateString;
}

// 主初始化函数
async function initializeApp() {
    setBackgroundImage();
    createDockIcons();

    // 初始化进度条 - 简化版
    const initProgressBars = () => {
        const skills = [
            { name: 'Markdown', percent: 80 },
            { name: 'HTML', percent: 60 },
            { name: 'CSS', percent: 45 },
            { name: 'Python', percent: 40 },
            { name: 'C', percent: 30 },
            { name: 'Linux', percent: 35 }
        ];

        const cards = document.querySelectorAll('.skill-card');
        cards.forEach((card, index) => {
            const skill = skills[index];
            const fill = card.querySelector('.circular-fill');
            
            // 直接设置stroke-dashoffset
            const circumference = 251; // 2πr, r=40
            const offset = circumference - (skill.percent / 100) * circumference;
            fill.style.strokeDashoffset = offset;
            
            // 添加简单动画
            fill.style.transition = 'stroke-dashoffset 1.5s ease-out';
            fill.style.strokeDashoffset = offset;
        });
    };

    // 页面加载后初始化
    window.addEventListener('load', initProgressBars);

    // 初始化interests列表（无动画）
    const interestItems = document.querySelectorAll('.interests-list li');
    interestItems.forEach(item => {
        item.classList.add('animate');
    });

    // 顶部渐变背景滚动效果
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            document.body.classList.add('scrolling');
        } else {
            document.body.classList.remove('scrolling');
        }
    });
    
    const searchForm = document.querySelector('.home-container form');
    const searchInput = document.querySelector('.home-container input[type="text"]');
    const hitokotoDisplay = document.getElementById('hitokoto-display');
    
    let hitokotoData;
    try {
        hitokotoData = await getHitokoto();
    } catch (error) {
        console.error('获取一言数据失败:', error);
        hitokotoData = {
            text: '微风迎客，软语半茶',
            from: '初桐小栈',
            uuid: null
        };
    }
    hitokotoDisplay.textContent = hitokotoData.from 
        ? `${hitokotoData.text} -- ${hitokotoData.from}`
        : hitokotoData.text;
    
    if (hitokotoData.uuid) {
        const hitokotoContainer = document.querySelector('.hitokoto-container');
        hitokotoContainer.addEventListener('click', () => {
            window.open(`https://hitokoto.cn?uuid=${hitokotoData.uuid}`, '_blank');
        });
    }

    updateTime();
    setInterval(updateTime, 1000);

    const logoDock = document.querySelector('.logo-dock-container');
    if (logoDock) {
        logoDock.addEventListener('click', () => {
            const duration = 500;
            const start = window.pageYOffset;
            const startTime = performance.now();
            
            function easeOutQuad(t) {
                return t * (2 - t);
            }
            
            function scrollToTop(timestamp) {
                const elapsed = timestamp - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = easeOutQuad(progress);
                window.scrollTo(0, start - (start * easedProgress));
                
                if (progress < 1) {
                    requestAnimationFrame(scrollToTop);
                }
            }
            
            requestAnimationFrame(scrollToTop);
        });
    }
    
    if(searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchInput.value.trim();
            if(query) {
                window.open(`https://www.bing.com/search?q=${encodeURIComponent(query)}`, '_blank');
            }
        });
    }

    const dock = document.querySelector('.dock');
    const dockItems = document.querySelectorAll('.dock-icon');
    
    function updateDockSize() {
        const itemWidth = dockItems[0].offsetWidth;
        const margin = parseInt(window.getComputedStyle(dockItems[0]).marginRight);
        const totalWidth = (itemWidth + margin * 2) * dockItems.length;
        dock.style.minWidth = `${totalWidth}px`;
    }
    
    window.addEventListener('resize', updateDockSize);
    updateDockSize();
}

// 主入口
document.addEventListener('DOMContentLoaded', () => {
    initializeApp().catch(error => {
        console.error('初始化应用失败:', error);
    });
});

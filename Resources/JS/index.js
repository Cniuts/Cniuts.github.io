const icons = [
    {
        name: 'Github',
        icon: 'Resources/Images/Icons/MdiGithub.png',
        url: 'https://github.com'
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

async function getHitokoto() {
    const now = new Date();
    const cacheKey = 'hitokoto_data';
    const cacheExpireKey = 'hitokoto_expire';
    
    try {
        const cachedData = localStorage.getItem(cacheKey);
        const expireTime = localStorage.getItem(cacheExpireKey);
        
        if (cachedData && expireTime && now.getTime() < parseInt(expireTime)) {
            return JSON.parse(cachedData);
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
        
        if (data.from && data.from !== result.text) {
            result.text += ` —— ${data.from}`;
        }
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        localStorage.setItem(cacheKey, JSON.stringify(result));
        localStorage.setItem(cacheExpireKey, tomorrow.getTime().toString());
        
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

document.addEventListener('DOMContentLoaded', async () => {
    setBackgroundImage();
    createDockIcons();

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
    
    const hitokotoData = await getHitokoto();
    hitokotoDisplay.textContent = hitokotoData.text;
    
    if (hitokotoData.uuid) {
        hitokotoDisplay.addEventListener('click', () => {
            window.open(`https://hitokoto.cn?uuid=${hitokotoData.uuid}`, '_blank');
        });
    }

    updateTime();
    setInterval(updateTime, 1000);

    const logoDock = document.querySelector('.logo-dock-container');
    if (logoDock) {
        logoDock.addEventListener('click', () => {
            window.location.reload();
        });
    }
    
    // 信息面板交互
    // 已移除info-panel展开功能

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
});

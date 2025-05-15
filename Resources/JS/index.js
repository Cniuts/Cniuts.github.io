// 图标配置
const icons = [
    { name: 'Github仓库', icon: 'Resources/Images/Icons/MdiGithub.png', url: 'https://github.com/Cniuts/Cniuts.github.io/' },
    { name: 'Bilibili', icon: 'Resources/Images/Icons/RiBilibiliFill.png', url: 'https://www.bilibili.com' },
    { name: 'Deepseek', icon: 'Resources/Images/Icons/ArcticonsDeepseek.png', url: 'https://chat.deepseek.com' },
    { name: 'Deepl', icon: 'Resources/Images/Icons/SimpleIconsDeepl.png', url: 'https://deepl.com' },
    { name: 'Excalidraw', icon: 'Resources/Images/Icons/Excalidraw.svg', url: 'https://excalidraw.com' }
];

// Dock栏功能
function createDockIcons() {
    const dockContainer = document.querySelector('.dock-container');
    dockContainer.innerHTML = '';

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
        iconElement.addEventListener('click', () => window.open(icon.url, '_blank'));
        dockContainer.appendChild(iconElement);
    });
}

function updateDockSize() {
    const dock = document.querySelector('.dock');
    const dockItems = document.querySelectorAll('.dock-icon');
    const itemWidth = dockItems[0].offsetWidth;
    const margin = parseInt(window.getComputedStyle(dockItems[0]).marginRight);
    dock.style.minWidth = `${(itemWidth + margin * 2) * dockItems.length}px`;
}

// 背景图片设置
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

// 时间管理
function updateTime() {
    const now = new Date();
    const timeElement = document.getElementById('current-time');
    const dateElement = document.getElementById('current-date');

    timeElement.textContent = now.toLocaleTimeString('zh-CN', {
        hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    dateElement.textContent = now.toLocaleDateString('zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short'
    });
}

// 每日一言功能
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
            } catch (e) { continue; }
        }

        if (!data) throw new Error('所有API请求失败');

        const result = {
            text: data.hitokoto || '每日一言',
            from: data.from || '',
            uuid: data.uuid || null
        };

        sessionStorage.setItem('hitokoto_text', result.text);
        sessionStorage.setItem('hitokoto_from', result.from);
        if (result.uuid) sessionStorage.setItem('hitokoto_uuid', result.uuid);

        return result;
    } catch (error) {
        console.error('获取一言失败:', error);
        return { text: '微风迎客，软语半茶', from: '初桐小栈', uuid: null };
    }
}

// 动画效果
function setupProgressBarAnimations() {
    const personalStrengthSection = document.querySelector('.personal-strength');
    const skillRows = document.querySelectorAll('.skill-row');

    const progressBars = Array.from(skillRows).map((row, index) => {
        const bar = row.querySelector('.linear-progress-bar');
        const percentElement = row.querySelector('.skill-percent');
        return {
            element: bar,
            targetPercent: percentElement ? parseInt(percentElement.textContent) : 0,
            delay: 0.1 + (index * 0.05)
        };
    });

    progressBars.forEach(barData => barData.element.style.width = '0%');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            progressBars.forEach(barData => {
                if (entry.isIntersecting) {
                    barData.element.style.transition = `width 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) ${barData.delay}s`;
                    barData.element.style.width = `${barData.targetPercent}%`;
                } else {
                    barData.element.style.transition = 'none';
                    barData.element.style.width = '0%';
                }
            });
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    if (personalStrengthSection) observer.observe(personalStrengthSection);
}

function setupCardAnimations() {
    const cards = document.querySelectorAll('.interest-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            entry.isIntersecting
                ? entry.target.classList.add('show')
                : entry.target.classList.remove('show');
        });
    }, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });

    cards.forEach(card => {
        card.style.willChange = 'transform, opacity';
        card.classList.remove('show');
        observer.observe(card);
    });
}

// 滚动效果
function setupScrollEffects() {
    window.addEventListener('scroll', () => {
        document.body.classList.toggle('scrolling', window.scrollY > 50);
    });

    const logoDock = document.querySelector('.logo-dock-container');
    if (logoDock) {
        logoDock.addEventListener('click', () => {
            const duration = 500;
            const start = window.pageYOffset;
            const startTime = performance.now();

            function easeOutQuad(t) { return t * (2 - t); }

            function scrollToTop(timestamp) {
                const elapsed = timestamp - startTime;
                const progress = Math.min(elapsed / duration, 1);
                window.scrollTo(0, start - (start * easeOutQuad(progress)));
                if (progress < 1) requestAnimationFrame(scrollToTop);
            }

            requestAnimationFrame(scrollToTop);
        });
    }
}

// 搜索功能
function setupSearch() {
    const searchForm = document.querySelector('.home-container form');
    const searchInput = document.querySelector('.home-container input[type="text"]');

    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) window.open(`https://cn.bing.com/search?q=${encodeURIComponent(query)}`, '_blank');
        });
    }
}

// 主初始化函数
async function initializeApp() {
    setBackgroundImage();
    createDockIcons();
    window.addEventListener('resize', updateDockSize);
    updateDockSize();

    const hitokotoDisplay = document.getElementById('hitokoto-display');
    try {
        const hitokotoData = await getHitokoto();
        hitokotoDisplay.textContent = hitokotoData.from
            ? `${hitokotoData.text} -- ${hitokotoData.from}`
            : hitokotoData.text;

        if (hitokotoData.uuid) {
            document.querySelector('.hitokoto-container').addEventListener('click', () => {
                window.open(`https://hitokoto.cn?uuid=${hitokotoData.uuid}`, '_blank');
            });
        }
    } catch (error) {
        console.error('获取一言数据失败:', error);
        hitokotoDisplay.textContent = '微风迎客，软语半茶 -- 初桐小栈';
    }

    updateTime();
    setInterval(updateTime, 1000);

    setupProgressBarAnimations();
    setupCardAnimations();
    setupScrollEffects();
    setupSearch();
}

// 应用入口
document.addEventListener('DOMContentLoaded', () => {
    initializeApp().catch(error => console.error('初始化应用失败:', error));
});
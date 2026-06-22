// ==================== 全局变量 ====================

let isGuestMode = true;
let currentUser = null;
let isSupabaseReady = false;

// ==================== Supabase 集成 ====================

function initSupabaseIntegration() {
    // 初始化 Supabase
    try {
        isSupabaseReady = window.SupabaseAPI && window.SupabaseAPI.initSupabase();
    } catch (error) {
        console.error('Supabase 初始化失败:', error);
        isSupabaseReady = false;
    }
    
    if (isSupabaseReady) {
        console.log('Supabase 集成已启用');
        checkAuthStatus();
    } else {
        console.log('Supabase 未配置，使用本地模式');
        showAuthContainer(false);
    }
}

// 延迟绑定事件，确保 DOM 完全加载
function bindAuthEvents() {
    setTimeout(() => {
        const loginTab = document.querySelector('.auth-tab[data-tab="login"]');
        const registerTab = document.querySelector('.auth-tab[data-tab="register"]');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
        console.log('绑定登录事件:', { loginTab, registerTab, loginForm, registerForm });
        
        if (loginTab) {
            loginTab.onclick = () => {
                loginTab.classList.add('active');
                registerTab?.classList.remove('active');
                loginForm?.style.setProperty('display', 'flex');
                registerForm?.style.setProperty('display', 'none');
            };
        }
        
        if (registerTab) {
            registerTab.onclick = () => {
                registerTab.classList.add('active');
                loginTab?.classList.remove('active');
                registerForm?.style.setProperty('display', 'flex');
                loginForm?.style.setProperty('display', 'none');
            };
        }
        
        // 登录表单
        const loginFormEl = document.getElementById('login-form');
        if (loginFormEl) {
            loginFormEl.onsubmit = async (e) => {
                e.preventDefault();
                const email = document.getElementById('login-email')?.value;
                const password = document.getElementById('login-password')?.value;
                
                showAuthMessage('登录中...', 'info');
                
                const result = await window.SupabaseAPI.signIn(email, password);
                if (result.success) {
                    currentUser = result.user;
                    isGuestMode = false;
                    await loadUserDataFromCloud();
                    showAuthContainer(false);
                    init();
                    showAuthMessage('登录成功！', 'success');
                } else {
                    showAuthMessage(result.error, 'error');
                }
            };
        }
        
        // 注册表单
        const regFormEl = document.getElementById('register-form');
        if (regFormEl) {
            regFormEl.onsubmit = async (e) => {
                e.preventDefault();
                const username = document.getElementById('register-username')?.value;
                const email = document.getElementById('register-email')?.value;
                const password = document.getElementById('register-password')?.value;
                
                showAuthMessage('注册中...', 'info');
                
                const result = await window.SupabaseAPI.signUp(email, password, username);
                if (result.success) {
                    showAuthMessage('注册成功！请登录', 'success');
                    loginTab?.click();
                } else {
                    showAuthMessage(result.error, 'error');
                }
            };
        }
        
        // 游客模式
        const guestBtn = document.getElementById('guest-btn');
        if (guestBtn) {
            guestBtn.onclick = () => {
                isGuestMode = true;
                currentUser = null;
                showAuthContainer(false);
                init();
            };
        }
        
        // 退出登录
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.onclick = async () => {
                if (!isGuestMode) {
                    await window.SupabaseAPI.signOut();
                }
                currentUser = null;
                isGuestMode = true;
                localStorage.removeItem(STORAGE_KEY);
                location.reload();
            };
        }
        
        // 同步按钮
        const syncBtn = document.getElementById('sync-btn');
        if (syncBtn) {
            syncBtn.onclick = async () => {
                if (isGuestMode) {
                    alert('请先登录才能同步数据');
                    return;
                }
                await syncDataToCloud();
            };
        }
    }, 100);
}

async function checkAuthStatus() {
    const user = await window.SupabaseAPI.getCurrentUser();
    if (user) {
        currentUser = user;
        isGuestMode = false;
        await loadUserDataFromCloud();
        showAuthContainer(false);
        init();
    } else {
        showAuthContainer(true);
    }
}

function showAuthContainer(show) {
    const authContainer = document.getElementById('auth-container');
    const userBar = document.getElementById('user-bar');
    
    if (show) {
        authContainer.style.display = 'flex';
        userBar.style.display = 'none';
    } else {
        authContainer.style.display = 'none';
        userBar.style.display = 'flex';
        updateUserBar();
    }
}

function updateUserBar() {
    const userNameEl = document.getElementById('user-name');
    if (isGuestMode) {
        userNameEl.textContent = '游客模式';
    } else if (currentUser) {
        userNameEl.textContent = currentUser.email || '已登录';
    }
}

function initAuthEventListeners() {
    // 登录/注册标签切换
    const loginTab = document.querySelector('.auth-tab[data-tab="login"]');
    const registerTab = document.querySelector('.auth-tab[data-tab="register"]');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginTab && registerTab && loginForm && registerForm) {
        loginTab.addEventListener('click', () => {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            loginForm.style.display = 'flex';
            registerForm.style.display = 'none';
        });
        
        registerTab.addEventListener('click', () => {
            registerTab.classList.add('active');
            loginTab.classList.remove('active');
            registerForm.style.display = 'flex';
            loginForm.style.display = 'none';
        });
    } else {
        console.error('登录界面元素未找到');
    }
    
    // 登录表单
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        showAuthMessage('登录中...', 'info');
        
        const result = await window.SupabaseAPI.signIn(email, password);
        if (result.success) {
            currentUser = result.user;
            isGuestMode = false;
            await loadUserDataFromCloud();
            showAuthContainer(false);
            init();
            showAuthMessage('登录成功！', 'success');
        } else {
            showAuthMessage(result.error, 'error');
        }
    });
    
    // 注册表单
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        
        showAuthMessage('注册中...', 'info');
        
        const result = await window.SupabaseAPI.signUp(email, password, username);
        if (result.success) {
            showAuthMessage('注册成功！请登录', 'success');
            // 切换到登录标签
            document.querySelector('.auth-tab[data-tab="login"]').click();
        } else {
            showAuthMessage(result.error, 'error');
        }
    });
    
    // 游客模式
    document.getElementById('guest-btn').addEventListener('click', () => {
        isGuestMode = true;
        currentUser = null;
        showAuthContainer(false);
        init();
    });
    
    // 退出登录
    document.getElementById('logout-btn').addEventListener('click', async () => {
        if (!isGuestMode) {
            await window.SupabaseAPI.signOut();
        }
        currentUser = null;
        isGuestMode = true;
        // 清除本地数据
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
    });
    
    // 同步按钮
    document.getElementById('sync-btn').addEventListener('click', async () => {
        if (isGuestMode) {
            alert('请先登录才能同步数据');
            return;
        }
        await syncDataToCloud();
    });
}

function showAuthMessage(message, type) {
    const messageEl = document.getElementById('auth-message');
    messageEl.textContent = message;
    messageEl.className = 'auth-message ' + type;
}

// ==================== 数据同步 ====================

async function loadUserDataFromCloud() {
    if (isGuestMode || !currentUser) return;
    
    try {
        // 同步用户数据
        const syncResult = await window.SupabaseAPI.syncUserData(currentUser.id, userData);
        if (syncResult.success && syncResult.source === 'cloud') {
            userData.todayTomatoes = syncResult.data.todayTomatoes;
            userData.totalTomatoes = syncResult.data.totalTomatoes;
            userData.gardenLevel = syncResult.data.gardenLevel;
            userData.lastFocusDate = syncResult.data.lastFocusDate;
            userData.unlockedPlants = syncResult.data.unlockedPlants;
        }
        
        // 同步植物数据
        const plantResult = await window.SupabaseAPI.syncPlantData(currentUser.id, userData.currentPlant);
        if (plantResult.success && plantResult.data) {
            if (plantResult.source === 'cloud') {
                userData.currentPlant = convertCloudPlantToLocal(plantResult.data);
            }
        }
        
        // 获取植物记录
        const recordsResult = await window.SupabaseAPI.getPlantRecords(currentUser.id);
        if (recordsResult.success) {
            userData.plantRecords = recordsResult.data.map(convertCloudRecordToLocal);
        }
        
        saveData();
        console.log('云端数据同步完成');
    } catch (error) {
        console.error('同步数据失败:', error);
    }
}

async function syncDataToCloud() {
    if (isGuestMode || !currentUser) {
        alert('请先登录');
        return;
    }
    
    try {
        // 同步用户数据
        await window.SupabaseAPI.updateUserData(currentUser.id, userData);
        
        // 同步植物数据
        if (userData.currentPlant) {
            const { data: cloudPlant } = await window.SupabaseAPI.getCurrentPlant(currentUser.id);
            if (cloudPlant) {
                await window.SupabaseAPI.updatePlant(cloudPlant.id, userData.currentPlant);
            } else {
                await window.SupabaseAPI.createPlant(currentUser.id, userData.currentPlant);
            }
        }
        
        alert('数据同步成功！');
    } catch (error) {
        console.error('同步失败:', error);
        alert('同步失败: ' + error.message);
    }
}

function convertCloudPlantToLocal(cloudPlant) {
    return {
        id: cloudPlant.plant_type_id,
        name: cloudPlant.name,
        emoji: cloudPlant.emoji,
        color: cloudPlant.color,
        minTime: PLANTS.find(p => p.id === cloudPlant.plant_type_id)?.minTime || 3,
        maxTime: PLANTS.find(p => p.id === cloudPlant.plant_type_id)?.maxTime || 8,
        bloomTime: cloudPlant.bloom_time,
        currentWater: cloudPlant.current_water,
        totalWaterNeeded: cloudPlant.total_water_needed,
        stage: cloudPlant.stage,
        focusMinutes: cloudPlant.focus_minutes,
        isBloomed: cloudPlant.is_bloomed,
        isWilted: cloudPlant.is_wilted,
        cloudId: cloudPlant.id,
        updatedAt: new Date(cloudPlant.updated_at).getTime()
    };
}

function convertCloudRecordToLocal(cloudRecord) {
    return {
        plantTypeId: cloudRecord.plant_type_id,
        name: cloudRecord.name,
        emoji: cloudRecord.emoji,
        stage: cloudRecord.stage,
        isBloomed: cloudRecord.is_bloomed,
        completedAt: new Date(cloudRecord.completed_at).getTime()
    };
}

// ==================== 修改原有函数以支持云端 ====================

const originalSaveData = saveData;
saveData = async function() {
    // 先保存到本地
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    
    // 如果已登录，自动同步到云端
    if (!isGuestMode && currentUser && isSupabaseReady) {
        try {
            await window.SupabaseAPI.updateUserData(currentUser.id, userData);
            if (userData.currentPlant && userData.currentPlant.cloudId) {
                await window.SupabaseAPI.updatePlant(userData.currentPlant.cloudId, userData.currentPlant);
            }
        } catch (error) {
            console.error('自动同步失败:', error);
        }
    }
};

const originalCompleteTimer = completeTimer;
completeTimer = async function() {
    originalCompleteTimer();
    
    // 记录番茄钟到云端
    if (!isGuestMode && currentUser && isSupabaseReady) {
        try {
            await window.SupabaseAPI.addTomatoRecord(currentUser.id, 25, userData.currentPlant?.cloudId);
        } catch (error) {
            console.error('记录番茄钟失败:', error);
        }
    }
};

const originalAddPlantRecord = addPlantRecord;
addPlantRecord = async function(record) {
    // 添加到本地
    if (!originalAddPlantRecord) {
        userData.plantRecords.unshift(record);
        saveData();
    } else {
        originalAddPlantRecord(record);
    }
    
    // 添加到云端
    if (!isGuestMode && currentUser && isSupabaseReady) {
        try {
            await window.SupabaseAPI.addPlantRecord(currentUser.id, record);
        } catch (error) {
            console.error('添加植物记录到云端失败:', error);
        }
    }
};

const originalUpdateRankingPage = updateRankingPage;
updateRankingPage = async function() {
    if (isSupabaseReady) {
        try {
            const result = await window.SupabaseAPI.getLeaderboard(20);
            if (result.success) {
                renderCloudLeaderboard(result.data);
                return;
            }
        } catch (error) {
            console.error('获取云端排行榜失败:', error);
        }
    }
    
    // 使用本地排行榜
    if (originalUpdateRankingPage) {
        originalUpdateRankingPage();
    }
};

function renderCloudLeaderboard(users) {
    const rankList = document.getElementById('rank-list');
    
    if (users.length === 0) {
        rankList.innerHTML = '<div class="empty-rank">暂无排名数据</div>';
        return;
    }
    
    rankList.innerHTML = users.map((user, index) => {
        const isTop3 = index < 3;
        const medal = isTop3 ? ['🥇', '🥈', '🥉'][index] : '';
        
        return `
            <div class="rank-item ${user.id === currentUser?.id ? 'my-item' : ''}">
                <div class="rank-position">
                    ${isTop3 ? `<span class="medal">${medal}</span>` : `<span class="rank-num">${index + 1}</span>`}
                </div>
                <div class="rank-avatar">${user.avatar_url || '👤'}</div>
                <div class="rank-info">
                    <span class="rank-name">${user.username || '用户' + user.id.slice(0, 6)}</span>
                    <span class="rank-score">${user.total_tomatoes} 个番茄 · 等级 ${user.garden_level}</span>
                </div>
                <span class="rank-plant">${user.unlocked_plants?.length > 0 ? '🌸' : '🌱'}</span>
            </div>
        `;
    }).join('');
}

// ==================== 初始化 ====================

document.addEventListener('DOMContentLoaded', () => {
    // 默认使用游客模式
    isGuestMode = true;
    currentUser = { id: 'guest_' + Date.now() };
    
    // 隐藏登录界面，直接进入应用
    const authContainer = document.getElementById('auth-container');
    if (authContainer) {
        authContainer.style.display = 'none';
    }
    
    // 初始化应用
    initSupabaseIntegration();
    init();
});

const PLANTS = [
    {
        id: 1,
        name: '多肉',
        emoji: '🌵',
        color: '#8BC34A',
        minTime: 3,
        maxTime: 8,
        description: '多肉植物耐旱易养，叶片肥厚饱满，是新手入门的最佳选择',
        tips: '多肉需要充足阳光，但要避免暴晒，浇水不宜过多'
    },
    {
        id: 2,
        name: '仙人掌',
        emoji: '🌿',
        color: '#689F38',
        minTime: 5,
        maxTime: 12,
        description: '仙人掌生命力顽强，能在干旱环境中生存，象征坚韧不拔',
        tips: '仙人掌耐旱性极强，宁可少浇水也不要浇多'
    },
    {
        id: 3,
        name: '向日葵',
        emoji: '🌻',
        color: '#FFC107',
        minTime: 4,
        maxTime: 9,
        description: '向日葵追逐阳光生长，花盘硕大明亮，代表积极向上',
        tips: '向日葵需要充足的阳光才能茁壮成长'
    },
    {
        id: 4,
        name: '薄荷',
        emoji: '🌱',
        color: '#AED581',
        minTime: 2,
        maxTime: 6,
        description: '薄荷清新芳香，可食用可驱蚊，是实用的香草植物',
        tips: '薄荷生长迅速，定期修剪可以促进分枝'
    },
    {
        id: 5,
        name: '绿萝',
        emoji: '🍃',
        color: '#4CAF50',
        minTime: 6,
        maxTime: 10,
        description: '绿萝净化空气能手，藤蔓飘逸优美，适合室内养护',
        tips: '绿萝喜湿润环境，但要避免积水'
    },
    {
        id: 6,
        name: '绣球',
        emoji: '💐',
        color: '#9C27B0',
        minTime: 7,
        maxTime: 11,
        description: '绣球花花球饱满，颜色会随土壤酸碱度变化',
        tips: '绣球花喜欢酸性土壤，可以使用专用肥料'
    },
    {
        id: 7,
        name: '铃兰',
        emoji: '🌸',
        color: '#E1BEE7',
        minTime: 3,
        maxTime: 7,
        description: '铃兰花形优雅，香气清新，是浪漫的象征',
        tips: '铃兰喜欢凉爽环境，夏季需要遮阴'
    },
    {
        id: 8,
        name: '小雏菊',
        emoji: '🌼',
        color: '#FFEB3B',
        minTime: 4,
        maxTime: 8,
        description: '小雏菊小巧可爱，花期长，代表纯洁与希望',
        tips: '小雏菊适应性强，保持土壤湿润即可'
    }
];

const QUESTIONS = [
    {
        id: 1,
        question: '多肉植物通常需要多久浇一次水？',
        options: ['每天', '每周', '每月', '每季度'],
        answer: 2,
        reward: 1,
        explanation: '多肉植物耐旱性强，通常每周浇水一次即可，夏季可适当增加频率'
    },
    {
        id: 2,
        question: '向日葵的花盘会随着什么转动？',
        options: ['月亮', '太阳', '星星', '风向'],
        answer: 1,
        reward: 1,
        explanation: '向日葵具有向阳性，花盘会随着太阳的移动而转动'
    },
    {
        id: 3,
        question: '薄荷属于什么科植物？',
        options: ['菊科', '唇形科', '蔷薇科', '豆科'],
        answer: 1,
        reward: 1,
        explanation: '薄荷属于唇形科薄荷属植物'
    },
    {
        id: 4,
        question: '绿萝原产于哪个地区？',
        options: ['非洲', '南美洲', '亚洲', '欧洲'],
        answer: 1,
        reward: 1,
        explanation: '绿萝原产于南美洲的热带雨林地区'
    },
    {
        id: 5,
        question: '仙人掌主要生长在什么环境？',
        options: ['热带雨林', '沙漠', '草原', '海边'],
        answer: 1,
        reward: 1,
        explanation: '仙人掌主要生长在沙漠等干旱环境中'
    },
    {
        id: 6,
        question: '铃兰的花语是什么？',
        options: ['勇敢', '幸福归来', '永恒', '纯洁'],
        answer: 1,
        reward: 1,
        explanation: '铃兰的花语是"幸福归来"，代表幸福、吉祥'
    },
    {
        id: 7,
        question: '绣球花的颜色会受什么影响？',
        options: ['土壤酸碱度', '温度', '光照', '水分'],
        answer: 0,
        reward: 1,
        explanation: '绣球花的颜色会随土壤酸碱度变化，酸性土壤开蓝色花，碱性土壤开粉色花'
    },
    {
        id: 8,
        question: '小雏菊象征着什么？',
        options: ['爱情', '快乐', '希望', '友谊'],
        answer: 2,
        reward: 1,
        explanation: '小雏菊象征着希望、纯洁和美好'
    }
];

const PLANT_STAGES = ['种子', '幼苗', '成株', '开花'];

const STORAGE_KEY = 'desktopGarden_data';

let userData = {
    todayTomatoes: 0,
    totalTomatoes: 0,
    currentPlant: null,
    gardenLevel: 1,
    unlockedPlants: [],
    plantRecords: [],
    lastFocusDate: ''
};

let timerState = {
    isRunning: false,
    isPaused: false,
    mode: 'focus',
    timeLeft: 25 * 60,
    totalTime: 25 * 60,
    interval: null
};

let waterGameState = {
    isRunning: false,
    score: 0,
    timeLeft: 30,
    interval: null,
    targetPosition: { x: 0, y: 0 }
};

let currentQuestion = null;
let currentFilter = 'all';
let currentRankTab = 'tomatoes';

function init() {
    console.log('=== 开始初始化 ===');
    
    loadData();
    checkNewDay();
    initCurrentPlant();
    updateUI();
    initEventListeners();
    
    console.log('=== 初始化完成 ===');
}

function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        userData = JSON.parse(saved);
    }
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
}

function checkNewDay() {
    const today = new Date().toDateString();
    if (userData.lastFocusDate !== today) {
        userData.todayTomatoes = 0;
        userData.lastFocusDate = today;
        saveData();
    }
}

function initCurrentPlant() {
    if (!userData.currentPlant) {
        userData.currentPlant = createNewPlant();
        saveData();
    }
}

function createNewPlant() {
    const plant = PLANTS[Math.floor(Math.random() * PLANTS.length)];
    const bloomTime = Math.floor(Math.random() * (plant.maxTime - plant.minTime + 1)) + plant.minTime;
    
    return {
        ...plant,
        bloomTime,
        currentWater: 0,
        totalWaterNeeded: 4,
        stage: 0,
        focusMinutes: 0,
        isBloomed: false,
        isWilted: false,
        createdAt: Date.now()
    };
}

function updateUI() {
    updateStats();
    updateTimerDisplay();
    updatePlantPet();
    updateGardenPage();
    updateCollectionPage();
    updateRankingPage();
}

function updateStats() {
    document.getElementById('today-tomatoes').textContent = userData.todayTomatoes;
    document.getElementById('total-tomatoes').textContent = userData.totalTomatoes;
    document.getElementById('garden-level').textContent = userData.gardenLevel;
    document.getElementById('garden-total-tomatoes').textContent = userData.totalTomatoes;
    document.getElementById('unlocked-count').textContent = userData.unlockedPlants.length;
    document.getElementById('garden-level-display').textContent = userData.gardenLevel;
}

function updateTimerDisplay() {
    const minutes = Math.floor(timerState.timeLeft / 60);
    const seconds = timerState.timeLeft % 60;
    const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    document.getElementById('timer-time').textContent = timeStr;
    
    const progress = ((timerState.totalTime - timerState.timeLeft) / timerState.totalTime) * 100;
    document.getElementById('timer-progress').style.background = 
        `conic-gradient(#4CAF50 ${progress}%, #e0e0e0 ${progress}%, #e0e0e0 100%)`;
    
    const modeText = {
        'focus': '专注模式',
        'shortBreak': '短休息',
        'longBreak': '长休息'
    };
    document.getElementById('timer-mode').textContent = modeText[timerState.mode];
}

function updatePlantPet() {
    const plant = userData.currentPlant;
    if (!plant) {
        document.getElementById('current-plant-emoji').textContent = '🌱';
        document.getElementById('plant-message').textContent = '开始专注吧！';
        return;
    }
    
    document.getElementById('current-plant-emoji').textContent = plant.emoji;
    
    const messages = {
        0: '我是小种子，快让我长大吧！',
        1: '我已经发芽啦，继续努力！',
        2: '我长高了，快开花啦！',
        3: '我开花啦，太美了！'
    };
    
    if (plant.isWilted) {
        document.getElementById('plant-message').textContent = '我枯萎了...重新种植吧';
    } else if (plant.isBloomed) {
        document.getElementById('plant-message').textContent = '我开花啦！';
    } else {
        document.getElementById('plant-message').textContent = messages[plant.stage] || '加油！';
    }
}

function updateGardenPage() {
    const plant = userData.currentPlant;
    if (!plant) return;
    
    document.getElementById('garden-plant-emoji').textContent = plant.emoji;
    document.getElementById('garden-plant-name').textContent = plant.name;
    document.getElementById('garden-plant-stage').textContent = PLANT_STAGES[plant.stage];
    
    const growthProgress = (plant.currentWater / plant.totalWaterNeeded) * 100;
    document.getElementById('growth-progress').style.width = `${growthProgress}%`;
    document.getElementById('growth-text').textContent = `${plant.currentWater} / ${plant.totalWaterNeeded} 次浇水`;
    
    const minutes = Math.floor(plant.focusMinutes / 60);
    const bloomProgress = Math.min((minutes / plant.bloomTime) * 100, 100);
    document.getElementById('bloom-progress').style.width = `${bloomProgress}%`;
    document.getElementById('bloom-text').textContent = `${minutes} / ${plant.bloomTime} 分钟`;
    
    const statusGrowing = document.getElementById('status-growing');
    const statusBloomed = document.getElementById('status-bloomed');
    
    if (plant.isWilted) {
        statusGrowing.classList.remove('active');
        statusGrowing.querySelector('.status-text').textContent = '已枯萎';
        statusBloomed.classList.remove('active');
    } else {
        statusGrowing.classList.add('active');
        statusGrowing.querySelector('.status-text').textContent = '生长中';
        
        if (plant.isBloomed) {
            statusBloomed.classList.add('active');
            statusBloomed.querySelector('.status-text').textContent = '已开花';
        } else {
            statusBloomed.classList.remove('active');
            statusBloomed.querySelector('.status-text').textContent = '未开花';
        }
    }
    
    const newPlantBtn = document.getElementById('btn-new-plant');
    if (plant.isWilted) {
        newPlantBtn.style.display = 'block';
    } else {
        newPlantBtn.style.display = 'none';
    }
    
    updateHistoryList();
}

function updateHistoryList() {
    const historyList = document.getElementById('history-list');
    
    if (userData.plantRecords.length === 0) {
        historyList.innerHTML = '<div class="empty-history">暂无培育记录</div>';
        return;
    }
    
    historyList.innerHTML = userData.plantRecords.map(record => `
        <div class="history-item">
            <span class="history-emoji">${record.emoji}</span>
            <div class="history-info">
                <span class="history-name">${record.name}</span>
                <span class="history-stage">成长至 ${PLANT_STAGES[record.stage]}</span>
                <span class="history-date">${new Date(record.createdAt).toLocaleDateString()}</span>
            </div>
            <span class="history-status ${record.isBloomed ? 'bloomed' : ''}">${record.isBloomed ? '🌸' : '🌿'}</span>
        </div>
    `).join('');
}

function updateCollectionPage() {
    document.getElementById('collected-count').textContent = userData.unlockedPlants.length;
    document.getElementById('total-plants').textContent = PLANTS.length;
    
    const progress = (userData.unlockedPlants.length / PLANTS.length) * 100;
    document.getElementById('collection-progress-bar').style.width = `${progress}%`;
    
    const plantGrid = document.getElementById('plant-grid');
    
    let filteredPlants = PLANTS;
    if (currentFilter === 'unlocked') {
        filteredPlants = PLANTS.filter(p => userData.unlockedPlants.includes(p.id));
    } else if (currentFilter === 'locked') {
        filteredPlants = PLANTS.filter(p => !userData.unlockedPlants.includes(p.id));
    }
    
    plantGrid.innerHTML = filteredPlants.map(plant => {
        const isUnlocked = userData.unlockedPlants.includes(plant.id);
        const currentPlant = userData.currentPlant;
        const isCurrent = currentPlant && currentPlant.id === plant.id && currentPlant.isBloomed;
        
        return `
            <div class="plant-card ${!isUnlocked ? 'locked' : ''} ${isCurrent ? 'bloomed' : ''}" data-plant-id="${plant.id}">
                <div class="plant-emoji">${isUnlocked ? plant.emoji : '❓'}</div>
                <span class="plant-name">${isUnlocked ? plant.name : '???'}</span>
                ${isUnlocked ? `
                    <div class="plant-info">
                        <span class="bloom-time">开花时间: ${plant.minTime}-${plant.maxTime}分钟</span>
                    </div>
                ` : '<div class="lock-icon">🔒</div>'}
            </div>
        `;
    }).join('');
}

function updateRankingPage() {
    const mockUsers = [
        { name: '小明', avatar: '👦', score: { tomatoes: 8, plants: 6, level: 5 }, plant: '🌻', level: 5 },
        { name: '小红', avatar: '👧', score: { tomatoes: 6, plants: 5, level: 4 }, plant: '🌸', level: 4 },
        { name: '阿华', avatar: '👨', score: { tomatoes: 5, plants: 4, level: 3 }, plant: '🌿', level: 3 },
        { name: '小美', avatar: '👩', score: { tomatoes: 4, plants: 3, level: 3 }, plant: '🌱', level: 3 },
        { name: '大壮', avatar: '🧑', score: { tomatoes: 3, plants: 2, level: 2 }, plant: '🌵', level: 2 },
        { name: '小花', avatar: '👧', score: { tomatoes: 2, plants: 2, level: 2 }, plant: '🌼', level: 2 },
        { name: '老王', avatar: '👴', score: { tomatoes: 1, plants: 1, level: 1 }, plant: '🍃', level: 1 }
    ];
    
    const allUsers = [...mockUsers, { 
        name: '我', 
        avatar: '👤', 
        score: { 
            tomatoes: userData.todayTomatoes, 
            plants: userData.unlockedPlants.length, 
            level: userData.gardenLevel 
        }, 
        plant: userData.currentPlant ? userData.currentPlant.emoji : '🌱',
        level: userData.gardenLevel,
        isMe: true
    }];
    
    allUsers.sort((a, b) => b.score[currentRankTab] - a.score[currentRankTab]);
    
    const myRank = allUsers.findIndex(u => u.isMe) + 1;
    document.getElementById('my-rank-number').textContent = myRank;
    
    const myScore = allUsers.find(u => u.isMe).score[currentRankTab];
    const scoreUnits = { tomatoes: '个番茄', plants: '株植物', level: '级' };
    document.getElementById('my-score').textContent = `${myScore} ${scoreUnits[currentRankTab]}`;
    document.getElementById('my-level-display').textContent = userData.gardenLevel;
    
    const rankingList = document.getElementById('ranking-list');
    rankingList.innerHTML = allUsers.map((user, index) => `
        <div class="rank-item ${index < 3 ? 'top' : ''} ${user.isMe ? 'my-item' : ''}">
            <div class="rank-position">
                ${index === 0 ? '<span class="medal">🥇</span>' : 
                  index === 1 ? '<span class="medal">🥈</span>' : 
                  index === 2 ? '<span class="medal">🥉</span>' : 
                  `<span class="rank-num">${index + 1}</span>`}
            </div>
            <div class="rank-avatar">
                <span class="avatar-emoji">${user.avatar}</span>
            </div>
            <div class="rank-info">
                <span class="rank-name">${user.name}</span>
                <span class="rank-score">${user.score[currentRankTab]} ${scoreUnits[currentRankTab]}</span>
            </div>
            <div class="rank-plant">${user.plant}</div>
            <div class="rank-level">Lv.${user.level}</div>
        </div>
    `).join('');
}

function initEventListeners() {
    console.log('=== 开始绑定事件监听器 ===');
    
    const tabs = document.querySelectorAll('.tab-item[data-tab]');
    console.log('找到标签数量:', tabs.length);
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            console.log('点击标签:', tab.dataset.tab);
            switchTab(tab.dataset.tab);
        });
    });
    
    const btnStart = document.getElementById('btn-start');
    console.log('btn-start 元素:', btnStart);
    if (btnStart) {
        btnStart.addEventListener('click', () => {
            console.log('点击开始按钮');
            startTimer();
        });
    }
    
    document.getElementById('btn-start').addEventListener('click', startTimer);
    document.getElementById('btn-pause').addEventListener('click', pauseTimer);
    document.getElementById('btn-abort').addEventListener('click', abortTimer);
    
    document.getElementById('btn-water-game').addEventListener('click', () => {
        document.getElementById('water-modal').style.display = 'flex';
    });
    
    document.getElementById('water-modal-close').addEventListener('click', () => {
        document.getElementById('water-modal').style.display = 'none';
        stopWaterGame();
    });
    
    document.getElementById('btn-start-water-game').addEventListener('click', startWaterGame);
    
    document.getElementById('btn-qa').addEventListener('click', () => {
        document.getElementById('qa-modal').style.display = 'flex';
        loadQuestion();
    });
    
    document.getElementById('qa-modal-close').addEventListener('click', () => {
        document.getElementById('qa-modal').style.display = 'none';
    });
    
    document.getElementById('btn-next-question').addEventListener('click', loadQuestion);
    
    document.getElementById('plant-detail-close').addEventListener('click', () => {
        document.getElementById('plant-detail-modal').style.display = 'none';
    });
    
    document.getElementById('btn-new-plant').addEventListener('click', startNewPlant);
    
    document.querySelectorAll('.filter-item').forEach(filter => {
        filter.addEventListener('click', () => {
            document.querySelectorAll('.filter-item').forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
            currentFilter = filter.dataset.filter;
            updateCollectionPage();
        });
    });
    
    document.querySelectorAll('.tab-item[data-rank-tab]').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab-item[data-rank-tab]').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentRankTab = tab.dataset.rankTab;
            updateRankingPage();
        });
    });
    
    document.getElementById('plant-grid').addEventListener('click', (e) => {
        const card = e.target.closest('.plant-card');
        if (card) {
            const plantId = parseInt(card.dataset.plantId);
            showPlantDetail(plantId);
        }
    });
    
    document.getElementById('game-area').addEventListener('click', (e) => {
        if (e.target.classList.contains('water-target')) {
            handleWaterTargetClick();
        }
    });
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-item[data-tab]').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`.tab-item[data-tab="${tabName}"]`).classList.add('active');
    
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });
    document.getElementById(`page-${tabName}`).style.display = 'block';
    
    if (tabName === 'garden') {
        updateGardenPage();
    } else if (tabName === 'collection') {
        updateCollectionPage();
    } else if (tabName === 'ranking') {
        updateRankingPage();
    }
}

function startTimer() {
    if (timerState.isRunning) return;
    
    timerState.isRunning = true;
    timerState.isPaused = false;
    
    document.getElementById('btn-start').style.display = 'none';
    document.getElementById('btn-pause').style.display = 'block';
    document.getElementById('btn-abort').style.display = 'block';
    
    timerState.interval = setInterval(() => {
        if (timerState.timeLeft > 0) {
            timerState.timeLeft--;
            updateTimerDisplay();
            
            if (userData.currentPlant && !userData.currentPlant.isWilted) {
                userData.currentPlant.focusMinutes++;
                saveData();
            }
        } else {
            completeTimer();
        }
    }, 1000);
}

function pauseTimer() {
    if (!timerState.isRunning) return;
    
    timerState.isPaused = !timerState.isPaused;
    
    if (timerState.isPaused) {
        clearInterval(timerState.interval);
        document.getElementById('btn-pause').textContent = '继续';
    } else {
        timerState.interval = setInterval(() => {
            if (timerState.timeLeft > 0) {
                timerState.timeLeft--;
                updateTimerDisplay();
                
                if (userData.currentPlant && !userData.currentPlant.isWilted) {
                    userData.currentPlant.focusMinutes++;
                    saveData();
                }
            } else {
                completeTimer();
            }
        }, 1000);
        document.getElementById('btn-pause').textContent = '暂停';
    }
}

function abortTimer() {
    if (!timerState.isRunning) return;
    
    clearInterval(timerState.interval);
    timerState.isRunning = false;
    timerState.isPaused = false;
    
    if (userData.currentPlant) {
        userData.currentPlant.isWilted = true;
        saveData();
    }
    
    resetTimerUI();
    updateUI();
    
    alert('植物已枯萎，重新开始培育吧！');
}

function completeTimer() {
    clearInterval(timerState.interval);
    timerState.isRunning = false;
    timerState.isPaused = false;
    
    userData.todayTomatoes++;
    userData.totalTomatoes++;
    userData.lastFocusDate = new Date().toDateString();
    
    if (userData.currentPlant && !userData.currentPlant.isWilted) {
        waterPlant();
    }
    
    updateGardenLevel();
    saveData();
    
    resetTimerUI();
    updateUI();
    
    alert('🎉 专注完成！植物浇水一次！');
}

function waterPlant() {
    const plant = userData.currentPlant;
    if (!plant || plant.isWilted) return;
    
    plant.currentWater++;
    
    if (plant.currentWater >= plant.totalWaterNeeded) {
        plant.stage = Math.min(plant.stage + 1, 3);
        plant.currentWater = 0;
        
        if (plant.stage === 3 && !plant.isBloomed) {
            tryBloomPlant();
        }
    }
    
    if (!userData.unlockedPlants.includes(plant.id)) {
        userData.unlockedPlants.push(plant.id);
    }
}

function tryBloomPlant() {
    const plant = userData.currentPlant;
    const minutes = Math.floor(plant.focusMinutes / 60);
    
    if (minutes >= plant.bloomTime) {
        if (Math.random() < 0.5) {
            plant.isBloomed = true;
            
            if (userData.plantRecords.length > 0) {
                userData.plantRecords[0] = { ...plant };
            } else {
                userData.plantRecords.unshift({ ...plant });
            }
        }
    }
}

function updateGardenLevel() {
    const newLevel = Math.floor(userData.totalTomatoes / 10) + 1;
    if (newLevel > userData.gardenLevel) {
        userData.gardenLevel = newLevel;
    }
}

function resetTimerUI() {
    document.getElementById('btn-start').style.display = 'block';
    document.getElementById('btn-pause').style.display = 'none';
    document.getElementById('btn-abort').style.display = 'none';
    document.getElementById('btn-pause').textContent = '暂停';
    
    timerState.timeLeft = 25 * 60;
    timerState.totalTime = 25 * 60;
    timerState.mode = 'focus';
    updateTimerDisplay();
}

function startWaterGame() {
    if (waterGameState.isRunning) return;
    
    waterGameState.isRunning = true;
    waterGameState.score = 0;
    waterGameState.timeLeft = 30;
    
    document.getElementById('water-score').textContent = '0';
    document.getElementById('water-time').textContent = '30';
    document.getElementById('btn-start-water-game').style.display = 'none';
    
    moveWaterTarget();
    
    waterGameState.interval = setInterval(() => {
        waterGameState.timeLeft--;
        document.getElementById('water-time').textContent = waterGameState.timeLeft;
        
        if (waterGameState.timeLeft <= 0) {
            stopWaterGame();
            alert(`游戏结束！得分：${waterGameState.score}`);
        }
    }, 1000);
}

function stopWaterGame() {
    waterGameState.isRunning = false;
    clearInterval(waterGameState.interval);
    document.getElementById('btn-start-water-game').style.display = 'block';
}

function moveWaterTarget() {
    if (!waterGameState.isRunning) return;
    
    const gameArea = document.getElementById('game-area');
    const maxX = gameArea.offsetWidth - 60;
    const maxY = gameArea.offsetHeight - 60;
    
    waterGameState.targetPosition.x = Math.random() * maxX;
    waterGameState.targetPosition.y = Math.random() * maxY;
    
    const target = document.getElementById('water-target');
    target.style.left = `${waterGameState.targetPosition.x}px`;
    target.style.top = `${waterGameState.targetPosition.y}px`;
}

function handleWaterTargetClick() {
    if (!waterGameState.isRunning) return;
    
    waterGameState.score += 10;
    document.getElementById('water-score').textContent = waterGameState.score;
    
    if (userData.currentPlant && !userData.currentPlant.isWilted) {
        userData.currentPlant.focusMinutes += 300;
        saveData();
        updateGardenPage();
        updatePlantPet();
        showGameReward();
    }
    
    moveWaterTarget();
}

function loadQuestion() {
    currentQuestion = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
    
    document.getElementById('question-text').textContent = currentQuestion.question;
    document.getElementById('question-result').style.display = 'none';
    
    const optionsList = document.getElementById('options-list');
    optionsList.innerHTML = currentQuestion.options.map((option, index) => `
        <button class="option-btn" data-answer="${index}">${option}</button>
    `).join('');
    
    optionsList.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => handleAnswer(parseInt(btn.dataset.answer)));
    });
}

function handleAnswer(selectedAnswer) {
    const optionsList = document.getElementById('options-list');
    const buttons = optionsList.querySelectorAll('.option-btn');
    
    buttons.forEach(btn => {
        btn.disabled = true;
        const answer = parseInt(btn.dataset.answer);
        
        if (answer === currentQuestion.answer) {
            btn.classList.add('correct');
        } else if (answer === selectedAnswer) {
            btn.classList.add('wrong');
        }
    });
    
    const resultDiv = document.getElementById('question-result');
    const resultText = document.getElementById('result-text');
    const resultExplanation = document.getElementById('result-explanation');
    
    if (selectedAnswer === currentQuestion.answer) {
        resultText.textContent = '✅ 回答正确！';
        resultText.style.color = '#4CAF50';
        
        if (userData.currentPlant && !userData.currentPlant.isWilted) {
            userData.currentPlant.focusMinutes += 60;
            saveData();
            updateGardenPage();
            updatePlantPet();
        }
    } else {
        resultText.textContent = '❌ 回答错误';
        resultText.style.color = '#f44336';
    }
    
    resultExplanation.textContent = currentQuestion.explanation;
    resultDiv.style.display = 'block';
}

function showGameReward() {
    const rewardToast = document.createElement('div');
    rewardToast.className = 'reward-toast';
    rewardToast.textContent = '💧 +5分钟专注时长！';
    document.body.appendChild(rewardToast);
    
    setTimeout(() => {
        rewardToast.remove();
    }, 2000);
}

function showPlantDetail(plantId) {
    const plant = PLANTS.find(p => p.id === plantId);
    if (!plant) return;
    
    const isUnlocked = userData.unlockedPlants.includes(plantId);
    
    if (!isUnlocked) {
        alert('完成专注解锁更多植物');
        return;
    }
    
    document.getElementById('detail-emoji').textContent = plant.emoji;
    document.getElementById('detail-name').textContent = plant.name;
    document.getElementById('detail-bloom-time').textContent = `${plant.minTime}-${plant.maxTime} 分钟`;
    document.getElementById('detail-description').textContent = plant.description;
    document.getElementById('detail-tips').textContent = plant.tips;
    
    document.getElementById('plant-detail-modal').style.display = 'flex';
}

function startNewPlant() {
    if (userData.currentPlant && !userData.currentPlant.isWilted) {
        userData.plantRecords.unshift({ ...userData.currentPlant });
    }
    
    userData.currentPlant = createNewPlant();
    saveData();
    updateUI();
    
    alert('🌱 种下了一颗新种子！');
}

document.addEventListener('DOMContentLoaded', init);
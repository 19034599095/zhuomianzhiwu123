// Supabase 配置
const SUPABASE_URL =https://nsbsxcecjsgydihmzgnw.supabase.co/rest/v1/
const SUPABASE_ANON_KEY =eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zYnN4Y2VjanNneWRpaG16Z253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMzk3MzMsImV4cCI6MjA5MzYxNTczM30.yXyWG4xoyvl7Yuc1oEKetSt8CGL35Ntw2EpXCiotojk

// 初始化 Supabase 客户端
let supabase = null;

function initSupabase() {
    if (typeof window.supabase !== 'undefined') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase 初始化成功');
        return true;
    }
    console.error('Supabase 库未加载');
    return false;
}

// ==================== 用户认证 ====================

async function signUp(email, password, username) {
    try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password
        });
        
        if (authError) throw authError;
        
        // 创建用户记录
        const { error: userError } = await supabase
            .from('users')
            .insert([{
                id: authData.user.id,
                email,
                username,
                created_at: new Date().toISOString()
            }]);
        
        if (userError) throw userError;
        
        return { success: true, user: authData.user };
    } catch (error) {
        console.error('注册失败:', error);
        return { success: false, error: error.message };
    }
}

async function signIn(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        
        return { success: true, user: data.user, session: data.session };
    } catch (error) {
        console.error('登录失败:', error);
        return { success: false, error: error.message };
    }
}

async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('登出失败:', error);
        return { success: false, error: error.message };
    }
}

async function getCurrentUser() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return user;
    } catch (error) {
        console.error('获取当前用户失败:', error);
        return null;
    }
}

// ==================== 用户数据操作 ====================

async function getUserData(userId) {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('获取用户数据失败:', error);
        return { success: false, error: error.message };
    }
}

async function updateUserData(userId, userData) {
    try {
        const { data, error } = await supabase
            .from('users')
            .update({
                today_tomatoes: userData.todayTomatoes,
                total_tomatoes: userData.totalTomatoes,
                garden_level: userData.gardenLevel,
                last_focus_date: userData.lastFocusDate,
                unlocked_plants: userData.unlockedPlants,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('更新用户数据失败:', error);
        return { success: false, error: error.message };
    }
}

// ==================== 植物数据操作 ====================

async function getCurrentPlant(userId) {
    try {
        const { data, error } = await supabase
            .from('plants')
            .select('*')
            .eq('user_id', userId)
            .eq('is_wilted', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
        return { success: true, data };
    } catch (error) {
        console.error('获取当前植物失败:', error);
        return { success: false, error: error.message };
    }
}

async function createPlant(userId, plantData) {
    try {
        const { data, error } = await supabase
            .from('plants')
            .insert([{
                user_id: userId,
                plant_type_id: plantData.id,
                name: plantData.name,
                emoji: plantData.emoji,
                color: plantData.color,
                bloom_time: plantData.bloomTime,
                current_water: plantData.currentWater || 0,
                total_water_needed: plantData.totalWaterNeeded || 4,
                stage: plantData.stage || 0,
                focus_minutes: plantData.focusMinutes || 0,
                is_bloomed: plantData.isBloomed || false,
                is_wilted: plantData.isWilted || false
            }])
            .select()
            .single();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('创建植物失败:', error);
        return { success: false, error: error.message };
    }
}

async function updatePlant(plantId, plantData) {
    try {
        const { data, error } = await supabase
            .from('plants')
            .update({
                current_water: plantData.currentWater,
                stage: plantData.stage,
                focus_minutes: plantData.focusMinutes,
                is_bloomed: plantData.isBloomed,
                is_wilted: plantData.isWilted,
                updated_at: new Date().toISOString()
            })
            .eq('id', plantId)
            .select();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('更新植物失败:', error);
        return { success: false, error: error.message };
    }
}

// ==================== 植物记录操作 ====================

async function getPlantRecords(userId) {
    try {
        const { data, error } = await supabase
            .from('plant_records')
            .select('*')
            .eq('user_id', userId)
            .order('completed_at', { ascending: false });
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('获取植物记录失败:', error);
        return { success: false, error: error.message };
    }
}

async function addPlantRecord(userId, record) {
    try {
        const { data, error } = await supabase
            .from('plant_records')
            .insert([{
                user_id: userId,
                plant_type_id: record.plantTypeId,
                name: record.name,
                emoji: record.emoji,
                stage: record.stage,
                is_bloomed: record.isBloomed
            }])
            .select();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('添加植物记录失败:', error);
        return { success: false, error: error.message };
    }
}

// ==================== 番茄钟记录操作 ====================

async function addTomatoRecord(userId, duration, plantId = null) {
    try {
        const { data, error } = await supabase
            .from('tomato_records')
            .insert([{
                user_id: userId,
                duration,
                plant_id: plantId
            }])
            .select();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('添加番茄记录失败:', error);
        return { success: false, error: error.message };
    }
}

// ==================== 排行榜 ====================

async function getLeaderboard(limit = 20) {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, username, avatar_url, total_tomatoes, garden_level, unlocked_plants')
            .order('total_tomatoes', { ascending: false })
            .limit(limit);
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('获取排行榜失败:', error);
        return { success: false, error: error.message };
    }
}

// ==================== 数据同步 ====================

async function syncUserData(userId, localData) {
    try {
        // 获取云端数据
        const { data: cloudData } = await getUserData(userId);
        
        if (!cloudData) {
            // 云端没有数据，上传本地数据
            await updateUserData(userId, localData);
            return { success: true, data: localData, source: 'local' };
        }
        
        // 比较时间戳，使用最新的数据
        const cloudDate = new Date(cloudData.last_focus_date);
        const localDate = new Date(localData.lastFocusDate);
        
        if (cloudDate > localDate) {
            // 云端数据更新
            return { 
                success: true, 
                data: {
                    todayTomatoes: cloudData.today_tomatoes,
                    totalTomatoes: cloudData.total_tomatoes,
                    gardenLevel: cloudData.garden_level,
                    lastFocusDate: cloudData.last_focus_date,
                    unlockedPlants: cloudData.unlocked_plants
                },
                source: 'cloud'
            };
        } else {
            // 本地数据更新，上传到云端
            await updateUserData(userId, localData);
            return { success: true, data: localData, source: 'local' };
        }
    } catch (error) {
        console.error('数据同步失败:', error);
        return { success: false, error: error.message };
    }
}

async function syncPlantData(userId, localPlant) {
    try {
        const { data: cloudPlant } = await getCurrentPlant(userId);
        
        if (!cloudPlant) {
            // 云端没有植物，创建新植物
            if (localPlant) {
                const { data } = await createPlant(userId, localPlant);
                return { success: true, data, source: 'local' };
            }
            return { success: true, data: null };
        }
        
        if (!localPlant) {
            // 本地没有植物，使用云端数据
            return { success: true, data: cloudPlant, source: 'cloud' };
        }
        
        // 比较更新时间，使用最新的
        const cloudTime = new Date(cloudPlant.updated_at).getTime();
        const localTime = localPlant.updatedAt || 0;
        
        if (cloudTime > localTime) {
            return { success: true, data: cloudPlant, source: 'cloud' };
        } else {
            await updatePlant(cloudPlant.id, localPlant);
            return { success: true, data: localPlant, source: 'local' };
        }
    } catch (error) {
        console.error('植物数据同步失败:', error);
        return { success: false, error: error.message };
    }
}

// 导出函数
window.SupabaseAPI = {
    initSupabase,
    signUp,
    signIn,
    signOut,
    getCurrentUser,
    getUserData,
    updateUserData,
    getCurrentPlant,
    createPlant,
    updatePlant,
    getPlantRecords,
    addPlantRecord,
    addTomatoRecord,
    getLeaderboard,
    syncUserData,
    syncPlantData
};

-- Supabase 数据库表结构
-- 桌面小花园番茄钟小程序

-- 启用 RLS (Row Level Security)
alter table if exists public.users enable row level security;
alter table if exists public.plants enable row level security;
alter table if exists public.plant_records enable row level security;

-- 用户表
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    username VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    today_tomatoes INTEGER DEFAULT 0,
    total_tomatoes INTEGER DEFAULT 0,
    garden_level INTEGER DEFAULT 1,
    last_focus_date DATE DEFAULT CURRENT_DATE,
    unlocked_plants INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    auth_provider VARCHAR(50) DEFAULT 'email'
);

-- 当前植物表
CREATE TABLE IF NOT EXISTS public.plants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    plant_type_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    color VARCHAR(20) NOT NULL,
    bloom_time INTEGER NOT NULL,
    current_water INTEGER DEFAULT 0,
    total_water_needed INTEGER DEFAULT 4,
    stage INTEGER DEFAULT 0,
    focus_minutes INTEGER DEFAULT 0,
    is_bloomed BOOLEAN DEFAULT FALSE,
    is_wilted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 植物培育记录表
CREATE TABLE IF NOT EXISTS public.plant_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    plant_type_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    stage INTEGER NOT NULL,
    is_bloomed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 番茄钟记录表
CREATE TABLE IF NOT EXISTS public.tomato_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    duration INTEGER NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    plant_id UUID REFERENCES public.plants(id) ON DELETE SET NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_plants_user_id ON public.plants(user_id);
CREATE INDEX IF NOT EXISTS idx_plant_records_user_id ON public.plant_records(user_id);
CREATE INDEX IF NOT EXISTS idx_tomato_records_user_id ON public.tomato_records(user_id);
CREATE INDEX IF NOT EXISTS idx_users_total_tomatoes ON public.users(total_tomatoes DESC);

-- RLS 策略

-- Users 表策略
CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Plants 表策略
CREATE POLICY "Users can view own plants" ON public.plants
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plants" ON public.plants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plants" ON public.plants
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plants" ON public.plants
    FOR DELETE USING (auth.uid() = user_id);

-- Plant records 表策略
CREATE POLICY "Users can view own records" ON public.plant_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own records" ON public.plant_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Tomato records 表策略
CREATE POLICY "Users can view own tomato records" ON public.tomato_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tomato records" ON public.tomato_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 触发器：自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plants_updated_at BEFORE UPDATE ON public.plants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create deployed_apps table
CREATE TABLE IF NOT EXISTS deployed_apps (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    app_name VARCHAR(255) NOT NULL,
    app_url VARCHAR(500) NOT NULL UNIQUE,
    api_base_url VARCHAR(500) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    status VARCHAR(50) DEFAULT 'processing' CHECK (status IN ('processing', 'deployed', 'failed', 'deleted')),
    framework VARCHAR(50), -- 'react', 'vue', 'angular', 'vanilla'
    build_command VARCHAR(255),
    start_command VARCHAR(255),
    environment_variables JSONB DEFAULT '{}',
    custom_domain VARCHAR(255),
    ssl_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deployed_at TIMESTAMP WITH TIME ZONE,
    last_accessed_at TIMESTAMP WITH TIME ZONE
);

-- Create app_analytics table for tracking usage
CREATE TABLE IF NOT EXISTS app_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    app_id UUID NOT NULL REFERENCES deployed_apps(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL, -- 'page_view', 'api_call', 'error', 'deployment'
    event_data JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create app_settings table for user preferences
CREATE TABLE IF NOT EXISTS app_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    auto_deploy BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    custom_domains_enabled BOOLEAN DEFAULT false,
    max_apps INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create api_usage table for tracking API calls
CREATE TABLE IF NOT EXISTS api_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    app_id UUID NOT NULL REFERENCES deployed_apps(id) ON DELETE CASCADE,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER NOT NULL,
    response_time_ms INTEGER,
    request_size_bytes INTEGER,
    response_size_bytes INTEGER,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_deployed_apps_user_id ON deployed_apps(user_id);
CREATE INDEX IF NOT EXISTS idx_deployed_apps_status ON deployed_apps(status);
CREATE INDEX IF NOT EXISTS idx_deployed_apps_created_at ON deployed_apps(created_at);
CREATE INDEX IF NOT EXISTS idx_app_analytics_app_id ON app_analytics(app_id);
CREATE INDEX IF NOT EXISTS idx_app_analytics_created_at ON app_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_app_id ON api_usage(app_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON api_usage(created_at);

-- Drop triggers first (they depend on the function)
DROP TRIGGER IF EXISTS update_deployed_apps_updated_at ON deployed_apps;
DROP TRIGGER IF EXISTS update_app_settings_updated_at ON app_settings;

-- Create updated_at trigger function (drop first if exists)
DROP FUNCTION IF EXISTS update_updated_at_column();
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_deployed_apps_updated_at 
    BEFORE UPDATE ON deployed_apps 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at 
    BEFORE UPDATE ON app_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RLS (Row Level Security) policies
ALTER TABLE deployed_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Policy for deployed_apps - users can only see their own apps (drop first if exists)
DROP POLICY IF EXISTS "Users can view their own apps" ON deployed_apps;
DROP POLICY IF EXISTS "Users can insert their own apps" ON deployed_apps;
DROP POLICY IF EXISTS "Users can update their own apps" ON deployed_apps;
DROP POLICY IF EXISTS "Users can delete their own apps" ON deployed_apps;

CREATE POLICY "Users can view their own apps" ON deployed_apps
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own apps" ON deployed_apps
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own apps" ON deployed_apps
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own apps" ON deployed_apps
    FOR DELETE USING (auth.uid() = user_id);

-- Policy for app_analytics - users can only see analytics for their apps (drop first if exists)
DROP POLICY IF EXISTS "Users can view analytics for their apps" ON app_analytics;
DROP POLICY IF EXISTS "System can insert analytics" ON app_analytics;

CREATE POLICY "Users can view analytics for their apps" ON app_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM deployed_apps 
            WHERE deployed_apps.id = app_analytics.app_id 
            AND deployed_apps.user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert analytics" ON app_analytics
    FOR INSERT WITH CHECK (true);

-- Policy for app_settings - users can only see their own settings (drop first if exists)
DROP POLICY IF EXISTS "Users can view their own settings" ON app_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON app_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON app_settings;

CREATE POLICY "Users can view their own settings" ON app_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON app_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON app_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy for api_usage - users can only see usage for their apps (drop first if exists)
DROP POLICY IF EXISTS "Users can view API usage for their apps" ON api_usage;
DROP POLICY IF EXISTS "System can insert API usage" ON api_usage;

CREATE POLICY "Users can view API usage for their apps" ON api_usage
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM deployed_apps 
            WHERE deployed_apps.id = api_usage.app_id 
            AND deployed_apps.user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert API usage" ON api_usage
    FOR INSERT WITH CHECK (true);

-- Create function to get user's app count (drop first if exists)
DROP FUNCTION IF EXISTS get_user_app_count(UUID);
CREATE OR REPLACE FUNCTION get_user_app_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*) 
        FROM deployed_apps 
        WHERE user_id = user_uuid 
        AND status != 'deleted'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user can deploy more apps (drop first if exists)
DROP FUNCTION IF EXISTS can_deploy_app(UUID);
CREATE OR REPLACE FUNCTION can_deploy_app(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_count INTEGER;
    max_apps INTEGER;
BEGIN
    -- Get current app count
    current_count := get_user_app_count(user_uuid);
    
    -- Get user's max apps setting
    SELECT COALESCE(max_apps, 10) INTO max_apps
    FROM app_settings 
    WHERE user_id = user_uuid;
    
    -- If no settings found, use default
    IF max_apps IS NULL THEN
        max_apps := 10;
    END IF;
    
    RETURN current_count < max_apps;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

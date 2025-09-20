-- Insert default app settings for existing users
INSERT INTO app_settings (user_id, auto_deploy, email_notifications, custom_domains_enabled, max_apps)
SELECT 
    id as user_id,
    true as auto_deploy,
    true as email_notifications,
    false as custom_domains_enabled,
    10 as max_apps
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM app_settings)
ON CONFLICT (user_id) DO NOTHING;

-- Create a sample deployed app (for testing purposes)
-- Note: This will only work if you have a user in your auth.users table
-- INSERT INTO deployed_apps (
--     user_id,
--     app_name,
--     app_url,
--     api_base_url,
--     storage_path,
--     original_filename,
--     file_size,
--     status,
--     framework
-- ) VALUES (
--     (SELECT id FROM auth.users LIMIT 1),
--     'Sample React App',
--     'https://your-domain.com/app/sample-react-app',
--     'https://your-domain.com/api',
--     'apps/sample-react-app',
--     'sample-react-app.zip',
--     1024000,
--     'deployed',
--     'react'
-- );

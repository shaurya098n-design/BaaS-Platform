-- Temporarily disable foreign key constraint for testing
-- This allows us to use any user_id without it existing in auth.users

-- Drop the existing foreign key constraint
ALTER TABLE deployed_apps DROP CONSTRAINT IF EXISTS deployed_apps_user_id_fkey;

-- Add a new constraint that doesn't reference auth.users
-- This is just for testing - in production, you'd want the real foreign key
ALTER TABLE deployed_apps ADD CONSTRAINT deployed_apps_user_id_check 
CHECK (user_id IS NOT NULL AND length(user_id::text) = 36);

-- Optional: Create a simple test user record in a custom table
CREATE TABLE IF NOT EXISTS test_users (
    id UUID PRIMARY KEY,
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert our test user
INSERT INTO test_users (id, email) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'test@example.com')
ON CONFLICT (id) DO NOTHING;

-- Show the current constraints
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='deployed_apps';

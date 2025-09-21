-- Create extracted_files table to store individual files from ZIP archives
CREATE TABLE IF NOT EXISTS extracted_files (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    app_id UUID NOT NULL REFERENCES deployed_apps(id) ON DELETE CASCADE,
    file_path VARCHAR(500) NOT NULL, -- e.g., 'index.html', 'css/styles.css', 'js/app.js'
    file_name VARCHAR(255) NOT NULL, -- e.g., 'index.html', 'styles.css', 'app.js'
    file_type VARCHAR(50) NOT NULL, -- e.g., 'html', 'css', 'js', 'image', 'font'
    file_size BIGINT NOT NULL,
    storage_path VARCHAR(500) NOT NULL, -- Path in Supabase Storage
    mime_type VARCHAR(100),
    content_hash VARCHAR(64), -- SHA-256 hash for deduplication
    is_directory BOOLEAN DEFAULT false,
    parent_directory VARCHAR(500), -- For organizing files in folders
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_extracted_files_app_id ON extracted_files(app_id);
CREATE INDEX IF NOT EXISTS idx_extracted_files_file_type ON extracted_files(file_type);
CREATE INDEX IF NOT EXISTS idx_extracted_files_file_path ON extracted_files(file_path);
CREATE INDEX IF NOT EXISTS idx_extracted_files_parent_directory ON extracted_files(parent_directory);

-- Create updated_at trigger for extracted_files
CREATE TRIGGER update_extracted_files_updated_at 
    BEFORE UPDATE ON extracted_files 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for extracted_files
ALTER TABLE extracted_files ENABLE ROW LEVEL SECURITY;

-- Policy for extracted_files - users can only see files for their own apps
DROP POLICY IF EXISTS "Users can view files for their apps" ON extracted_files;
DROP POLICY IF EXISTS "Users can insert files for their apps" ON extracted_files;
DROP POLICY IF EXISTS "Users can update files for their apps" ON extracted_files;
DROP POLICY IF EXISTS "Users can delete files for their apps" ON extracted_files;

CREATE POLICY "Users can view files for their apps" ON extracted_files
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM deployed_apps 
            WHERE deployed_apps.id = extracted_files.app_id 
            AND deployed_apps.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert files for their apps" ON extracted_files
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM deployed_apps 
            WHERE deployed_apps.id = extracted_files.app_id 
            AND deployed_apps.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update files for their apps" ON extracted_files
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM deployed_apps 
            WHERE deployed_apps.id = extracted_files.app_id 
            AND deployed_apps.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete files for their apps" ON extracted_files
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM deployed_apps 
            WHERE deployed_apps.id = extracted_files.app_id 
            AND deployed_apps.user_id = auth.uid()
        )
    );



const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

let supabase = null;
let supabaseAdmin = null;

const initializeSupabase = () => {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase configuration. Please check your environment variables.');
    }

    // Regular client for user operations
    supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Admin client for server-side operations
    if (supabaseServiceKey) {
      supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
    }

    logger.info('Supabase client initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Supabase client:', error);
    throw error;
  }
};

const getSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Call initializeSupabase() first.');
  }
  return supabase;
};

const getSupabaseAdmin = () => {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client not initialized. Check SUPABASE_SERVICE_ROLE_KEY.');
  }
  return supabaseAdmin;
};

// Database operations
const createAppRecord = async (appData) => {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('deployed_apps')
      .insert([appData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Error creating app record:', error);
    throw error;
  }
};

const getAppByUserId = async (userId) => {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('deployed_apps')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Error fetching apps by user ID:', error);
    throw error;
  }
};

const getAppByAppId = async (appId) => {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('deployed_apps')
      .select('*')
      .eq('id', appId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Error fetching app by ID:', error);
    throw error;
  }
};

const updateAppRecord = async (appId, updates) => {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('deployed_apps')
      .update(updates)
      .eq('id', appId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Error updating app record:', error);
    throw error;
  }
};

const deleteAppRecord = async (appId) => {
  try {
    const { error } = await getSupabaseAdmin()
      .from('deployed_apps')
      .delete()
      .eq('id', appId);

    if (error) throw error;
    return true;
  } catch (error) {
    logger.error('Error deleting app record:', error);
    throw error;
  }
};

// Storage operations
const uploadFile = async (bucketName, filePath, fileBuffer, options = {}) => {
  try {
    const { data, error } = await getSupabaseAdmin().storage
      .from(bucketName)
      .upload(filePath, fileBuffer, options);

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Error uploading file to storage:', error);
    throw error;
  }
};

const downloadFile = async (bucketName, filePath) => {
  try {
    const { data, error } = await getSupabaseAdmin().storage
      .from(bucketName)
      .download(filePath);

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Error downloading file from storage:', error);
    throw error;
  }
};

const deleteFile = async (bucketName, filePath) => {
  try {
    const { error } = await getSupabaseAdmin().storage
      .from(bucketName)
      .remove([filePath]);

    if (error) throw error;
    return true;
  } catch (error) {
    logger.error('Error deleting file from storage:', error);
    throw error;
  }
};

const getPublicUrl = (bucketName, filePath) => {
  try {
    const { data } = getSupabaseAdmin().storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    logger.error('Error getting public URL:', error);
    throw error;
  }
};

module.exports = {
  initializeSupabase,
  getSupabase,
  getSupabaseAdmin,
  createAppRecord,
  getAppByUserId,
  getAppByAppId,
  updateAppRecord,
  deleteAppRecord,
  uploadFile,
  downloadFile,
  deleteFile,
  getPublicUrl
};

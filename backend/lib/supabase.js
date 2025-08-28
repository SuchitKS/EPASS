const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('Supabase Key:', supabaseKey ? 'Set (length: ' + supabaseKey.length + ')' : 'Missing');

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing environment variables:');
    console.error('SUPABASE_URL:', !!supabaseUrl);
    console.error('SUPABASE_KEY:', !!supabaseKey);
    throw new Error('Missing Supabase environment variables');
}

try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: false
        }
    });
    console.log('Supabase client initialized successfully');
    module.exports = supabase;
} catch (err) {
    console.error('Supabase client initialization failed:', err.message, err.stack);
    throw err;
}

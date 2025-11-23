import { supabase } from './src/services/supabase';

async function checkTable() {
    const { data, error } = await supabase.from('transactions').select('count').limit(1);

    if (error) {
        console.error('Error checking table:', error.message);
    } else {
        console.log('Table exists! Connection successful.');
    }
}

checkTable();

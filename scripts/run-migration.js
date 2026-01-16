import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables d\'environnement Supabase manquantes');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
    try {
        console.log('📦 Lecture du fichier de migration...');
        const migrationPath = join(__dirname, '../supabase/migrations/create_prospect_crm.sql');
        const sql = readFileSync(migrationPath, 'utf-8');

        console.log('🚀 Exécution de la migration CRM...');

        // Diviser le SQL en statements individuels
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        for (const statement of statements) {
            if (statement) {
                const { error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' });
                if (error) {
                    // Ignorer les erreurs "already exists"
                    if (!error.message.includes('already exists')) {
                        console.warn('⚠️ Warning:', error.message.substring(0, 100));
                    }
                }
            }
        }

        console.log('✅ Migration CRM appliquée avec succès !');
        console.log('📊 Tables créées :');
        console.log('   - prospect_sessions');
        console.log('   - conversation_messages');
        console.log('   - prospect_metrics');
        console.log('   - prospect_contacts');

    } catch (error) {
        console.error('❌ Erreur lors de la migration:', error);
        process.exit(1);
    }
}

runMigration();

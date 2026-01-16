import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import mammoth from 'mammoth';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
// Récupérer toutes les clés disponibles
let GEMINI_KEYS = Object.keys(process.env)
    .filter(k => k.startsWith('VITE_GEMINI_KEY_'))
    .map(k => process.env[k])
    .filter(k => k && k.length > 10);

console.log(`🔑 ${GEMINI_KEYS.length} clés API détectées et chargées.`);

let currentKeyIndex = 0;

function getNextKey() {
    if (GEMINI_KEYS.length === 0) return null;
    const key = GEMINI_KEYS[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % GEMINI_KEYS.length;
    return key;
}

function removeKey(keyToRemove) {
    GEMINI_KEYS = GEMINI_KEYS.filter(k => k !== keyToRemove);
    console.log(`🚫 Clé révoquée/invalide retirée. Restantes : ${GEMINI_KEYS.length}`);
    if (currentKeyIndex >= GEMINI_KEYS.length) currentKeyIndex = 0;
}

if (!SUPABASE_URL || !SUPABASE_KEY || GEMINI_KEYS.length === 0) {
    console.error('❌ Erreur: Variables d\'environnement manquantes (.env) ou aucune clé Gemini détectée.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const FILES_TO_INGEST = [
    '76_PROTOCOLES_DE_NUTRITION_CELLULAIRE_AVEC_LES_PRODUITS_DE_NEOLIFE.docx',
    'Neolife Ecom 2.0 Document Stratégique Officiel  PDF.docx'
];

async function getEmbedding(text, retryCount = 0) {
    if (GEMINI_KEYS.length === 0) {
        console.error('❌ Toutes les clés API ont échoué.');
        return null;
    }

    if (retryCount > 20) { // Eviter boucles infinies
        console.error('❌ Trop de tentatives pour ce segment.');
        return null;
    }

    const key = getNextKey();
    if (!key) return null;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: {
                    parts: [{ text }]
                }
            })
        });

        if (!response.ok) {
            if (response.status === 403 || response.status === 400 || response.status === 401) {
                console.warn(`⚠️ Clé invalide (${response.status}). Suppression.`);
                removeKey(key);
                return getEmbedding(text, retryCount + 1);
            }
            if (response.status === 429) {
                // console.warn(`⚠️ Quota (429). Rotation.`);
                return getEmbedding(text, retryCount + 1);
            }
            if (response.status === 503) {
                // Overloaded
                await new Promise(r => setTimeout(r, 1000));
                return getEmbedding(text, retryCount + 1);
            }

            const err = await response.text();
            console.error('Gemini API Error:', err);
            return null;
        }

        const data = await response.json();
        return data.embedding.values;
    } catch (error) {
        console.error('Embedding request failed:', error);
        return null;
    }
}

async function ingestFile(filename) {
    const filePath = path.resolve(process.cwd(), filename);
    if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ Fichier non trouvé: ${filename}`);
        return;
    }

    console.log(`📄 Lecture de ${filename}...`);
    const buffer = fs.readFileSync(filePath);

    try {
        const result = await mammoth.extractRawText({ buffer });
        const text = result.value;

        // Découpage grossier par paragraphes (améliorer avec LangChain si besoin)
        // On split sur les sauts de ligne multiples pour avoir des blocs cohérents
        const chunks = text.split(/\n\s*\n/).filter(c => c.length > 50);

        console.log(`🧩 ${chunks.length} segments trouvés. Début de la vectorisation...`);

        let count = 0;
        for (const chunk of chunks) {
            // Limiter la taille du chunk pour Gemini (max 2048 tokens environ, on est large avec des paragraphes)
            const sanitizedChunk = chunk.substring(0, 8000);

            const embedding = await getEmbedding(sanitizedChunk);

            if (embedding) {
                const { error } = await supabase.from('documents').insert({
                    content: sanitizedChunk,
                    metadata: { filename },
                    embedding
                });

                if (error) console.error('Erreur insertion DB:', error);
                else count++;
            }

            // Petit délai pour rate limit
            await new Promise(r => setTimeout(r, 200));
            process.stdout.write(`.`);
        }
        console.log(`\n✅ ${count} segments vectorisés et insérés pour ${filename}`);

    } catch (error) {
        console.error(`❌ Erreur traitement ${filename}:`, error);
    }
}

async function main() {
    console.log('🚀 Démarrage de l\'ingestion RAG...');

    // Nettoyer la base pour éviter les doublons (optionnel, mais mieux en dev)
    // const { error } = await supabase.from('documents').delete().neq('id', 0);
    // if (!error) console.log('🧹 Base de connaissances nettoyée.');

    for (const file of FILES_TO_INGEST) {
        await ingestFile(file);
    }

    console.log('✨ Terminé ! La base de connaissance est à jour.');
}

main();

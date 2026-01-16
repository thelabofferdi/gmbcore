import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemins possibles pour Chrome sur Linux
const CHROME_PATHS = [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/snap/bin/chromium'
];

function getChromePath() {
    for (const p of CHROME_PATHS) {
        if (fs.existsSync(p)) return p;
    }
    return null;
}

(async () => {
    try {
        console.log('🔍 Démarrage du Scraper NeoLife...');

        const executablePath = getChromePath();
        console.log(executablePath ? `✅ Chrome trouvé : ${executablePath}` : '⚠️ Chrome système non trouvé, essai avec Chromium intégré...');

        const browser = await puppeteer.launch({
            headless: 'new',
            executablePath: executablePath || undefined,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // URL cible : Page "A to Z" pour avoir tout
        const url = 'https://shopneolife.com/startupforworld/shop/atoz';
        console.log(`🌐 Navigation vers : ${url}`);

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        console.log('⏳ Chargement de la page...');

        // Scroll pour charger le lazy loading éventuel
        await page.evaluate(async () => {
            await new Promise((resolve) => {
                let totalHeight = 0;
                const distance = 100;
                const timer = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if (totalHeight >= scrollHeight - window.innerHeight) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });

        // Attendre les cartes produits
        try {
            await page.waitForSelector('a[href*="/product/"]', { timeout: 10000 });
        } catch (e) { console.log('⚠️ Pas de sélecteur "product" évident trouvé, analyse large...'); }

        console.log('⛏️ Extraction des données...');

        const products = await page.evaluate(() => {
            const items = [];
            // Sélecteur générique pour trouver les liens produits
            const links = document.querySelectorAll('a[href*="/shop/product/"]');

            links.forEach(link => {
                const href = link.href;
                // ID extraction
                const idMatch = href.match(/\/product\/(\d+)/);
                if (!idMatch) return;
                const id = idMatch[1];

                // Nom : chercher dans le lien ou un titre proche
                let name = link.innerText.trim();
                if (!name || name.length < 3) {
                    // Essayer de trouver un titre dans le parent
                    const card = link.closest('div');
                    if (card) {
                        const titleEl = card.querySelector('h3, h4, .product-name, strong');
                        if (titleEl) name = titleEl.innerText.trim();
                    }
                }

                // Description (très heuristique)
                let description = "Produit NeoLife authentique";

                // Catégorie (on devine)
                let category = 'targeted';
                if (['3130', '2565', '2564', '2672'].includes(id)) category = 'base';

                if (name && !items.find(i => i.id === id)) {
                    items.push({
                        id,
                        name: name.replace(/\n/g, ' '),
                        category,
                        description,
                        benefits: ["Qualité NeoLife", "Science et Nature"] // Placeholder
                    });
                }
            });
            return items;
        });

        console.log(`✅ ${products.length} produits trouvés !`);

        const outputPath = path.join(__dirname, '../src/data/productCatalogReference.json');
        fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));

        console.log(`💾 Sauvegardé dans : ${outputPath}`);
        await browser.close();

    } catch (error) {
        console.error('❌ Erreur fatale du scraper :', error);
    }
})();

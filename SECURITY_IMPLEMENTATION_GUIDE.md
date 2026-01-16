# 🔒 GMB Core - Security Fixes Implementation Guide

## ⚠️ IMPORTANT: 121 Vulnerabilities Detected

Ce guide vous permettra de corriger toutes les vulnérabilités de manière systématique.

---

## 📦 Étape 1 : Mise à Jour des Dépendances (CRITIQUE)

```bash
# 1. Mettre à jour les packages vulnérables
npm audit
npm audit fix
npm update jspdf
npm install dompurify@latest uuid@latest

# 2. Vérifier les résultats
npm audit
```

---

## 🔴 Étape 2 : Secrets Exposés (12 CRITICAL)

### Fichiers à vérifier et corriger :

#### `src/services/groqService.ts` (ligne 5)
```typescript
// ❌ AVANT
const apiKey = "gsk_...";

// ✅ APRÈS
const apiKey = import.meta.env.VITE_GROQ_API_KEY;
if (!apiKey) throw new Error('VITE_GROQ_API_KEY is required');
```

#### `src/services/groqVision.ts` (ligne 2)
```typescript
// Même correction que groqService.ts
const apiKey = import.meta.env.VITE_GROQ_API_KEY;
```

#### `src/services/neolifeService.ts` (ligne 38)
```typescript
// Vérifier qu'aucune clé API n'est hardcodée
// Utiliser import.meta.env.VITE_NEOLIFE_API_KEY si nécessaire
```

#### `src/App.tsx` (lignes 71, 72, 102, 103, 126)
```typescript
// Remplacer toutes les clés hardcodées par des variables d'environnement
```

#### `src/services/apiKeyManager.ts` (lignes 70, 106)
```typescript
// ❌ AVANT
console.log('API Key:', apiKey);

// ✅ APRÈS
if (import.meta.env.DEV) {
  console.log('API Key loaded');  // Ne jamais logger la clé
}
```

---

## 🟠 Étape 3 : XSS dans MarkdownRenderer (5 HIGH)

### `src/components/MarkdownRenderer.tsx`

```typescript
import DOMPurify from 'dompurify';

// Lignes 48, 49, 93, 101, 102
// ❌ AVANT
<li dangerouslySetInnerHTML={{ __html: formatInline(item) }} />

// ✅ APRÈS
<li dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatInline(item)) }} />

// Appliquer DOMPurify.sanitize() à TOUS les dangerouslySetInnerHTML
```

---

## 🟠 Étape 4 : Clés Supabase Service Role (4 HIGH)

### Fichiers concernés :
- `src/services/supabaseService.ts:6`
- `scripts/ingest-docs.js:40`
- `scripts/run-migration.js:17`

```typescript
// ❌ DANGER - Service Role Key côté client
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// ✅ CORRECT - Anon Key côté client
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Service Role Key UNIQUEMENT dans les scripts Node.js (serveur)
```

---

## 🟡 Étape 5 : Math.random() → crypto (10 MEDIUM)

### Rechercher et remplacer dans tous les fichiers :

```typescript
// ❌ AVANT
const id = Math.random().toString(36);

// ✅ APRÈS
import { randomUUID } from 'crypto';
const id = randomUUID();

// OU pour les navigateurs
const id = crypto.randomUUID();
```

### Fichiers à corriger :
- `src/App.tsx:179`
- `src/components/AdminMonitor.tsx:123`
- `src/components/AssistantJose.tsx:411`
- `src/components/LinkGenerator.tsx:13`
- `src/services/prospectService.ts:34`

---

## 🟡 Étape 6 : Supprimer @ts-ignore (15 MEDIUM)

### Rechercher tous les `// @ts-ignore` et les corriger :

```bash
grep -rn "@ts-ignore" src/
```

Pour chaque occurrence, **corriger le problème TypeScript** au lieu de le supprimer.

---

## 🟡 Étape 7 : ReDoS - Regex Dangereuses (3 MEDIUM)

### `src/components/MarkdownRenderer.tsx` (lignes 121, 125)

```typescript
// ❌ AVANT - Nested quantifiers
const regex = /^([a-zA-Z0-9]+)+@/;

// ✅ APRÈS - Simplified
const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Toujours limiter la longueur de l'input AVANT le regex
if (input.length > 254) return false;
```

---

## ℹ️ Étape 8 : Console.log en Production (60+ INFO)

### Créer un helper de logging :

```typescript
// src/utils/logger.ts
export const logger = {
  error: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.error(...args);
    }
  },
  warn: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.warn(...args);
    }
  },
  info: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.log(...args);
    }
  }
};
```

### Remplacer partout :
```typescript
// ❌ AVANT
console.error('Error:', error);

// ✅ APRÈS
import { logger } from './utils/logger';
logger.error('Error:', error);
```

---

## ℹ️ Étape 9 : TypeScript `any` (20+ INFO)

### Remplacer progressivement :

```typescript
// ❌ AVANT
const data: any = response.data;

// ✅ APRÈS
interface ResponseData {
  id: string;
  name: string;
}
const data: ResponseData = response.data;
```

---

## ℹ️ Étape 10 : Rate Limiting (7 INFO)

### Ajouter à `src/services/supabaseService.ts` :

```typescript
// Pour les endpoints sensibles
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (key: string): boolean => {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + WINDOW_MS });
    return true;
  }
  
  if (record.count >= MAX_ATTEMPTS) {
    return false;
  }
  
  record.count++;
  return true;
};
```

---

## 📋 Checklist Finale

### Avant de déployer :

- [ ] Toutes les clés API sont dans `.env` (jamais hardcodées)
- [ ] `.env` est dans `.gitignore`
- [ ] DOMPurify installé et utilisé pour dangerouslySetInnerHTML
- [ ] Math.random() remplacé par crypto.randomUUID()
- [ ] @ts-ignore supprimés et erreurs TypeScript corrigées
- [ ] console.log wrappés dans `if (import.meta.env.DEV)`
- [ ] Service Role Key uniquement côté serveur
- [ ] jsPDF mis à jour
- [ ] `npm audit` ne montre plus de vulnérabilités HIGH/CRITICAL

### Tests :

```bash
# 1. Build sans erreurs
npm run build

# 2. Vérifier les vulnérabilités
npm audit

# 3. Tester localement
npm run dev

# 4. Déployer
npm run build && npx vercel --prod --yes
```

---

## 🆘 Si Besoin d'Aide

Pour chaque type de vulnérabilité, référez-vous au guide détaillé fourni initialement.

**Priorité absolue** :
1. Secrets exposés (CRITICAL)
2. XSS (HIGH)
3. Clés Supabase (HIGH)
4. Math.random() (MEDIUM)

Le reste peut être corrigé progressivement.

---

## 📊 Suivi de Progression

Créez un fichier `SECURITY_PROGRESS.md` et cochez au fur et à mesure :

```markdown
## Critical (12)
- [ ] groqService.ts
- [ ] groqVision.ts
- [ ] neolifeService.ts
- [ ] App.tsx (5 locations)
- [ ] apiKeyManager.ts (2 locations)
- [ ] jsPDF update

## High (8)
- [ ] MarkdownRenderer XSS (5 locations)
- [ ] Supabase keys (3 locations)

... etc
```

Bonne chance ! 🚀

# axiosOS - Deployment Instructions

## Netlify Deployment

### 1. Connect Repository
- Go to [netlify.com](https://netlify.com)
- Click "New site from Git"
- Connect your GitHub repository

### 2. Build Settings
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 18

### 3. Environment Variables
Add in Netlify dashboard > Site settings > Environment variables:
```
VITE_API_KEY=AIzaSyDe9K6gfTLw2UJJvT6yaBsqi9uyveZosXc
```

### 4. Deploy
- Push to main branch triggers automatic deployment
- Manual deploy: drag `dist` folder to Netlify

## Local Development
```bash
npm install
npm run dev
```

## Production Build
```bash
npm run build
npm run preview
```

## Project Structure
- React + Vite + TypeScript
- Gemini AI integration
- No database required
- Frontend-only application

# 🎵 Video to MP3 — Electron App

Convertisseur vidéo → MP3 desktop, construit avec **Electron + React + Vite + FFmpeg**.

## Stack

| Outil | Rôle |
|---|---|
| Electron | Shell desktop (main process) |
| React + Vite | UI (renderer process) |
| ffmpeg-static | Binaire FFmpeg embarqué |
| IPC sécurisé | Communication main ↔ renderer via preload |

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

> Lance Vite (port 5173) + Electron en parallèle.
> ⚠️ Attends que Vite soit prêt avant qu'Electron s'ouvre (~2s).

## Build (production)

```bash
npm run build
```

Génère un installeur dans `dist/` pour votre plateforme.

## Structure

```
video-to-mp3/
├── electron/
│   ├── main.js        # Process principal Electron (FFmpeg, dialogs, IPC)
│   └── preload.js     # Bridge sécurisé vers le renderer
├── src/
│   ├── App.jsx        # UI React principale
│   ├── App.css        # Styles
│   ├── main.jsx       # Point d'entrée React
│   └── index.css      # Variables CSS globales
├── index.html
├── vite.config.js
└── package.json
```

## Fonctionnalités

- **Drag & drop** ou sélection de fichier vidéo (MP4, MKV, AVI, MOV, WEBM…)
- **Mode simple** : conversion directe en MP3
- **Mode avancé** :
  - Bitrate : 64k → 320k
  - Fréquence d'échantillonnage : 22050 / 44100 / 48000 Hz
  - Canaux : Mono / Stéréo
  - Découpe temporelle (début / fin)
- **Barre de progression** en temps réel
- **Choix du dossier de destination**

## Ajouter NODE_ENV=development

Dans `package.json`, le script `dev` utilise `concurrently`. Pour qu'Electron
détecte le mode dev, ajoutez `cross-env` si nécessaire :

```bash
npm install -D cross-env
```

Puis dans `package.json` :
```json
"dev": "concurrently \"vite\" \"cross-env NODE_ENV=development electron .\""
```

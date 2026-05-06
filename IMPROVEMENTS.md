# Améliorations possibles

## Haute priorité — impact utilisateur direct

### 1. Annulation de la conversion
Aucun moyen d'arrêter une conversion en cours. Il faut quitter l'appli.  
Implique de stocker le PID ffmpeg et d'exposer un IPC `ffmpeg:cancel` qui kill le process.

### 2. Ouvrir le fichier/dossier après conversion
Après le message "Conversion terminée", proposer un bouton "Ouvrir" (`shell.openPath`) et "Ouvrir le dossier" (`shell.showItemInFolder`).

### 3. Conversion par lot
Glisser plusieurs fichiers à la fois et les convertir en séquence avec une barre de progression globale.

### 4. Persistance des préférences
Bitrate, sample rate, canaux reviennent aux valeurs par défaut à chaque lancement.  
Utiliser `electron-store` ou `localStorage` pour sauvegarder les options avancées.

### 5. Validation des timestamps
Les champs début/fin acceptent n'importe quel texte. Une valeur invalide fait échouer ffmpeg sans message clair.  
Ajouter une regex `HH:MM:SS` avec retour visuel inline.

---

## Priorité moyenne — améliore le confort

### 6. Affichage des métadonnées de la vidéo source
Après sélection, afficher durée, résolution, codec audio — déjà obtenables via le probe ffmpeg existant.

### 7. Temps restant estimé
ffmpeg expose la vitesse dans stderr (`speed=2.1x`), ce qui permet de calculer un ETA à afficher avec la progression.

### 8. Formats de sortie supplémentaires
AAC, OGG Vorbis, FLAC, WAV sont tous supportés par ffmpeg-static et changeraient peu le code.

### 9. Bug : `removeAllListeners` trop agressif
`preload.js:13` — `ipcRenderer.removeAllListeners('ffmpeg:progress')` supprime tous les listeners du canal.  
Corriger avec une référence explicite au listener.

### 10. Kill du process ffmpeg à la fermeture
Si la fenêtre se ferme pendant une conversion, le process ffmpeg reste orphelin.  
Ajouter un handler `app.on('before-quit')` avec `.kill()` sur le child process.

---

## Priorité basse — polish

### 11. Mémorisation du dernier dossier
Le dialog repart toujours du répertoire par défaut. Stocker et réutiliser `path.dirname(lastFile)`.

### 12. Tooltip sur le chemin de destination tronqué
`btn-output` tronque avec `text-overflow: ellipsis` sans moyen de voir le chemin complet. Un `title` HTML suffit.

### 13. Messages d'erreur ffmpeg plus explicites
Actuellement on expose juste `FFmpeg exited with code N`. Parser stderr pour extraire et afficher la vraie erreur.

### 14. Découpage des composants React
`App.jsx` fait 290 lignes et gère tout. Extraire `DropZone`, `AdvancedPanel`, `ProgressBar` en sous-composants.

### 15. Mode clair
L'app est exclusivement dark. Suivre la préférence système avec `prefers-color-scheme` via les CSS variables déjà en place.

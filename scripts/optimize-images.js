#!/usr/bin/env node
/**
 * Optimisation des assets image bundlés — WebP q80 + resize à l'usage réel.
 *
 * Usage : node scripts/optimize-images.js
 *
 * Pour chaque .png/.jpg/.jpeg de assets/images (hors assets SYSTÈME —
 * icônes, splash, favicon : jamais touchés) :
 *   1. sauvegarde l'original dans assets/_originals/ ;
 *   2. écrit un .webp (qualité 80) de même nom de base, redimensionné
 *      selon l'usage d'affichage : couvertures/hero plein cadre → 1200 px
 *      de large max ; images d'exercices → 1080 px (le player les affiche
 *      quasi plein écran en portrait 4:5 — sur un écran ×3 ça fait
 *      ~1170 px physiques, descendre à 800 serait visible) ;
 *   3. supprime l'original du bundle (la copie reste dans _originals/).
 *
 * Les références require('...png') sont à basculer en .webp à la main
 * (le script liste les fichiers concernés). Jamais d'agrandissement :
 * une image plus petite que la cible garde sa taille.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const IMAGES_DIR = path.join(ROOT, 'assets', 'images');
const ORIGINALS_DIR = path.join(ROOT, 'assets', '_originals');
const QUALITY = 80;

/** Assets système — jamais convertis (icône app, splash, favicon…). */
const SYSTEM = /^(icon|splash-icon|favicon|adaptive-icon|android-icon-)/;

/** Largeur max selon l'usage réel d'affichage (×2-×3 retina compris). */
function targetWidth(name) {
  if (/^(seance-|hero-)/.test(name)) return 1200; // couvertures plein cadre
  return 1080; // exercices : quasi plein écran dans le player
}

const format = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} Mo`;

(async () => {
  fs.mkdirSync(ORIGINALS_DIR, { recursive: true });
  const sources = fs
    .readdirSync(IMAGES_DIR)
    .filter((f) => /\.(png|jpe?g)$/i.test(f) && !SYSTEM.test(f));

  if (sources.length === 0) {
    console.log('Rien à convertir (aucun png/jpg hors assets système).');
    return;
  }

  let before = 0;
  let after = 0;
  const failed = [];

  for (const file of sources) {
    const src = path.join(IMAGES_DIR, file);
    const base = file.replace(/\.(png|jpe?g)$/i, '');
    const out = path.join(IMAGES_DIR, `${base}.webp`);
    const size = fs.statSync(src).size;
    try {
      await sharp(src)
        .resize({ width: targetWidth(base), withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(out);
      const outSize = fs.statSync(out).size;
      before += size;
      after += outSize;
      fs.copyFileSync(src, path.join(ORIGINALS_DIR, file));
      fs.unlinkSync(src);
      console.log(`${file}  ${format(size)} → ${format(outSize)}`);
    } catch (error) {
      failed.push(file);
      console.error(`ÉCHEC ${file}: ${error.message}`);
    }
  }

  console.log(`\nTotal : ${format(before)} → ${format(after)} (−${Math.round((1 - after / before) * 100)} %)`);
  if (failed.length) console.log(`Non converties : ${failed.join(', ')}`);
  console.log('\nPense à basculer les require() correspondants en .webp.');
})();

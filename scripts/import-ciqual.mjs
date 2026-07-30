#!/usr/bin/env node
/**
 * Import CIQUAL (table de composition ANSES) → table nutrition_foods.
 *
 * 1. Télécharger le CSV officiel : https://ciqual.anses.fr → « Télécharger »
 *    → Table Ciqual (français), format CSV (séparateur « ; »).
 * 2. Importer via l'API Supabase (service role, JAMAIS la clé publishable) :
 *      SUPABASE_URL=https://xxxx.supabase.co \
 *      SUPABASE_SERVICE_ROLE_KEY=... \
 *      node scripts/import-ciqual.mjs chemin/vers/ciqual.csv
 *    ou générer du SQL à passer à psql :
 *      node scripts/import-ciqual.mjs ciqual.csv --sql > seed.sql
 *      psql "$SUPABASE_DB_URL" -f seed.sql
 *    Option --latin1 si le CSV n'est pas en UTF-8 (accents cassés).
 *
 * Aucune dépendance : parser CSV « ; » maison, valeurs françaises gérées
 * (virgule décimale, « traces » → 0, « < 0,5 » → moitié du seuil, « - » → absent).
 */
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const csvPath = args.find((a) => !a.startsWith('--'));
const asSql = args.includes('--sql');
const latin1 = args.includes('--latin1');

if (!csvPath) {
  console.error('Usage: node scripts/import-ciqual.mjs <ciqual.csv> [--sql] [--latin1]');
  process.exit(1);
}

/** Même convention que public.norm_food_name (lower + sans accents). */
const norm = (s) =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();

/** « 12,5 » → 12.5 ; « traces » → 0 ; « < 0,5 » → 0.25 ; « - » / vide → null. */
function parseValue(raw) {
  if (raw === undefined) return null;
  const cleaned = raw.replace(/[\s "]/g, '').replace(',', '.');
  if (cleaned === '' || cleaned === '-') return null;
  if (/^traces$/i.test(cleaned)) return 0;
  const lessThan = cleaned.match(/^<(\d+(?:\.\d+)?)$/);
  if (lessThan) return Number(lessThan[1]) / 2;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

/** Parser CSV séparateur « ; » avec champs entre guillemets. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ';') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((f) => f !== '')) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((f) => f !== '')) rows.push(row);
  return rows;
}

/** Trouve l'index de colonne dont l'en-tête contient tous les fragments. */
function findColumn(headers, fragments, label) {
  const idx = headers.findIndex((h) => fragments.every((f) => norm(h).includes(norm(f))));
  if (idx === -1) {
    console.error(`Colonne introuvable (${label}) — fragments cherchés : ${fragments.join(' + ')}`);
    console.error(`En-têtes disponibles : ${headers.join(' | ')}`);
    process.exit(1);
  }
  return idx;
}

const text = readFileSync(csvPath, latin1 ? 'latin1' : 'utf8');
const rows = parseCsv(text);
const headers = rows[0];

const colName = findColumn(headers, ['alim_nom_fr'], 'nom aliment');
const colKcal = findColumn(headers, ['energie', '1169', 'kcal'], 'énergie kcal/100 g');
const colProt = findColumn(headers, ['proteines', 'g/100'], 'protéines g/100 g');
const colCarb = findColumn(headers, ['glucides', 'g/100'], 'glucides g/100 g');
const colFat = findColumn(headers, ['lipides', 'g/100'], 'lipides g/100 g');

const seen = new Set();
const foods = [];
for (const row of rows.slice(1)) {
  const name = (row[colName] ?? '').trim();
  const kcal = parseValue(row[colKcal]);
  if (!name || kcal === null) continue; // sans libellé ou sans énergie : inutilisable
  const nameNorm = norm(name);
  if (seen.has(nameNorm)) continue;
  seen.add(nameNorm);
  foods.push({
    name,
    name_norm: nameNorm,
    kcal_100g: kcal,
    protein_100g: parseValue(row[colProt]) ?? 0,
    carb_100g: parseValue(row[colCarb]) ?? 0,
    fat_100g: parseValue(row[colFat]) ?? 0,
    source: 'ciqual',
  });
}

if (foods.length < 100) {
  console.error(`Seulement ${foods.length} aliments exploitables — CSV inattendu ? (--latin1 ?)`);
  process.exit(1);
}

if (asSql) {
  const esc = (s) => s.replace(/'/g, "''");
  console.log('begin;');
  for (const f of foods) {
    console.log(
      `insert into public.nutrition_foods (name, name_norm, kcal_100g, protein_100g, carb_100g, fat_100g, source) ` +
        `values ('${esc(f.name)}', '${esc(f.name_norm)}', ${f.kcal_100g}, ${f.protein_100g}, ${f.carb_100g}, ${f.fat_100g}, 'ciqual') ` +
        `on conflict (name_norm, source) do update set name = excluded.name, kcal_100g = excluded.kcal_100g, ` +
        `protein_100g = excluded.protein_100g, carb_100g = excluded.carb_100g, fat_100g = excluded.fat_100g;`,
    );
  }
  console.log('commit;');
  console.error(`${foods.length} aliments → SQL émis sur stdout.`);
} else {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis (ou utilise --sql).');
    process.exit(1);
  }
  const BATCH = 500;
  let done = 0;
  for (let i = 0; i < foods.length; i += BATCH) {
    const batch = foods.slice(i, i + BATCH);
    const response = await fetch(
      `${url}/rest/v1/nutrition_foods?on_conflict=name_norm,source`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          apikey: key,
          authorization: `Bearer ${key}`,
          prefer: 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify(batch),
      },
    );
    if (!response.ok) {
      console.error(`Échec batch ${i / BATCH + 1} : HTTP ${response.status} ${await response.text()}`);
      process.exit(1);
    }
    done += batch.length;
    console.error(`… ${done}/${foods.length}`);
  }
  console.error(`Import terminé : ${done} aliments (source=ciqual).`);
}

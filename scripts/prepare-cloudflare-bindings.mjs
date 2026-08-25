import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const configPath = resolve('wrangler.jsonc');
const databaseName = process.env.CLOUDFLARE_D1_DATABASE_NAME || 'muuttobotti-db';
const bindingName = 'DB';

function runWrangler(args) {
  const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  return execFileSync(command, ['wrangler', ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
    env: process.env,
  }).trim();
}

function parseJsonOutput(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    const candidates = [raw.indexOf('['), raw.indexOf('{')].filter(index => index >= 0).sort((a, b) => a - b);
    if (!candidates.length) throw new Error('Wrangler did not return JSON output');
    return JSON.parse(raw.slice(candidates[0]));
  }
}

function extractDatabaseId(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const id = extractDatabaseId(item);
      if (id) return id;
    }
    return '';
  }
  return value.uuid || value.id || value.database_id || value.databaseId ||
    extractDatabaseId(value.database) || extractDatabaseId(value.result) || extractDatabaseId(value.results);
}

let databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID?.trim();

if (!databaseId) {
  const parsed = parseJsonOutput(runWrangler(['d1', 'list', '--json']));
  const databases = Array.isArray(parsed) ? parsed : parsed?.databases || parsed?.results || [];
  const match = databases.find(item => item?.name === databaseName || item?.database_name === databaseName);
  databaseId = extractDatabaseId(match);
}

if (!databaseId) {
  console.log(`Cloudflare D1 database "${databaseName}" was not found. Creating it now...`);
  let created;
  try {
    created = parseJsonOutput(runWrangler(['d1', 'create', databaseName, '--json']));
  } catch {
    runWrangler(['d1', 'create', databaseName]);
    created = null;
  }
  databaseId = extractDatabaseId(created);

  if (!databaseId) {
    const parsed = parseJsonOutput(runWrangler(['d1', 'list', '--json']));
    const databases = Array.isArray(parsed) ? parsed : parsed?.databases || parsed?.results || [];
    const match = databases.find(item => item?.name === databaseName || item?.database_name === databaseName);
    databaseId = extractDatabaseId(match);
  }
}

if (!databaseId) {
  console.error(`Unable to resolve Cloudflare D1 database "${databaseName}". Refusing to deploy without ${bindingName}.`);
  process.exit(1);
}

const config = JSON.parse(readFileSync(configPath, 'utf8'));
config.d1_databases = [{
  binding: bindingName,
  database_name: databaseName,
  database_id: databaseId,
}];

const r2BucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME?.trim();
if (r2BucketName) {
  config.r2_buckets = [{ binding: 'BUCKET', bucket_name: r2BucketName }];
}

writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
console.log(`Prepared Cloudflare D1 binding ${bindingName} -> ${databaseName} (${databaseId}).`);
if (!r2BucketName) console.log('CLOUDFLARE_R2_BUCKET_NAME is not set; R2 binding was left unchanged.');

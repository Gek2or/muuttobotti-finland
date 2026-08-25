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
    const arrayStart = raw.indexOf('[');
    const objectStart = raw.indexOf('{');
    const start = [arrayStart, objectStart].filter(index => index >= 0).sort((a, b) => a - b)[0];
    if (start === undefined) throw new Error('Wrangler did not return JSON output');
    return JSON.parse(raw.slice(start));
  }
}

let databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID?.trim();

if (!databaseId) {
  const raw = runWrangler(['d1', 'list', '--json']);
  const parsed = parseJsonOutput(raw);
  const databases = Array.isArray(parsed)
    ? parsed
    : parsed?.databases || parsed?.results || [];
  const match = databases.find(item => item?.name === databaseName || item?.database_name === databaseName);
  databaseId = match?.uuid || match?.id || match?.database_id;
}

if (!databaseId) {
  console.error(`Cloudflare D1 database "${databaseName}" was not found. Refusing to deploy without ${bindingName}.`);
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

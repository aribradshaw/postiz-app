/**
 * Runs `prisma db push` with DATABASE_URL derived from DATABASE_PUBLIC_URL when DATABASE_URL is unset.
 * Matches apps/backend/src/bootstrap-railway-env.ts behavior for local .env workflows.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const dotenv = require('dotenv');

const root = path.join(__dirname, '..');
const envPath = path.join(root, '.env');

function withSslModeRequired(connectionUrl) {
  const trimmed = connectionUrl.trim();
  if (!trimmed || /[?&]sslmode=/i.test(trimmed)) {
    return trimmed;
  }
  return `${trimmed}${trimmed.includes('?') ? '&' : '?'}sslmode=require`;
}

let db = (process.env.DATABASE_URL || '').trim();
let pub = (process.env.DATABASE_PUBLIC_URL || '').trim();

if (fs.existsSync(envPath)) {
  const fileEnv = dotenv.parse(fs.readFileSync(envPath, 'utf8'));
  if (!db) {
    db = (fileEnv.DATABASE_URL || '').trim();
  }
  if (!pub) {
    pub = (fileEnv.DATABASE_PUBLIC_URL || '').trim();
  }
}

if (!db && pub) {
  db = withSslModeRequired(pub);
}

const merged = { ...process.env, ...(db ? { DATABASE_URL: db } : {}) };

execSync(
  'pnpm dlx prisma@6.5.0 db push --accept-data-loss --schema ./libraries/nestjs-libraries/src/database/prisma/schema.prisma',
  { stdio: 'inherit', cwd: root, env: merged }
);

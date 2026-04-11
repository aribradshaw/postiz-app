/**
 * Runs `prisma db push` with DATABASE_URL derived from DATABASE_PUBLIC_URL when DATABASE_URL is unset.
 * Matches apps/backend/src/bootstrap-railway-env.ts behavior for local .env workflows.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const dotenv = require('dotenv');
const { resolveDatabaseUrl } = require('./resolve-database-url.cjs');

const root = path.join(__dirname, '..');
const envPath = path.join(root, '.env');

let mergedEnv = { ...process.env };
if (fs.existsSync(envPath)) {
  const fileEnv = dotenv.parse(fs.readFileSync(envPath, 'utf8'));
  mergedEnv = { ...fileEnv, ...process.env };
}

const db = resolveDatabaseUrl(mergedEnv);
const merged = { ...mergedEnv, ...(db ? { DATABASE_URL: db } : {}) };

execSync(
  'pnpm dlx prisma@6.5.0 db push --accept-data-loss --schema ./libraries/nestjs-libraries/src/database/prisma/schema.prisma',
  { stdio: 'inherit', cwd: root, env: merged }
);

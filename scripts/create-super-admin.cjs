/**
 * Creates or updates a LOCAL user with isSuperAdmin=true and a personal org.
 *
 * Usage (from repo root):
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='your-secure-password' node scripts/create-super-admin.cjs
 *
 * Requires DATABASE_URL (or DATABASE_PUBLIC_URL + ssl) and JWT_SECRET in .env or the environment.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { hashSync } = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const EVP_BytesToKey = require('evp_bytestokey');
const { resolveDatabaseUrl } = require('./resolve-database-url.cjs');

const root = path.join(__dirname, '..');
const envPath = path.join(root, '.env');

function loadEnvFile() {
  if (!fs.existsSync(envPath)) return;
  const dotenv = require('dotenv');
  const parsed = dotenv.parse(fs.readFileSync(envPath, 'utf8'));
  for (const [k, v] of Object.entries(parsed)) {
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

function makeId(length) {
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  for (let i = 0; i < length; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

const algorithm = 'aes-256-cbc';

function deriveLegacyKeyIv(secret) {
  const { keyLength, ivLength } = crypto.getCipherInfo(algorithm);
  const pass = Buffer.isBuffer(secret)
    ? secret
    : Buffer.from(secret ?? '', 'utf8');
  const { key, iv } = EVP_BytesToKey(
    pass,
    null,
    keyLength * 8,
    ivLength,
    'md5'
  );
  return { key, iv };
}

function encryptLegacyUsingIV(utf8Plaintext) {
  const { key, iv } = deriveLegacyKeyIv(process.env.JWT_SECRET);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const out = Buffer.concat([
    cipher.update(utf8Plaintext, 'utf8'),
    cipher.final(),
  ]);
  return out.toString('hex');
}

function organizationDisplayName(email) {
  const local = email?.split('@')[0]?.trim() ?? '';
  if (local) return local.slice(0, 128);
  return 'Workspace';
}

async function main() {
  loadEnvFile();
  const databaseUrl = resolveDatabaseUrl(process.env);
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';

  if (!databaseUrl) {
    console.error(
      'Missing database URL. Set DATABASE_URL, DATABASE_PUBLIC_URL, or RAILWAY_TCP_PROXY_DOMAIN + RAILWAY_TCP_PROXY_PORT with POSTGRES_* in .env.'
    );
    process.exit(1);
  }
  if (!email || !password) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in the environment.');
    process.exit(1);
  }
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is required (same as backend) to encrypt organization apiKey.');
    process.exit(1);
  }

  process.env.DATABASE_URL = databaseUrl;
  const prisma = new PrismaClient();

  const passwordHash = hashSync(password, 10);

  try {
    const existing = await prisma.user.findFirst({
      where: { email, providerName: 'LOCAL' },
      include: {
        organizations: { take: 1 },
      },
    });

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          password: passwordHash,
          activated: true,
          isSuperAdmin: true,
        },
      });
      if (!existing.organizations?.length) {
        await prisma.organization.create({
          data: {
            name: organizationDisplayName(email),
            apiKey: encryptLegacyUsingIV(makeId(20)),
            allowTrial: true,
            isTrailing: true,
            users: {
              create: {
                role: 'SUPERADMIN',
                userId: existing.id,
              },
            },
          },
        });
      }
      console.log(`Updated super admin and ensured org: ${email}`);
      return;
    }

    await prisma.organization.create({
      data: {
        name: organizationDisplayName(email),
        apiKey: encryptLegacyUsingIV(makeId(20)),
        allowTrial: true,
        isTrailing: true,
        users: {
          create: {
            role: 'SUPERADMIN',
            user: {
              create: {
                activated: true,
                email,
                password: passwordHash,
                providerName: 'LOCAL',
                providerId: '',
                timezone: 0,
                isSuperAdmin: true,
              },
            },
          },
        },
      },
    });
    console.log(`Created super admin: ${email}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

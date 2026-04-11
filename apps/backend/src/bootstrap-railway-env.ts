/**
 * Railway Postgres exposes:
 * - DATABASE_URL — private network (services in the same Railway project)
 * - DATABASE_PUBLIC_URL — TCP proxy for local dev / Prisma CLI from your machine
 *
 * Prisma and the app only read DATABASE_URL. If you set DATABASE_PUBLIC_URL and leave
 * DATABASE_URL empty, we mirror it here (with sslmode=require when missing).
 */
function withSslModeRequired(connectionUrl: string): string {
  const trimmed = connectionUrl.trim();
  if (!trimmed) {
    return trimmed;
  }
  if (/[?&]sslmode=/i.test(trimmed)) {
    return trimmed;
  }
  return `${trimmed}${trimmed.includes('?') ? '&' : '?'}sslmode=require`;
}

function buildDatabaseUrlFromTcpProxy(): string {
  const host = process.env.RAILWAY_TCP_PROXY_DOMAIN?.trim();
  const port = process.env.RAILWAY_TCP_PROXY_PORT?.trim();
  if (!host || !port) {
    return '';
  }
  const user = encodeURIComponent(
    process.env.POSTGRES_USER || process.env.PGUSER || 'postgres'
  );
  const pass = encodeURIComponent(
    process.env.POSTGRES_PASSWORD || process.env.PGPASSWORD || ''
  );
  const db = process.env.POSTGRES_DB || process.env.PGDATABASE || 'railway';
  return `postgresql://${user}:${pass}@${host}:${port}/${db}`;
}

const dbUrl = process.env.DATABASE_URL?.trim();
const publicUrl = process.env.DATABASE_PUBLIC_URL?.trim();
const fromTcp = buildDatabaseUrlFromTcpProxy();

if (!dbUrl && publicUrl) {
  process.env.DATABASE_URL = withSslModeRequired(publicUrl);
} else if (!dbUrl && !publicUrl && fromTcp) {
  process.env.DATABASE_URL = withSslModeRequired(fromTcp);
}

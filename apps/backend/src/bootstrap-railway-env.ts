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

const dbUrl = process.env.DATABASE_URL?.trim();
const publicUrl = process.env.DATABASE_PUBLIC_URL?.trim();

if (!dbUrl && publicUrl) {
  process.env.DATABASE_URL = withSslModeRequired(publicUrl);
}

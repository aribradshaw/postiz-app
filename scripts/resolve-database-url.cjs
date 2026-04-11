'use strict';

/** Append sslmode=require when missing (Railway public Postgres). */
function withSslModeRequired(connectionUrl) {
  const trimmed = (connectionUrl || '').trim();
  if (!trimmed || /[?&]sslmode=/i.test(trimmed)) {
    return trimmed;
  }
  return `${trimmed}${trimmed.includes('?') ? '&' : '?'}sslmode=require`;
}

function buildFromTcpProxy(env) {
  const host = (env.RAILWAY_TCP_PROXY_DOMAIN || '').trim();
  const port = (env.RAILWAY_TCP_PROXY_PORT || '').trim();
  if (!host || !port) {
    return '';
  }
  const user = encodeURIComponent(
    (env.POSTGRES_USER || env.PGUSER || 'postgres').trim()
  );
  const pass = encodeURIComponent(
    (env.POSTGRES_PASSWORD || env.PGPASSWORD || '').trim()
  );
  const db = (env.POSTGRES_DB || env.PGDATABASE || 'railway').trim();
  return `postgresql://${user}:${pass}@${host}:${port}/${db}`;
}

/**
 * @param {NodeJS.ProcessEnv} env
 * @returns {string}
 */
function resolveDatabaseUrl(env) {
  const direct = (env.DATABASE_URL || '').trim();
  if (direct) {
    return withSslModeRequired(direct);
  }
  const pub = (env.DATABASE_PUBLIC_URL || '').trim();
  if (pub) {
    return withSslModeRequired(pub);
  }
  const fromTcp = buildFromTcpProxy(env);
  if (fromTcp) {
    return withSslModeRequired(fromTcp);
  }
  return '';
}

module.exports = {
  resolveDatabaseUrl,
  withSslModeRequired,
  buildFromTcpProxy,
};

/** True when DATABASE_URL looks like a Postgres connection string (Prisma datasource). */
export function isPostgresDatabaseUrlConfigured(): boolean {
  const u = process.env.DATABASE_URL?.trim() ?? "";
  return u.startsWith("postgresql://") || u.startsWith("postgres://");
}

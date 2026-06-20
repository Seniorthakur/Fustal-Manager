const { spawnSync } = require('node:child_process');

// Prisma generate validates the datasource URL even during cloud builds.
// Railway may not expose the production DATABASE_URL at build time, so use
// a harmless valid PostgreSQL placeholder only for code generation.
const env = { ...process.env };
if (!env.DATABASE_URL) {
  env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/futsal?schema=public';
  console.log('DATABASE_URL not present during build; using placeholder for prisma generate only.');
}

const result = spawnSync('npx', ['prisma', 'generate'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env,
});

process.exit(result.status ?? 1);

const { spawnSync } = require('node:child_process');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is missing. Add a PostgreSQL database in Railway and set DATABASE_URL before deployment.');
  process.exit(1);
}

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: process.env,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run('npx', ['prisma', 'db', 'push']);
run('npx', ['tsx', 'prisma/seed.ts']);

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = process.cwd();
const envPath = path.join(root, '.env');
const envLocalPath = path.join(root, '.env.local');
const examplePath = path.join(root, '.env.example');
const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT || process.env.RENDER;

function hasDatabaseUrl(filePath) {
  if (!fs.existsSync(filePath)) return false;
  return /^\s*DATABASE_URL\s*=\s*.+/m.test(fs.readFileSync(filePath, 'utf8'));
}

function createEnvFromExample() {
  const fallback = [
    'NEXTAUTH_URL=http://localhost:3000',
    `NEXTAUTH_SECRET=${crypto.randomBytes(32).toString('hex')}`,
    'NEXT_ALLOWED_DEV_ORIGINS=192.168.1.10,192.168.1.10:3000,localhost,localhost:3000,127.0.0.1,127.0.0.1:3000',
    'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/futsal?schema=public"',
    'SEED_SUPER_ADMIN_NAME=Owner',
    'SEED_SUPER_ADMIN_USERNAME=owner',
    'SEED_SUPER_ADMIN_PASSWORD=ChangeMe123!',
    'NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS=true',
    ''
  ].join('\n');

  let contents = fs.existsSync(examplePath) ? fs.readFileSync(examplePath, 'utf8') : fallback;
  contents = contents.replace(
    /NEXTAUTH_SECRET=.*/,
    `NEXTAUTH_SECRET=${crypto.randomBytes(32).toString('hex')}`
  );

  if (!/^\s*DATABASE_URL\s*=/m.test(contents)) {
    contents += '\nDATABASE_URL="postgresql://postgres:postgres@localhost:5432/futsal?schema=public"\n';
  }

  fs.writeFileSync(envPath, contents);
  console.log('Created .env from .env.example.');
}

// On Railway/production, never create a local .env that can override platform variables.
if (isProduction && process.env.DATABASE_URL) {
  console.log('Using DATABASE_URL from hosting environment. No local .env changes needed.');
  process.exit(0);
}

if (!fs.existsSync(envPath)) {
  if (process.env.DATABASE_URL) {
    console.log('DATABASE_URL is already available from the shell/hosting environment. No .env file needed.');
  } else if (fs.existsSync(envLocalPath) && hasDatabaseUrl(envLocalPath)) {
    fs.copyFileSync(envLocalPath, envPath);
    console.log('Created .env by copying .env.local because Prisma CLI reads .env by default.');
  } else {
    createEnvFromExample();
  }
} else if (!hasDatabaseUrl(envPath) && !process.env.DATABASE_URL) {
  fs.appendFileSync(envPath, '\nDATABASE_URL="postgresql://postgres:postgres@localhost:5432/futsal?schema=public"\n');
  console.log('Added missing PostgreSQL DATABASE_URL placeholder to .env.');
}

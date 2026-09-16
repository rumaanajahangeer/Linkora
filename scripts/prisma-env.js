const { execSync } = require('child_process');

const dbUrl = process.env.DATABASE_URL || '';
const isPostgres = /^postgres(ql)?:\/\//i.test(dbUrl);
const schema = isPostgres ? 'prisma/schema.pg.prisma' : 'prisma/schema.prisma';

execSync(`npx prisma generate --schema=${schema}`, { stdio: 'inherit' });

if (isPostgres && (process.env.VERCEL || process.env.PRISMA_PUSH === '1')) {
  execSync(`npx prisma db push --schema=${schema} --skip-generate --accept-data-loss`, {
    stdio: 'inherit',
  });
}

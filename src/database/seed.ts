import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import * as argon2 from 'argon2';
import dataSource from './data-source';
import { User } from '../modules/users/entities/user.entity';
import { Role } from '../common/enums/role.enum';

loadEnv();

/**
 * Idempotent bootstrap seed: ensures a first OWNER account is present so
 * the system can be administered. Run once after the schema exists:
 * `pnpm run seed`.
 *
 * Credentials come from SEED_OWNER_EMAIL / SEED_OWNER_PASSWORD (required).
 */
async function seed(): Promise<void> {
  const email = process.env.SEED_OWNER_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_OWNER_PASSWORD;
  if (!email || !password) {
    throw new Error(
      'SEED_OWNER_EMAIL and SEED_OWNER_PASSWORD must be set to seed the owner',
    );
  }

  await dataSource.initialize();
  try {
    const repo = dataSource.getRepository(User);
    const existing = await repo.findOne({ where: { email } });
    if (existing) {
      console.log(`Owner ${email} already exists; nothing to do.`);
      return;
    }

    const user = repo.create({
      email,
      fullName: 'Club Owner',
      role: Role.OWNER,
      passwordHash: await argon2.hash(password, { type: argon2.argon2id }),
    });
    await repo.save(user);

    console.log(`Seeded owner account: ${email}`);
  } finally {
    await dataSource.destroy();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

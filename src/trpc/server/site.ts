import env from '@/env';
import { PrismaClient } from '@/prisma/site/.generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { attachDatabasePool } from '@vercel/functions';
import { Pool } from 'pg';

const pool = new Pool({
	connectionString: env.SITE_DATABASE_URL,
	max: 20, // Maximum number of clients in the pool
	connectionTimeoutMillis: 10000, // 10 seconds to wait for connection
	idleTimeoutMillis: 30000, // 30 seconds before closing idle connections
});

attachDatabasePool(pool);

const createSitePrismaClient = () =>
	new PrismaClient({
		adapter: new PrismaPg(pool),
		log:
			env.NODE_ENV === 'development'
				? ['query', 'error', 'warn']
				: ['error'],
	});

const globalForSitePrisma = globalThis as unknown as {
	sitePrisma: ReturnType<typeof createSitePrismaClient> | undefined;
};

export const site = globalForSitePrisma.sitePrisma ?? createSitePrismaClient();

if (env.NODE_ENV !== 'production') globalForSitePrisma.sitePrisma = site;

import { PrismaClient } from '@prisma/client';

  // export const db = new PrismaClient();
  export const db = new PrismaClient({
    log: ['warn', 'error']
  });
  // log: ['query', 'info', 'warn', 'error']
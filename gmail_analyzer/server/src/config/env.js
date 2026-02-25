import { z } from 'zod';

const envSchema = z.object({
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  MONGODB_URI: z.string().url(),
  SESSION_SECRET: z.string().min(32),
  CLIENT_URL: z.string().url(),
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
});

let env;
try {
  env = envSchema.parse(process.env);
} catch (err) {
  console.error('Invalid environment variables:');
  console.error(err.flatten().fieldErrors);
  process.exit(1);
}

export default env;

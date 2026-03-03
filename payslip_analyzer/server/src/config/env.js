import 'dotenv/config';

const env = {
  PORT: parseInt(process.env.PORT || '3002', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
};

export default env;

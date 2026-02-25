import session from 'express-session';
import MongoStore from 'connect-mongo';
import env from './env.js';

export function createSessionMiddleware() {
  return session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: env.MONGODB_URI,
      collectionName: 'sessions',
      ttl: 7 * 24 * 60 * 60, // 7 days
    }),
    cookie: {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  });
}

export const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET ?? 'default-dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
  bcrypt: {
    saltRounds: 10,
  },
  session: {
    secret: process.env.SESSION_SECRET ?? 'default-session-secret-change-in-production',
    name: 'trackit.sid',
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  },
};
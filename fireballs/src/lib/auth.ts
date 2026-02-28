import { betterAuth } from 'better-auth';
import { tanstackStartCookies } from 'better-auth/tanstack-start';

export const auth = betterAuth({
  socialProviders: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    },
  },

  plugins: [tanstackStartCookies()],
});

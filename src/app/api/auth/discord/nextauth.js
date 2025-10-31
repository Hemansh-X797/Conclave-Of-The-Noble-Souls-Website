// ============================================
// THE CONCLAVE REALM - NextAuth Configuration
// /app/api/auth/[...nextauth].js
// ============================================

import NextAuth from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import { supabaseAdmin } from '@/lib/supabase';
import { discordAPI, userService } from '@/lib/discord';

// NextAuth configuration
export default NextAuth({
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'identify guilds guilds.members.read email'
        }
      }
    })
  ],
  
  callbacks: {
    // Handle JWT token
    async jwt({ token, user, account, profile }) {
      // Initial sign in
      if (account && profile) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
        token.discordId = profile.id;
        
        // Check if user is in our Discord server
        const isInGuild = await discordAPI.isUserInGuild(account.access_token);
        token.isInGuild = isInGuild;
        
        if (isInGuild) {
          // Get guild member data
          const guildMember = await discordAPI.getGuildMember(profile.id);
          token.guildMember = guildMember;
          
          // Format and save user data
          const userData = userService.formatUserData(profile, guildMember);
          
          // Upsert user in database
          const { data, error } = await supabaseAdmin
            .from('members')
            .upsert({
              ...userData,
              last_seen: new Date().toISOString()
            }, {
              onConflict: 'discord_id'
            })
            .select()
            .single();
          
          if (!error && data) {
            token.dbUserId = data.id;
            token.pathways = userData.pathways;
            token.adminLevel = userService.getAdminLevel(guildMember?.roles || []);
          }
        }
      }
      
      // Return previous token if the access token has not expired yet
      if (Date.now() < token.expiresAt * 1000) {
        return token;
      }
      
      // Access token has expired, try to update it
      try {
        const response = await fetch('https://discord.com/api/oauth2/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: process.env.DISCORD_CLIENT_ID,
            client_secret: process.env.DISCORD_CLIENT_SECRET,
            grant_type: 'refresh_token',
            refresh_token: token.refreshToken,
          }),
        });
        
        const refreshedTokens = await response.json();
        
        if (!response.ok) {
          throw refreshedTokens;
        }
        
        return {
          ...token,
          accessToken: refreshedTokens.access_token,
          expiresAt: Math.floor(Date.now() / 1000) + refreshedTokens.expires_in,
          refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
        };
      } catch (error) {
        console.error('Error refreshing access token', error);
        return {
          ...token,
          error: 'RefreshAccessTokenError',
        };
      }
    },
    
    // Handle session
    async session({ session, token }) {
      // Add custom properties to session
      session.accessToken = token.accessToken;
      session.discordId = token.discordId;
      session.dbUserId = token.dbUserId;
      session.isInGuild = token.isInGuild;
      session.pathways = token.pathways || [];
      session.adminLevel = token.adminLevel || 'member';
      session.error = token.error;
      
      // Update last seen
      if (token.dbUserId) {
        await supabaseAdmin
          .from('members')
          .update({ last_seen: new Date().toISOString() })
          .eq('id', token.dbUserId);
      }
      
      return session;
    },
    
    // Sign in callback
    async signIn({ user, account, profile }) {
      // Only allow sign in if user is in our Discord server
      if (account.provider === 'discord') {
        const isInGuild = await discordAPI.isUserInGuild(account.access_token);
        
        if (!isInGuild) {
          // Redirect to join page with error
          return '/gateway?error=not_in_server';
        }
        
        return true;
      }
      
      return true;
    },
    
    // Redirect callback
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    }
  },
  
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
    newUser: '/chambers/welcome'
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  
  debug: process.env.NODE_ENV === 'development',
  
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('User signed in:', user.email);
    },
    async signOut({ session, token }) {
      console.log('User signed out');
    },
    async createUser({ user }) {
      console.log('New user created:', user.email);
    },
    async updateUser({ user }) {
      console.log('User updated:', user.email);
    },
    async linkAccount({ user, account, profile }) {
      console.log('Account linked:', account.provider);
    },
    async session({ session, token }) {
      // Called whenever a session is checked
    }
  }
});


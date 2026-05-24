/**
 * JAPAFAN - SUPABASE BACKEND INTEGRATION CLIENT
 * 
 * This module acts as the service layer to transition from localStorage 
 * to a real-time cloud-backed PostgreSQL database powered by Supabase.
 * 
 * To activate:
 * 1. Install Supabase client: npm install @supabase/supabase-js
 * 2. Pre-load your credentials below.
 */

// import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-public-key-here';

const isConfigured = 
  SUPABASE_URL && 
  SUPABASE_URL !== 'https://your-project-id.supabase.co' && 
  SUPABASE_ANON_KEY && 
  SUPABASE_ANON_KEY !== 'your-anon-public-key-here';

class SupabaseService {
  constructor() {
    this.client = null;
    this.initialized = false;
    this.activeSubscriptions = {};
  }

  // Initialize connection
  init() {
    if (typeof supabase !== 'undefined' && isConfigured) {
      try {
        this.client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        this.initialized = true;
        console.log("Supabase Client initialized successfully via CDN.");
      } catch (e) {
        console.error("Failed to create Supabase client:", e.message);
        this.initialized = false;
      }
    } else {
      console.warn("Supabase library not loaded or credentials not configured. Running in local fallback state.");
      this.initialized = false;
    }
  }

  // ==========================================================================
  // 1. AUTHENTICATION SERVICES
  // ==========================================================================

  // Sign up a new Otaku fan
  async signUp(email, password, username, avatarSeed = 'JapaFanUser') {
    if (!this.initialized) return { error: "Client not initialized." };
    
    try {
      const { data, error } = await this.client.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            avatar_seed: avatarSeed
          }
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (e) {
      console.error("Signup error:", e.message);
      return { data: null, error: e.message };
    }
  }

  // Sign in an existing fan
  async signIn(email, password) {
    if (!this.initialized) return { error: "Client not initialized." };

    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { data, error: null };
    } catch (e) {
      console.error("Signin error:", e.message);
      return { data: null, error: e.message };
    }
  }

  // Sign in with Google OAuth
  async signInWithGoogle() {
    if (!this.initialized) return { error: "Client not initialized." };

    try {
      const { data, error } = await this.client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (e) {
      console.error("Google OAuth error:", e.message);
      return { data: null, error: e.message };
    }
  }

  // Sign out
  async signOut() {
    if (!this.initialized) return;
    await this.client.auth.signOut();
  }

  // Get currently logged-in user profile details
  async getMyProfile() {
    if (!this.initialized) return null;

    const { data: { user } } = await this.client.auth.getUser();
    if (!user) return null;

    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error.message);
      return null;
    }
    return data;
  }

  // Update profile details
  async updateProfile(username, bio, avatarSeed, favoriteGenres) {
    if (!this.initialized) return false;

    const { data: { user } } = await this.client.auth.getUser();
    if (!user) return false;

    const { error } = await this.client
      .from('users')
      .update({
        username,
        bio,
        avatar_seed: avatarSeed,
        favorite_genres: favoriteGenres,
        updated_at: new Date()
      })
      .eq('id', user.id);

    if (error) {
      console.error("Error updating profile:", error.message);
      return false;
    }
    return true;
  }

  // ==========================================================================
  // 2. TIER LIST RANKINGS SERVICES
  // ==========================================================================

  // Load a user's Top 5 list
  async loadUserRankings(userId) {
    if (!this.initialized) return [];

    const { data, error } = await this.client
      .from('rankings')
      .select('*')
      .eq('user_id', userId)
      .order('rank_position', { ascending: true });

    if (error) {
      console.error("Error loading rankings:", error.message);
      return [];
    }
    return data;
  }

  // Save an anime to a specific rank position
  async saveRankItem(rankPosition, malId, title, posterUrl, reflectionNote = '') {
    if (!this.initialized) return false;

    const { data: { user } } = await this.client.auth.getUser();
    if (!user) return false;

    // Use upsert to handle updates and inserts natively
    const { error } = await this.client
      .from('rankings')
      .upsert({
        user_id: user.id,
        rank_position: rankPosition,
        mal_id: malId,
        anime_title: title,
        poster_url: posterUrl,
        reflection_note: reflectionNote
      }, {
        onConflict: 'user_id,rank_position'
      });

    if (error) {
      console.error("Error upserting rank item:", error.message);
      return false;
    }
    return true;
  }

  // Remove a ranked item
  async deleteRankItem(rankPosition) {
    if (!this.initialized) return false;

    const { data: { user } } = await this.client.auth.getUser();
    if (!user) return false;

    const { error } = await this.client
      .from('rankings')
      .delete()
      .eq('user_id', user.id)
      .eq('rank_position', rankPosition);

    if (error) {
      console.error("Error deleting rank item:", error.message);
      return false;
    }
    return true;
  }

  // ==========================================================================
  // 3. ANIME REVIEWS / DISCUSSION COMMENTS
  // ==========================================================================

  // Fetch comments for an anime
  async fetchAnimeReviews(malId) {
    if (!this.initialized) return [];

    const { data, error } = await this.client
      .from('reviews')
      .select(`
        id,
        comment_text,
        created_at,
        users ( username, avatar_seed )
      `)
      .eq('mal_id', malId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching reviews:", error.message);
      return [];
    }
    
    // Map response structure to match JapaFan schema
    return data.map(r => ({
      author: r.users?.username || 'Otaku',
      text: r.comment_text,
      time: new Date(r.created_at).toLocaleDateString(),
      avatarSeed: r.users?.avatar_seed
    }));
  }

  // Post comment to an anime discussion
  async postAnimeReview(malId, commentText) {
    if (!this.initialized) return false;

    const { data: { user } } = await this.client.auth.getUser();
    if (!user) return false;

    const { error } = await this.client
      .from('reviews')
      .insert({
        user_id: user.id,
        mal_id: malId,
        comment_text: commentText
      });

    if (error) {
      console.error("Error posting review:", error.message);
      return false;
    }
    return true;
  }

  // ==========================================================================
  // 4. REAL-TIME CHAT LOBBY BROADCASTS
  // ==========================================================================

  // Load initial channel message log
  async fetchChannelMessages(channel, limit = 50) {
    if (!this.initialized) return [];

    const { data, error } = await this.client
      .from('chat_messages')
      .select(`
        id,
        message_text,
        created_at,
        user_id,
        users ( username, avatar_seed )
      `)
      .eq('channel', channel)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error("Error loading chat:", error.message);
      return [];
    }

    const { data: { user } } = await this.client.auth.getUser();
    const currentUserId = user ? user.id : null;

    return data.map(msg => ({
      sender: msg.users?.username || 'Fan',
      avatar: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${msg.users?.avatar_seed || 'JapaFanUser'}&backgroundColor=ff007f`,
      message: msg.message_text,
      time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      self: msg.user_id === currentUserId
    }));
  }

  // Send a chat message to lobby
  async sendChatMessage(channel, messageText) {
    if (!this.initialized) return false;

    const { data: { user } } = await this.client.auth.getUser();
    if (!user) return false;

    const { error } = await this.client
      .from('chat_messages')
      .insert({
        user_id: user.id,
        channel: channel,
        message_text: messageText
      });

    if (error) {
      console.error("Error sending message:", error.message);
      return false;
    }
    return true;
  }

  // Subscribe to real-time chat updates on a channel
  subscribeToChatChannel(channel, onMessageReceived) {
    if (!this.initialized) return null;

    // Unsubscribe from existing active subscription if any
    this.unsubscribeFromChat(channel);

    console.log(`Subscribing to real-time channel public:chat_messages?channel=eq.${channel}`);

    const subscription = this.client
      .channel(`chat-lobby-${channel}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `channel=eq.${channel}`
        },
        async (payload) => {
          // Resolve sender profile details
          const { data: profile } = await this.client
            .from('users')
            .select('username, avatar_seed')
            .eq('id', payload.new.user_id)
            .single();

          const { data: { user } } = await this.client.auth.getUser();
          const currentUserId = user ? user.id : null;

          const formattedMessage = {
            sender: profile?.username || 'Fan',
            avatar: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${profile?.avatar_seed || 'JapaFanUser'}&backgroundColor=ff007f`,
            message: payload.new.message_text,
            time: new Date(payload.new.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            self: payload.new.user_id === currentUserId
          };

          onMessageReceived(formattedMessage);
        }
      )
      .subscribe();

    this.activeSubscriptions[channel] = subscription;
    return subscription;
  }

  // Unsubscribe from a chat lobby
  unsubscribeFromChat(channel) {
    if (this.activeSubscriptions[channel]) {
      this.client.removeChannel(this.activeSubscriptions[channel]);
      delete this.activeSubscriptions[channel];
      console.log(`Unsubscribed from active channel: ${channel}`);
    }
  }
}

// Export singleton instance
const supabaseService = new SupabaseService();
supabaseService.init();
export { supabaseService };

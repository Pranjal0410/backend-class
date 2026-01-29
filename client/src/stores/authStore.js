/**
 * Auth Store
 * Manages authentication state and user permissions
 *
 * STORE OWNERSHIP: This store owns all auth domain state.
 * No other store should modify user, token, or auth state directly.
 *
 * IMPORTANT: Role checks here are for UX only.
 * The server is the source of truth for authorization.
 * Frontend role checks prevent confusing UI states, not security breaches.
 *
 * STATE FLOW:
 * 1. User logs in → REST API returns { user, token }
 * 2. Token stored in localStorage + state
 * 3. Role derived from user object
 * 4. Components check canWrite() for UI decisions
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Roles that can modify incidents (mirrors server)
const WRITE_ROLES = ['admin', 'responder'];

const useAuthStore = create(
  persist(
    (set, get) => ({
      // ─────────────────────────────────────────
      // STATE
      // ─────────────────────────────────────────
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // ─────────────────────────────────────────
      // COMPUTED (via getters)
      // ─────────────────────────────────────────

      /**
       * Check if current user can write (modify incidents)
       * Used by components to show/hide edit controls
       *
       * IMPORTANT: This is for UX only. Server enforces actual permissions.
       */
      canWrite: () => {
        const { user } = get();
        return user && WRITE_ROLES.includes(user.role);
      },

      /**
       * Check if current user is admin
       */
      isAdmin: () => {
        const { user } = get();
        return user?.role === 'admin';
      },

      /**
       * Get current user's role for display
       */
      getRole: () => {
        const { user } = get();
        return user?.role || 'viewer';
      },

      // ─────────────────────────────────────────
      // ACTIONS
      // ─────────────────────────────────────────

      /**
       * Set auth state from login/register response
       */
      setAuth: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
          error: null
        });
      },

      /**
       * Clear auth state on logout
       */
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        });
      },

      /**
       * Set loading state
       */
      setLoading: (isLoading) => set({ isLoading }),

      /**
       * Set error state
       */
      setError: (error) => set({ error, isLoading: false }),

      /**
       * Clear error
       */
      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

export default useAuthStore;

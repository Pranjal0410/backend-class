/**
 * App Component
 * Root component with routing and socket initialization
 *
 * ARCHITECTURE:
 * - useSocket hook manages socket lifecycle tied to auth
 * - Protected routes redirect unauthenticated users
 * - Socket connects only after successful auth
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores';
import { useSocket } from './hooks';
import { LoginPage, IncidentListPage, IncidentDetailPage } from './pages';

/**
 * Protected Route wrapper
 * Redirects to login if not authenticated
 */
function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * App Shell
 * Handles socket connection based on auth state
 */
function AppShell({ children }) {
  // Initialize socket when authenticated
  useSocket();

  return <>{children}</>;
}

/**
 * Main App
 */
export function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes */}
          <Route
            path="/incidents"
            element={
              <ProtectedRoute>
                <IncidentListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/incidents/:id"
            element={
              <ProtectedRoute>
                <IncidentDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/incidents" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;

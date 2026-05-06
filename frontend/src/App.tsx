import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import SetupPage from './pages/SetupPage';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';

// Importujemy naszego strażnika
import PublicRoute from './components/PublicRoute'; 

function App() {
  return (
    <Router>
      <Routes>
        
        {/* PUBLIC ROUTES - Chronione przed ZALOGOWANYMI użytkownikami */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />

        {/* DEFAULT REDIRECT - Jeśli wejdziesz na "localhost:5173/" */}
        <Route 
          path="/" 
          element={
            <PublicRoute>
              {/* Jeśli NIE jesteś zalogowany, PublicRoute puści Cię dalej i Navigate wyrzuci Cię na /login */}
              <Navigate to="/login" replace />
            </PublicRoute>
          } 
        />

        {/* PROTECTED ROUTES - Only accessible if logged in */}
        <Route element={<ProtectedRoute />}>
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        
        {/* CATCH ALL - Redirect unknown paths to dashboard (który i tak wyrzuci na login, jeśli ktoś nie ma tokena) */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
        
      </Routes>
    </Router>
  );
}

export default App;
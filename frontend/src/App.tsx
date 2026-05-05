import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/dashboard" element={<div className="min-h-screen bg-slate-900 text-white p-10 text-2xl">Witaj w Dashboardzie! Jesteś zalogowany.</div>} />
      </Routes>
    </Router>
  );
}

export default App;
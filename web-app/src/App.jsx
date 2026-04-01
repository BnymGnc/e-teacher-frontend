import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Toolbar } from '@mui/material';

// Ayırdığımız Bileşenler
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Sayfalarımız
import Dashboard from './components/Dashboard';
import StudySchedule from './components/StudySchedule';
import SavedSchedule from './components/SavedSchedule';
import DailyStudyReport from './components/DailyStudyReport';
import Profile from './components/Profile';
import Login from './components/Login';
import Register from './components/Register';
import TargetNets from './components/TargetNets';
import QuizGenerator from './components/QuizGenerator';
import ExamAnalysis from './components/ExamAnalysis';
import PsychologicalSupport from './components/PsychologicalSupport';
import DocumentSummary from './components/DocumentSummary';

const drawerWidth = 260;

// --- KORUMALI ROTA ---
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = sessionStorage.getItem('access_token');
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// --- ANA PANEL İSKELETİ ---
function AppLayout({ mode, toggleColorMode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);

  const handleDrawerToggle = () => {
    if (window.innerWidth >= 600) setDesktopOpen(!desktopOpen);
    else setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar handleDrawerToggle={handleDrawerToggle} toggleColorMode={toggleColorMode} mode={mode} />
      <Sidebar mobileOpen={mobileOpen} desktopOpen={desktopOpen} handleDrawerToggle={handleDrawerToggle} setMobileOpen={setMobileOpen} drawerWidth={drawerWidth} />
      
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: desktopOpen ? `calc(100% - ${drawerWidth}px)` : '100%' }, transition: 'width 0.2s', minHeight: '100vh' }}>
        <Toolbar /> 
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/schedule" element={<StudySchedule />} />
          <Route path="/saved-schedule" element={<SavedSchedule />} />
          <Route path="/daily-report" element={<DailyStudyReport />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/career" element={<TargetNets />} />
          <Route path="/quiz" element={<QuizGenerator />} />
          <Route path="/analysis" element={<ExamAnalysis />} />
          <Route path="/summary" element={<DocumentSummary />} />
          <Route path="/support" element={<PsychologicalSupport />} />
        </Routes>
      </Box>
    </Box>
  );
}

// --- EN TEPE (TEMA VE ROTALARIN SARILDIĞI YER) ---
export default function App() {
  const [mode, setMode] = useState('dark');
  const toggleColorMode = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: { main: mode === 'dark' ? '#90caf9' : '#1976d2' },
      background: {
        default: mode === 'dark' ? '#121212' : '#f5f5f5',
        paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
      }
    },
    shape: { borderRadius: 12 }
  }), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* GİRİŞ VE KAYIT SAYFALARI (Tema fonksiyonlarını prop olarak yolluyoruz) */}
          <Route path="/login" element={<Login toggleColorMode={toggleColorMode} mode={mode} />} />
          <Route path="/register" element={<Register toggleColorMode={toggleColorMode} mode={mode} />} />

          {/* KORUMALI SAYFALAR */}
          <Route path="/*" element={
            <ProtectedRoute>
              <AppLayout mode={mode} toggleColorMode={toggleColorMode} />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
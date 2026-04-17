import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Button, Container, TextField, Typography, Alert, Paper, IconButton, CircularProgress } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SchoolIcon from '@mui/icons-material/School';
import api from '../lib/api'; // Merkezi API dosyamız

export default function Register({ toggleColorMode, mode }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (password !== password2) {
      setError('Şifreler eşleşmiyor!');
      return;
    }
    
    setLoading(true);
    // Register.jsx içindeki try-catch bloğunu şöyle güncelle:
    try {
      await api.post('/auth/register/', { 
        email: email, 
        password: password 
      });
      
      alert('Kayıt başarılı! Lütfen giriş yapın.');
      navigate('/login');
    } catch (err) {
      // EKLENDİ: Backend "Bu mail zaten var" veya "Şifre harf içermeli" derse ekrana yansıt
      const serverError = err.response?.data?.error || 'Kayıt başarısız oldu. Lütfen tekrar deneyin.';
      setError(serverError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', position: 'relative' }}>
      <IconButton onClick={toggleColorMode} sx={{ position: 'absolute', top: 16, right: 16 }}>
        {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>

      <Container maxWidth="xs">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <SchoolIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h5" component="h1" gutterBottom fontWeight="bold" color="primary.main">
            Hesap Oluştur
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth />
            <TextField label="Şifre" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required fullWidth />
            <TextField label="Şifre (Tekrar)" type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} required fullWidth />
            
            {error && <Alert severity="error">{error}</Alert>}
            
            <Button type="submit" variant="contained" color="success" disabled={loading} size="large" sx={{ mt: 1 }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Kayıt Ol'}
            </Button>
          </Box>
          
          <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
            Zaten hesabın var mı? <Link to="/login" style={{ color: mode === 'dark' ? '#90caf9' : '#1976d2', textDecoration: 'none', fontWeight: 'bold' }}>Giriş Yap</Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
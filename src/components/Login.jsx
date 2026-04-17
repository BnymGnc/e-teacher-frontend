import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Button, Container, TextField, Typography, Alert, Paper, IconButton, CircularProgress } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SchoolIcon from '@mui/icons-material/School';
import api from '../lib/api'; // Merkezi API dosyamız

export default function Login({ toggleColorMode, mode }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Django'ya gerçek giriş isteği atıyoruz
      const response = await api.post('/auth/login/', { 
        username: email, // Django varsayılan olarak username bekler
        password: password 
      });

      // Gelen token'ları tarayıcıya kaydet
      sessionStorage.setItem('access_token', response.data.access);
      sessionStorage.setItem('refresh_token', response.data.refresh);
      
      // Başarılıysa anasayfaya yönlendir
      navigate('/'); 
    } catch (err) {
      setError('Giriş başarısız. Lütfen email ve şifrenizi kontrol edin.');
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
          
          <SchoolIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h5" component="h1" gutterBottom fontWeight="bold" color="primary.main">
            E-Teacher
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Hesabınıza giriş yapın
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth />
            <TextField label="Şifre" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required fullWidth />
            
            {error && <Alert severity="error">{error}</Alert>}
            
            <Button type="submit" variant="contained" disabled={loading} size="large" sx={{ mt: 1 }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Giriş Yap'}
            </Button>
          </Box>

          {/* YENİ EKLENEN BİLGİLENDİRME KUTUSU */}
          <Alert severity="info" sx={{ mt: 3, width: '100%', '& .MuiAlert-message': { fontSize: '0.85rem' } }}>
            <strong>Bilgilendirme:</strong> Projemiz ücretsiz sunucularda barındırıldığı için, siteye ilk girişinizde sistemin uyanması <strong>30-50 saniye</strong> sürebilir. Anlayışınız için teşekkürler.
          </Alert>
          
          <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
            Hesabın yok mu? <Link to="/register" style={{ color: mode === 'dark' ? '#90caf9' : '#1976d2', textDecoration: 'none', fontWeight: 'bold' }}>Kayıt Ol</Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, Avatar, Stack, Alert, CircularProgress } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import api from '../lib/api';

export default function Profile() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // EKLENDİ: Kota state'i
  const [credits, setCredits] = useState(0); 

  const [userData, setUserData] = useState({
    username: '',
    password: ''
  });

  // Kota hesaplaması için maksimum değer
  const MAX_CREDITS = 20;
  const creditPercentage = (credits / MAX_CREDITS) * 100;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/profile/');
        setUserData({
          username: response.data.username || '',
          password: ''
        });
        // EKLENDİ: Sayfa ilk açıldığında kotayı backend'den çek
        setCredits(response.data.ai_credits || 0); 
      } catch (err) {
        console.error("Profil çekme hatası:", err);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Güncelleme isteğini at
      await api.put('/auth/profile/', userData);
      setSuccess(true);
      setUserData(prev => ({ ...prev, password: '' })); // Şifre kutusunu temizle
      
      // 2. Güncel kotayı anında ekrana yansıtmak için profili tekrar çek
      const profileRes = await api.get('/auth/profile/');
      setCredits(profileRes.data.ai_credits);
      
    } catch (err) {
      // 3. Backend'deki özel Regex/Güvenlik mesajlarını ekrana bas
      const serverError = err.response?.data?.error || 'Profil güncellenirken bir hata oluştu.';
      setError(serverError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', mb: 2 }}>
            <PersonIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h5" fontWeight="bold">Profil Ayarları</Typography>
        </Box>

        {/* EKLENDİ: Temaya uygun, sade Kota Göstergesi */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Paper elevation={0} sx={{ p: 2, px: 4, bgcolor: 'action.hover', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress 
                variant="determinate" 
                value={creditPercentage} 
                size={50} 
                thickness={5}
                color={credits < 5 ? "error" : "primary"} 
              />
              <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="subtitle2" component="div" color="text.primary" fontWeight="bold">
                  {credits}
                </Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">Yapay Zeka Kotası</Typography>
              <Typography variant="body2" color="text.secondary">
                Kalan Soru Hakkı: {credits} / {MAX_CREDITS}
              </Typography>
            </Box>
          </Paper>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>Profilin başarıyla güncellendi!</Alert>}

        <Stack spacing={3}>
          <TextField
            fullWidth
            label="E-Posta Adresi"
            name="username" 
            value={userData.username}
            onChange={handleChange}
            variant="outlined"
          />
          
          <TextField
            fullWidth
            label="Yeni Şifre (Değiştirmek istemiyorsanız boş bırakın)"
            name="password"
            type="password"
            value={userData.password}
            onChange={handleChange}
            variant="outlined"
          />
          
          <Button 
            variant="contained" 
            size="large" 
            onClick={handleUpdate}
            disabled={loading}
            sx={{ py: 1.5, mt: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Bilgilerimi Güncelle'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
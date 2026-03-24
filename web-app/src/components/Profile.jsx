import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, Avatar, Stack, Alert, CircularProgress } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import api from '../lib/api';

export default function Profile() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Kullanıcı bilgileri state'i
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '' // Şifre boş gelir, sadece değiştirmek isterse yazar
  });

  // Sayfa yüklendiğinde mevcut bilgileri çek
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/profile/');
        setUserData({
          username: response.data.username || '',
          email: response.data.email || '',
          password: ''
        });
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
      await api.put('/auth/profile/', userData);
      setSuccess(true);
      // Şifre kutusunu temizle
      setUserData(prev => ({ ...prev, password: '' }));
    } catch (err) {
      setError('Profil güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', mb: 2 }}>
            <PersonIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h5" fontWeight="bold">Profil Ayarları</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>Profilin başarıyla güncellendi!</Alert>}

        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Kullanıcı Adı"
            name="username"
            value={userData.username}
            onChange={handleChange}
            variant="outlined"
          />
          <TextField
            fullWidth
            label="E-Posta Adresi"
            name="email"
            type="email"
            value={userData.email}
            disabled // E-posta genellikle değiştirilmez
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
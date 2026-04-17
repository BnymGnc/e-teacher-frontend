import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardActions, Button, CircularProgress, Alert, useTheme, Chip, Divider } from '@mui/material';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import api from '../lib/api'; // API yolunun kendi projene uygun olduğundan emin ol

export default function Lessons() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sayfa açıldığında verileri çekecek tetikleyici
  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      // Backend'deki yeni /lessons/ kapımızı çalıyoruz
      const response = await api.get('/lessons/');
      setLessons(response.data);
    } catch (err) {
      setError('Dersler yüklenirken bir hata oluştu. Lütfen bağlantınızı kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  // Tarihleri Türkiye standartlarına ve okunabilir bir formata çevirme
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" fontWeight="bold" color={isDark ? 'primary.light' : 'primary.dark'} gutterBottom>
        📚 Derslerim
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Yaklaşan ve planlanmış tüm canlı derslerinizi buradan takip edebilir ve doğrudan katılabilirsiniz.
      </Typography>

      {/* Yükleniyor Animasyonu */}
      {loading && (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      )}

      {/* Hata Mesajı */}
      {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

      {/* Ders Yoksa Gösterilecek Bilgi */}
      {!loading && !error && lessons.length === 0 && (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Şu an için planlanmış herhangi bir dersiniz bulunmuyor. Yeni dersler eklendiğinde burada görünecektir.
        </Alert>
      )}

      {/* Ders Kartları (Grid Sistemi) */}
      <Grid container spacing={3}>
        {lessons.map((lesson) => (
          <Grid item xs={12} sm={6} md={4} key={lesson.id}>
            <Card 
              elevation={isDark ? 2 : 4} 
              sx={{ 
                borderRadius: 3, 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out',
                bgcolor: isDark ? 'background.paper' : '#ffffff',
                '&:hover': { transform: 'translateY(-5px)', borderColor: 'primary.main', border: '1px solid' }
              }}
            >
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="h6" fontWeight="bold" color="text.primary">
                    {lesson.title}
                  </Typography>
                  {lesson.is_recurring && (
                    <Chip label="Haftalık" size="small" color="primary" variant="outlined" />
                  )}
                </Box>
                
                <Divider sx={{ mb: 2 }} />

                <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                  <PersonIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Eğitmen: <strong>{lesson.teacher_name}</strong>
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <EventIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(lesson.start_time)}
                  </Typography>
                </Box>

                {lesson.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                    "{lesson.description}"
                  </Typography>
                )}
              </CardContent>

              {/* Katılma Butonu */}
              <CardActions sx={{ p: 3, pt: 0 }}>
                <Button 
                  fullWidth 
                  variant="contained" 
                  color="success" 
                  startIcon={<VideoCallIcon />}
                  href={lesson.meet_link}
                  target="_blank" // Linki yeni sekmede açar
                  rel="noopener noreferrer"
                  sx={{ borderRadius: 2, py: 1.2, fontWeight: 'bold', fontSize: '1rem' }}
                >
                  Derse Katıl
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
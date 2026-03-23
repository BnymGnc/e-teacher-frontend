import React from 'react';
import { Typography, Box, Grid, Paper, Card, CardContent, CardActionArea, Avatar } from '@mui/material';
import { Link } from 'react-router-dom';

// İkonlar
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

export default function Dashboard() {
  
  // Hızlı Erişim Kartları Verisi
  const quickLinks = [
    { title: 'Hedef Netler', desc: 'YÖK Atlas verileriyle hedefini belirle', icon: <SchoolIcon fontSize="large" />, path: '/career', color: '#4caf50' },
    { title: 'Deneme Analizi', desc: 'Netlerini hesapla, AI analiz etsin', icon: <AssessmentOutlinedIcon fontSize="large" />, path: '/analysis', color: '#2196f3' },
    { title: 'Quiz Üret', desc: 'Eksik konularına anında test hazırla', icon: <QuizOutlinedIcon fontSize="large" />, path: '/quiz', color: '#9c27b0' },
    { title: 'Belge Özeti', desc: 'Uzun notları yapay zekaya özetlet', icon: <ArticleOutlinedIcon fontSize="large" />, path: '/summary', color: '#ff9800' },
    { title: 'Psikolojik Destek', desc: 'Sınav stresini rehberinle paylaş', icon: <PsychologyOutlinedIcon fontSize="large" />, path: '/support', color: '#e91e63' },
    { title: 'Günlük Rapor', desc: 'Günün verimliliğini kaydet', icon: <TimelineOutlinedIcon fontSize="large" />, path: '/daily-report', color: '#00bcd4' },
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: { xs: 2, md: 4 }, mb: 6 }}>
      
      {/* KARŞILAMA ALANI */}
      <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, mb: 4, borderRadius: 4, bgcolor: 'primary.main', color: 'primary.contrastText', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>Hoş Geldin, Geleceğin Üniversitelisi! 👋</Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Bugün hedeflerine bir adım daha yaklaşmak için harika bir gün. Nereden başlamak istersin?
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: 'white', color: 'primary.main', width: 64, height: 64 }}>
          <EmojiEventsIcon fontSize="large" />
        </Avatar>
      </Paper>

      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
        Hızlı Erişim ve Yapay Zeka Araçları
      </Typography>

      {/* KARTLARIN DİZİLDİĞİ GRID YAPISI */}
      <Grid container spacing={3}>
        {quickLinks.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card 
              elevation={2} 
              sx={{ 
                height: '100%', 
                borderRadius: 3, 
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s',
                '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 }
              }}
            >
              <CardActionArea component={Link} to={item.path} sx={{ height: '100%' }}>
                <CardContent sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  textAlign: 'center', 
                  py: 4, // Üstten ve alttan biraz daha boşluk vererek ferahlattı
                  px: 2 
                }}>
                  <Avatar sx={{ bgcolor: item.color, width: 56, height: 56, mb: 2 }}>
                    {item.icon}
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.desc}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
        
        {/* BÜYÜK DERS PROGRAMI KARTI */}
        <Grid item xs={12}>
          <Card elevation={2} sx={{ borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', mt: 1 }}>
             <CardActionArea component={Link} to="/schedule" sx={{ p: 2 }}>
                <CardContent sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  textAlign: { xs: 'center', sm: 'left' },
                  gap: 3 
                }}>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.dark', width: 64, height: 64 }}>
                      <CalendarMonthIcon fontSize="large" />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" fontWeight="bold" gutterBottom={false}>Ders Programı Oluşturucu</Typography>
                      <Typography variant="body1" color="text.secondary">Müsaitlik durumuna göre yapay zeka destekli haftalık çalışma planını hazırla.</Typography>
                    </Box>
                  </Box>
                  <Typography variant="button" color="primary" fontWeight="bold">Programı Gör ➔</Typography>
                </CardContent>
             </CardActionArea>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
}
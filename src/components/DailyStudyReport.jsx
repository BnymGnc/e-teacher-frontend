import React, { useState, useEffect } from 'react';
import { Typography, Paper, Box, Button, Stack, Alert, TextField, Card, CardContent, CircularProgress } from '@mui/material';
import { Save, AutoAwesome, CalendarToday } from '@mui/icons-material';
import api from '../lib/api'; // MERKEZİ API DOSYAMIZ EKLENDİ

export default function DailyStudyReport() {
  const [hours, setHours] = useState('');
  const [productivity, setProductivity] = useState('');
  const [message, setMessage] = useState('');
  
  const [aiReport, setAiReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const currentDate = new Date().toISOString().split('T')[0];

  // SAYFA YÜKLENDİĞİNDE BUGÜNÜN RAPORU VARSA VERİTABANINDAN ÇEK
  useEffect(() => {
    const fetchTodayReport = async () => {
      try {
        const response = await api.get(`/report/${currentDate}/`);
        // Backend'den gelen veri yeni veya eski isimlerle uyumlu çekiliyor
        if (response.data && (response.data.productivity || response.data.productivityScore)) {
          setHours(response.data.studyHours?.toString() || '');
          setProductivity((response.data.productivityScore || response.data.productivity)?.toString() || '');
          setMessage(response.data.dailyNotes || response.data.report || '');
        }
      } catch (err) {
        console.error("Bugünün raporu çekilemedi:", err);
      }
    };
    fetchTodayReport();
  }, [currentDate]);

  // GERÇEK YAPAY ZEKA BAĞLANTISI
  const handleGenerateAI = async () => {
    if (!hours || !productivity || !message) {
      setError('Lütfen yapay zeka analizi için saat, verimlilik ve mesaj alanlarını doldurun.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const prompt = `Ben bir öğrenciyim. Bugün ${hours} saat çalıştım ve verimliliğime 10 üzerinden ${productivity} puan verdim. Günüm hakkında şu notu düştüm: "${message}". Bana şefkatli bir rehber öğretmen gibi kısaca motive edici bir değerlendirme yazar mısın?`;
      
      const response = await api.post('/chat/', { message: prompt });
      setAiReport(response.data.reply);
      setSuccess('Yapay Zeka raporu başarıyla oluşturuldu!');
    } catch (err) {
      // Eğer internet/API koparsa eski simülasyon sistemin devreye girsin (Fallback)
      const prodNum = Number(productivity);
      let feedback = '';
      if (prodNum >= 8) feedback = 'Harika bir gün geçirmişsin! Yüksek verimlilikle hedeflerine adım adım yaklaşıyorsun.';
      else if (prodNum >= 5) feedback = 'Ortalama bir gün. Belki aralarda daha verimli molalar vererek odaklanmanı artırabilirsin.';
      else feedback = 'Bugün biraz zorlu geçmiş olabilir. Motivasyonunu düşürme, yarın yeni bir başlangıç yapabilirsin!';

      setAiReport(`Sistem Analizi:\nBugün toplam ${hours} saat çalıştın ve verimliliğini ${productivity}/10 olarak değerlendirdin. ${feedback}`);
      setSuccess('Çevrimdışı rapor oluşturuldu!');
    } finally {
      setLoading(false);
    }
  };

  // GERÇEK VERİTABANI BAĞLANTISI (HATASIZ URL)
  const handleSaveReport = async () => {
    if (!hours || !productivity) {
      setError('Lütfen kaydetmek için en azından çalışma saati ve verimlilik puanı girin.');
      return;
    }

    try {
      // ÇÖZÜM BURADA: Hatalı link yerine, Django'nun tanıdığı "/report/" linki kullanıldı
      await api.post('/report/', { 
        date: currentDate, 
        dailyNotes: message, 
        productivityScore: Number(productivity),
        studyHours: Number(hours)
      });

      setSuccess('Günlük çalışma raporu başarıyla veritabanına kaydedildi! Sağ üstteki panelden görüntüleyebilirsin.');
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      setError('Kaydedilirken bir sunucu hatası oluştu.');
    }
  };

  const getDayOfWeek = (dateString) => {
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    return days[new Date(dateString).getDay()];
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom align="center">Günlük Çalışma Raporu</Typography>
      
      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, color: 'primary.main', mb: 1 }}>
            <CalendarToday />
            <Typography variant="h6" fontWeight="bold">
              {new Date(currentDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} - {getDayOfWeek(currentDate)}
            </Typography>
          </Box>

          <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: 'background.default' }}>
            <CardContent>
              <Stack spacing={3}>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <TextField
                    fullWidth
                    label="Çalışma Süresi (Saat)"
                    type="number"
                    value={hours}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (val !== '' && Number(val) > 16) val = '16';
                      if (val !== '' && Number(val) < 0) val = '0';
                      setHours(val);
                    }}
                    InputProps={{ inputProps: { min: 0, max: 16, step: 0.5 } }}
                    placeholder="En fazla 16 saat"
                  />
                  <TextField
                    fullWidth
                    label="Verimlilik Puanı (1-10)"
                    type="number"
                    value={productivity}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (val !== '' && Number(val) > 10) val = '10';
                      if (val !== '' && Number(val) < 1) val = '1'; 
                      setProductivity(val);
                    }}
                    InputProps={{ inputProps: { min: 1, max: 10 } }}
                    placeholder="1 ile 10 arası"
                  />
                </Box>
                
                <TextField
                  fullWidth
                  label="Günün Özeti / Mesajın"
                  multiline
                  minRows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Bugün nasıl geçti? Hangi konularda zorlandın veya başarılı oldun?"
                />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesome />} 
                    onClick={handleGenerateAI}
                    disabled={loading}
                  >
                    AI ile Rapor Oluştur
                  </Button>
                  <Button 
                    variant="contained" 
                    color="success" 
                    startIcon={<Save />} 
                    onClick={handleSaveReport}
                  >
                    Raporu Kaydet
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
          {success && <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>}

          {aiReport && (
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, borderColor: 'secondary.main', bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom display="flex" alignItems="center" gap={1}>
                <AutoAwesome fontSize="small" /> AI Değerlendirmesi
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                {aiReport}
              </Typography>
            </Paper>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
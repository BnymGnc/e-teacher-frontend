import React, { useState, useEffect } from 'react';
import { Typography, Paper, Box, TextField, Button, Stack, MenuItem, Alert, FormControl, Select, CircularProgress, Chip, Divider } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import api from '../lib/api'; // SADECE BUNU EKLEDİK

export default function ExamAnalysis() {
  const [examType, setExamType] = useState('TYT');
  const [aytTrack, setAytTrack] = useState('Sayısal');
  const [goals, setGoals] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState('');

  // Varsayılan Ders Şablonları
  const [subjects, setSubjects] = useState([
    { name: 'Türkçe', dogru: 0, wrong: 0, blank: 0 },
    { name: 'Matematik', dogru: 0, wrong: 0, blank: 0 },
    { name: 'Fen Bilimleri', dogru: 0, wrong: 0, blank: 0 },
    { name: 'Sosyal Bilimler', dogru: 0, wrong: 0, blank: 0 },
  ]);

  // Sınav Türü veya Alan Değiştiğinde Dersleri Güncelleme
  useEffect(() => {
    if (examType === 'TYT') {
      setSubjects([
        { name: 'Türkçe', dogru: 0, wrong: 0, blank: 0 },
        { name: 'Matematik', dogru: 0, wrong: 0, blank: 0 },
        { name: 'Fen Bilimleri', dogru: 0, wrong: 0, blank: 0 },
        { name: 'Sosyal Bilimler', dogru: 0, wrong: 0, blank: 0 },
      ]);
    } else {
      if (aytTrack === 'Sayısal') {
        setSubjects([
          { name: 'Matematik', dogru: 0, wrong: 0, blank: 0 },
          { name: 'Fizik', dogru: 0, wrong: 0, blank: 0 },
          { name: 'Kimya', dogru: 0, wrong: 0, blank: 0 },
          { name: 'Biyoloji', dogru: 0, wrong: 0, blank: 0 },
        ]);
      } else if (aytTrack === 'Sözel') {
        setSubjects([
          { name: 'Edebiyat', dogru: 0, wrong: 0, blank: 0 },
          { name: 'Tarih', dogru: 0, wrong: 0, blank: 0 },
          { name: 'Coğrafya', dogru: 0, wrong: 0, blank: 0 },
          { name: 'Felsefe / Din', dogru: 0, wrong: 0, blank: 0 },
        ]);
      } else { // Eşit Ağırlık
        setSubjects([
          { name: 'Matematik', dogru: 0, wrong: 0, blank: 0 },
          { name: 'Edebiyat', dogru: 0, wrong: 0, blank: 0 },
          { name: 'Tarih-1', dogru: 0, wrong: 0, blank: 0 },
          { name: 'Coğrafya-1', dogru: 0, wrong: 0, blank: 0 },
        ]);
      }
    }
  }, [examType, aytTrack]);

  // Her ders için maksimum soru sınırını belirleme
  const getSubjectLimit = (name) => {
    if (examType === 'AYT') {
      if (aytTrack === 'Sayısal') {
        if (name === 'Fizik') return 14;
        if (name === 'Kimya' || name === 'Biyoloji') return 13;
        if (name === 'Matematik') return 40;
      }
      if (aytTrack === 'Sözel') {
        if (name === 'Edebiyat') return 24;
        if (name === 'Tarih') return 21;
        if (name === 'Coğrafya') return 17;
        if (name === 'Felsefe / Din') return 18;
      }
      // Eşit Ağırlık
      if (name === 'Matematik') return 40;
      if (name === 'Edebiyat') return 24;
      if (name === 'Tarih-1') return 10;
      if (name === 'Coğrafya-1') return 6;
      return 40;
    }
    // TYT Sınırları
    if (name === 'Türkçe' || name === 'Matematik') return 40;
    return 20; // Fen ve Sosyal
  };

  // Doğru, Yanlış ve Boş Girişlerini Yönetme
  const updateSubject = (idx, field, value) => {
    setSubjects((prev) => prev.map((s, i) => {
      if (i !== idx) return s;
      
      const limit = getSubjectLimit(s.name);
      const val = Math.max(0, Number(value || 0));
      
      let newSubject = { ...s, [field]: val };
      
      if (newSubject.dogru + newSubject.wrong + newSubject.blank > limit) {
        return s; 
      }
      return newSubject;
    }));
  };

  // Net Hesaplamaları
  const computedNets = subjects.map(s => {
    const net = s.dogru - (s.wrong * 0.25);
    return { name: s.name, net: Number(net.toFixed(2)) };
  });

  const totalNet = computedNets.reduce((sum, s) => sum + s.net, 0);

  // SADECE BU FONKSİYONU GERÇEK BACKEND'E BAĞLADIK
  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setResult('');

    try {
      // Backend'deki ML endpoint'imize hesaplanan netleri gönderiyoruz
      const response = await api.post('/ml/exam-analysis/', {
        examType: examType,
        goals: goals,
        subjects: computedNets // Hesaplanan netleri gönderiyoruz
      });

      setResult(response.data.analysis);
    } catch (err) {
      setError('Analiz yapılırken bir hata oluştu. Lütfen bağlantınızı kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 1, md: 2 } }}>
      <Paper elevation={2} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3 }}>
        <Stack spacing={4}>
          
          {/* BAŞLIK */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 1 }}>
            <AssessmentIcon color="primary" sx={{ fontSize: 48 }} />
            <Typography variant="h4" fontWeight="bold" color="primary.main">Deneme Analizi</Typography>
            <Typography variant="body1" color="text.secondary">
              TYT veya AYT denemelerindeki doğru ve yanlışlarınızı girin, netlerinizi hesaplayıp yapay zeka ile analiz edelim.
            </Typography>
          </Box>

          {/* SINAV TÜRÜ SEÇİMİ */}
          <Box sx={{ bgcolor: 'background.default', p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <TextField 
                select 
                label="Sınav Türü" 
                value={examType} 
                onChange={(e) => setExamType(e.target.value)} 
                sx={{ minWidth: 200 }}
              >
                <MenuItem value="TYT">TYT (Temel Yeterlilik Testi)</MenuItem>
                <MenuItem value="AYT">AYT (Alan Yeterlilik Testleri)</MenuItem>
              </TextField>

              {examType === 'AYT' && (
                <FormControl sx={{ minWidth: 200 }}>
                  <TextField
                    select
                    label="AYT Alanı"
                    value={aytTrack}
                    onChange={(e) => setAytTrack(e.target.value)}
                  >
                    <MenuItem value="Sayısal">Sayısal</MenuItem>
                    <MenuItem value="Eşit Ağırlık">Eşit Ağırlık</MenuItem>
                    <MenuItem value="Sözel">Sözel</MenuItem>
                  </TextField>
                </FormControl>
              )}
            </Stack>
          </Box>

          {/* DERSLER VE NET GİRİŞ ALANLARI */}
          <Stack spacing={2}>
            {subjects.map((s, idx) => (
              <Paper key={idx} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={2}>
                  
                  {/* Ders Adı ve Sınırı */}
                  <Box sx={{ width: { xs: '100%', sm: '150px' } }}>
                    <Typography variant="subtitle1" fontWeight="bold">{s.name}</Typography>
                    <Typography variant="caption" color="text.secondary">Maks: {getSubjectLimit(s.name)} Soru</Typography>
                  </Box>

                  {/* Doğru Yanlış Boş Girdileri */}
                  <Stack direction="row" spacing={1} sx={{ flexGrow: 1, width: '100%' }}>
                    <TextField 
                      label="Doğru" type="number" size="small" fullWidth
                      value={s.dogru === 0 ? '' : s.dogru} 
                      onChange={(e) => updateSubject(idx, 'dogru', e.target.value)} 
                      inputProps={{ min: 0 }}
                    />
                    <TextField 
                      label="Yanlış" type="number" size="small" fullWidth
                      value={s.wrong === 0 ? '' : s.wrong} 
                      onChange={(e) => updateSubject(idx, 'wrong', e.target.value)} 
                      inputProps={{ min: 0 }}
                    />
                    <TextField 
                      label="Boş" type="number" size="small" fullWidth
                      value={s.blank === 0 ? '' : s.blank} 
                      onChange={(e) => updateSubject(idx, 'blank', e.target.value)} 
                      inputProps={{ min: 0 }}
                    />
                  </Stack>

                  {/* Net Gösterimi */}
                  <Box sx={{ width: { xs: '100%', sm: '80px' }, textAlign: 'center' }}>
                    <Chip 
                      label={`${computedNets[idx].net} Net`} 
                      color={computedNets[idx].net > 0 ? 'primary' : 'default'} 
                      variant={computedNets[idx].net > 0 ? 'filled' : 'outlined'} 
                    />
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Stack>

          <Divider />

          {/* HEDEFLER VE ANALİZ BUTONU */}
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight="bold">Toplam Net:</Typography>
              <Chip label={`${totalNet.toFixed(2)} NET`} color="success" sx={{ fontSize: '1.2rem', fontWeight: 'bold', p: 1 }} />
            </Box>

            <TextField 
              label="Kişisel Hedefiniz veya Notunuz (Opsiyonel)" 
              multiline 
              minRows={2} 
              value={goals} 
              onChange={(e) => setGoals(e.target.value)} 
              placeholder="Örn: Matematiği fullemek istiyorum, süre yetiştiremedim..."
            />

            <Button variant="contained" size="large" onClick={handleAnalyze} disabled={loading} startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}>
              {loading ? 'Yapay Zeka Analiz Ediyor...' : 'Denemeyi Analiz Et'}
            </Button>
            
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>

          {/* YAPAY ZEKA SONUÇ ALANI */}
          {result && (
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: 'secondary.light', color: 'secondary.contrastText', borderColor: 'secondary.main', animation: 'fadeIn 0.5s' }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom display="flex" alignItems="center" gap={1}>
                <AutoAwesomeIcon /> Analiz Sonucu
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {result}
              </Typography>
            </Paper>
          )}

        </Stack>
      </Paper>
    </Box>
  );
}
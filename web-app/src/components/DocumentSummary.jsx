import React, { useState } from 'react';
import { Typography, Paper, Box, TextField, Button, Stack, Alert, CircularProgress } from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import api from '../lib/api'; // Merkezi API

export default function DocumentSummary() {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSummarize = async () => {
    if (text.trim().length < 50) {
      setError('Lütfen özet çıkarmak için en az 50 karakterlik bir metin girin.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      // Backend'deki gerçek özetleme API'sine istek atıyoruz
      const response = await api.post('/api/summarize/', { text: text });
      setSummary(response.data.summary);
    } catch (err) {
      setError('Özet çıkarılırken bir hata oluştu. Lütfen bağlantınızı kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 1, md: 2 } }}>
      <Paper elevation={2} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3 }}>
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 1 }}>
            <ArticleIcon color="primary" sx={{ fontSize: 48 }} />
            <Typography variant="h4" fontWeight="bold" color="primary.main">Akıllı Belge Özeti</Typography>
            <Typography variant="body1" color="text.secondary">
              Uzun ders notlarınızı veya okuma parçalarınızı aşağıya yapıştırın, yapay zeka sizin için en önemli kısımları özetlesin.
            </Typography>
          </Box>

          <TextField
            label="Özetlenecek Metin"
            multiline
            minRows={6}
            maxRows={12}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Metni buraya yapıştırın..."
            fullWidth
            variant="outlined"
          />

          {error && <Alert severity="error">{error}</Alert>}

          <Button 
            variant="contained" 
            size="large" 
            onClick={handleSummarize} 
            disabled={loading || !text.trim()}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
          >
            {loading ? 'Özet Çıkarılıyor...' : 'Yapay Zeka ile Özetle'}
          </Button>

          {summary && (
            <Paper variant="outlined" sx={{ p: 3, bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 2, animation: 'fadeIn 0.5s' }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom display="flex" alignItems="center" gap={1}>
                <AutoAwesomeIcon /> Özet Sonucu
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {summary}
              </Typography>
            </Paper>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
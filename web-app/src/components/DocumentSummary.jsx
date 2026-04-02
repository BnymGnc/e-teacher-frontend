import React, { useState } from 'react';
import { Typography, Paper, Box, TextField, Button, Stack, Alert, CircularProgress, Divider } from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import api from '../lib/api'; // Merkezi API

export default function DocumentSummary() {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // 1. Manuel Metin Özetleme (Mevcut Fonksiyonun)
  const handleSummarize = async () => {
    if (text.trim().length < 50) {
      setError('Lütfen özet çıkarmak için en az 50 karakterlik bir metin girin.');
      return;
    }
    executeSummary('/summarize/', { text: text });
  };

  // 2. PDF/Dosya Özetleme (Yeni Fonksiyonun)
  const handleFileSummarize = async () => {
    if (!selectedFile) {
      setError('Lütfen önce bir dosya seçin.');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', selectedFile);

    executeSummary('/summarize-file/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  };

  // Ortak Çalıştırma Mantığı
  const executeSummary = async (url, data, config = {}) => {
    setError(null);
    setLoading(true);
    setSummary('');

    try {
      const response = await api.post(url, data, config);
      setSummary(response.data.summary);
    } catch (err) {
      const msg = err.response?.data?.error || 'Özet çıkarılırken bir hata oluştu.';
      setError(msg);
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
              Metin yapıştırın veya bir PDF dosyası yükleyerek yapay zekadan özet isteyin.
            </Typography>
          </Box>

          {/* DOSYA YÜKLEME ALANI */}
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 3, 
              border: '2px dashed', 
              borderColor: selectedFile ? 'success.main' : 'primary.main',
              bgcolor: 'action.hover',
              textAlign: 'center',
              cursor: 'pointer'
            }}
            component="label"
          >
            <input 
              type="file" 
              hidden 
              accept=".pdf,.txt" 
              onChange={(e) => setSelectedFile(e.target.files[0])} 
            />
            <CloudUploadIcon sx={{ fontSize: 40, color: selectedFile ? 'success.main' : 'primary.main', mb: 1 }} />
            <Typography variant="body2" fontWeight="bold">
              {selectedFile ? `Seçili Dosya: ${selectedFile.name}` : 'PDF veya TXT dosyası yüklemek için tıklayın'}
            </Typography>
          </Paper>

          {selectedFile && (
            <Button 
              variant="outlined" 
              color="success" 
              onClick={handleFileSummarize}
              disabled={loading}
              startIcon={<AutoAwesomeIcon />}
            >
              Dosyayı Özetle
            </Button>
          )}

          <Divider>ORADAN VEYA BURADAN</Divider>

          {/* MANUEL METİN ALANI */}
          <TextField
            label="Metin Yapıştır"
            multiline
            minRows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ders notlarını buraya yapıştırın..."
            fullWidth
          />

          {error && <Alert severity="error">{error}</Alert>}

          <Button 
            variant="contained" 
            size="large" 
            onClick={handleSummarize} 
            disabled={loading || (!text.trim() && !selectedFile)}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
          >
            {loading ? 'Özet Çıkarılıyor...' : 'Metni Özetle'}
          </Button>

          {summary && (
            <Paper variant="outlined" sx={{ p: 3, bgcolor: '#f0f7ff', borderLeft: '5px solid', borderColor: 'primary.main', borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" color="primary.dark" gutterBottom display="flex" alignItems="center" gap={1}>
                <AutoAwesomeIcon /> Özet Sonucu
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: '#333' }}>
                {summary}
              </Typography>
            </Paper>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
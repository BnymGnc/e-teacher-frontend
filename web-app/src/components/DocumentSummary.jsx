import React, { useState, useRef } from 'react';
import { Typography, Paper, Box, TextField, Button, Stack, Alert, CircularProgress, Divider, Chip, LinearProgress } from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import api from '../lib/api'; // Merkezi API

export default function DocumentSummary() {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Sınırlarımız
  const MAX_FILE_SIZE_MB = 2;
  const MAX_CHARS = 15000;

  const fileInputRef = useRef(null);

  // Dosya Seçim ve Boyut Kontrolü
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`Dosya boyutu çok büyük! Maksimum ${MAX_FILE_SIZE_MB}MB yükleyebilirsiniz.`);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = ''; 
      return;
    }
    
    setError(null);
    setSelectedFile(file);
    setSummary(''); 
  };

  // Manuel Metin Özetleme
  const handleSummarize = async () => {
    if (text.trim().length < 50) {
      setError('Lütfen özet çıkarmak için en az 50 karakterlik bir metin girin.');
      return;
    }
    executeSummary('/summarize/', { text: text });
  };

  // PDF/Dosya Özetleme
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
      const msg = err.response?.data?.error || 'Özet çıkarılırken hata oluştu. Kotanızı kontrol edin.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isOverLimit = text.length > MAX_CHARS;

  return (
    // STANDART BOYUT: maxWidth 800 ile gözü yormayan okuma/çalışma genişliği
    <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 2, md: 3 } }}>
      
      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      <Stack spacing={4}>
        
        {/* BAŞLIK */}
        <Box sx={{ textAlign: 'center', mb: 1 }}>
          <ArticleIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h4" fontWeight="bold" color="primary.dark" gutterBottom>
            Akıllı Belge Özeti
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Ders notlarınızı yapıştırın veya PDF yükleyin. Yapay zeka sizin için özetlesin.
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

        {/* 1. DOSYA YÜKLEME KARTI */}
        <Paper elevation={2} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <CloudUploadIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">Yöntem 1: Dosya Yükle</Typography>
            </Box>

            <Paper 
              variant="outlined" 
              sx={{ 
                p: 3, 
                border: '2px dashed', 
                borderColor: selectedFile ? 'success.light' : 'divider',
                bgcolor: selectedFile ? 'success.50' : 'background.default',
                textAlign: 'center',
                cursor: 'pointer',
                transition: '0.2s',
                '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
              }}
              component="label"
            >
              <input type="file" hidden accept=".pdf,.txt" ref={fileInputRef} onChange={handleFileChange} />
              {selectedFile ? (
                <Stack alignItems="center" spacing={1}>
                  <CheckCircleIcon color="success" sx={{ fontSize: 36 }} />
                  <Typography variant="body1" fontWeight="bold" color="success.main">
                    {selectedFile.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                </Stack>
              ) : (
                <Stack alignItems="center" spacing={1} sx={{ color: 'text.secondary' }}>
                  <CloudUploadIcon sx={{ fontSize: 40, opacity: 0.7 }} />
                  <Typography variant="body1" fontWeight="bold" color="text.primary">Cihazdan dosya seçin</Typography>
                  <Typography variant="caption">PDF veya TXT (Maks {MAX_FILE_SIZE_MB} MB)</Typography>
                </Stack>
              )}
            </Paper>

            <Button 
              variant="contained" 
              color="success" 
              sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
              onClick={handleFileSummarize}
              disabled={loading || !selectedFile}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
            >
              {loading ? 'İşleniyor...' : 'Dosyayı Özetle'}
            </Button>
          </Stack>
        </Paper>

        <Divider>
          <Chip label="VEYA" size="small" sx={{ fontWeight: 'bold', color: 'text.secondary' }} />
        </Divider>

        {/* 2. METİN YAPIŞTIRMA KARTI */}
        <Paper elevation={2} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <ArticleIcon color="secondary" />
              <Typography variant="h6" fontWeight="bold">Yöntem 2: Metin Yapıştır</Typography>
            </Box>
            
            <TextField
              multiline
              minRows={6}
              maxRows={12}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ders notlarını buraya yapıştırın..."
              fullWidth
              error={isOverLimit}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              helperText={
                <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: isOverLimit ? 'red' : 'inherit' }}>
                    {isOverLimit ? 'Sınırı aştınız!' : `Maksimum ${MAX_CHARS.toLocaleString()} karakter`}
                  </span>
                  <span style={{ color: isOverLimit ? 'red' : 'inherit', fontWeight: 'bold' }}>
                    {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                  </span>
                </Box>
              }
            />

            <Button 
              variant="contained" 
              color="secondary"
              sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
              onClick={handleSummarize} 
              disabled={loading || !text.trim() || isOverLimit}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
            >
              {loading ? 'Özetleniyor...' : 'Metni Özetle'}
            </Button>
          </Stack>
        </Paper>

        {/* ÖZET SONUCU */}
        {summary && (
          <Paper elevation={3} sx={{ p: { xs: 3, md: 4 }, bgcolor: '#f8fbff', borderLeft: '5px solid', borderColor: 'primary.main', borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" color="primary.dark" display="flex" alignItems="center" gap={1} mb={2}>
              <AutoAwesomeIcon color="primary" /> Özet Sonucu
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, color: '#333' }}>
              {summary}
            </Typography>
          </Paper>
        )}

      </Stack>
    </Box>
  );
}
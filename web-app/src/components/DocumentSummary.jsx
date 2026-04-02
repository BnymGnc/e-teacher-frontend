import React, { useState, useRef } from 'react';
import { Typography, Paper, Box, TextField, Button, Stack, Alert, CircularProgress, Divider, LinearProgress, ToggleButton, ToggleButtonGroup } from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import api from '../lib/api'; // Merkezi API

export default function DocumentSummary() {
  const [inputType, setInputType] = useState('file'); // 'file' veya 'text' sekmesi
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const MAX_FILE_SIZE_MB = 2;
  const MAX_CHARS = 15000;
  const fileInputRef = useRef(null);

  // Sekme Değiştirme
  const handleTypeChange = (event, newType) => {
    if (newType !== null) {
      setInputType(newType);
      setError(null); // Sekme değişince eski hataları temizle
    }
  };

  // Dosya Seçim
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

  // Buton Tetikleyicileri
  const handleFileSummarize = () => {
    if (!selectedFile) {
      setError('Lütfen önce bir dosya seçin.');
      return;
    }
    const formData = new FormData();
    formData.append('file', selectedFile);
    executeSummary('/summarize-file/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  };

  const handleTextSummarize = () => {
    if (text.trim().length < 50) {
      setError('Lütfen özet çıkarmak için en az 50 karakterlik bir metin girin.');
      return;
    }
    executeSummary('/summarize/', { text: text });
  };

  const isOverLimit = text.length > MAX_CHARS;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 2, md: 3 } }}>
      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      <Stack spacing={4}>
        
        {/* BAŞLIK */}
        <Box sx={{ textAlign: 'center' }}>
          <ArticleIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h4" fontWeight="bold" color="primary.dark" gutterBottom>
            Akıllı Belge Özeti
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Nasıl özet çıkarmak istediğinizi seçin.
          </Typography>
        </Box>

        {/* SEÇİM ALANI (TABS) */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <ToggleButtonGroup
            color="primary"
            value={inputType}
            exclusive
            onChange={handleTypeChange}
            aria-label="Girdi Türü"
            sx={{ 
              bgcolor: 'background.paper', 
              boxShadow: 2,
              '& .MuiToggleButton-root': { px: 4, py: 1.5, fontWeight: 'bold' },
              '& .Mui-selected': { bgcolor: 'primary.main', color: 'white !important', '&:hover': { bgcolor: 'primary.dark' } }
            }}
          >
            <ToggleButton value="file">
              <CloudUploadIcon sx={{ mr: 1 }} /> Dosya Yükle
            </ToggleButton>
            <ToggleButton value="text">
              <ArticleIcon sx={{ mr: 1 }} /> Metin Yapıştır
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

        {/* DİNAMİK İÇERİK ALANI */}
        <Paper elevation={3} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
          
          {/* DOSYA YÜKLEME GÖRÜNÜMÜ */}
          {inputType === 'file' && (
            <Stack spacing={3}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 4, 
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
                    <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
                    <Typography variant="h6" fontWeight="bold" color="success.main">
                      {selectedFile.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  </Stack>
                ) : (
                  <Stack alignItems="center" spacing={1} sx={{ color: 'text.secondary' }}>
                    <CloudUploadIcon sx={{ fontSize: 50, opacity: 0.7 }} />
                    <Typography variant="h6" fontWeight="bold" color="text.primary">Cihazdan dosya seçin</Typography>
                    <Typography variant="body2">PDF veya TXT (Maks {MAX_FILE_SIZE_MB} MB)</Typography>
                  </Stack>
                )}
              </Paper>

              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
                onClick={handleFileSummarize}
                disabled={loading || !selectedFile}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
              >
                {loading ? 'Dosya İşleniyor...' : 'Dosyayı Özetle'}
              </Button>
            </Stack>
          )}

          {/* METİN YAPIŞTIRMA GÖRÜNÜMÜ */}
          {inputType === 'text' && (
            <Stack spacing={3}>
              <TextField
                multiline
                minRows={8}
                maxRows={15}
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
                color="primary"
                size="large"
                sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
                onClick={handleTextSummarize} 
                disabled={loading || !text.trim() || isOverLimit}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
              >
                {loading ? 'Metin Özetleniyor...' : 'Metni Özetle'}
              </Button>
            </Stack>
          )}

        </Paper>

        {/* ÖZET SONUCU - HEMEN ALTINDA ÇIKACAK */}
        {summary && (
          <Paper elevation={4} sx={{ p: { xs: 3, md: 4 }, bgcolor: '#f8fbff', borderTop: '5px solid', borderColor: 'primary.main', borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" color="primary.dark" display="flex" alignItems="center" gap={1} mb={2}>
              <AutoAwesomeIcon color="primary" /> Yapay Zeka Özeti
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, color: '#2c3e50', fontSize: '1.05rem' }}>
              {summary}
            </Typography>
          </Paper>
        )}

      </Stack>
    </Box>
  );
}
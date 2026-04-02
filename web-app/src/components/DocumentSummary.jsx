import React, { useState, useRef } from 'react';
import { Typography, Paper, Box, TextField, Button, Stack, Alert, CircularProgress, Divider, LinearProgress, Chip } from '@mui/material';
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
      if (fileInputRef.current) fileInputRef.current.value = ''; // Input'u temizle
      return;
    }
    
    setError(null);
    setSelectedFile(file);
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
      const msg = err.response?.data?.error || 'Özet çıkarılırken bir hata oluştu.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Karakter sınırını hesaplama
  const textPercent = (text.length / MAX_CHARS) * 100;
  const isOverLimit = text.length > MAX_CHARS;

  return (
    <Box sx={{ maxWidth: 850, mx: 'auto', p: { xs: 1, md: 3 } }}>
      <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
        
        {/* Üstteki İnce Yükleme Çubuğu */}
        {loading && <LinearProgress color="primary" sx={{ position: 'absolute', top: 0, left: 0, right: 0 }} />}

        <Stack spacing={4}>
          {/* Başlık Alanı */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 1.5 }}>
            <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'primary.light', color: 'primary.main', display: 'flex' }}>
              <ArticleIcon sx={{ fontSize: 40 }} />
            </Box>
            <Typography variant="h4" fontWeight="800" sx={{ background: 'linear-gradient(45deg, #1976d2, #9c27b0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Akıllı Belge Özeti
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
              Uzun ders notlarınızı yapıştırın veya PDF dosyanızı yükleyin. Yapay zeka sizin için en önemli kısımları saniyeler içinde çıkarsın.
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

          {/* DOSYA YÜKLEME ALANI */}
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" gutterBottom>
              BİR DOSYA YÜKLEYİN (Maks {MAX_FILE_SIZE_MB}MB)
            </Typography>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 4, 
                border: '2px dashed', 
                borderColor: selectedFile ? 'success.main' : 'divider',
                bgcolor: selectedFile ? 'success.50' : 'action.hover',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': { borderColor: 'primary.main', bgcolor: 'action.selected' }
              }}
              component="label"
            >
              <input 
                type="file" 
                hidden 
                accept=".pdf,.txt" 
                ref={fileInputRef}
                onChange={handleFileChange} 
              />
              {selectedFile ? (
                <Stack alignItems="center" spacing={1}>
                  <CheckCircleIcon color="success" sx={{ fontSize: 48 }} />
                  <Typography variant="h6" color="success.main" fontWeight="bold">Dosya Hazır</Typography>
                  <Chip icon={<InsertDriveFileIcon />} label={selectedFile.name} color="success" variant="outlined" />
                </Stack>
              ) : (
                <Stack alignItems="center" spacing={1}>
                  <CloudUploadIcon color="primary" sx={{ fontSize: 48, opacity: 0.8 }} />
                  <Typography variant="h6" color="text.primary">PDF veya TXT seçmek için tıklayın</Typography>
                  <Typography variant="body2" color="text.secondary">Sadece metin içeren dosyalar (Maks 2MB)</Typography>
                </Stack>
              )}
            </Paper>

            {selectedFile && (
              <Button 
                variant="contained" 
                color="success" 
                fullWidth
                size="large"
                sx={{ mt: 2, borderRadius: 2, py: 1.5 }}
                onClick={handleFileSummarize}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
              >
                {loading ? 'Dosya Okunuyor & Özetleniyor...' : 'Seçili Dosyayı Özetle'}
              </Button>
            )}
          </Box>

          <Divider sx={{ '&::before, &::after': { borderColor: 'divider' } }}>
            <Chip label="VEYA METİN YAPIŞTIRIN" size="small" sx={{ fontWeight: 'bold', color: 'text.secondary' }} />
          </Divider>

          {/* MANUEL METİN ALANI */}
          <Box>
            <TextField
              label="Özetlenecek Metin"
              multiline
              minRows={5}
              maxRows={10}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ders notlarınızı veya makaleyi buraya yapıştırın..."
              fullWidth
              error={isOverLimit}
              helperText={
                <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <span>{isOverLimit ? 'Karakter sınırını aştınız!' : 'Maksimum 15.000 karakter'}</span>
                  <span>{text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}</span>
                </Box>
              }
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: 2 }
              }}
            />

            <Button 
              variant="contained" 
              size="large" 
              fullWidth
              sx={{ mt: 2, borderRadius: 2, py: 1.5, background: 'linear-gradient(45deg, #1976d2, #2196f3)', '&:hover': { opacity: 0.9 } }}
              onClick={handleSummarize} 
              disabled={loading || !text.trim() || isOverLimit}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
            >
              {loading ? 'Yapay Zeka Çalışıyor...' : 'Metni Özetle'}
            </Button>
          </Box>

          {/* ÖZET SONUCU ALANI */}
          {summary && (
            <Paper elevation={0} sx={{ p: 4, bgcolor: '#f8fbff', border: '1px solid', borderColor: 'primary.light', borderRadius: 3, animation: 'fadeIn 0.5s ease-in-out' }}>
              <Typography variant="h6" fontWeight="bold" color="primary.dark" gutterBottom display="flex" alignItems="center" gap={1.5}>
                <AutoAwesomeIcon color="primary" /> Özet Sonucu
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, color: '#2c3e50', fontSize: '1.05rem' }}>
                {summary}
              </Typography>
            </Paper>
          )}

        </Stack>
      </Paper>
    </Box>
  );
}
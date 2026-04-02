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

  // Sınırlarımız (Backend ile %100 uyumlu)
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
    setSummary(''); // Yeni dosya seçilince eski özeti temizle
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
      const msg = err.response?.data?.error || 'Özet çıkarılırken teknik bir hata oluştu. Kotanızı kontrol edin.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isOverLimit = text.length > MAX_CHARS;

  return (
    // ANA KONTEYNER: Ortalanmış ve Geniş (maxWidth artırıldı)
    <Box sx={{ maxWidth: 1100, mx: 'auto', p: { xs: 2, md: 5 } }}>
      
      {/* GLOBAL YÜKLEME ÇUBUĞU (Kartın en üstünde sabittir) */}
      {loading && <LinearProgress sx={{ mb: 3, borderRadius: 2 }} />}

      <Stack spacing={6} alignItems="center"> {/* spacing={6} ile elemanların arası açıldı, alignItems="center" ile hepsi ortalandı */}
        
        {/* 1. BAŞLIK ALANI: Kocaman ve Tam Ortalanmış */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Box sx={{ display: 'inline-flex', p: 2.5, borderRadius: '50%', bgcolor: 'primary.50', color: 'primary.main', mb: 3, boxShadow: '0 4px 14px 0 rgba(25, 118, 210, 0.2)' }}>
            <ArticleIcon sx={{ fontSize: 50 }} />
          </Box>
          <Typography variant="h2" fontWeight="850" gutterBottom sx={{ background: 'linear-gradient(45deg, #1976d2, #9c27b0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
            Akıllı Belge Özeti
          </Typography>
          <Typography variant="h6" color="text.secondary" fontWeight="400" sx={{ maxWidth: 700, mx: 'auto', lineHeight: 1.6 }}>
            Ders notlarınızı yapıştırın veya PDF yükleyin. Yapay zeka sizin için en kritik bilgileri anında süzüp çıkarsın.
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ width: '100%', borderRadius: 3, fontSize: '1rem' }}>{error}</Alert>}

        {/* 2. DOSYA YÜKLEME BÖLÜMÜ: Kocaman bir Paper Kartı */}
        <Paper elevation={3} sx={{ width: '100%', p: { xs: 4, md: 6 }, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
          <Stack spacing={4} alignItems="center">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, alignSelf: 'flex-start' }}>
              <CloudUploadIcon color="primary" fontSize="large" />
              <Typography variant="h5" fontWeight="bold">Yöntem 1: Dosya Yükleyerek Özetle</Typography>
            </Box>
            
            <Typography variant="body1" color="text.secondary" alignSelf="flex-start">
              Aşağıdaki alana tıklayarak özetlemek istediğiniz PDF veya TXT dosyasını seçin.
            </Typography>

            <Paper 
              variant="outlined" 
              sx={{ 
                width: '100%',
                p: 6, 
                border: '3px dashed', 
                borderColor: selectedFile ? 'success.light' : 'primary.main',
                bgcolor: selectedFile ? 'success.50' : 'action.hover',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': { borderColor: 'primary.dark', bgcolor: 'action.selected', transform: 'scale(1.01)' }
              }}
              component="label"
            >
              <input type="file" hidden accept=".pdf,.txt" ref={fileInputRef} onChange={handleFileChange} />
              {selectedFile ? (
                <Stack alignItems="center" spacing={2}>
                  <CheckCircleIcon color="success" sx={{ fontSize: 60 }} />
                  <Typography variant="h6" fontWeight="bold" color="success.main">
                    Dosya Yüklendi ve Hazır
                  </Typography>
                  <Chip icon={<InsertDriveFileIcon />} label={`${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`} color="success" size="large" />
                </Stack>
              ) : (
                <Stack alignItems="center" spacing={2} sx={{ color: 'text.secondary' }}>
                  <CloudUploadIcon sx={{ fontSize: 70, mb: 1, opacity: 0.6 }} />
                  <Typography variant="h5" fontWeight="bold" color="text.primary">Dosya seçmek için buraya tıklayın</Typography>
                  <Typography variant="body1">Desteklenen formatlar: .PDF, .TXT (Maksimum {MAX_FILE_SIZE_MB} MB)</Typography>
                </Stack>
              )}
            </Paper>

            <Button 
              variant="contained" 
              color="success" 
              size="large"
              fullWidth
              sx={{ borderRadius: 3, py: 2, fontSize: '1.1rem', fontWeight: 'bold' }}
              onClick={handleFileSummarize}
              disabled={loading || !selectedFile}
              startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <AutoAwesomeIcon />}
            >
              {loading ? 'Dosya İşleniyor...' : `Seçili Dosyayı (${selectedFile ? selectedFile.name : ''}) Özetle`}
            </Button>
          </Stack>
        </Paper>

        {/* AYRAÇ: Şık ve Belirgin */}
        <Divider sx={{ width: '100%', '&::before, &::after': { borderColor: 'divider', borderTopWidth: 2 } }}>
          <Chip label="VEYA" size="large" sx={{ fontWeight: 'bold', px: 2, fontSize: '1rem', bgcolor: 'background.paper', border: '2px solid', borderColor: 'divider' }} />
        </Divider>

        {/* 3. METİN YAPIŞTIRMA BÖLÜMÜ: Yine Kocaman bir Paper Kartı */}
        <Paper elevation={3} sx={{ width: '100%', p: { xs: 4, md: 6 }, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
          <Stack spacing={4} alignItems="center">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, alignSelf: 'flex-start' }}>
              <ArticleIcon color="secondary" fontSize="large" />
              <Typography variant="h5" fontWeight="bold">Yöntem 2: Metni Buraya Yapıştır</Typography>
            </Box>

            <Typography variant="body1" color="text.secondary" alignSelf="flex-start">
              Ders notlarınızı, makaleyi veya kopyaladığınız uzun metni aşağıdaki kutuya girin.
            </Typography>
            
            <TextField
              label="Özetlenecek Ders Notları"
              multiline
              minRows={10}
              maxRows={20}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Kopyaladığınız metni buraya yapıştırın..."
              fullWidth
              error={isOverLimit}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, fontSize: '1.05rem', lineHeight: 1.7 } }}
              helperText={
                <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, fontSize: '0.9rem' }}>
                  <Typography variant="caption" color={isOverLimit ? 'error' : 'text.secondary'}>
                    {isOverLimit ? '15.000 karakter sınırını aştınız!' : `En az 50, en fazla ${MAX_CHARS.toLocaleString()} karakter girin.`}
                  </Typography>
                  <Typography variant="caption" fontWeight="bold" color={isOverLimit ? 'error' : 'primary.main'}>
                    {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                  </Typography>
                </Box>
              }
            />

            <Button 
              variant="contained" 
              size="large" 
              fullWidth
              color="secondary"
              sx={{ borderRadius: 3, py: 2, fontSize: '1.1rem', fontWeight: 'bold' }}
              onClick={handleSummarize} 
              disabled={loading || !text.trim() || isOverLimit}
              startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <AutoAwesomeIcon />}
            >
              {loading ? 'Yapay Zeka Çalışıyor...' : 'Metni Özetle'}
            </Button>
          </Stack>
        </Paper>

        {/* 4. ÖZET SONUCU ALANI: Prestijli ve Odaklanmış Sonuç Kartı */}
        {summary && (
          <Paper elevation={6} sx={{ width: '100%', p: { xs: 4, md: 6 }, bgcolor: '#fbfdff', border: '2px solid', borderColor: 'primary.light', borderRadius: 4, animation: 'fadeIn 0.7s ease-out', position: 'relative', overflow: 'hidden' }}>
            
            {/* Arka plan süsü */}
            <AutoAwesomeIcon sx={{ position: 'absolute', top: -20, right: -20, fontSize: 150, color: 'primary.50', opacity: 0.5, transform: 'rotate(15deg)' }} />

            <Stack spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h4" fontWeight="800" color="primary.dark" display="flex" alignItems="center" gap={2}>
                  <AutoAwesomeIcon fontSize="large" color="primary" /> Yapay Zeka Özeti
                </Typography>
                <Chip label="Analiz Tamamlandı" color="success" icon={<CheckCircleIcon />} sx={{ fontWeight: 'bold', p: 1, fontSize: '0.9rem' }} />
              </Box>
              
              <Divider sx={{ borderColor: 'primary.light', borderTopWidth: 2 }} />
              
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 2.0, color: 'text.primary', fontSize: '1.1rem', letterSpacing: '0.01em', textAlign: 'justify' }}>
                {summary}
              </Typography>
            </Stack>
          </Paper>
        )}

      </Stack>
    </Box>
  );
}
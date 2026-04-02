import React, { useState, useRef } from 'react';
import { Typography, Paper, Box, TextField, Button, Stack, Alert, CircularProgress, Divider, Grid, Chip, Card, CardContent } from '@mui/material';
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

  // Sınırlarımız (Backend ile uyumlu)
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
      const msg = err.response?.data?.error || 'Özet çıkarılırken bir hata oluştu. Kotanızı kontrol edin.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isOverLimit = text.length > MAX_CHARS;

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Stack spacing={4}>
        
        {/* MERKEZİ BAŞLIK ALANI (Mükemmel Hizalama) */}
        <Paper elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: 'transparent' }}>
          <Box sx={{ display: 'inline-flex', p: 2, borderRadius: 4, bgcolor: 'primary.50', color: 'primary.main', mb: 2 }}>
            <ArticleIcon sx={{ fontSize: 40 }} />
          </Box>
          <Typography variant="h3" fontWeight="800" gutterBottom sx={{ background: 'linear-gradient(45deg, #1976d2, #9c27b0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Akıllı Belge Özeti
          </Typography>
          <Typography variant="h6" color="text.secondary" fontWeight="400" sx={{ maxWidth: 700, mx: 'auto' }}>
            Ders notlarınızı veya dökümanlarınızı yapay zeka ile anında analiz edin, en önemli kısımları kaçırmayın.
          </Typography>
        </Paper>

        {error && <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>}
        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
            <CircularProgress size={24} />
            <Typography variant="body1" fontWeight="bold" color="primary.main">Yapay Zeka Notlarınızı Okuyor...</Typography>
          </Box>
        )}

        {/* ANA İÇERİK IZGARASI (Yan Yana Denge) */}
        <Grid container spacing={3} alignItems="stretch">
          
          {/* SOL TARAF: DOSYA YÜKLEME KARTI */}
          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ height: '100%', borderRadius: 3, transition: '0.3s', '&:hover': { boxShadow: 6 } }}>
              <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <CloudUploadIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold">Dosya Yükle</Typography>
                </Box>
                
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    flexGrow: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3, 
                    border: '2px dashed', 
                    borderColor: selectedFile ? 'success.light' : 'divider',
                    bgcolor: selectedFile ? 'success.50' : 'background.paper',
                    textAlign: 'center',
                    cursor: 'pointer',
                    minHeight: 180,
                    '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
                  }}
                  component="label"
                >
                  <input type="file" hidden accept=".pdf,.txt" ref={fileInputRef} onChange={handleFileChange} />
                  {selectedFile ? (
                    <Stack alignItems="center" spacing={1}>
                      <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
                      <Typography variant="body1" fontWeight="bold" color="success.main" noWrap sx={{ maxWidth: '100%' }}>
                        {selectedFile.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </Typography>
                    </Stack>
                  ) : (
                    <Stack alignItems="center" spacing={1} sx={{ color: 'text.secondary' }}>
                      <CloudUploadIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                      <Typography variant="body1" fontWeight="bold" color="text.primary">PDF veya TXT seçin</Typography>
                      <Typography variant="caption">Maksimum boyutu: {MAX_FILE_SIZE_MB} MB</Typography>
                    </Stack>
                  )}
                </Paper>

                <Button 
                  variant="contained" 
                  color="success" 
                  fullWidth
                  size="large"
                  sx={{ mt: 3, borderRadius: 2 }}
                  onClick={handleFileSummarize}
                  disabled={loading || !selectedFile}
                  startIcon={<AutoAwesomeIcon />}
                >
                  Dosyayı Özetle
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* SAĞ TARAF: METİN YAPIŞTIRMA KARTI */}
          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ height: '100%', borderRadius: 3, transition: '0.3s', '&:hover': { boxShadow: 6 } }}>
              <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <ArticleIcon color="secondary" />
                  <Typography variant="h6" fontWeight="bold">Metin Yapıştır</Typography>
                </Box>
                
                <TextField
                  label="Notlarınızı Buraya Girin"
                  multiline
                  rows={8}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Kopyaladığınız ders notlarını veya metni buraya yapıştırın..."
                  fullWidth
                  error={isOverLimit}
                  sx={{ flexGrow: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, mb: 2 }}>
                  <Typography variant="caption" color={isOverLimit ? 'error' : 'text.secondary'}>
                    {isOverLimit ? 'Sınırı aştınız!' : `Maksimum ${MAX_CHARS.toLocaleString()} karakter`}
                  </Typography>
                  <Typography variant="caption" fontWeight="bold" color={isOverLimit ? 'error' : 'primary.main'}>
                    {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                  </Typography>
                </Box>

                <Button 
                  variant="contained" 
                  size="large" 
                  fullWidth
                  color="secondary"
                  sx={{ borderRadius: 2 }}
                  onClick={handleSummarize} 
                  disabled={loading || !text.trim() || isOverLimit}
                  startIcon={<AutoAwesomeIcon />}
                >
                  Metni Özetle
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* ÖZET SONUCU ALANI (Tam Genişlikte Sonuç Kartı) */}
        {summary && (
          <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, bgcolor: 'background.paper', borderLeft: '6px solid', borderColor: 'primary.main', borderRadius: 3, animation: 'fadeIn 0.6s ease-out' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h5" fontWeight="bold" color="primary.dark" display="flex" alignItems="center" gap={1.5}>
                <AutoAwesomeIcon /> Yapay Zeka Özeti
              </Typography>
              <Chip label="Başarılı" color="success" icon={<CheckCircleIcon />} />
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.9, color: 'text.primary', fontSize: '1.05rem', letterSpacing: '0.02em' }}>
              {summary}
            </Typography>
          </Paper>
        )}

      </Stack>
    </Box>
  );
}
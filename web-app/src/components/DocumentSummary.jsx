import React, { useState, useRef } from 'react';
import { Typography, Paper, Box, TextField, Button, Stack, Alert, CircularProgress, Divider, LinearProgress, Tabs, Tab } from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import api from '../lib/api'; 

export default function DocumentSummary() {
  const [activeTab, setActiveTab] = useState(0); // 0: Belge, 1: Metin
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const MAX_FILE_SIZE_MB = 2;
  const MAX_CHARS = 15000;
  const fileInputRef = useRef(null);

  // Sekme Değiştirme
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError(null); // Sekme değişince hataları temizle
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

  // Ortak Çalıştırma
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
    <Box sx={{ maxWidth: 850, mx: 'auto', p: { xs: 1, md: 3 } }}>
      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        
        {/* EN TEPEDEKİ YATAY SEÇENEK KUTUCUKLARI (TABS) */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f8fafc' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
            sx={{
              '& .MuiTab-root': { py: 2.5, fontSize: '1.1rem', textTransform: 'none', fontWeight: '500', transition: 'all 0.3s' },
              '& .Mui-selected': { fontWeight: 'bold', bgcolor: 'primary.50' }
            }}
          >
            <Tab icon={<CloudUploadIcon sx={{ mb: 0.5 }} />} label="📄 Belge ile Özet" />
            <Tab icon={<TextSnippetIcon sx={{ mb: 0.5 }} />} label="✍️ Metin ile Özet" />
          </Tabs>
        </Box>

        {/* İÇERİK ALANI */}
        <Box sx={{ p: { xs: 3, md: 5 } }}>
          
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" color="primary.dark" gutterBottom>
              {activeTab === 0 ? 'Belgeden Özet Çıkar' : 'Metinden Özet Çıkar'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {activeTab === 0 
                ? 'PDF veya TXT dosyanızı yükleyin, yapay zeka sizin için analiz etsin.' 
                : 'Ders notlarınızı veya makalenizi aşağıya yapıştırın.'}
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

          {/* SADECE BELGE SEÇİLİYSE GÖSTER */}
          {activeTab === 0 && (
            <Stack spacing={3} animation="fadeIn 0.5s">
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 5, 
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
                    <CheckCircleIcon color="success" sx={{ fontSize: 48 }} />
                    <Typography variant="h6" fontWeight="bold" color="success.main">
                      {selectedFile.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  </Stack>
                ) : (
                  <Stack alignItems="center" spacing={1} sx={{ color: 'text.secondary' }}>
                    <CloudUploadIcon sx={{ fontSize: 56, opacity: 0.7 }} />
                    <Typography variant="h6" fontWeight="bold" color="text.primary">Cihazdan dosya seçin</Typography>
                    <Typography variant="body2">Desteklenen formatlar: PDF, TXT (Maks {MAX_FILE_SIZE_MB} MB)</Typography>
                  </Stack>
                )}
              </Paper>

              <Button 
                variant="contained" 
                size="large"
                sx={{ py: 1.8, borderRadius: 2, fontSize: '1.1rem', fontWeight: 'bold' }}
                onClick={handleFileSummarize}
                disabled={loading || !selectedFile}
                startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <AutoAwesomeIcon />}
              >
                {loading ? 'Yapay Zeka Okuyor...' : 'Dosyayı Özetle'}
              </Button>
            </Stack>
          )}

          {/* SADECE METİN SEÇİLİYSE GÖSTER */}
          {activeTab === 1 && (
            <Stack spacing={3} animation="fadeIn 0.5s">
              <TextField
                multiline
                minRows={8}
                maxRows={15}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Özetlenecek ders notlarını veya kopyaladığınız metni buraya yapıştırın..."
                fullWidth
                error={isOverLimit}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '1.05rem' } }}
                helperText={
                  <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: isOverLimit ? 'red' : 'inherit' }}>
                      {isOverLimit ? 'Sınırı aştınız!' : `En fazla ${MAX_CHARS.toLocaleString()} karakter`}
                    </span>
                    <span style={{ color: isOverLimit ? 'red' : 'inherit', fontWeight: 'bold' }}>
                      {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                    </span>
                  </Box>
                }
              />

              <Button 
                variant="contained" 
                size="large"
                sx={{ py: 1.8, borderRadius: 2, fontSize: '1.1rem', fontWeight: 'bold' }}
                onClick={handleTextSummarize} 
                disabled={loading || !text.trim() || isOverLimit}
                startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <AutoAwesomeIcon />}
              >
                {loading ? 'Yapay Zeka Çalışıyor...' : 'Metni Özetle'}
              </Button>
            </Stack>
          )}

          {/* ÖZET SONUCU (Her iki sekmede de ortak) */}
          {summary && (
            <Box sx={{ mt: 5, animation: 'fadeIn 0.6s ease-out' }}>
              <Paper elevation={4} sx={{ p: 4, bgcolor: '#f8fbff', borderTop: '5px solid', borderColor: 'primary.main', borderRadius: 2 }}>
                <Typography variant="h5" fontWeight="bold" color="primary.dark" display="flex" alignItems="center" gap={1.5} mb={2}>
                  <AutoAwesomeIcon color="primary" fontSize="large" /> Yapay Zeka Özeti
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.9, color: '#2c3e50', fontSize: '1.1rem' }}>
                  {summary}
                </Typography>
              </Paper>
            </Box>
          )}

        </Box>
      </Paper>
    </Box>
  );
}
import React, { useState, useMemo } from 'react';
import { Typography, Paper, Box, Stack, Chip, Alert, Divider, Button, CircularProgress, Table, TableHead, TableRow, TableCell, TableBody, Autocomplete, TextField, ToggleButtonGroup, ToggleButton } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import TimelineIcon from '@mui/icons-material/Timeline';

import { yokAtlasData } from '../data/yokAtlasData';
import api from '../lib/api'; // Merkezi API dosyamızı ekledik

export default function TargetNets() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Seçili değerler
  const [scoreType, setScoreType] = useState('SAY'); // Varsayılan: Sayısal
  const [university, setUniversity] = useState(null);
  const [department, setDepartment] = useState(null);
  const [targetData, setTargetData] = useState(null);

  // Üniversite listesini çekiyoruz
  const universityOptions = useMemo(() => Object.keys(yokAtlasData), []);
  
  // Seçilen Üniversite ve Puan Türüne göre bölümleri filtreliyoruz
  const departmentOptions = useMemo(() => {
    if (!university || !yokAtlasData[university]) return [];
    
    // Sadece seçili puan türüne ait bölümleri listele
    const allDepts = yokAtlasData[university];
    return Object.keys(allDepts).filter(dept => allDepts[dept].puan_turu === scoreType);
  }, [university, scoreType]);

  const handleScoreTypeChange = (event, newScoreType) => {
    if (newScoreType !== null) {
      setScoreType(newScoreType);
      setDepartment(null); // Puan türü değişince bölümü sıfırla
      setTargetData(null);
    }
  };

  // GERÇEK BACKEND İSTEĞİ BURAYA EKLENDİ
  const handleGenerateNets = async () => {
    if (!university || !department) {
      setError('Lütfen listeden bir üniversite ve bölüm seçin.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      // Backend'deki Makine Öğrenmesi (ML) rotamıza verileri gönderiyoruz
      const response = await api.post('/ml/target-nets/', {
        university: university,
        department: department
      });

      // Tasarımının bozulmaması için senin orijinal YÖK Atlas verilerini de alıyoruz
      const selectedData = yokAtlasData[university][department];
      
      setTargetData({
        university: university,
        department: department,
        scoreType: selectedData.puan_turu,
        historical_data: selectedData.historical_data,
        tyt_subject_nets: selectedData.tyt_subject_nets,
        ayt_subject_nets: selectedData.ayt_subject_nets,
        // İstersen ileride modelden gelen analizi de kullanabilirsin:
        // ml_analysis: response.data.analysis 
      });

    } catch (err) {
      setError('Veriler alınırken veya yapay zeka analizi yapılırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 1, md: 2 } }}>
      <Paper elevation={2} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3 }}>
        <Stack spacing={4}>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 1 }}>
            <SchoolIcon color="primary" sx={{ fontSize: 48 }} />
            <Typography variant="h4" fontWeight="bold" color="primary.main">Hedef Netler & YÖK Verileri</Typography>
            <Typography variant="body1" color="text.secondary">
              Puan türünüzü, üniversiteyi ve bölümü seçerek geçmiş yıllara ait taban sıralamaları öğrenebilirsiniz.
            </Typography>
          </Box>

          <Box sx={{ bgcolor: 'background.default', p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={3} mb={3}>
              
              {/* Puan Türü Seçici */}
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <ToggleButtonGroup
                  color="primary"
                  value={scoreType}
                  exclusive
                  onChange={handleScoreTypeChange}
                  aria-label="Puan Türü"
                >
                  <ToggleButton value="SAY" sx={{ px: 3, fontWeight: 'bold' }}>Sayısal</ToggleButton>
                  <ToggleButton value="EA" sx={{ px: 3, fontWeight: 'bold' }}>Eşit Ağırlık</ToggleButton>
                  <ToggleButton value="SÖZ" sx={{ px: 3, fontWeight: 'bold' }}>Sözel</ToggleButton>
                  <ToggleButton value="DİL" sx={{ px: 3, fontWeight: 'bold' }}>Dil</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Autocomplete
                  fullWidth
                  options={universityOptions}
                  value={university}
                  onChange={(event, newValue) => {
                    setUniversity(newValue);
                    setDepartment(null);
                    setTargetData(null);
                  }}
                  renderInput={(params) => <TextField {...params} label="Üniversite Seçin" />}
                />

                <Autocomplete
                  fullWidth
                  options={departmentOptions}
                  value={department}
                  disabled={!university || departmentOptions.length === 0}
                  onChange={(event, newValue) => {
                    setDepartment(newValue);
                    setTargetData(null);
                  }}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Bölüm Seçin" 
                      placeholder={
                        !university ? "Önce üniversite seçin" : 
                        departmentOptions.length === 0 ? `Bu üniversitede ${scoreType} bölümü yok` : "Seçiniz"
                      } 
                    />
                  )}
                />
              </Stack>
            </Stack>
            
            <Button variant="contained" size="large" fullWidth onClick={handleGenerateNets} disabled={loading || !university || !department}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Geçmiş Verileri ve Hedef Netleri Getir'}
            </Button>
            
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </Box>

          {targetData && (
            <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
              <Typography variant="h6" fontWeight="bold" textAlign="center" gutterBottom>
                {targetData.university} - {targetData.department} <Chip label={targetData.scoreType} color="primary" size="small" sx={{ ml: 1, verticalAlign: 'middle' }} />
              </Typography>
              
              <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', mb: 4 }}>
                <Box sx={{ bgcolor: 'primary.main', p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', gap: 1 }}>
                  <TimelineIcon />
                  <Typography variant="subtitle1" fontWeight="bold">Yıllara Göre Taban Sıralama & Net Analizi</Typography>
                </Box>
                <Table size="medium">
                  <TableHead sx={{ bgcolor: 'action.hover' }}>
                    <TableRow>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Yıl</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>TYT Neti</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>AYT / YDT Neti</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Taban Sıralama</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {targetData.historical_data.map((row) => (
                      <TableRow key={row.year} hover>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>{row.year}</TableCell>
                        <TableCell align="center" sx={{ color: 'primary.main', fontWeight: 'bold' }}>{row.tyt}</TableCell>
                        <TableCell align="center" sx={{ color: 'secondary.main', fontWeight: 'bold' }}>{row.ayt}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', color: 'error.main' }}>{row.rank}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>

              <Typography variant="h6" fontWeight="bold" textAlign="center" gutterBottom>
                Son Yerleşen Öğrencinin Ortalama Ders Netleri
              </Typography>
              
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                <Paper variant="outlined" sx={{ flex: 1, p: 3, borderRadius: 3, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary.main" textAlign="center">
                    TYT Netleri
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="center">
                    {Object.entries(targetData.tyt_subject_nets).map(([s, n]) => (
                      <Chip key={`tyt-${s}`} label={`${s}: ${n}`} variant="outlined" color="primary" />
                    ))}
                  </Stack>
                </Paper>

                <Paper variant="outlined" sx={{ flex: 1, p: 3, borderRadius: 3, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="secondary.main" textAlign="center">
                    {targetData.scoreType === 'DİL' ? 'YDT Netleri' : 'AYT Netleri'}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="center">
                    {Object.entries(targetData.ayt_subject_nets).map(([s, n]) => (
                      <Chip key={`ayt-${s}`} label={`${s}: ${n}`} variant="outlined" color="secondary" />
                    ))}
                  </Stack>
                </Paper>
              </Stack>
            </Box>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
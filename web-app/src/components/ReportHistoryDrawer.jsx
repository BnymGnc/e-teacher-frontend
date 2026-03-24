import React, { useState, useEffect } from 'react';
import { Drawer, Box, Typography, Divider, CircularProgress, IconButton, Paper, Stack, Chip, Grid } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import api from '../lib/api';

export default function ReportHistoryDrawer({ open, onClose }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchReports();
    }
  }, [open]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await api.get('/report/all/');
      
      // Konsolda [ {date: ...}, {date: ...} ] şeklinde bir DİZİ görmeliyiz
      console.log("GELEN LİSTE:", response.data);
      
      if (Array.isArray(response.data)) {
        setReports(response.data);
      } else {
        setReports([]); // Veri liste değilse boşalt
      }
      
    } catch (error) {
      console.error("Raporlar çekilemedi", error);
    } finally {
      setLoading(false);
    }
  };

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyReports = reports.filter(r => r.date && r.date.startsWith(currentMonth));

  const calcAverage = (dataList, key) => {
    if (dataList.length === 0) return 0;
    const total = dataList.reduce((sum, r) => sum + Number(r[key] || 0), 0);
    return (total / dataList.length).toFixed(1);
  };

  const overallProd = calcAverage(reports, 'productivityScore');
  const overallHours = calcAverage(reports, 'studyHours');
  const monthlyProd = calcAverage(monthlyReports, 'productivityScore');
  const monthlyHours = calcAverage(monthlyReports, 'studyHours');

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 450 }, bgcolor: 'background.default' } }}>
      
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1}>
          <CalendarTodayIcon /> Rapor & Analiz
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ p: 2 }}>
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <EqualizerIcon color="primary" /> İstatistik Tablosu
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Paper elevation={2} sx={{ p: 2, borderRadius: 3, bgcolor: 'secondary.light', color: 'secondary.contrastText', textAlign: 'center' }}>
                  <Typography variant="caption" fontWeight="bold" sx={{ opacity: 0.9 }}>BU AYIN ORTALAMASI</Typography>
                  <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.3)' }} />
                  <Typography variant="h5" fontWeight="bold">{monthlyHours} Saat</Typography>
                  <Typography variant="body2">{monthlyProd} / 10 Verim</Typography>
                </Paper>
              </Grid>

              <Grid item xs={6}>
                <Paper elevation={2} sx={{ p: 2, borderRadius: 3, bgcolor: 'primary.light', color: 'primary.contrastText', textAlign: 'center' }}>
                  <Typography variant="caption" fontWeight="bold" sx={{ opacity: 0.9 }}>GENEL ORTALAMA</Typography>
                  <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.3)' }} />
                  <Typography variant="h5" fontWeight="bold">{overallHours} Saat</Typography>
                  <Typography variant="body2">{overallProd} / 10 Verim</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
            Günlük Kayıtlar
          </Typography>

          {reports.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
              Henüz kaydedilmiş bir raporun yok.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {reports.map((report, idx) => {
                const prod = report.productivityScore || 0;
                const hours = report.studyHours || 0;
                return (
                  <Paper key={idx} variant="outlined" sx={{ p: 2, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.paper' }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
                      {report.date}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip 
                        icon={<AccessTimeIcon fontSize="small" />} 
                        label={`${hours} Saat`} 
                        size="small" 
                        color="info" 
                        variant="outlined" 
                      />
                      <Chip 
                        label={`Verim: ${prod}/10`} 
                        size="small" 
                        color={prod > 6 ? "success" : prod > 4 ? "warning" : "error"} 
                      />
                    </Box>
                  </Paper>
                );
              })}
            </Stack>
          )}
        </Box>
      )}
    </Drawer>
  );
}
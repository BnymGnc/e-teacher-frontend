import React, { useState, useEffect } from 'react';
import { Drawer, Box, Typography, Divider, CircularProgress, IconButton, Paper, Stack, Chip, Grid } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import api from '../lib/api';

export default function ReportHistoryDrawer({ open, onClose }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (open) fetchReports(); }, [open]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await api.get('/report/all/');
      // Backend'den gelen veriyi dizi olarak kaydet
      setReports(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Rapor çekme hatası", error);
    } finally {
      setLoading(false);
    }
  };

  // İstatistik hesaplamaları (productivityScore ve studyHours üzerinden)
  const calcAverage = (list, key) => {
    if (!list || list.length === 0) return 0;
    const total = list.reduce((sum, r) => sum + Number(r[key] || 0), 0);
    return (total / list.length).toFixed(1);
  };

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthly = reports.filter(r => r.date?.startsWith(currentMonth));

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 450 } } }}>
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6">Rapor Arşivi</Typography>
        <IconButton onClick={onClose} color="inherit"><CloseIcon /></IconButton>
      </Box>

      {loading ? <CircularProgress sx={{ m: 5 }} /> : (
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
                <Typography variant="caption">GENEL ORTALAMA</Typography>
                <Typography variant="h5">{calcAverage(reports, 'studyHours')}s</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.light', color: 'white' }}>
                <Typography variant="caption">AYLIK VERİM</Typography>
                <Typography variant="h5">{calcAverage(monthly, 'productivityScore')}/10</Typography>
              </Paper>
            </Grid>
          </Grid>

          <Stack spacing={2}>
            {reports.map((report, idx) => (
              <Paper key={idx} variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Typography fontWeight="bold">{report.date}</Typography>
                <Box>
                  <Chip label={`${report.studyHours} Saat`} size="small" sx={{ mr: 1 }} />
                  <Chip label={`Verim: ${report.productivityScore}`} size="small" color="primary" />
                </Box>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}
    </Drawer>
  );
}
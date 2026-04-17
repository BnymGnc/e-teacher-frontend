import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Switch, FormControlLabel, CircularProgress, Alert, Link } from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import api from '../lib/api'; 

export default function LessonScheduler() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    summary: '',
    start_time: '',
    end_time: '',
    is_recurring: false
  });

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Backend'e dinamik verileri yolluyoruz
      const response = await api.post('/calendar/create-lesson/', formData);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Ders oluşturulamadı. Takvimi bağladığınızdan emin olun.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 3, maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <EventAvailableIcon color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h5" fontWeight="bold">Yeni Etüt Planla</Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Ders Adı (Örn: Veri Yapıları)"
          name="summary"
          value={formData.summary}
          onChange={handleChange}
          required
          sx={{ mb: 3 }}
        />

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            label="Başlangıç Zamanı"
            type="datetime-local"
            name="start_time"
            value={formData.start_time}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            fullWidth
            label="Bitiş Zamanı"
            type="datetime-local"
            name="end_time"
            value={formData.end_time}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            required
          />
        </Box>

        <FormControlLabel
          control={<Switch checked={formData.is_recurring} onChange={handleChange} name="is_recurring" color="primary" />}
          label="Bu dersi her hafta tekrarla"
          sx={{ mb: 3 }}
        />

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        
        {result && (
          <Alert severity="success" sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="subtitle2" fontWeight="bold">Ders Başarıyla Planlandı!</Typography>
            <Box mt={1}>
               <Typography variant="caption" color="text.secondary">📹 Google Meet Linki:</Typography><br/>
               <Link href={result.meet_link} target="_blank" fontWeight="bold">{result.meet_link}</Link>
            </Box>
            <Box mt={1}>
               <Typography variant="caption" color="text.secondary">🗓️ Takvimde Görüntüle:</Typography><br/>
               <Link href={result.event_link} target="_blank">Takvimde Aç</Link>
            </Box>
          </Alert>
        )}

        <Button 
          type="submit" 
          variant="contained" 
          size="large" 
          fullWidth 
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Takvime Ekle ve Link Üret'}
        </Button>
      </form>
    </Paper>
  );
}
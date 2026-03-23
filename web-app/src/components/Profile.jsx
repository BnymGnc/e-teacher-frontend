import React, { useEffect, useState } from 'react';
import { Typography, Paper, Box, TextField, Button, Stack, List, ListItem, ListItemText, Divider, Chip } from '@mui/material';
import { AccessTime, TrendingUp, CalendarToday } from '@mui/icons-material';

export default function Profile() {
  const [profile, setProfile] = useState({ full_name: 'Öğrenci', username: 'ogrenci', email: 'ogrenci@e-teacher.com', bio: '' });
  const [saving, setSaving] = useState(false);
  const [dailyReports, setDailyReports] = useState([]);

  useEffect(() => {
    // Profil bilgilerini (şimdilik statik/mock) yükleme
    // İleride buraya api.get('/api/me/profile/') eklenebilir
    
    // LocalStorage'dan Daily Reports verilerini çekme
    const savedReports = JSON.parse(localStorage.getItem('daily_reports') || '[]');
    setDailyReports(savedReports);
  }, []);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1000); // Mock kaydetme
  };

  // Tarihi "20 Nisan" formatına çeviren yardımcı fonksiyon
  const formatDate = (isoString) => {
    const options = { day: 'numeric', month: 'long' };
    return new Date(isoString).toLocaleDateString('tr-TR', options);
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>Profilim</Typography>
      
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="flex-start">
        
        {/* SOL TARAF - PROFİL BİLGİLERİ */}
        <Paper sx={{ p: 3, flex: 1, width: '100%', borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom mb={2}>Kişisel Bilgiler</Typography>
          <Stack spacing={2}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField size="small" label="Kullanıcı Adı" value={profile.username} disabled fullWidth />
              <TextField size="small" label="E-posta" value={profile.email} disabled fullWidth />
              <TextField size="small" label="Ad Soyad" value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} fullWidth sx={{ gridColumn: { xs: 'auto', sm: '1 / span 2' } }} />
              <TextField size="small" label="Biyografi" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} multiline minRows={3} fullWidth sx={{ gridColumn: { xs: 'auto', sm: '1 / span 2' } }} />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" onClick={handleSave} disabled={saving}>
                {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
              </Button>
            </Box>
          </Stack>
        </Paper>

        {/* SAĞ TARAF - GÜNLÜK ÇALIŞMA GEÇMİŞİ */}
        <Paper variant="outlined" sx={{ p: 0, flex: 1, width: '100%', borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ p: 2, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" display="flex" alignItems="center" gap={1}>
              <CalendarToday fontSize="small" /> Günlük Çalışma Geçmişi
            </Typography>
          </Box>
          
          {dailyReports.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">Henüz bir çalışma raporu kaydedilmemiş.</Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {dailyReports.map((report, index) => (
                <React.Fragment key={report.id}>
                  <ListItem sx={{ py: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                        {formatDate(report.date)}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Chip 
                          icon={<AccessTime fontSize="small" />} 
                          label={`${report.hours} Saat`} 
                          size="small" 
                          color="default" 
                          variant="outlined" 
                        />
                        <Chip 
                          icon={<TrendingUp fontSize="small" />} 
                          label={`${report.productivity}/10`} 
                          size="small" 
                          color={report.productivity >= 7 ? "success" : report.productivity >= 4 ? "warning" : "error"} 
                        />
                      </Stack>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', width: '100%' }}>
                      "{report.message}"
                    </Typography>
                  </ListItem>
                  {index < dailyReports.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
        
      </Stack>
    </Box>
  );
}
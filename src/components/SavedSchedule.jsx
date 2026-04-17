import React, { useEffect, useMemo, useState } from 'react';
import { Box, Container, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, Alert, CircularProgress } from '@mui/material';
import api from '../lib/api'; // Merkezi API dosyamız (Backend'e bağlanmak için)

export default function SavedSchedule() {
  const [latestSchedule, setLatestSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Programı localStorage'dan değil, direkt KİŞİYE ÖZEL Backend'den çekiyoruz
    const fetchSchedule = async () => {
      try {
        const response = await api.get('/schedule/');
        if (response.data && response.data.schedule) {
          // Gelen program dizisini (array) sarıp sarmalıyoruz ki alttaki tablo okuyabilsin
          setLatestSchedule({ schedule: response.data.schedule }); 
        } else {
          setLatestSchedule(null);
        }
      } catch (err) {
        console.error("Program çekilirken hata:", err);
        setError("Programınız yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h5" gutterBottom align="center" fontWeight="bold" color="primary.dark">
        Kaydedilen Ders Programım
      </Typography>
      
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: 'background.default', boxShadow: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : !latestSchedule ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            Henüz kaydedilmiş bir ders programınız yok. Önce "Ders Programı" sayfasından bir program oluşturup kaydedin.
          </Alert>
        ) : (
          <ScheduleTable schedule={latestSchedule.schedule || []} />
        )}
      </Paper>
    </Container>
  );
}

// Sadece Görüntüleme (Read-Only) Yapan Tablo Bileşeni (DEĞİŞMEDİ, ÇOK İYİ)
function ScheduleTable({ schedule }) {
  const hours = useMemo(() => Array.from({ length: 12 }, (_, i) => 8 + i), []);
  const days = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'];
  
  const cellMap = useMemo(() => {
    const map = {};
    for (const d of schedule) {
      for (const it of d.items) {
        const m = it.match(/(\d{2}):00-(\d{2}):00$/);
        if (m) {
          const start = parseInt(m[1]);
          const end = parseInt(m[2]);
          const course = it.replace(/\s\d{2}:00-\d{2}:00$/, '');
          for (let h = start; h < end; h++) map[`${d.day}-${h}`] = course;
        }
      }
    }
    return map;
  }, [schedule]);

  return (
    <Box sx={{ overflowX: 'auto', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
      <Table size="small" sx={{ borderCollapse: 'separate', borderSpacing: 0, minWidth: 600 }}>
        <TableHead sx={{ bgcolor: 'action.hover' }}>
          <TableRow>
            <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontWeight: 700 }}>Saat</TableCell>
            {days.map((d, i) => (
              <TableCell key={d} sx={{ borderRight: i < days.length - 1 ? '1px solid' : 'none', borderColor: 'divider', fontWeight: 700, textAlign: 'center' }}>{d}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {hours.map((h, rowIdx) => (
            <TableRow key={h} sx={{ bgcolor: rowIdx % 2 === 0 ? 'background.paper' : 'background.default' }}>
              <TableCell sx={{ fontWeight: 600, borderRight: '1px solid', borderColor: 'divider', borderTop: '1px solid' }}>{String(h).padStart(2,'0')}:00</TableCell>
              {days.map((d, i) => {
                const course = cellMap[`${d}-${h}`];
                return (
                  <TableCell key={`${d}-${h}`} sx={{ 
                    borderRight: i < days.length - 1 ? '1px solid' : 'none', 
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    bgcolor: course ? '#e3f2fd' : 'transparent',
                    textAlign: 'center',
                    fontWeight: course ? 'bold' : 'normal',
                    color: course ? '#0d47a1' : 'inherit',
                    transition: 'all 0.2s',
                    '&:hover': course ? { bgcolor: '#bbdefb' } : {}
                  }}>
                    {course || ''}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
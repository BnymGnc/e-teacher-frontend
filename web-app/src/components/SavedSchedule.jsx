import React, { useEffect, useMemo, useState } from 'react';
import { Box, Container, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, Alert } from '@mui/material';

export default function SavedSchedule() {
  const [latestSchedule, setLatestSchedule] = useState(null);

  useEffect(() => {
    // Backend gelene kadar geçici olarak localStorage'dan okuyoruz
    const saved = JSON.parse(localStorage.getItem('saved_schedules') || '[]');
    if (saved.length > 0) {
      setLatestSchedule(saved[0]); // En son kaydedilen programı al
    }
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h5" gutterBottom align="center">Kaydedilen Ders Programım</Typography>
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: 'background.default' }}>
        {!latestSchedule ? (
          <Alert severity="info">Henüz kaydedilmiş bir ders programınız yok. Önce "Ders Programı" sayfasından bir program oluşturup kaydedin.</Alert>
        ) : (
          <ScheduleTable schedule={latestSchedule.schedule || []} />
        )}
      </Paper>
    </Container>
  );
}

// Sadece Görüntüleme (Read-Only) Yapan Tablo Bileşeni
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
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ borderCollapse: 'separate', borderSpacing: 0, minWidth: 600 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ borderRight: '1px solid', borderColor: 'divider', fontWeight: 600 }}>Saat</TableCell>
            {days.map((d, i) => (
              <TableCell key={d} sx={{ borderRight: i < days.length - 1 ? '1px solid' : 'none', borderColor: 'divider', fontWeight: 600, textAlign: 'center' }}>{d}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {hours.map(h => (
            <TableRow key={h}>
              <TableCell sx={{ fontWeight: 600, borderRight: '1px solid', borderColor: 'divider' }}>{String(h).padStart(2,'0')}:00</TableCell>
              {days.map((d, i) => {
                const course = cellMap[`${d}-${h}`];
                return (
                  <TableCell key={`${d}-${h}`} sx={{ 
                    borderRight: i < days.length - 1 ? '1px solid' : 'none', 
                    borderColor: 'divider',
                    bgcolor: course ? '#e3f2fd' : 'transparent',
                    textAlign: 'center',
                    fontWeight: course ? 'bold' : 'normal',
                    color: course ? '#0d47a1' : 'inherit'
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
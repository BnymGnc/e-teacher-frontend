import React, { useState, useEffect, useMemo } from 'react';
import { Typography, Paper, Box, TextField, Button, Stack, Alert, MenuItem, Select, FormControl, IconButton } from '@mui/material';
import { Save, TouchApp, Close } from '@mui/icons-material';
import api from '../lib/api'; 

export default function StudySchedule() {
  const [loading, setLoading] = useState(false); // Bunu ekle ki setLoading çalışsın!
  const [courseInput, setCourseInput] = useState('');
  const [courseHours, setCourseHours] = useState(1);
  const [schedule, setSchedule] = useState([]);
  const [savedSchedules, setSavedSchedules] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Tıklayarak yerleştirmek için seçili olan dersi tutar
  const [activeTool, setActiveTool] = useState(null); 
  
  const hours = useMemo(() => Array.from({ length: 12 }, (_, i) => 8 + i), []); // 08-19
  const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  
  const [cells, setCells] = useState({});
  const [dayState, setDayState] = useState({});
  const [selectedSubjects, setSelectedSubjects] = useState({});

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const res = await api.get('/schedule/');
        if (res.data && res.data.schedule) {
          setSchedule(res.data.schedule);
        }
      } catch (err) {
        console.log("Henüz kayıtlı bir program yok veya oturum kapalı.");
      }
    };
    loadInitialData();
  }, []);

  const loadSavedSchedules = async () => {
    try {
      const res = await api.get('/schedule/');
      if (res.data && res.data.schedule) {
        setSchedule(res.data.schedule);
      }
    } catch (err) {
      console.error("Program yüklenirken hata:", err);
    }
  };

  function cellColor(state) {
    if (state === 'red') return 'error.light';
    if (state === 'yellow') return 'warning.light';
    if (state === 'green') return 'success.light';
    return 'background.paper';
  }

  function toggleCell(day, hour) {
    const key = `${day}-${hour}`;
    setCells((prev) => {
      const curr = prev[key];
      let next;
      if (!curr) next = 'green';
      else if (curr === 'green') next = 'yellow';
      else if (curr === 'yellow') next = 'red';
      else next = 'green';
      return { ...prev, [key]: next };
    });
    setError(null);
  }

  function toggleDayHeader(day) {
    const current = dayState[day];
    let next = !current ? 'green' : (current === 'green' ? 'yellow' : (current === 'yellow' ? 'red' : 'green'));
    setDayState((d) => ({ ...d, [day]: next }));
    
    setCells((prev) => {
      const updated = { ...prev };
      for (const h of hours) updated[`${day}-${h}`] = next;
      return updated;
    });
  }

  // --- HÜCREYE TIKLAMA MANTIĞI ---
  function handleCellClick(day, hour) {
    const timeStr = `${String(hour).padStart(2,'0')}:00-${String(hour+1).padStart(2,'0')}:00`;
    
    // 1. Hücrede zaten bir ders var mı kontrol et
    let existingCourse = null;
    schedule.forEach(dObj => {
      if (dObj.day === day) {
        dObj.items.forEach(it => {
          if (it.endsWith(timeStr)) existingCourse = it.replace(/\s\d{2}:00-\d{2}:00$/, '');
        });
      }
    });

    // Eğer ders varsa: Dersi tablodan sil ve aşağıya iade et
    if (existingCourse) {
      setSchedule(prev => prev.map(dObj => dObj.day === day ? { ...dObj, items: dObj.items.filter(it => !it.endsWith(timeStr)) } : dObj));
      setSelectedSubjects(prev => ({ ...prev, [existingCourse]: (prev[existingCourse] || 0) + 1 }));
      return;
    }

    // 2. Aşağıdan bir ders seçilmişse yerleştir
    if (activeTool && selectedSubjects[activeTool] > 0) {
      if (cells[`${day}-${hour}`] === 'red') {
        setError("Kırmızı (Müsait Değil) alana ders yerleştiremezsiniz.");
        return;
      }

      setSchedule(prev => {
        let copy = prev.length ? JSON.parse(JSON.stringify(prev)) : days.map(d => ({ day: d, items: [] }));
        let dayObj = copy.find(d => d.day === day);
        dayObj.items.push(`${activeTool} ${timeStr}`);
        return copy;
      });

      setSelectedSubjects(prev => {
        const newVal = prev[activeTool] - 1;
        if (newVal === 0) setActiveTool(null);
        return { ...prev, [activeTool]: newVal };
      });
      setError(null);
    } 
    // 3. Ders seçili değilse müsaitlik (renk) değiştir
    else {
      toggleCell(day, hour);
    }
  }

  // --- PROGRAM ÖNER ALGORİTMASI ---
  function handleAutoSuggest() {
    setError(null); setSuccess(null);
    
    const subjectsToPlace = Object.entries(selectedSubjects).filter(([_, hrs]) => hrs > 0);
    if (subjectsToPlace.length === 0) {
      return setError("Yerleştirilecek ders bulunamadı. Lütfen önce ders ekleyin.");
    }

    const totalNeeded = subjectsToPlace.reduce((sum, [_, hrs]) => sum + hrs, 0);
    
    const greenSlots = [];
    const yellowSlots = [];

    days.forEach(d => {
      hours.forEach(h => {
        const timeStr = `${String(h).padStart(2,'0')}:00-${String(h+1).padStart(2,'0')}:00`;
        const isOccupied = schedule.some(dObj => dObj.day === d && dObj.items.some(it => it.endsWith(timeStr)));
        
        if (!isOccupied) {
          if (cells[`${d}-${h}`] === 'green') greenSlots.push({ day: d, hour: h });
          else if (cells[`${d}-${h}`] === 'yellow') yellowSlots.push({ day: d, hour: h });
        }
      });
    });

    if (greenSlots.length + yellowSlots.length === 0) {
      return setError("Müsaitlik durumu yok! Lütfen tablodan yeşil veya sarı alanlar belirleyin.");
    }

    if (totalNeeded > greenSlots.length + yellowSlots.length) {
      return setError(`Müsaitlik durumu yetersiz! Eklediğiniz dersler ${totalNeeded} saat, ancak ${greenSlots.length + yellowSlots.length} saat boş alanınız var.`);
    }

    const slotsByDayGreen = {};
    const slotsByDayYellow = {};
    days.forEach(d => {
      slotsByDayGreen[d] = greenSlots.filter(s => s.day === d);
      slotsByDayYellow[d] = yellowSlots.filter(s => s.day === d);
    });

    let newSchedule = schedule.length ? JSON.parse(JSON.stringify(schedule)) : days.map(d => ({ day: d, items: [] }));
    let remainingSubjects = { ...selectedSubjects };

    let greenDayIdx = 0;
    let yellowDayIdx = 0;

    for (let [subj, hrs] of Object.entries(remainingSubjects)) {
      while (hrs > 0) {
        let placed = false;
        
        for (let i = 0; i < days.length; i++) {
          let d = days[(greenDayIdx + i) % days.length];
          if (slotsByDayGreen[d] && slotsByDayGreen[d].length > 0) {
            let slot = slotsByDayGreen[d].shift();
            const timeStr = `${String(slot.hour).padStart(2,'0')}:00-${String(slot.hour+1).padStart(2,'0')}:00`;
            newSchedule.find(s => s.day === d).items.push(`${subj} ${timeStr}`);
            greenDayIdx = (greenDayIdx + i + 1) % days.length; 
            hrs--; placed = true; break;
          }
        }
        if (placed) continue;

        for (let i = 0; i < days.length; i++) {
          let d = days[(yellowDayIdx + i) % days.length];
          if (slotsByDayYellow[d] && slotsByDayYellow[d].length > 0) {
            let slot = slotsByDayYellow[d].shift();
            const timeStr = `${String(slot.hour).padStart(2,'0')}:00-${String(slot.hour+1).padStart(2,'0')}:00`;
            newSchedule.find(s => s.day === d).items.push(`${subj} ${timeStr}`);
            yellowDayIdx = (yellowDayIdx + i + 1) % days.length;
            hrs--; placed = true; break;
          }
        }
        if (placed) continue;
        break;
      }
      remainingSubjects[subj] = hrs; 
    }

    setSchedule(newSchedule);
    setSelectedSubjects(remainingSubjects);
    setSuccess('Dersler yeşil ve sarı saatlere günlere dağıtılarak başarıyla yerleştirildi!');
  }

  const saveSchedule = async () => {
    if (schedule.length === 0) {
      setError('Kaydedilecek program bulunamadı');
      return;
    }

    setLoading(true); // İşlem başladı
    setError(null);
    setSuccess(null);

    try {
      // Veriyi veritabanına gönderiyoruz
      await api.post('/schedule/', { schedule: schedule });
      
      setSuccess('Program başarıyla veritabanına kaydedildi!');
    } catch (err) {
      console.error("Program kaydetme hatası:", err);
      setError('Program veritabanına kaydedilemedi. Lütfen giriş yaptığınızdan emin olun.');
    } finally {
      setLoading(false); // İşlem bitti
    }
  };

  const placedMap = useMemo(() => {
    const map = {};
    for (const d of schedule) {
      for (const it of d.items) {
        const m = it.match(/(\d{2}):00-(\d{2}):00$/);
        if (m) {
          const course = it.replace(/\s\d{2}:00-\d{2}:00$/, '');
          map[`${d.day}-${parseInt(m[1])}`] = course;
        }
      }
    }
    return map;
  }, [schedule]);

  return (
    <Box>
      <Typography variant="h5" gutterBottom align="center">Ders Programı Önerisi</Typography>
      
      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, maxWidth: 1300, mx: 'auto' }}>
        <Stack spacing={3}>
          
          {/* ORTALANMIŞ BİLGİLENDİRME KUTUSU */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
            <Paper elevation={0} sx={{ p: 1.5, px: 3, bgcolor: 'action.hover', borderRadius: 2, maxWidth: 700 }}>
              <Typography variant="body2" textAlign="center" fontWeight={500}>
                Aşağıdaki takvim üzerinden müsaitlik durumunu belirleyebilirsin.
              </Typography>
              <Typography variant="caption" display="block" textAlign="center" color="text.secondary" mt={0.5}>
                💡 <strong>Nasıl Kullanılır:</strong> Gün başlıklarına veya saatlere tıklayarak müsaitlik rengini değiştirin.
                Aşağıdan ders ekledikten sonra, ilgili derse tıklayıp (aktif edip) tablodaki boş bir hücreye tıklarsanız ders oraya yerleşir.
              </Typography>
            </Paper>
          </Box>
          
          <Stack direction="row" spacing={3} justifyContent="center" alignItems="center">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Box sx={{ width: 14, height: 14, bgcolor: 'success.light', borderRadius: 0.5 }} /> <Typography variant="caption">Müsait (Yeşil)</Typography></Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Box sx={{ width: 14, height: 14, bgcolor: 'warning.light', borderRadius: 0.5 }} /> <Typography variant="caption">Orta (Sarı)</Typography></Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Box sx={{ width: 14, height: 14, bgcolor: 'error.light', borderRadius: 0.5 }} /> <Typography variant="caption">Dolu (Kırmızı)</Typography></Box>
          </Stack>

          {/* TABLO ALANI */}
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, width: 'max-content', overflowX: 'auto', pb: 1 }}>
              <Box sx={{ minWidth: 80 }}>
                <Paper variant="outlined" sx={{ p: 1, borderRadius: 2, bgcolor: 'background.default' }}>
                  <Box sx={{ mb: 1, p: 1, textAlign: 'center', fontWeight: 600 }}>Saat</Box>
                  <Stack spacing={0.5}>
                    {hours.map((h) => (
                      <Box key={`hour-${h}`} sx={{ height: 40, borderBottom: '1px dashed', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="caption" color="text.secondary">{String(h).padStart(2,'0')}:00</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              </Box>
              {days.map((d) => (
                <Box key={d} sx={{ minWidth: 100 }}>
                  <Paper variant="outlined" sx={{ p: 1, borderRadius: 2, bgcolor: 'background.default' }}>
                    <Box onClick={() => toggleDayHeader(d)} 
                      sx={{ mb: 1, p: 1, borderRadius: 1.5, textAlign: 'center', fontWeight: 600, cursor: 'pointer', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', transition: 'all 120ms ease', '&:hover': { transform: 'scale(1.02)', borderColor: 'primary.main' } }}>
                      {d}
                    </Box>
                    <Stack spacing={0.5}>
                      {hours.map((h) => {
                        const isPlaced = placedMap[`${d}-${h}`];
                        return (
                          <Box key={`${d}-${h}`}
                            onClick={() => handleCellClick(d, h)}
                            sx={{ 
                              height: 40, borderRadius: 1, cursor: 'pointer', border: '1px solid', borderColor: 'divider', 
                              bgcolor: isPlaced ? '#e3f2fd' : cellColor(cells[`${d}-${h}`]), 
                              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 120ms ease',
                              '&:hover': { opacity: 0.8 }
                            }}>
                            {isPlaced && (
                              <Typography variant="caption" sx={{ fontWeight: 700, color: '#0d47a1', px: 0.5 }}>
                                {isPlaced}
                              </Typography>
                            )}
                          </Box>
                        );
                      })}
                    </Stack>
                  </Paper>
                </Box>
              ))}
            </Box>
          </Box>
          
          {/* DERS EKLEME VE KUTUCUKLAR */}
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: 'background.default', maxWidth: 800, width: '100%' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom align="center">Ders Ekle & Yerleştir</Typography>
              
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
                <TextField size="small" placeholder="Ders adı (Örn: Matematik)" value={courseInput} onChange={(e) => setCourseInput(e.target.value)} sx={{ width: 250 }} />
                <FormControl size="small" sx={{ width: 100 }}>
                  <Select value={courseHours} onChange={(e) => setCourseHours(Number(e.target.value))}>
                    {[1,2,3,4,5,6,7,8,9,10].map(h => <MenuItem key={h} value={h}>{h} Saat</MenuItem>)}
                  </Select>
                </FormControl>
                <Button variant="contained" onClick={() => {
                  const v = courseInput.trim();
                  if (!v || courseHours <= 0) return;
                  setSelectedSubjects(prev => ({ ...prev, [v]: (prev[v] || 0) + courseHours }));
                  setCourseInput(''); setCourseHours(1);
                }}>Ekle</Button>
              </Stack>

              {Object.keys(selectedSubjects).length > 0 && (
                <Box sx={{ mt: 4, p: 2, border: '1px dashed', borderColor: 'primary.main', borderRadius: 2, bgcolor: 'background.paper', textAlign: 'center' }}>
                  <Typography variant="caption" color="primary" fontWeight="bold" display="flex" alignItems="center" justifyContent="center" gap={0.5} mb={2}>
                    <TouchApp fontSize="small" /> Tabloya yerleştirmek istediğin derse tıkla (Aktif et), ardından tablodaki boşluğa tıkla:
                  </Typography>
                  <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center" useFlexGap sx={{ pt: 1 }}>
                    {Object.entries(selectedSubjects).map(([subj, hrs]) => hrs > 0 && (
                      <Paper 
                        key={subj} 
                        elevation={activeTool === subj ? 4 : 1}
                        onClick={() => setActiveTool(activeTool === subj ? null : subj)}
                        sx={{ 
                          p: 1.5, minWidth: 110, textAlign: 'center', cursor: 'pointer', borderRadius: 2,
                          bgcolor: activeTool === subj ? 'primary.main' : 'background.default',
                          color: activeTool === subj ? 'primary.contrastText' : 'text.primary',
                          border: '2px solid', borderColor: activeTool === subj ? 'primary.main' : 'divider',
                          transition: 'all 0.2s ease', '&:hover': { transform: 'translateY(-2px)' },
                          position: 'relative'
                        }}
                      >
                        {/* X (Sil) Butonu */}
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSubjects(prev => {
                              const copy = { ...prev };
                              delete copy[subj];
                              return copy;
                            });
                            if (activeTool === subj) setActiveTool(null);
                          }}
                          sx={{ 
                            position: 'absolute', top: -10, right: -10, 
                            bgcolor: 'error.main', color: 'white', width: 22, height: 22,
                            boxShadow: 2, '&:hover': { bgcolor: 'error.dark' }
                          }}
                        >
                          <Close sx={{ fontSize: 14 }} />
                        </IconButton>

                        <Typography variant="body2" fontWeight="bold">{subj}</Typography>
                        <Typography variant="caption" display="block">{hrs} Saat Kaldı</Typography>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              )}
            </Paper>
          </Box>

          {/* MESAJLAR VE BUTONLAR */}
          {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
          {success && <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>}
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button variant="contained" color="success" onClick={handleAutoSuggest}>Program Öner</Button>
            <Button variant="contained" color="success" onClick={saveSchedule} startIcon={<Save />} disabled={schedule.length === 0}>
              Programı Kaydet
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
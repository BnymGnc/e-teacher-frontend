import React, { useState } from 'react';
import { Typography, Paper, Box, TextField, Button, Stack, Alert, CircularProgress, MenuItem, Radio, RadioGroup, FormControlLabel, FormControl, Divider } from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import api from '../lib/api';

export default function QuizGenerator() {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Orta');
  const [count, setCount] = useState(3);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quiz, setQuiz] = useState(null);
  
  // Kullanıcının verdiği cevapları tutan state { soruIndex: 'Seçilen Cevap' }
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Lütfen bir konu girin.');
      return;
    }
    setError(null);
    setLoading(true);
    setQuiz(null);
    setAnswers({});
    setShowResults(false);

    try {
      const response = await api.post('/api/quiz-generate/', {
        topic: topic,
        difficulty: difficulty,
        count: count
      });
      setQuiz(response.data.quiz);
    } catch (err) {
      setError('Quiz üretilemedi. Konuyu değiştirip tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (qIndex, value) => {
    if (!showResults) {
      setAnswers(prev => ({ ...prev, [qIndex]: value }));
    }
  };

  const calculateScore = () => {
    let correctCount = 0;
    quiz.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) correctCount++;
    });
    return correctCount;
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 1, md: 2 } }}>
      <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3 }}>
        <Stack spacing={4}>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'primary.main' }}>
            <QuizIcon sx={{ fontSize: 40 }} />
            <Typography variant="h4" fontWeight="bold">AI Quiz Üretici</Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Eksik hissettiğiniz konuyu yazın, yapay zeka size anında özel bir test hazırlasın.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField 
              fullWidth label="Konu (Örn: Logaritma, Kurtuluş Savaşı)" 
              value={topic} onChange={(e) => setTopic(e.target.value)} 
            />
            <TextField 
              select label="Zorluk" 
              value={difficulty} onChange={(e) => setDifficulty(e.target.value)} 
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="Kolay">Kolay</MenuItem>
              <MenuItem value="Orta">Orta</MenuItem>
              <MenuItem value="Zor">Zor</MenuItem>
            </TextField>
            <TextField 
              select label="Soru Sayısı" 
              value={count} onChange={(e) => setCount(e.target.value)} 
              sx={{ minWidth: 120 }}
            >
              <MenuItem value={3}>3 Soru</MenuItem>
              <MenuItem value={5}>5 Soru</MenuItem>
              <MenuItem value={10}>10 Soru</MenuItem>
            </TextField>
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}

          <Button 
            variant="contained" size="large" onClick={handleGenerate} 
            disabled={loading || !topic}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
          >
            {loading ? 'Sorular Hazırlanıyor...' : 'Quizi Oluştur'}
          </Button>

          {/* QUİZ ÇÖZME EKRANI */}
          {quiz && quiz.length > 0 && (
            <Box sx={{ mt: 4, animation: 'fadeIn 0.5s' }}>
              <Divider sx={{ mb: 4 }} />
              <Stack spacing={4}>
                {quiz.map((q, qIndex) => (
                  <Paper key={qIndex} variant="outlined" sx={{ p: 3, borderRadius: 2, bgcolor: showResults && answers[qIndex] !== q.correctAnswer ? 'error.50' : 'background.paper' }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {qIndex + 1}. {q.question}
                    </Typography>
                    
                    <FormControl component="fieldset" sx={{ width: '100%', mt: 1 }}>
                      <RadioGroup value={answers[qIndex] || ''} onChange={(e) => handleAnswerSelect(qIndex, e.target.value)}>
                        {q.options.map((opt, optIndex) => {
                          const isSelected = answers[qIndex] === opt;
                          const isCorrect = opt === q.correctAnswer;
                          
                          let color = "primary";
                          let icon = null;

                          if (showResults) {
                            if (isCorrect) {
                              color = "success";
                              icon = <CheckCircleIcon color="success" sx={{ ml: 1 }} />;
                            } else if (isSelected && !isCorrect) {
                              color = "error";
                              icon = <CancelIcon color="error" sx={{ ml: 1 }} />;
                            }
                          }

                          return (
                            <Box key={optIndex} sx={{ display: 'flex', alignItems: 'center', p: 1, borderRadius: 1, bgcolor: showResults && isCorrect ? 'success.light' : 'transparent' }}>
                              <FormControlLabel 
                                value={opt} 
                                control={<Radio color={color} />} 
                                label={<Typography sx={{ color: showResults && isCorrect ? 'success.contrastText' : 'inherit' }}>{opt}</Typography>}
                                disabled={showResults}
                              />
                              {icon}
                            </Box>
                          );
                        })}
                      </RadioGroup>
                    </FormControl>

                    {showResults && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', color: 'info.contrastText', borderRadius: 2 }}>
                        <Typography variant="subtitle2" fontWeight="bold">Açıklama:</Typography>
                        <Typography variant="body2">{q.explanation}</Typography>
                      </Box>
                    )}
                  </Paper>
                ))}

                {!showResults ? (
                  <Button variant="contained" color="success" size="large" onClick={() => setShowResults(true)} disabled={Object.keys(answers).length < quiz.length}>
                    Testi Bitir ve Sonuçları Gör
                  </Button>
                ) : (
                  <Paper elevation={3} sx={{ p: 3, textAlign: 'center', bgcolor: 'primary.main', color: 'white', borderRadius: 3 }}>
                    <Typography variant="h5" fontWeight="bold">
                      Test Sonucu: {calculateScore()} / {quiz.length} Doğru
                    </Typography>
                  </Paper>
                )}
              </Stack>
            </Box>
          )}

        </Stack>
      </Paper>
    </Box>
  );
}
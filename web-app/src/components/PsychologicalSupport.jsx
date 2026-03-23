import React, { useState, useRef, useEffect } from 'react';
import { Typography, Paper, Box, TextField, IconButton, Stack, Avatar, Alert, CircularProgress } from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import api from '../lib/api';

export default function PsychologicalSupport() {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Merhaba! Ben senin dijital rehberinim. Sınav stresi, motivasyon eksikliği veya planlama konusunda kendini nasıl hissediyorsun? Benimle paylaşabilirsin.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      // Backend'deki Chat API'sine mesajı gönder
      const response = await api.post('/api/chat/', { message: userMsg.text });
      
      const aiMsg = { sender: 'ai', text: response.data.reply };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setError('Mesaj gönderilirken bir hata oluştu.');
      // Kullanıcının mesajını geri almasını kolaylaştırmak için hata anında state'i düzeltmiyoruz, sadece uyarıyoruz.
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
        <PsychologyIcon color="secondary" sx={{ fontSize: 40 }} />
        <Typography variant="h5" fontWeight="bold" color="secondary.main">Rehberlik & Psikolojik Destek</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={3} sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 3 }}>
        
        {/* Mesajlaşma Alanı */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 2, bgcolor: 'background.default' }}>
          {messages.map((msg, idx) => (
            <Box key={idx} sx={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', gap: 1 }}>
              {msg.sender === 'ai' && (
                <Avatar sx={{ bgcolor: 'secondary.main' }}><PsychologyIcon /></Avatar>
              )}
              
              <Paper sx={{ p: 2, maxWidth: '75%', borderRadius: 3, bgcolor: msg.sender === 'user' ? 'primary.main' : 'background.paper', color: msg.sender === 'user' ? 'primary.contrastText' : 'text.primary', borderTopRightRadius: msg.sender === 'user' ? 4 : 24, borderTopLeftRadius: msg.sender === 'ai' ? 4 : 24 }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{msg.text}</Typography>
              </Paper>
              
              {msg.sender === 'user' && (
                <Avatar sx={{ bgcolor: 'primary.dark' }}><PersonIcon /></Avatar>
              )}
            </Box>
          ))}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 1 }}>
              <Avatar sx={{ bgcolor: 'secondary.main' }}><PsychologyIcon /></Avatar>
              <Paper sx={{ p: 2, borderRadius: 3, bgcolor: 'background.paper' }}>
                <CircularProgress size={20} color="secondary" />
              </Paper>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Mesaj Gönderme Alanı */}
        <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" spacing={1}>
            <TextField 
              fullWidth 
              placeholder="Düşüncelerini buraya yaz..." 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if(e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              variant="outlined"
              size="small"
              multiline
              maxRows={3}
            />
            <IconButton color="primary" onClick={handleSend} disabled={!input.trim() || loading} sx={{ bgcolor: 'primary.light', '&:hover': { bgcolor: 'primary.main', color: 'white' } }}>
              <SendIcon />
            </IconButton>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
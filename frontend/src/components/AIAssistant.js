import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  CircularProgress,
  Divider
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';

const AIAssistant = () => {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([
    { role: 'ai', text: 'Bonjour ! Je suis votre assistant ClientFlow. Comment puis-je vous aider aujourd\'hui ?' }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = { role: 'user', text: message };
    setChat((prev) => [...prev, userMessage]);
    setMessage('');
    setLoading(true);

    try {
      // Note: Ensure your AI service is running on port 8000
      const res = await axios.post('http://localhost:8000/chat', { message: userMessage.text });
      setChat((prev) => [...prev, { role: 'ai', text: res.data.response }]);
    } catch (err) {
      console.error(err);
      setChat((prev) => [...prev, { role: 'ai', text: "Désolé, je rencontre un problème de connexion avec mon cerveau (Service IA)." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Box sx={{ height: '80vh', display: 'flex', flexDirection: 'column', p: 2 }}>
      <Paper
        elevation={3}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 4
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center' }}>
          <SmartToyIcon sx={{ mr: 2 }} />
          <Typography variant="h6">Assistant ClientFlow</Typography>
        </Box>

        {/* Chat Area */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: '#f5f5f5' }}>
          <List>
            {chat.map((msg, index) => (
              <ListItem key={index} sx={{ justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {msg.role === 'ai' && (
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      <SmartToyIcon />
                    </Avatar>
                  </ListItemAvatar>
                )}

                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    maxWidth: '70%',
                    borderRadius: 2,
                    bgcolor: msg.role === 'user' ? 'primary.light' : 'white',
                    color: msg.role === 'user' ? 'white' : 'text.primary'
                  }}
                >
                  <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</Typography>
                </Paper>

                {msg.role === 'user' && (
                  <ListItemAvatar sx={{ ml: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.dark' }}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                )}
              </ListItem>
            ))}
            {loading && (
              <ListItem sx={{ justifyContent: 'flex-start' }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    <SmartToyIcon />
                  </Avatar>
                </ListItemAvatar>
                <Paper sx={{ p: 2, borderRadius: 2 }}>
                  <CircularProgress size={20} />
                </Paper>
              </ListItem>
            )}
            <div ref={messagesEndRef} />
          </List>
        </Box>

        <Divider />

        {/* Input Area */}
        <Box sx={{ p: 2, bgcolor: 'white', display: 'flex', alignItems: 'center' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Posez votre question..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            sx={{ mr: 2, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
          <IconButton
            color="primary"
            onClick={sendMessage}
            disabled={loading || !message.trim()}
            size="large"
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default AIAssistant;
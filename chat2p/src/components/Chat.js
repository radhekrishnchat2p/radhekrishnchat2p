import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../Images/Flute.png';
import radhaImage from '../Images/Radha.jpg';
import krishnaImage from '../Images/Krishna.jpg';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Paper,
  TextField,
  List,
  ListItem,
  ListItemText,
  Stack,
  Avatar,
} from '@mui/material';
// import SendIcon from '@mui/icons-material/Send'; // Temporarily commented out

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isAtBottom, setIsAtBottom] = useState(true);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const wasAtBottomRef = useRef(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 50; // 50px tolerance
      setIsAtBottom(atBottom);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    if (!token) {
      navigate('/');
      return;
    }
    setUsername(storedUsername);
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000); // Poll every 2 seconds
    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const fetchMessages = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/messages`, {
        headers: { Authorization: token },
      });
      const data = await response.json();
      const wasAtBottom = isAtBottom;
      setMessages(data.messages || []);
      if (wasAtBottom) {
        setTimeout(() => scrollToBottom(), 0); // Delay to ensure DOM update
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const token = localStorage.getItem('token');
    const receiver = username === 'Radha' ? 'Krishna' : 'Radha';
    try {
      await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({ receiver, message: newMessage }),
      });
      setNewMessage('');
      fetchMessages();
      setIsAtBottom(true); // Ensure scroll to bottom after sending
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      sendMessage();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/');
  };

  const handleClearChat = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/clear-chat`, {
        method: 'POST',
        headers: { Authorization: token },
      });
      if (response.ok) {
        setMessages([]);
      } else {
        console.error('Failed to clear chat');
      }
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  const getDateLabel = (date) => {
    const today = new Date();
    const messageDate = new Date(date);
    const diffTime = today - messageDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  const groupMessagesByDate = (messages) => {
    const grouped = {};
    messages.forEach(msg => {
      const date = new Date(msg.timestamp).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(msg);
    });
    return grouped;
  };

  return (
    <Box sx={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #e0f2fe 0%, #f0fdf4 50%, #fef3c7 100%)'
    }}>
      <AppBar position="static" sx={{
        flexShrink: 0,
        background: 'linear-gradient(90deg, #3b82f6 0%, #10b981 100%)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <Toolbar>
          <Avatar src={logo} sx={{ border: '2px solid #fbbf24' }} />
          <Box sx={{ flexGrow: 1 }} />
          <Avatar src={username === 'Radha' ? radhaImage : krishnaImage} sx={{
            width: 40,
            height: 40,
            mr: 2,
            border: '2px solid #fbbf24',
            boxShadow: '0 0 10px rgba(251, 191, 36, 0.5)'
          }} />
          <Button
            color="inherit"
            onClick={handleLogout}
            sx={{
              border: "1px solid #fbbf24",
              borderRadius: '20px',
              '&:hover': { backgroundColor: 'rgba(251, 191, 36, 0.1)' }
            }}
          >
            Logout
          </Button>
          {username === 'Krishna' && (
            <Button
              color="inherit"
              onClick={handleClearChat}
              sx={{
                border: "1px solid #fbbf24",
                borderRadius: '20px',
                '&:hover': { backgroundColor: 'rgba(251, 191, 36, 0.1)' },
                ml: 1
              }}
            >
              Clear Chat
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Box
        ref={messagesContainerRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <List>
          {Object.entries(groupMessagesByDate(messages)).map(([date, msgs]) => (
            <React.Fragment key={date}>
              <ListItem sx={{ justifyContent: 'center' }}>
                <Typography variant="body2" sx={{
                  color: '#7754ff',
                  fontWeight: 'bold',
                  
                }}>
                  {getDateLabel(date)}
                </Typography>
              </ListItem>
              {msgs.map((msg, index) => (
                <ListItem key={index} sx={{ justifyContent: msg.from === username ? 'flex-end' : 'flex-start' }}>
                  <Box sx={{ maxWidth: '70%' }}>
                    <Paper
                      sx={{
                        p: 1,
                        bgcolor: msg.from === username ? '#81aef6d1' : 'rgba(119, 220, 225, 0.35)',
                        color: 'black',
                        borderRadius: '15px',
                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <Typography variant="body1">{msg.message}</Typography>
                    </Paper>
                    <Typography variant="caption" sx={{ color: '#6b7280', mt: 0.5 }}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </React.Fragment>
          ))}
        </List>
        <div ref={messagesEndRef} />
      </Box>
      <Box sx={{
        flexShrink: 0,
        p: 2,
        bgcolor: 'rgba(59, 130, 246, 0.9)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid #fbbf24'
      }}>
        <Stack direction="row" spacing={1}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            multiline
            maxRows={3}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '25px',
                '& fieldset': { borderColor: '#fbbf24' },
                '&:hover fieldset': { borderColor: '#f59e0b' },
                '&.Mui-focused fieldset': { borderColor: '#fbbf24' },
              },
              '& .MuiInputBase-input': { color: '#1e40af' },
              '& .MuiInputLabel-root': { color: '#f59e0b' }
            }}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            sx={{
              background: 'linear-gradient(45deg, #10b981, #34d399)',
              borderRadius: '25px',
              '&:hover': { background: 'linear-gradient(45deg, #059669, #10b981)' }
            }}
          >
            Send
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default Chat;

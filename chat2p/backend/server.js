const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');
const users = require('./users');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// In-memory session store (simple for demo)
const sessions = {};

// Helper function to generate session token
function generateToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Middleware to validate session token
function validateToken(req, res, next) {
  const token = req.headers.authorization;
  if (!token || !sessions[token]) {
    return res.status(401).json({ error: 'Invalid or missing token' });
  }
  req.user = sessions[token];
  next();
}

// POST /login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Find user by comparing hashed username
  let foundUser = null;
  let actualUsername = null;
  for (const user of users) {
    const isUsernameValid = await bcrypt.compare(username, user.usernameHash);
    if (isUsernameValid) {
      foundUser = user;
      actualUsername = username; // Store the plain text username for session
      break;
    }
  }

  if (!foundUser) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isPasswordValid = await bcrypt.compare(password, foundUser.password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = generateToken();
  sessions[token] = { username: actualUsername };
  res.json({ success: true, token, username: actualUsername });
});

// POST /send-message (Protected)
app.post('/send-message', validateToken, async (req, res) => {
  const { receiver, message } = req.body;
  const sender = req.user.username;
  const timestamp = new Date().toISOString();

  try {
    const chatPath = path.join(__dirname, 'chat.json');
    const data = await fs.readFile(chatPath, 'utf8');
    const chat = JSON.parse(data);
    chat.messages.push({ from: sender, to: receiver, message, timestamp });
    await fs.writeFile(chatPath, JSON.stringify(chat, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save message' });
  }
});

// GET /messages (Protected)
app.get('/messages', validateToken, async (req, res) => {
  try {
    const chatPath = path.join(__dirname, 'chat.json');
    const data = await fs.readFile(chatPath, 'utf8');
    const chat = JSON.parse(data);
    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

// POST /clear-chat (Protected - only Krishna can clear)
app.post('/clear-chat', validateToken, async (req, res) => {
  if (req.user.username !== 'Krishna') {
    return res.status(403).json({ error: 'Only Krishna can clear the chat' });
  }

  try {
    const chatPath = path.join(__dirname, 'chat.json');
    await fs.writeFile(chatPath, JSON.stringify({ messages: [] }, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear chat' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

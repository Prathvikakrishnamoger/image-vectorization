import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data Directory setup for Persistent File Storage
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Initial default demo accounts
const DEFAULT_USERS = [
  {
    id: 'user_a',
    name: 'Alice (User A)',
    email: 'alice@vector.net',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    role: 'Lead Network Engineer',
  },
  {
    id: 'user_b',
    name: 'Bob (User B)',
    email: 'bob@vector.net',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    role: 'Receiver Terminal Node',
  },
  {
    id: 'user_c',
    name: 'Charlie (User C)',
    email: 'charlie@vector.net',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
    role: 'Graphics Specialist',
  },
];

interface DBStructure {
  users: Array<{ id: string; name: string; email: string; avatar: string; role: string }>;
  transmissions: any[];
}

function loadDB(): DBStructure {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading db.json, reinitializing:', err);
  }
  const initial = { users: DEFAULT_USERS, transmissions: [] };
  saveDB(initial);
  return initial;
}

function saveDB(db: DBStructure) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing db.json:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Ensure DB initialized
  loadDB();

  // JSON Body Parser for larger base64 payloads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // CORS Middleware
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // API Health Check
  app.get('/api/health', (req, res) => {
    const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
    res.json({
      status: 'ok',
      engine: 'Vector Transmission & AI Reconstruction Engine',
      geminiAvailable: hasGeminiKey,
      timestamp: new Date().toISOString(),
    });
  });

  // ------------------- USER AUTH & DB ENDPOINTS -------------------

  // Get list of registered users
  app.get('/api/users', (req, res) => {
    const db = loadDB();
    res.json(db.users);
  });

  // Register or Login user
  app.post('/api/users/login', (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
      res.status(400).json({ error: 'Name and email are required' });
      return;
    }
    const db = loadDB();
    let user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      user = {
        id: `user_${Date.now()}`,
        name,
        email,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
        role: 'Transmission Node',
      };
      db.users.push(user);
      saveDB(db);
    }
    res.json(user);
  });

  // Save Transmission
  app.post('/api/transmissions', (req, res) => {
    try {
      const transmission = req.body;
      if (!transmission.senderId || !transmission.recipientId) {
        res.status(400).json({ error: 'senderId and recipientId required' });
        return;
      }
      const db = loadDB();
      const newEntry = {
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        ...transmission,
      };
      db.transmissions.unshift(newEntry);
      saveDB(db);
      res.json(newEntry);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get Transmissions for a User
  app.get('/api/transmissions', (req, res) => {
    const { userId } = req.query;
    const db = loadDB();
    if (!userId) {
      res.json(db.transmissions);
      return;
    }
    const filtered = db.transmissions.filter(
      t => t.senderId === userId || t.recipientId === userId
    );
    res.json(filtered);
  });

  // Delete Transmission
  app.delete('/api/transmissions/:id', (req, res) => {
    const { id } = req.params;
    const db = loadDB();
    db.transmissions = db.transmissions.filter(t => t.id !== id);
    saveDB(db);
    res.json({ success: true });
  });

  // -----------------------------------------------------------------

  // AI Reconstruction Enhancement Endpoint using Gemini API
  app.post('/api/ai-enhance', async (req, res) => {
    try {
      const { svgContent, stats, prompt } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        res.json({
          enhanced: false,
          reason: 'Gemini API key not configured in environment. Using high-precision bilateral filter engine.',
          notes: 'Local bilateral edge-preservation and unsharp masking active.',
        });
        return;
      }

      // Initialize Gemini SDK with telemetry header
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemPrompt = `You are an expert AI Image Vectorization & Receiver Reconstruction Engineer.
Analyze this transmitted SVG vector string and transmission stats:
- Original Size: ${stats?.originalSizeBytes || 'N/A'} bytes
- Transmitted SVG Size: ${stats?.svgSizeBytes || 'N/A'} bytes
- Bandwidth Saved: ${stats?.bandwidthSavedPercent || 'N/A'}%

Provide a brief, technical 2-sentence reconstruction report explaining:
1. Contour preservation and edge fidelity.
2. Recommended post-processing enhancement steps for receiver rendering.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `${systemPrompt}\n\nSVG Content Snippet:\n${(svgContent || '').slice(0, 1500)}`,
      });

      res.json({
        enhanced: true,
        notes: response.text || 'AI reconstruction analysis complete.',
      });
    } catch (err: any) {
      console.error('Gemini AI Enhancement error:', err);
      res.json({
        enhanced: false,
        reason: err.message || 'AI processing fallback.',
        notes: 'Fallback to local bilateral edge sharpening.',
      });
    }
  });

  // Vite middleware in development mode
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Static production build serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

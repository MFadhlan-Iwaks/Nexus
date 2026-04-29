const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const authRoutes = require('./src/routes/authRoutes');
const laporanRoutes = require('./src/routes/laporanRoutes');
const peringatanRoutes = require('./src/routes/peringatanRoutes');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/laporan', laporanRoutes);
app.use('/api/peringatan', peringatanRoutes);

io.on('connection', (socket) => {
  console.log('User connected to NEXUS Socket');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server MVC berjalan di port ${PORT}`));
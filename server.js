const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
app.use(cors()); // This enables CORS for all routes and all origins
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:8000", 
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

app.use(bodyParser.json());

// MySQL connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hrm_system'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to database');
});

// Basic route
app.get('/', (req, res) => {
    res.send('<h1>Notification Server Running</h1>');
});

// Endpoint to receive updates from Laravel
app.post('/notify', (req, res) => {
    const { userId, message } = req.body;
    io.to(`user_${userId}`).emit('notification', message);
    res.status(200).send('Notification sent');
});

// Handle a connection request from clients
io.on('connection', (socket) => {
    console.log('a user connected');

    // Join a room for the user based on user ID
    const userId = socket.handshake.query.userId;
    socket.join(`user_${userId}`);

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});

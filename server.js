const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const multer = require('multer');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

const chatHistoryFile = 'chat_history.txt';

// Function to append message to the file
function saveMessage(message) {
    fs.appendFileSync(chatHistoryFile, message + '\n', 'utf8');
}

io.on('connection', (socket) => {
    console.log('A user connected');
    fs.readFile(chatHistoryFile, 'utf8', (err, data) => {
        if (err) {
            console.log('Error reading chat history:', err);
            return;
        }
        socket.emit('chat history', data);
    });

    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
        saveMessage(msg);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Multer setup for file uploading
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'E:/webchat/file') // Upload directory
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
});

const upload = multer({ storage: storage });

// Define the file upload route once
app.post('/upload', upload.single('file'), (req, res) => {
    const uploadedFileName = req.file.originalname;
    const message = `User uploaded a file: ${uploadedFileName}`;

    // Append this message to chat_history.txt
    saveMessage(message);

    // Emit an event to all connected clients
    io.emit('file uploaded', {
        filename: req.file.filename,
        originalName: req.file.originalname
    });

    res.send('File uploaded successfully.');
});

server.listen(3001, '0.0.0.0', () => {
    console.log('listening on *:3001');
});

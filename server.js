const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

const chatHistoryFile = 'chat_history.txt';

// Function to append message to the file
function saveMessage(message) {
  fs.appendFileSync(chatHistoryFile, message + '\n', 'utf8');
}

// Load chat history and emit to newly connected client
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

server.listen(3000, '0.0.0.0', () => {
  console.log('listening on *:3000');
});








const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const chalk = require('chalk');
const port = process.env.PORT || '3000';

// List of connected usernames.
let users = [];

// List of colours to use for clients.
const userColors = ['#C269FE', '#63E9FC', '#FFC48E', '#DDB9B9', '#FFF7B7'];

// Set static path for public folder and send index.html file.
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,'public/views/index.html'));
})

// On client connection.
io.on('connection', (socket) => {

  // On client disconnect.
  socket.on('disconnect', () => {
    // If socket has a username remove it from the used list and emit a leave message to all clients.
    if(socket.username) {
      users.splice(users.indexOf(socket.username.toLowerCase()), 1);
      io.emit('user-leaves', socket.username, Date.now());
    }
  });

  // On client username choice.
  socket.on('username-choice', (username) => {
    // Ensure the username isn't in use.
    if(!users.includes(username.toLowerCase())) {
      // Not in use, add to list of live users and assign to socket.
      users.push(username.toLowerCase());
      socket.username = username;
      socket.color = userColors[users.indexOf(socket.username.toLowerCase())];

      // Emit an ok message to client.
      socket.emit('username-ok');

      // Emit a user joins message to all clients.
      io.emit('user-joins', socket.username, Date.now());
    } else {
      // Username is in use, emit to client.
      socket.emit('username-taken', username);
    }
  });

  // On client chat message, emit to all clients with username and selected colour.
  socket.on('chat-message', function(msg){
    io.emit('chat-message', msg, Date.now(), socket.id, socket.username, socket.color);
  });
});

// Listen on port.
http.listen(port, () => {
  console.log(chalk.blue(`Listening on *:${port}`));
})

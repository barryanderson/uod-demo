const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const chalk = require('chalk');

const port = process.env.PORT || '3000';

let users = [];
const userColors = ['#C269FE', '#63E9FC', '#FFC48E', '#DDB9B9', '#FFF7B7'];


app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,'public/views/index.html'));
})

io.on('connection', (socket) => {

  socket.on('disconnect', () => {
    if(socket.username) {
      users.splice(users.indexOf(socket.username.toLowerCase()), 1);
      io.emit('user-leaves', socket.username, Date.now());
    }
  });

  socket.on('username-choice', (username) => {
    if(!users.includes(username.toLowerCase())) {
      users.push(username.toLowerCase());
      socket.username = username;
      socket.emit('username-ok');
      io.emit('user-joins', socket.username, Date.now());
    } else {
      socket.emit('username-taken', username);
    }
  });

  socket.on('chat-message', function(msg){
    io.emit('chat-message', msg, Date.now(), socket.id, socket.username, userColors[users.indexOf(socket.username.toLowerCase())]);
  });
});

http.listen(port, () => {
  console.log(chalk.blue(`Listening on *:${port}`));
})

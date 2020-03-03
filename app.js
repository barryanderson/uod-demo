const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

const port = process.env.PORT || '3000';

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,'public/views/index.html'));
})

io.on('connection', (socket) => {

  io.emit('user-joins', 'A new user connected.');

  socket.on('disconnect', () => {
    io.emit('user-leaves', 'A user disconnected.');
  });

  socket.on('chat-message', function(msg){
    if(msg.startsWith('img:')) {
      io.emit('chat-message', msg.replace('img:', ''), Date.now(), socket.id, true);
    } else {
      io.emit('chat-message', msg, Date.now(), socket.id);
    }
  });
});

http.listen(port, () => {
  console.log(`Listening on  *:${port}`);
})

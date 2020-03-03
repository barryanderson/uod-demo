const socket = io();

const formEl = document.getElementById('message-form');
const messageInputEl = document.getElementById('message-input');
const messageListEl = document.getElementById('messages');

formEl.addEventListener('submit', (e) => {
  e.preventDefault();  // Prevent page reloading.
  socket.emit('chat-message', messageInputEl.value);
  messageInputEl.value = '';
  return false;
});

socket.on('chat-message', function(message, timestamp, socketid, isImg){
  // Create timestamp for message.
  let timestampEl = document.createElement('span');
  timestampEl.innerHTML = `[${formatDate(timestamp)}] `
  timestampEl.style.fontWeight = 'bold';

  // Create message with timestamp.
  let messageItemEl = document.createElement('li');
  messageItemEl.appendChild(timestampEl);

  // Playing about with adding images ... messages prefixed with "img:" fall into this.
  if(isImg) {
    let linkEl = document.createElement('a');
    linkEl.href = message;
    linkEl.target = '_blank';

    let imgEl = document.createElement('img');
    imgEl.src = message;
    imgEl.width = 200;
    imgEl.style.paddingTop = '5px'

    linkEl.appendChild(imgEl);

    messageItemEl.append(document.createElement('br'));
    messageItemEl.append(linkEl);
  } else {
    messageItemEl.append(message);
  }

  // If this is the sending client mark as own message for styling.
  if(socket.id === socketid) messageItemEl.className = 'own';

  // Append to list and scroll to bottom.
  messageListEl.appendChild(messageItemEl)
  messageListEl.scrollTop = messageListEl.scrollHeight;
});

function formatDate(timestamp) {
  const months = ["Jan", "Feb", "Mar","Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const date = new Date(timestamp);
  const day = ('0' + date.getDay().toString()).slice(-2);
  const month = months[date.getMonth()];
  const year = date.getFullYear().toString().slice(-2);
  const hour = ('0' + date.getHours().toString()).slice(-2);
  const mins = ('0' + date.getMinutes().toString()).slice(-2);
  const secs = ('0' + date.getSeconds().toString()).slice(-2);
  // return `${day}-${month}-${year} ${hour}:${mins}:${secs}`
  return `${hour}:${mins}:${secs}`
}

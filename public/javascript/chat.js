const socket = io();

// Regex match strings.
const urlRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;
const imgRegex = /(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*\.(?:jpg|jpeg|gif|png))(?:\?([^#]*))?(?:#(.*))?/gi;

// Capture required dom elements.
const formEl = document.getElementById('message-form');
const messageInputEl = document.getElementById('message-input');
const messageListEl = document.getElementById('messages');

// Title and unread messages.
const title = 'UoD Chat Demo';
let unreadMessages = 0;

// Capture username to before starting.
captureUsername();

// Get username.
function captureUsername() {
  let usernameCaptured = false;
  while(!usernameCaptured) {
    let username = '';
    username = prompt('Please provide a username', '');
    username = username.trim();
    if(!username || username == "") {
      usernameCaptured = false;
    } else {
      usernameCaptured = true;
      socket.emit('username-choice', username);
    }
  }
}

socket.on('username-ok', () => {
  document.body.style.display = "block";
});

socket.on('username-taken', (username) => {
  alert(`Username ${username} is already taken.\n\nPlease try again.\n\n`);
  captureUsername();
});

// Listen for form submissions.
formEl.addEventListener('submit', (e) => {
  e.preventDefault();  // Prevent page reloading.
  socket.emit('chat-message', messageInputEl.value);
  messageInputEl.value = '';
  return false;
});

// Handle chat message events.
socket.on('chat-message', (message, timestamp, socketid, username, usercolor) => {
  // Create timestamp for message.
  const timestampEl = document.createElement('span');
  timestampEl.innerHTML = `[${formatDate(timestamp)}] `
  timestampEl.style.fontWeight = 'bold';

  // Create username for message.
  const nameEl = document.createElement('span');
  nameEl.innerHTML = (socket.id === socketid) ? 'You: ' : `${username}: `;
  nameEl.style.fontWeight = 'bold';

  // Create message with timestamp.
  const messageItemEl = document.createElement('li');
  messageItemEl.appendChild(timestampEl);
  messageItemEl.appendChild(nameEl);

  // Playing about with parsing images and links.
  const isUrl = urlRegex.test(message);
  const isImg = imgRegex.test(message);
  // console.log(`IsUrl: ${isUrl}, IsImg: ${isImg}`);
  if(isUrl || isImg) {
    const linkEl = document.createElement('a');
    linkEl.href = message;
    linkEl.target = '_blank';

    if(isImg) {
      const imgEl = document.createElement('img');
      imgEl.src = message;
      imgEl.width = 200;
      imgEl.style.paddingTop = '5px'

      linkEl.appendChild(imgEl);
      messageItemEl.append(document.createElement('br'));
    } else {
      linkEl.innerText = message;
    }

    messageItemEl.append(linkEl);
  } else {
    messageItemEl.append(message);
  }

  // If this is the sending client mark as own message for styling.
  if(socket.id === socketid) {
    messageItemEl.className = 'own'
  } else {
    messageItemEl.style.backgroundColor = usercolor;
  };

  // Append to list and scroll to bottom.
  messageListEl.appendChild(messageItemEl)
  messageListEl.scrollTop = messageListEl.scrollHeight;

  unreadMessages++;
  changeTitle();
});

socket.on('user-joins', (username, timestamp) => {
  // Create timestamp for message.
  const timestampEl = document.createElement('span');
  timestampEl.innerHTML = `[${formatDate(timestamp)}] `
  timestampEl.style.fontWeight = 'bold';

  // Create message with timestamp.
  const messageItemEl = document.createElement('li');
  messageItemEl.appendChild(timestampEl);
  messageItemEl.append(`${username} has joined.`);
  messageItemEl.className = 'join';

  // Append to list and scroll to bottom.
  messageListEl.appendChild(messageItemEl)
  messageListEl.scrollTop = messageListEl.scrollHeight;

  unreadMessages++;
  changeTitle();
});

socket.on('user-leaves', (username, timestamp) => {
  // Create timestamp for message.
  const timestampEl = document.createElement('span');
  timestampEl.innerHTML = `[${formatDate(timestamp)}] `
  timestampEl.style.fontWeight = 'bold';

  // Create message with timestamp.
  const messageItemEl = document.createElement('li');
  messageItemEl.appendChild(timestampEl);
  messageItemEl.append(`${username} has left.`);
  messageItemEl.className = 'leave';

  // Append to list and scroll to bottom.
  messageListEl.appendChild(messageItemEl)
  messageListEl.scrollTop = messageListEl.scrollHeight;

  unreadMessages++;
  changeTitle();
});

// Make a datetime stamp prettier.
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

// Change page title to show unread messages.
function changeTitle() {
  if(unreadMessages > 0 && !document.hasFocus()) {
    document.title = `(${unreadMessages}) ${title}`;
  } else {
    document.title = `${title}`;
    unreadMessages = 0;  // Page has focus zero the count of unread.
  }
}

// Change title when window is focused on, ensuring unread title is zeroed.
window.addEventListener('focus', (e) => {
  changeTitle();
});

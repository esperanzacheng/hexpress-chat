const guestUser = getGuestUser();
document.getElementById('public-navbar-username').textContent = '[guest] ' + guestUser.username;

const socket = io('/');
const messageContainer = document.getElementById('public-message-container');
const messageForm = document.getElementById('public-send-container');
const messageInput = document.getElementById('public-message-input');

function getGuestUser() {
  const stored = sessionStorage.getItem('guestUser');
  if (!stored) {
    window.location = '/guest';
    return { guestId: null, username: '' };
  }
  return JSON.parse(stored);
}

function scrollToBottom() {
  messageContainer.scrollTop = messageContainer.scrollHeight;
}

function appendMessage(message) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('public-message-single');

  const messageName = document.createElement('div');
  messageName.classList.add('public-message-name');
  messageName.textContent = message.author;

  const messageDesc = document.createElement('div');
  messageDesc.classList.add('public-message-desc');
  messageDesc.textContent = message.content;

  messageElement.append(messageName);
  messageElement.append(messageDesc);
  messageContainer.append(messageElement);
  scrollToBottom();
}

function appendSystemNotice(text) {
  const noticeElement = document.createElement('div');
  noticeElement.classList.add('public-message-notice');
  noticeElement.textContent = text;
  messageContainer.append(noticeElement);
  scrollToBottom();
}

// anti-impersonation prefix applied client-side, see spec §1
const displayUser = {
  username: '[guest] ' + guestUser.username,
  profilePicture: null
};

socket.emit('new-user', roomName, displayUser);

socket.on('user-connected', (user) => {
  appendSystemNotice(`${user.username} joined the chat`);
});

socket.on('user-disconnected', (user) => {
  appendSystemNotice(`${user.username} left the chat`);
});

socket.on('chat-message', (data) => {
  appendMessage(data);
});

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const content = messageInput.value.trim();
  if (!content) {
    return;
  }

  const message = {
    content,
    attachments: [],
    createdAt: new Date().toISOString()
  };

  appendMessage({ content, author: displayUser.username });
  socket.emit('send-chat-message', roomName, message);
  messageInput.value = '';
});

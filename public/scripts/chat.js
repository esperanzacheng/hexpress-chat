const socket = io('/');
const messageContainer = document.getElementById('message-container');
const roomContainer = document.getElementById('room-container');
const messageForm = document.getElementById('send-container');
const messageInput = document.getElementById('message-input');

let thisUrl = window.location.href;
let thisRoom = thisUrl.split("/").pop();

window.onload = () => {
  addVideoChat(thisRoom);  
}

if (messageForm != null) {
  const name = prompt('What is your name?');
  appendMessage('You joined');
  socket.emit('new-user', roomName, name);

  messageForm.addEventListener('submit', e => {
    e.preventDefault();
    const message = messageInput.value;
    appendMessage(`You: ${message}`);
    socket.emit('send-chat-message', roomName, message);
    messageInput.value = '';
  })
}

socket.on('room-created', room => {
  const roomElement = document.createElement('div');
  roomElement.innerText = room;
  const roomLink = document.createElement('a');
  roomLink.href = `/${room}`;
  roomLink.innerText = 'join';
  roomContainer.append(roomElement);
  roomContainer.append(roomLink);
})

socket.on('chat-message', data => {
  appendMessage(`${data.name}: ${data.message}`);
})

socket.on('user-connected', name => {
  appendMessage(`${name} connected`);
})

socket.on('user-disconnected', name => {
  appendMessage(`${name} disconnected`);
})

function appendMessage(message) {
  const messageElement = document.createElement('div');
  messageElement.innerText = message;
  messageContainer.append(messageElement);
}

function addVideoChat(room) {
  const videoButton = document.getElementById('video-button');
  videoButton.addEventListener('click', e => {
    e.preventDefault();
    window.location = `/floo/${room}`;
  })
}
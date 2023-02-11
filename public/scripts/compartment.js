const socket = io('/');
const messageContainer = document.getElementById('message-container');
const roomContainer = document.getElementById('room-container');
const messageForm = document.getElementById('send-container');
const messageInput = document.getElementById('message-input');

let thisUrl = window.location.href;
let thisRoom = thisUrl.split("/").pop();

window.onload = () => {
  addVideoChat(thisRoom);  
  setUserName();
  console.log(messageForm)
}

async function setUserName(){
  // if (messageForm != null) {
    const name = await authUser();
    appendMessage('You joined');
    console.log(roomName, name)
    socket.emit('new-user', roomName, name);

    const sendButton = document.getElementById('send-button');
    sendButton.addEventListener('click', e => {
      e.preventDefault();
      console.log('eeeeee')
      const message = messageInput.value;
      appendMessage(`You: ${message}`);
      socket.emit('send-chat-message', roomName, message);
      messageInput.value = '';
    })
  // }
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

async function authUser() {
  let url = '/api/user/auth'
  let response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
          "Content-Type": "application/json"
      },
  }).then((res) => { return res.json(); })
  .then((data) => {
      if (data['name']) {
          const navbarUsername = document.getElementById('banner-member-center-username')
          const navbarImg = document.getElementById('banner-member-center-img')
          navbarUsername.textContent = data['name']
          // navbarImg.setAttribute('src', '')
      } else if (window.location.href != '/') {
          window.location = '/login'
      }
      return data;
  })
  return response['name']
}

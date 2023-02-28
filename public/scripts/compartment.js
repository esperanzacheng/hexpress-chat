const socket = io('/');
let messageContainer = document.getElementById('message-container');
// const roomContainer = document.getElementById('room-container');
const messageForm = document.getElementById('send-container');
const messageInput = document.getElementById('message-input');

let thisUrl = window.location.href;
let thisRoom = thisUrl.split("/").pop();

window.onload = () => {
  addVideoChat(thisRoom);  
  setUserName();
  // scrollEvent()
}

async function scrollEvent() {
  messageContainer.addEventListener("scroll", () => {
      let scrollBottom = messageContainer.scrollHeight - messageContainer.clientHeight - messageContainer.scrollTop;
      let scrolledHeight = messageContainer.offsetHeight + Math.ceil(scrollBottom);
      let viewHeight = messageContainer.scrollHeight;
      if (scrolledHeight >= viewHeight && nextPage != null) {
          curPage = nextPage;
          chatsList.then(async res => {
            await getChatMessageById(thisChat, res, curPage)
        })
      }
  })
}


function setUserName(){
    thisUserName = thisUser.then((res) => {
      // appendUserMessage('You joined');  
      socket.emit('new-user', roomName, res);
  
      const sendButton = document.getElementById('send-button');
      sendButton.addEventListener('click', e => {
        e.preventDefault();
        const message = messageInput.value;
        let date = new Date();
        let formattedDate = date.toLocaleString('en-US', { 
          month: '2-digit', 
          day: '2-digit', 
          year: 'numeric', 
          hour: 'numeric', 
          minute: 'numeric', 
          hour12: true 
        });
        appendMessage({ content: message, photo: res['photo'], author: res['name'], createdAt: formattedDate});
        socket.emit('send-chat-message', roomName, message);
        postMessage({'chat_id': thisRoom, 'content': message})
        messageInput.value = '';
      })
    })
}

socket.on('room-created', room => {
  const roomElement = document.createElement('div');
  if (room['participants'][0]['name'] === thisUserName) {
    roomElement.innerText = room['participants'][1]['name'];
  } else {
    roomElement.innerText = room['participants'][0]['name'];
  }

  const roomLink = document.createElement('a');
  roomLink.href = `/${room['_id']}`;
  roomLink.innerText = 'join';
  roomContainer.append(roomElement);
  roomContainer.append(roomLink);
})

socket.on('chat-message', data => {
  appendMessage(data);
})

// socket.on('user-connected', user => {
//   appendUserMessage(`${user['username']} connected`);
// })

// socket.on('user-disconnected', user => {
//   appendUserMessage(`${user['username']} disconnected`);
// })

function appendMessage(message, appendType) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message-single-container')
  const messageImg = document.createElement('img');
  messageImg.classList.add('message-single-img')
  messageImg.setAttribute('src', message['photo'])
  const messageName = document.createElement('div');
  messageName.classList.add('message-single-name')
  messageName.textContent = message['author']
  const messageTime = document.createElement('div');
  messageTime.classList.add('message-single-time')
  messageTime.textContent = message['createdAt']
  const messageDesc = document.createElement('div');
  messageDesc.classList.add('message-single-desc')
  messageDesc.textContent = message['content']
  
  // messageElement.innerText = message;
  messageElement.append(messageImg)
  messageElement.append(messageName)
  messageElement.append(messageTime)
  messageElement.append(messageDesc)
  if (appendType === 'fetch') {
    messageContainer.insertBefore(messageElement, messageContainer.firstChild);
  } else {
    messageContainer.append(messageElement);
  }  
}

async function postMessage(message) {
  let url = '/api/chat/message'
  let response = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify(message) // message is a json object, including chat_id, message, other data
  }).then((res) => { return res.json(); })
  .then((data) => {
      if (data) {
        console.log(data)
      } else if (window.location.href != '/') {
          window.location = '/login'
      }
  })
}

function addVideoChat(room) {
  const videoButton = document.getElementById('video-button');
  videoButton.addEventListener('click', e => {
    e.preventDefault();
    window.location = `/floo/${room}`;
  })
}

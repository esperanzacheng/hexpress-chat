const socket = io('/');
let messageContainer = document.getElementById('message-container');
const messageForm = document.getElementById('send-container');
const messageInput = document.getElementById('message-input');

async function scrollToBottom() {
  messageContainer.scrollTop = messageContainer.scrollHeight
}

socket.on('chat-message', data => {
  appendMessage(data);
  scrollToBottom()
})

function appendMessage(message, appendType) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message-single-container')
  const messageImg = document.createElement('img');
  messageImg.classList.add('message-single-img')
  messageImg.setAttribute('src', message['profilePicture'])
  const messageName = document.createElement('div');
  messageName.classList.add('message-single-name')
  messageName.textContent = message['author']
  const messageTime = document.createElement('div');
  messageTime.classList.add('message-single-time')
  messageTime.textContent = message['createdAt']
  
  messageElement.append(messageImg)
  messageElement.append(messageName)
  messageElement.append(messageTime)
  
  if (message['content'] != '') {
    const messageDesc = document.createElement('div');
    messageDesc.classList.add('message-single-desc')
    messageDesc.textContent = message['content']
    messageElement.append(messageDesc)
  }

  if (message['attachments'].length != []) {
    const messageImgContainer = document.createElement('div');
    messageImgContainer.classList.add('message-single-img-container')

    const messageAttachments = document.createElement('img');
    messageAttachments.setAttribute('src', message['attachments'])
    messageImgContainer.append(messageAttachments)
    messageElement.append(messageImgContainer)
  }

  if (appendType === 'fetch') {
    messageContainer.insertBefore(messageElement, messageContainer.firstChild);
  } else {
    messageContainer.append(messageElement);
  }  
}

function setUploadButton(){
  const uploadButton = document.getElementById('image-input-button')
  uploadButton.addEventListener('click', (e) => {
      e.preventDefault();
      const imageInput = document.getElementById('image-input-test')
      imageInput.click()
  })
}

function previewPhotoName(){
  const imageInput = document.getElementById('image-input-test')
  const photoName = document.getElementById('upload-file-name')

  imageInput.addEventListener('change', (e) => {
      e.preventDefault();
      const newPhoto = imageInput.files[0]
      photoName.textContent = newPhoto.name
      
      const photoCloseButton = document.getElementById('upload-file-name-close')
      photoCloseButton.style.visibility = 'visible'

      photoCloseButton.addEventListener('click', (e) => {
          e.preventDefault();
          imageInput.value = '';
          photoCloseButton.style.visibility = 'hidden'
          photoName.textContent = ''
      })
  })
}

function setSendButton(idType, id, type){
  thisUserName = thisUser.then((res) => { 
    socket.emit('new-user', roomName, res);
    
    const sendButton = document.getElementById('send-button');
    sendButton.addEventListener('click', e => {
      e.preventDefault();

      let date = new Date();
      let formattedDate = date.toLocaleString('en-US', { 
        month: '2-digit', 
        day: '2-digit', 
        year: 'numeric', 
        hour: 'numeric', 
        minute: 'numeric', 
        hour12: true 
      });
      
      const message = messageInput.value;
      const imageInput = document.getElementById('image-input-test')
      const formData = new FormData();
      let messageData = { }

      formData.append(idType, id)
      formData.append('content', message)

      messageData['content'] = message
      messageData['profilePicture'] = res['profilePicture']
      messageData['author'] = res['username']
      messageData['createdAt'] = formattedDate
      messageData['attachments'] = []

      
      if (imageInput.files.length) {
          const reader = new FileReader();
          reader.addEventListener('load', () => {
              let rawData = new ArrayBuffer();
              rawData = reader.result;
              
              messageData['attachments'].push(rawData)
              appendMessage(messageData);
              scrollToBottom()
              socket.emit('send-chat-message', roomName, { content: message, attachments: rawData, createdAt: formattedDate });
          })
          
          reader.readAsDataURL(imageInput.files[0]);
          formData.append('attachments', imageInput.files[0])
      } else {
          appendMessage(messageData);
          scrollToBottom()
          socket.emit('send-chat-message', roomName, { content: message, attachments: [], createdAt: formattedDate });
      }

      postMessage(formData, type)
      imageInput.value = '';
      messageInput.value = '';
    })
  })
}

async function postMessage(formData, type) {
  let url = `/api/${type}/message`
  let response = await fetch(url, {
      method: "POST",
      body: formData // message is a form object, including chat_id, message, other data
  }).then((res) => { return res.json(); })
  .then((data) => {
      if (data['ok']) {
          const imageInput = document.getElementById('image-input-test')
          const photoName = document.getElementById('upload-file-name')
          const photoCloseButton = document.getElementById('upload-file-name-close')
          imageInput.value = '';
          photoCloseButton.style.visibility = 'hidden'
          photoName.textContent = ''
        return
      } else {
          window.location = '/login'
      }
  })
}
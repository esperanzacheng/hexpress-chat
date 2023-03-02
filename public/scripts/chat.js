let curPage = 0;
let nextPage;
let thisChat = window.location.href.split("/").pop();
let thisUrl = window.location.href;
let thisRoom = thisUrl.split("/").pop();

setTimeout(() => {
    getChatMessage()
    addVideoChat(thisRoom); 
    setSendButton();
}, 0);

function getChatMessage() {
    chatsList.then(async res => {
        await getChatMessageById(thisChat, res, curPage)
        await scrollToBottom()
        setTimeout(() => {
            scrollEvent()
        }, 1000);
    })
}

async function getParticipants(chatId, chatsList) {
    for (let i = 0; i < chatsList.length; i++) {
        if (chatsList[i]['_id'] === chatId) {
            return chatsList[i]['participantsInfo']
        }
    };
    return null
}


async function getChatMessageById(chatId, chatsList, curPage) {
    

    let participants = await getParticipants(chatId, chatsList)
    let url = `/api/chats/message/${chatId}/${curPage}`
    let response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
    }).then((res) => { return res.json(); })
    .then((data) => {
        if (data['ok']) {
            thisUser.then((res) => {
                let chats = data['data']
                if (chats == []) {
                    console.log('no message yet')
                } else {
                    for (let i = 0; i < chats.length; i++) {
                        chats[i]['createdAt'] = chats[i]['createdAt'].split('T')[0] + ' ' + chats[i]['createdAt'].split('T')[1].split('.')[0]
                        if (chats[i]['author'] == res['_id']) {
                            chats[i]['author'] = res['username']
                            chats[i]['photo'] = res['profilePicture']
                        } else {
                            chats[i]['author'] = participants['username']                        
                            chats[i]['photo'] = participants['profilePicture']  
                        }
    
                        appendMessage(chats[i], 'fetch')
                    }
                }
            })
        } else if (window.location.href != '/') {
            window.location = '/login'
        }
        return data;
    })
    nextPage = response['nextPage']
    return response
}

function addVideoChat(room) {
    const videoButton = document.getElementById('video-button');
    videoButton.addEventListener('click', e => {
      e.preventDefault();
      window.location = `/floo/${room}`;
    })
  }
  
  function setSendButton(){
    thisUserName = thisUser.then((res) => { 
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
        appendMessage({ content: message, profilePicture: res['profilePicture'], author: res['username'], createdAt: formattedDate});
        socket.emit('send-chat-message', roomName, message);
        postMessage({'chat_id': thisRoom, 'content': message})
        messageInput.value = '';
      })
    })
}

async function postMessage(message) {
    let url = '/api/chats/message'
    let response = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(message) // message is a json object, including chat_id, message, other data
    }).then((res) => { return res.json(); })
    .then((data) => {
        if (data['ok']) {
          return
        } else {
            window.location = '/login'
        }
    })
  }
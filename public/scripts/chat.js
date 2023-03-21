let curPage = 0;
let nextPage;
let thisChat = window.location.href.split("/").pop();
let thisUrl = window.location.href;
let thisRoom = thisUrl.split("/").pop();

renderChatMessage()
addVideoChat(thisRoom); 
setSendButton('chat_id', thisRoom, 'chats');
setUploadButton()
previewPhotoName()

function renderChatMessage() {
    chatsList.then(res => {
        getChatMessageById(thisChat, res, curPage)
    })

    setTimeout(() => {
        scrollToBottom()
        scrollEvent()
    }, 1500);
}

async function getParticipants(chatId, chatsList) {
    for (let i = 0; i < chatsList.length; i++) {
        if (chatsList[i]._id === chatId) {
            return chatsList[i].participantsInfo
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
        if (data.ok) {
            thisUser.then((res) => {
                let messages = data.data
                if (messages == []) {
                    console.log('no message yet')
                } else {
                    for (let i = 0; i < messages.length; i++) {
                        let date = new Date(messages[i].createdAt);
                        messages[i].createdAt = date.toLocaleString('sv-SE', { 
                            year: 'numeric',
                            month: '2-digit', 
                            day: '2-digit', 
                            hour: 'numeric', 
                            minute: 'numeric', 
                            second: 'numeric', 
                        });
                        if (messages[i].author == res._id) {
                            messages[i].author = res.username
                            messages[i].profilePicture = res.profilePicture
                        } else {
                            messages[i].author = participants.username                      
                            messages[i].profilePicture = participants.profilePicture 
                        }
    
                        appendMessage(messages[i], 'fetch')
                    }
                }
            })
        } else if (window.location.href != '/') {
            window.location = '/login'
        }
        return data;
    })
    nextPage = response.nextPage
    return response
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

function addVideoChat(room) {
    const videoButton = document.getElementById('video-button');
    videoButton.addEventListener('click', e => {
      e.preventDefault();
      window.location = `/floo/${room}`;
    })
  }
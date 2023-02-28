let curPage = 0;
let nextPage;
let thisChat = window.location.href.split("/").pop();
let thisUser = authUser();
let chatsList = getUserChats();

getChatMessage()

async function authUser() {
    let url = '/api/auth/user'
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
        } else if (window.location.href != '/') {
            window.location = '/login'
        }
        return data;
    })
    return response
}



function getChatMessage() {
    chatsList.then(async res => {
        await getChatMessageById(thisChat, res, curPage)
        await scrollToBottom()
        setTimeout(() => {
            scrollEvent()
        }, 1000);
        
    })
}

async function scrollToBottom() {
    messageContainer.scrollTop = messageContainer.scrollHeight
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
    
    let url = `/api/chat/message/${chatId}/${curPage}`
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
                for (let i = 0; i < data['data'].length - 1; i++) {
                    chats[i]['createdAt'] = chats[i]['createdAt'].split('T')[0] + ' ' + chats[i]['createdAt'].split('T')[1].split('.')[0]
                    if (chats[i]['author'] == res['_id']) {
                        chats[i]['author'] = res['name']
                        chats[i]['photo'] = res['photo']
                    } else {
                        chats[i]['author'] = participants['username']                        
                        chats[i]['photo'] = participants['profilePicture']  
                    }
                    appendMessage(chats[i], 'fetch')
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


async function getUserChats() {
    let url = `/api/chat`
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
                data['data'].forEach(e => {
                    const roomItem = document.createElement('div')
                    roomItem.classList.add('room-item')
                    const roomItemName = document.createElement('div')
                    roomItemName.classList.add('room-item-name')
                    roomItemName.textContent = e['participantsInfo']['username']                    
                    roomContainer.append(roomItem)
                    roomItem.append(roomItemName)
                    addChatLink(roomItem, e['_id'])
                });
            })

        } else if (window.location.href != '/') {
            window.location = '/login'
        }
        return data;
    })
    return response['data']
}

function addChatLink(chatItem, chatId) {
    chatItem.addEventListener('click', (e) => {
        e.preventDefault()
        window.location = `/chat/${chatId}`
    })
}
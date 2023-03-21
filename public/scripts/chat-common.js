const roomContainer = document.getElementById('room-container');
let chatsList = getUserChats();

async function getUserChats() {
    let url = `/api/chats`
    let response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
    }).then((res) => { return res.json(); })
    .then((data) => {
        if (data.ok) {
            
            data.data.forEach(e => {
                const roomItem = document.createElement('div')
                roomItem.classList.add('room-item')
                const roomItemName = document.createElement('div')
                roomItemName.classList.add('room-item-name')
                roomItemName.textContent = e.participantsInfo.username                  
                roomContainer.append(roomItem)
                roomItem.append(roomItemName)
                addChatLink(roomItem, e._id)
            });
            
        } else if (window.location.href != '/') {
            window.location = '/login'
        }
        return data;
    })
    return response.data
}

function addChatLink(chatItem, chatId) {
    chatItem.addEventListener('click', (e) => {
        e.preventDefault()
        window.location = `/chat/${chatId}`
    })
}
let curPage = 0;
let nextPage;
let thisCompartment = window.location.href.split('/')[5]
let allMember = getCarMember(thisCar)
getCompMessageById(thisCompartment, allMember, curPage)
setSendButton()

async function getCarMember(carId) {
    let url =  `/api/car/member/${carId}`
    let response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
    }).then((res) => { return res.json(); })
    .then((data) => {
        if (data['ok']) {
            const memberContainer = document.getElementById('member-container')
            data['data'].forEach(e => {
                const memberItem = document.createElement('div')
                memberItem.classList.add('member-item')
                memberItem.textContent = e['username']
                memberContainer.append(memberItem)
            }) 
            return data
        }
    })
    return response
}

async function getCompMessageById(compId, allMember, curPage) {

    let url = `/api/compartment/message/${compId}/${curPage}`
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
                let messages = data['data']
                if (messages == []) {
                    console.log('no message yet')
                } else {
                    allMember.then((memberList) => {
                    for (let i = 0; i < messages.length; i++) {
                        messages[i]['createdAt'] = messages[i]['createdAt'].split('T')[0] + ' ' + messages[i]['createdAt'].split('T')[1].split('.')[0]
                        if (messages[i]['author'] == res['_id']) {
                            messages[i]['author'] = res['username']
                            messages[i]['photo'] = res['profilePicture']
                        } else {
                            for (let j = 0; j < memberList['data'].length; j++) {
                                if (messages[i]['author'] == memberList['data'][j]['_id']) {
                                    messages[i]['author'] = memberList['data'][j]['username']
                                    messages[i]['photo'] = memberList['data'][j]['profilePicture']
                                    break
                                }  
                            } 
                        }
                        appendMessage(messages[i], 'fetch')
                    }
                })
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
        postMessage({'compartment_id': thisCompartment, 'content': message})
        messageInput.value = '';
      })
    })
}

async function postMessage(message) {
    let url = '/api/compartment/message'
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
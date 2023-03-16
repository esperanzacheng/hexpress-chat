let curPage = 0;
let nextPage;
let thisCompartment = window.location.href.split('/')[5]
let allMember = getCarMember(thisCar)

getCompMessageById(thisCompartment, allMember, curPage)
setSendButton('compartment_id', thisCompartment, 'compartment');
setUploadButton()
previewPhotoName()

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
                            messages[i]['profilePicture'] = res['profilePicture']
                        } else {
                            for (let j = 0; j < memberList['data'].length; j++) {
                                if (messages[i]['author'] == memberList['data'][j]['_id']) {
                                    messages[i]['author'] = memberList['data'][j]['username']
                                    messages[i]['profilePicture'] = memberList['data'][j]['profilePicture']
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
    setTimeout(() => {
        scrollToBottom()
        scrollEvent()
    }, 1000);
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
              await getCompMessageById(thisCompartment, allMember, curPage)
          })
        }
    })
  }
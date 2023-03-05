const allFriendButton = document.getElementById('friend-all')
const pendingFriendButton = document.getElementById('friend-pending')
const addFriendButton = document.getElementById('friend-add')

const allFriendTab = document.getElementById('all-container')
const pendingFriendTab = document.getElementById('pending-container')
const addFriendTab = document.getElementById('add-container')
const resultContainer = document.getElementById('friend-result-container')   

addFriend();
switchTab();
renderAllFriend();

function showTab(clickElement, displayElement) {
    clickElement.addEventListener('click', (e) => {
        e.preventDefault();
        allFriendTab.style.display = 'none'
        pendingFriendTab.style.display = 'none'
        addFriendTab.style.display = 'none'

        allFriendButton.style.backgroundColor = '#3B3838'
        pendingFriendButton.style.backgroundColor = '#3B3838'
        addFriendButton.style.backgroundColor = '#3B3838'

        clickElement.style.backgroundColor = '#932020'
        displayElement.style.display = 'grid'
    })
}

function switchTab() {
    showTab(allFriendButton, allFriendTab)
    showTab(pendingFriendButton, pendingFriendTab)
    showTab(addFriendButton, addFriendTab)
}

function renderFriendItem(itemElement, srcElement, renderType) {
    itemElement.classList.add('friend-result-item')
    const resultItemPhotoBox = document.createElement('div')
    resultItemPhotoBox.classList.add('friend-result-photo-box')
    const resultItemPhoto = document.createElement('img')
    resultItemPhoto.classList.add('friend-result-photo')
    if (renderType === 'fetch') {
        resultItemPhoto.setAttribute('src', srcElement['profilePicture'])
    } else {
        resultItemPhoto.setAttribute('src', 'https://d2wihgnacqy3wz.cloudfront.net/' + srcElement['profilePicture'])
    }
    const resultItemName = document.createElement('div')
    resultItemName.classList.add('friend-result-name')
    resultItemName.textContent = srcElement['username']

    itemElement.append(resultItemPhotoBox)
    itemElement.append(resultItemName)
    resultItemPhotoBox.append(resultItemPhoto)
}

function renderAllFriend() {
    let url = '/api/friend';
    fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }).then((res) => { return res.json(); })
    .then((data) => {
        if (data['ok']) {
            let isPending = false
            data['data'].forEach(e => {
                const resultItem = document.createElement('div')
                renderFriendItem(resultItem, e, 'fetch')
                if (e['verified']) {
                    const resultItemInvite = document.createElement('div')
                    resultItemInvite.classList.add('friend-result-invite')
                    resultItemInvite.textContent = 'Chat'
                    directToFriendChat(resultItemInvite, e['_id'], e['username'])
                    resultItem.append(resultItemInvite)
                    allFriendTab.append(resultItem)
                } else {
                    const resultItemInvite = document.createElement('div')
                    if (e['sender']) {
                        resultItemInvite.classList.add('friend-result-cancel')
                        resultItemInvite.textContent = 'Cancel'
                        cancelFriend(resultItem, resultItemInvite, e['_id'])
                    } else {
                        isPending = true
                        resultItemInvite.classList.add('friend-result-accept')
                        resultItemInvite.textContent = 'Accept'
                        confirmFriend(resultItem, resultItemInvite, e['_id'])
                    }
                    resultItem.append(resultItemInvite)
                    pendingFriendTab.append(resultItem)
                }

                if (isPending) {
                    const pendingAlert = document.getElementById('friend-pending-alert')
                    pendingAlert.style.display = 'block'
                }
            })
        }
    })
}

function directToFriendChat(button, friendId, friendName) {
    button.addEventListener('click', (e) => {
        e.preventDefault();

        thisUser.then((res) => {
            for (let i = 0; i < res['chats'].length; i++) {
                if (res['chats'][i]['participants'] == friendId) {
                    window.location = `/chat/${res['chats'][i]['_id']}`
                    return
                }
            }
        })

        let url = `/api/chats`
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "_id": friendId,
                "target_name": friendName
            })
        }).then((res) => { return res.json(); })
        .then((data) => {
            if (data['ok']) {
                window.location = `/chat/${data['data']['_id']}`
            }
        })

    })
}


function confirmFriend(parentItem, element, friendId) {
    element.addEventListener('click', (e) => {
        e.preventDefault();
        let url = `/api/friend`
        fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "_id": friendId
            })
        }).then((res) => { return res.json(); })
        .then((data) => {
            if (data['ok']) {
                pendingFriendTab.removeChild(parentItem)

                const resultItem = document.createElement('div')
                renderFriendItem(resultItem, data['data'])

                const resultItemInvite = document.createElement('div')
                resultItemInvite.classList.add('friend-result-invite')
                resultItemInvite.textContent = 'Chat'
                directToFriendChat(resultItemInvite, data['data']['_id'], data['data']['username'])
                resultItem.append(resultItemInvite)
                allFriendTab.append(resultItem)
            }
        })
    })
}

function cancelFriend(parentItem, element, friendId) {
    
    element.addEventListener('click', (e) => {
        e.preventDefault();
        let url = `/api/friend`
        fetch(url, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "_id": friendId
            })
        }).then((res) => { return res.json(); })
        .then((data) => {
            if (data['ok']) {
                pendingFriendTab.removeChild(parentItem)
            }
        })
    })
}

function addFriend() {
    const addFriendButton = document.getElementById('add-friend-form-form-button')

    addFriendButton.addEventListener('click', (e) => {
        e.preventDefault();

        let friendNameInput = document.getElementById('add-friend-form-name-input')

        if (friendNameInput.value === '') {
            return
        } else {

            while (resultContainer.firstChild) {
                resultContainer.removeChild(resultContainer.firstChild);
            }

            let url =  `/api/user/${friendNameInput.value}`
            fetch(url, {
                method: 'GET',
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
            }).then((res) => { return res.json()})
            .then((data) => {
                
                if( data['ok'] ) {
                    friendNameInput.value = ''
                    
                    data['data'].forEach(e => {
                        const resultItem = document.createElement('div')
                        renderFriendItem(resultItem, e, 'fetch')

                        const resultItemInvite = document.createElement('div')
                        resultItemInvite.classList.add('friend-result-invite')
                        resultItemInvite.textContent = 'Add'
                        addFriendLink(resultItem, resultItemInvite, e['_id'])

                        resultItem.append(resultItemInvite)
                        resultContainer.append(resultItem)

                    });
                }
            })
        }


    })
}

function addFriendLink(parentItem, element, userId) {
    element.addEventListener('click', (e) => {
        e.preventDefault();
        let url = `/api/friend`
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "_id": userId
            })
        }).then((res) => { return res.json(); })
        .then((data) => {
            if (data['ok']) {
                resultContainer.removeChild(parentItem)

                const resultItem = document.createElement('div')
                renderFriendItem(resultItem, data['data'])

                const resultItemInvite = document.createElement('div')
                resultItemInvite.classList.add('friend-result-cancel')
                resultItemInvite.textContent = 'Cancel'
                cancelFriend(resultItem, resultItemInvite, data['data']['_id'])

                resultItem.append(resultItemInvite)
                pendingFriendTab.append(resultItem)

            }
        })
    })
}


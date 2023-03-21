let thisUser = authUser();
let thisUserCars = getAllChatId()
clickElementId = ["image-input-button", "image-input-test", "send-container", "banner-member-center-container", "navbar-member-center-text", "create-compartment-input", "navbar-member-center", "create-car-button", "create-compartment-button"]
fetchAllCar();
setPhotoButton()
previewPhoto()
changeProfile()
setCarSearch()
FriendAlert()

setTimeout(() => {
    memberCenterDisplay();
    redirectToChat();
    addCar();
    redirectToFriend();
    closeTabButton()
}, 0);

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
        if (data.username) {
            const navbarUsername = document.getElementById('banner-member-center-username')
            const navbarImg = document.getElementById('banner-member-center-img')
            navbarUsername.textContent = data.username
            navbarImg.setAttribute('src', data.profilePicture)
        } else if (window.location.href != '/') {
            window.location = '/login'
        }
        return data;
    })
    return response
}


function redirectToFriend() {
    const showAddFriendButton = document.getElementById('home-navbar-item-box')
    showAddFriendButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.location = '/chat/friends'
    })
}

function logoutUser() {
    const logoutButton = document.getElementById('log-out-button')

    logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
            let url = '/api/auth/user'
            fetch(url, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
            }).then((res) => { return res.json(); })
            .then((data) => {
                window.location = '/login'
            })

    })
}

function memberCenterDisplay() {
    const memberCenterButton = document.getElementById('navbar-member-center')
    const memberCenterContainer = document.getElementById('banner-member-center-container')
    memberCenterButton.addEventListener('click', (e) => {
        e.preventDefault();
        memberCenterContainer.style.display = "grid"

    })

    logoutUser()
}

function closeTabButton() {
    const homeNavbarLogo = document.getElementById('home-navbar-logo-box')
    const homeNavbarSearch = document.getElementById('car-search')
    const homeNavbarBuffer = document.getElementById("home-navbar-buffer")
    const homeNavbarItem = document.getElementById("home-navbar-item-box")
    const homeNavbarChat = document.getElementById("navbar-chat")
    
    const directToChat = document.getElementById('direct-to-chat-button')
    const chatContainer = document.getElementById('chat-container')
    const changeProfileExit = document.getElementById('change-profile-form-exit')
    const createCarExit = document.getElementById('create-car-form-exit')
    const roomContainerClose = document.getElementById('room-container')
    const footerBorder = document.getElementById('footer-border')
    const footer = document.getElementById('footer')

    addCloseTab(homeNavbarLogo)
    addCloseTab(homeNavbarSearch)
    addCloseTab(homeNavbarBuffer)
    addCloseTab(homeNavbarItem)
    addCloseTab(homeNavbarChat)
    addCloseTab(directToChat)
    addCloseTab(chatContainer)
    addCloseTab(changeProfileExit)
    addCloseTab(createCarExit)
    addCloseTab(roomContainerClose)
    addCloseTab(footerBorder)
    addCloseTab(footer)
    if (document.getElementById('chat-room-container')) {
        addCloseTab(document.getElementById('chat-room-container'))
    }

    if (document.getElementById('member-container')) {
        addCloseTab(document.getElementById('member-container'))
    }

    if (document.getElementById('create-comp-form-exit')) {
        addCloseTab(document.getElementById('create-comp-form-exit'))
    }

    if (document.getElementById('all-container')) {
        addCloseTab(document.getElementById('all-container'))
    }

    if (document.getElementById('pending-container')) {
        addCloseTab(document.getElementById('pending-container'))
    }

    if (document.getElementById('add-container')) {
        addCloseTab(document.getElementById('add-container'))
    }
}

function addCloseTab(element) {
    element.addEventListener('click', (e) => {
        e.preventDefault();

        if (clickElementId.includes(e.target.id)) {
            return
        } else {

        const AddCarForm = document.getElementById('create-car-form')
        const resultContainer = document.getElementById('search-bar-result-container') 
        const changePhotoContainer = document.getElementById('change-profile-form')
        const memberCenterContainer = document.getElementById('banner-member-center-container')
        while (resultContainer.firstChild) {
            resultContainer.removeChild(resultContainer.firstChild)
        }

        memberCenterContainer.style.display = "none";
        AddCarForm.style.display = "none";

        changePhotoContainer.style.display = 'none';
        
        if (document.getElementById("create-comp-form")) {
            document.getElementById("create-comp-form").style.display = "none";
        }
    }
    })
}

function redirectToChat() {
    const navbarChatButton = document.getElementById('navbar-chat')
    const sidebarChatButton = document.getElementById('direct-to-chat-button')
    const logoButton = document.getElementById('home-navbar-logo-box')
    
    navbarChatButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.location = '/chat'
    })
    sidebarChatButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.location = '/chat'
    })

    logoButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.location = '/chat'
    })

}

function fetchAllCar() {
    let url = "/api/car";
    fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
    }).then((res) => { return res.json(); })
    .then((data) => {
        const chatContainer = document.getElementById('chat-container');
        data.forEach(e => {
            let newCar = document.createElement('a')
            newCar.classList.add('chat-item')
            newCar.textContent = e.name
            const createCarButton = document.getElementById('create-car-button')
            chatContainer.insertBefore(newCar, createCarButton)
            addCarLink(newCar, e._id)
        });
    })
}

function addCarLink(carItem, carId) {
    carItem.addEventListener('click', (e) => {
        e.preventDefault()
        window.location = `/car/${carId}`
    })
}


function addCar() {
    const showAddCarButton = document.getElementById('create-car-button')
    const AddCarForm = document.getElementById('create-car-form')
    showAddCarButton.addEventListener('click', (e) => {
        e.preventDefault();
        AddCarForm.style.display = "grid";
    })


    const addCarButton = document.getElementById('create-car-form-button')
    
    addCarButton.addEventListener('click', (e) => {
        e.preventDefault();
        let url = "/api/car";
        const newCarNameInput = document.getElementById('create-car-form-name-input').value
        const newCarTypeInput = document.getElementById('create-car-form-type-input').value
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "name": newCarNameInput,
                "topic": newCarTypeInput
            })
        }).then((res) => { return res.json(); })
        .then((data) => {
            if(data.ok) {
                window.location.reload()
            }
        })
    })

    const closeButton = document.getElementById('create-car-form-exit')
    closeButton.addEventListener('click', (e) => {
        e.preventDefault()
        AddCarForm.style.display = "none";
    })
}

function setCarSearch() {
    const carInput = document.getElementById('car-search')

    carInput.addEventListener('keyup', (e) => {
        let keyword = carInput.value

        if (keyword == '') {
            return
        } else {
            thisUserCars.then((res) => {
            
                let url =`/api/cars/${keyword}`
                fetch(url, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                }).then((res) => { return res.json(); })
                .then((data) => {
                    if (data.ok) {
                        const resultContainer = document.getElementById('search-bar-result-container')
                        
                        while (resultContainer.firstChild) {
                            resultContainer.removeChild(resultContainer.firstChild)
                        }
                        
                        data.data.forEach(e => {
                            const resultItem = document.createElement('div')
                            resultItem.classList.add('search-bar-result-item')
                            const resultItemName = document.createElement('div')
                            resultItemName.classList.add('search-bar-result-item-name')
                            resultItemName.textContent = e.name
                            const resultItemTopic = document.createElement('span')
                            resultItemTopic.classList.add('search-bar-result-item-topic')
                            resultItemTopic.textContent = ' /' + e.topic
                            
                            const resultItemInvite = document.createElement('div')
                            if (res.includes(e._id)) {
                                resultItemInvite.classList.add('search-bar-result-item-redirect')
                                resultItemInvite.textContent = 'Go'
                                setCarRedirectButton(resultItemInvite, e._id)
                            } else {
                                resultItemInvite.classList.add('search-bar-result-item-invite')
                                resultItemInvite.textContent = 'Join'
                                setCarJoinButton(resultItemInvite, e._id)
                            }
                            resultContainer.append(resultItem)
                            resultItem.append(resultItemName)
                            resultItemName.append(resultItemTopic)
                            resultItem.append(resultItemInvite)
                        })
                    } else {
                        return
                    }
                })
            })
        }
    })
}

function setCarRedirectButton(element, carId) {
    element.addEventListener('click', (e) => {
        e.preventDefault();
        window.location = `/car/${carId}`
    })
}

function setCarJoinButton(element, carId) {

    element.addEventListener('click', (e) => {
        e.preventDefault();

        let url = `/api/car/${carId}`;
        
        fetch(url, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "action": 'add'
            })
        }).then((res) => { return res.json(); })
        .then((data) => {
            if (data.ok) {
                window.location = `/car/${carId}`
            }
        })
    })
}

function getAllChatId() {
    let thisUserCars = []
    let response = thisUser.then((res) => {
        res.cars.forEach(e => {
            thisUserCars.push(e._id)
        })
        return thisUserCars
    })
    return response
}

function setPhotoButton(){
    const photoButton = document.getElementById('change-photo-button')
    photoButton.addEventListener('click', (e) => {
        e.preventDefault();
        const editUserForm = document.getElementById('change-profile-form')
        editUserForm.style.display = 'grid'
    })
}

function previewPhoto() {
    const photoInput = document.getElementById('change-profile-form-type-input');
    const userPhoto = document.getElementById('banner-member-center-img');
    const photoName = document.getElementById('file-name')

    photoInput.addEventListener('change', (e) => {
        e.preventDefault();
        const newPhoto = photoInput.files[0]
        let url = URL.createObjectURL(newPhoto)
        userPhoto.setAttribute('src', url)
        photoName.textContent = newPhoto.name
        
        const photoCloseButton = document.getElementById('file-name-close')
        photoCloseButton.style.visibility = 'visible'

        photoCloseButton.addEventListener('click', (e) => {
            e.preventDefault();
            photoInput.value = '';
            photoCloseButton.style.visibility = 'hidden'
            photoName.textContent = ''

        })
    })
}

function changeProfile() {

    const changeProfileButton = document.getElementById('change-profile-form-button')
    changeProfileButton.addEventListener('click', (e) => {
        const nameInput = document.getElementById('change-profile-form-name-input').value
        const photoInput = document.getElementById('change-profile-form-type-input').files
        let url = '/api/user'
        const formData = new FormData();


        if (nameInput){
            formData.append('username', nameInput)
        }
        if (photoInput.length) {
            formData.append('profilePicture', photoInput[0])
        } 

        if (!nameInput && !photoInput.length) {
            return 
        } else {
            fetch(url, {
                method: "PUT",
                body: formData
            }).then((res) => { return res.json(); })
            .then((data) => {
                if (data) {
                    window.location.reload()
                }
            })
        }
        
    })
}

function FriendAlert() {
    thisUser.then((res) => {
        for ( let i = 0; i < res['friends'].length; i++) {
            if ( !res.friends[i].verified && !res.friends[i].sender) {
                const friendAlert = document.getElementById('friend-alert')
                friendAlert.style.display = 'block'
                break
            }
        }
    })
}
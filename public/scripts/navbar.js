memberCenterDisplay();
redirectToChat();
addCar();
fetchAllCar();
redirectToFriend()

let thisCar = window.location.href.split('/')[4].split('.')[0]
const roomContainer = document.getElementById('room-container');
const chatContainer = document.getElementById('chat-container');
const AddCarForm = document.getElementById('create-car-form')
const clickElementId = ["create-car-form-border", "add-friend-form", "home-navbar-add-friend", "create-car-form-button", "create-car-form-type-input", "create-car-form-type-label", "create-car-form-name-input", "create-car-form-name-label", "create-car-form-head", "create-car-form-border", "create-car-form" , 'create-car-button', 'navbar-member-center', 'navbar-member-center-text', 'banner-member-center-container', 'redirect-button']


function redirectToFriend() {
    const showAddFriendButton = document.getElementById('home-navbar-add-friend')
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

    window.addEventListener('click', (e) => {
        
        e.preventDefault();
        // if (e.target.id == "create-car-form" || e.target.id == 'create-car-button' || e.target.id == 'navbar-member-center' || e.target.id == 'navbar-member-center-text' || e.target.id == 'banner-member-center-container' || e.target.id == 'redirect-button') {
        if (clickElementId.includes(e.target.id)) {
            return
        } else {
            memberCenterContainer.style.display = "none";
            AddCarForm.style.display = "none";
        }
    })

    logoutUser()
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
        data.forEach(e => {
            let newCar = document.createElement('a')
            newCar.classList.add('chat-item')
            newCar.textContent = e['name']
            const createCarButton = document.getElementById('create-car-button')
            chatContainer.insertBefore(newCar, createCarButton)
            addCarLink(newCar, e['_id'])
        });
    })
}

function addCarLink(carItem, carId) {
    carItem.addEventListener('click', (e) => {
        e.preventDefault()
        window.location = `/car/${carId}.general`
    })
}


function addCar() {
    const showAddCarButton = document.getElementById('create-car-button')
    showAddCarButton.addEventListener('click', (e) => {
        e.preventDefault();
        // showAddCarButton.style.display = "none";
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
            if(data['ok']) {
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

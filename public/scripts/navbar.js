authUser();
memberCenterDisplay();
redirectToChat();

function authUser() {
    let url = '/api/user/auth'
    fetch(url, {
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
            // navbarImg.setAttribute('src', '')
        } else if (window.location.href != '/') {
            window.location = '/login'
        }
        return data;
    })
}

function logoutUser() {
    const logoutButton = document.getElementById('log-out-button')

    logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
            let url = '/api/user/auth'
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
        if (e.target.id == 'navbar-member-center' || e.target.id == 'navbar-member-center-text' || e.target.id == 'banner-member-center-container' || e.target.id == 'redirect-button') {
            return
        } else {
            memberCenterContainer.style.display = "none"
        }
    })

    logoutUser()
}

function redirectToChat() {
    const chatButton = document.getElementById('navbar-chat')
    chatButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.location = '/chat'
    })
}
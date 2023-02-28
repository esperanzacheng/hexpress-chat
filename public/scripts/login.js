const switchToLoginButton = document.getElementById('switch-to-login')
const switchToRegisterButton = document.getElementById('switch-to-register')
const registerForm = document.getElementById('register-form')
const loginForm = document.getElementById('login-form')

const usernameUsed = document.getElementById('username-used-alert')
const registerUsernameNotFilled = document.getElementById('register-username-no-filled-alert')
const emailUsed = document.getElementById('email-used-alert')
const registerEmailNotFilled = document.getElementById('register-email-no-filled-alert')
const passwordLength = document.getElementById('password-alert')
const registerPasswordNotFilled = document.getElementById('register-password-no-filled-alert')
const registerVow = document.getElementById('register-vow-alert')
const loginEmailNotFilled = document.getElementById('login-email-no-filled-alert')
const loginPasswordNotFilled = document.getElementById('login-password-no-filled-alert')
const loginVow = document.getElementById('login-vow-alert')
const wrongEmail = document.getElementById('wrong-email')
const wrongPassword = document.getElementById('wrong-password')
const registerSuccess = document.getElementById('register-success')


postUser();
loginUser();
switchToLogin();
switchToRegister();

function postUser() {
    const registerButton = document.getElementById('register-button')
    
    registerButton.addEventListener('click', (e) => {
        e.preventDefault();
        clearRegisterAlert()
        
        const username = document.getElementById('register-name').value
        const email = document.getElementById('register-email').value
        const password = document.getElementById('register-password').value
        const vow = document.getElementById('register-vow')


        if (username && email && password && vow.checked) {
            let url = '/api/user'
            fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "username": username,
                    "email": email,
                    "password": password
                })
            }).then((res) => { return res.json(); })
            .then((data) => {
                if (data['error'] == 'username is used') {
                    usernameUsed.style.display = "block"
                } else if (data['error'] == 'email is used') {
                    emailUsed.style.display = 'block'
                } else {
                    registerSuccess.style.display = 'block'
                }
            })
        } else {
            if (!username) {
                registerUsernameNotFilled.style.display = "block"
            }
            if (!email) {
                registerEmailNotFilled.style.display = "block"
            }
            if (!password) {
                registerPasswordNotFilled.style.display = "block"
            } else if (password.length < 6) {
                passwordLength.style.display = "block"
            }
            if (!vow.checked) {
                registerVow.style.display = "block"
            }
        }
    })
}

function loginUser() {
    const loginButton = document.getElementById('login-button')
    
    loginButton.addEventListener('click', (e) => {
        e.preventDefault();

        clearLoginAlert();
        const email = document.getElementById('login-email').value
        const password = document.getElementById('login-password').value
        const vow = document.getElementById('login-vow')

        if (email && password && vow.checked) {
            let url = '/api/auth/user'
            fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "email": email,
                    "password": password
                })
            }).then((res) => { return res.json(); })
            .then((data) => {
                if (data['ok']) {
                    // console.log(`/car/${data['cars'][0]['car_name']}.general`)
                    window.location = `/chat`
                } else if (data['error'] == "user not found") {
                    wrongEmail.style.display = "block"
                } else if (data['error'] == "wrong password") {
                    wrongPassword.style.display = "block"
                }
            })
        } else {
            if (!email) {
                loginEmailNotFilled.style.display = "block"
            }
            if (!password) {
                loginPasswordNotFilled.style.display = "block"
            }
            if (!vow.checked) {
                loginVow.style.display = "block"
            }
        }
    })
}

function switchToLogin() {
    switchToLoginButton.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.style.display = "none"
        loginForm.style.display = "grid"
        switchToLoginButton.style.display = "none"
        switchToRegisterButton.style.display = "grid"
        clearLoginAlert()
    })

}

function switchToRegister() {
    switchToRegisterButton.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.style.display = "grid"
        loginForm.style.display = "none"
        switchToLoginButton.style.display = "grid"
        switchToRegisterButton.style.display = "none"
        clearRegisterAlert()
    })
}

function clearAlert(element) {
    if (element) {
        element.style.display = "none";
    }
}

function clearRegisterAlert() {
    clearAlert(usernameUsed)
    clearAlert(registerUsernameNotFilled)
    clearAlert(emailUsed)
    clearAlert(registerEmailNotFilled)
    clearAlert(passwordLength)
    clearAlert(registerPasswordNotFilled)
    clearAlert(registerVow)
    clearAlert(registerSuccess)

}

function clearLoginAlert() {
    clearAlert(loginEmailNotFilled)
    clearAlert(loginPasswordNotFilled)
    clearAlert(loginVow)
    clearAlert(wrongEmail)
    clearAlert(wrongPassword)
}
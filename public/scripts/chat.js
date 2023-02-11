const redirectButton = document.getElementById('redirect-button')
redirectButton.addEventListener('click', (e) => {
    e.preventDefault();
    window.location = "/car/test.general"
})
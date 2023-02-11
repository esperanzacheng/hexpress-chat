let thisCar = window.location.href.split('/')[4].split('.')[0]
const roomContainer = document.getElementById('room-container');

fetchAllCar();
addCarCompartment();
addCar();

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
            let newRoom = document.createElement('a')
            newRoom.setAttribute('href', `/car/${thisCar}.${e['name']}`)
            newRoom.classList.add('room-item')
            let roomName = document.createElement('div')
            roomName.textContent = e['name']
            roomName.classList.add('room-item-name')
            roomContainer.insertBefore(newRoom, roomContainer.firstChild)
            newRoom.append(roomName)
        });
    })
}

function addCar() {
    const showAddCarButton = document.getElementById('create-car-button')
    const AddCarForm = document.getElementById('create-car-form')
    showAddCarButton.addEventListener('click', (e) => {
        e.preventDefault();
        // showAddCarButton.style.display = "none";
        AddCarForm.style.display = "grid";
    })


    const addCarButton = document.getElementById('create-car-form-button')
    
    addCarButton.addEventListener('click', (e) => {
        e.preventDefault();
        let url = "/api/car";
        const newCarInput = document.getElementById('create-car-form-input').value
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "name": newCarInput
            })
        }).then((res) => { return res.json(); })
        .then((data) => {
            console.log(data)
        })
    })
}

function addCarCompartment() {
    const showAddButton = document.getElementById('create-compartment-button')
    const addCompartmentForm = document.getElementById('create-compartment-form')
    showAddButton.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('should work')
        showAddButton.style.display = "none"
        addCompartmentForm.style.display = "grid"
    })
    const addCompartmentButton = document.getElementById('add-compartment-button')
    addCompartmentButton.addEventListener('click', (e) => {
        const newCompartment = document.getElementById('create-compartment-form-input').value
        e.preventDefault();
        let url = '/api/car'
        fetch(url, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "cars": thisCar,
                "compartments": newCompartment
            })
        }).then((res) => { return res.json(); })
        .then((data) => {
            if (data['ok']) {
                newCompartment = ""
                showAddButton.style.display = "grid"
                addCompartmentForm.style.display = "none"

                let newRoom = document.createElement('a')
                newRoom.setAttribute('href', `/car/${thisCar}.${e['name']}`)
                newRoom.classList.add('room-item')
                let roomName = document.createElement('div')
                roomName.textContent = e['name']
                roomName.classList.add('room-item-name')
                roomContainer.append(newRoom)
                newRoom.append(roomName)

            }
        })
    })
}

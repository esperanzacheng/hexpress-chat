const roomContainer = document.getElementById('room-container');

getCompartment(thisCar)
addCarCompartment();
console.log(thisCar)
async function getCompartment(carId) {
    let url = `/api/compartment/${carId}`
    let response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
    }).then((res) => { return res.json(); })
    .then((data) => {
        if (data['ok']) {
            data['data'].forEach(e => {
                const roomItem = document.createElement('div')
                roomItem.classList.add('room-item')
                const roomItemName = document.createElement('div')
                roomItemName.classList.add('room-item-name')
                if (e['type'] === true) {
                    roomItemName.textContent = '# ' + e['name']

                } else {
                    roomItemName.textContent = '\u{1F508}' + e['name']
                }
                roomContainer.append(roomItem)
                roomItem.append(roomItemName)
                setCompartmentLink(roomItem, thisCar, e['_id'])
            });
            
            roomContainer.append()
        } else if (window.location.href != '/') {
            window.location = '/login'
        }
        return data;
    })
    return response
}

function addCarCompartment() {
    const showAddButton = document.getElementById('create-compartment-button')
    const addCompartmentForm = document.getElementById('create-compartment-form')
    showAddButton.addEventListener('click', (e) => {
        e.preventDefault();
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
                setCompartmentLink(newRoom, thisCar, e['name'])
                // newRoom.setAttribute('href', `/car/${thisCar}/${e['name']}`)
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

function setCompartmentLink(element, car, compartment) {
    element.addEventListener('click', (e) => {
        e.preventDefault()
        window.location = `/car/${car}/${compartment}`
    })
}

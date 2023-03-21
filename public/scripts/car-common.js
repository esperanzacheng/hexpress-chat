const showAddButton = document.getElementById('create-compartment-button');
const roomContainer = document.getElementById('room-container');
let thisCar = window.location.href.split('/')[4]
getCompartment(thisCar)
addCarCompartment();

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
        if (data.ok) {
            data.data.forEach(e => {
                const roomItem = document.createElement('div')
                roomItem.classList.add('room-item')
                const roomItemName = document.createElement('div')
                roomItemName.classList.add('room-item-name')
                if (e.type === true) {
                    roomItemName.textContent = '# ' + e.name
                    roomContainer.insertBefore(roomItem, roomContainer.firstChild)
                } else {
                    roomItemName.textContent = '\u{1F508}' + e.name
                    roomContainer.insertBefore(roomItem, showAddButton)
                }

                
                roomItem.append(roomItemName)
                setCompartmentLink(roomItem, thisCar, e._id)
            });
            
        } else if (window.location.href != '/') {
            window.location = '/login'
        }
        return data;
    })
    return response
}

function addCarCompartment() {

    const addCompartmentForm = document.getElementById('create-comp-form')
    showAddButton.addEventListener('click', (e) => {
        e.preventDefault();
        addCompartmentForm.style.display = "grid"
    })
    const addCompartmentButton = document.getElementById('create-comp-form-button')
    addCompartmentButton.addEventListener('click', (e) => {
        const compNameInput = document.getElementById('create-comp-form-name-input')
        const compTypeInput = document.getElementById('create-comp-form-type-input')
        e.preventDefault();
        let url = '/api/compartment'
        fetch(url, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "name": compNameInput.value,
                "type": compTypeInput.value,
                "car_id": thisCar
            })
        }).then((res) => { return res.json(); })
        .then((data) => {
            if (data['ok']) {
                window.location = `/car/${thisCar}/${data.data._id}`
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
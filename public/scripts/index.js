let width = 300;
const diff = 2;
let intervalId = 0;
let intervalTime = 50;

window.onload = function() {
    intervalId = setInterval(expand, intervalTime);
    chatButton();
}

function expand() {
    if (width < 350) {
        width = width + diff;
        ticket.style.width = width+'px';
    } else {
        clearInterval(intervalId);
        intervalId = setInterval(shrink, intervalTime);
    }
}

function shrink() {
    if (width > 300) {
        width = width - diff;
        ticket.style.width = width+'px';
    } else {
        clearInterval(intervalId);
        intervalId = setInterval(expand, intervalTime);
    }
}

function chatButton() {
    const ticket = document.getElementById('ticket');
    ticket.addEventListener('click', e => {
        e.preventDefault();
        window.location = "/chat";
    })
}

// function showNameForm() {
//     const ticketText = document.getElementById('ticket-text');
//     const ticket = document.getElementById('ticket');
//     const nameText = document.getElementById('name-text');
//     ticket.addEventListener('click', e => {
//       e.preventDefault();
//       const nameForm = document.getElementById('name-form');
//       ticketText.style.display = "none";
//       ticket.style.display = "none";
//       nameText.style.display = "block";
//       nameForm.style.display = "grid";

//       const nameButton = document.getElementById('name-button');
//       nameButton.addEventListener('click', e => {
//           e.preventDefault();
//           const nameInput = document.getElementById('name-input').value;
//           // window.location = "/chat";
//           console.log(nameInput)
//           return nameInput;
          
//       })
//     })
//   }
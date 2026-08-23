const guestUser = getGuestUser();
document.getElementById('public-navbar-username').textContent = '[guest] ' + guestUser.username;

const socket = io('/');
const roomList = document.getElementById('public-room-list');
const showCreateRoomButton = document.getElementById('show-create-room-button');
const createRoomForm = document.getElementById('create-room-form');
const createRoomNameInput = document.getElementById('create-room-name-input');
const createRoomError = document.getElementById('create-room-error');

function getGuestUser() {
  const stored = sessionStorage.getItem('guestUser');
  if (!stored) {
    window.location = '/guest';
    return { guestId: null, username: '' };
  }
  return JSON.parse(stored);
}

function addRoomItem(compartment) {
  const roomItem = document.createElement('div');
  roomItem.classList.add('public-room-item');
  roomItem.textContent = '# ' + compartment.name;
  roomItem.addEventListener('click', () => {
    window.location = `/public/${compartment._id}`;
  });
  roomList.append(roomItem);
}

async function loadRooms() {
  const response = await fetch('/api/public/compartment').then(res => res.json());
  if (response.ok) {
    response.data.forEach(addRoomItem);
  }
}

showCreateRoomButton.addEventListener('click', () => {
  createRoomForm.style.display = createRoomForm.style.display === 'none' ? 'grid' : 'none';
});

createRoomForm.addEventListener('submit', async(e) => {
  e.preventDefault();
  createRoomError.textContent = '';
  const name = createRoomNameInput.value.trim();
  if (!name) {
    return;
  }

  const response = await fetch('/api/public/compartment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  }).then(res => res.json());

  if (response.ok) {
    createRoomNameInput.value = '';
    window.location = `/public/${response.data._id}`;
  } else {
    createRoomError.textContent = response.error || 'Could not create room';
  }
});

socket.on('room-created', (compartment) => {
  addRoomItem(compartment);
});

loadRooms();

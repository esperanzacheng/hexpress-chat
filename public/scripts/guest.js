const guestNameForm = document.getElementById('guest-name-form');
const guestNameInput = document.getElementById('guest-name-input');
const guestNameError = document.getElementById('guest-name-error');

guestNameForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = guestNameInput.value.trim();
  if (!name) {
    guestNameError.textContent = 'Please enter a display name';
    return;
  }

  const guestUser = {
    guestId: crypto.randomUUID(),
    username: name
  };
  sessionStorage.setItem('guestUser', JSON.stringify(guestUser));
  window.location = '/public';
});

const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001'
})

const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {};
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream);
  // addMutedButton(document.querySelector('.video-box'), myVideo);
  addMutedButton(myVideo);

  myPeer.on('call', call => {
    call.answer(stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream);
    })
  })

  socket.on('video-user-connected', userId => {
    connectToNewUser(userId, stream);
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close();
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id);
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream);
  })
  call.on('close', () => {
    video.remove();
  })

  peers[userId] = call;
}

function addVideoStream(video, stream) {
  // const videoBox = document.createElement('div');
  // videoBox.classList.add('video-box');
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  })
  // videoGrid.append(videoBox);
  // videoBox.append(video);
  videoGrid.append(video);
}

function addMutedButton(video) {
  const mutedButton = document.createElement('div');
  mutedButton.classList.add('video-mute-button');
  video.append(mutedButton);
  mutedButton.addEventListener('click', (e) => {
    e.preventDefault();
    if(video.muted == true) {
      video.muted = false;
      mutedButton.style.backgroundColor = '#FFC53F';
    } else {
      video.muted = true;
      mutedButton.style.backgroundColor = '#932020';
    }
  })
}



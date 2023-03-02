const socket = io('/')
const videoGrid = document.getElementById('video-grid')

const myPeer = new Peer()

const myVideo = document.createElement('video');
myVideo.muted = true;

const constraints = {
  video: {
    width: {min: 640, ideal: 1920, max: 1920},
    height: {min: 480, ideal: 1080, max: 1080},
  },
  audio: true
}

const peers = {};
navigator.mediaDevices.getUserMedia(constraints)
.then(stream => {
  addVideoStream(myVideo, stream);
  addMutedButton(stream);
  addCameraButton(stream);
  addLeaveButton(); 

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
  if (peers[userId]) {
    peers[userId].close();
  }
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
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  })

  videoGrid.append(video);
}

function addMutedButton(stream) {
  const mutedButton = document.getElementById('mute-button');
  mutedButton.addEventListener('click', (e) => {
    e.preventDefault();
    let audioTrack = stream.getTracks().find(track => track.kind === 'audio');

    if(audioTrack.enabled){
        audioTrack.enabled = false;
        mutedButton.style.backgroundColor = '#932020';
    }else{
        audioTrack.enabled = true;
        mutedButton.style.backgroundColor = '#067D10';
    }
  })
}

function addCameraButton(stream) {
  const cameraButton = document.getElementById('camera-button');
  cameraButton.addEventListener('click', (e) => {
    e.preventDefault();
    let videoTrack = stream.getTracks().find(track => track.kind === 'video')

    if(videoTrack.enabled){
        videoTrack.enabled = false;
        cameraButton.style.backgroundColor = '#932020';
    }else{
        videoTrack.enabled = true;
        cameraButton.style.backgroundColor = '#067D10';
    }
  })
}

function addLeaveButton() {
  const cameraButton = document.getElementById('leave-button');
  cameraButton.addEventListener('click', (e) => {
    e.preventDefault();
    window.history.back();
  }) 
}
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require("path");
const db = require('./config/db')
db.getConnection();

// const bodyParser = require('body-parser');

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

const indexRoute = require('./routes/indexRoute.js')
const rooms = { 'test': {'users': {}} };

app.use("/", indexRoute);


// video chat page
app.get('/floo/:room', (req, res) => {
  res.render('room', { title: 'Video Chat', roomId: req.params.room });
})

io.on('connection', socket => {
  // video chat control
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit('video-user-connected', userId);

    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', userId);
    })
  })

  // text chat control
  socket.on('new-user', (room, name) => {
    socket.join(room)
    rooms[room].users[socket.id] = name
    socket.to(room).emit('user-connected', name)
  })
  socket.on('send-chat-message', (room, message) => {
    socket.to(room).emit('chat-message', { message: message, name: rooms[room].users[socket.id] })
  })
  socket.on('disconnect', () => {
    getUserRooms(socket).forEach(room => {
      socket.to(room).emit('user-disconnected', rooms[room].users[socket.id])
      delete rooms[room].users[socket.id]
    })
  })
})


app.get('/chat', (req, res) => {
  // res.render('chat', { title: 'Chat', rooms: rooms, roomName: req.params.compartment});
  res.render('chat', { title: 'Chat', rooms: rooms, roomName: 'test'});
})

app.post('/api/chatroom', (req, res) => {
  if (rooms[req.body.compartment] != null) {
    return res.redirect('/')
  }
  rooms[req.body.compartment] = { users: {} }
  res.redirect(req.body.compartment)
  // Send message that new room was created
  io.emit('room-created', req.body.compartment)
})

app.get('/chat/:compartment', (req, res) => {
  if (rooms[req.params.compartment] == null) {
    // return res.redirect('/')
  }
  res.render('compartment', { title: 'Compartment', roomName: req.params.compartment })
})

// text chat function
function getUserRooms(socket) {
  return Object.entries(rooms).reduce((names, [name, room]) => {
    if (room.users[socket.id] != null) names.push(name)
    return names
  }, [])
}

server.listen(3000);
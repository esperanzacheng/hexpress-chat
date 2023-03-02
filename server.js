const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require("path");
const db = require('./config/db')
db.getConnection();

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const indexRoute = require('./routes/indexRoute.js')
const chatController = require('./controllers/chatController.js')
const compartmentController = require('./controllers/compartmentController.js')

app.use("/", indexRoute);

let rooms = { };

io.on('connection', (socket) => {
  // video chat control
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit('video-user-connected', userId);

    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', userId);
    })
  })

  // text chat control
  socket.on('new-user', (room, user) => {
    // console.log(user)
    socket.join(room)
    rooms[room].users[socket.id] = user
    socket.to(room).emit('user-connected', user)
    console.log(`text-new-user-object`, rooms)
  })
  socket.on('send-chat-message', (room, message) => {
    // console.log(`text-message: ${message}, text-name: ${rooms[room].users[socket.id]}`)
    let date = new Date();
    let formattedDate = date.toLocaleString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: 'numeric', 
      hour: 'numeric', 
      minute: 'numeric', 
      hour12: true 
    });
    socket.to(room).emit('chat-message', { content: message, profilePicture: rooms[room].users[socket.id]['profilePicture'], author: rooms[room].users[socket.id]['username'], createdAt: formattedDate})
    // console.log(`text-send-chat-object`, rooms)
  })
  socket.on('disconnect', () => {
    getUserRooms(socket).forEach(room => {
      socket.to(room).emit('user-disconnected', rooms[room].users[socket.id])
      delete rooms[room].users[socket.id]
      // console.log(`text-disconnect-object`, rooms)
    })
  })
})

app.get('/chat', async(req, res) => {

  const thisUserChat = await chatController.getChat(req, res).then(result => {
    return result
  }).then((data) => {
    return data
  })

  if (thisUserChat.length === 0) {
    res.redirect(`/chat/friends`) 
  } else {
    res.redirect(`/chat/${thisUserChat[0]['_id']}`)
  }

})

app.get('/chat/:chat_id', async(req, res) => {
  if (rooms[req.params.chat_id] == null) {
    console.log(req.params, 'req')
    rooms[req.params.chat_id] = { users: {} }
  } 

  if (req.params.chat_id === 'cloudfront stuff') {
    console.log(req.params, 'here')
  }

  if (req.params.chat_id === 'friends') {
    res.render('friend', { title: 'Friends' });
  } else {
    res.render('chat', { title: 'Chat', roomName: req.params.chat_id});
  }
  
})

app.get('/car/:car', async(req, res) => {

  const thisUserCar = await compartmentController.getFirstCompartment(req, res).then(result => {
    return result
  }).then((data) => {
    return data
  })

  if (thisUserCar.length === 0) {
    res.redirect(`/chat/friends`) 
  } else {
    res.redirect(`/car/${thisUserCar['car']}/${thisUserCar['compartment']}`)
  }

})

app.get('/car/:car/:compartment', (req, res) => {
  let uniqueRoom = req.params.car+req.params.compartment
  if (rooms[uniqueRoom] == null) {
    rooms[uniqueRoom] = { users: {} }
  } 
  
  res.render('car', { title: 'Car', roomName: uniqueRoom});
})

// text chat function
function getUserRooms(socket) {
  return Object.entries(rooms).reduce((names, [name, room]) => {
    if (room.users[socket.id] != null) names.push(name)
    return names
  }, [])
}

server.listen(3000);

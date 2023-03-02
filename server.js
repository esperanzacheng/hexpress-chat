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

app.use((err, req, res, next) => {
  if (err.status === 401) {
    return res.redirect('/login'); // replace with the URL of the page you want to redirect to
  }
  next(err);
});

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
    // console.log(`text-new-user-object`, rooms)
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
  if (thisUserChat === 401) {
    res.redirect(`/login`)
  } else if (thisUserChat === null) {
    res.redirect(`/chat/friends`) 
  } else {
    res.redirect(`/chat/${thisUserChat}`)
  }

})

app.get('/chat/:chat_id', async(req, res) => {

  if (rooms[req.params.chat_id] == null) {
    rooms[req.params.chat_id] = { users: {} }
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
  })

  if (thisUserCar === 401) {
    res.redirect(`/login`) 
  } else if (thisUserCar.length === 0) {
    res.redirect(`/chat/friends`) 
  } else {
    res.redirect(`/car/${thisUserCar['car']}/${thisUserCar['compartment']}`)
  }

})

app.get('/car/:car/:compartment', async(req, res) => {

  const thisCompartmentType = await compartmentController.getCompartmentType(req, res).then(result => {
    return result
  })
  
  if (thisCompartmentType == true) {
    if (rooms[req.params.compartment] == null) {
      rooms[req.params.compartment] = { users: {} }
    } 
    
    res.render('car', { title: 'Car', roomName: req.params.compartment });
  } else {
    res.render('floo', { title: 'Video Chat' });
  }

})

// text chat function
function getUserRooms(socket) {
  return Object.entries(rooms).reduce((names, [name, room]) => {
    if (room.users[socket.id] != null) names.push(name)
    return names
  }, [])
}

server.listen(3000);

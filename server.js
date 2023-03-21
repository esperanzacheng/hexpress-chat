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

const indexRoute = require('./routes/indexRoute.js');
const chatController = require('./controllers/chatController.js');
const compartmentController = require('./controllers/compartmentController.js');

app.use("/", indexRoute);

// redirect to login if not pass user authentication
app.use((err, req, res, next) => {
  if (err.status === 401) {
    return res.redirect('/login');
  }
  next(err);
});

const rooms = { };

io.on('connection', (socket) => {

  // video chat join / leave room
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit('video-user-connected', userId);

    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', userId);
    })
  })

  // text chat join room
  socket.on('new-user', (room, user) => {
    socket.join(room)
    rooms[room].users[socket.id] = user
    socket.to(room).emit('user-connected', user)
  })

  // text chat send message
  socket.on('send-chat-message', (room, message) => {
    const data = { 
      content: message.content,
      attachments: message.attachments,
      profilePicture: rooms[room].users[socket.id].profilePicture,
      author: rooms[room].users[socket.id].username,
      createdAt: message.createdAt
    };

    socket.to(room).emit('chat-message', data);
  })

  // text chat leave room
  socket.on('disconnect', () => {
    getUserRooms(socket).forEach(room => {
      socket.to(room).emit('user-disconnected', rooms[room].users[socket.id])
      delete rooms[room].users[socket.id]
    })
  })
})

// redirect to user's chat history
app.get('/chat', async(req, res) => {
  
  const thisUserChat = await chatController.getChat(req, res).then(result => {
    return result
  })

  if (thisUserChat === 401) { // no such user
    res.redirect(`/login`)
  } else if (thisUserChat === null) { // no prior chat history
    res.redirect(`/chat/friends`) 
  } else {
    res.redirect(`/chat/${thisUserChat}`)
  }

})

// get first chat room
app.get('/chat/:chat_id', async(req, res) => {

  const verifiedChat = await chatController.verifyChats(req, res).then(result => {
    return result
  })

  if (verifiedChat === 401) { // no such user
    res.redirect(`/login`)
  } else if (verifiedChat.err === 403) { // get chat room error
    if (verifiedChat.chat_id === undefined || req.params.chat_id === 'friends') { // no prior chat history
      res.render('friend', { title: 'Friends' });
    } else { // redirect to user's first chat despite user's wrong input
      res.redirect(`/chat/${verifiedChat.chat_id}`)
    }
  } else {
    if (rooms[req.params.chat_id] == null) { // insert the chat_id into socket object if there's no record
      rooms[req.params.chat_id] = { users: {} }
    } 

      res.render('chat', { title: 'Chat', roomName: req.params.chat_id});
  }
})

// redirect to car's first compartment
app.get('/car/:car', async(req, res) => {

  const thisUserCar = await compartmentController.getFirstCompartment(req, res).then(result => {
    return result
  })

  if (thisUserCar === 401) { // no such user
    res.redirect(`/login`) 
  } else if (thisUserCar.err === 403) { // get car error
    if (thisUserCar.data === null) { 
      res.redirect(`/chat`) // no user's car history
    } else {
      res.redirect(`/car/${thisUserCar.data.car}/${thisUserCar.data.compartment}`) // redirect to user's first car
    }
  } else {
    res.redirect(`/car/${thisUserCar.car}/${thisUserCar.compartment}`)
  }

})

// get car's first compartment
app.get('/car/:car/:compartment', async(req, res) => {

  const thisCompartmentType = await compartmentController.getCompartmentType(req, res).then(result => {
    return result
  })

  if (thisCompartmentType === null) { // no such compartment
    res.redirect('/chat')
  } else if (thisCompartmentType === 401) { // no such user
    res.redirect('/login')
  } else if (thisCompartmentType.ok) {
    
    if (thisCompartmentType.data == true) { // compartment type === text
      if (rooms[req.params.compartment] == null) {  // insert the chat_id into socket object if there's no record
        rooms[req.params.compartment] = { users: {} }
      } 
      
      res.render('car', { title: 'Car', roomName: req.params.compartment });
    } else { // compartment type === voice
      res.render('floo', { title: 'Video Chat' });
    } 
  } else { // redirect to this car's first compartment
    
    res.redirect(`/car/${req.params.car}/${thisCompartmentType._id}`)
  }
})

// text chat leave room function
function getUserRooms(socket) {
  return Object.entries(rooms).reduce((names, [name, room]) => {
    if (room.users[socket.id] != null) names.push(name)
    return names
  }, [])
}

server.listen(3000);

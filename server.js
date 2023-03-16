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
const bodyParser = require('body-parser');

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
    let data = { }
    data['content'] = message.content
    data['attachments'] = message.attachments
    data['profilePicture'] = rooms[room].users[socket.id]['profilePicture']
    data['author'] = rooms[room].users[socket.id]['username']
    data['createdAt'] = message.createdAt

    socket.to(room).emit('chat-message', data)
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

  const verifiedChat = await chatController.verifyChats(req, res).then(result => {
    return result
  })

  if (verifiedChat === 401) {
    res.redirect(`/login`)
  } else if (verifiedChat['err'] === 403) {
    if (verifiedChat['chat_id'] === undefined || req.params.chat_id === 'friends') {
      res.render('friend', { title: 'Friends' });
    } else {
      res.redirect(`/chat/${verifiedChat['chat_id']}`)
    }
  } else {
    if (rooms[req.params.chat_id] == null) {
      rooms[req.params.chat_id] = { users: {} }
    } 

      res.render('chat', { title: 'Chat', roomName: req.params.chat_id});
  }
})

app.get('/car/:car', async(req, res) => {

  const thisUserCar = await compartmentController.getFirstCompartment(req, res).then(result => {
    return result
  })

  if (thisUserCar === 401) {
    res.redirect(`/login`) 
  } else if (thisUserCar['err'] === 403) {
    if (thisUserCar['data'] === null) {
      res.redirect(`/chat`) 
    } else {
      res.redirect(`/car/${thisUserCar['data']['car']}/${thisUserCar['data']['compartment']}`)
    }
  } else {
    res.redirect(`/car/${thisUserCar['car']}/${thisUserCar['compartment']}`)
  }

})

app.get('/car/:car/:compartment', async(req, res) => {

  const thisCompartmentType = await compartmentController.getCompartmentType(req, res).then(result => {
    return result
  })

  if (thisCompartmentType === null) {
    res.redirect('/chat')
  } else if (thisCompartmentType === 401) {
    res.redirect('/login')
  } else if (thisCompartmentType['ok']) {
    
    if (thisCompartmentType['data'] == true) {
      if (rooms[req.params.compartment] == null) {
        rooms[req.params.compartment] = { users: {} }
      } 
      
      res.render('car', { title: 'Car', roomName: req.params.compartment });
    } else {
      res.render('floo', { title: 'Video Chat' });
    } 
  } else {
    
    res.redirect(`/car/${req.params.car}/${thisCompartmentType['_id']}`)
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

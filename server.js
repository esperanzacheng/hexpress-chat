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
const Car = require('./models/carsModel.js');
const Compartment = require('./models/compartmentsModel.js');

// guest mode / public directory (see docs/specs/guest-mode-public-directory.md)
const PUBLIC_CAR_ID = '000000000000000000000001';
const ROOM_CREATION_LIMIT = 5;
const ROOM_CREATION_WINDOW_MS = 60 * 60 * 1000;
const PUBLIC_COMPARTMENT_CAP = 100;
const roomCreationLog = new Map(); // ip -> timestamps[], resets on restart

Car.findByIdAndUpdate(
  PUBLIC_CAR_ID,
  { name: 'Public', topic: 'Guest chat directory', members: [], members_count: 0, owner_id: null },
  { upsert: true, setDefaultsOnInsert: true }
).catch(err => console.error('Error seeding public car', err));

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
    if (rooms[room] == null) { // guard against a stale/unregistered room (e.g. reconnect after server restart)
      rooms[room] = { users: {} }
    }
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

// guest mode: name-entry landing page
app.get('/guest', (req, res) => {
  res.render('guest', { title: 'Guest' });
})

// guest mode: public room directory
app.get('/public', (req, res) => {
  res.render('public-directory', { title: 'Public Chat' });
})

// guest mode: join a public room
app.get('/public/:compartment', async(req, res, next) => {
  try {
    const compartment = await Compartment.findOne({ _id: req.params.compartment, car_id: PUBLIC_CAR_ID });
    if (!compartment) {
      return res.redirect('/public');
    }
    if (rooms[req.params.compartment] == null) { // insert the compartment id into socket object if there's no record
      rooms[req.params.compartment] = { users: {} }
    }
    res.render('public-room', { title: 'Guest Chat', roomName: req.params.compartment });
  } catch (err) {
    next(err);
  }
})

// guest mode: list public rooms (no auth)
app.get('/api/public/compartment', async(req, res, next) => {
  try {
    const allCompartment = await Compartment.find({ car_id: PUBLIC_CAR_ID });
    res.status(200).json({ ok: true, data: allCompartment });
  } catch (err) {
    next(err);
  }
})

// guest mode: create a public room (no auth, rate-limited)
app.post('/api/public/compartment', async(req, res, next) => {
  try {
    const ip = req.ip;
    const now = Date.now();
    const recentCreations = (roomCreationLog.get(ip) || []).filter(t => now - t < ROOM_CREATION_WINDOW_MS);
    if (recentCreations.length >= ROOM_CREATION_LIMIT) {
      return res.status(429).json({ ok: false, error: 'Too many rooms created from this address, try again later' });
    }

    const existingCount = await Compartment.countDocuments({ car_id: PUBLIC_CAR_ID });
    if (existingCount >= PUBLIC_COMPARTMENT_CAP) {
      return res.status(400).json({ ok: false, error: 'Public room limit reached, please use an existing room' });
    }

    const name = (req.body.name || '').toString().trim().slice(0, 60);
    if (!name) {
      return res.status(400).json({ ok: false, error: 'Room name is required' });
    }

    const newCompartment = new Compartment({ name, type: true, car_id: PUBLIC_CAR_ID, owner_id: null });
    const savedCompartment = await newCompartment.save();

    recentCreations.push(now);
    roomCreationLog.set(ip, recentCreations);

    io.emit('room-created', savedCompartment);
    res.status(200).json({ ok: true, data: savedCompartment });
  } catch (err) {
    next(err);
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

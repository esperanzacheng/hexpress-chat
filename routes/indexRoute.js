const express = require('express');
const multer = require('multer')
const router = express.Router();

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const carController = require('../controllers/carController.js')
const userController = require('../controllers/userController.js')
const authController = require('../controllers/authController.js')
const messageController = require('../controllers/messageController.js')
const chatController = require('../controllers/chatController.js')
const compartmentController = require('../controllers/compartmentController.js')
const friendController = require('../controllers/friendController.js')


router.get('/', function(req, res) {
  res.render('index', { title: 'The Hogwarts Express' });
});

router.get('/login', (req, res) => {
  res.render('login', { title: 'Login'});
})

// video chat page
router.get('/floo/:room', (req, res) => {
  res.render('video', { title: 'Video Chat' });
})

router.get('/api/user/:username', userController.getAllUser)
router.post('/api/user', userController.postUser)
router.put('/api/user', upload.single('profilePicture'), userController.putUser)
router.delete('/api/user', userController.deleteUser)

router.get('/api/friend', friendController.getFriend)
router.post('/api/friend', friendController.postFriendRequest)
router.put('/api/friend', friendController.putFriendRequest)
router.delete('/api/friend', friendController.deleteFriendRequest)

router.get('/api/auth/user', authController.getUser)
router.put('/api/auth/user', authController.loginUser)
router.delete('/api/auth/user', authController.logoutUser)

router.get('/api/car/member/:car_id', carController.getCarMember)
router.get('/api/cars/:car_keyword', carController.getAllCar)
router.get('/api/car', carController.getCar)
router.post('/api/car', carController.postCar)
router.put('/api/car', carController.putCar)
router.patch('/api/car/:car_id', carController.patchCar)
router.delete('/api/car', carController.deleteCar)

router.get('/api/compartment/:car_id', compartmentController.getCompartment)
router.post('/api/compartment', compartmentController.postCompartment)
router.put('/api/compartment/:compartment_id', compartmentController.putCompartment)
router.delete('/api/compartment', compartmentController.deleteCompartment)

router.get('/api/chats', chatController.getChats)
router.post('/api/chats', chatController.postChat)
// router.put('/api/chat/:chat_id', chatController.putChat)
router.delete('/api/chats', chatController.deleteChat)

router.get('/api/chats/message/:chat_id/:page', messageController.getChatMessage)
router.post('/api/chats/message', upload.single('attachments'), messageController.postChatMessage)
router.put('/api/chats/message/:message_id', messageController.putChatMessage)
router.delete('/api/chats/message', messageController.deleteChatMessage)

router.get('/api/compartment/message/:compartment_id/:page', messageController.getCompartmentMessage)
router.post('/api/compartment/message', upload.single('attachments'), messageController.postCompartmentMessage)
router.put('/api/compartment/message/:message_id', messageController.putCompartmentMessage)
router.delete('/api/compartment/message', messageController.deleteCompartmentMessage)



module.exports = router

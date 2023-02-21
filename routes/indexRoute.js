const express = require('express');
const router = express.Router();

const carController = require('../controllers/carController.js')
const userController = require('../controllers/userController.js')
const authController = require('../controllers/authController.js')
const messageController = require('../controllers/messageController.js')
const chatController = require('../controllers/chatController.js')
const compartmentController = require('../controllers/compartmentController.js')


router.get('/', function(req, res) {
  res.render('index', { title: 'The Hogwarts Express' });
});



router.get('/login', (req, res) => {
  res.render('login', { title: 'Login'});
})

// router.get('/chat', (req, res) => {
//   res.render('chat', { title: 'Chat'});
// })

router.get('/car/:car.:compartment', (req, res) => {
  // console.log(req.params)
  res.render('car', { title: 'Car'});
})
  
router.get('/api/user', userController.getAllUser) // or just remove it
router.post('/api/user', userController.postUser)
router.put('/api/user', userController.putUser)
router.delete('/api/user', userController.deleteUser)

router.get('/api/user/auth', authController.getUser)
router.put('/api/user/auth', authController.loginUser)
router.delete('/api/user/auth', authController.logoutUser)

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

router.get('/api/chat', chatController.getChat)
router.post('/api/chat', chatController.postChat)
// router.put('/api/chat/:chat_id', chatController.putChat)
router.delete('/api/chat', chatController.deleteChat)

router.get('/api/chat/message/:chat_id/:page', messageController.getChatMessage)
router.post('/api/chat/message', messageController.postChatMessage)
router.put('/api/chat/message/:message_id', messageController.putChatMessage)
router.delete('/api/chat/message', messageController.deleteChatMessage)

router.get('/api/compartment/message/:compartment_id/:page', messageController.getCompartmentMessage)
router.post('/api/compartment/message', messageController.postCompartmentMessage)
router.put('/api/compartment/message/:message_id', messageController.putCompartmentMessage)
router.delete('/api/compartment/message', messageController.deleteCompartmentMessage)



module.exports = router
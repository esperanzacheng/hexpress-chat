const express = require('express');
const router = express.Router();

const carController = require('../controllers/carController.js')
const userController = require('../controllers/userController.js')
const authController = require('../controllers/authController.js')

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
router.patch('/api/user', userController.patchUser)
router.get('/api/user/auth', authController.getUser)
router.put('/api/user/auth', authController.loginUser)
router.delete('/api/user/auth', authController.logoutUser)
router.get('/api/car', carController.getAllCar)
router.post('/api/car', carController.postCar)
router.patch('/api/car', carController.patchCar)

module.exports = router

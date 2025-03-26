const express = require('express');
const Admincontroller = require('../controllers/admincontroller');
const router = express.Router();

router.get('/checksession',Admincontroller.checksession)
router.post('/adminverify',Admincontroller.adminverify)
router.post('/deleteground',Admincontroller.admindeleteground)
router.post('/deleteuser',Admincontroller.admindeleteuser)
router.post('/fixpercentage',Admincontroller.fixpercentage)
router.get('/getpercentage',Admincontroller.getpercentage)
router.get('/checkrevenue',Admincontroller.checkRevenue)
router.get('/getallbookings',Admincontroller.getallbookings)
router.get('/getsportslist',Admincontroller.getsportslist)
router.post('/logout',Admincontroller.logout)
router.post('/addsport',Admincontroller.addsport)
router.post('/verifygroundagain',Admincontroller.verifygroundagain)
router.get('/getstateslist',Admincontroller.getstateslist)
router.get('/getcitieslist',Admincontroller.getcitieslist)
router.post('/addstate',Admincontroller.addstate)
router.post('/addcity',Admincontroller.addcity)

module.exports = router;

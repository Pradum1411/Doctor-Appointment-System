var express = require('express');
var router = express.Router();
const session = require("express-session")
const userControllers = require("../controllers/userCntrollers")
const middleware = require("../middleware/authMiddleWare")
const applydoctormodel = require("../models/applydoctor")
const appointmentsmodel = require("../models/appointmentModel")
const usermodel = require("../models/userModels")
const dayjs = require('dayjs');
require("./users")
/* GET home page. */
router.get('/', function (req, res, next) {
  res.redirect("/home")
});
router.get('/home', middleware.authmiddleware, async function (req, res, next) {
  const user = await usermodel.findOne({ _id: req.session.user.id })
  let doctor_profile = await usermodel.findOne({ isAdmin: true })
    .populate("seennotification")
    .populate("notification")
    .populate("message")
    .populate("doctorList")
   
  let doctor = user.isDoctor || user.isAdmin
  const size = user.notification.length + user.message.length
 
  res.render('home2', { username: req.session.user.username, size, doctor: doctor ,doctor_profile});
});

//login router

router.get('/login', middleware.protectrouter, function (req, res, next) {
  res.render('login', { title: 'login' });
});
//register router
router.get('/signup', middleware.protectrouter, function (req, res, next) {
  res.render('signup', { title: 'signup' });
});
//forgate password router
router.get('/forgatepassword', function (req, res, next) {
  res.render('forgate');
});
//logout router
router.get('/logout', middleware.authmiddleware, function (req, res, next) {
  req.session.destroy()
  res.redirect("/login")
});
//profile router
router.get("/profile", middleware.authmiddleware, async (req, res) => {
  const user = await usermodel.findOne({ _id: req.session.user.id })
  let doctor = user.isDoctor || user.isAdmin
  let size = user.notification.length + user.message.length
  const userdetail = await applydoctormodel.findOne({ userId: req.session.user.id })
  res.render("profile", { username: req.session.user.username, size, doctor: doctor, userdetail })
})
// appointment router
router.get("/appointments", middleware.authmiddleware, async (req, res) => {
  const user = await usermodel.findOne({ _id: req.session.user.id })
  let doctor = user.isDoctor || user.isAdmin
  let size = user.notification.length + user.message.length
  const appointment = await appointmentsmodel.find({ doctorId: req.session.user.id })
    .populate("userId")
  res.render("appointments", { username: req.session.user.username, size, doctor: doctor, appointment })
})
//apply doctor router
router.get('/applydoctor', middleware.authmiddleware, async function (req, res, next) {
  const user = await usermodel.findOne({ _id: req.session.user.id })
  const size = user.notification.length + user.message.length
  res.render('applydoctor', { username: req.session.user.username, size, doctor: false });
});
//send notification router
router.get('/notification', middleware.authmiddleware, async function (req, res, next) {
  const user = await usermodel.findOne({ _id: req.session.user.id })
    .populate("notification")
    .populate("message")
  let doctor = user.isDoctor || user.isAdmin
  let size = user.notification.length + user.message.length
  console.log("populate", user.message)
  res.render("notification", { username: req.session.user.username, user, size, doctor })
});

//read notification router
router.post('/read', async function (req, res, next) {
  const dd1 = await usermodel.findOne({ _id: req.session.user.id })
  for (let i in dd1.notification) {
    let st = dd1.notification[i].toString()
    if (st === req.body.read) {
      const newArr = dd1.notification.slice(0, i).concat(dd1.notification.slice(i + 1))
      const result = await usermodel.updateOne({ _id: req.session.user.id }, { $set: { notification: newArr } })
      dd1.seennotification.push(dd1.notification[i])
      dd1.save()
    }
  }
  for (let i in dd1.message) {
    let st = dd1.message[i].toString()
    if (st === req.body.read) {
      const newArr = dd1.message.slice(0, i).concat(dd1.message.slice(i + 1))
      const result = await usermodel.updateOne({ _id: req.session.user.id }, { $set: { message: newArr } })
      dd1.seenmessage.push(dd1.message[i])
      dd1.save()
    }
  }
  res.redirect("/home");
});
//seen notification router
router.post("/seen_notification", middleware.authmiddleware, async function (req, res, next) {
  const user = await usermodel.findOne({ _id: req.session.user.id })
    .populate("seennotification")
    .populate("seenmessage")
  let doctor = user.isDoctor || user.isAdmin
  let size = user.notification.length + user.message.length
  res.render("seennotification", { username: req.session.user.username, user, size, doctor })
});

//accept router
router.post("/accept", middleware.authmiddleware, async function (req, res, next) {

  const doctor = await applydoctormodel.findOne({ _id: req.body.read })
  const admin = await usermodel.findOne({ isAdmin:true })
   
  if (doctor) {
    await applydoctormodel.updateOne({ _id: req.body.read }, { $set: { Status: "Accept" } })
    await usermodel.updateOne({ _id: doctor.userId }, { $set: { isDoctor: true } })
    const user_data = await usermodel.findOne({ _id: doctor.userId })
    const doctor_data={
      id:doctor.userId,
      name: doctor.First_Name + " " + doctor.Last_Name,
      Expirience: doctor.Expirience,
      Specialization: doctor.Specialization,
      Fees_Per_Cunsaltation: doctor.Fees_Per_Cunsaltation,
      start_time: doctor.Timings.starting_time,
      end_time: doctor.Timings.ending_time,}
      console.log(doctor_data)
    admin.doctorList.push(doctor_data)

    await admin.save()
    user_data.notification.push(req.body.read)
    await user_data.save()
  } else {

    const appointment = await appointmentsmodel.findOne({ _id: req.body.read })
    await appointmentsmodel.updateOne({ _id: req.body.read }, { $set: { status: "Accept" } })
    const doct = await usermodel.findOne({ _id: appointment.userId })
    doct.message.push(appointment._id)
    await doct.save()
  }
  res.redirect("/home");
});
//reject router
router.post("/reject", middleware.authmiddleware, async function (req, res, next) {
  const doctor = await applydoctormodel.findOne({ _id: req.body.read })
  if (doctor) {

    await applydoctormodel.updateOne({ _id: req.body.read }, { $set: { Status: "Reject" } })

    const user_data = await usermodel.findOne({ _id: doctor.userId })
    user_data.notification.push(req.body.read)
    await user_data.save()
  } else {
    const appointment = await appointmentsmodel.findOne({ _id: req.body.read })
    await appointmentsmodel.updateOne({ _id: req.body.read }, { $set: { status: "Reject" } })
    const user_data = await usermodel.findOne({ _id: appointment.userId })
    user_data.message.push(req.body.read)
    await user_data.save()
  }

  res.redirect("/home");
});

//booking page
router.post('/booking_page', middleware.authmiddleware, async function (req, res, next) {
  const user = await usermodel.findOne({ _id: req.session.user.id })
  let doctor = user.isDoctor || user.isAdmin
  const size = user.notification.length + user.message.length
  console.log("do--",req.body)
  res.render('booking_page', { username: req.session.user.username, size, doctor: doctor, booking: req.body });
});

router.post("/checkavailability", middleware.authmiddleware, async (req, res, next) => {
  try {
    const appointment_data = await appointmentsmodel.find({ doctorId: req.body.id })
    if(appointment_data.length<1){
      req.flash("error","Slot Available")
      return res.redirect("/home")
    }
    const doctor_data = await applydoctormodel.find({ userId: req.body.id })
    function timeToMinutes(time) {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    }
    const t1 = timeToMinutes(doctor_data[0].Timings.starting_time)
    const t2 = timeToMinutes(doctor_data[0].Timings.ending_time)
    const user_time = timeToMinutes(req.body.start_time)
    if (!user_time) {
      req.flash("error", "Slot Not Available")
      return res.redirect('/home')
    }
    if (user_time <= t1 || user_time > t2) {
      req.flash("error", "Slot Not Available")
      return res.redirect('/home')
    }
    const user_date = dayjs(req.body.date)

    for (let i of appointment_data) {
      const date1 = dayjs(i.date)
      const start_time = timeToMinutes(i.timing.start_time)
      const end_time = start_time + 60
      if (date1.isSame(user_date)) {
        if (user_time >= start_time && user_time < end_time) {
          req.flash("error", "Slot Not Available")
          return res.redirect("/home")
        }
      }
    }
    req.flash("success", "Slot Available")
    return res.redirect("/home")
  } catch (error) {
    req.flash("error", "Something Wrong")
    res.redirect("/home")
  }
})

router.post("/delete_data", middleware.authmiddleware, async (req, res, next) => {
  try {
    const applyDoctorId = await applydoctormodel.deleteOne({ _id: req.body.read })
    const appointmentId = await appointmentsmodel.deleteOne({ _id: req.body.read })
    req.flash("success", "Data Delete Successfully")
  } catch (error) {
    req.flash("error", "Data Not Delete")
    // console.log("delete-error", error)
  }
  res.redirect("/home")
})

router.post("/signup", userControllers.userRegister)
router.post("/login", userControllers.userLogin)
router.post("/update_profile", userControllers.updateProfile)
router.post("/forgatepassword", userControllers.forgatepassword)
router.post("/applydoctor", userControllers.userapplydoctor)
router.post("/appointments", userControllers.user_appointments)


module.exports = router;

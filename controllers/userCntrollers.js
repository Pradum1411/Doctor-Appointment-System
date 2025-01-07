const usermodel = require("../models/userModels")
const applydoctormodel = require("../models/applydoctor")
const appointmentsmodel = require("../models/appointmentModel")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const session = require("express-session")
const { LocalStorage } = require('node-localstorage');
const localStorage = new LocalStorage('./scratch');
const dayjs = require('dayjs');

class userData {

    //user register
    static userRegister = async (req, res) => {
        try {
            const exisitingUser = await usermodel.findOne({ email: req.body.email })
            if (exisitingUser) {
                req.flash('error', 'User already Register.');
                return res.redirect('/signup');
                // return res.status(200).send({ message: "User already register", success: false })
            }
            const password = req.body.password
            const salt = await bcrypt.genSalt(10)
            const hashPassword = await bcrypt.hash(password, salt)
            req.body.password = hashPassword
            const newUser = new usermodel(req.body)
            await newUser.save()
            req.flash('success', 'Registation successful! Welcome back.');
            const token = await jwt.sign({ id: newUser._id, username: newUser.name }, process.env.SECURITY_KEY, { expiresIn: "1h" })
            req.session.user_token = token
            req.flash("user", newUser.name)
            res.redirect('/home');

        } catch (error) {
            req.flash('error', 'Invalid credentials. Please try again.');
            res.redirect('/signup');
            // res.status(500).send({ success: false, message: `registation failed--${error.message}` })
        }
    }
//user login
    static userLogin = async (req, res) => {
        try {
            const user = await usermodel.findOne({ email: req.body.username })
            if (!user) {
                req.flash('error', 'User not found');
                return res.redirect('/login');
            }
            const isMatch = await bcrypt.compare(req.body.password, user.password)
            // console.log(isMatch)
            if (!isMatch) {
                req.flash('error', 'Wrong Username or Password');
                return res.redirect('/login');
            }
            const token = await jwt.sign({ id: user._id, username: user.name }, process.env.SECURITY_KEY, { expiresIn: "1h" })
            req.session.user_token = token

            req.flash('success', 'Login successful! Welcome back.');
            res.redirect("/home")

        } catch (error) {
            // console.log(error)
            req.flash('error', 'Invalid credentials. Please try again.');
            res.redirect('/login');
        }
    }
//forgate password
    static forgatepassword = async (req, res) => {
        try {
            const user = await usermodel.findOne({ email: req.body.username })
            if (!user) {
                req.flash('error', 'User not found');
                return res.redirect('/login');
            }
            // console.log("jj-",user,req.body)
            const password = req.body.password
            if (!password) {
                req.flash('error', 'Please Enter new Password');
                return res.redirect('/login');
            }
            const salt = await bcrypt.genSalt(10)
            const hashPassword = await bcrypt.hash(password, salt)
            user.password = hashPassword
            await user.save()
            req.flash('success', 'password reset successful');
           
            res.redirect("/login")

        } catch (error) {
            // console.log(error)
            req.flash('error', 'Invalid credentials. Please try again.');
            res.redirect('/login');
        }
    }
//apply for doctor
    static userapplydoctor = async (req, res) => {
        try {
            const exitingdoctor = await applydoctormodel.findOne({ userId: req.session.user.id })
            if (exitingdoctor) {
                req.flash('error', 'Already Apply');
                return redirect("/home")
            }
            // console.log("doctor--",req.session.user.id)
            const doctor_data = await applydoctormodel({
                userId: req.session.user.id,
                First_Name: req.body.firstname,
                Last_Name: req.body.lastname,
                Phone: req.body.mobile,
                Email: req.body.email,
                Website: req.body.website,
                Address: req.body.address,
                Specialization: req.body.Specialization,
                Expirience: req.body.Experience,
                Fees_Per_Cunsaltation: req.body.fees,
                Timings: {
                    starting_time: req.body.starttime,
                    ending_time: req.body.endtime
                }
            })
            await doctor_data.save()
            //send notification admin
            const admin = await usermodel.findOne({ isAdmin: true })
            if (admin) {
               
                admin.notification.push(doctor_data._id)
                await admin.save()
            }

            req.flash('success', 'Apply Sucessfully.');
        } catch (error) {
            // console.log("err--", error)
            req.flash('error', 'Application Failed');
        }
        res.redirect('/home')
    }

//update profile
    static async updateProfile(req, res, next) {
        try {
            if (req.body.starttime.length < 1 || req.body.endtime.length < 1) {
                // console.log(req.body.time,req.body.starttime,req.body.endtime)
                req.body.starttime = req.body.time.slice(0, 5)
                req.body.endtime = req.body.time.slice(9, 14)
            }
            const update_data = await applydoctormodel.updateMany({ userId: req.session.user.id },
                {
                    $set: {
                        First_Name: req.body.firstname,
                        Last_Name: req.body.lastname,
                        Phone: req.body.mobile,
                        Email: req.body.email,
                        Website: req.body.website,
                        Address: req.body.address,
                        Specialization: req.body.Specialization,
                        Expirience: req.body.Experience,
                        Fees_Per_Cunsaltation: req.body.fees,
                        Timings: {
                            starting_time: req.body.starttime,
                            ending_time: req.body.endtime
                        }
                    }
                })
            // await update_data.save()
            req.flash("success", "Profile Updation Successfully!")
            return res.redirect("/home")
        } catch (error) {
            req.flash("error", "Profile Updation Failed!")
            // console.log("failed",error)
            return res.redirect("/home")
        }
    }

    //appintments model
    static async user_appointments(req, res, next) {
        try {
            const appointment_data = await appointmentsmodel.find({ doctorId: req.body.id })
            if(appointment_data.length<1){
                const appointment_data1 = new appointmentsmodel({
                    username:req.session.user.username,
                    userId: req.session.user.id,
                    doctorId: req.body.id,
                    date: req.body.date,
                    timing: {
                        start_time: req.body.start_time,
                        end_time: req.body.end_time
                    }
                })
                await appointment_data1.save()
                const doctor = await usermodel.findOne({ _id: req.body.id })
                doctor.message.push(appointment_data1._id)
                await doctor.save()
                req.flash("success", "Appointment Booking Successfully!")
                return res.redirect("/home")
            }
            const doctor_data = await applydoctormodel.find({ userId: req.body.id })
            function timeToMinutes(time) {
                const [hours, minutes] = time.split(":").map(Number);
                return hours * 60 + minutes;
            }
            const t1 = timeToMinutes(doctor_data[0].Timings.starting_time)
            const t2 = timeToMinutes(doctor_data[0].Timings.ending_time)
            const user_date = dayjs(req.body.date)
            const user_time = timeToMinutes(req.body.start_time)
            if (user_time <= t1 || user_time > t2) {
                req.flash("error", "Slot Not Available")
                return res.redirect('/home')
            }
            // console.log("n",!user_date,!user_time)
            
            if( !user_time){
                req.flash("error", "Slot Not Available")
                return res.redirect('/home')
            }
            
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

            const appointment_data1 = new appointmentsmodel({
                username:req.session.user.username,
                userId: req.session.user.id,
                doctorId: req.body.id,
                date: req.body.date,
                timing: {
                    start_time: req.body.start_time,
                    end_time: req.body.end_time
                }
            })
            await appointment_data1.save()
            const doctor = await usermodel.findOne({ _id: req.body.id })
            doctor.message.push(appointment_data1._id)
            await doctor.save()
            req.flash("success", "Appointment Booking Successfully!")
            return res.redirect("/home")
        } catch (error) {
            req.flash("error", "booking Failed!")
            // console.log("booking failed",error)
            return res.redirect("/home")
        }

    }
}

module.exports = userData
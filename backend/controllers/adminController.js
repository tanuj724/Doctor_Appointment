import validator from "validator"
import bcrypt from 'bcrypt'
import { v2 as cloudinary } from 'cloudinary'
import doctorModel from "../models/doctorModel.js"
import jwt from 'jsonwebtoken'
import appointmentModel from "../models/appointmentModel.js"
import userModel from "../models/userModel.js"

// API for adding doctor
const addDoctor = async (req, res) => {

  try {

    const { name, email, password, speciality, degree, experience, about, fees, address } = req.body
    const imageFile = req.file

    // checking for all data to add doctor
    if (!name || !email || !password || !speciality || !degree || !experience || !fees || !address) {
      return res.json({ success: false, message: 'Missing Details' })
    }

    // validating email format
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: 'Please enter a valid email' })
    }

    // validating strong password
    if (password.length < 8) {
      return res.json({ success: false, message: 'Please enter a strong password' })
    }

    // hashing doctor password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    let imageUrl = ''

    // upload image to cloudinary only if image is provided
    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' })
      imageUrl = imageUpload.secure_url
    }

    const doctorData = {
      name, email, image: imageUrl, password: hashedPassword, speciality,
      degree, experience, about, fees, address: JSON.parse(address), date: Date.now()
    }

    const newDoctor = new doctorModel(doctorData)
    await newDoctor.save()

    res.json({ success: true, message: 'Doctor Added' })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }

}

// API for admin Login
const loginAdmin = async (req, res) => {
  try {

    const { email, password } = req.body

    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign({ email: email + password }, process.env.JWT_SECRET, { expiresIn: '12h' })
      res.json({ success: true, token })
    } else {
      res.json({ success: false, message: 'Invalid Credentials' })
    }

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

// API to get all doctors list for admin panel
const allDoctors = async (req, res) => {

  try {

    const doctors = await doctorModel.find({}).select('-password')
    res.json({ success: true, doctors })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }

}

// API to get all appointments list
const appointmentsAdmin = async (req, res) => {

  try {

    const appointments = await appointmentModel.find({})

    // Auto-update expired appointments to completed (if not cancelled)
    const currentDate = new Date()
    const currentTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const currentDateString = `${currentDate.getDate()}_${currentDate.getMonth() + 1}_${currentDate.getFullYear()}`

    const updatePromises = appointments.map(async (appointment) => {
      if (!appointment.cancelled && !appointment.isCompleted) {
        const [day, month, year] = appointment.slotDate.split('_').map(Number)
        const appointmentDate = new Date(year, month - 1, day)
        const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())

        // Parse appointment time
        const [appointmentHour, appointmentMinute] = appointment.slotTime.split(':').map(Number)
        const appointmentDateTime = new Date(year, month - 1, day, appointmentHour, appointmentMinute)

        // If appointment date/time has passed, mark as completed
        if (appointmentDateTime < currentDate) {
          await appointmentModel.findByIdAndUpdate(appointment._id, { isCompleted: true })
          appointment.isCompleted = true // Update the local object
        }
      }
      return appointment
    })

    await Promise.all(updatePromises)

    res.json({ success: true, appointments })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }

}

// API for appointment cancellation
const appointmentCancel = async (req, res) => {

  try {

    const { appointmentId } = req.body
    const appointmentData = await appointmentModel.findById(appointmentId)

    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

    // releasing doctor slot
    const { docId, slotDate, slotTime } = appointmentData
    const doctorData = await doctorModel.findById(docId)
    let slots_booked = doctorData.slots_booked

    slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

    await doctorModel.findByIdAndUpdate(docId, { slots_booked })

    res.json({ success: true, message: 'Appointment Cancelled' })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }

}

// API for marking appointment as completed
const appointmentComplete = async (req, res) => {

  try {

    const { appointmentId } = req.body
    const appointmentData = await appointmentModel.findById(appointmentId)

    if (!appointmentData) {
      return res.json({ success: false, message: 'Appointment not found' })
    }

    if (appointmentData.cancelled) {
      return res.json({ success: false, message: 'Cannot complete a cancelled appointment' })
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true })

    res.json({ success: true, message: 'Appointment marked as completed' })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }

}

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {

  try {

    const doctors = await doctorModel.find({})
    const users = await userModel.find({})
    const appointments = await appointmentModel.find({})

    // Auto-update expired appointments to completed (if not cancelled)
    const currentDate = new Date()

    const updatePromises = appointments.map(async (appointment) => {
      if (!appointment.cancelled && !appointment.isCompleted) {
        const [day, month, year] = appointment.slotDate.split('_').map(Number)

        // Parse appointment time
        const [appointmentHour, appointmentMinute] = appointment.slotTime.split(':').map(Number)
        const appointmentDateTime = new Date(year, month - 1, day, appointmentHour, appointmentMinute)

        // If appointment date/time has passed, mark as completed
        if (appointmentDateTime < currentDate) {
          await appointmentModel.findByIdAndUpdate(appointment._id, { isCompleted: true })
          appointment.isCompleted = true // Update the local object
        }
      }
      return appointment
    })

    await Promise.all(updatePromises)

    // Filter active appointments (not cancelled)
    const activeAppointments = appointments.filter(appointment => !appointment.cancelled)

    // Get current date to filter out expired appointments
    const currentDateString = `${currentDate.getDate()}_${currentDate.getMonth() + 1}_${currentDate.getFullYear()}`

    // Filter appointments to only include future dates or today
    const upcomingAppointments = activeAppointments.filter(appointment => {
      const appointmentDate = appointment.slotDate
      const [day, month, year] = appointmentDate.split('_').map(Number)
      const appDate = new Date(year, month - 1, day)
      return appDate >= new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
    })

    const dashData = {
      doctors: doctors.length,
      appointments: upcomingAppointments.length,
      patients: users.length,
      totalAppointments: appointments.length,
      cancelledAppointments: appointments.filter(appointment => appointment.cancelled).length,
      completedAppointments: appointments.filter(appointment => appointment.isCompleted).length,
      lastestAppointments: activeAppointments.reverse().slice(0, 5)
    }

    res.json({ success: true, dashData })

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }

}

export { addDoctor, loginAdmin, allDoctors, appointmentsAdmin, appointmentCancel, appointmentComplete, adminDashboard }
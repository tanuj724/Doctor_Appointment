import express from 'express'
import {
    doctorList,
    loginDoctor,
    appointmentsDoctor,
    appointmentComplete,
    appointmentCancel,
    doctorDashboard,
    doctorProfile,
    updateDoctorProfile,
    changeAvailablity
} from '../controllers/doctorController.js'
import authDoctor from '../middlewares/authDoctor.js'

const doctorRouter = express.Router()

doctorRouter.get('/list', doctorList)
doctorRouter.post('/login', loginDoctor)
doctorRouter.post('/cancel-appointment', authDoctor, appointmentCancel)
doctorRouter.post('/complete-appointment', authDoctor, appointmentComplete)
doctorRouter.get('/appointments', authDoctor, appointmentsDoctor)
doctorRouter.get('/dashboard', authDoctor, doctorDashboard)
doctorRouter.get('/profile', authDoctor, doctorProfile)
doctorRouter.post('/update-profile', authDoctor, updateDoctorProfile)
doctorRouter.post('/change-availability', authDoctor, changeAvailablity)

export default doctorRouter
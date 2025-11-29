import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets_admin/assets'

const AllAppointments = () => {

  const { aToken, appointments, getAllAppointments, cancelAppointment, completeAppointment, isAppointmentExpired } = useContext(AdminContext)
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext)

  useEffect(() => {
    if (aToken) {
      getAllAppointments()
    }
  }, [aToken])

  useEffect(() => {
    console.log('Appointments in AllAppointments:', appointments)
  }, [appointments])

  return (
    <div className='w-full max-w-6xl m-5'>
      <p className='mb-3 text-lg font-medium'>All Appointments</p>

      <div className='bg-white border rounded text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll'>
        <div className='hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] grid-flow-col py-3 px-6 border-b'>
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor</p>
          <p>Fees</p>
          <p>Actions</p>
        </div>

        {appointments.map((item, index) => (
          <div className='flex flex-wrap justify-between max-sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] items-center text-gray-500 py-3 px-3 border-b hover:bg-gray-50' key={index}>
            <p className='max-sm:hidden'>{index + 1}</p>

            <div className='flex items-center gap-2'>
              <img className='w-8 rounded-full' src={item.userData.image || '/placeholder-user.png'} alt="" /> <p>{item.userData.name}</p>
            </div>

            <p className='max-sm:hidden'>{item.userData.dob ? calculateAge(item.userData.dob) : 'N/A'}</p>
            <p>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>

            <div className='flex items-center gap-2'>
              <img className='w-8 rounded-full bg-gray-200' src={item.docData.image || '/placeholder-doctor.png'} alt="" /> <p>{item.docData.name}</p>
            </div>

            <p>{currency}{item.amount}</p>

            <div className='flex items-center gap-2'>
              {
                item.cancelled
                  ? <p className='text-red-400 text-xs font-medium bg-red-50 px-2 py-1 rounded'>Cancelled</p>
                  : item.isCompleted
                    ? <p className='text-green-500 text-xs font-medium bg-green-50 px-2 py-1 rounded'>Completed</p>
                    : isAppointmentExpired(item.slotDate, item.slotTime)
                      ? <p className='text-orange-500 text-xs font-medium bg-orange-50 px-2 py-1 rounded'>Auto-Completed</p>
                      : (
                        <div className='flex gap-2'>
                          <img
                            onClick={() => completeAppointment(item._id)}
                            className='w-10 cursor-pointer hover:scale-110 transition-transform'
                            src={assets.tick_icon}
                            alt="Complete"
                            title="Mark as completed"
                          />
                          <img
                            onClick={() => cancelAppointment(item._id)}
                            className='w-10 cursor-pointer hover:scale-110 transition-transform'
                            src={assets.cancel_icon}
                            alt="Cancel"
                            title="Cancel appointment"
                          />
                        </div>
                      )
              }
            </div>          </div>
        ))}

      </div>
    </div>
  )
}

export default AllAppointments
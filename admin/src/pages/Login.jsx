import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets_admin/assets'
import { AdminContext } from '../context/AdminContext'
import { DoctorContext } from '../context/DoctorContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const Login = () => {

  const [state, setState] = useState('Admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { setAToken, backendUrl } = useContext(AdminContext)
  const { setDToken } = useContext(DoctorContext)

  const onSubmitHandler = async (event) => {
    event.preventDefault()

    try {

      if (state === 'Admin') {
        const { data } = await axios.post(backendUrl + '/api/admin/login', { email, password })
        if (data.success) {
          localStorage.setItem('aToken', data.token)
          setAToken(data.token)
          toast.success('Login successful!')
        } else {
          toast.error(data.message || 'Invalid credentials')
        }
      } else {
        // Doctor login
        const { data } = await axios.post(backendUrl + '/api/doctor/login', { email, password })
        if (data.success) {
          localStorage.setItem('dToken', data.token)
          setDToken(data.token)
          toast.success('Doctor login successful!')
        } else {
          toast.error(data.message || 'Invalid doctor credentials')
        }
      }

    } catch (error) {
      console.error('Login error:', error)
      if (error.response) {
        // Server responded with error status
        toast.error(error.response.data.message || 'Login failed')
      } else if (error.request) {
        // Network error
        toast.error('Network error. Please check your connection.')
      } else {
        // Other error
        toast.error('Something went wrong. Please try again.')
      }
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5e5e5e] text-sm shadow-lg'>
        <p className='text-2xl font-semibold m-auto'><span className='text-primary'> {state}</span> Login</p>

        <div className='w-full'>
          <p>Email</p>
          <input onChange={(e) => setEmail(e.target.value)} value={email} className='border border-[#dadada] rounded w-full p-2 mt-1' type="email" required />
        </div>

        <div className='w-full'>
          <p>Password</p>
          <input onChange={(e) => setPassword(e.target.value)} value={password} className='border border-[#dadada] rounded w-full p-2 mt-1' type="password" required />
        </div>

        <button className='bg-primary text-white w-full py-2 rounded-md text-base'>Login</button>

        {
          state === 'Admin'
            ? <p>Doctor Login? <span className='text-primary underline cursor-pointer text-xs' onClick={() => setState('Doctor')}>Click Here</span></p>
            : <p>Admin Login? <span className='text-primary underline cursor-pointer text-xs' onClick={() => setState('Admin')}>Click Here</span></p>
        }

      </div>
    </form>
  )
}

export default Login
import React, { useContext } from 'react'
import Login from './pages/Login'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AdminContext } from './context/AdminContext';
import { DoctorContext } from './context/DoctorContext';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DoctorNavbar from './components/DoctorNavbar';
import DoctorSidebar from './components/DoctorSidebar';
import Dashboard from './pages/Admin/Dashboard';
import AllAppointments from './pages/Admin/AllAppointments';
import AddDoctor from './pages/Admin/AddDoctor';
import DoctorsList from './pages/Admin/DoctorsList';
import DoctorDashboard from './pages/Doctor/DoctorDashboard';
import DoctorAppointments from './pages/Doctor/DoctorAppointments';
import DoctorProfile from './pages/Doctor/DoctorProfile';


const App = () => {

  const { aToken } = useContext(AdminContext)
  const { dToken } = useContext(DoctorContext)

  return aToken || dToken ? (
    <div className='bg-[#f8f9fd]'>
      <ToastContainer />
      {/* Conditionally render navbar based on token type */}
      {aToken ? <Navbar /> : <DoctorNavbar />}
      <div className='flex items-start'>
        {/* Conditionally render sidebar based on token type */}
        {aToken ? <Sidebar /> : <DoctorSidebar />}
        <Routes>
          {/* Admin Routes */}
          {aToken && (
            <>
              <Route path='/' element={<Dashboard />} />
              <Route path='admin-dashboard' element={<Dashboard />} />
              <Route path='/all-appointments' element={<AllAppointments />} />
              <Route path='/add-doctor' element={<AddDoctor />} />
              <Route path='/doctor-list' element={<DoctorsList />} />
            </>
          )}

          {/* Doctor Routes */}
          {dToken && (
            <>
              <Route path='/' element={<DoctorDashboard />} />
              <Route path='doctor-dashboard' element={<DoctorDashboard />} />
              <Route path='/doctor-appointments' element={<DoctorAppointments />} />
              <Route path='/doctor-profile' element={<DoctorProfile />} />
            </>
          )}
        </Routes>
      </div>
    </div>
  ) : (
    <>
      <Login />
      <ToastContainer />
    </>
  )
}

export default App
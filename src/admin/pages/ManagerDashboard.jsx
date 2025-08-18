import React, { useState } from 'react';
import AdminSideBar from '../components/AdminSidebar';
import AdminNavBar from '../components/AdminNavbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faPoundSign } from '@fortawesome/free-solid-svg-icons';
import LineChartCard from '../../components/LineChartCard';

export default function ManagerDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebars = () => {
  setIsSidebarOpen(prev => {
    const newState = !prev;    return newState;
  });
};


  return (
    <>
      <AdminNavBar toggleSidebar={toggleSidebars} isSideBarOpen={isSidebarOpen}/>
      <AdminSideBar isOpen={isSidebarOpen} closeSidebar={closeSidebar} activeLink="/admin/Dashboard"/>
      <div className='md:flex md:justify-end'>
        <div className={`pt-32 px-5 ${isSidebarOpen ? "md:w-[75%] lg:w-[80%]" : "md:w-full"} transition-all duration-500`}>
          <div>
            <h2 className='text-3xl font-display2 font-bold'>Welcome, Franklyn</h2>
          </div>
          <div className='text-black mt-7 w-full flex flex-wrap'>
            <div className='bg-gray-50 pt-4 mb-7 border-2 border-own-2 w-full'>
              <div className='px-5 flex justify-between items-center'>
                <p className='font-semibold tracking-wide'>Sales graph</p>
                <p className='rounded-full bg-black text-white px-3 py-1 text-sm'> <FontAwesomeIcon icon={faArrowUp} className='pr-2'/>3.2%</p>
              </div>
              <p className='px-5 font-bold flex items-center text-3xl tracking-wider pt-3'><FontAwesomeIcon icon={faPoundSign} className='pr-1 font-black'/> 8,251 </p>
              <div>
                <LineChartCard/>
              </div>
            </div>
            <div className='bg-own-2 pt-4 mb-7 border-2 border-gray-50 w-full'>
              <div className='px-5 flex justify-between items-center'>
                <p className='font-semibold tracking-wide'>Total Orders</p>
                <p className='rounded-full bg-black text-white px-3 py-1 text-sm'> <FontAwesomeIcon icon={faArrowUp} className='pr-2'/>3.2%</p>
              </div>
              <p className='px-5 font-bold flex items-center text-3xl tracking-wider pt-3'><FontAwesomeIcon icon={faPoundSign} className='pr-1 font-black'/> 8,251 </p>
              <div>
                <LineChartCard/>
              </div>
            </div>
            <div className='bg-gray-50 pt-4 mb-7 border-2 border-own-2 w-full'>
              <div className='px-5 flex justify-between items-center'>
                <p className='font-semibold tracking-wide'>Cancelled Orders</p>
                <p className='rounded-full bg-black text-white px-3 py-1 text-sm'> <FontAwesomeIcon icon={faArrowUp} className='pr-2'/>3.2%</p>
              </div>
              <p className='px-5 font-bold flex items-center text-3xl tracking-wider pt-3'><FontAwesomeIcon icon={faPoundSign} className='pr-1 font-black'/> 8,251 </p>
              <div>
                <LineChartCard/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

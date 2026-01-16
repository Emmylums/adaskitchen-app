import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import bg from "../assets/background.jpeg";
import NavBar from '../components/NavBar';
import MobileNavBar from '../components/MobileNavBar';
import Footer from '../components/Footer';

const Error = ({ statusCode = 500, message = "Something went wrong" }) => {
    const [mobileNavBarVisible, setMobileNavBarVisible] = useState(false);
    
    return (
        <>
            <NavBar activeLink="" onToggleMobileNavBar={() => setMobileNavBarVisible(!mobileNavBarVisible)}/>

            <MobileNavBar isVisible={mobileNavBarVisible} activeLink="" onClose={() => setMobileNavBarVisible(false)} className="md:col-span-1 pt-7"/>

            <div style={{ backgroundImage: `url(${bg})` }} className="flex flex-col items-center justify-center min-h-screen bg-center bg-cover px-4">
                <div className="absolute inset-0 h-screen opacity-70 bg-black" />
                <div className="relative flex flex-col items-center ">

                    <div className="animate-bounce mb-6">
                        <svg className="w-24 h-24 text-own-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M4.293 6.707a1 1 0 011.414 0L12 13.586l6.293-6.879a1 1 0 111.414 1.414l-7 7.687a1 1 0 01-1.414 0l-7-7.687a1 1 0 010-1.414z" />
                        </svg>
                    </div>

                    {/* Framer Motion animation for content */}
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
                        <h1 className="text-7xl font-bold text-red-500 mb-4">Error {statusCode}</h1>
                        <p className="text-2xl mb-8">{message}</p>
                        <Link to="/" className="px-6 py-3 bg-own-2 text-white rounded-lg text-lg hover:bg-blue-600 transition">
                            Go Back to Home
                        </Link>
                    </motion.div>
                </div>
            </div>
            <Footer/>
        </>
    );
};

export default Error;

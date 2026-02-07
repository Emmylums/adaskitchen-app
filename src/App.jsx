import {useEffect} from "react";
import './App.css';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import ScrollToTopButton from './components/ScrollToTopButton';
import Home from "./pages/Home";
import Login from "./pages/Login";
import Error from "./pages/Error";
import Dashboard from "./users/pages/Dashboard";
import Signup from "./pages/Signup";
import OurStory from "./pages/OurStory";
import Catering from "./pages/Catering";
import ContactUs from "./pages/ContactUs";
import Cart from "./pages/Cart";
import Menu from "./pages/Menu";
import Settings from "./admin/pages/Settings";
import OrderHistory from "./users/pages/OrderHistory";
import Payments from "./users/pages/Payments";
import UMenu from "./users/pages/Menu";
import UCart from "./users/pages/Cart";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Notifications from "./users/pages/Notifications";
import Favorites from "./users/pages/Favorites";
import Addresses from "./users/pages/Addresses";
import USettings from "./users/pages/Settings";
import Support from "./users/pages/Help&Support";


import MenuManagement from "./admin/pages/MenuManagement";
import Categories from "./admin/pages/Categories";
import Gallery from "./admin/pages/Gallery";
import ACatering from "./admin/pages/Catering";
import Orders from "./admin/pages/Orders";
import Invoices from "./admin/pages/Invoices";
import ManagerDashboard from "./admin/pages/ManagerDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CompleteProfile from "./pages/CompleteProfile";
import Checkout from "./users/pages/Checkout";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "./stripe";
import EmailVerification from "./pages/EmailVerification";
import Maintenance from "./pages/Maintenance";



function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}


function App() {

  return (
    <BrowserRouter>
      <ScrollToTop/>
      <ScrollToTopButton/>
      <Routes>
        {/* <Route exact path="/" element={<Home/>}/>
        <Route exact path="/our-story" element={<OurStory/>}/>
        <Route exact path="/menu" element={<Menu/>}/> */}


        {/* <Route exact path="/catering" element={<Catering/>}/> */}
        {/* <Route exact path="/gallery" element={<Gallery/>}/> */}
        
        
        {/* <Route exact path="/terms-and-conditions" element={<TermsAndConditions/>}/>
        <Route exact path="/privacy-policy" element={<PrivacyPolicy/>}/>
        <Route exact path="/cart" element={<Cart/>}/>
        <Route exact path="/contact-us" element={<ContactUs/>}/>
        <Route exact path="/login" element={<Login/>}/>
        <Route exact path="/signup" element={<Signup/>}/>
        <Route exact path="/complete-profile" element={<CompleteProfile/>}/>
        <Route exact path="/forgot-password" element={<ForgotPassword/>}/>
        <Route exact path="/reset-password" element={<ResetPassword/>}/>
        <Route exact path="/reset-password" element={<ResetPassword/>}/> */}
        <Route exact path="/" element={<Maintenance/>}/>
        




        {/* Users Pages */}
        {/* <Route path="/user/Dashboard" element={<Dashboard />} />
        <Route path="/user/Orders" element={<OrderHistory />} />
        <Route
          path="/user/Payments"
          element={
            <Elements stripe={stripePromise}>
              <Payments />
            </Elements>
          }
        />
        <Route path="/user/Menu" element={<UMenu />} />
        <Route path="/user/Cart" element={<UCart />} />
        <Route
          path="/user/Checkout"
          element={
            <Elements stripe={stripePromise}>
              <Checkout />
            </Elements>
          }
        />

        <Route path="/user/Notifications" element={<Notifications />} />
        <Route path="/user/Favorites" element={<Favorites />} />
        <Route path="/user/Addresses" element={<Addresses />} /> */}
        
        
        {/* <Route path="/user/Support" element={<Support />} /> */}
        
        
        {/* <Route path="/user/Settings" element={<USettings />} /> */}
 


      {/* Admin Pages */}
        {/* <Route path="/admin/Dashboard" element={<ManagerDashboard />} />
        <Route path="/admin/Menu" element={<MenuManagement />} />
        <Route path="/admin/Categories" element={<Categories />} />
        <Route path="/admin/Gallery" element={<Gallery />} /> */}
        
        
        
        {/* <Route path="/admin/Catering" element={<ACatering />} /> */}
        
        
        
        {/* Unclose too */}
        {/* <Route path="/admin/Orders" element={<Orders />} /> */}
        
        
        
        {/* <Route path="/admin/Invoices" element={<Invoices />} /> */}
        
        
        
        {/* <Route path="/admin/settings" element={<Settings />} /> */}


        <Route path="*" element={<Error statusCode={404} message="Page Not Found" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

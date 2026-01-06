import {useEffect} from "react";
import './App.css';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import ScrollToTopButton from './components/ScrollToTopButton';
import Home from "./pages/Home";
import Login from "./pages/Login";
import Error from "./pages/Error";
import Dashboard from "./users/pages/Dashboard";
import Signup from "./pages/Signup.Jsx";
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
import Security from "./users/pages/Security";
import AdminDashboard from "./admin/pages/AdminDashboard";
import Testing from "./admin/pages/Testing";
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
        <Route exact path="/" element={<Home/>}/>
        <Route exact path="/Home" element={<Home/>}/>
        <Route exact path="/Our Story" element={<OurStory/>}/>
        <Route exact path="/Menu" element={<Menu/>}/>
        <Route exact path="/Catering" element={<Catering/>}/>
        {/* <Route exact path="/Gallery" element={<Gallery/>}/> */}
        <Route exact path="/Terms&Conditions" element={<TermsAndConditions/>}/>
        <Route exact path="/Privacy Policy" element={<PrivacyPolicy/>}/>
        <Route exact path="/Cart" element={<Cart/>}/>
        <Route exact path="/Contact Us" element={<ContactUs/>}/>
        <Route exact path="/Login" element={<Login/>}/>
        <Route exact path="/Signup" element={<Signup/>}/>
        <Route exact path="/complete-profile" element={<CompleteProfile/>}/>
        <Route exact path="/Forgot-password" element={<ForgotPassword/>}/>
        <Route exact path="/Reset-password" element={<ResetPassword/>}/>
        




        {/* Users Pages */}
        <Route path="/user/Dashboard" element={<Dashboard />} />
        <Route path="/user/Orders" element={<OrderHistory />} />
        <Route path="/user/Payments" element={<Payments />} />
        <Route path="/user/Menu" element={<UMenu />} />
        <Route path="/user/Cart" element={<UCart />} />
        <Route path="/user/Checkout" element={<Checkout />} />
        <Route path="/user/Notifications" element={<Notifications />} />
        <Route path="/user/Favorites" element={<Favorites />} />
        <Route path="/user/Addresses" element={<Addresses />} />
        {/* <Route path="/user/Security" element={<Security />} /> */}
        <Route path="/user/Support" element={<Support />} />
        <Route path="/user/Settings" element={<USettings />} />
 


      {/* Admin Pages */}
        <Route path="/admin/Dashboard" element={<ManagerDashboard />} />
        <Route path="/admin/Menu" element={<MenuManagement />} />
        <Route path="/admin/Categories" element={<Categories />} />
        <Route path="/admin/Gallery" element={<Gallery />} />
        <Route path="/admin/Catering" element={<ACatering />} />
        <Route path="/admin/Orders" element={<Orders />} />
        <Route path="/admin/Invoices" element={<Invoices />} />
        <Route path="/admin/settings" element={<Settings />} />
        
        <Route path="/admin/test" element={<AdminDashboard />} />
        <Route path="/admin/testing" element={<Testing />} />


        <Route path="*" element={<Error statusCode={404} message="Page Not Found" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

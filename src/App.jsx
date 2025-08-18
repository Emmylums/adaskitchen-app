import {useEffect} from "react";
import './App.css';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import ScrollToTopButton from './components/ScrollToTopButton';
import Home from "./pages/Home";
import Login from "./pages/Login";
import Footer from "./components/Footer";
import Error from "./pages/Error";
import Signup from "./pages/Signup.Jsx";
import OurStory from "./pages/OurStory";
import Gallery from "./pages/Gallery";
import ContactUs from "./pages/ContactUs";
import Cart from "./pages/Cart";
import Menu from "./pages/Menu";
import Checkout from "./pages/Checkout";
import AdminHome from "./admin/pages/AdminHome";
import EditMenu from "./admin/pages/EditMenu";
import AllMenu from "./admin/pages/AllMenu";


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
        <Route exact path="/Gallery" element={<Gallery/>}/>
        <Route exact path="/Cart" element={<Cart/>}/>
        <Route exact path="/checkout" element={<Checkout/>}/>
        <Route exact path="/Contact Us" element={<ContactUs/>}/>
        <Route exact path="/Login" element={<Login/>}/>
        <Route exact path="/Signup" element={<Signup/>}/>
        <Route path="/admin/Dashboard" element={<AdminHome />} />
        <Route path="/admin/menu/add" element={<EditMenu />} />
        <Route path="/admin/menu/edit/:id" element={<EditMenu />} />
        <Route path="/admin/menu/all" element={<AllMenu />} />
        <Route path="*" element={<Error statusCode={404} message="Page Not Found" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

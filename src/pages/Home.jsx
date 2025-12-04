import { useEffect, useState} from "react";
import NavBar from "../components/NavBar";
import MobileNavBar from "../components/MobileNavBar";
import jollof from "../assets/jollof.jpeg";
import boy from "../assets/boy.png";
import girl from "../assets/girl.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faUtensils, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { motion } from 'framer-motion';
import TestimonialSlider from "../components/TestimonialSlider";
import MotionWrapper from "../components/MotionWrapper";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import AlertBanner from "../components/AlertBanner";
import allDishes from "../data/alldishes";


export default function Home() {
    const [mobileNavBarVisible, setMobileNavBarVisible] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [searchTerm, setSearchTerm] = useState("");
    const [alert, setAlert] = useState({ message: "", type: "", visible: false });

    const { addToCart } = useCart();

    const showAlert = (message, type) => {
        setAlert({ message, type, visible: true });
        setTimeout(() => setAlert({ message: "", type: "", visible: false }), 3000);
    };

    const handleAddToCart = (dish) => {
        addToCart(dish, 1);
        showAlert(`1 ${dish.name} added to cart!`, "success");

        // setQuantities(prev => ({ ...prev, [item.id]: 1 }));
    };

    const slides = [
        {
            url: "bg-[url(./assets/jollof2.jpg)]",
            title: "Jollof Rice",
            description: "Original recipe simmered in a rich tomato and pepper sauce, served with tender Grilled Chicken, Sweet Fried Plantains, and a side of Spicy Slaw for that perfect crunch.",
        },
        {
            url: "bg-[url(./assets/egusi.jpg)]",
            title: "Egusi Soup",
            description: "Original recipe made with ground melon seeds, slow-cooked in a savory blend of spices, peppers, and palm oil. Served with tender pieces of meat and fish, and paired perfectly with pounded yam or fufu for a hearty, traditional meal.",
        },
        {
            url: "bg-[url(./assets/fried.jpg)]",
            title: "Fried Rice",
            description: "Fried Rice stir-fried with mixed vegetables, seasoned to perfection with curry and thyme for a vibrant, savory flavor. Served with succulent grilled chicken and a fresh side of salad for a balanced, delicious West African classic.",
        },
    ]

    const testimonials = [
        {
            name: "John Doe",
            description: "Original recipe simmered in a rich tomato and pepper sauce, served with tender Grilled Chicken, Sweet Fried Plantains, and a side of Spicy Slaw for that perfect crunch.",
            image: girl,
        },
        {
            name: "Janet Abowale",
            description: "Original recipe simmered in a rich tomato and pepper sauce, served with tender Grilled Chicken, Sweet Fried Plantains, and a side of Spicy Slaw for that perfect crunch.",
            image: boy,
        },
        {
            name: "James Carioke",
            description: "Original recipe simmered in a rich tomato and pepper sauce, served with tender Grilled Chicken, Sweet Fried Plantains, and a side of Spicy Slaw for that perfect crunch.",
            image: girl,
        },
        {
            name: "Blah blah",
            description: "Original recipe simmered in a rich tomato and pepper sauce, served with tender Grilled Chicken, Sweet Fried Plantains, and a side of Spicy Slaw for that perfect crunch.",
            image: boy,
        },
    ]

    // Get first 4 dishes from allDishes for the popular section
    const popularDishes = allDishes.slice(0, 4);
    // £
    useEffect(() => {
        const timer = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % 3);
        }, 7000);

        return () => clearInterval(timer);
    }, []);

  return (
    <>
        <NavBar activeLink="Home" onToggleMobileNavBar={() => setMobileNavBarVisible(!mobileNavBarVisible)}/>
        
        <MobileNavBar isVisible={mobileNavBarVisible} activeLink="Home" onClose={() => setMobileNavBarVisible(false)} className="sm:col-span-1 pt-7"/>

        {alert.visible && (
            <AlertBanner message={alert.message} type={alert.type} onClose={() => setAlert({ ...alert, visible: false })} />
        )}
        <div>
            <main>
                <section className="relative bg-[url(./assets/background.jpeg)] h-screen bg-center bg-cover">
                    <div className="absolute inset-0 h-screen opacity-60 bg-black" />
                    <div className="relative flex items-center justify-center h-full">
                        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.0 }}>
                            <div className="p-10 text-center text-white mt-10">
                                <div>
                                    <h2 className="font-display font-bold text-3xl sm:text-5xl landscape:text-3xl md:font-black md:text-6xl landscape:lg:text-5xl">Welcome to <br /> Ada’s Kitchen </h2>
                                    <h3 className="font-semibold text-2xl pt-5 landscape:text-xl px-7 sm:text-3xl sm:pt-14 landscape:pt-5 sm:px-[20%] landscape:px-0 md:text-4xl md:font-semibold md:px-[15%] landscape:lg:text-3xl landscape:lg:pt-14"> A Taste of Nigeria’s Finest Flavors</h3>
                                    <h4 className="pt-2 landscape:text-sm sm:text-xl sm:px-[15%] sm:pt-5 md:text-2xl landscape:lg:pt-7 landscape:lg:text-lg">Savor Authentic Nigerian Cuisine, Crafted with Love & Tradition</h4>
                                </div>

                                <Link to="/Menu">
                                    <button className="bg-own-2 mt-14 text-black text-lg font-semibold p-4 tracking-wider landscape:tracking-normal rounded-md landscape:lg:mt-8 landscape:mt-4 landscape:px-3 landscape:py-3 sm:text-2xl  sm:p-6 landscape:text-lg landscape:p-3 sm:rounded-md md:text-3xl md:p-9 md:rounded-xl landscape:rounded-md landscape:lg:rounded-xl landscape:lg:text-2xl landscape:lg:p-5 landscape:lg:tracking-wider hover:cursor-pointer">Order Now</button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>
                <section className="w-full mx-auto overflow-hidden pt-16 pb-10 px-6 flex flex-col items-center justify-center relative">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-center text-[oklch(29.23%_0_0)] font-display relative inline-block">
                            Featured Dishes
                            <span className="absolute -bottom-2 left-0 w-full h-1 bg-own-2 rounded-full"></span>
                        </h2>
                    </div>
                    <motion.div className="relative w-full h-[60vh] rounded-2xl overflow-hidden shadow-xl" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} viewport={{ once: true, amount: 0.15 }} >
                        {slides.map((slide, index) => (
                            <div key={index} className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === currentIndex ? "opacity-100 z-20" : "opacity-0 z-10"}`} >
                                <div className={`relative h-[60vh] min-w-full bg-center bg-cover ${slide.url}`}>
                                    <div className="absolute inset-0 bg-black opacity-70" />
                                    <div className="relative flex items-center justify-center h-full">
                                        <div className="p-5 text-center text-white flex flex-col items-center ">
                                            <h2 className="font-display font-bold text-4xl mb-2">{slide.title}</h2>
                                            <div className="w-16 h-1 bg-own-2 mb-6 rounded-full"></div>
                                            <h3 className="font-medium pt-2 text-lg md:w-[70%] lg:w-[60%] text-center leading-relaxed">{slide.description}</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                    <Link to="/Menu">
                        <div className="py-8">
                            <button className="bg-own-2 hover:bg-[oklch(85%_0.171_83.42)] text-[oklch(29.23%_0_0)] text-lg px-8 py-4 rounded-full flex items-center justify-center gap-3 tracking-wid shadow-lg hover:shadow-[oklch(79.58%_0.171_83.42)/40] transition-all duration-300 text-nowrap hover:cursor-pointer">
                                Order Now <FontAwesomeIcon className="text-xs" icon={faArrowRight}/>
                            </button>
                        </div>
                    </Link>
                </section>

                {/* Popular Dishes Gallery */}
                <section className="pb-10 px-6">
                    <MotionWrapper direction="up">
                        <h2 className="text-4xl font-bold text-center text-[oklch(29.23%_0_0)] font-display mb-3">Customer Favorites</h2>
                        <p className="text-center text-[oklch(40%_0.05_100)] mb-12 max-w-2xl mx-auto text-lg">Discover our most loved dishes that keep customers coming back for more</p>
                    </MotionWrapper>

                    <div className="grid grid-cols-1 landscape:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 landscape:lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                        {popularDishes.map((dish, index) => (
                            <MotionWrapper 
                                key={dish.id}
                                direction="up" 
                                delay={index * 0.1}
                            >
                                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col h-full">
                                    <div className="h-48 flex items-center justify-center relative">
                                        {/* Dish image */}
                                        {dish.image && (
                                            <img 
                                                src={dish.image} 
                                                alt={dish.name}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                        {/* Icon overlay */}
                                        <div className="absolute inset-0 bg-own-1 opacity-30 flex items-center justify-center">
                                        </div>
                                        <div className="absolute inset-0  flex items-center justify-center">
                                            <FontAwesomeIcon icon={faUtensils} className="text-5xl text-white opacity-90" />                                        </div>

                                    </div>
                                    <div className="p-6 flex flex-col flex-grow">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="font-semibold text-xl text-[oklch(29.23%_0_0)]">{dish.name}</h3>
                                            <span className="font-bold text-[oklch(79.58%_0.171_83.42)] text-lg">£{dish.price.toFixed(2)}</span>
                                        </div>
                                        <p className="text-[oklch(40%_0.05_100)] text-sm mb-4 flex-grow">{dish.description}</p>
                                        <button 
                                            className="bg-[oklch(79.58%_0.171_83.42)] hover:bg-[oklch(85%_0.171_83.42)] text-[oklch(29.23%_0_0)] font-medium px-4 py-2.5 rounded-lg w-full transition-colors shadow-md hover:shadow-[oklch(79.58%_0.171_83.42)/30]"
                                            onClick={() => handleAddToCart(dish)}
                                        >
                                            Add to Order
                                        </button>
                                    </div>
                                </div>
                            </MotionWrapper>
                        ))}
                    </div>
                </section>

                <section className="flex flex-col-reverse md:flex-row md:justify-between md:items-center md:gap-6 landscape:flex-row landscape:justify-between landscape:items-center landscape:gap-6 px-6 py-10 bg-own-1 text-white">
                    <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} viewport={{ once: true, amount: 0.15 }} className="md:w-[50%] lg:w-[60%] landscape:w-[50%] landscape:lg:w-[60%]">
                        <h2 className="text-2xl font-semibold pt-10 md:pt-0 landscape:pt-0 font-display2">Our Story</h2>
                        <p className="text-sm py-4 tracking-wide text-justify md:text-base">
                            At Ada’s Kitchen, our journey began with a simple yet powerful idea: to create delicious, wholesome meals that honor tradition while embracing modern tastes. Named after the matriarch of our family, Ada, whose love for cooking brought people together, we strive to keep her spirit alive in every dish we serve. <br /> <br />

                            Ada’s recipes were more than just food. They were a celebration of culture, warmth, and connection. From her cozy home kitchen to yours, we’ve preserved her timeless flavors while adding our own creative twist. Every bite tells a story of heritage, passion, and the joy of sharing good food with good company. <br /> <br />

                            Whether you’re joining us for a comforting classic or an exciting new creation, we invite you to be part of Ada’s Kitchen; where every meal is made with love.
                        </p>
                        <Link to="/Our Story">
                            <button className="bg-own-2 text-own-1 text-md md:text-xl px-6 py-4 rounded-md tracking-wide font-semibold">Learn More</button>
                        </Link>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: 100 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 1 }} viewport={{ once: true, amount: 0.3 }}className="sm:w-1/2 md:w-[50%] lg:w-[40%] landscape:w-[50%] landscape:lg:w-[40%] border border-2 border-own-2 rounded-2xl">
                        <img src={jollof} alt="Jollof Rice" className="rounded-2xl" />
                    </motion.div>
                </section>

                {/* Catering Services Section */}
                <section className="py-16 px-6 bg-gray-50">
                    <div className="max-w-6xl mx-auto flex flex-col md:flex-row landscape:flex-row items-center gap-10">
                        <motion.div 
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7 }}
                            viewport={{ once: true }}
                            className="md:w-1/2 landscape:w-1/2"
                        >
                            <div className="h-96 rounded-2xl flex items-center justify-center shadow-xl" style={{background: 'linear-gradient(135deg, oklch(79.58% 0.171 83.42), oklch(69.58% 0.171 83.42))'}}>
                                <div className="text-center p-6 text-white">
                                    <FontAwesomeIcon icon={faCalendarAlt} className="text-6xl mb-6 opacity-90" />
                                    <h3 className="text-2xl font-bold mb-4">Catering Services</h3>
                                    <p className="text-[oklch(95%_0.01_100)]">Bring the taste of Nigeria to your special events</p>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div 
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7 }}
                            viewport={{ once: true }}
                            className="md:w-1/2 landscape:w-1/2"
                        >
                            <h2 className="text-2xl md:text-3xl font-bold font-display mb-4 text-[oklch(29.23%_0_0)]">Catering Services</h2>
                            <p className="text-[oklch(40%_0.05_100)] mb-6 text-base md:text-lg">
                                Bring the authentic taste of Nigeria to your next event! Whether it's a wedding, corporate function, or family gathering, our catering services will impress your guests with flavorful dishes made with the same care and attention as in our kitchen.
                            </p>
                            <ul className="mb-8">
                                <li className="flex items-center mb-3">
                                    <div className="w-8 h-8 rounded-full bg-[oklch(79.58%_0.171_83.42)] flex items-center justify-center mr-3">
                                        <FontAwesomeIcon icon={faArrowRight} className="text-[oklch(29.23%_0_0)] text-sm" />
                                    </div>
                                    <span className="text-[oklch(29.23%_0_0)] text-sm font-semibold md:text-base">Customized menus for any event size</span>
                                </li>
                                <li className="flex items-center mb-3">
                                    <div className="w-8 h-8 rounded-full bg-[oklch(79.58%_0.171_83.42)] flex items-center justify-center mr-3">
                                        <FontAwesomeIcon icon={faArrowRight} className="text-[oklch(29.23%_0_0)] text-sm" />
                                    </div>
                                    <span className="text-[oklch(29.23%_0_0)] text-sm font-semibold md:text-base">Professional setup and service</span>
                                </li>
                                <li className="flex items-center mb-3">
                                    <div className="w-8 h-8 rounded-full bg-[oklch(79.58%_0.171_83.42)] flex items-center justify-center mr-3">
                                        <FontAwesomeIcon icon={faArrowRight} className="text-[oklch(29.23%_0_0)] text-sm" />
                                    </div>
                                    <span className="text-[oklch(29.23%_0_0)] text-sm font-semibold md:text-base">Available 24/7</span>
                                </li>
                            </ul>
                            <Link to="/Catering">
                                <button className="bg-[oklch(29.23%_0_0)] hover:bg-[oklch(40%_0.02_100)] text-[oklch(79.58%_0.171_83.42)] font-semibold px-8 py-3.5 rounded-lg transition-colors shadow-lg hover:shadow-[oklch(29.23%_0_0)/30] text-sm md:text-base">
                                    Contact us for Catering Options
                                </button>
                            </Link>
                        </motion.div>
                    </div>
                </section>
                <section className="py-10 px-4 sm:px-6">
                    <MotionWrapper direction="up">
                        <h2 className="text-4xl font-bold text-center text-[oklch(29.23%_0_0)] font-display mt-5 mb-3">What Our Customers Say</h2>
                        <p className="text-center text-[oklch(40%_0.05_100)] mb-12 max-w-2xl mx-auto text-lg">Don't just take our word for it - hear from our satisfied customers</p>
                    </MotionWrapper>

                    <MotionWrapper direction="up" delay={0.3}>
                        <TestimonialSlider testimonials={testimonials} />
                    </MotionWrapper>
                </section>
            </main>
        </div>
        <Footer/>
    </>
  );
}
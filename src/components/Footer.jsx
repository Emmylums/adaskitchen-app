import { faFacebook, faInstagram, faLinkedin, faTiktok, faXTwitter } from "@fortawesome/free-brands-svg-icons";
import { faCopyright, faPalette } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import {sendWhatsAppMessage} from "../components/whatsappLink";

function Footer(){
    return (
        <>
            <footer className="bg-black px-7 pt-10 pb-4 flex flex-col border-t">
                <section className="flex flex-col md:items-center text-base/loose gap-7 pb-10">
                    <section className="z-30">
                        <h2 className="font-semibold pb-2 md:text-center md:text-xl">Quick Links</h2>
                        <nav className="flex flex-col md:flex-row gap-5 md:text-xl">
                            <Link to="/our-story">About Ada's Kitchen</Link>
                            <Link to="/contact-us">Contact Us</Link>
                            <Link to="/signup">Sign Up</Link>
                            <Link to="/login">Login</Link>
                        </nav>
                    </section>
                    <section className="z-30">
                        <h2 className="font-semibold pb-2 md:text-center md:text-xl">Contact / Support</h2>
                        <nav className="flex flex-col md:flex-row gap-5 md:text-xl">
                            <Link to="/Contact Us">Contact Us</Link>
                            <a href="tel:+447737176235">Phone</a>
                            <a>
                                <button className="hover:cursor-pointer" onClick={() => sendWhatsAppMessage("My name is ...................", "447737176235")}>
                                    Whatsapp
                                </button>
                            </a>
                            {/* <Link to="/our-story#faq">FAQ</Link> Changed this line */}
                        </nav>
                    </section>
                </section>
                <section className="flex flex-col text-base items-center">
                    <section className="flex flex-col z-30">
                        <div>
                            <p className="md:text-xl">Follow Us On Our Socials Below</p>
                        </div>
                        <div className="flex gap-7 text-2xl pt-4 items-center justify-center">
                            <a href="https://www.facebook.com/share/164XsAbtot/?mibextid=wwXIfr" target="_blank"><FontAwesomeIcon icon={faFacebook}></FontAwesomeIcon></a>
                            <a href="https://www.instagram.com/adaskitchen56?igsh=anhpMHFob29sM294&utm_source=qr" target="_blank"><FontAwesomeIcon icon={faInstagram}></FontAwesomeIcon></a>
                            <a href="https://www.tiktok.com/@adaskitchen56?_r=1&_t=ZN-93JbvXrIsWU" target="_blank"><FontAwesomeIcon icon={faTiktok}></FontAwesomeIcon></a>
                        </div>
                    </section>
                    <section className="pt-12 flex items-center justify-center text-xs">
                        <p className="text-center ">Copyright <FontAwesomeIcon icon={faCopyright} className="text-xs"/> 2025 | Ada's Kitchen. All Right Reserved</p>
                    </section>
                </section>
            </footer>
        </>
    )
};

export default Footer;
import { faFacebook, faInstagram, faLinkedin, faTiktok, faXTwitter } from "@fortawesome/free-brands-svg-icons";
import { faCopyright, faPalette } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

function Footer(){
    return (
        <>
            <footer className="bg-black px-7 pt-10 pb-4 flex flex-col border-t">
                <section className="flex flex-col md:items-center text-base/loose gap-7 pb-10">
                    <section className="z-30">
                        <h2 className="font-semibold pb-2 md:text-center md:text-xl">Quick Links</h2>
                        <nav className="flex flex-col md:flex-row gap-5 md:text-xl">
                            <Link to="/Our Story">About Ada's Kitchen</Link>
                            <Link to="/Contact Us">Contact Us</Link>
                            <Link to="/Signup">Sign Up</Link>
                            <Link to="/Login">Login</Link>
                        </nav>
                    </section>
                    <section className="z-30">
                        <h2 className="font-semibold pb-2 md:text-center md:text-xl">Contact / Support</h2>
                        <nav className="flex flex-col md:flex-row gap-5 md:text-xl">
                            <Link to="/Contact Us">Contact Us</Link>
                            <a href="tel:+2349124354006">Phone</a>
                            <a>
                                <button className="hover:cursor-pointer">
                                    Whatsapp
                                </button>
                            </a>
                            <Link to="/Our Story#faq">FAQ</Link> {/* Changed this line */}
                        </nav>
                    </section>
                </section>
                <section className="flex flex-col text-base items-center">
                    <section className="flex flex-col z-30">
                        <div>
                            <p className="md:text-xl">Follow Us On Our Socials Below</p>
                        </div>
                        <div className="flex gap-7 text-2xl pt-4 items-center justify-center">
                            <a href="https://www.facebook.com/share/1B7PCprqon/" target="_blank"><FontAwesomeIcon icon={faFacebook}></FontAwesomeIcon></a>
                            <a href="https://www.instagram.com/grow_16withalerah?igsh=NmtzdXg5cGNuYnp2" target="_blank"><FontAwesomeIcon icon={faInstagram}></FontAwesomeIcon></a>
                            <a href="https://www.linkedin.com/company/grow-with-alerah/" target="_blank"><FontAwesomeIcon icon={faLinkedin}></FontAwesomeIcon></a>
                            <a href="https://www.tiktok.com/@elite_skillsbyalerah?_t=ZM-8uU2PuA5Lbr&_r=1" target="_blank"><FontAwesomeIcon icon={faTiktok}></FontAwesomeIcon></a>
                            <a href="https://x.com/elite_skills16?t=wVngOvNz3YQjTIYmfI8HfA&s=09" target="_blank"><FontAwesomeIcon icon={faXTwitter}></FontAwesomeIcon></a>
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
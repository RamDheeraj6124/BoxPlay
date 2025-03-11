import React from 'react';
import styles from './AboutUs.module.css'; // Import CSS module
import ground1 from './ground2.avif'; // Assuming the image is in the same folder
import swimming from './swimming.jpg';
import MSD2 from './MSD2.jpg';
import BDM from './BDM.jpg';
import football from './football.jpg';
import tennis from './tennis.jpg';
import tabletennis from './tabletennis.jpg';
import hockey from './hockey.jpg';
import volleyball from './volleyball.jpg';
import baseball from './baseball.jpg';
import cricketGroundImage from './Screenshot 2024-09-22 194802.png'; // Add your new image path here
import Header from '../Home/partials/Header';

const AboutUs = () => {
    return (
        <div className={styles.aboutUsContainer}>
            <Header />
            <h1 className={styles.mainHeading}>ABOUT BOX PLAY</h1> {/* Main heading on top */}
            <div className={styles.aboutUsContent}>
                <div className={styles.textSection}>
                    <p className={styles.bigIntro}>
                        <strong>Box Play is the world's best sports activities enabler.</strong>
                    </p>
                    <p className={styles.intro}>
                        We are a one-stop platform to help sports enthusiasts meet playpals, discover venues, skill-up their game, 
                        manage their activities seamlessly, and buy gear.
                    </p>
                    <p className={styles.mission}>
                        Our goal is to create a welcoming space for all cricket lovers. From casual matches to competitive leagues, 
                        we strive to deliver a top-tier playing experience.
                    </p>
                </div>
                
                <div className={styles.imageSection}>
                    <img src={ground1} alt="Cricket Ground" className={styles.groundImage}/>
                </div>
            </div>

            {/* New Section with the Uploaded Content */}
            <div className={styles.venueSection}>
                <div className={styles.venueImageWrapper}>
                    <img src={cricketGroundImage} alt="Indoor Cricket Ground" className={styles.venueImage} />
                </div>
                <div className={styles.venueText}>
                    <h2>Your Play Destination</h2>
                    <p>
                        Welcome to Box play, the ultimate platform for sports enthusiasts! Whether you’re looking to book a cricket box, a tennis court, or an indoor stadium for badminton, hockey, or other sports, we’ve got you covered.
At Your Play Destination, we believe in making sports accessible, fun, and hassle-free. Explore a variety of premium sports facilities, conveniently book your favorite venues, and indulge in your passion for the game with friends, family, or teammates.
Join us in celebrating the spirit of sports and creating unforgettable memories on the field. Your game, your ground—book it today!
                    </p>
                </div>
                
            </div>
            <div style={{ marginBottom: "50px" }}></div>
            <div className={styles.detailsSection}>
                <h2>Why Choose Us?</h2>
                <ul className={styles.features}>
                    <li>Multiple grounds with different sizes and amenities.</li>
                    <li>Flexible booking options for your convenience.</li>
                    <li>Clean and well-maintained pitches.</li>
                    <li>Seating arrangements for spectators.</li>
                </ul>

                <div className={styles.quoteSection}>
                    <p className={styles.quote}>"The best box cricket grounds you'll find in the city!"</p>
                </div>

                <h2>Contact Us</h2>
                <p>
                    For bookings or inquiries, feel free to reach out at <a href="contact@iiits.in" className={styles.contactLink}>contact@iiits.in</a> 
                      or call us at (123) 456-7890.
                </p>
            </div>
            
            {/* popular sports */}
            <div className={styles.popularSportsSection}>
                <h2>Popular Sports</h2>
                <div className={styles.sportsGrid}>
                    <div className={styles.sportCard}>
                        <div className={styles.imageWrapper}>
                            <img src={BDM} alt="Badminton" className={styles.sportImage} />
                            <span className={styles.sportName}>Badminton</span>
                        </div>
                    </div>
                    <div className={styles.sportCard}>
                        <div className={styles.imageWrapper}>
                            <img src={football} alt="Football" className={styles.sportImage} />
                            <span className={styles.sportName}>Football</span>
                        </div>
                    </div>
                    <div className={styles.sportCard}>
                        <div className={styles.imageWrapper}>
                            <img src={MSD2} alt="Cricket" className={styles.sportImage} />
                            <span className={styles.sportName}>Cricket</span>
                        </div>
                    </div>
                    <div className={styles.sportCard}>
                        <div className={styles.imageWrapper}>
                            <img src={swimming} alt="Swimming" className={styles.sportImage} />
                            <span className={styles.sportName}>Swimming</span>
                        </div>
                    </div>
                    
                    <div className={styles.sportCard}>
                        <div className={styles.imageWrapper}>
                            <img src={tennis} alt="Tennis" className={styles.sportImage} />
                            <span className={styles.sportName}>Tennis</span>
                        </div>
                    </div>
                    <div className={styles.sportCard}>
                        <div className={styles.imageWrapper}>
                            <img src={tabletennis} alt="Tabletennis" className={styles.sportImage} />
                            <span className={styles.sportName}>Table Tennis</span>
                        </div>
                    </div>
                    <div className={styles.sportCard}>
                        <div className={styles.imageWrapper}>
                            <img src={hockey} alt="Hockey" className={styles.sportImage} />
                            <span className={styles.sportName}>Hockey</span>
                        </div>
                    </div>
                    <div className={styles.sportCard}>
                        <div className={styles.imageWrapper}>
                            <img src={volleyball} alt="volleyball" className={styles.sportImage} />
                            <span className={styles.sportName}>Volleyball</span>
                        </div>
                    </div>
                    <div className={styles.sportCard}>
                        <div className={styles.imageWrapper}>
                            <img src={baseball} alt="baseball" className={styles.sportImage} />
                            <span className={styles.sportName}>Baseball</span>
                        </div>
                    </div>
                    
                </div>
            </div>
            
           
        </div>
    );
};

export default AboutUs;
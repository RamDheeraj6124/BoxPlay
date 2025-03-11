import React, { useState } from 'react';
import './Faq.css';
import Header from '../Home/partials/Header';

const FAQ = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    const toggleAccordion = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    const faqData = [
        {
            question: 'Will all shops are verified ?',
            answer: "Yes, every venue listed on Box Play is thoroughly verified before being added to our platform.",
        },
        {
            question: 'What services will boxplay provide ?',
            answer: 'Box Play offers a seamless platform for booking sports grounds for various activities like box cricket, tennis, volleyball, badminton, and more. Box Play helps you find and reserve the best venues nearby. Our platform also provides features like user dashboards to track booking history, trending sports news, and a Learn section to explore rules and tips for different sports. ',
          },
          {
              question: 'Do i need to carry my own equipment or will the equipment be provided at the venue?',
              answer: 'Please refer to the activity information for instructions on equipment. Generally, common equipment for the game (shuttle, ball) will be provided at the venue and this equipment needs to be returned post completion of the activity. You will need to carry your own Individual equipment (rackets, shoes) - or can rent these at the venue subject to availability and sizing.',
            },
            {
              question: 'Why to choose boxplay?',
              answer: 'Box Play is your ultimate solution for booking sports grounds effortlessly. Heres why you should choose us: Heres why you should choose us:Wide Variety of Sports Venues ,Verified Listings , Nearby Venues,Trusted Platform ,Comprehensive Dashboard. ',
            },
            {
              question: 'What is the news section all about ?',
              answer: 'The News section on Box Play keeps you updated with the latest happenings in the world of sports.',
            },
            {
              question: "What is the Learn Section all about?",
              answer: 'The Learn section on Box Play is designed to educate and guide users about various sports.',
            },
            {
              question: 'I cannot see any venues near my area? Why is that?',
              answer: 'We are trying to reach out to more venues near your area, as youre reading this. This issue you are facing can be the case if there are no venues tied up with Playo and/or if there are no venues near your selected location. The app automatically shows the closest venues to your area.',
            },
            {
              question: 'what does the venue rating signify?',
              answer: 'The venue rating is the average of all the ratings given by Playo users for a particular venue.',
            },
            {
              question: 'What types of sports venue can I book through box play?',
              answer: 'With Box Play, you can book a wide variety of sports venues tailored to your needs, including, like Box Cricket, Tennis Courts, Badminton Courts, Volleyball Courts,Football etc.',
            },
            {
              question: 'Is box play is available in all cities?',
              answer: 'It is in some some citites and we are working on it to provide in all possible cities',
            },
          {
            question: 'Can i book multiple venues at once?',
            answer: 'Yes, you book multiple venues at once.',
          },
          {
            question: 'How do i check my booking history?',
            answer: 'In header by clicking the your username and go to dashboard it will show all the bookings.',
          },
          {
            question: 'How to rate a venue or submit feedback to the venue?',
            answer: 'Select the venue by navigating to Book Tab > Venues > Choose the venue > Rate. You will also be able to share feedback to the venue directly through the message box.',
          },
        // Add other FAQs here
    ];

    return (
        <div className="container">
          <Header />
            <h1>FAQ</h1>
            <h2>Frequently Asked Questions</h2>
            <div className="accordion">
                {faqData.map((item, index) => (
                    <div className={`accordion-item ${activeIndex === index ? 'active' : ''}`} key={index}>
                        <div className="accordion-title" onClick={() => toggleAccordion(index)}>
                            {item.question}
                            <span className="arrow">▼</span>
                        </div>
                        <div className="accordion-content" style={{ maxHeight: activeIndex === index ? '1000px' : '0' }}>
                            <p className="answer">{item.answer}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FAQ;
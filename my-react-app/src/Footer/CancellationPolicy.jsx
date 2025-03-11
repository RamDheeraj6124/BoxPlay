import React from 'react';
import './CancellationPolicy.css';
import Header from '../Home/partials/Header';

const CancellationPolicy = () => {
    return (
        <div className="cancellation-policy">
            <Header />
            <h1 className="title">Cancellation and Refund Policy</h1>
            <p className="policy-text">
                Cancellations are subject to the policy as set by the respective merchant partner. You can view the cancellation policies of the respective merchant partner on their information page prior to making a booking or purchase. The cancellation policy is also included in your booking ticket in your order history.
            </p>
            <p className="policy-text">
                Cancellations can be initiated by the users themselves on your booking ticket. The refund amount due will be displayed prior to seeking confirmation of the cancellation. The refund amount will be credited back into the user’s account, to the same source through which the payment was made, within 5-7 working days, post initiating the cancellation.
            </p>
        </div>
    );
};

export default CancellationPolicy;

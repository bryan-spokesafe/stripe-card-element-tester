import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_here');

const CheckoutForm = ({ clientSecret }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Confirm payment using the PaymentElement
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: 'https://pocketstorage-development.web.app/',
            },
        });

        if (error) {
            console.error(error.message);
        } else {
            setPaymentSuccess(true);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <PaymentElement />
            <button type="submit" disabled={!stripe || !elements}>
                Pay
            </button>
            {paymentSuccess && <p>Payment Successful!</p>}
        </form>
    );
};

const App = () => {
    const [clientSecret, setClientSecret] = useState('');

    useEffect(() => {
        // Fetch the clientSecret from your backend when the component mounts
        const fetchClientSecret = async () => {
            const response = await fetch(
                'http://127.0.0.1:5001/pocketstorage-development/europe-west2/stripe-createSubscription',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user: {
                            first_name: 'Demo',
                            last_name: 'User',
                            email: 'demo@example.com',
                            phone_number: '12344',
                            stripeCustomerId: 'cus_RQuuCPAqsVrxs9',
                        },
                        priceId: 'price_1QfdueJC8IRfePhNIlIari2F',
                        metadata: {
                            storageId: 'stor_ex1234',
                            locationId: 'chinatown',
                            type: 'monthly',
                            price: '2.50',
                            userId: 'userIdTestPaymentElement',
                        },
                    }),
                }
            );

            const sub_response = await response.json();
            console.log(sub_response, 'TEST RESPONSE');
            const clientSecret = sub_response.data.latest_invoice.payment_intent.client_secret;
            setClientSecret(clientSecret);
        };

        fetchClientSecret();
    }, []);

    return (
        clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm />
            </Elements>
        )
    );
};

export default App;

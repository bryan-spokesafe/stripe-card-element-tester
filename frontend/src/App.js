import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_51QWcTUJC8IRfePhN5tEt2iQSti89RejICP6dW3xjNWNFqQZDddGA56L7L7D7t0hnViDzW7qhRMSTHyGPjfcFUUhF00sa2ww5M1');

const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const handleSubmit = async (event) => {
      event.preventDefault();
  
      const response = await fetch('http://127.0.0.1:5001/pocketstorage-dev/europe-west2/stripe-createSubscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
           "customerId": "cus_RPsxWNO0G4EmaG",
           "priceId": "price_1QX5O9JC8IRfePhNtEXSlF2k"
        }),
      });
      const sub_response = await response.json();
      console.log(sub_response.data, 'SUBSCRIPTION DATA');
  
      const { error, paymentIntent } = await stripe.confirmCardPayment(sub_response.data.latest_invoice.payment_intent.client_secret, {
          payment_method: {
              card: elements.getElement(CardElement),
          },
      });
  
      if (error) {
          console.error(error.message);
      } else if (paymentIntent.status === 'succeeded') {
          setPaymentSuccess(true);
      }
  };
  // test

    return (
        <form onSubmit={handleSubmit}>
            <CardElement />
            <button type="submit" disabled={!stripe}>
                Pay
            </button>
            {paymentSuccess && <p>Payment Successful!</p>}
        </form>
    );
};

const App = () => (
    <Elements stripe={stripePromise}>
        <CheckoutForm />
    </Elements>
);

export default App;

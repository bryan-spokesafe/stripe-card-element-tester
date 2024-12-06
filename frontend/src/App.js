import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_f5JzvAJ8xJfDEzNGXt2akIkX');

const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const handleSubmit = async (event) => {
      event.preventDefault();
  
      const response = await fetch('http://localhost:4000/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: 1000 }),
      });
      const { clientSecret } = await response.json();
  
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
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

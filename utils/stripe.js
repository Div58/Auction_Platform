import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config(); // <-- This is enough if .env is in backend/

console.log("Stripe Secret Key:", process.env.STRIPE_SECRET_KEY);

console.log("🔍 All ENV Vars:", process.env);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export default stripe;

import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config({ path: "config.env" }); // ✅ This is okay at the top

// ✅ These must be in the top-level, not inside any object


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default stripe;

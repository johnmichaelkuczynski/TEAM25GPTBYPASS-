import express, { Request, Response } from 'express';
import Stripe from 'stripe';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-11-15',
});

// POST /api/stripe/create-checkout-session
router.post('/create-checkout-session', async (req: Request, res: Response) => {
  try {
    const { priceId, userId } = req.body;
    if (!priceId) return res.status(400).json({ error: 'priceId required' });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { userId: userId || 'unknown' },
      success_url: `${process.env.DOMAIN}/pay/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.DOMAIN}/pay/cancel`,
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error', err);
    return res.status(500).json({ error: 'checkout creation failed' });
  }
});

export default router;

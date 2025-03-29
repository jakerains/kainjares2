import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  try {
    const { items, successUrl, cancelUrl } = JSON.parse(event.body || '{}');

    if (!items?.length || !successUrl || !cancelUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required parameters' }),
      };
    }

    // Get products from Supabase to verify prices and availability
    const { data: products, error: dbError } = await supabase
      .from('products')
      .select('*')
      .in('id', items.map((item: any) => item.id));

    if (dbError || !products) {
      console.error('Database error:', dbError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Error fetching products' }),
      };
    }

    // Verify all products exist and are in stock
    const invalidItems = items.filter((item: any) => {
      const product = products.find(p => p.id === item.id);
      return !product || product.inventory < item.quantity;
    });

    if (invalidItems.length > 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Some items are unavailable or out of stock',
          invalidItems 
        }),
      };
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: items.map((item: any) => {
        const product = products.find(p => p.id === item.id)!;
        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: product.description,
              images: product.images,
            },
            unit_amount: Math.round(product.price * 100), // Convert to cents
          },
          quantity: item.quantity,
        };
      }),
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ sessionId: session.id }),
    };
  } catch (error) {
    console.error('Checkout error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error creating checkout session' }),
    };
  }
};
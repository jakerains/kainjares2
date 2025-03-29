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
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing Stripe webhook secret' }),
    };
  }

  try {
    const stripeEvent = stripe.webhooks.constructEvent(
      event.body!,
      event.headers['stripe-signature']!,
      webhookSecret
    );

    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session;
        
        // Create order record
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            stripe_session_id: session.id,
            customer_email: session.customer_details?.email,
            amount_total: session.amount_total! / 100, // Convert from cents
            payment_status: session.payment_status,
          })
          .select()
          .single();

        if (orderError) {
          console.error('Error creating order:', orderError);
          return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error creating order' }),
          };
        }

        // Get line items from the session
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

        // Create order items and update inventory
        for (const item of lineItems.data) {
          // Get product details
          const product = await stripe.products.retrieve(item.price?.product as string);
          
          // Create order item
          const { error: itemError } = await supabase
            .from('order_items')
            .insert({
              order_id: order.id,
              product_id: product.id,
              quantity: item.quantity,
              price: item.price?.unit_amount! / 100, // Convert from cents
            });

          if (itemError) {
            console.error('Error creating order item:', itemError);
            continue;
          }

          // Update inventory
          const { error: inventoryError } = await supabase.rpc(
            'decrement_inventory',
            { 
              p_id: product.id,
              amount: item.quantity || 1
            }
          );

          if (inventoryError) {
            console.error('Error updating inventory:', inventoryError);
          }
        }

        break;
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (error) {
    console.error('Webhook error:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Webhook error' }),
    };
  }
};
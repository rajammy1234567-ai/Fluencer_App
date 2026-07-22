import { createOrder } from './config/razorpay.js';
import dotenv from 'dotenv';
dotenv.config();

console.log('Testing Razorpay Credentials:');
console.log('Key ID:', process.env.RAZORPAY_KEY_ID);

async function testRazorpay() {
  try {
    const order = await createOrder(500); // ₹500 test order
    console.log('✅ Success! Created Razorpay Order:', order.id, 'Amount:', order.amount, order.currency);
  } catch (err) {
    console.error('❌ Razorpay Test Failed:', err.message || err);
  }
}

testRazorpay();

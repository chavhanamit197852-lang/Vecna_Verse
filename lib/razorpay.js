import Razorpay from "razorpay";
let instance;
export function getRazorpay(){if(!process.env.RAZORPAY_KEY_ID||!process.env.RAZORPAY_KEY_SECRET)throw new Error("Razorpay keys are not configured");if(!instance)instance=new Razorpay({key_id:process.env.RAZORPAY_KEY_ID,key_secret:process.env.RAZORPAY_KEY_SECRET});return instance;}

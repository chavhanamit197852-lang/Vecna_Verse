import crypto from "node:crypto";
export function verifyCheckoutSignature({orderId,paymentId,signature}){const secret=process.env.RAZORPAY_KEY_SECRET;if(!secret)return false;const expected=crypto.createHmac("sha256",secret).update(`${orderId}|${paymentId}`).digest("hex");return safeEqual(expected,signature||"");}
export function verifyWebhookSignature(rawBody,signature){const secret=process.env.RAZORPAY_WEBHOOK_SECRET;if(!secret)return false;const expected=crypto.createHmac("sha256",secret).update(rawBody).digest("hex");return safeEqual(expected,signature||"");}
function safeEqual(a,b){const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&crypto.timingSafeEqual(x,y);}

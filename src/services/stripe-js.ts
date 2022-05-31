import { loadStripe } from "@stripe/stripe-js";

export async function getStripeJs() {
  if (process.env.NEXT_PUBLIC_STRIPE_API_KEY == null) {
    throw new Error("NEXT_PUBLIC_STRIPE_API_KEY is missing");
  }

  const stripeJs = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_API_KEY);

  return stripeJs;
}

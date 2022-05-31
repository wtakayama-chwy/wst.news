import Stripe from "stripe";
import packageInfo from "../../package.json";

if (process.env.STRIPE_API_KEY == null) {
  throw new Error("STRIPE_API_KEY is missing");
}

export const stripe = new Stripe(
  process.env.STRIPE_API_KEY, 
  {
    apiVersion: "2020-08-27",
    appInfo: {
      name: "WST.NEWS",
      // security reasons - sometimes you do not want to expose your package.json
      // for more info: https://stackoverflow.com/questions/45978230/get-version-number-from-package-json-in-react-redux-create-react-app/50822003#50822003
      version: process.env.NODE_ENV === "development" ? packageInfo.version : "0.0.1",
  },
});

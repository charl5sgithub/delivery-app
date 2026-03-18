import pkg from "globalpayments-api";
const { GpApiConfig, ServicesContainer } = pkg;
import dotenv from "dotenv";

dotenv.config();

const config = new GpApiConfig();
config.appId = process.env.GP_APP_ID;
config.appKey = process.env.GP_APP_KEY;
config.merchantId = process.env.GP_MERCHANT_ID;

// Use built-in Environment enum if possible, or string
config.environment = process.env.GP_ENV === 'production' ? "production" : "sandbox";

ServicesContainer.configure(config);

export default ServicesContainer;

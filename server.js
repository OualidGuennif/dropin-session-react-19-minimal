// OG


const express = require("express");
const cors = require("cors");
const { Client, CheckoutAPI } = require("@adyen/api-library");
const { randomUUID } = require("crypto"); 
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new Client({
  apiKey: process.env.ADYEN_API_KEY,
  environment: "TEST"
});

const checkout = new CheckoutAPI(client);

// Endpoint minimaliste pour créer une session Checkout
app.post("/api/sessions", async (req, res) => {
  try {
    
    const reference = `${randomUUID()}`;

    const response = await checkout.PaymentsApi.sessions({
      amount: {
        currency: "EUR",
        value: 10000
      },
      reference, 
      merchantAccount: process.env.ADYEN_MERCHANT_ACCOUNT,
      returnUrl: "http://localhost:5173/return",

      countryCode: "FR",
      shopperLocale: "fr-FR",

      channel: "Web",

      //Example only
      shopperReference:"ECFR00000000001",

      //always Ecommerce when shopper is present
      shopperInteraction:"Ecommerce",

      
      //default
      storePaymentMethodMode:"askForConsent",
      recurringProcessingModel:"CardOnFile",

      //cart containing subscription product ? 
      //show clear disclaimer + cgv to be compliant that you are going to tokenize + doing recurring
      
      //---> storePaymentMethodMode:"enabled",
      //---> recurringProcessingModel:"Subscription",
      


      authenticationData:{ 
      threeDSRequestData:{ 
        nativeThreeDS:'preferred'
      }
      }


    });

    res.json(response);
  } catch (error) {
    console.error("Error creating Adyen session:", error);
    res.status(500).json({
      error: true,
      message: error.message,
      errorCode: error.errorCode
    });
  }
});

const PORT = process.env.VITE_SERVER_PORT || 3001;
app.listen(PORT, () => {
  console.log(`Adyen dev backend running on http://localhost:${PORT}`);
});
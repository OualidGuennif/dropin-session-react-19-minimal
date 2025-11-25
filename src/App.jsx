import { useEffect, useRef, useState } from "react";
import {
  AdyenCheckout,
  Dropin,
  Card,
  PayPal,
  ApplePay,
  GooglePay,
} from "@adyen/adyen-web";
import "@adyen/adyen-web/styles/adyen.css";

const clientKey = import.meta.env.VITE_ADYEN_CLIENT_KEY;
const port = import.meta.env.VITE_PORT;
if (!clientKey) {
  console.error("Missing VITE_ADYEN_CLIENT_KEY in .env");
}
if (!port) {
  console.error("Missing VITE_PORT in .env");
}


export default function App() {
  const containerRef = useRef(null);      // ref DOM pour le conteneur Drop-in
  const dropinRef = useRef(null);         // ref JS pour stocker l’instance Drop-in
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    let cancelled = false;

    async function initDropin() {
      if (!containerRef.current) return;
      if (dropinRef.current) return; // ne pas recréer en boucle

      try {
        setStatus("creating_session");

        const response = await fetch("http://localhost:3001/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          console.error("Failed to create session", await response.text());
          setStatus("error_creating_session");
          return;
        }

        const session = await response.json(); // { id, sessionData, ... }
      

        const configuration = {
          environment: "test",
          clientKey,
          session,
          locale: "fr-FR",
          countryCode: "FR",
          showPayButton: true,
          onPaymentCompleted: (result, component) => {
            console.info("onPaymentCompleted", result, component);
            setStatus("payment_completed");
          },
          onPaymentFailed: (result, component) => {
            console.info("onPaymentFailed", result, component);
            setStatus("payment_failed");
          },
          onError: (error, component) => {
            console.error("onError", error, component);
            setStatus("error");
          },
        };

        console.log(session);
        console.log(configuration);

        const checkout = await AdyenCheckout(configuration);
        if (cancelled) return;

        const dropin = new Dropin(checkout, {
          paymentMethodComponents: [Card, PayPal, GooglePay, ApplePay],
          paymentMethodsConfiguration: {
            card: {
              hasHolderName: false,
              holderNameRequired: false,
              billingAddressRequired: false,
            },
          },
        });

        dropin.mount(containerRef.current);
        dropinRef.current = dropin;
        setStatus("ready");
      } catch (e) {
        console.error("Unexpected error in initDropin", e);
        setStatus("error");
      }
    }

    void initDropin();

    return () => {
      cancelled = true;
      if (dropinRef.current) {
        dropinRef.current.unmount();
        dropinRef.current = null;
      }
    };
  }, []);

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "40px auto",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1>Adyen Drop-in React 19 demo</h1>
      <p style={{ fontSize: 14, color: "#555" }}>Status: {status}</p>

      {/*  CETTE LIGNE NE DOIT PAS ÊTRE MODIFIÉE */}
      <div ref={containerRef} />
    </div>
  );
}
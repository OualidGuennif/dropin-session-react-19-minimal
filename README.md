# Adyen-react19-demo

Demo pour tester Adyen Drop-in (v6.25.1) avec React 19  **et** un  backend Node/Express qui crée la session Checkout.


## 1. Pré-requis

- Node 18+ installé
- Un compte Adyen test avec :
  - une API key Checkout
  - un `merchantAccount`
  - un `clientKey` 


## 2. Installation

```bash
cd adyen-react19-demo
# éditer .env et renseigner ADYEN_API_KEY + ADYEN_MERCHANT_ACCOUNT + VITE_CLIENT_KEY
npm install
```

## 3. Lancer le backend et le front

```bash
npm run dev:all
```

Ensuite ouvrir : http://localhost:5173

## 4. Comment ça marche (flow)

1. Au `mount` de `<App />`, on exécute un `useEffect` qui :
   - appelle `POST http://localhost:3001/api/sessions`
   - reçoit la réponse JSON Adyen (objet `session`)
   - initialise `AdyenCheckout` avec `{ environment, clientKey, session, ... }`
   - crée un `new Dropin(checkout, config)` et le `mount` dans `containerRef.current`
2. Le cleanup du `useEffect` :
   - gère proprement le `unmount()` de la Drop-in
   - est compatible avec React 19 / StrictMode qui peut monter/démonter deux fois en dev.


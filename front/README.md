# Front

React frontend for the API in `../back`.

## Run

Start the backend first:

```bash
cd ../back
npm start
```

Then run the frontend:

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

The Vite dev server proxies `/api` to `http://localhost:3000`, so browser requests can consume the backend without changing the API CORS headers.

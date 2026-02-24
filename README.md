# Rain Check — Frontend ☔

Next.js + React frontend for the [Rain Check Spring Boot API](https://github.com/thebrodigy/rain-check).

## Getting Started

### Prerequisites
- Node.js 18+
- Rain Check backend running on `http://localhost:8080`

### Install & Run

```bash
npm install
npm run dev
```

App runs at **http://localhost:3000**

### Build for Production

```bash
npm run build
npm start
```

---

## Project Structure

```
rain-check-frontend/
├── app/
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Main page (search + results)
│   └── globals.css      # Global styles & design system
├── components/
│   └── RainCanvas.tsx   # Animated rain background
├── lib/
│   └── api.ts           # API client for the backend
├── swagger.yaml         # OpenAPI 3.0 spec for the backend API
└── next.config.mjs      # Next.js config (API proxy to :8080)
```

---

## API Proxy

The Next.js config automatically proxies `/api/*` requests to the Spring Boot backend at `http://localhost:8080`, so no CORS issues during development.

To point to a different backend, update `next.config.mjs`:

```js
destination: 'http://your-backend-host/api/:path*'
```

---

## API Reference

See [`swagger.yaml`](./swagger.yaml) for the full OpenAPI 3.0 specification.

**Quick reference:**

```
GET /api/predictions?location={city}

Response:
{
  "location": "Manila",
  "willRain": true,
  "chanceOfRain": "60"
}
```

You can view the Swagger UI by importing `swagger.yaml` into [editor.swagger.io](https://editor.swagger.io).

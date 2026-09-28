# Raavana Thalaigal Trust web app

Vite and React version of the `WEB` application.

## Run locally

```bash
npm install
npm run dev
```

## Environment configuration

Edit `VITE_API_URL` in the appropriate file. Include `/api` in the base URL; login appends `/auth/login` automatically.

| File | Command | API URL |
| --- | --- | --- |
| `.env.development` | `npm run dev` | `http://localhost:5000/api` |
| `.env.production` | `npm run build` | `https://raavanan-api.onrender.com/api` |

To use the hosted API during development, replace the URL in `.env.development` with the hosted URL. Restart the development server after editing its environment file. Production values are embedded during the build, so run `npm run build` again after changing `.env.production`. `npm run preview` serves the existing production build.

For personal overrides, use `.env.development.local` or `.env.production.local`; these are already ignored by Git. Set `VITE_RAZORPAY_KEY` to the public Razorpay key ID when enabling payments. All `VITE_` values are exposed to the browser, so do not put private keys or passwords in them.

## Project layout

- `src/pages/<PageName>/index.jsx`: one folder per page, including the admin page under `src/pages/admin`.
- `src/components`: shared and feature components.
- `src/services`: API and mock data services.
- `src/asset`: imported images.
- `public`: assets served directly by Vite.
- `src/App.jsx`: routes and shared layout.

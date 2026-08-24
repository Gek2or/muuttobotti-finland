# Muuttobotti Mobile

Cross-platform Android/iOS app for Muuttobotti, built with Expo + React Native + TypeScript.

## Roles

### Client
- price calculator for moving / cleaning / transport
- booking form with up to 5 photos
- secure booking credentials stored in Expo SecureStore
- booking status tracking
- modify/cancel self-service using booking ID + access key
- direct phone / WhatsApp / email contact

### Admin
- admin-token login stored in Expo SecureStore
- list all bookings from `/api/admin/bookings`
- booking detail with customer, route, calculator snapshot, recommendation, IP/device/source metadata
- quick phone / WhatsApp / email actions
- status updates: new / confirmed / in_progress / completed / cancelled

## Backend

The app uses the same production APIs as https://muuttobotti.fi:
- `POST /api/bookings`
- `POST/PATCH /api/bookings/status`
- `GET/PATCH /api/admin/bookings`

This means website and mobile app share the same booking records once Cloudflare D1 is bound in production.

## Run locally

```bash
cd mobile
npm install
npx expo start
```

For a development build:

```bash
npx eas build --profile development --platform android
npx eas build --profile development --platform ios
```

## Next milestones

1. Cloudflare D1/R2 production bindings
2. dedicated client accounts / magic-link login
3. push notifications for booking status changes
4. native date/time pickers and address autocomplete
5. upload/view booking photos in admin
6. FI / EN / UK / RU app localization
7. app icon, splash, screenshots and store metadata
8. TestFlight + Google Play internal testing

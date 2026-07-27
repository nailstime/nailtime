# Booking LIFF

The booking flow is served at `/liff/booking` and is intentionally a separate
LIFF app from the member portal.

## LINE Developers Console

Create a LIFF app in the same LINE Login channel used by Nail Time:

- Name: `Nailtime Booking`
- Endpoint URL: `https://nailtimebytt.com/liff/booking`
- Size: Full
- Scopes: `openid` and `profile`
- `chat_message.write`, Scan QR, and Module mode: leave disabled

Copy the new LIFF ID after creating the app. The member LIFF ID must not be
reused here because each LIFF app has its own endpoint URL.

## Deployment settings

Set the following environment variables in Vercel, then redeploy both projects:

| Project | Variable | Value |
| --- | --- | --- |
| `nailtime-app` | `NEXT_PUBLIC_BOOKING_LIFF_ID` | The new Booking LIFF ID |
| `nailtimepos` | `VITE_BOOKING_LIFF_ID` | The same Booking LIFF ID |

The LINE OA Rich Menu should link directly to:

`https://liff.line.me/<BOOKING_LIFF_ID>`

The Member LIFF uses the same ID for its **จองคิวออนไลน์** button.

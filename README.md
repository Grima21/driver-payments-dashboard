# Driver Payments Dashboard

A web application for managing and tracking daily driver payments.

## Features

- Driver payment registration
- Monthly payment tracking
- Daily payment summary
- Monthly payment totals
- Payment validation to prevent duplicate records
- Dashboard with real-time statistics
- Secure authentication with Supabase

## Tech Stack

- Next.js
- React
- Supabase
- Tailwind CSS
- TypeScript

## Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/driver-payments-dashboard.git
```

Install dependencies:

```bash
npm install
```

Create a `.env.local` file and add:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Project Overview

This application was built to simplify the management of daily driver payments through an interactive dashboard.

Users can:

- Track daily payments
- Monitor monthly totals
- View payment statistics
- Manage driver records
- Prevent duplicate payment entries

## Future Improvements

### Version 1.1

- Edit payments
- Delete payments
- Monthly navigation
- Improved dashboard UI

### Version 1.2

- Partial payments
- Payment notes
- Variable payment amounts
- Export reports

## License

This project is available for educational and portfolio purposes.

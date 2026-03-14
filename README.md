
# Odoo Inventory Management System

# Odoo Inventory Management System

![Dashboard Screenshot](public/dashboard-preview.png)
<p align="center"><i>Modern inventory dashboard for real-time tracking and analytics</i></p>

## Overview

This project is a modern inventory management system built with Next.js, TypeScript, and Prisma. It provides robust features for handling products, stock, deliveries, receipts, internal transfers, and user authentication. Designed for scalability and ease of use, it offers a clean dashboard and intuitive UI components.

## Features

- User authentication and authorization
- Product management
- Stock adjustments and tracking
- Delivery orders and receipts
- Internal transfers and move history
- Dashboard with charts and analytics
- Responsive UI with reusable components
- Secure password reset and verification flows

## Installation

1. **Clone the repository:**
	```bash
	git clone <your-repo-url>
	cd odoo
	```
2. **Install dependencies:**
	```bash
	npm install
	```
3. **Set up environment variables:**
	Create a `.env` file based on `.env.example` and configure your database and authentication secrets.
4. **Run database migrations:**
	```bash
	npx prisma migrate dev --name init
	```
5. **Start the development server:**
	```bash
	npm run dev
	```

## Usage

- Access the dashboard at `http://localhost:3000` after starting the server.
- Use the sidebar to navigate between inventory modules.
- Manage products, stock, deliveries, and transfers from the dashboard.

## Folder Structure

- `src/` - Main application source code
  - `auth/` - Authentication logic and configuration
  - `actions/` - Business logic for inventory operations
  - `app/` - Next.js app directory and pages
  - `components/` - Reusable UI and app components
  - `data/` - Data models and token management
  - `lib/` - Utility functions and database connection
  - `hook/` & `hooks/` - Custom React hooks
- `prisma/` - Prisma schema and migrations
- `public/` - Static assets

## Technologies Used

- Next.js
- TypeScript
- Prisma ORM
- React
- Tailwind CSS
- PostCSS
- ESLint

## Database

- Managed with Prisma
- Schema defined in `prisma/schema.prisma`
- Migration files in `prisma/migrations/`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature-name`)
3. Commit your changes
4. Push to your branch and open a pull request

## License

This project is licensed under the MIT License.

---

For questions or support, please open an issue or contact the maintainer.

# Cervify - Academic Certification Portal

Cervify is a comprehensive, all-in-one web portal designed for educational institutions to generate, approve, issue, and manage student certificates seamlessly.

## Key Features

- **Instant Certificate Generation:** Dynamically generate well-formatted, professional certificates in seconds.
- **Multi-Level Authorization:** Built-in workflow for Coordinator drafting, Principal approval, and Administrator management.
- **Academic Record Integrity:** Every certificate is timestamped and verifiable.
- **Public Verifier:** A dedicated page where third parties can verify the authenticity of a certificate using its unique ID.
- **Role-Based Access:** Dedicated views for Admins, Principals, and Coordinators ensuring everyone sees exactly what they need.
- **Beautiful Soft Blue Theme:** A clean, professional, and accessible user interface built on a light-first design system.

## Tech Stack

- **Frontend:** React, Vite, Lucide Icons
- **Styling:** CSS Custom Properties (Soft Blue Theme System)
- **Backend/API:** Node.js, Express, MongoDB
- **Authentication:** Google OAuth 2.0 / JWT

## How to Run Locally

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Cervify
   ```

2. **Run the Frontend (Client)**
   ```bash
   cd client
   npm install
   npm run dev
   ```
   The client will run on `http://localhost:5173`.

3. **Run the Backend (Server)**
   ```bash
   cd server
   npm install
   # Make sure you configure your .env file with MongoDB URI and JWT secrets
   npm start
   ```

## Contributing
This project is currently managed for private collaboration. Please reach out to the project maintainer for access.

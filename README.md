
# TeachnGrow - Faculty Self-Appraisal System

TeachnGrow is a modern web application for educational professionals to manage and track their self-appraisal documents. The system allows faculty members to submit documents for review, while department heads and administrators can review and approve submissions.

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **UI Components**: Shadcn UI (based on Radix UI)
- **State Management**: React Context API
- **Routing**: React Router
- **Form Handling**: React Hook Form with Zod validation
- **Data Persistence**: MongoDB with Mongoose
- **Authentication**: Firebase Authentication
- **Email Notifications**: Nodemailer (mock implementation)
- **Build Tool**: Vite

## Project Structure

```
├── public/             # Static assets
├── src/                # Source code
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React context providers
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility libraries
│   ├── pages/          # Page components
│   ├── services/       # API and service functions
│   └── utils/          # Helper utilities
├── index.html         # Entry HTML file
└── package.json       # Project dependencies
```

## Features

- **User Authentication**: Multiple role-based access (faculty, admin, HOD, principal)
- **Document Management**: Create, edit, submit, and track documents
- **Review Workflow**: Multi-stage review process with notifications
- **User Management**: Admin tools for managing users
- **Category Management**: Flexible criteria configuration
- **Profile Management**: User profile customization
- **MongoDB Integration**: Data persistence with MongoDB
- **Document Preview**: View uploaded documents directly in the application

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (v4.4 or higher)

### Installation

#### Windows

1. Clone this repository
   ```bash
   git clone https://github.com/yourusername/teachngrow.git
   cd teachngrow
   ```

2. Install dependencies
   ```bash
   npm install
   # or if you use yarn
   yarn install
   ```

3. Start the development server
   ```bash
   npm run dev
   # or if you use yarn
   yarn dev
   ```

4. Access the application at `http://localhost:8080`

#### Linux

1. Clone this repository
   ```bash
   git clone https://github.com/yourusername/teachngrow.git
   cd teachngrow
   ```

2. Install dependencies
   ```bash
   npm install
   # or if you prefer yarn
   yarn install
   ```

3. Make sure you have the correct permissions
   ```bash
   chmod +x node_modules/.bin/vite
   ```

4. Start the development server
   ```bash
   npm run dev
   # or if you prefer yarn
   yarn dev
   ```

5. Access the application at `http://localhost:8080`

### Production Build

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## MongoDB Setup

### Windows

1. Install MongoDB Community Edition from the [official website](https://www.mongodb.com/try/download/community)
2. Install MongoDB Compass for a GUI interface to your database
3. Ensure MongoDB is running locally on the default port (27017)

### Linux (Ubuntu/Debian)

1. Install MongoDB
   ```bash
   sudo apt update
   sudo apt install -y mongodb
   ```

2. Start and enable MongoDB service
   ```bash
   sudo systemctl start mongodb
   sudo systemctl enable mongodb
   ```

3. Verify MongoDB is running
   ```bash
   sudo systemctl status mongodb
   ```

4. Install MongoDB Compass (optional)
   ```bash
   wget https://downloads.mongodb.com/compass/mongodb-compass_1.36.4_amd64.deb
   sudo dpkg -i mongodb-compass_1.36.4_amd64.deb
   ```

The application will automatically create the required collections when it first connects to MongoDB.

## Demo Login Credentials

- Admin:
  - Email: admin@example.com
  - Password: password

- HOD (Department Head):
  - Email: hod@example.com
  - Password: password

- Faculty:
  - Email: faculty@example.com
  - Password: password

## Development Notes

- The application uses a mock email service in development. In production, you would need to configure a real email service.
- Document uploads are supported for PDF and Word documents.
- The system is designed to be responsive and works on mobile devices.

## Future Enhancements

1. Implement real email notifications using a service like SendGrid or Mailgun
2. Add comprehensive analytics dashboard for administrators
3. Implement batch processing for document approvals
4. Add export functionality for reports
5. Enhance document preview capabilities
6. Implement real-time notifications

## License

This project is MIT licensed.

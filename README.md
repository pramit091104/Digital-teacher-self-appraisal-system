
# TeachnGrow - Faculty Self-Appraisal System

TeachnGrow is a web application for educational professionals to manage and track their self-appraisal documents.

## Technology Stack

- Frontend: HTML, Tailwind CSS, JavaScript
- Backend: Node.js with Express.js
- Data: Mock data (prepared for MongoDB integration)

## Features

- User authentication (faculty, admin, hod, principal)
- Document creation and submission
- Document review and approval workflow
- User management
- Category/criteria management
- Profile management

## Setup Instructions

1. Clone this repository
2. Navigate to the project root directory
3. Start the server:

```bash
node server/server.js
```

4. Access the application at `http://localhost:5000`

## Demo Login Credentials

- Admin:
  - Email: admin@example.com
  - Password: password

- Faculty:
  - Email: jyoti@example.com
  - Password: password

## Project Structure

- `/public`: Frontend static files
  - `/css`: Stylesheets
  - `/js`: JavaScript files
    - `/pages`: Page components
    - `/components.js`: Reusable UI components
    - `/api.js`: API functions
    - `/auth.js`: Authentication functions
    - `/router.js`: Client-side routing
    - `/utils.js`: Helper utilities
- `/server`: Backend files
  - `/routes`: API routes
  - `server.js`: Main server file

## Notes

This is a demo application with mock data. In a real production environment, you would:

1. Connect to a MongoDB database
2. Implement proper authentication with JWT
3. Add proper validation and error handling
4. Implement file uploads for documents
5. Add more comprehensive test coverage
6. Configure proper environment variables

## License

This project is MIT licensed.

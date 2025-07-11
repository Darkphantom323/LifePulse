# LifePulse - Health & Wellness Tracker

A modern full-stack application for tracking your health goals, hydration, meditation, and daily schedule.

## Architecture

This project now uses a **Spring Boot backend** with a **Next.js frontend** architecture:

- **Backend**: Spring Boot with MongoDB, JWT authentication, and REST API
- **Frontend**: Next.js with TypeScript, TailwindCSS, and React

## Project Structure

```
├── lifepulse/                 # Next.js Frontend
│   ├── src/
│   │   ├── app/              # App Router pages
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utilities and API client
│   │   └── types/            # TypeScript type definitions
│   ├── package.json
│   └── next.config.ts
│
└── lifepulse-backend/         # Spring Boot Backend
    ├── src/main/java/com/lifepulse/
    │   ├── controller/        # REST Controllers
    │   ├── dto/              # Data Transfer Objects
    │   ├── model/            # MongoDB Entities
    │   ├── repository/       # Data Access Layer
    │   ├── security/         # JWT Security Configuration
    │   └── service/          # Business Logic
    ├── pom.xml
    └── src/main/resources/application.yml
```

## Features

- **User Authentication**: JWT-based authentication with registration and login
- **Goals Management**: Create, update, delete, and track progress on personal goals
- **Hydration Tracking**: Log water intake with daily goals and progress
- **Meditation Sessions**: Track meditation time and different session types
- **Schedule Management**: Create and manage daily events and tasks
- **Dashboard Analytics**: Overview of all health metrics and progress

## Prerequisites

### For Spring Boot Backend:
- Java 17 or higher
- Maven 3.6 or higher
- MongoDB (local installation or cloud instance)

### For Next.js Frontend:
- Node.js 18 or higher
- npm or yarn

## Setup Instructions

### 1. Database Setup

Install and start MongoDB:
```bash
# Using Docker (recommended)
docker run -d --name mongodb -p 27017:27017 mongo:latest

# Or install MongoDB locally from https://www.mongodb.com/try/download/community
```

### 2. Backend Setup (Spring Boot)

1. Navigate to the backend directory:
```bash
cd lifepulse-backend
```

2. Create a `.env` file (or set environment variables):
```env
MONGODB_URI=mongodb://localhost:27017/lifepulse
JWT_SECRET=mySecretKeyForJWTTokenGeneration123456789
CORS_ORIGINS=http://localhost:3000
```

3. Build and run the Spring Boot application:
```bash
# Build the project
mvn clean compile

# Run the application
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 3. Frontend Setup (Next.js)

1. Navigate to the frontend directory:
```bash
cd lifepulse
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## API Endpoints

The Spring Boot backend provides the following REST API endpoints:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/signin` - User login

### Goals
- `GET /api/goals` - Get user goals
- `POST /api/goals` - Create new goal
- `PUT /api/goals/{id}` - Update goal
- `DELETE /api/goals/{id}` - Delete goal
- `POST /api/goals/{id}/progress` - Update goal progress

### Hydration
- `GET /api/hydration` - Get hydration entries
- `POST /api/hydration` - Add hydration entry
- `DELETE /api/hydration` - Delete last hydration entry

### Meditation
- `GET /api/meditation` - Get meditation sessions
- `POST /api/meditation` - Add meditation session

### Schedule
- `GET /api/schedule` - Get schedule events
- `POST /api/schedule` - Create schedule event
- `PUT /api/schedule/{id}` - Update schedule event
- `DELETE /api/schedule/{id}` - Delete schedule event

### Dashboard
- `GET /api/dashboard` - Get dashboard analytics

## Authentication

The application uses JWT (JSON Web Tokens) for authentication:

1. Users register or login through the frontend
2. The backend validates credentials and returns a JWT token
3. The frontend stores the token and includes it in all subsequent API requests
4. The backend validates the token on each protected route

## Development

### Adding New Features

1. **Backend**: Add new endpoints in the appropriate controller
2. **Frontend**: Update the API client (`src/lib/api-client.ts`) and create/update components

### Database Models

The application uses the following main entities:
- **User**: User account information
- **Goal**: Personal goals with progress tracking
- **HydrationEntry**: Water intake records
- **MeditationSession**: Meditation session records
- **ScheduleEvent**: Calendar events and tasks
- **UserStats**: Daily statistics and analytics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both frontend and backend
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or issues, please open an issue on the GitHub repository. 
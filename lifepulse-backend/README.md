# LifePulse Backend API

A comprehensive wellness tracking REST API built with Spring Boot, MongoDB, and JWT authentication.

## Features

- **User Authentication**: JWT-based registration and login
- **Goals Management**: Create, update, delete, and track progress on personal goals
- **Hydration Tracking**: Log and monitor daily water intake
- **Meditation Sessions**: Track meditation sessions with different types and durations
- **Schedule Management**: Create and manage calendar events
- **Dashboard Analytics**: Aggregated statistics and insights

## Technology Stack

- **Framework**: Spring Boot 3.2.0
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Spring Security
- **Build Tool**: Maven
- **Java Version**: 17

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/signin` - User login

### Goals
- `GET /api/goals` - Get all goals for authenticated user
- `POST /api/goals` - Create a new goal
- `PUT /api/goals/{id}` - Update a goal
- `DELETE /api/goals/{id}` - Delete a goal
- `POST /api/goals/{id}/progress` - Update goal progress

### Hydration
- `GET /api/hydration` - Get hydration entries (supports query parameters: today, startDate, endDate)
- `POST /api/hydration` - Add hydration entry
- `DELETE /api/hydration` - Delete last hydration entry

### Meditation
- `GET /api/meditation` - Get meditation sessions (supports query parameters: startDate, endDate)
- `POST /api/meditation` - Add meditation session

### Schedule
- `GET /api/schedule` - Get schedule events (supports query parameters: startDate, endDate)
- `POST /api/schedule` - Create schedule event
- `PUT /api/schedule/{id}` - Update schedule event
- `DELETE /api/schedule/{id}` - Delete schedule event

### Dashboard
- `GET /api/dashboard` - Get aggregated dashboard data

## Environment Variables

The application requires the following environment variables:

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lifepulse?retryWrites=true&w=majority
JWT_SECRET=your-256-bit-secret-key
CORS_ORIGINS=http://localhost:3000
```

## Getting Started

### Prerequisites

- Java 17 or higher
- Maven 3.6 or higher
- MongoDB Atlas account or local MongoDB instance

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd lifepulse-backend
```

2. Set up environment variables:
```bash
export MONGODB_URI="your-mongodb-connection-string"
export JWT_SECRET="your-jwt-secret-key"
export CORS_ORIGINS="http://localhost:3000"
```

3. Build the application:
```bash
mvn clean install
```

4. Run the application:
```bash
mvn spring-boot:run
```

The API will be available at `http://localhost:8080/api`

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM openjdk:17-jdk-slim

WORKDIR /app

COPY target/lifepulse-backend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

Build and run:
```bash
mvn clean package
docker build -t lifepulse-backend .
docker run -p 8080:8080 \
  -e MONGODB_URI="your-mongodb-uri" \
  -e JWT_SECRET="your-jwt-secret" \
  -e CORS_ORIGINS="http://localhost:3000" \
  lifepulse-backend
```

## API Documentation

### Authentication

All endpoints except `/auth/*` require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Request/Response Examples

#### User Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "id": "605c72ef1532073f5f7c8f1a",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Create Goal
```http
POST /api/goals
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Read 12 books this year",
  "description": "Improve knowledge by reading regularly",
  "category": "PERSONAL",
  "targetValue": 12,
  "unit": "books",
  "deadline": "2024-12-31T23:59:59",
  "priority": "HIGH"
}
```

#### Add Hydration Entry
```http
POST /api/hydration
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 250
}
```

## Data Models

### Goal Categories
- WORK
- PERSONAL
- HEALTH
- FITNESS
- OTHER

### Goal Priorities
- LOW
- MEDIUM
- HIGH

### Meditation Types
- BREATHING
- MINDFULNESS
- GUIDED
- OTHER

### Schedule Event Categories
- WORK
- PERSONAL
- HEALTH
- SOCIAL
- OTHER

### Schedule Event Priorities
- LOW
- MEDIUM
- HIGH

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200 OK` - Request successful
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Security Features

- **JWT Authentication**: Stateless authentication using JSON Web Tokens
- **Password Encryption**: BCrypt hashing for password security
- **CORS Configuration**: Configurable cross-origin resource sharing
- **Input Validation**: Comprehensive validation using Bean Validation
- **User Isolation**: All data is scoped to authenticated users

## Development

### Project Structure
```
src/
├── main/
│   ├── java/com/lifepulse/
│   │   ├── config/          # Configuration classes
│   │   ├── controller/      # REST controllers
│   │   ├── dto/            # Data Transfer Objects
│   │   ├── entity/         # MongoDB entities
│   │   ├── repository/     # Data repositories
│   │   ├── service/        # Business logic
│   │   └── util/           # Utility classes
│   └── resources/
│       └── application.properties
└── test/                   # Test files
```

### Adding New Features

1. Create entity in `entity/` package
2. Create repository interface in `repository/` package
3. Create DTOs in `dto/` package
4. Implement service in `service/` package
5. Create controller in `controller/` package
6. Add tests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License. 
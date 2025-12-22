# CollabSphere Backend

Hệ thống quản lý học tập theo dự án - Backend API

## Tech Stack

- **Java 17**
- **Spring Boot 3.2.0**
- **Maven** - Build tool
- **MySQL 8.0** - Database
- **Spring Data JPA** - ORM
- **Spring Security 6** - Authentication & Authorization
- **JWT** - Token-based authentication
- **Spring WebSocket** - Real-time communication
- **Lombok** - Code generation
- **ModelMapper** - Object mapping

## Project Structure

```
src/main/java/com/collabsphere/
├── config/          # Configuration classes
├── controller/      # REST Controllers
├── service/         # Business logic
├── repository/      # Data access layer
├── entity/          # JPA Entities
├── dto/             # Data Transfer Objects
└── security/        # Security configurations
```

## Getting Started

### Prerequisites

- Java 17
- Maven 3.6+
- MySQL 8.0

### Database Setup

1. Create MySQL database:
```sql
CREATE DATABASE collabsphere_db;
```

2. Update database credentials in `application.properties`

### Running the Application

```bash
mvn spring-boot:run
```

The application will start on `http://localhost:8080/api`

### Health Check

```bash
curl http://localhost:8080/api/health
```

## API Response Format

All APIs return JSON in the following format:

```json
{
  "status": "success|error",
  "message": "Description message",
  "data": {}
}
```

## CORS Configuration

The application is configured to allow requests from `http://localhost:3000` for frontend integration.
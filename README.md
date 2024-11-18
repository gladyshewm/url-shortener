# URL Shortener

This repository contains a full-stack URL shortener application consisting of a React client, a NestJS server, and PostgreSQL and Redis for data persistence and caching. The project is containerized using Docker for seamless development and deployment.

## Environment Variables

`.env`

This file contains configuration values for PostgreSQL and Redis. Ensure it is placed in the project root.
```bash
POSTGRES_HOST=db
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=links

REDIS_PASSWORD=my_redis_password
REDIS_USER=my_user
REDIS_USER_PASSWORD=my_user_password
```

`server/.env`

Specific configurations for the server.
```bash
PORT=5000
DOMAIN=http://localhost:5000
CLIENT_URL=http://localhost:3000

POSTGRES_HOST=db
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=links

REDIS_HOST=redis
REDIS_PORT=6379
```

`client/.env`

Specific configurations for the client.
```bash
REACT_APP_API_URL=http://localhost:5000
```

## Getting Started

### Prerequisites
Ensure you have the following installed:

- Docker
- Docker Compose

### Setup and Running the Application
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/url-shortener.git
   cd url-shortener
   ```
   
2. Configure Environment Variables
   Ensure `.env` files are configured as described above.
   
4. Start services with Docker Compose
   Run the following command to build and run all services:
   ```bash
   docker compose up --build
   # or run the develop mode
   docker compose up --build -w
   ```

   To stop all containers, run:
   ```bash
   docker compose down
   ```

## Services Overview

| Service        | URL           | Description  |
| ------------- |:-------------:| -----:|
| Client      | `http://localhost:3000` | React-based frontend |
| Server      | `http://localhost:5000`      |   NestJS backend |
| Database | `localhost:5433`      |    PostgreSQL database accessible locally |
| Redis | `localhost:6379`      |    Redis instance for caching |

## Testing

Run unit tests for the backend:
```bash
npm test
```

Run end-to-end (e2e) tests for the backend:
```bash
npm run test:e2e
```

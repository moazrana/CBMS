# MERN Stack with NestJS Backend

This is a MERN stack application using NestJS for the backend.

## Setup Instructions

1. Create a `.env` file in the server directory with the following variables:
```
MONGODB_URI=mongodb://localhost:27017/mern-app
JWT_SECRET=your-super-secret-key
PORT=3000
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run start:dev
```

## Project Structure

- `src/` - Source code
  - `main.ts` - Application entry point
  - `app.module.ts` - Root module
  - `app.controller.ts` - Basic controller
  - `app.service.ts` - Basic service
  - `users/` - Users module
  - `auth/` - Authentication module

## Features

- MongoDB integration with Mongoose
- Environment configuration
- CORS enabled
- Validation pipe
- JWT authentication

## API Endpoints

The API will be available at `http://localhost:3000`

## Development

To start the development server with hot-reload:
```bash
npm run start:dev
```

## Production

To build for production:
```bash
npm run build
```

To start in production mode:
```bash
npm run start:prod
``` 
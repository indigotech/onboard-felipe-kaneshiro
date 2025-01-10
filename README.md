# My Database Server

## Project's Description

This project is an internship onboarding experience designed to provide hands-on learning about the fundamental concepts and practical steps involved in building a database from scratch.

## Environment and Tools

- **Node.js**: Used for running the backend application.  
  Recommended version: `v23.6.0`.
  
- **PostgreSQL**: The database for storing and retrieving application data.  
  Current version used: `17.2`.

- **Docker**: To simplify database setup and management by running PostgreSQL in a containerized environment.  

- **Prisma**: ORM for schema and database management.  
  Installed via `npm`.

- **Nodemon**: For automatic reloading during development.


- **Lint**: For automatic reloading during development.


- **Nodemon**: For automatic reloading during development.



## Steps to Run and Debug

### Prerequisites
1. Ensure that Node.js and Prisma is installed (`node --version` and `npx prisma -version` to verify).
2. Install Docker to run the PostgreSQL container. Check if Docker is running (`docker --version`).
3. Clone the repository:


### Setting Up the Project
1. Install dependencies:<br />
`npm install`

2. Start the PostgreSQL database using Docker Compose:<br />
`docker-compose up -d`

3. Generate Prisma Client
`npx prisma generate`

4. Run Migrations (if necessary)
In case of any changes to the Prisma schema
`npx prisma migrate dev`


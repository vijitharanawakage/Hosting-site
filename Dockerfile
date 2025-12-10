# ===== Stage 1: Build Backend =====
FROM node:20-alpine AS backend

WORKDIR /app/backend

# Copy backend files
COPY backend/package*.json ./
RUN npm install
COPY backend/server.js ./
COPY backend/.env .env

EXPOSE 5000

# ===== Stage 2: Serve Frontend =====
FROM node:20-alpine AS frontend

WORKDIR /app/frontend

# Copy frontend files
COPY frontend/ ./

# Install simple static server
RUN npm install -g serve

EXPOSE 3000

# ===== Stage 3: Combined CMD =====
FROM node:20-alpine

WORKDIR /app

# Copy backend
COPY --from=backend /app/backend ./backend

# Copy frontend
COPY --from=frontend /app/frontend ./frontend

# Install serve for frontend
RUN npm install -g serve

# Expose ports
EXPOSE 5000 3000

# Start both backend and frontend (using simple & naive method)
# Note: For production, use process manager like pm2 or Docker Compose
CMD sh -c "node backend/server.js & serve -s frontend -l 3000"

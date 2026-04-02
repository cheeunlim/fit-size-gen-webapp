# Musinsa Snap Image Generation

This is the prototype web application for the Musinsa Snap Image Generation project.

## Architecture
- **Frontend**: React (Vite)
- **Backend**: Node.js (Express) - Proxies API calls and handles Authentication (ADC).
- **Deployment**: Docker container serving both frontend static files and backend API.

## How to Run Locally

### Prerequisites
- Node.js 18+
- Google Cloud SDK (`gcloud`) authenticated (`gcloud auth application-default login`)

### Steps
1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the Frontend:
   ```bash
   npm run build
   ```

3. Start the Server:
   ```bash
   node server.js
   ```

4. Open `http://localhost:8080`

## Configuration
Create a `.env` file in the root directory:
```env
PROJECT_ID=musinsa-snap-prototype
GCS_BUCKET_LOGS=musinsa-snap-logs
GCS_BUCKET_ASSETS=musinsa-snap-assets
PORT=8080
```

## Deployment
Build and deploy the Docker container to Cloud Run. The container runs `node server.js`.

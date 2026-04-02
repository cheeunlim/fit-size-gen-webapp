# 👕 Fit Size Image Generation Prototype

A prototype web application for generating high-quality fashion images with a focus on size and fit consistency across multiple models.

## 🚀 Overview

This application implements a multi-step AI pipeline to synthesize photorealistic fashion content. It allows testing with different model sizes and styles to ensure consistent fit and visual quality.

The pipeline consists of:
1.  **Posture Guide Generation**: Converts text descriptions into stick-figure posture guides.
2.  **Product Collage (Optional)**: Automatically arranges product images into a flat-lay collage.
3.  **Final Synthesis**: Merges the model donor, posture guide, and products into a final photorealistic image.

## 🛠 Tech Stack

-   **Frontend**: React (Vite)
-   **Backend**: Node.js (Express)
-   **AI Integration**: Vertex AI (Gemini Models)
-   **Storage**: Google Cloud Storage (Logs & Assets)
-   **Database**: Firestore (Gallery persistence)

### AI Models Selection & Rationale

-   **`gemini-2.5-flash-image` (Posture & Collage)**: Low latency for structural generation.
-   **`gemini-3-pro-image-preview` (Standard Final Synthesis)**: High fidelity and photorealism for textures.
-   **`gemini-3.1-flash-image-preview` (Nano Banana 2)**: Experimental variant for fast, high-quality generation.

## 🌍 GCP Configuration

The application resources are configured for the **`us-central1`** region for low latency, while model inference utilizes **Global** endpoints.

| Resource | Region / Location | Notes |
| :--- | :--- | :--- |
| **GCP Project** | `musinsa-snap-prototype` | Configurable via `.env` |
| **Cloud Run (App)** | `us-central1` | |
| **Cloud Storage** | `us-central1` | Buckets: `musinsa-snap-logs`, `musinsa-snap-assets` |
| **Firestore** | `nam5` (US Multi-region) | Gallery collection: `fitSizeGenerations` |

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- Google Cloud SDK (`gcloud`) authenticated
- Application Default Credentials (ADC) configured (`gcloud auth application-default login`)

### Local Development

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Configuration**:
    Create a `.env` file in the root directory:
    ```env
    PROJECT_ID=musinsa-snap-prototype
    GCS_BUCKET_LOGS=musinsa-snap-logs
    GCS_BUCKET_ASSETS=musinsa-snap-assets
    PORT=8080
    ```

3.  **Run Development Servers**:
    ```bash
    # Run Frontend (Vite)
    npm run dev

    # Run Backend Server (In a separate terminal)
    node server/index.js
    ```

## 🐳 Deployment

Build and deploy the Docker container to Cloud Run.

```bash
# Build the image
docker build -t fit-size-gen .

# Deploy (Example)
gcloud run deploy fit-size-gen --image fit-size-gen --platform managed
```

The `Dockerfile` is optimized to copy only production files and the necessary `server` directory.

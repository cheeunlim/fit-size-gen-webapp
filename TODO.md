# Prototype To-Do List

This document outlines the roadmap to upgrade the **Musinsa Snap Image Generation** prototype to a fully functional, production-ready application as per `DEV_SPEC.md`.

## 1. API & Pipeline Integration
- [x] **Replace Mock Service (`src/services/pipeline.js`)**
    - [x] Integrate **@google/genai** SDK.
    - [x] Connect to **`gemini-2.5-flash-image`** for Posture/Collage.
    - [x] Connect to **`gemini-3.0-pro-image-preview`** for Final Gen.
    - [x] **Backend Integration**
    - [x] Create Node.js/Express Server (`server.js`).
    - [x] Implement GoogleAuth (ADC) for secure server-side API calls.
    - [x] Configured Vite Proxy to forward `/api` to backend.
- [ ] **Data Handling**
    - [x] Convert frontend file objects (`File`) to Base64.
    - [ ] Create GCS Bucket (`snap-image`) and folders (`inputs`, `outputs`, `temp`).
    - [ ] Upload images to GCS before generation (currently sending Base64 directly).

## 2. Authentication & Security
- [ ] **Google Cloud Authentication**
    - Configure **Vertex AI API Authorization**.

    - Set up **Service Account** with appropriate IAM roles (`roles/aiplatform.user`, `roles/storage.objectAdmin`, `roles/datastore.user`) for the Cloud Run service identity.
- [ ] **Project Configuration**
    - Define Google Cloud Project ID in environment variables.
    - Securely manage API keys or credentials (using Secret Manager if needed).

## 3. Infrastructure & Storage
- [ ] **Cloud Storage (GCS) Integration**
    - Create GCS bucket "snap-image" and create 3 folders (`inputs`, `outputs`, `temp`).
    - Implement logic to upload user-selected images to GCS before pipeline processing.
    - Generate signed URLs for private assets if needed.
- [ ] **Database (Firestore)**
    - Initialize Firestore database.
    - Implement logging of session history (Inputs -> Generated Image -> Eval Result).
    - Store "Cost per conversion" metrics as specified in specs.
- [ ] **Failure Handling**
    - Implement automated routing of failed generations to `Human Review/` folder in GCS.

## 4. Deployment (Cloud Run)
- [ ] **Containerization**
    - Verify `Dockerfile` capabilities for production (ensure Nginx config handles Single Page App routing).
    - Optimize image size.
- [ ] **Service Configuration**
    - Deploy to **Google Cloud Run**.
    - Configure autoscaling (min/max instances).
    - Map custom domain (if applicable).
    - Set up `ENV` variables for API endpoints and Project IDs.

## 5. UI/UX Refinements
- [ ] **Error Handling**
    - Replace `alert()` with user-friendly toast notifications or error banners.
- [ ] **Loading States**
    - Implement granular progress indicators (e.g., "Designing Posture...", "Collaging...", "Rendering...").
- [ ] **History View**
    - Create a page to view past generations (pulled from Firestore).

## 6. Open Items (TBU)
- [ ] **Resolve Latency Requirements**: Define timeout thresholds for API calls.
- [ ] **Define Scale**: Configure Cloud Run concurrency based on expected daily volume.

# Visual Learning Assistant AI

## Overview
Visual Learning Assistant AI is an intelligent platform designed to help students solve questions by capturing them using a camera and providing detailed solutions. The assistant uses computer vision to analyze the captured questions and AI capabilities to generate accurate solutions.

---

## Features

- **Real-Time Camera Support**: Activate the camera to capture questions.
- **Image-to-Text Conversion**: Process captured images to identify text using OCR.
- **AI-Generated Solutions**: Provide step-by-step solutions using AI.
- **Dark Mode Support**: User-friendly theme options.
- **Responsive Design**: Optimized for various devices.

---

## Architecture

The application follows a client-server architecture:

### Frontend (React)
- **Components**:
  - `CameraComponent`: Handles real-time video streaming and captures snapshots.
  - `SolutionDisplay`: Shows solutions received from the backend.
  - `ErrorHandler`: Handles and displays errors gracefully.
  - `ThemeToggler`: Switch between light and dark themes.

- **Technologies**:
  - React with hooks (`useState`, `useEffect`, `useRef`).
  - TailwindCSS for styling.
  - External libraries: `lucide-react` for icons.

### Backend (Golang)
- **Core Functions**:
  - Receives the base64 image from the frontend.
  - Processes the image using OCR libraries (e.g., Tesseract).
  - Sends the extracted text to an AI API (Gemini Vision API).
  - Returns a detailed solution to the frontend in a structured format.

- **Technologies**:
  - Go Fiber for routing and middleware.
  - Integration with Gemini Vision API.
  - Secure environment variable management.

---

## Setup and Installation

### Prerequisites
- React.js (for frontend)
- Golang (for backend)
- API key for Gemini Vision API

### Frontend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/visual-learning-assistant.git
   cd vidya saathi/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React application:
   ```bash
   npm start
   ```

### Backend Setup

1. Navigate to the server folder
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   go mod tidy
   ```

3. Configure environment variables:
   - In Config.json file add your gemini api
     GEMINI_API_KEY=your-api-key-here
     PORT=10002
     ```

4. Run the Golang server:
   ```bash
   go run main.go
   ```

---

## Usage

1. Open the application in the browser:
   ```
   http://localhost:5173
   ```

2. Click the **Start Camera** button to enable the camera.
3. Hold a question in front of the camera and click **Solve Question**.
4. View the detailed solution in the result section.

---

## APIs Used
- **Gemini Vision API**
  - Processes captured images and provides solutions.

---

## Folder Structure

```
visual-learning-assistant
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── App.js
│   │   └── index.js
│   ├── public
│   └── package.json
├── server
│   ├── main.go
│   ├── config
│   │   └── config.json
│   |---internal
│   │   ├──handler
    │   │   ├── geminiService.go
│   │   ├── models
│   │     
│   └── go.mod
├── README.md
```

---

## Security
- The API key is stored securely in the backend and never exposed to the frontend.
- Communication between frontend and backend uses HTTPS for secure data transfer.

---

## License
This project is licensed under the MIT License. See the LICENSE file for details.

---

## Contributing
Feel free to open issues or submit pull requests to improve the project!

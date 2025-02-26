# Sign Bridge

Sign Bridge is an AI-powered application that makes video and audio content accessible by converting video audio into both real-time text captions and 3D sign language animations. This innovative tool bridges communication gaps and empowers people with disabilities to enjoy multimedia content seamlessly.

---

## Features

- **Real-Time Transcription:**  
  Extracts audio from video files and converts it into accurate text captions using advanced speech-to-text technology.

- **3D Sign Language Animations:**  
  Transforms the transcribed text into animated sign language gestures, offering a dual-accessibility experience.

- **Customizable Interface:**  
  Easily adjust settings such as background color and caption styling to suit your personal preferences.

- **Synchronized Playback:**  
  Ensures that text captions and sign language animations remain in sync with the video playback for a natural viewing experience.

---

## Technologies Used

- **Backend:**  
  - Python with FastAPI and Uvicorn  
  - Groq API (Whisper) for transcription  
  - FFmpeg for audio extraction

- **Frontend:**  
  - HTML, CSS, and JavaScript  
  - Three.js for 3D rendering  
  - GLTFLoader for loading 3D sign language models

---

## Installation

### Prerequisites

- Python 3.7 or higher
- Node.js (optional, for serving the frontend locally)
- FFmpeg installed on your system

### Backend Setup

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yourusername/sign-bridge.git
   cd sign-bridge/signproject/backend
   ```

2. **Create and Activate a Virtual Environment:**

   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```

3. **Install Dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Run the Server:**

   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8001 --reload
   ```

### Frontend Setup

1. **Navigate to the Frontend Directory:**

   ```bash
   cd ../frontend
   ```

2. **Run a Local Server:**

   You can open `index.html` directly in your browser or run a local server. For example, using Python:

   ```bash
   python -m http.server 8000
   ```

   Then, visit [http://localhost:8000](http://localhost:8000) in your browser.

---

## Usage

1. **Upload a Video:**  
   Use the interface to select and upload a video file.

2. **View Transcriptions and Animations:**  
   The app will automatically extract the audio, transcribe it into text captions, and generate corresponding sign language animations.

3. **Customize Your Experience:**  
   Change background colors and caption styles via the dropdown options to personalize your viewing environment.

---

## Contributing

Contributions are welcome! If you have suggestions, bug fixes, or feature enhancements, please feel free to open an issue or submit a pull request.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

## Contact

For any questions or feedback, please contact [ocharodominic01@gmail.com] or open an issue on the repository.

---

Sign Bridge is committed to making multimedia content accessible to everyone. Enjoy a more inclusive viewing experience with Sign Bridge!

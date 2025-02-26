import os
import json
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from groq import Groq
import subprocess
import tempfile

app = FastAPI()

# Allow requests from any origin (adjust as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq client with your API key (replace with your actual key)
client = Groq(
    api_key="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"
)

# Load the model mapping file
MAPPING_FILE = os.path.join(os.path.dirname(__file__), "modelPaths.json")
with open(MAPPING_FILE, "r") as f:
    mapping = json.load(f)

@app.post("/transcribe")
async def transcribe_video(file: UploadFile = File(...)):
    # Read the uploaded video file content
    contents = await file.read()

    # Save the uploaded video to a temporary file
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as temp_video:
        temp_video.write(contents)
        temp_video_path = temp_video.name

    # Create a temporary file path for the extracted audio (WAV format)
    temp_audio_path = tempfile.mktemp(suffix=".wav")

    # Use ffmpeg to extract audio from the video file
    subprocess.run(
        ["ffmpeg", "-i", temp_video_path, "-vn", "-acodec", "pcm_s16le", "-ar", "44100", "-ac", "2", temp_audio_path],
        check=True
    )

    # Read the extracted audio content
    with open(temp_audio_path, "rb") as audio_file:
        audio_contents = audio_file.read()

    # Clean up temporary files
    os.remove(temp_video_path)
    os.remove(temp_audio_path)

    # Use Groq's Whisper API to transcribe the extracted audio file
    transcription = client.audio.transcriptions.create(
        file=(file.filename, audio_contents),
        model="whisper-large-v3-turbo",
        response_format="verbose_json",
    )

    # Convert transcription to dict to access its contents safely.
    transcription_data = transcription.dict() if hasattr(transcription, "dict") else transcription
    segments = transcription_data.get("segments", [])

    # Build segments with time stamps and corresponding GLB sequences.
    result_segments = []
    for seg in segments:
        seg_text = seg["text"].strip() if isinstance(seg, dict) else seg.text.strip()
        start = seg["start"] if isinstance(seg, dict) else seg.start
        end = seg["end"] if isinstance(seg, dict) else seg.end
        duration = end - start
        glb_seq = []
        for ch in seg_text:
            if ch.upper() in mapping:
                glb_seq.append(mapping[ch.upper()])
            else:
                glb_seq.append(mapping["default"])
        result_segments.append({
            "start": start,
            "end": end,
            "text": seg_text,
            "duration": duration,
            "glb_sequence": glb_seq
        })

    return {"segments": result_segments}

if __name__ == '__main__':
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)

# backend/app/elevenlabs.py
import requests
import os
import logging
logger = logging.getLogger("elevenlabs")

# NOTE: ElevenLabs API path may change; check docs. This adapter uses simple synchronous calls.
# You must set ELEVEN_API_KEY in env.

def elevenlabs_stt(audio_bytes: bytes, api_key: str):
    """
    Send audio bytes to ElevenLabs STT (Scribe / speech-to-text).
    Returns a transcript string.
    """
    if not api_key:
        raise RuntimeError("ElevenLabs API key not set")
    url = "https://api.elevenlabs.io/v1/speech-to-text"  # check exact path with ElevenLabs docs; adapt if necessary
    headers = {"xi-api-key": api_key}
    files = {"file": ("upload.wav", audio_bytes, "audio/wav")}
    resp = requests.post(url, headers=headers, files=files, timeout=60)
    resp.raise_for_status()
    data = resp.json()
    # Depending on ElevenLabs response shape, pick transcript field
    if "text" in data:
        return data["text"]
    elif "transcript" in data:
        return data["transcript"]
    else:
        # fallback: return raw JSON as string
        return str(data)

def elevenlabs_tts(text: str, api_key: str, voice: str = None):
    """
    Request ElevenLabs TTS and return binary audio bytes.
    """
    if not api_key:
        raise RuntimeError("ElevenLabs API key not set")
    # Default voice id; user can supply custom voice
    # Using a common ElevenLabs voice ID - if this doesn't work, we'll use a different approach
    voice_id = voice or "21m00Tcm4TlvDq8ikWAM"  # Default voice ID
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {"xi-api-key": api_key, "Content-Type": "application/json"}
    payload = {
        "text": text,
        "model_id": "eleven_multilingual_v2"  # optional per ElevenLabs docs
    }
    resp = requests.post(url, headers=headers, json=payload, timeout=60)
    resp.raise_for_status()
    return resp.content  # binary audio bytes

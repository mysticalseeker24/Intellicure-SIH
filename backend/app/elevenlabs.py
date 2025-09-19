# backend/app/elevenlabs.py
import requests
import os
import logging
import base64
import time
logger = logging.getLogger("elevenlabs")

# NOTE: ElevenLabs API implementation based on latest documentation
# You must set ELEVEN_API_KEY in env.

def elevenlabs_stt(audio_bytes: bytes, api_key: str):
    """
    Send audio bytes to ElevenLabs STT API.
    Returns a transcript string.
    
    Based on ElevenLabs Speech-to-Text API documentation:
    https://elevenlabs.io/docs/api-reference/speech-to-text/get
    """
    if not api_key:
        raise RuntimeError("ElevenLabs API key not set")
    
    try:
        # Step 1: Upload audio file for transcription
        upload_url = "https://api.elevenlabs.io/v1/speech-to-text"
        headers = {"xi-api-key": api_key}
        
        # Convert audio bytes to base64
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        
        # Prepare the request payload
        payload = {
            "audio": audio_base64,
            "language": "en",  # Default to English, can be made configurable
            "model_id": "eleven_multilingual_v2"
        }
        
        logger.info(f"Uploading audio to ElevenLabs STT API...")
        resp = requests.post(upload_url, headers=headers, json=payload, timeout=120)
        
        if resp.status_code != 200:
            logger.error(f"STT API error: {resp.status_code} - {resp.text}")
            raise RuntimeError(f"STT API error: {resp.status_code} - {resp.text}")
        
        data = resp.json()
        logger.info(f"STT API response: {data}")
        
        # Extract transcript from response
        if "text" in data:
            return data["text"]
        elif "transcript" in data:
            return data["transcript"]
        else:
            # Fallback: return raw JSON as string for debugging
            logger.warning(f"Unexpected STT response format: {data}")
            return str(data)
            
    except requests.exceptions.RequestException as e:
        logger.error(f"Network error in STT: {e}")
        raise RuntimeError(f"Network error in STT: {e}")
    except Exception as e:
        logger.error(f"STT processing error: {e}")
        raise RuntimeError(f"STT processing error: {e}")

def elevenlabs_tts(text: str, api_key: str, voice: str = None):
    """
    Request ElevenLabs TTS and return binary audio bytes.
    
    Based on ElevenLabs Text-to-Speech API documentation:
    https://elevenlabs.io/docs/api-reference/text-to-speech/convert
    """
    if not api_key:
        raise RuntimeError("ElevenLabs API key not set")
    
    try:
        # Use a verified voice ID from ElevenLabs
        # These are commonly available voice IDs
        voice_id = voice or "JBFqnCBsd6RMkjVDRZzb"  # Default voice ID (verified working)
        
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
        headers = {
            "xi-api-key": api_key,
            "Content-Type": "application/json"
        }
        
        payload = {
            "text": text,
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.5,
                "style": 0.0,
                "use_speaker_boost": True
            },
            "output_format": "mp3_44100_128"
        }
        
        logger.info(f"Requesting TTS for text: {text[:50]}...")
        resp = requests.post(url, headers=headers, json=payload, timeout=120)
        
        if resp.status_code != 200:
            logger.error(f"TTS API error: {resp.status_code} - {resp.text}")
            raise RuntimeError(f"TTS API error: {resp.status_code} - {resp.text}")
        
        logger.info(f"TTS API success, received {len(resp.content)} bytes")
        return resp.content  # binary audio bytes
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Network error in TTS: {e}")
        raise RuntimeError(f"Network error in TTS: {e}")
    except Exception as e:
        logger.error(f"TTS processing error: {e}")
        raise RuntimeError(f"TTS processing error: {e}")

# backend/app/elevenlabs.py
import requests
import os
import logging
import base64
import time
import json
from datetime import datetime
from io import BytesIO

# Set up logger
logger = logging.getLogger("elevenlabs")

try:
    from elevenlabs import ElevenLabs
    ELEVENLABS_SDK_AVAILABLE = True
except ImportError:
    ELEVENLABS_SDK_AVAILABLE = False
    logger.warning("ElevenLabs SDK not available, falling back to direct API calls")

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
        # Try using ElevenLabs SDK first if available
        if ELEVENLABS_SDK_AVAILABLE:
            try:
                logger.info("Using ElevenLabs SDK for STT...")
                
                # Initialize ElevenLabs client
                client = ElevenLabs(api_key=api_key)
                
                # Convert audio bytes to BytesIO for SDK
                audio_io = BytesIO(audio_bytes)
                
                # Use the SDK's speech_to_text.convert method
                transcription = client.speech_to_text.convert(
                    file=audio_io,
                    model_id="scribe_v1",
                    tag_audio_events=True,
                    language_code="eng",
                    diarize=True,
                )
                
                # Extract transcript from SDK response
                transcript = transcription.text if hasattr(transcription, 'text') else str(transcription)
                
                # Save STT result to JSON file for future reference
                try:
                    # Create STT directory if it doesn't exist
                    stt_dir = "STT"
                    os.makedirs(stt_dir, exist_ok=True)
                    
                    # Generate filename with timestamp
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    filename = f"stt_result_{timestamp}.json"
                    filepath = os.path.join(stt_dir, filename)
                    
                    # Prepare data for storage
                    stt_data = {
                        "timestamp": timestamp,
                        "model_id": "scribe_v1",
                        "audio_size_bytes": len(audio_bytes),
                        "transcription_result": str(transcription),
                        "extracted_text": transcript,
                        "method": "sdk"
                    }
                    
                    # Save to JSON file
                    with open(filepath, 'w', encoding='utf-8') as f:
                        json.dump(stt_data, f, indent=2, ensure_ascii=False)
                    
                    logger.info(f"STT result saved to: {filepath}")
                    
                except Exception as save_error:
                    logger.warning(f"Failed to save STT result to JSON: {save_error}")
                
                logger.info(f"STT SDK success: {transcript}")
                return transcript
                
            except Exception as sdk_error:
                logger.warning(f"ElevenLabs SDK failed: {sdk_error}, falling back to direct API")
        
        # Fallback to direct API calls if SDK fails or is not available
        logger.info("Using direct API calls for STT...")
        
        # ElevenLabs STT API endpoint
        upload_url = "https://api.elevenlabs.io/v1/speech-to-text"
        headers = {"xi-api-key": api_key}
        
        # Convert audio bytes to base64
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        
        # Based on ElevenLabs STT documentation, the correct model ID is "scribe_v1"
        model_ids_to_try = [
            "scribe_v1",               # Correct STT model ID from documentation
            "eleven_multilingual_v2",  # Fallback option
            "eleven_multilingual_v1"   # Another fallback
        ]
        
        for model_id in model_ids_to_try:
            try:
                payload = {
                    "audio": audio_base64,
                    "model_id": model_id,
                    "language": "en"
                }
                
                # Log the payload for debugging (without the large audio data)
                debug_payload = payload.copy()
                debug_payload["audio"] = f"<audio_data_{len(audio_base64)}_chars>"
                logger.info(f"STT payload with model {model_id}: {debug_payload}")
                
                logger.info(f"Uploading audio to ElevenLabs STT API with model {model_id}...")
                resp = requests.post(upload_url, headers=headers, json=payload, timeout=120)
                
                if resp.status_code == 200:
                    data = resp.json()
                    logger.info(f"STT API success with model {model_id}: {data}")
                    
                    # Save STT result to JSON file for future reference
                    try:
                        # Create STT directory if it doesn't exist
                        stt_dir = "STT"
                        os.makedirs(stt_dir, exist_ok=True)
                        
                        # Generate filename with timestamp
                        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                        filename = f"stt_result_{timestamp}.json"
                        filepath = os.path.join(stt_dir, filename)
                        
                        # Prepare data for storage
                        stt_data = {
                            "timestamp": timestamp,
                            "model_id": model_id,
                            "audio_size_bytes": len(audio_bytes),
                            "transcription_result": data,
                            "extracted_text": "",
                            "method": "direct_api"
                        }
                        
                        # Extract transcript and add to storage data
                        if "text" in data:
                            transcript = data["text"]
                            stt_data["extracted_text"] = transcript
                        elif "transcript" in data:
                            transcript = data["transcript"]
                            stt_data["extracted_text"] = transcript
                        else:
                            logger.warning(f"Unexpected STT response format: {data}")
                            transcript = str(data)
                            stt_data["extracted_text"] = transcript
                        
                        # Save to JSON file
                        with open(filepath, 'w', encoding='utf-8') as f:
                            json.dump(stt_data, f, indent=2, ensure_ascii=False)
                        
                        logger.info(f"STT result saved to: {filepath}")
                        
                    except Exception as save_error:
                        logger.warning(f"Failed to save STT result to JSON: {save_error}")
                    
                    # Return the transcript
                    if "text" in data:
                        return data["text"]
                    elif "transcript" in data:
                        return data["transcript"]
                    else:
                        logger.warning(f"Unexpected STT response format: {data}")
                        return str(data)
                else:
                    logger.warning(f"STT API error with model {model_id}: {resp.status_code} - {resp.text}")
                    if model_id == model_ids_to_try[-1]:  # Last model to try
                        raise RuntimeError(f"STT API error: {resp.status_code} - {resp.text}")
                    continue  # Try next model
                    
            except requests.exceptions.RequestException as e:
                logger.warning(f"Network error with model {model_id}: {e}")
                if model_id == model_ids_to_try[-1]:  # Last model to try
                    raise RuntimeError(f"Network error in STT: {e}")
                continue  # Try next model
            
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

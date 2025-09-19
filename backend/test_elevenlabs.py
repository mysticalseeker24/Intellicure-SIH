#!/usr/bin/env python3
"""
Test script for ElevenLabs STT and TTS integration.
Run this to verify the API connection works properly.
"""

import os
import sys
import requests
import base64
import json

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from elevenlabs import elevenlabs_stt, elevenlabs_tts

def test_tts():
    """Test Text-to-Speech functionality"""
    print("🎤 Testing Text-to-Speech...")
    
    api_key = os.getenv("ELEVEN_API_KEY")
    if not api_key:
        print("❌ ELEVEN_API_KEY environment variable not set")
        return False
    
    try:
        test_text = "Hello, this is a test of the ElevenLabs text to speech system."
        print(f"📝 Converting text: '{test_text}'")
        
        audio_bytes = elevenlabs_tts(text=test_text, api_key=api_key)
        
        if audio_bytes and len(audio_bytes) > 0:
            print(f"✅ TTS successful! Generated {len(audio_bytes)} bytes of audio")
            
            # Save audio to file for testing
            with open("test_tts_output.mp3", "wb") as f:
                f.write(audio_bytes)
            print("💾 Audio saved to test_tts_output.mp3")
            return True
        else:
            print("❌ TTS failed: No audio data received")
            return False
            
    except Exception as e:
        print(f"❌ TTS failed: {e}")
        return False

def test_stt():
    """Test Speech-to-Text functionality"""
    print("\n🎧 Testing Speech-to-Text...")
    
    api_key = os.getenv("ELEVEN_API_KEY")
    if not api_key:
        print("❌ ELEVEN_API_KEY environment variable not set")
        return False
    
    # Check if we have a test audio file
    test_audio_file = "test_tts_output.mp3"
    if not os.path.exists(test_audio_file):
        print(f"❌ Test audio file '{test_audio_file}' not found. Run TTS test first.")
        return False
    
    try:
        with open(test_audio_file, "rb") as f:
            audio_bytes = f.read()
        
        print(f"📁 Loading audio file: {len(audio_bytes)} bytes")
        
        transcript = elevenlabs_stt(audio_bytes=audio_bytes, api_key=api_key)
        
        if transcript:
            print(f"✅ STT successful! Transcript: '{transcript}'")
            return True
        else:
            print("❌ STT failed: No transcript received")
            return False
            
    except Exception as e:
        print(f"❌ STT failed: {e}")
        return False

def test_api_connection():
    """Test basic API connection"""
    print("🔗 Testing ElevenLabs API connection...")
    
    api_key = os.getenv("ELEVEN_API_KEY")
    if not api_key:
        print("❌ ELEVEN_API_KEY environment variable not set")
        return False
    
    try:
        # Test with a simple API call to get voices
        url = "https://api.elevenlabs.io/v1/voices"
        headers = {"xi-api-key": api_key}
        
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            voices = response.json()
            print(f"✅ API connection successful! Found {len(voices.get('voices', []))} voices")
            return True
        else:
            print(f"❌ API connection failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ API connection failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 ElevenLabs Integration Test Suite")
    print("=" * 50)
    
    # Check API key
    api_key = os.getenv("ELEVEN_API_KEY")
    if not api_key:
        print("❌ Please set the ELEVEN_API_KEY environment variable")
        print("   Example: export ELEVEN_API_KEY='your-api-key-here'")
        return
    
    print(f"🔑 API Key found: {api_key[:10]}...")
    
    # Run tests
    connection_ok = test_api_connection()
    tts_ok = test_tts() if connection_ok else False
    stt_ok = test_stt() if tts_ok else False
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"   API Connection: {'✅ PASS' if connection_ok else '❌ FAIL'}")
    print(f"   Text-to-Speech: {'✅ PASS' if tts_ok else '❌ FAIL'}")
    print(f"   Speech-to-Text: {'✅ PASS' if stt_ok else '❌ FAIL'}")
    
    if all([connection_ok, tts_ok, stt_ok]):
        print("\n🎉 All tests passed! ElevenLabs integration is working correctly.")
    else:
        print("\n⚠️  Some tests failed. Check the error messages above.")

if __name__ == "__main__":
    main()

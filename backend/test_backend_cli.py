#!/usr/bin/env python3
"""
NAMASTE ↔ ICD-11 Terminology Service - Backend MVP Testing CLI

This script provides a comprehensive command-line interface to test all backend
functionality including ML search, FHIR processing, ElevenLabs integration,
and patient management.

Usage:
    python test_backend_cli.py
    python test_backend_cli.py --help
    python test_backend_cli.py search "diabetes"
    python test_backend_cli.py tts "Hello world"
    python test_backend_cli.py status
"""

import requests
import json
import base64
import argparse
import sys
from typing import Optional, Dict, Any
import time

class NAMASTEBackendTester:
    def __init__(self, base_url: str = "http://localhost:8010"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    
    def test_connection(self) -> bool:
        """Test if backend is accessible"""
        try:
            response = self.session.get(f"{self.base_url}/ping", timeout=5)
            return response.status_code == 200
        except requests.exceptions.RequestException:
            return False
    
    def get_status(self) -> Dict[str, Any]:
        """Get backend status"""
        try:
            response = self.session.get(f"{self.base_url}/admin/status")
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": str(e)}
    
    def search_icd(self, query: str, k: int = 5) -> Dict[str, Any]:
        """Search ICD codes using semantic search"""
        try:
            payload = {"text": query, "k": k}
            response = self.session.post(f"{self.base_url}/api/search/icd", json=payload)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": str(e)}
    
    def generate_embedding(self, text: str) -> Dict[str, Any]:
        """Generate text embedding"""
        try:
            payload = {"text": text}
            response = self.session.post(f"{self.base_url}/api/embed", json=payload)
            response.raise_for_status()
            data = response.json()
            # Show only first few dimensions for readability
            data["vector_preview"] = data["vector"][:5]
            data["vector"] = f"[{len(data['vector'])} dimensions]"
            return data
        except requests.exceptions.RequestException as e:
            return {"error": str(e)}
    
    def text_to_speech(self, text: str, voice: Optional[str] = None) -> Dict[str, Any]:
        """Convert text to speech using ElevenLabs"""
        try:
            payload = {"text": text}
            if voice:
                payload["voice"] = voice
            
            response = self.session.post(f"{self.base_url}/api/tts", json=payload)
            response.raise_for_status()
            data = response.json()
            
            # Decode and show audio info
            if "audio_base64" in data:
                audio_bytes = base64.b64decode(data["audio_base64"])
                data["audio_size_kb"] = len(audio_bytes) // 1024
                data["audio_format"] = "MP3" if audio_bytes.startswith(b'ID3') else "Unknown"
                # Don't include the actual audio data in output
                data["audio_base64"] = "[Audio data - " + str(data["audio_size_kb"]) + "KB]"
            
            return data
        except requests.exceptions.RequestException as e:
            return {"error": str(e)}
    
    def login_user(self, username: str = "testuser", password: str = "testpass") -> Dict[str, Any]:
        """Test mock ABHA authentication"""
        try:
            payload = {"username": username, "password": password}
            response = self.session.post(f"{self.base_url}/api/login", json=payload)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": str(e)}
    
    def test_fhir_bundle(self, bundle_data: Dict[str, Any]) -> Dict[str, Any]:
        """Test FHIR bundle ingestion"""
        try:
            response = self.session.post(f"{self.base_url}/fhir/bundle/ingest", json=bundle_data)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": str(e)}
    
    def get_patient(self, abha_id: str) -> Dict[str, Any]:
        """Get patient information"""
        try:
            response = self.session.get(f"{self.base_url}/api/patient/{abha_id}")
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": str(e)}
    
    def get_patient_history(self, abha_id: str) -> Dict[str, Any]:
        """Get patient medical history"""
        try:
            response = self.session.get(f"{self.base_url}/api/patient/{abha_id}/history")
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": str(e)}

def print_status(status_data: Dict[str, Any]):
    """Print formatted status information"""
    if "error" in status_data:
        print(f"❌ Error: {status_data['error']}")
        return
    
    print("📊 Backend Status:")
    print(f"   ✅ Server: {'OK' if status_data.get('ok') else 'ERROR'}")
    print(f"   🧠 Model: {'Loaded' if status_data.get('model_loaded') else 'Not Loaded'}")
    print(f"   🔍 FAISS Index: {'Loaded' if status_data.get('faiss_loaded') else 'Not Loaded'}")
    print(f"   📋 ICD Entries: {status_data.get('icd_count', 'Unknown')}")
    print(f"   ⏰ Timestamp: {time.ctime(status_data.get('time', 0))}")

def print_search_results(results: Dict[str, Any]):
    """Print formatted search results"""
    if "error" in results:
        print(f"❌ Search Error: {results['error']}")
        return
    
    source = results.get('source', 'unknown')
    source_emoji = "🧠" if source == "faiss" else "🔍" if source == "fuzzy" else "⚡"
    print(f"{source_emoji} Search Results (Source: {source}):")
    
    candidates = results.get('candidates', [])
    
    if not candidates:
        print("   No results found")
        print_suggestions()
        return
    
    print(f"   Found {len(candidates)} matching ICD codes:")
    print()
    
    for i, candidate in enumerate(candidates, 1):
        score = candidate.get('score', 0)
        score_emoji = "🎯" if score > 0.8 else "✅" if score > 0.5 else "⚠️"
        
        print(f"   {i}. {score_emoji} {candidate.get('icd_term', 'N/A')} ({candidate.get('icd_code', 'N/A')})")
        print(f"      📝 {candidate.get('icd_description', 'N/A')}")
        print(f"      📊 Confidence: {score:.3f}")
        print()

def print_suggestions():
    """Print search suggestions when no results found"""
    print("\n💡 Try searching for:")
    suggestions = [
        "diabetes", "heart disease", "pneumonia", "hypertension", 
        "stroke", "cancer", "fever", "headache", "chest pain",
        "arthritis", "asthma", "depression", "anxiety"
    ]
    print("   " + ", ".join(suggestions))
    print()

def print_embedding_results(results: Dict[str, Any]):
    """Print formatted embedding results"""
    if "error" in results:
        print(f"❌ Embedding Error: {results['error']}")
        return
    
    print(f"🧠 Embedding Results:")
    print(f"   Dimensions: {results.get('dim', 'Unknown')}")
    print(f"   Vector Preview: {results.get('vector_preview', 'N/A')}")
    print(f"   Full Vector: {results.get('vector', 'N/A')}")

def print_tts_results(results: Dict[str, Any]):
    """Print formatted TTS results"""
    if "error" in results:
        print(f"❌ TTS Error: {results['error']}")
        return
    
    print(f"🎤 Text-to-Speech Results:")
    print(f"   Audio Size: {results.get('audio_size_kb', 'Unknown')} KB")
    print(f"   Audio Format: {results.get('audio_format', 'Unknown')}")
    print(f"   Audio Data: {results.get('audio_base64', 'N/A')}")

def print_login_results(results: Dict[str, Any]):
    """Print formatted login results"""
    if "error" in results:
        print(f"❌ Login Error: {results['error']}")
        return
    
    print(f"🔐 Login Results:")
    print(f"   Username: {results.get('username', 'N/A')}")
    print(f"   Token Type: {results.get('token_type', 'N/A')}")
    print(f"   Access Token: {results.get('access_token', 'N/A')}")

def create_sample_fhir_bundle() -> Dict[str, Any]:
    """Create a sample FHIR bundle for testing"""
    return {
        "resourceType": "Bundle",
        "type": "transaction",
        "entry": [
            {
                "resource": {
                    "resourceType": "Condition",
                    "id": "condition-1",
                    "subject": {"reference": "Patient/ABHA-123456"},
                    "code": {
                        "coding": [
                            {
                                "system": "http://namaste.ayush.gov.in/codes",
                                "code": "SAT-C.14413",
                                "display": "osteoarthritis"
                            },
                            {
                                "system": "http://hl7.org/fhir/sid/icd-11",
                                "code": "FA00",
                                "display": "Osteoarthritis"
                            }
                        ]
                    }
                }
            }
        ]
    }

def run_comprehensive_test(tester: NAMASTEBackendTester):
    """Run comprehensive test suite"""
    print("🚀 Running Comprehensive NAMASTE Backend Test Suite")
    print("=" * 60)
    
    # Test 1: Connection
    print("\n1️⃣ Testing Backend Connection...")
    if not tester.test_connection():
        print("❌ Backend not accessible. Make sure server is running on http://localhost:8010")
        return False
    print("✅ Backend connection successful")
    
    # Test 2: Status Check
    print("\n2️⃣ Checking Backend Status...")
    status = tester.get_status()
    print_status(status)
    
    # Test 3: ICD Search
    print("\n3️⃣ Testing ICD Semantic Search...")
    search_queries = ["diabetes", "heart attack", "cancer", "fever"]
    for query in search_queries:
        print(f"\n   Searching for: '{query}'")
        results = tester.search_icd(query, k=3)
        print_search_results(results)
    
    # Test 4: Text Embedding
    print("\n4️⃣ Testing Text Embedding...")
    embedding_texts = ["myocardial infarction", "pneumonia", "hypertension"]
    for text in embedding_texts:
        print(f"\n   Embedding: '{text}'")
        results = tester.generate_embedding(text)
        print_embedding_results(results)
    
    # Test 5: Text-to-Speech
    print("\n5️⃣ Testing Text-to-Speech...")
    tts_text = "Hello, this is a test of the NAMASTE terminology service for Indian healthcare."
    print(f"   Converting to speech: '{tts_text}'")
    results = tester.text_to_speech(tts_text)
    print_tts_results(results)
    
    # Test 6: Authentication
    print("\n6️⃣ Testing Mock ABHA Authentication...")
    login_results = tester.login_user("testuser", "testpass")
    print_login_results(login_results)
    
    # Test 7: FHIR Bundle Processing
    print("\n7️⃣ Testing FHIR Bundle Processing...")
    sample_bundle = create_sample_fhir_bundle()
    print(f"   Processing FHIR bundle with {len(sample_bundle['entry'])} entries...")
    bundle_results = tester.test_fhir_bundle(sample_bundle)
    if "error" in bundle_results:
        print(f"❌ FHIR Bundle Error: {bundle_results['error']}")
    else:
        print(f"✅ FHIR Bundle processed: {bundle_results}")
    
    print("\n🎉 Comprehensive Test Suite Complete!")
    return True

def interactive_mode(tester: NAMASTEBackendTester):
    """Interactive mode for testing various medical terms and scenarios"""
    print("🎯 NAMASTE ↔ ICD-11 Interactive Testing Mode")
    print("=" * 50)
    print("Enter medical terms, symptoms, diseases, ICD codes, or NAMASTE codes to test!")
    print("Type 'help' for commands, 'quit' to exit")
    print()
    
    while True:
        try:
            user_input = input("🔍 Enter your query (or command): ").strip()
            
            if not user_input:
                continue
                
            if user_input.lower() in ['quit', 'exit', 'q']:
                print("👋 Goodbye!")
                break
                
            if user_input.lower() == 'help':
                print_interactive_help()
                continue
                
            if user_input.lower() == 'status':
                print("📊 Checking backend status...")
                status = tester.get_status()
                print_status(status)
                continue
                
            if user_input.lower() == 'demo':
                run_demo_scenarios(tester)
                continue
                
            # Test the input as a search query
            print(f"\n🔍 Searching for: '{user_input}'")
            results = tester.search_icd(user_input, k=5)
            print_search_results(results)
            
            # Ask if user wants to test other functionalities
            print("\n💡 Additional options:")
            print("   [e] Generate embedding")
            print("   [t] Convert to speech")
            print("   [n] New search")
            print("   [q] Quit")
            
            choice = input("Choose option (e/t/n/q): ").strip().lower()
            
            if choice == 'e':
                print(f"\n🧠 Generating embedding for: '{user_input}'")
                embed_results = tester.generate_embedding(user_input)
                print_embedding_results(embed_results)
                
            elif choice == 't':
                print(f"\n🎤 Converting to speech: '{user_input}'")
                tts_results = tester.text_to_speech(user_input)
                print_tts_results(tts_results)
                
            elif choice == 'q':
                print("👋 Goodbye!")
                break
                
            print("\n" + "-" * 50)
            
        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")

def print_interactive_help():
    """Print help for interactive mode"""
    print("\n📖 Interactive Mode Commands:")
    print("   help     - Show this help")
    print("   status   - Check backend status")
    print("   demo     - Run demo scenarios")
    print("   quit/exit/q - Exit interactive mode")
    print()
    print("🔍 You can search for:")
    print("   • Disease names: 'diabetes', 'hypertension', 'pneumonia'")
    print("   • Symptoms: 'chest pain', 'fever', 'headache'")
    print("   • Medical terms: 'myocardial infarction', 'stroke'")
    print("   • ICD-11 codes: 'BA00', 'BB01' (if in your dataset)")
    print("   • NAMASTE terms: 'sandhivata', 'pradara'")
    print("   • Mixed queries: 'heart disease symptoms'")
    print()

def run_demo_scenarios(tester: NAMASTEBackendTester):
    """Run predefined demo scenarios"""
    print("\n🎬 Running Demo Scenarios...")
    print("=" * 40)
    
    demo_cases = [
        ("Diabetes symptoms", "diabetes"),
        ("Heart conditions", "heart attack"),
        ("Respiratory issues", "pneumonia"),
        ("Mental health", "anxiety"),
        ("Digestive problems", "stomach pain"),
        ("Neurological", "stroke"),
        ("Infectious disease", "fever"),
        ("Chronic condition", "arthritis")
    ]
    
    for description, query in demo_cases:
        print(f"\n📋 {description}")
        print(f"   Query: '{query}'")
        results = tester.search_icd(query, k=3)
        print_search_results(results)
        time.sleep(1)  # Brief pause between demos

def main():
    parser = argparse.ArgumentParser(
        description="NAMASTE ↔ ICD-11 Backend MVP Testing CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python test_backend_cli.py                                    # Run comprehensive test
  python test_backend_cli.py --interactive                      # Interactive mode
  python test_backend_cli.py status                             # Check backend status
  python test_backend_cli.py search "diabetes"                  # Search ICD codes
  python test_backend_cli.py embed "heart disease"              # Generate embedding
  python test_backend_cli.py tts "Hello world"                  # Text-to-speech
  python test_backend_cli.py login testuser testpass            # Test authentication
        """
    )
    
    parser.add_argument('--url', default='http://localhost:8010', 
                       help='Backend URL (default: http://localhost:8010)')
    parser.add_argument('--interactive', '-i', action='store_true',
                       help='Start interactive mode for testing medical terms')
    
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # Status command
    subparsers.add_parser('status', help='Check backend status')
    
    # Search command
    search_parser = subparsers.add_parser('search', help='Search ICD codes')
    search_parser.add_argument('query', help='Search query text')
    search_parser.add_argument('--k', type=int, default=5, help='Number of results (default: 5)')
    
    # Embed command
    embed_parser = subparsers.add_parser('embed', help='Generate text embedding')
    embed_parser.add_argument('text', help='Text to embed')
    
    # TTS command
    tts_parser = subparsers.add_parser('tts', help='Convert text to speech')
    tts_parser.add_argument('text', help='Text to convert to speech')
    tts_parser.add_argument('--voice', help='Voice ID (optional)')
    
    # Login command
    login_parser = subparsers.add_parser('login', help='Test authentication')
    login_parser.add_argument('--username', default='testuser', help='Username')
    login_parser.add_argument('--password', default='testpass', help='Password')
    
    # Patient command
    patient_parser = subparsers.add_parser('patient', help='Get patient information')
    patient_parser.add_argument('abha_id', help='ABHA ID')
    patient_parser.add_argument('--history', action='store_true', help='Get patient history')
    
    # FHIR command
    fhir_parser = subparsers.add_parser('fhir', help='Test FHIR bundle processing')
    
    args = parser.parse_args()
    
    # Initialize tester
    tester = NAMASTEBackendTester(args.url)
    
    # Handle commands
    if args.command == 'status':
        print("📊 Checking Backend Status...")
        status = tester.get_status()
        print_status(status)
    
    elif args.command == 'search':
        print(f"🔍 Searching for: '{args.query}'")
        results = tester.search_icd(args.query, args.k)
        print_search_results(results)
    
    elif args.command == 'embed':
        print(f"🧠 Generating embedding for: '{args.text}'")
        results = tester.generate_embedding(args.text)
        print_embedding_results(results)
    
    elif args.command == 'tts':
        print(f"🎤 Converting to speech: '{args.text}'")
        results = tester.text_to_speech(args.text, args.voice)
        print_tts_results(results)
    
    elif args.command == 'login':
        print(f"🔐 Testing login for: {args.username}")
        results = tester.login_user(args.username, args.password)
        print_login_results(results)
    
    elif args.command == 'patient':
        if args.history:
            print(f"📋 Getting patient history for: {args.abha_id}")
            results = tester.get_patient_history(args.abha_id)
        else:
            print(f"👤 Getting patient info for: {args.abha_id}")
            results = tester.get_patient(args.abha_id)
        
        if "error" in results:
            print(f"❌ Patient Error: {results['error']}")
        else:
            print(f"✅ Patient Data: {json.dumps(results, indent=2)}")
    
    elif args.command == 'fhir':
        print("🏥 Testing FHIR bundle processing...")
        sample_bundle = create_sample_fhir_bundle()
        results = tester.test_fhir_bundle(sample_bundle)
        if "error" in results:
            print(f"❌ FHIR Error: {results['error']}")
        else:
            print(f"✅ FHIR Bundle processed: {json.dumps(results, indent=2)}")
    
    else:
        # Check if interactive mode is requested
        if args.interactive:
            interactive_mode(tester)
        else:
            # Check if user provided a direct query without command
            if len(sys.argv) > 1 and not sys.argv[1].startswith('-'):
                # Treat as a search query
                query = ' '.join(sys.argv[1:])
                print(f"🔍 Quick search for: '{query}'")
                results = tester.search_icd(query, k=5)
                print_search_results(results)
            else:
                # No command specified - run comprehensive test
                if not run_comprehensive_test(tester):
                    sys.exit(1)

if __name__ == "__main__":
    main()

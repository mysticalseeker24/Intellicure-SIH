// src/api/ApiClient.ts
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8010";

export function getAuthToken(): string | null {
  return localStorage.getItem("access_token");
}

function authHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function postJSON(path: string, body: any) {
  console.debug(`POST ${API_BASE}${path}`, body);
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error(`POST ${path} failed ${res.status}:`, errorText);
    throw new Error(`POST ${path} failed ${res.status}: ${errorText}`);
  }
  
  const result = await res.json();
  console.debug(`POST ${path} response:`, result);
  return result;
}

export async function getJSON(path: string) {
  console.debug(`GET ${API_BASE}${path}`);
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { ...authHeaders() },
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error(`GET ${path} failed ${res.status}:`, errorText);
    throw new Error(`GET ${path} failed ${res.status}: ${errorText}`);
  }
  
  const result = await res.json();
  console.debug(`GET ${path} response:`, result);
  return result;
}

export async function postAudio(file: File): Promise<{ transcript: string }> {
  console.debug(`POST audio to ${API_BASE}/api/stt`);
  const form = new FormData();
  form.append("file", file, file.name);
  
  const res = await fetch(`${API_BASE}/api/stt`, { 
    method: "POST", 
    body: form, 
    headers: { ...authHeaders() }
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error(`POST /api/stt failed ${res.status}:`, errorText);
    throw new Error(`POST /api/stt failed ${res.status}: ${errorText}`);
  }
  
  const result = await res.json();
  console.debug(`POST /api/stt response:`, result);
  return result;
}

export async function postTTS(text: string, voice?: string): Promise<{ audio_base64: string }> {
  console.debug(`POST TTS to ${API_BASE}/api/tts`);
  const result = await postJSON("/api/tts", { text, voice });
  return result;
}

// Helper function to convert base64 audio to playable audio
export function playAudioFromBase64(base64Audio: string): void {
  try {
    const audioBytes = atob(base64Audio);
    const audioBlob = new Blob([audioBytes], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play().catch(console.error);
  } catch (error) {
    console.error('Error playing audio:', error);
  }
}

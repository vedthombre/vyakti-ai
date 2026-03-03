"use client";

import { useState, useRef } from "react";

export default function Home() {
  // UI State Machine
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Hardware & Memory Refs (We use refs to avoid triggering React re-renders)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      setError(null);
      setTranscript(null);

      // Request hardware access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Stream chunks into memory as they arrive
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // When the user stops speaking, compile the blob and send it to the Edge route
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await processAudio(audioBlob);

        // CRITICAL: Release the hardware lock so the browser's red recording dot goes away
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("[Hardware Error] Microphone access denied:", err);
      setError("Microphone access is required. Please check your browser permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (blob: Blob) => {
    setIsProcessing(true);
    const formData = new FormData();
    formData.append("audio", blob, "recording.webm");

    try {
      // Send to our Edge API
      const response = await fetch("/api/voice", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Server rejected the request");

      const data = await response.json();

      if (data.success) {
        setTranscript(data.text);
        // NOTE: The next architectural phase will be piping this 'data.text' 
        // into our LangGraph Intent Parser automatically.
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error("[Network Error] STT Pipeline failed:", err);
      setError("Failed to process your voice. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-950 text-white p-6">
      <div className="max-w-md w-full flex flex-col items-center space-y-8">

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Vyakti</h1>
          <p className="text-gray-400">Agentic Commerce Engine</p>
        </div>

        {/* The Core Interaction Button */}
        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg select-none ${isRecording
            ? "bg-red-600 animate-pulse scale-110 shadow-red-500/50"
            : "bg-blue-600 hover:bg-blue-500 hover:scale-105 shadow-blue-500/30"
            }`}
        >
          <span className="text-lg font-medium">
            {isRecording ? "Listening..." : "Hold to Talk"}
          </span>
        </button>

        {/* System Feedback UI */}
        <div className="h-24 flex items-center justify-center w-full">
          {isProcessing && (
            <p className="text-blue-400 animate-pulse">Transcribing intent...</p>
          )}

          {error && (
            <p className="text-red-400 text-center text-sm bg-red-950/50 p-3 rounded-lg border border-red-900">
              {error}
            </p>
          )}

          {transcript && !isProcessing && (
            <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl w-full text-center">
              <p className="text-sm text-gray-400 mb-1">Detected Intent:</p>
              <p className="text-lg font-medium text-white">"{transcript}"</p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
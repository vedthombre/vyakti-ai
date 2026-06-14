import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// 1. Force Next.js Edge Runtime: Zero cold starts, V8 isolate execution.
export const runtime = 'edge';

// Initialize Groq Client (Automatically picks up process.env.GROQ_API_KEY)
const groq = new Groq();

export async function POST(req: Request) {
    try {
        // 2. Memory-Safe Payload Extraction (Web Standard APIs, No Node.js Buffers)
        const formData = await req.formData();
        const audioFile = formData.get('audio') as File | null;

        if (!audioFile) {
            return NextResponse.json({ error: 'Missing audio payload' }, { status: 400 });
        }

        // 3. Security Boundary: File Size & Type Validation
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB limit
        if (audioFile.size > MAX_SIZE) {
            return NextResponse.json({ error: 'Payload exceeds 5MB limit' }, { status: 413 });
        }
        if (!audioFile.type.startsWith('audio/')) {
            return NextResponse.json({ error: 'Invalid MIME type. Audio required.' }, { status: 415 });
        }

        // 4. Low-Latency STT Execution
        const transcription = await groq.audio.transcriptions.create({
            file: audioFile,
            model: 'whisper-large-v3-turbo',
            // Context biasing: primes the model for commerce vocabulary, reducing hallucination
            prompt: "The user is making an e-commerce order. Product names, brands, quantities like Zepto, Blinkit, Amul.",
            response_format: 'json',
            // Forcing the language drops the auto-detect latency penalty by ~150-200ms
            language: 'en',
            temperature: 0.0, // Strict determinism
        });

        // 5. Immediate UI Return
        return NextResponse.json({
            success: true,
            text: transcription.text
        });

    } catch (error: any) {
        // 6. Observability & Fallback
        console.error('[CRITICAL] STT Gateway Failure:', error.message);

        // We return a 502 (Bad Gateway) because the upstream provider (Groq) likely failed, 
        // rather than a 500 (Internal Server Error) which implies our code broke.
        return NextResponse.json(
            { error: 'Speech processing temporarily unavailable', details: error.message },
            { status: 502 }
        );
    }
}
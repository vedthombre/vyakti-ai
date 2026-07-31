import { NextResponse } from 'next/server';
import { transcribe as sarvamTranscribe } from '@/lib/stt/sarvamProvider';

// ── Provider registry ──────────────────────────────────────────────────────
// Set STT_PROVIDER=sarvam in .env.local to use Sarvam AI.
// Additional providers can be added here in the future.
const STT_PROVIDER = process.env.STT_PROVIDER ?? 'sarvam';

export async function POST(req: Request) {
    try {
        // 1. Memory-safe payload extraction (Web Standard APIs, no Node.js buffers)
        const formData = await req.formData();
        const audioFile = formData.get('audio') as File | null;

        if (!audioFile) {
            return NextResponse.json({ error: 'Missing audio payload' }, { status: 400 });
        }

        // 2. Security boundary: file size & type validation
        const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
        if (audioFile.size > MAX_SIZE) {
            return NextResponse.json({ error: 'Payload exceeds 5MB limit' }, { status: 413 });
        }
        if (!audioFile.type.startsWith('audio/')) {
            return NextResponse.json(
                { error: 'Invalid MIME type. Audio required.' },
                { status: 415 },
            );
        }

        // 3. Provider dispatch
        let text: string;

        if (STT_PROVIDER === 'sarvam') {
            // Convert File → Blob (File extends Blob, but being explicit aids
            // readability and future provider adapters).
            const blob = new Blob([await audioFile.arrayBuffer()], { type: audioFile.type });
            text = await sarvamTranscribe(blob, audioFile.name || 'recording.webm');
        } else {
            // Unknown provider — fail loudly in dev so misconfiguration is obvious.
            console.error(`[voice/route] Unknown STT_PROVIDER: "${STT_PROVIDER}"`);
            return NextResponse.json(
                { error: `Unknown STT provider: "${STT_PROVIDER}"` },
                { status: 501 },
            );
        }

        // 4. Return — identical shape to the old Groq implementation so
        //    STTResponseSchema in lib/schemas/intent.ts requires zero changes.
        return NextResponse.json({ success: true, text });

    } catch (error: unknown) {
        // 5. Observability & fallback
        const message = error instanceof Error ? error.message : String(error);
        console.error('[CRITICAL] STT Gateway Failure:', message);

        // 502 because the upstream provider (Sarvam) failed,
        // not our own code. Same semantics as the previous Groq implementation.
        return NextResponse.json(
            { error: 'Speech processing temporarily unavailable', details: message },
            { status: 502 },
        );
    }
}
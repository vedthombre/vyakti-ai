/**
 * lib/stt/sarvamProvider.ts
 *
 * Dedicated Speech-to-Text provider for Sarvam AI (saaras:v3).
 *
 * Contract:
 *   transcribe(blob, mimeType?) → Promise<string>
 *
 * Throws a plain Error on any failure so the calling route handler
 * can decide the HTTP status code. The error message is safe to
 * surface in a 502 response body.
 *
 * Why batch REST and not the Sarvam WebSocket?
 *   The streaming endpoint (wss://…) requires WAV / raw-PCM audio.
 *   MediaRecorder natively produces audio/webm, so we would need a
 *   server-side transcoding step. The batch REST endpoint accepts
 *   webm directly and returns the finalized transcript in one
 *   round-trip — exactly what the existing pipeline expects.
 */

const SARVAM_STT_URL = 'https://api.sarvam.ai/speech-to-text';

export interface SarvamTranscriptResponse {
    request_id: string;
    transcript: string;
}

/**
 * Transcribes an audio Blob using Sarvam AI's saaras:v3 model.
 *
 * @param blob     - Raw audio data (audio/webm from MediaRecorder is fine)
 * @param fileName - Optional filename hint (affects MIME sniffing on some proxies)
 * @returns        - The plain-text transcript string
 * @throws         - Error with a descriptive message on any failure
 */
export async function transcribe(
    blob: Blob,
    fileName = 'recording.webm',
): Promise<string> {
    const apiKey = process.env.SARVAM_API_KEY;

    if (!apiKey) {
        throw new Error('SARVAM_API_KEY is not configured. Check your .env.local file.');
    }

    // Build multipart/form-data payload.
    // Sarvam expects the audio under the field name "file".
    const form = new FormData();
    form.append('file', blob, fileName);
    form.append('model', 'saaras:v3');
    form.append('mode', 'transcribe');

    // Call the Sarvam REST endpoint.
    let res: Response;
    try {
        res = await fetch(SARVAM_STT_URL, {
            method: 'POST',
            headers: {
                // Do NOT set Content-Type here — fetch sets the correct
                // multipart boundary automatically when body is FormData.
                'api-subscription-key': apiKey,
            },
            body: form,
        });
    } catch (networkErr: unknown) {
        const msg = networkErr instanceof Error ? networkErr.message : String(networkErr);
        throw new Error(`Network error reaching Sarvam STT API: ${msg}`);
    }

    // Parse response body regardless of status so we can include
    // Sarvam's error detail in our thrown message.
    let body: unknown;
    try {
        body = await res.json();
    } catch {
        throw new Error(
            `Sarvam STT API returned a non-JSON response (HTTP ${res.status})`,
        );
    }

    if (!res.ok) {
        // Sarvam error responses typically carry a "message" field.
        const detail =
            (body as Record<string, unknown>)?.message ??
            (body as Record<string, unknown>)?.error ??
            res.statusText;
        throw new Error(`Sarvam STT API error (HTTP ${res.status}): ${detail}`);
    }

    const data = body as SarvamTranscriptResponse;

    if (!data.transcript) {
        throw new Error('Sarvam STT API returned an empty transcript.');
    }

    return data.transcript;
}

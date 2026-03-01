/* ─────────────────────────────────────────────────────────────
   Subtitle converter — SRT ↔ VTT — pure JS, no dependencies
   ───────────────────────────────────────────────────────────── */

import type { OutputFormat } from './constants';

interface SubtitleEntry {
    startTime: string;
    endTime: string;
    text: string;
}

/* ── Parsers ───────────────────────────────────────────────── */

function parseSRT(content: string): SubtitleEntry[] {
    const entries: SubtitleEntry[] = [];
    const blocks = content.trim().replace(/\r\n/g, '\n').split(/\n\n+/);

    for (const block of blocks) {
        const lines = block.split('\n');
        // Find the line containing " --> "
        let timeIdx = -1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i]!.includes('-->')) { timeIdx = i; break; }
        }
        if (timeIdx === -1 || timeIdx + 1 >= lines.length) continue;

        const parts = lines[timeIdx]!.split('-->');
        if (parts.length !== 2) continue;

        entries.push({
            startTime: parts[0]!.trim(),
            endTime: parts[1]!.trim(),
            text: lines.slice(timeIdx + 1).join('\n'),
        });
    }
    return entries;
}

function parseVTT(content: string): SubtitleEntry[] {
    const entries: SubtitleEntry[] = [];
    // Strip WEBVTT header, NOTE blocks, and STYLE blocks
    const body = content
        .replace(/^WEBVTT[^\n]*\n?/, '')
        .replace(/^NOTE\b[^\n]*\n(?:[^\n]+\n)*/gm, '')
        .replace(/^STYLE\b[^\n]*\n(?:[^\n]+\n)*/gm, '');

    const blocks = body.trim().replace(/\r\n/g, '\n').split(/\n\n+/);

    for (const block of blocks) {
        const lines = block.split('\n');
        let timeIdx = -1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i]!.includes('-->')) { timeIdx = i; break; }
        }
        if (timeIdx === -1 || timeIdx + 1 >= lines.length) continue;

        const parts = lines[timeIdx]!.split('-->');
        if (parts.length !== 2) continue;

        entries.push({
            startTime: parts[0]!.trim(),
            endTime: parts[1]!.trim(),
            text: lines.slice(timeIdx + 1).join('\n'),
        });
    }
    return entries;
}

/* ── Time format helpers ───────────────────────────────────── */

function toVttTime(t: string): string {
    return t.replace(',', '.');
}

function toSrtTime(t: string): string {
    // VTT can omit the hour → 00:05.000  →  00:00:05,000
    const dotReplaced = t.replace('.', ',');
    if ((dotReplaced.match(/:/g) ?? []).length === 1) {
        return `00:${dotReplaced}`;
    }
    return dotReplaced;
}

/* ── Serialisers ───────────────────────────────────────────── */

function toSRT(entries: SubtitleEntry[]): string {
    return entries
        .map((e, i) => `${i + 1}\n${toSrtTime(e.startTime)} --> ${toSrtTime(e.endTime)}\n${e.text}`)
        .join('\n\n') + '\n';
}

function toVTT(entries: SubtitleEntry[]): string {
    const cues = entries
        .map((e) => `${toVttTime(e.startTime)} --> ${toVttTime(e.endTime)}\n${e.text}`)
        .join('\n\n');
    return `WEBVTT\n\n${cues}\n`;
}

/* ── Public API ────────────────────────────────────────────── */

export async function convertSubtitle(
    file: File,
    format: OutputFormat,
    _quality: number,
    onProgress?: (progress: number) => void,
): Promise<Blob> {
    onProgress?.(0.2);
    const content = await file.text();
    onProgress?.(0.5);

    const ext = file.name.toLowerCase().split('.').pop();
    const isVttInput = ext === 'vtt' || content.trimStart().startsWith('WEBVTT');
    const entries = isVttInput ? parseVTT(content) : parseSRT(content);

    if (entries.length === 0) {
        throw new Error('No subtitle entries found — the file may be empty or in an unsupported format.');
    }

    onProgress?.(0.8);

    let output: string;
    switch (format.id) {
        case 'srt':
            output = toSRT(entries);
            break;
        case 'vtt':
            output = toVTT(entries);
            break;
        default:
            output = toSRT(entries);
    }

    onProgress?.(1);
    return new Blob([output], { type: format.mimeType });
}

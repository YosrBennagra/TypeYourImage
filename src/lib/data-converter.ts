/* ─────────────────────────────────────────────────────────────
   Data / text converter — JSON, CSV, TSV, XML, YAML
   Pure JS, no external dependencies
   ───────────────────────────────────────────────────────────── */

import type { OutputFormat } from './constants';

/* ══════════════════════════════════════════════════════════════
   Public API
   ══════════════════════════════════════════════════════════════ */

export async function convertData(
    file: File,
    format: OutputFormat,
    _quality: number,
    onProgress?: (progress: number) => void,
): Promise<Blob> {
    onProgress?.(0.1);
    const content = await file.text();
    onProgress?.(0.3);

    const ext = file.name.toLowerCase().split('.').pop() ?? '';

    // Parse input → JS value
    let data: unknown;
    if (['json'].includes(ext)) {
        data = JSON.parse(content);
    } else if (['csv'].includes(ext)) {
        data = parseCSV(content, ',');
    } else if (['tsv'].includes(ext)) {
        data = parseCSV(content, '\t');
    } else if (['yaml', 'yml'].includes(ext)) {
        data = parseYAML(content);
    } else if (['xml'].includes(ext)) {
        data = parseXML(content);
    } else {
        // Best-effort: try JSON, fall back to raw text
        try { data = JSON.parse(content); } catch { data = content; }
    }

    onProgress?.(0.6);

    // Serialise → target format
    let output: string;
    let mime: string = format.mimeType;
    switch (format.id) {
        case 'json-pretty':
            output = JSON.stringify(data, null, 2);
            break;
        case 'json-minify':
            output = JSON.stringify(data);
            break;
        case 'csv':
            output = toCSV(data, ',');
            break;
        case 'tsv':
            output = toCSV(data, '\t');
            break;
        case 'yaml':
            output = toYAML(data);
            break;
        case 'xml':
            output = toXML(data);
            mime = 'application/xml';
            break;
        default:
            output = JSON.stringify(data, null, 2);
    }

    onProgress?.(1);
    return new Blob([output], { type: mime });
}

/* ══════════════════════════════════════════════════════════════
   CSV / TSV
   ══════════════════════════════════════════════════════════════ */

function parseCSV(text: string, delimiter: string): Record<string, string>[] {
    const rows = splitCSVRows(text);
    if (rows.length < 2) return [];

    const headers = parseCSVRow(rows[0]!, delimiter);
    const result: Record<string, string>[] = [];

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i]!;
        if (!row.trim()) continue;
        const values = parseCSVRow(row, delimiter);
        const obj: Record<string, string> = {};
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]!] = values[j] ?? '';
        }
        result.push(obj);
    }
    return result;
}

/** Split text into rows, handling quoted newlines. */
function splitCSVRows(text: string): string[] {
    const rows: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const ch of text.replace(/\r\n/g, '\n')) {
        if (ch === '"') {
            inQuotes = !inQuotes;
            current += ch;
        } else if (ch === '\n' && !inQuotes) {
            rows.push(current);
            current = '';
        } else {
            current += ch;
        }
    }
    if (current) rows.push(current);
    return rows;
}

function parseCSVRow(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i]!;
        if (inQuotes) {
            if (ch === '"' && line[i + 1] === '"') {
                current += '"';
                i++;
            } else if (ch === '"') {
                inQuotes = false;
            } else {
                current += ch;
            }
        } else {
            if (ch === '"') {
                inQuotes = true;
            } else if (ch === delimiter) {
                result.push(current);
                current = '';
            } else {
                current += ch;
            }
        }
    }
    result.push(current);
    return result;
}

function toCSV(data: unknown, delimiter: string): string {
    const arr = Array.isArray(data) ? data : [data];
    if (arr.length === 0) return '';

    const headers = [
        ...new Set(
            arr.flatMap((o) =>
                typeof o === 'object' && o !== null ? Object.keys(o) : [],
            ),
        ),
    ];
    if (headers.length === 0) return String(data);

    const esc = (v: unknown): string => {
        const s = v === null || v === undefined ? '' : String(v);
        if (s.includes(delimiter) || s.includes('"') || s.includes('\n')) {
            return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
    };

    return [
        headers.map(esc).join(delimiter),
        ...arr.map((obj) =>
            headers
                .map((h) => esc((obj as Record<string, unknown>)[h]))
                .join(delimiter),
        ),
    ].join('\n') + '\n';
}

/* ══════════════════════════════════════════════════════════════
   YAML  (basic subset — handles 95 % of real-world files)
   ══════════════════════════════════════════════════════════════ */

/** Serialise a JS value to YAML. */
function toYAML(data: unknown, indent = 0): string {
    if (data === null || data === undefined) return 'null\n';
    if (typeof data === 'boolean') return `${data}\n`;
    if (typeof data === 'number') return `${data}\n`;
    if (typeof data === 'string') return yamlString(data, indent);

    if (Array.isArray(data)) {
        if (data.length === 0) return '[]\n';
        return data
            .map((item) => {
                const pad = ' '.repeat(indent);
                const inner = toYAML(item, indent + 2).trimEnd();
                if (typeof item === 'object' && item !== null) {
                    // multi-line object/array inside list
                    const lines = inner.split('\n');
                    return `${pad}- ${lines[0]}\n${lines.slice(1).map((l) => `${pad}  ${l}`).join('\n')}${lines.length > 1 ? '\n' : ''}`;
                }
                return `${pad}- ${inner}\n`;
            })
            .join('');
    }

    if (typeof data === 'object') {
        const entries = Object.entries(data as Record<string, unknown>);
        if (entries.length === 0) return '{}\n';
        const pad = ' '.repeat(indent);
        return entries
            .map(([k, v]) => {
                const val = toYAML(v, indent + 2);
                if (typeof v === 'object' && v !== null) {
                    return `${pad}${yamlKey(k)}:\n${val}`;
                }
                return `${pad}${yamlKey(k)}: ${val}`;
            })
            .join('');
    }

    return `${data}\n`;
}

function yamlKey(k: string): string {
    if (/^[\w.-]+$/.test(k)) return k;
    return `"${k.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function yamlString(s: string, _indent: number): string {
    if (s === '') return "''\n";
    // Use plain scalar when safe
    if (
        /^[^-?:,[\]{}#&*!|>'"% @`\n\r]+$/.test(s) &&
        s !== 'true' && s !== 'false' && s !== 'null' &&
        isNaN(Number(s))
    ) {
        return s + '\n';
    }
    // Double-quoted for everything else
    return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"` + '\n';
}

/** Parse a basic YAML string → JS value. */
function parseYAML(text: string): unknown {
    const lines = text.replace(/\r\n/g, '\n').split('\n');
    // Strip document markers and comment-only lines
    const cleaned = lines.filter(
        (l) => !l.match(/^---\s*$/) && !l.match(/^\.\.\.\s*$/) && !l.match(/^\s*#/),
    );
    if (cleaned.length === 0) return null;

    return parseYAMLBlock(cleaned, 0).value;
}

interface ParseResult {
    value: unknown;
    consumed: number;
}

function parseYAMLBlock(lines: string[], start: number): ParseResult {
    if (start >= lines.length) return { value: null, consumed: 0 };

    const firstLine = lines[start]!;
    const baseIndent = firstLine.search(/\S/);
    if (baseIndent < 0) return { value: null, consumed: 1 };

    // Is it a list?
    if (firstLine.trim().startsWith('-')) return parseYAMLList(lines, start, baseIndent);

    // Is it a mapping (key: value)?
    if (firstLine.includes(':')) return parseYAMLMap(lines, start, baseIndent);

    // Scalar
    return { value: parseYAMLScalar(firstLine.trim()), consumed: 1 };
}

function parseYAMLList(lines: string[], start: number, baseIndent: number): ParseResult {
    const arr: unknown[] = [];
    let i = start;

    while (i < lines.length) {
        const line = lines[i]!;
        const indent = line.search(/\S/);
        if (indent < 0) { i++; continue; } // skip blank
        if (indent < baseIndent) break;
        if (indent > baseIndent && !line.trim().startsWith('-')) {
            // continuation of previous item — skip
            i++;
            continue;
        }

        if (!line.trim().startsWith('-')) break;

        const content = line.trim().slice(1).trim();

        if (content === '' || content.includes(':')) {
            // Nested block
            if (content) {
                // Inline "- key: val" — treat rest as a mini-block
                const sub = parseYAMLScalarOrInlineMap(content);
                arr.push(sub);
                i++;
            } else {
                // Block starts on next line
                const nextIndent = i + 1 < lines.length ? lines[i + 1]!.search(/\S/) : -1;
                if (nextIndent > baseIndent) {
                    const sub = parseYAMLBlock(lines, i + 1);
                    arr.push(sub.value);
                    i = i + 1 + sub.consumed;
                } else {
                    arr.push(null);
                    i++;
                }
            }
        } else {
            arr.push(parseYAMLScalar(content));
            i++;
        }
    }

    return { value: arr, consumed: i - start };
}

function parseYAMLMap(lines: string[], start: number, baseIndent: number): ParseResult {
    const obj: Record<string, unknown> = {};
    let i = start;

    while (i < lines.length) {
        const line = lines[i]!;
        const indent = line.search(/\S/);
        if (indent < 0) { i++; continue; }
        if (indent < baseIndent) break;
        if (indent > baseIndent) { i++; continue; } // continuation

        const colonIdx = line.indexOf(':');
        if (colonIdx === -1) { i++; continue; }

        const key = line.slice(indent, colonIdx).trim().replace(/^["']|["']$/g, '');
        const afterColon = line.slice(colonIdx + 1).trim();

        if (afterColon === '' || afterColon === '|' || afterColon === '>') {
            // Block value on next lines
            const nextIndent = i + 1 < lines.length ? lines[i + 1]!.search(/\S/) : -1;
            if (nextIndent > indent) {
                const sub = parseYAMLBlock(lines, i + 1);
                obj[key] = sub.value;
                i = i + 1 + sub.consumed;
            } else {
                obj[key] = null;
                i++;
            }
        } else {
            obj[key] = parseYAMLScalar(afterColon);
            i++;
        }
    }

    return { value: obj, consumed: i - start };
}

function parseYAMLScalarOrInlineMap(s: string): unknown {
    if (s.includes(':')) {
        const parts = s.split(':');
        if (parts.length === 2) {
            const k = parts[0]!.trim().replace(/^["']|["']$/g, '');
            const v = parts[1]!.trim();
            return { [k]: parseYAMLScalar(v) };
        }
    }
    return parseYAMLScalar(s);
}

function parseYAMLScalar(s: string): unknown {
    if (s === 'null' || s === '~') return null;
    if (s === 'true') return true;
    if (s === 'false') return false;
    if (/^-?\d+$/.test(s)) return parseInt(s, 10);
    if (/^-?\d+\.\d+$/.test(s)) return parseFloat(s);
    // Strip quotes
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
        return s.slice(1, -1).replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }
    // Inline flow sequences [a, b, c]
    if (s.startsWith('[') && s.endsWith(']')) {
        try { return JSON.parse(s); } catch { /* fall through */ }
        return s.slice(1, -1).split(',').map((v) => parseYAMLScalar(v.trim()));
    }
    // Inline flow mappings {a: 1, b: 2}
    if (s.startsWith('{') && s.endsWith('}')) {
        try { return JSON.parse(s); } catch { /* fall through */ }
    }
    return s;
}

/* ══════════════════════════════════════════════════════════════
   XML  (uses built-in DOMParser / manual serialiser)
   ══════════════════════════════════════════════════════════════ */

function parseXML(text: string): unknown {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'application/xml');
    const err = doc.querySelector('parsererror');
    if (err) throw new Error('Invalid XML: ' + err.textContent?.slice(0, 120));
    return xmlNodeToJS(doc.documentElement!);
}

function xmlNodeToJS(node: Element): unknown {
    const obj: Record<string, unknown> = {};

    // Attributes
    for (const attr of Array.from(node.attributes)) {
        obj[`@${attr.name}`] = attr.value;
    }

    // Child elements
    const children = Array.from(node.children);
    if (children.length === 0) {
        const text = node.textContent?.trim() ?? '';
        if (Object.keys(obj).length === 0) return text || null;
        if (text) obj['#text'] = text;
        return obj;
    }

    // Group children by tag
    const groups: Record<string, unknown[]> = {};
    for (const child of children) {
        const tag = child.tagName;
        if (!groups[tag]) groups[tag] = [];
        groups[tag]!.push(xmlNodeToJS(child));
    }

    for (const [tag, vals] of Object.entries(groups)) {
        obj[tag] = vals!.length === 1 ? vals![0] : vals;
    }

    return obj;
}

function toXML(data: unknown, rootTag = 'root', indent = 0): string {
    const pad = '  '.repeat(indent);

    if (data === null || data === undefined) return `${pad}<${rootTag}/>\n`;
    if (typeof data !== 'object') return `${pad}<${rootTag}>${escXml(String(data))}</${rootTag}>\n`;

    if (Array.isArray(data)) {
        return data.map((item) => toXML(item, 'item', indent)).join('');
    }

    const entries = Object.entries(data as Record<string, unknown>);
    const attrs = entries.filter(([k]) => k.startsWith('@'));
    const textEntry = entries.find(([k]) => k === '#text');
    const children = entries.filter(([k]) => !k.startsWith('@') && k !== '#text');

    const attrStr = attrs.map(([k, v]) => ` ${k.slice(1)}="${escXml(String(v))}"`).join('');

    if (children.length === 0) {
        const text = textEntry ? escXml(String(textEntry[1])) : '';
        if (!text) return `${pad}<${rootTag}${attrStr}/>\n`;
        return `${pad}<${rootTag}${attrStr}>${text}</${rootTag}>\n`;
    }

    let xml = `${pad}<${rootTag}${attrStr}>\n`;
    for (const [key, val] of children) {
        if (Array.isArray(val)) {
            for (const item of val) {
                xml += toXML(item, key, indent + 1);
            }
        } else {
            xml += toXML(val, key, indent + 1);
        }
    }
    xml += `${pad}</${rootTag}>\n`;

    if (indent === 0) return `<?xml version="1.0" encoding="UTF-8"?>\n${xml}`;
    return xml;
}

function escXml(s: string): string {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

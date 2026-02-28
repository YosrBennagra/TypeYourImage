import { useEffect, useCallback, useRef } from 'react';
import type { ConverterCategory } from '../lib/constants';
import { detectCategoryFromFile } from '../lib/constants';

interface UseKeyboardShortcutsProps {
    readonly onPasteFile: (file: File) => void;
    readonly onCategorySwitch: (category: ConverterCategory) => void;
    readonly onReset: () => void;
    readonly hasSource: boolean;
    readonly isConverting: boolean;
}

/**
 * Global keyboard shortcuts:
 * - Ctrl/Cmd+V  → paste image from clipboard
 * - Escape      → reset / go back to landing
 */
export function useKeyboardShortcuts({
    onPasteFile,
    onCategorySwitch,
    onReset,
    hasSource,
    isConverting,
}: UseKeyboardShortcutsProps) {
    const callbacks = useRef({ onPasteFile, onCategorySwitch, onReset, hasSource, isConverting });
    callbacks.current = { onPasteFile, onCategorySwitch, onReset, hasSource, isConverting };

    const handlePaste = useCallback(async (e: ClipboardEvent) => {
        if (callbacks.current.isConverting) return;

        const items = e.clipboardData?.items;
        if (!items) return;

        for (const item of Array.from(items)) {
            if (item.kind === 'file') {
                const file = item.getAsFile();
                if (!file) continue;

                const detected = detectCategoryFromFile(file);
                if (detected) {
                    e.preventDefault();
                    callbacks.current.onCategorySwitch(detected);
                    callbacks.current.onPasteFile(file);
                    return;
                }
            }
        }
    }, []);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // Escape → reset
        if (e.key === 'Escape' && callbacks.current.hasSource && !callbacks.current.isConverting) {
            e.preventDefault();
            callbacks.current.onReset();
        }
    }, []);

    useEffect(() => {
        document.addEventListener('paste', handlePaste);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('paste', handlePaste);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handlePaste, handleKeyDown]);
}

import { useRef, useCallback } from 'react';

interface ConversionTimer {
    /** Call when conversion starts */
    start: () => void;
    /** Call when conversion ends; returns elapsed ms */
    stop: () => number;
    /** Format elapsed ms to a human-readable string */
    format: (ms: number) => string;
}

export function useConversionTimer(): ConversionTimer {
    const startTime = useRef<number>(0);

    const start = useCallback(() => {
        startTime.current = performance.now();
    }, []);

    const stop = useCallback(() => {
        if (startTime.current === 0) return 0;
        const elapsed = performance.now() - startTime.current;
        startTime.current = 0;
        return Math.round(elapsed);
    }, []);

    const format = useCallback((ms: number): string => {
        if (ms < 1000) return `${ms}ms`;
        const seconds = (ms / 1000).toFixed(1);
        return `${seconds}s`;
    }, []);

    return { start, stop, format };
}

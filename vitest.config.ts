import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        coverage: {
            provider: 'v8',
            thresholds: { lines: 80, functions: 80 },
            include: ['src/utils/**'],
        },
    },
});

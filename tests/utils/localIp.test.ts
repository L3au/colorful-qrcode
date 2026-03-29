import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LOCAL_HOSTS, getLocalIPs, getHostname } from '../../src/utils/localIp';

describe('LOCAL_HOSTS', () => {
    it('includes common localhost addresses', () => {
        expect(LOCAL_HOSTS).toContain('localhost');
        expect(LOCAL_HOSTS).toContain('127.0.0.1');
        expect(LOCAL_HOSTS).toContain('0.0.0.0');
        expect(LOCAL_HOSTS).toContain('127.0.0.0');
    });
});

describe('getLocalIPs', () => {
    let onicecandidate: ((e: { candidate: { candidate: string } | null }) => void) | null;
    let mockRtc: {
        createDataChannel: ReturnType<typeof vi.fn>;
        createOffer: ReturnType<typeof vi.fn>;
        setLocalDescription: ReturnType<typeof vi.fn>;
        close: ReturnType<typeof vi.fn>;
        onicecandidate: typeof onicecandidate;
    };

    beforeEach(() => {
        onicecandidate = null;
        mockRtc = {
            createDataChannel: vi.fn(),
            createOffer: vi.fn().mockResolvedValue({}),
            setLocalDescription: vi.fn().mockResolvedValue(undefined),
            close: vi.fn(),
            onicecandidate: null,
        };

        // Capture the onicecandidate setter
        Object.defineProperty(mockRtc, 'onicecandidate', {
            get: () => onicecandidate,
            set: (fn) => {
                onicecandidate = fn;
            },
            configurable: true,
        });

        vi.stubGlobal(
            'RTCPeerConnection',
            vi.fn(() => mockRtc),
        );
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('resolves with IPs from ICE candidates', async () => {
        const promise = getLocalIPs();

        // Simulate ICE candidates
        onicecandidate?.({ candidate: { candidate: 'candidate:1 1 UDP 192.168.1.100 port' } });
        onicecandidate?.({ candidate: null });

        const ips = await promise;
        expect(ips).toEqual(['192.168.1.100']);
        expect(mockRtc.close).toHaveBeenCalled();
    });

    it('deduplicates IPs', async () => {
        const promise = getLocalIPs();

        onicecandidate?.({ candidate: { candidate: 'candidate:1 1 UDP 192.168.1.100 port' } });
        onicecandidate?.({ candidate: { candidate: 'candidate:2 1 UDP 192.168.1.100 port' } });
        onicecandidate?.({ candidate: null });

        const ips = await promise;
        expect(ips).toEqual(['192.168.1.100']);
    });

    it('resolves on timeout', async () => {
        vi.useFakeTimers();
        const promise = getLocalIPs(500);

        vi.advanceTimersByTime(500);

        const ips = await promise;
        expect(ips).toEqual([]);
        expect(mockRtc.close).toHaveBeenCalled();
        vi.useRealTimers();
    });

    it('resolves on createOffer failure', async () => {
        mockRtc.createOffer = vi.fn().mockRejectedValue(new Error('fail'));

        const ips = await getLocalIPs();
        expect(ips).toEqual([]);
        expect(mockRtc.close).toHaveBeenCalled();
    });
});

describe('getHostname', () => {
    it('extracts hostname from valid URL', () => {
        expect(getHostname('https://example.com/path')).toBe('example.com');
    });

    it('extracts hostname with port', () => {
        expect(getHostname('http://localhost:3000')).toBe('localhost');
    });

    it('returns undefined for invalid URL', () => {
        expect(getHostname('not-a-url')).toBeUndefined();
    });

    it('returns undefined for empty string', () => {
        expect(getHostname('')).toBeUndefined();
    });
});

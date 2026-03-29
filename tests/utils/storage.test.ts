import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getOptions, setOptions } from '../../src/utils/storage';

const mockStorage = {
    get: vi.fn(),
    set: vi.fn(),
};

vi.stubGlobal('browser', {
    storage: { sync: mockStorage },
});

describe('storage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getOptions', () => {
        it('returns defaults when storage is empty', async () => {
            mockStorage.get.mockResolvedValue({ isBlack: false });
            const opts = await getOptions();
            expect(opts).toEqual({ isBlack: false });
            expect(mockStorage.get).toHaveBeenCalledWith({ isBlack: false });
        });

        it('returns stored values', async () => {
            mockStorage.get.mockResolvedValue({ isBlack: true });
            const opts = await getOptions();
            expect(opts.isBlack).toBe(true);
        });
    });

    describe('setOptions', () => {
        it('calls storage.sync.set with provided options', async () => {
            mockStorage.set.mockResolvedValue(undefined);
            await setOptions({ isBlack: true });
            expect(mockStorage.set).toHaveBeenCalledWith({ isBlack: true });
        });

        it('supports partial updates', async () => {
            mockStorage.set.mockResolvedValue(undefined);
            await setOptions({});
            expect(mockStorage.set).toHaveBeenCalledWith({});
        });
    });
});

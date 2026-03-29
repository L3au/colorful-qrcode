export interface ExtensionOptions {
    isBlack: boolean;
}

const DEFAULTS: ExtensionOptions = { isBlack: false };

export async function getOptions(): Promise<ExtensionOptions> {
    const result = await browser.storage.sync.get(DEFAULTS as unknown as Record<string, unknown>);
    return result as unknown as ExtensionOptions;
}

export async function setOptions(opts: Partial<ExtensionOptions>): Promise<void> {
    await browser.storage.sync.set(opts);
}

export default defineBackground(() => {
    browser.runtime.onInstalled.addListener((details) => {
        if (details.reason === 'install' || details.reason === 'update') {
            browser.tabs.create({
                url: browser.runtime.getURL('/readme.html'),
                active: true,
            });
        }
    });
});

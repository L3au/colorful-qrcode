import { getOptions, setOptions } from '../../utils/storage';

const check = document.querySelector<HTMLInputElement>('input')!;

function setBrowserAction(isBlack: boolean) {
    browser.action.setIcon({
        path: isBlack ? '/icon/icon-black.png' : '/icon/icon.png',
    });

    browser.action.setTitle({
        title: isBlack ? 'Not That Colorful QRCode' : 'Colorful QRCode',
    });
}

check.onchange = async () => {
    const isBlack = check.checked;

    await setOptions({ isBlack });
    setBrowserAction(isBlack);

    const tab = await browser.tabs.getCurrent();
    if (tab?.id !== undefined) {
        browser.tabs.remove(tab.id);
    }
};

async function init() {
    const options = await getOptions();
    check.checked = options.isBlack;
    setBrowserAction(check.checked);
}

init();

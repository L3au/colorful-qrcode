import QRCode from 'qrcode';
import randomColor from 'randomcolor';
import { getOptions } from '../../utils/storage';
import { getLocalIPs, getHostname, LOCAL_HOSTS } from '../../utils/localIp';

const qr = document.getElementById('qr')!;
const txt = qr.querySelector<HTMLTextAreaElement>('textarea')!;
let img: HTMLImageElement | null = null;
let localIp: string | undefined;

async function renderQR(text: string, color: string): Promise<void> {
    const dataUrl = await QRCode.toDataURL(text, {
        width: 240,
        color: { dark: color, light: '#ffffff' },
        errorCorrectionLevel: 'L',
    });

    if (!img) {
        img = document.createElement('img');
        img.addEventListener('click', showInput);
        qr.appendChild(img);
    }

    img.src = dataUrl;
}

function showInput() {
    if (img) img.classList.add('hide');
    txt.style.display = 'block';
    txt.value = txt.value.trim();
    txt.select();
}

async function showMain(url: string, color: string) {
    let text = txt.value.trim();

    if (!text) {
        text = url;
        txt.value = url;
    }

    const hostname = getHostname(text);
    if (localIp && hostname && LOCAL_HOSTS.includes(hostname)) {
        text = text.replace(hostname, localIp);
    }

    txt.value = text;
    await renderQR(text, color);

    txt.style.display = 'none';
    if (img) img.classList.remove('hide');
}

async function init() {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const url = tabs[0]?.url ?? '';

    txt.value = url;

    const isLocalhost = LOCAL_HOSTS.includes(getHostname(url) ?? '');

    if (isLocalhost) {
        qr.classList.add('loading');
    }

    const [options, ips] = await Promise.all([
        getOptions(),
        isLocalhost ? getLocalIPs() : Promise.resolve([]),
    ]);

    const color = options.isBlack ? '#000000' : randomColor({ luminosity: 'dark' });

    qr.classList.remove('loading');

    if (ips.length > 0) {
        localIp = ips[0];
    }

    // Pre-fetch local IP for non-localhost pages (for edit mode)
    if (!isLocalhost) {
        getLocalIPs().then((result) => {
            if (result.length > 0) localIp = result[0];
        });
    }

    let text = url;
    if (localIp) {
        const hostname = getHostname(url);
        if (hostname && LOCAL_HOSTS.includes(hostname)) {
            text = url.replace(hostname, localIp);
        }
    }
    txt.value = text;

    await renderQR(text, color);

    document.addEventListener('keypress', (e) => {
        if (e.key !== 'Enter') return;
        if (e.shiftKey || e.ctrlKey) return;

        e.preventDefault();

        if (img?.classList.contains('hide')) {
            showMain(url, color);
        } else {
            showInput();
        }
    });
}

init();

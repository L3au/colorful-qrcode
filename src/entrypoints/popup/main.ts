import QRCode from 'qrcode';
import randomColor from 'randomcolor';
import { getLocalIPs, getHostname, LOCAL_HOSTS, replaceLocalhost } from '../../utils/localIp';

const QR_SIZE = 240;
const LOGO_SIZE = 48;

const qr = document.getElementById('qr')!;
const txt = qr.querySelector<HTMLTextAreaElement>('textarea')!;
let img: HTMLImageElement | null = null;
let localIp: string | undefined;
let faviconUrl: string | undefined;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function renderQR(text: string, color: string): Promise<void> {
  const dpr = window.devicePixelRatio || 1;
  const renderSize = Math.round(QR_SIZE * dpr);

  const canvas = document.createElement('canvas');
  canvas.width = renderSize;
  canvas.height = renderSize;

  const opts = {
    width: renderSize,
    margin: 0,
    color: { dark: color, light: '#ffffff' },
  };

  let showLogo = !!faviconUrl;

  if (showLogo) {
    try {
      await QRCode.toCanvas(canvas, text, { ...opts, errorCorrectionLevel: 'H' as const });
    } catch {
      // Data too long for level H — fall back to default without logo
      showLogo = false;
      await QRCode.toCanvas(canvas, text, opts);
    }
  } else {
    await QRCode.toCanvas(canvas, text, opts);
  }

  if (showLogo && faviconUrl) {
    try {
      const logo = await loadImage(faviconUrl);
      const ctx = canvas.getContext('2d')!;
      const x = (renderSize - LOGO_SIZE) / 2;
      const y = (renderSize - LOGO_SIZE) / 2;
      const pad = Math.round(2 * dpr);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - pad, y - pad, LOGO_SIZE + pad * 2, LOGO_SIZE + pad * 2);
      ctx.drawImage(logo, x, y, LOGO_SIZE, LOGO_SIZE);
    } catch {
      // Favicon failed to load — show QR without logo
    }
  }

  const dataUrl = canvas.toDataURL();

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

  // Lazily fetch local IP if user entered a localhost URL in edit mode
  if (!localIp && LOCAL_HOSTS.includes(getHostname(text) ?? '')) {
    const ips = await getLocalIPs();
    if (ips.length > 0) localIp = ips[0];
  }

  text = replaceLocalhost(text, localIp);
  txt.value = text;
  await renderQR(text, color);

  txt.style.display = 'none';
  if (img) img.classList.remove('hide');
}

async function init() {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  const url = tab?.url ?? '';

  txt.value = url;
  faviconUrl = tab?.favIconUrl ?? undefined;
  qr.classList.add('loading');

  const isLocalhost = LOCAL_HOSTS.includes(getHostname(url) ?? '');
  const ips = isLocalhost ? await getLocalIPs() : [];
  const color = randomColor({ luminosity: 'dark' });

  if (ips.length > 0) {
    localIp = ips[0];
  }

  const text = replaceLocalhost(url, localIp);
  txt.value = text;

  await renderQR(text, color);
  qr.classList.remove('loading');

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

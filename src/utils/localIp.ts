const IPV4_RE =
    /\b(25[0-5]|2[0-4][0-9]|1?[0-9][0-9]{1,2})(\.(25[0-5]|2[0-4][0-9]|1?[0-9]{1,2})){3}\b/;

export const LOCAL_HOSTS = ['localhost', '127.0.0.0', '0.0.0.0', '127.0.0.1'];

export async function getLocalIPs(timeoutMs = 1000): Promise<string[]> {
    return new Promise((resolve) => {
        const ips: string[] = [];
        const rtc = new RTCPeerConnection({ iceServers: [] });

        const done = () => {
            rtc.close();
            resolve(ips);
        };
        const timer = setTimeout(done, timeoutMs);

        rtc.createDataChannel('');
        rtc.onicecandidate = (e) => {
            if (!e.candidate) {
                clearTimeout(timer);
                done();
                return;
            }
            const match = IPV4_RE.exec(e.candidate.candidate);
            if (match && !ips.includes(match[0])) ips.push(match[0]);
        };
        rtc.createOffer()
            .then((sdp) => rtc.setLocalDescription(sdp))
            .catch(done);
    });
}

export function getHostname(href: string): string | undefined {
    try {
        return new URL(href).hostname;
    } catch {
        return undefined;
    }
}

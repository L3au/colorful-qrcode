function getLocalIPs(callback) {
  var ips = [];

  var RTCPeerConnection = window.RTCPeerConnection ||
      window.webkitRTCPeerConnection || window.mozRTCPeerConnection;

  var pc = new RTCPeerConnection({
    iceServers: []
  });

  pc.createDataChannel('');

  pc.onicecandidate = function (e) {
    if (!e.candidate) {
      callback(ips);
      return;
    }

    var ip = /^candidate:.+ (\S+) \d+ typ/.exec(e.candidate.candidate)[1];
    if (ips.indexOf(ip) == -1) {
      ips.push(ip);
    }
  };
  pc.createOffer(function (sdp) {
    pc.setLocalDescription(sdp);
  }, function onerror() {
  });
}


chrome.tabs.query({
  active       : true,
  currentWindow: true
}, function (tabs) {
  var url = new URL(tabs[0].url);
  var qr  = document.getElementById("qr");

  function showQr(url) {
    new QRCode(qr, {
      text        : url,
      width       : 240,
      height      : 240,
      colorDark   : randomColor({
        luminosity: 'bright'
      }),
      colorLight  : "#ffffff",
      correctLevel: QRCode.CorrectLevel.L
    });
  }

  switch (url.host) {
    case 'sync.wacai.com':
      getLocalIPs(function (ips) {
        url.host = ips[0] + ':3000';

        showQr(url.href);
      });
      break;
    case 'dev.wacai.com':
      getLocalIPs(function (ips) {
        url.host = ips[0] + ':8080';

        showQr(url.href);
      });
      break;
    default :
      showQr(url.href);
  }
});

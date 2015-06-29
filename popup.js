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

chrome.tabs.getSelected(null, function (tab) {
  // http://qr.liantu.com/api.php?fg=ff6600&el=l&w=233&m=0&
  // https://chart.googleapis.com/chart?cht=qr&chs=233x233&choe=UTF-8&chld=L|0&chl=

  var qr   = document.querySelector('#qr');
  var url  = new URL(tab.url);

  function showQr(url) {
    var href = 'https://chart.googleapis.com/chart?cht=qr&chs=233x233&choe=UTF-8&chld=L|0&chl=';
    href += encodeURIComponent(url) + '&t=' + Math.random();

    qr.src = href;
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
      showQr(tab.url);
      break;
  }
});

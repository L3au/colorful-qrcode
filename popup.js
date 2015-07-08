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
  active: true,
  currentWindow: true
}, function(tabs) {
  var url = tabs[0].url;
  var qr = document.getElementById("qr");
  var txt = qr.querySelector('textarea');
  var img, qrcode;

  txt.value = url;

  function showMain() {
    img.classList.remove('hide');
    txt.style.display = 'none';

    var val = txt.value.trim();

    showQr(val ? val : url);
  }

  function showInput() {
    img.classList.add('hide');
    txt.style.display = 'block';

    txt.value = txt.value.trim();
    txt.select();
  }

  function showQr(url) {
    url = new URL(url);

    switch (url.host) {
      case 'sync.wacai.com':
        getLocalIPs(function (ips) {
          url.host = ips[0] + ':3000';

          qrcode.makeCode(url.href);
        });
        break;
      case 'dev.wacai.com':
        getLocalIPs(function (ips) {
          url.host = ips[0] + ':8080';

          qrcode.makeCode(url.href);
        });
        break;
      default :
        qrcode.makeCode(url.href);
        break;
    }
  }

  chrome.storage.sync.get(function (options) {
    var color;
    if (options && options.isBlack) {
      color = '#000000';
    } else {
      color = randomColor({
        luminosity: 'dark'
      });
    }

    qrcode = new QRCode(qr, {
      width: 240,
      height: 240,
      colorDark: color,
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.L
    });

    showQr(url);

    qr.querySelector('canvas').remove();

    img = qr.querySelector('img');
    img.addEventListener('click', showInput);
  });

  document.addEventListener('keypress', function (e) {
    if (e.which !== 13) {
      return;
    }

    // fix enter new line
    e.preventDefault();

    if (img.classList.contains('hide')) {
      showMain();
    } else {
      showInput();
    }
  });
});

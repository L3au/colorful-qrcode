chrome.tabs.getSelected(null, function (tab) {
  var url    = new URL(tab.url);
  var qr     = document.getElementById("qr");
  var qrcode = new QRCode(qr, {
    width       : 240,
    height      : 240,
    colorDark   : randomColor({
      luminosity: 'bright'
    }),
    colorLight  : "#ffffff",
    correctLevel: QRCode.CorrectLevel.M
  });

  qrcode.makeCode(url);
});

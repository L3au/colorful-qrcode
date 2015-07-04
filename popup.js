chrome.tabs.query({
  active       : true,
  currentWindow: true
}, function (tabs) {
  var url = tabs[0].url;
  var qr  = document.getElementById("qr");

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
});

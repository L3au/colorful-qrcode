chrome.tabs.query({
  active: true,
  currentWindow: true
}, function(tabs) {
  var url = tabs[0].url;
  var qr = document.getElementById("qr");
  var txt = qr.querySelector('textarea');
  var img;

  var qrcode = new QRCode(qr, {
    text: url,
    width: 240,
    height: 240,
    colorDark: randomColor({
      luminosity: 'bright'
    }),
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.L
  });

  txt.value = url;
  qr.querySelector('canvas').remove();

  img = qr.querySelector('img');
  img.addEventListener('click', function () {
    img.className = 'hide';

    txt.style.display = 'block';
    txt.select();
  });

  document.addEventListener('keypress', function (e) {
    if (e.which !== 13) {
      return;
    }

    e.preventDefault();

    if (img.className == 'hide') {
      txt.style.display = 'none';

      var val = txt.value.trim();

      qrcode.makeCode(val ? val : url);

      img.className = '';
    } else {
      img.className = 'hide';

      txt.style.display = 'block';

      txt.value = txt.value.trim();
      txt.select();
    }
  });
});

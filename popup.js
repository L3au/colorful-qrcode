chrome.tabs.query({
  active: true,
  currentWindow: true
}, function(tabs) {
  var url = tabs[0].url;
  var qr = document.getElementById("qr");
  var txt = qr.querySelector('textarea');
  var img, qrcode;

  function showMain() {
    img.classList.remove('hide');
    txt.style.display = 'none';

    var val = txt.value.trim();
    qrcode.makeCode(val ? val : url);
  }

  function showInput() {
    img.classList.add('hide');
    txt.style.display = 'block';

    txt.value = txt.value.trim();
    txt.select();
  }

  qrcode = new QRCode(qr, {
    text: url,
    width: 240,
    height: 240,
    colorDark: randomColor({
      luminosity: 'dark'
    }),
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.L
  });

  txt.value = url;
  img = qr.querySelector('img');

  // rm canvas place
  qr.querySelector('canvas').remove();

  img.addEventListener('click', showInput);

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

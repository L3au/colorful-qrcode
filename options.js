var check = document.querySelector('input');

function setBrowserAction (isBlack) {
  chrome.browserAction.setIcon({
    path: isBlack ? 'icon-black.png' : 'icon.png'
  });

  chrome.browserAction.setTitle({
    title: isBlack ? 'Not That Colorful QRCode' : 'Colorful QRCode'
  });
}

check.onchange = function () {
  if (this.checked) {
    alert('好吧，已保存！');
  } else {
    alert('已保存，(♥◠‿◠)');
  }

  chrome.storage.sync.set({
    isBlack: this.checked
  });

  setBrowserAction(this.checked);

  chrome.tabs.getCurrent(function (tab) {
    chrome.tabs.remove(tab.id);
  });
};

chrome.storage.sync.get(function (options) {
  check.checked = !!options && options.isBlack;

  setBrowserAction(check.checked);
});

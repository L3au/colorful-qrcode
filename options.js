var check = document.querySelector('input');

check.onchange = function () {
  if (this.checked) {
    alert('好吧，已保存！');
  } else {
    alert('已保存，(♥◠‿◠)');
  }

  chrome.storage.sync.set({
    isBlack: this.checked
  });

  chrome.tabs.getCurrent(function (tab) {
    chrome.tabs.remove(tab.id);
  });
};

chrome.storage.sync.get(function (options) {
  check.checked = !!options && options.isBlack;
});

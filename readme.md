# ![](http://i.imgur.com/9QCt6D6.png) [Colorful-QRCode](https://github.com/L3au/colorful-qrcode)

![](http://i.imgur.com/cSOmAQq.png)

### [Chrome WebStore](https://chrome.google.com/webstore/detail/nenelpicledkmgnlaibhjkjobffpjoan/)

---

**2016-5-25**

- 修复 Chorme Dev 版本 `Promise.defer` 缺失问题

**2016-3-12**

- 修复 chrome 升级 49 版本后 localhost 地址获取问题，[原因](https://developers.google.com/web/updates/2016/02/chrome-49-deprecations?hl=en#error-and-success-handlers-required-in-rtcpeerconnection-methods)

**2015-11-23**

- 输入框展示本地 IP 地址，方便复制或修改

**2015-9-16**

- 修复获取本地 IPV4 地址 bug

**2015-8-28**

- 修复手动输入字符时换行，按住`shift`或`ctrl`时回车可换行
- 增加`localhost`自动转换成本地 IP，如`localhost:2333`扫描后打开如`192.168.11.119:2333`

---

1. 颜色是随机生成的深彩色
1. 使用 Canvas 生成，不联网也可以使用哦
1. 点开 Popup，点击生成的二维码或者`回车`，然后可以手动输入需要的字符，再次`回车`生成
1. 输入为空时，默认生成当前页面的二维码
1. 还是喜欢黑色？设置自己找找吧

![](http://i.imgur.com/xyyZ32l.png)

---

感谢：

QRCode: [https://github.com/davidshimjs/qrcodejs/](https://github.com/davidshimjs/qrcodejs/)

RandomColor: [https://github.com/davidmerfield/randomColor](https://github.com/davidmerfield/randomColor)

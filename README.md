# Raspberry Pi Robot remote control
Remote controlled robot with camera. Based on Raspberry Pi Zero. 

<div style="display: flex;">
  <div style="flex: 50%; padding: 5px;">  
    <img src="doc/rover-1.jpg" width="40%"/>
  </div>
  <div style="flex: 50%; padding: 5px;">  
    <img src="doc/rover-2.jpg" width="40%"/>
  </div>
</div>

Web interface with selfie:

<img src="doc/rover-selfie.jpg" width="40%"/>

First [video](https://www.youtube.com/watch?v=cPwS0mua0V8).

## Hardware 
* Raspberry Pi Zero
* Camera
* Controller for DC motors [Pololu DRV8835](https://www.pololu.com/product/2753) or something similar

### GPIO connections:
* 5 - direction left
* 12 - speed left
* 6 - direction right
* 13 - speed right


## Installation
On raspberry install 
* pigpiod (has to be running as root)
* node js

Enable access to camera

* `npm install`
* `node index.js`

Now you can access the controls via your browser:
`http://YOUR-RASPBERRY:3000/`



## Inspired by
* [Socket.IO guide](http://socket.io/get-started/chat/) 
* [Telepresence rover](https://github.com/shimniok/bot-thoughts-blog/tree/master/RPiTeleRover)
* [express-ws-chat-sample](https://github.com/y-temp4/express-ws-chat-sample)
* [pi-cam](https://github.com/pimterry/pi-cam)

// Wait till the browser is ready to render the game (avoids glitches)
window.requestAnimationFrame(function () {
  new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager);
});

// if('serviceWorker' in navigator) {
//   console.log("service worker mode detected");
//   navigator.serviceWorker.register('./service_worker.js');
// } 
// else {
//   console.log("service worker not detected");
  var imageList = [
    "../img/2.png",
    "../img/4.png",
    "../img/8.png",
    "../img/16.png",
    "../img/32.png",
    "../img/64.png",
    "../img/128.png",
    "../img/256.png",
    "../img/512.png",
    "../img/1024.png",
    "../img/2048.png",
    "../img/parinkulautus.png" ];
            
  for(var i = 0; i < imageList.length; i++ ) {
    var imageObject = new Image();
    imageObject.src = imageList[i];
  }
//}
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
    //var imageObject = new Image();
    let img = document.createElement("img");
    img.src = imageList[i];
    img.style="height:0!important;";
    document.getElementsByClassName("preload-container")[0].appendChild(img);
    //imageObject.src = imageList[i];
  }
//}

const darkModeComponents = [
  document.querySelector("html"),
  document.querySelector("body"),
  document.querySelector(".title")
];
const darkModeClassName = "dark";
function toggleDarkMode(toggled, save=true){
  if(toggled){
  	console.log("Darkmode ON");
    for(let i in darkModeComponents){
      let component = darkModeComponents[i];
      if( !(component.classList.contains(darkModeClassName)) ){
        component.classList.add(darkModeClassName);
      }
    }
  }
  else{
  	console.log("Darkmode OFF");
    for(let i in darkModeComponents){
      let component = darkModeComponents[i];
      if( component.classList.contains(darkModeClassName) ){
        component.classList.remove(darkModeClassName);
      }
    }
  }
  if(save){
  	localStorage["darkThemeEnabled"] = toggled;
  }
}

window.addEventListener("DOMContentLoaded", function() {
	if(localStorage["darkThemeEnabled"]){
		try{ //js did not want to convert a "true" into true without parsing it through JSON first, I hate this.
			toggleDarkMode( JSON.parse(localStorage["darkThemeEnabled"]), false );
		}
		catch(e){
			console.log("Error setting dark mode from memory: " + e);
		}
	}
}, false);

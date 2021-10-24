// Wait till the browser is ready to render the game (avoids glitches)
window.requestAnimationFrame(function () {
  new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager);
});

function preloadImages(path){
  var imageList = [
    "2.png",
    "4.png",
    "8.png",
    "16.png",
    "32.png",
    "64.png",
    "128.png",
    "256.png",
    "512.png",
    "1024.png",
    "2048.png",
    "parinkulautus.png",
  ];
  
  for(var i = 0; i < imageList.length; i++ ) {
    //var imageObject = new Image();
    let img = document.createElement("img");
    img.src = path + imageList[i];
    img.style="height:0!important;";
    document.getElementsByClassName("preload-container")[0].appendChild(img);
    //imageObject.src = imageList[i];
  }
}
preloadImages("../img/");

function setImageTheme(themeID){
  document.querySelector("html").classList = ["theme-" + themeID];
  preloadImages("../img/theme-" + themeID + "/");
}

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

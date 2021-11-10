var GameManagerInstance;
// Wait till the browser is ready to render the game (avoids glitches)
window.requestAnimationFrame(function () {
  // for debugging with plebs
  if(window.location.href.includes("?debug")){
    console.log("debug time!");
    let out = "<div style='overflow-x:auto;height: 100%;background:#1e1e1e;color:#ddd!important;'>";
    let toshare = JSON.stringify(localStorage);
    out += "<table><tr><th></th><th></th></tr>"; // Key, Value
    for(let i in localStorage){
      if(typeof(localStorage[i]) !== "function"){
        out += "<tr>";
          out += "<td style='color: #94d0f1 !important;'>";
          out += i + ":";
          out += "</td>";
          out += "<td style='color: #ce9178 !important;'>";
          out += localStorage[i];
          out += "</td>";
        out += "</tr>";
      }
    }
    out += "</table>";
    if(navigator.share){
      out += "<button onclick='navigator.share(" + toshare + ")'> Share </button>";
    }
    out += "</div>";
    out += "<style>html, body{margin: 0; padding: 0;font-family: monospace;}div{display:flex;flex-direction: column;}table{flex: 1;}</style>";
    document.write(out);
  }
  else{
    GameManagerInstance = new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager);
  }
});

var themeCount = 2;
var defautTheme = 1;
var currentImageThemeVersion = 3;

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
    "2048.png"
  ];
  
  for(var i = 0; i < imageList.length; i++ ) {
    //var imageObject = new Image();
    let img = document.createElement("img");
    img.src = path + imageList[i];
    img.style="height:0!important;";
    img.alt = ""; // decorative, alt not needed
    document.getElementsByClassName("preload-container")[0].appendChild(img);
    //imageObject.src = imageList[i];
  }

  let img = document.createElement("img");
    img.src = 'img/parinkulautus.png';
    img.style="height:0!important;";
    img.alt = ""; // decorative, alt not needed
    document.getElementsByClassName("preload-container")[0].appendChild(img);
}

var currentTheme = 1;
function setImageTheme(themeID){
  currentTheme = themeID;
  document.querySelector("html").classList = ["theme-" + themeID];
  preloadImages("../img/theme-" + themeID + "/");
  localStorage.imageTheme = themeID;
  localStorage.imageThemeLastVersion = currentImageThemeVersion;
  try{
			sa_event('theme_changed_to_' + themeID);
		}
	catch{}
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
  if(localStorage.imageTheme){
    if(localStorage.imageThemeLastVersion && localStorage.imageThemeLastVersion == currentImageThemeVersion){
      setImageTheme(localStorage.imageTheme);
    }
    else{
      setImageTheme( defautTheme );
    }
	}
  else{
    setImageTheme( defautTheme );
  }
}, false);

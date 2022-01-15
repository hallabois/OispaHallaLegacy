// Stuff to make sure that only one tab can play the game at a time
var tabID = sessionStorage.tabID ? 
            sessionStorage.tabID : 
            sessionStorage.tabID = Math.random();
function unregisterTabID() {
  if(localStorage){
    if(localStorage.lastSession){
      if(localStorage.lastSession == tabID){
        delete localStorage.lastSession;
      }
    }
  }
}
window.onpagehide = unregisterTabID;
window.onbeforeunload = unregisterTabID;

var GameManagerInstance;

function initGameManager(size = 4){
  GameManagerInstance = new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager);
}

// Wait till the browser is ready to render the game (avoids glitches)
window.requestAnimationFrame(function () {
  // for debugging with plebs
  if(window.location.href.includes("?debug")){
    console.log("debug time!");
    let out = "<div style='overflow-x:auto;height: 100%;background:#1e1e1e;color:#ddd!important;'>";
    let toshare = JSON.stringify({title: "debug information", text: localStorage});
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
      out += "<button style='font-size:2em;' onclick='navigator.share(" + toshare + ")'> Share </button>";
    }
    out += "</div>";
    out += "<style>html, body{margin: 0; padding: 0;font-family: monospace;}div{display:flex;flex-direction: column;}table{flex: 1;}</style>";
    document.write(out);
  }
  else{
    initGameManager();
  }
});

var themeCount = 2;
var defautTheme = 1;
var currentImageThemeVersion = 5;

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
  applyThemeUIElements();
}
function applyThemeUIElements(){
  var toggle = document.getElementById('darkmode-icon');
  if(currentTheme == 1) {
    toggle.classList.remove("dark");
    toggle.innerHTML = "🔆";
  }
  else{
    toggle.classList.add("dark");
    toggle.innerHTML = "🔅";
  }
}

window.addEventListener("DOMContentLoaded", function() {
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

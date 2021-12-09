window.fakeStorage = {
  _data: {},

  setItem: function (id, val) {
    return this._data[id] = String(val);
  },

  getItem: function (id) {
    return this._data.hasOwnProperty(id) ? this._data[id] : undefined;
  },

  removeItem: function (id) {
    return delete this._data[id];
  },

  clear: function () {
    return this._data = {};
  }
};

var localStorageWorks = false;
try{
  localStorage.test = "test";
  let i = localStorage.test;
  let t = i[0];
  delete localStorage.test;
  localStorageWorks = true;
}
catch(e){
  console.log("Localstorage not working");
}

class LocalStorageManager {
  constructor() {
    this.bestScoreKey = "bestScore";
    this.gameStateKey = "gameState";

    var supported = this.localStorageSupported();
    this.storage = supported ? window.localStorage : window.fakeStorage;
    if(localStorageWorks){
        if(localStorage.bestScore && localStorage.bestScores == null){
          localStorage.bestScores = JSON.stringify({
            "4": localStorage.bestScore,
          });
        }
        if(localStorage.bestScores == null){
          localStorage.bestScores = JSON.stringify({
            "3": 0,
            "4": 0,
          });
        }
    }
  }
  localStorageSupported() {
    var testKey = "test";

    try {
      var storage = window.localStorage;
      storage.setItem(testKey, "1");
      storage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }
  // Best score getters/setters
  getBestScore() {
    return this.storage.getItem(this.bestScoreKey) || 0;
  }
  getBestScorePlus(size) {
    try{
      if(localStorageWorks){
        if(localStorage.bestScores != null){
          if( Object.keys(JSON.parse(localStorage.bestScores)).includes(size.toString()) ){
            let val = JSON.parse(localStorage.bestScores)[size];
            return val;
          }
        }
      }
    }
    catch(e){
      console.log("Best scores not working!", e);
      return 0;
    }
    if(size == 4){
      return this.getBestScore();
    }
    return 0;
  }
  setBestScore(score) {
    if(localStorageWorks && localStorage.lastSession && localStorage.lastSession != tabID){
      this.resolveConflict();
    }
    else{
      this.storage.setItem(this.bestScoreKey, score);
    }
  }
  setBestScorePlus(score, size) {
    if(localStorageWorks && localStorage.lastSession && localStorage.lastSession != tabID){
      this.resolveConflict();
    }
    else{
      this.storage.setItem(this.bestScoreKey, score);
      if(localStorageWorks){
        let current = JSON.parse(localStorage.bestScores);
        current[size] = score;
        localStorage.bestScores = JSON.stringify(current);
      }
    }
  }
  // Game state getters/setters and clearing
  getGameState() {
    if(!localStorageWorks){
      return;
    }
    var stateJSON = this.storage.getItem(this.gameStateKey);
    return stateJSON ? JSON.parse(stateJSON) : null;
  }
  setGameState(gameState) {
    if(!localStorageWorks){
      return;
    }
    if(localStorageWorks && localStorage.lastSession && localStorage.lastSession != tabID){
      this.resolveConflict();
    }
    else{
      this.storage.setItem("lastSession", tabID);
      this.storage.setItem(this.gameStateKey, JSON.stringify(gameState));
    }
  }
  clearGameState() {
    if(!localStorageWorks){
      return;
    }
    if(localStorageWorks && localStorage.lastSession && localStorage.lastSession != tabID){
      this.resolveConflict();
    }
    else{
      this.storage.removeItem(this.gameStateKey);
    }
  }
  resolveConflict(){
    let overwrite = confirm("Sinulla on useampi Oispa Halla™ välilehti auki!\nHaluatko lataa aiemman välilehden tilan tähän välilehteen?\n\n(Jos et paina OK, pelisi ei tallennu, kunnes suljet toiset välilehdet)");
    // Analytics
    try{
			sa_event('conflict_resolved_to_' + overwrite);
		}
	  catch{}
    //
    if(overwrite){
      this.storage.setItem("lastSession", tabID);
      HallaAntiCheat = null; // Estää vahingolliset kirjoitukset historiaan. Aiheuttaa virheitä ennen reloadia, mutta ketä kiinnostaa ¯\_(ツ)_/¯
      document.write("Ladataan uudelleen...");
      window.location.reload();
    }
  }
}








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

class LocalStorageManager {
  constructor() {
    this.bestScoreKey = "bestScore";
    this.gameStateKey = "gameState";

    var supported = this.localStorageSupported();
    this.storage = supported ? window.localStorage : window.fakeStorage;
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
  setBestScore(score) {
    if(localStorage && localStorage.lastSession && localStorage.lastSession != tabID){
      this.resolveConflict();
    }
    else{
      this.storage.setItem(this.bestScoreKey, score);
    }
  }
  // Game state getters/setters and clearing
  getGameState() {
    var stateJSON = this.storage.getItem(this.gameStateKey);
    return stateJSON ? JSON.parse(stateJSON) : null;
  }
  setGameState(gameState) {
    if(localStorage && localStorage.lastSession && localStorage.lastSession != tabID){
      this.resolveConflict();
    }
    else{
      this.storage.setItem("lastSession", tabID);
      this.storage.setItem(this.gameStateKey, JSON.stringify(gameState));
    }
  }
  clearGameState() {
    if(localStorage && localStorage.lastSession && localStorage.lastSession != tabID){
      this.resolveConflict();
    }
    else{
      this.storage.removeItem(this.gameStateKey);
    }
  }
  resolveConflict(){
    let overwrite = confirm("Sinulla on useampi Oispa Halla™ välilehti auki!\nHaluatko lataa aiemman välilehden tilan tähän välilehteen?\n\n(Jos et paina OK, pelisi ei tallennu, kunnes suljet toiset välilehdet)");
    if(overwrite){
      this.storage.setItem("lastSession", tabID);
      HallaAntiCheat = null; // Estää vahingolliset kirjoitukset historiaan. Aiheuttaa virheitä ennen reloadia, mutta ketä kiinnostaa ¯\_(ツ)_/¯
      document.write("Ladataan uudelleen...");
      window.location.reload();
    }
  }
}








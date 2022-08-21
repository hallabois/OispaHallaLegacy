import { tabID } from "$lib/session_manager";

var HallaAntiCheat: any;
var sa_event: Function;

export default class LocalStorageManager {
  enabled: boolean;
  bestScoreKey: string;
  gameStateKey: string;
  storage: any;
  localStorageWorks: boolean;
  constructor(enabled: boolean = true) {
    this.enabled = enabled;
    if(!this.enabled){
      return;
    }
    this.bestScoreKey = "bestScore";
    this.gameStateKey = "gameState";

    var supported = this.localStorageSupported();
    this.storage = localStorage;
    if(this.localStorageWorks){
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
    try{
      localStorage.test = "test";
      let i = localStorage.test;
      let t = i[0];
      delete localStorage.test;
      this.localStorageWorks = true;
    }
    catch(e){
      this.localStorageWorks = false;
      console.log("Localstorage not working");
    }
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
    if(!this.enabled){
      return 0;
    }
    return this.storage.getItem(this.bestScoreKey) || 0;
  }
  getBestScorePlus(size) {
    if(!this.enabled){
      return 0;
    }
    try{
      if(this.localStorageWorks){
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
    if(!this.enabled){
      return;
    }
    if(this.localStorageWorks && localStorage.lastSession && localStorage.lastSession != tabID){
      this.resolveConflict();
    }
    else{
      this.storage.setItem(this.bestScoreKey, score);
    }
  }
  setBestScorePlus(score, size) {
    if(!this.enabled){
      return;
    }
    if(this.localStorageWorks && localStorage.lastSession && localStorage.lastSession != tabID){
      this.resolveConflict();
    }
    else{
      this.storage.setItem(this.bestScoreKey, score);
      if(this.localStorageWorks){
        let current = JSON.parse(localStorage.bestScores);
        current[size] = score;
        localStorage.bestScores = JSON.stringify(current);
      }
    }
  }
  // Game state getters/setters and clearing
  getGameState() {
    if(!this.enabled){
      return;
    }
    if(!this.localStorageWorks){
      return;
    }
    var stateJSON = this.storage.getItem(this.gameStateKey);
    return stateJSON ? JSON.parse(stateJSON) : null;
  }
  setGameState(gameState) {
    if(!this.enabled){
      return;
    }
    if(!this.localStorageWorks){
      return;
    }
    if(this.localStorageWorks && localStorage.lastSession && localStorage.lastSession != tabID){
      this.resolveConflict();
    }
    else{
      this.storage.setItem("lastSession", tabID);
      this.storage.setItem(this.gameStateKey, JSON.stringify(gameState));
    }
  }
  clearGameState() {
    if(!this.enabled){
      return;
    }
    if(!this.localStorageWorks){
      return;
    }
    if(this.localStorageWorks && localStorage.lastSession && localStorage.lastSession != tabID){
      this.resolveConflict();
    }
    else{
      this.storage.removeItem(this.gameStateKey);
    }
  }
  resolveConflict(){
    if(!this.enabled){
      return;
    }
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








import { browser } from "$app/env";
import { tabID } from "$lib/session_manager";

let HAC_valid = '<img src="img/svg/HAC_small.svg" style="width: 1em;margin: -.1em;">';

export class HAC {
    enabled: boolean;
    debug: boolean;
    history: string[];
    size: number;
    secure: boolean;
    urls: string[];
    url: string;
    connected: boolean;
    constructor() {
        this.enabled = false;
        this.debug = false;
        this.history = [];
        this.size = 4;
        this.secure = false;
        this.urls = ["https://localhost:8000", "http://localhost:8000", "https://hac.oispahalla.com:8000", "http://34.71.42.176:8000"];
        this.url = "";
        this.connected = false;
        if( browser ){
            if(localStorage["HAC_history"]){
                try {
                    this.history = JSON.parse(localStorage["HAC_history"]);
                    if(localStorage["HAC_size"]){
                        this.size = JSON.parse(localStorage["HAC_size"]);
                    }
                } catch (error) {
                    console.log("Failed to load HAC history from localstorage: ", error);
                }
            }
            if(localStorage.HAC_dev_enabled != null){
                this.enabled = JSON.parse(localStorage.HAC_dev_enabled);
            }
        }
        this.chooseServer();
        console.log("HAC loaded!");
    }
    async chooseServer(){
        if(!this.enabled){
            return
        }
        // HAC_container.title = "Etsitään HAC-palvelimia...";
        for(let i in this.urls){
            let result = await this.connectivityCheck(this.urls[i]);
            if(result){
                this.url = this.urls[i];
                this.connected = true;
                // HAC_status.innerHTML = "✅📶";
                // HAC_container.title = "Yhdistetty palvelimeen " + this.url;
                if(this.history.length > 0){
                    this.validate();
                }
                return;
            }
        }
        this.connected = false;
        // HAC_status.innerHTML = "🚫📶";
        // HAC_container.title = "Yhteyttä yhteenkään HAC-palvelimeen ei saatu muodostettua.";
    }
    recordState(state) {
        if(browser && localStorage.lastSession && localStorage.lastSession != tabID){
            console.log("MULTIPLE TABS OPEN, HAC HISTORY WILL NOT BE SAVED UNTIL THE CONFLICT IS RESOLVED");
        }
        else{
            this.history.push(state);
            if(browser){
                localStorage["HAC_history"] = JSON.stringify(this.history);
                localStorage["HAC_size"] = JSON.stringify(this.size);
            }
        }
    }
    clearHistory(){
        this.history = [];
        if(browser){
            if(localStorage.lastSession && localStorage.lastSession != tabID){
                console.log("MULTIPLE TABS OPEN, HAC HISTORY WILL NOT BE CLEARED UNTIL THE CONFLICT IS RESOLVED");
            }
            else{
                localStorage["HAC_history"] = JSON.stringify(this.history);
            }
        }
        // HAC_status.innerHTML = this.connected ? "✅📶" : "🚫📶";
    }
    recordBest(score: number, finished = false) {
        if(browser){
            let best = localStorage["HAC_best_score" + this.size];
            if(best == null && localStorage["HAC_best_score"] != null && this.size == 4){
                best = JSON.parse(localStorage["HAC_best_score"]);
                localStorage["HAC_best_score" + this.size] = best;
            }
            if(best == null){
                best = 0;
            }
            let old_best = localStorage["HAC_best_score" + this.size] || -1;
            let best_history = localStorage["HAC_best_history" + this.size];
            if(best_history == null && localStorage["HAC_best_history"] != null && this.size == 4){
                best_history = JSON.parse(localStorage["HAC_best_history"]);
                localStorage["HAC_best_history" + this.size] = JSON.stringify(best_history);
            }
            if(score < 1){
                return;
            }
            if(this.history.length == 0){
                return;
            }
            if(best == null){
                if(best_history == null){
                    best = 0;
                }
                else if((old_best != null && old_best < best) ){
                    best = 0;
                }
                else{
                    best = old_best;
                }
            }//LMAO XD LOL t.antti 9v
            if(best_history == null || best_history == "[]"){
                best = 0;
            }
            if(old_best == null){
                best = 0;
            }
            if(score >= best){
                localStorage["HAC_best_history" + this.size] = JSON.stringify(this.history);
                localStorage["HAC_best_score" + this.size] = score;
                localStorage["bestGameFinished" + this.size] = finished;
                if(finished){
                    let event = new Event("game_ended_with_best_score");
                    window.dispatchEvent(event);
                }
            }
        }
    }
    toggleDebug(){
        this.debug = !this.debug;
    }
    async connectivityCheck(url: string){
        if(!this.enabled){
            return
        }
        try{
            let response = await fetch(url + "/HAC/alive");
            let data = await response.json();
            if(this.debug){
                //console.log(response);
                console.log("Connectivity check result: ", data);
            }
            if(data){
                return true;
            }
        }
        catch(e){
            return false;
        }
    }
    // Depreciated
    /*async validate(){
        if(!this.enabled){
            return
        }
        try{
            // HAC_status.innerHTML = "...";
            let response = await fetch( this.url + "/HAC/validate/" + getHACRequest() );
            let data = await response.json();
            if(this.debug){
                //console.log(response);
                console.log("Validation result: ", data);
                console.log("Score: ", data["score"]);
            }
            this.secure = data.valid;
            HAC_status.innerHTML = this.secure ? HAC_valid : "⚠️";
            return true;
        }
        catch(e){
            HAC_status.innerHTML = "🚫📶";
            return false;
        }
    }*/
}
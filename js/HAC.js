// Halla Anti Cheat
const HAC_status = document.querySelector(".HAC-status");
const HAC_container = document.querySelector(".HAC-container");

function showHAC(){
    HAC_container.style["display"] = "";
}

function enableHAC(){
    HallaAntiCheat.enabled = true;
    HallaAntiCheat.chooseServer();
    showHAC();
}

let HAC_valid = '<img src="img/HAC_small.svg" style="width: 1em;margin: -.1em;">';

class HAC {
    constructor() {
        this.enabled = false;
    	this.debug = false;
        this.history = [];
        this.secure = false;
        this.urls = ["https://localhost:8000", "http://localhost:8000", "https://hac.oispahalla.com:8000", "https://hac.hallacoin.ml:8000", "http://35.225.19.22:8000"];
        this.url = "";
        this.connected = false;
        if(localStorage && localStorage["HAC_history"]){
            try {
                this.history = JSON.parse(localStorage["HAC_history"]);
            } catch (error) {
                console.log("Failed to load HAC history from localstorage: ", error)
            }
        }
        this.chooseServer();
        console.log("HAC loaded!");
    }
    async chooseServer(){
        if(!this.enabled){
            return
        }
        HAC_container.title = "Etsitään HAC-palvelimia...";
    	for(let i in this.urls){
    		let result = await this.connectivityCheck(this.urls[i]);
    		if(result){
    			this.url = this.urls[i];
                this.connected = true;
                HAC_status.innerHTML = "✅📶";
                HAC_container.title = "Yhdistetty palvelimeen " + this.url;
                if(this.history.length > 0){
                	this.validate();
                }
    			return;
    		}
    	}
        this.connected = false;
    	HAC_status.innerHTML = "🚫📶";
        HAC_container.title = "Yhteyttä yhteenkään HAC-palvelimeen ei saatu muodostettua.";
    }
    recordState(state) {
        this.history.push(state);
        if(localStorage){
            localStorage["HAC_history"] = JSON.stringify(this.history);
        }
    }
    clearHistory(){
        this.history = [];
        if(localStorage){
            localStorage["HAC_history"] = JSON.stringify(this.history);
        }
        HAC_status.innerHTML = this.connected ? "✅📶" : "🚫📶";
    }
    recordBest(score) {
        if(localStorage){
            let best = localStorage["HAC_best_score"];
            let old_best = localStorage["bestScore"];
            let best_history = localStorage["HAC_best_history"];
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
            }
            if(score >= best){
                localStorage["HAC_best_history"] = JSON.stringify(this.history);
                localStorage["HAC_best_score"] = score;
            }
        }
    }
    toggleDebug(){
    	this.debug = !this.debug;
    }
    async connectivityCheck(url){
        if(!this.enabled){
            return
        }
    	try{
        	let response = await fetch(url + "/HAC/alive/");
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
    async validate(){
        if(!this.enabled){
            return
        }
        try{
	        HAC_status.innerHTML = "...";
        	let response = await fetch(this.url + "/HAC/validate/" + 4 + "x" + 4 + "S" + this.history.join(":"));
	        let data = await response.json();
	        if(this.debug){
		        //console.log(response);
		        console.log("Validation result: ", data);
		        console.log("Score: ", data["score"])
	        }
	        this.secure = data.valid;
	        HAC_status.innerHTML = this.secure ? HAC_valid : "⚠️";
	        return true;
        }
        catch(e){
        	HAC_status.innerHTML = "🚫📶";
        	return false;
        }
    }
}

var HallaAntiCheat = new HAC();

// Halla Anti Cheat
class HAC {
    constructor() {
    	this.debug = false;
        this.history = [];
        this.secure = false;
        this.urls = ["https://localhost:8000", "http://localhost:8000", "https://hac.hallacoin.ml:8000", "http://35.225.19.22:8000"];
        this.url = "";
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
    	for(let i in this.urls){
    		let result = await this.connectivityCheck(this.urls[i]);
    		if(result){
    			this.url = this.urls[i];
    			return;
    		}
    	}
    	let visual = document.querySelector(".HAC-container");
    	visual.innerHTML = "🚫📶";
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
        let visual = document.querySelector(".HAC-container");
        visual.innerHTML = "?";
    }
    toggleDebug(){
    	this.debug = !this.debug;
    }
    async connectivityCheck(url){
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
    	let visual = document.querySelector(".HAC-container");
        try{
        	let response = await fetch(this.url + "/HAC/validate/" + this.history.join(":"));
	        let data = await response.json();
	        if(this.debug){
		        //console.log(response);
		        console.log("Validation result: ", data);
	        }
	        this.secure = data.valid;
	        visual.innerHTML = this.secure ? "🛡️ " : "⚠️";
	        return true;
        }
        catch(e){
        	visual.innerHTML = "🚫📶";
        	return false;
        }
    }
}

var HallaAntiCheat = new HAC();

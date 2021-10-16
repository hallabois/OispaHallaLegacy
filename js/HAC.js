// Halla Anti Cheat
const HAC_status = document.querySelector(".HAC-status");
const HAC_container = document.querySelector(".HAC-status");

class HAC {
    constructor() {
    	this.debug = false;
        this.history = [];
        this.secure = false;
        this.urls = ["https://localhost:8000", "http://localhost:8000", "https://hac.oispahalla.com:8000", "https://hac.hallacoin.ml:8000", "http://35.225.19.22:8000"];
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
        HAC_container.title = "Etsitään HAC-palvelimia...";
    	for(let i in this.urls){
    		let result = await this.connectivityCheck(this.urls[i]);
    		if(result){
    			this.url = this.urls[i];
                HAC_status.innerHTML = "✅📶";
                HAC_container.title = "Yhdistetty kohteeseen " + this.url;
    			return;
    		}
    	}
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
        HAC_status.innerHTML = "?";
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
        try{
	        HAC_status.innerHTML = "...";
        	let response = await fetch(this.url + "/HAC/validate/" + this.history.join(":"));
	        let data = await response.json();
	        if(this.debug){
		        //console.log(response);
		        console.log("Validation result: ", data);
	        }
	        this.secure = data.valid;
	        HAC_status.innerHTML = this.secure ? "🛡️ " : "⚠️";
	        return true;
        }
        catch(e){
        	HAC_status.innerHTML = "🚫📶";
        	return false;
        }
    }
}

var HallaAntiCheat = new HAC();

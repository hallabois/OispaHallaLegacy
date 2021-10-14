// Halla Anti Cheat
class HAC {
    constructor() {
    	this.debug = false;
        this.history = [];
        if(localStorage && localStorage["HAC_history"]){
            try {
                this.history = JSON.parse(localStorage["HAC_history"]);
            } catch (error) {
                console.log("Failed to load HAC history from localstorage: ", error)
            }
        }
        console.log("HAC loaded!");
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
    }
    toggleDebug(){
    	this.debug = !this.debug;
    }
    async validate(){
        let response = await fetch("http://localhost:8000/HAC/validate/" + this.history.join(":"));
        let data = await response.json();
        if(this.debug){
	        //console.log(response);
	        console.log("Validation result: ", data);
        }
    }
}

var HallaAntiCheat = new HAC();

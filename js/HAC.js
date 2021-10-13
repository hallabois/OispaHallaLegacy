// Halla Anti Cheat
class HAC {
    constructor() {
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
    async validate(){
        let response = await fetch("http://localhost:8000/HAC/validate/" + this.history.join("\n"));
        let data = await response.json();
        console.log(response);
        console.log(data);
    }
}

var HallaAntiCheat = new HAC();
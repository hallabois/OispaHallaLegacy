class Leaderboard {
  constructor() {
    this.numOfScores = 10;
    this.urls = ["https://localhost:5000", "http://localhost:5000", "https://oispahallalb.herokuapp.com", "http://oispahallalb.herokuapp.com"];
    this.url = "";
    this.connected = false;

    this.lbButton = document.getElementById("lb-button");
    this.popup = document.getElementsByClassName("lb-popup")[0];
    this.leaderboardPopup = document.getElementsByClassName("leaderboard-popup")[0];
    
    this.lbRefresh = document.getElementById("lb-refresh");
    this.lbEdit = document.getElementById("lb-edit");
    this.lbClose = document.getElementById("lb-close");
    
    this.lbFormContainer = document.getElementsByClassName("form-container")[0];
    this.lbNameForm = document.getElementById("lb-name-form");
    this.lbSyncForm = document.getElementById("lb-sync-form");
    this.lbName = document.getElementById("lb-name");
    this.lbUid = document.getElementById("lb-uid");
    this.lbStats = document.getElementsByClassName("lb-stats")[0];

    this.nameError = document.getElementById("name-error");
    this.syncError = document.getElementById("sync-error");
    
    this.postScoreButton = document.getElementById("post-score");
    
    this.lbButton.onclick = () => { 
      this.refreshLeaderboard(localStorage.HAC_size);
      this.popup.style.display = "block";
      this.leaderboardPopup.style.display = "block";
    };

    this.lbClose.onclick = () => {
      this.popup.style.display = "none";
    };

    window.onclick = (event) => {
      if (event.target == this.popup) {
        this.popup.style.display = "none";
      }
    };

    this.lbRefresh.onclick = () => {
      this.refreshLeaderboard(localStorage.HAC_size);
    };

    this.lbEdit.onclick = () => {
      this.lbNameForm.value = "" || localStorage.screenName;
      this.lbSyncForm.value = "" || localStorage.id;
      this.lbFormContainer.style.display === "block" ? this.lbFormContainer.style.display = "none" : this.lbFormContainer.style.display = "block";
    };

    this.lbNameForm.onsubmit = (event) => {
      localStorage.screenName = this.lbName.value;
      event.preventDefault();
    };

    this.lbSyncForm.onsubmit = (event) => {
      event.preventDefault();
      fetch(this.url + "/verifyid/" + this.lbUid.value)
      .then(response => response.json())
      .then(data => {
        console.log(data)
        if(data.valid) {
          localStorage.id = this.lbUid.value;
        } else {
          this.syncError.innerHTML = "Epävalidi synkronointikoodi!"
        }
      });
    };

    this.postScoreButton.onclick = () => {
      const lol = JSON.parse(localStorage.gameState);
      this.postScore({ history: JSON.parse(localStorage.HAC_history), palautukset: lol.palautukset, score: lol.score, size: lol.size });
    };

    this.selectURL();
    this.refreshLeaderboard(localStorage.HAC_size);
  }

  async selectURL() {
    for (let i in this.urls) {
      console.log(this.urls[i]);
      const status = await this.connectivityCheck(this.urls[i])
      if(status) {
        console.log("Connected to: " + this.urls[i]);
        this.connected = true;
        this.url = this.urls[i];
      }
    }
    this.connected = false;
  }

  async connectivityCheck(url) {
    try {
      await fetch(url + "/alive")
      .then(response => response.json())
      .then(data => {
        console.log(data);
        if(data.alive) return true;
      })
      .catch(err => {
        console.log(err);
        return false;
      });
    }
    catch(err) {
      return false;
    }
  }

  async refreshLeaderboard(size) {
    await fetch(`${this.url}/scores/${size}/fetchboard/${this.numOfScores}/${localStorage.id ? localStorage.id : ""}`)
    .then(response => response.json())
    .then(data => {
      this.lbStats.innerHTML = "";
      data.topBoard.forEach(record => {
        this.lbStats.innerHTML += `
        <li class="lb-stat">
          <div class="lb-stat-label">
            ${record.screenName}
          </div>
          <div class="lb-stat-value">
            ${record.score}
          </div>
        </li>`;
      });
    });
  }

  async postScore(game) {
    if(localStorage.screenName === undefined) {
      this.lbNameForm.style.display = "block";
      return;
    }
    if(!game.history && !game.palautukset == undefined && !game.score) {
      console.log(game);
      return;
    }
    const parsedHistory = game.size + "x" + game.size + "S" + game.history.join(":");
    await fetch(this.url + "/scores/" + game.size, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: null || localStorage.id,
        screenName: localStorage.screenName,
        score: game.score,
        breaks: game.palautukset,
        history: parsedHistory
      })
    })
    .then(response => {
      console.log(response);
      if(response.ok) {
        return response.json();
      }
      console.log("Unexpected status code on POST: " + response.status, response.json());
    })
    .then(data => {
      console.log(data);
      localStorage.id = data.createdScore._id;
      this.refreshLeaderboard(localStorage.HAC_size);
    });
  }
}

var leaderboard = new Leaderboard();
class GameManager {
  constructor(size, InputManager, Actuator, StorageManager) {
    this.size = size; // Size of the grid
    this.inputManager = new InputManager;
    this.storageManager = new StorageManager;
    this.actuator = new Actuator;

    this.startTiles = 2;
    this.numOfScores = 10;

    let restartbtn = document.querySelector(".restart-button");
    let restart3 = document.querySelector(".restart-3x3");
    let restart4 = document.querySelector(".restart-4x4");

    restartbtn.onclick = () => {
      if(!restartbtn.classList.contains("open")){
        restartbtn.classList.add("open");
      }
      else{
        restartbtn.classList.remove("open");
      }
    };
    restart3.onclick = () => {this.restartplus(3)};
    restart4.onclick = () => {this.restartplus(4)};
    this.inputManager.on("restart", this.restart.bind(this));
    this.inputManager.on("move", this.move.bind(this));
    this.inputManager.on("keepPlaying", this.keepPlaying.bind(this));
    this.inputManager.on("paritaKuli", this.paritaKuli.bind(this));
    this.inputManager.on("toggleEvent", this.toggleEvent.bind(this));
    this.inputManager.on("toggleDarkMode", this.toggleDarkMode.bind(this));

    this.popup = document.getElementsByClassName("lb-popup")[0];
    
    this.setup();
  }
  // Export the current game for later analysis
  serialize_HAC(gridState, direction, added) {
    return gridState.join(".") + "+" + added + ";" + direction;
  }
  // Restart the game
  restart() {
    HallaAntiCheat.recordBest(this.score);
    this.storageManager.clearGameState();
    this.actuator.continueGame(); // Clear the game won/lost message
    //this.size = 4;
    this.setup();
  }
  // Restart the game
  restartplus(size=3) {
    HallaAntiCheat.recordBest(this.score);
    this.storageManager.clearGameState();
    this.actuator.continueGame(); // Clear the game won/lost message
    this.size = size;
    this.setup();
  }
  // Keep playing after winning (allows going over 2048)
  keepPlaying() {
    this.keepPlaying = true;
    this.actuator.continueGame(); // Clear the game won/lost message
  }

  paritaKuli() {
    if (!this.isGameTerminated()) {
      if (this.score >= 1000) {
        if (this.palautukset < 3) {
          this.palautukset++;
          this.score -= 1000;
          this.grid.palautaKuri();
          this.actuate();
          this.actuator.paritaKuli();
        }
        else
          alert("Olet lahjonut opettajia liikaa! Halla on pettynyt sinuun.");
      }
      else
        alert("Et ole tarpeeksi suosittu opettajien keskuudessa lahjomaan heitä!");
    }
  }
  toggleEvent() {
    let themeID = currentTheme;
    var eventToggle = document.getElementById('event-icon');
    var newIndex;
    if(themeID == 1) {
      newIndex = 3;
      eventToggle.src = 'img/svg/no_snow.svg';
    }
    else {
      newIndex = 1; 
      eventToggle.src = 'img/svg/snow.svg';
    }
    
    setImageTheme( newIndex );
  }
  toggleDarkMode(){
    setImageTheme( currentTheme == 1 ? 0 : 1 );
  }
  // Return true if the game is lost, or has won and the user hasn't kept playing
  isGameTerminated() {
    return this.over || (this.won && !this.keepPlaying);
  }

  isLeaderboardOpen() {
    return this.popup.style.display == "block";
  }

  // Set up the game
  setup() {
    var previousState = this.storageManager.getGameState();

    // Reload the game from a previous game if present
    if (previousState) {
      this.grid = new Grid(previousState.grid.size,
        previousState.grid.cells); // Reload grid
      this.size = previousState.grid.size;
      this.score = previousState.score;
      this.palautukset = previousState.palautukset == undefined ? 0 : previousState.palautukset;
      this.over = previousState.over;
      this.won = previousState.won;
      this.keepPlaying = previousState.keepPlaying;
    } else {
      this.grid = new Grid(this.size);
      this.score = 0;
      this.palautukset = 0;
      this.over = false;
      this.won = false;
      this.keepPlaying = false;

      // Add the initial tiles
      this.addStartTiles();
    }

    HallaAntiCheat.size = this.size;

    // Analytics
    try{
			sa_event('new_game');
			sa_event('new_game_size_' + this.size);
		}
	  catch{}
    //

    // Update the actuator
    this.actuate();
  }
  // Set up the initial tiles to start the game with
  addStartTiles() {
    for (var i = 0; i < this.startTiles; i++) {
      this.addRandomTile();
    }
    HallaAntiCheat.clearHistory();
  }
  // Adds a tile in a random position
  addRandomTile() {
    if (this.grid.cellsAvailable()) {
      var value = Math.random() < 0.9 ? 2 : 4;
      var tile = new Tile(this.grid.randomAvailableCell(), value);

      this.grid.insertTile(tile);
      return "" + tile.x + "," + tile.y + "." + tile.value; // for HAC
    }
  }
  // Sends the updated grid to the actuator
  actuate() {
    if (this.storageManager.getBestScorePlus(this.size) < this.score) {
      this.storageManager.setBestScorePlus(this.score, this.size);
    }

    // Clear the state when the game is over (game over only, not win)
    if (this.over) {
      this.storageManager.clearGameState();
    } else {
      this.storageManager.setGameState(this.serialize());
    }

    this.actuator.actuate(this.grid, {
      score: this.score,
      palautukset: this.palautukset,
      over: this.over,
      won: this.won,
      bestScore: this.storageManager.getBestScorePlus(this.size),
      terminated: this.isGameTerminated()
    });

  }
  // Represent the current game as an object
  serialize() {
    return {
      grid: this.grid.serialize(),
      score: this.score,
      palautukset: this.palautukset,
      over: this.over,
      won: this.won,
      size: this.size,
      keepPlaying: this.keepPlaying
    };
  }
  // Save all tile positions and remove merger info
  prepareTiles() {
    this.grid.eachCell(function (x, y, tile) {
      if (tile) {
        tile.mergedFrom = null;
        tile.hasBeenMerged = false;
        tile.savePosition();
      }
    });
  }
  // Move a tile and its representation
  moveTile(tile, cell) {
    this.grid.cells[tile.x][tile.y] = null;
    this.grid.cells[cell.x][cell.y] = tile;
    tile.updatePosition(cell);
  }
  // Move tiles on the grid in the specified direction
  move(direction) {

    let HAC_grid = this.grid.serialize_HAC();

    // 0: up, 1: right, 2: down, 3: left
    var self = this;

    if (this.isGameTerminated() || this.isLeaderboardOpen())
      return; // Don't do anything if the game's over

    var cell, tile;

    var vector = this.getVector(direction);
    var traversals = this.buildTraversals(vector);
    var moved = false;

    // Save the current tile positions and remove merger information
    this.prepareTiles();

    // Traverse the grid in the right direction and move tiles
    traversals.x.forEach(function (x) {
      traversals.y.forEach(function (y) {
        cell = { x: x, y: y };
        tile = self.grid.cellContent(cell);

        if (tile) {
          var positions = self.findFarthestPosition(cell, vector);
          var next = self.grid.cellContent(positions.next);

          // Only one merger per row traversal?
          if (next && next.value === tile.value && !next.mergedFrom) {
            var merged = new Tile(positions.next, tile.value * 2);
            merged.mergedFrom = [tile, next];
            tile.hasBeenMerged = true;
            next.hasBeenMerged = true;

            self.grid.insertTile(merged);
            self.grid.removeTile(tile);

            // Converge the two tiles' positions
            tile.updatePosition(positions.next);

            // Update the score
            self.score += merged.value;

            // The mighty 2048 tile
            if (merged.value === 2048)
              self.won = true;
          } else {
            self.moveTile(tile, positions.farthest);
          }

          if (!self.positionsEqual(cell, tile)) {
            moved = true; // The tile moved from its original cell!
          }
        }
      });
    });
    let ended = false;

    let added = "";
    if (moved) {

      added = this.addRandomTile();

      if (!this.movesAvailable()) {
        this.over = true; // Game over!

        let state = this.serialize_HAC(HAC_grid, "f", added);
        HallaAntiCheat.recordState(state);

        if(this.size == 4 || this.size == 3){
          HallaAntiCheat.recordBest(this.score);
        }

        // Analytics
        try{
          sa_event('game_failed');
        }
        catch{}
        //

        HallaAntiCheat.validate();
        HallaAntiCheat.clearHistory();
        ended = true;
      }

      this.actuate();
    }
    if (!ended && moved) {
      let HAC_direction = moved ? direction : "e";
      //HAC_grid = this.grid.serialize_HAC();
      let state = this.serialize_HAC(HAC_grid, HAC_direction, added);
      HallaAntiCheat.recordState(state);
      HallaAntiCheat.validate();
    }
    if(this.size == 4){
      HallaAntiCheat.recordBest(this.score);
    }
  }
  // Get the vector representing the chosen direction
  getVector(direction) {
    // Vectors representing tile movement
    var map = {
      0: { x: 0, y: -1 },
      1: { x: 1, y: 0 },
      2: { x: 0, y: 1 },
      3: { x: -1, y: 0 } // Left
    };

    return map[direction];
  }
  // Build a list of positions to traverse in the right order
  buildTraversals(vector) {
    var traversals = { x: [], y: [] };

    for (var pos = 0; pos < this.size; pos++) {
      traversals.x.push(pos);
      traversals.y.push(pos);
    }

    // Always traverse from the farthest cell in the chosen direction
    if (vector.x === 1)
      traversals.x = traversals.x.reverse();
    if (vector.y === 1)
      traversals.y = traversals.y.reverse();

    return traversals;
  }
  findFarthestPosition(cell, vector) {
    var previous;

    // Progress towards the vector direction until an obstacle is found
    do {
      previous = cell;
      cell = { x: previous.x + vector.x, y: previous.y + vector.y };
    } while (this.grid.withinBounds(cell) &&
      this.grid.cellAvailable(cell));

    return {
      farthest: previous,
      next: cell // Used to check if a merge is required
    };
  }
  movesAvailable() {
    return this.grid.cellsAvailable() || this.tileMatchesAvailable();
  }
  // Check for available matches between tiles (more expensive check)
  tileMatchesAvailable() {
    var self = this;

    var tile;

    for (var x = 0; x < this.size; x++) {
      for (var y = 0; y < this.size; y++) {
        tile = this.grid.cellContent({ x: x, y: y });

        if (tile) {
          for (var direction = 0; direction < 4; direction++) {
            var vector = self.getVector(direction);
            var cell = { x: x + vector.x, y: y + vector.y };

            var other = self.grid.cellContent(cell);

            if (other && other.value === tile.value) {
              return true; // These two tiles can be merged
            }
          }
        }
      }
    }

    return false;
  }
  positionsEqual(first, second) {
    return first.x === second.x && first.y === second.y;
  }
}
























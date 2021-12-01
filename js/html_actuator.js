class HTMLActuator {
  constructor() {
    this.html_component = document.querySelector("html");
    this.tileContainer = document.querySelector(".tile-container");
    this.scoreContainer = document.querySelector(".score-container");
    this.bestContainer = document.querySelector(".best-container");
    this.messageContainer = document.querySelector(".game-message");

    this.kurinPalautusViesti = document.querySelector(".kurin-palautus-viesti");
    this.kurinPalautusNappi = document.querySelector(".parin-kulautus");
    this.kurinPalautusColor = document.querySelector(".kurin-palautus-color");

    this.score = 0;
  }
  actuate(grid, metadata) {
    var self = this;

    this.html_component.style = "--grid-size:" + grid.size + "!important;";

    window.requestAnimationFrame(function () {
      self.clearContainer(self.tileContainer);

      grid.cells.forEach(function (column) {
        column.forEach(function (cell) {
          if (cell) {
            self.addTile(cell);
          }
        });
      });

      self.updateScore(metadata.score, metadata.palautukset, metadata.terminated);
      self.updateBestScore(metadata.bestScore);

      if (metadata.terminated) {
        if (metadata.over) {
          self.message(false, metadata.palautukset); // You lose
        } else if (metadata.won) {
          self.message(true, metadata.palautukset); // You win!
        }
      }

    });
  }
  // Continues the game (both restart and keep playing)
  continueGame() {
    this.clearMessage();
  }
  clearContainer(container) {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }
  //Remove merged tiles (call after 100ms)
  removeMergedTile(tile) {
    if (tile.parentElement) {
      tile.parentElement.removeChild(tile);
    }
  }
  addTile(tile) {
    var self = this;

    var wrapper = document.createElement("div");
    var inner = document.createElement("div");
    var position = tile.previousPosition || { x: tile.x, y: tile.y };
    var positionClass = this.positionClass(position);

    // We can't use classlist because it somehow glitches when replacing classes
    var classes = ["tile", "tile-" + tile.value, positionClass];

    if (tile.value > 2048)
      classes.push("tile-super");

    this.applyClasses(wrapper, classes);

    inner.classList.add("tile-inner");

    if (tile.previousPosition) {
      // Make sure that the tile gets rendered in the previous position first
      window.requestAnimationFrame(function () {
        classes[2] = self.positionClass({ x: tile.x, y: tile.y });
        self.applyClasses(wrapper, classes); // Update the position
      });
    } else if (tile.mergedFrom) {
      classes.push("tile-merged");
      this.applyClasses(wrapper, classes);

      // Render the tiles that merged
      tile.mergedFrom.forEach(function (merged) {
        self.addTile(merged);
      });
    } else {
      classes.push("tile-new");
      this.applyClasses(wrapper, classes);
    }

    if (tile.hasBeenMerged) {
      // Remove this tile from the dom after it's animation has finished (animation lenght 100ms)
      setTimeout(() => { self.removeMergedTile(wrapper); }, 100);
    }

    // Add the inner part of the tile to the wrapper
    wrapper.appendChild(inner);

    // Put the tile on the board
    this.tileContainer.appendChild(wrapper);
  }
  applyClasses(element, classes) {
    element.setAttribute("class", classes.join(" "));
  }
  normalizePosition(position) {
    return { x: position.x + 1, y: position.y + 1 };
  }
  positionClass(position) {
    position = this.normalizePosition(position);
    return "tile-position-" + position.x + "-" + position.y;
  }
  updateScore(score, palautukset, terminated) {
    this.clearContainer(this.scoreContainer);

    var difference = score - this.score;
    this.score = score;

    this.scoreContainer.textContent = this.score;

    if (difference > 0) {
      var addition = document.createElement("div");
      addition.classList.add("score-addition");
      addition.textContent = "+" + difference;

      this.scoreContainer.appendChild(addition);
    }

    if (this.score >= 1000 && palautukset < 3 && !terminated) {
      this.kurinPalautusColor.classList.add("allowed");
      this.kurinPalautusNappi.classList.add("allowed");
    }
    else {
      this.kurinPalautusColor.classList.remove("allowed");
      this.kurinPalautusNappi.classList.remove("allowed");
    }
  }
  updateBestScore(bestScore) {
    this.bestContainer.textContent = bestScore;
  }
  message(won, kurinPalautukset) {
    var type = won ? "game-won" : "game-over";
    var message = won ? "HALLA!" : "Improbatur...";
    //TODO: eri viestejä riippuen parhaimmasta ruudusta pelissä
    this.messageContainer.classList.add(type);
    this.messageContainer.getElementsByTagName("p")[0].textContent = message;

    this.messageContainer.getElementsByTagName("p")[1].textContent = `Kurinpalautukset: ${kurinPalautukset}/3`;
  }
  clearMessage() {
    // IE only takes one value to remove at a time.
    this.messageContainer.classList.remove("game-won");
    this.messageContainer.classList.remove("game-over");
  }
  paritaKuli() {
    this.clearContainer(this.scoreContainer);
    this.clearContainer(this.kurinPalautusViesti);
    this.scoreContainer.textContent = this.score - 1000;

    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "-1000";
    this.scoreContainer.appendChild(addition);

    var messageElement = document.createElement("img");
    messageElement.setAttribute('src', "./img/parinkulautus.png");

    this.kurinPalautusViesti.appendChild(messageElement);
    return true;
  }
}
















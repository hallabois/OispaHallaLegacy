import { open_popups } from "$lib/popupstore";
import { get } from "svelte/store";

export default class KeyboardInputManager {
  enabled: boolean;
  documentRoot: HTMLElement;
  events: {};
  eventTouchstart: string;
  eventTouchmove: string;
  eventTouchend: string;
  map: {
    38: number; 39: number; 40: number; 37: number; 75: number; 76: number; 74: number; 72: number; 87: number; 68: number; 83: number; 65: number; // A
  };
  boundKeyDownHandler: any;
  addKeydownHandler: () => void;
  removeKeydownHandler: () => void;
  
  constructor(documentRoot: HTMLElement, enabled: boolean = true) {
    this.enabled = enabled;
    if(!enabled) {
      return;
    }
    this.documentRoot = documentRoot;
    this.events = {};

    this.eventTouchstart = "touchstart";
    this.eventTouchmove = "touchmove";
    this.eventTouchend = "touchend";


    this.map = {
      38: 0,
      39: 1,
      40: 2,
      37: 3,
      75: 0,
      76: 1,
      74: 2,
      72: 3,
      87: 0,
      68: 1,
      83: 2,
      65: 3 // A
    };

    this.boundKeyDownHandler = this.keydownHandler.bind(this);

    this.addKeydownHandler = ()=>{
      document.addEventListener("keydown", this.boundKeyDownHandler);
    }
    this.removeKeydownHandler = ()=>{
      document.removeEventListener("keydown", this.boundKeyDownHandler);
    }

    this.listen();
    
  }
  on(event, callback) {
    if(!this.enabled) {
      return;
    }
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }
  emit(event, data) {
    if(!this.enabled) {
      return;
    }
    var callbacks = this.events[event];
    if (callbacks) {
      callbacks.forEach(function (callback) {
        callback(data);
      });
    }
  }
  
  listen() {
    if(!this.enabled) {
      return;
    }
    var self = this;
    
    // Respond to direction keys
    this.addKeydownHandler();

    // Respond to button presses
    this.bindButtonPress(".retry-button", this.restart);
    //this.bindButtonPress(".restart-button", this.restart);
    //this.bindContextPress(".restart-button", this.restartplus);
    this.bindButtonPress(".keep-playing-button", this.keepPlaying);
    this.bindButtonPress(".kurin-palautus", this.paritaKuli);
    this.bindButtonPress(".event-button", this.toggleDarkMode);

    // Respond to swipe events
    var touchStartClientX, touchStartClientY;
    var gameContainer = this.documentRoot.getElementsByClassName("game-container")[0];

    gameContainer.addEventListener(this.eventTouchstart, function (event: TouchEvent) {
      if (event.touches.length > 1 ||
        event.targetTouches.length > 1) {
        return; // Ignore if touching with more than 1 finger
      }

      touchStartClientX = event.touches[0].clientX;
      touchStartClientY = event.touches[0].clientY;

      event.preventDefault();
    });

    gameContainer.addEventListener(this.eventTouchmove, function (event) {
      event.preventDefault();
    });

    gameContainer.addEventListener(this.eventTouchend, function (event: TouchEvent) {
      if (event.touches.length > 0 ||
        event.targetTouches.length > 0) {
        return; // Ignore if still touching with one or more fingers
      }

      var touchEndClientX, touchEndClientY;

      touchEndClientX = event.changedTouches[0].clientX;
      touchEndClientY = event.changedTouches[0].clientY;

      var dx = touchEndClientX - touchStartClientX;
      var absDx = Math.abs(dx);

      var dy = touchEndClientY - touchStartClientY;
      var absDy = Math.abs(dy);

      if (Math.max(absDx, absDy) > 10) {
        // (right : left) : (down : up)
        self.emit("move", absDx > absDy ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
      }
    });
  }
  keydownHandler (event) {
    if(!this.enabled || get(open_popups).length > 0) {
      return;
    }
    var modifiers = event.altKey || event.ctrlKey || event.metaKey ||
      event.shiftKey;
    var mapped = this.map[event.which];

    if (!modifiers) {
      if (mapped !== undefined) {
        event.preventDefault();
        this.emit("move", mapped);
      }
    }

    // R key restarts the game
    if (!modifiers && event.which === 82) {
      this.restart.call(this, event);
    }
  }
  restart(event) {
    if(!this.enabled) {
      return;
    }
    event.preventDefault();
    this.emit("restart", null);
  }
  restartplus(event) {
    if(!this.enabled) {
      return;
    }
    event.preventDefault();
    this.emit("restartplus", null);
    event.stopPropagation();
  }
  keepPlaying(event) {
    if(!this.enabled) {
      return;
    }
    event.preventDefault();
    this.emit("keepPlaying", null);
  }
  bindButtonPress(selector, fn) {
    if(!this.enabled) {
      return;
    }
    var button = this.documentRoot.querySelector(selector);
    if(button){
      button.addEventListener("click", fn.bind(this));
      button.addEventListener(this.eventTouchend, fn.bind(this));
    }
  }
  bindContextPress(selector, fn){
    if(!this.enabled) {
      return;
    }
    var button = this.documentRoot.querySelector(selector);
    if(button){
      button.addEventListener("contextmenu", fn.bind(this));
    }
  }
  paritaKuli(event) {
    if(!this.enabled) {
      return;
    }
    event.preventDefault();
    this.emit("paritaKuli", null);
    event.stopPropagation();
  }
  toggleEvent(event) {
    if(!this.enabled) {
      return;
    }
    event.preventDefault();
    this.emit("toggleEvent", null);
    event.stopPropagation();
  }
  toggleDarkMode(event) {
    if(!this.enabled) {
      return;
    }
    event.preventDefault();
    this.emit("toggleDarkMode", null);
    event.stopPropagation();
  }
}










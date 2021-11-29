

let pixelScale = 20;
let diloFigureHeight = 1.4 * pixelScale;
let diloFigureWidth = 30;
let diloFigureRadius = 15;
let diloSizeObj = { "x": 15, "y": 86 };
let diloMoveRate = 0.05;
let originaldiloMoveRate = 0.05;
let levelScrollRate = 0.01;
let redBlock = "#f75b4a";
let backgroundColors = {
  0: "#191038",
  1: "#346557",
  2: "#3c4e72"
};
let backgroundBlocks;
let diloColor = "#f07373";
let originalDiloColor = "#f07373";
let diloAcceleration = 0.02;
let originalDiloAcceleration = 0.02;
let diloDeceleration = 0.02;
let diloMaxSpeed = 0.3;
var charKey;
let coinsNeededToWin = 10;
let blockCollisionMax = 100;
let diloSpriteWidth = 30;
let diloSpriteHeight = 86;
let diloSprites = document.createElement("img");
diloSprites.src = "dilo_sprite.png"

function sparkleEffect(
  cx,
  xPos,
  yPos,
  radius,
  fillStyle,
  shadowColor,
  shadowBlur,
) {

  cx.shadowColor = shadowColor;
  cx.shadowBlur = shadowBlur;
  cx.fillStyle = fillStyle;

  for (let i = 0; i < 10; i++) {

    let signX = 1;
    let signY = 1;

    if (Math.random() > 0.5) signX = -1;
    if (Math.random() > 0.5) signY = -1

    cx.beginPath();

    cx.arc(
      xPos + pixelScale / 2 + signX * Math.random() * pixelScale,
      yPos + pixelScale / 2 + signY * Math.random() * pixelScale,
      radius,
      0,
      7
    );
    cx.fill();
  }
}

//Draws both circular and square background blocks
function drawBackgroundBlock(
  cx,
  xPos,
  yPos,
  fillStyle,
  shadowColor,
  shadowBlur,
  shape,
  radius
) {
  cx.fillStyle = fillStyle;
  cx.shadowColor = shadowColor;
  cx.shadowBlur = shadowBlur;

  cx.beginPath();

  if (shape == "square") {

    cx.fillRect(
      xPos * pixelScale + 0.5,
      yPos * pixelScale + 0.5,
      pixelScale - 1,
      pixelScale - 1,
    )
  } else if (shape == "circle") {

    cx.arc(
      xPos * pixelScale + pixelScale / 2,
      yPos * pixelScale + pixelScale / 2,
      radius,
      0,
      7
    )
    cx.fill();
  }
}

//Draws a circle on canvas
function drawCenteredCircle(
  cx,
  xPos,
  yPos,
  radius,
  fillStyle,
  shadowColor,
  shadowBlur
) {
  cx.fillStyle = fillStyle;
  cx.shadowColor = shadowColor;
  cx.shadowBlur = shadowBlur;
  cx.arc(
    xPos,
    yPos,
    radius,
    0,
    7
  )
  cx.fill();
}

//Returns canvas y position converted from level string position
function yCanvasPos(levelY, levelScroll) {
  return (levelY - levelScroll + 30) * pixelScale;
}

//Returns level y position converted from canvas string position
function yLevelPos(canvasY, levelScroll) {
  return (canvasY / pixelScale) + levelScroll - 30
}


//Returns character objet with position values based on canvas (rather than on string level plan)
function characterCanvasConversion(characterObj, level, type) {
  let newX = characterObj.position.x * pixelScale;
  let newY = yCanvasPos(characterObj.position.y, level.height);
  let canvasCharacter = new charTypes[type]({ "x": newX, "y": newY }, characterObj.speed);
  return canvasCharacter
}


// Checks what background objects Dilo collides with and returns them in an array 
// canvasPosObj and sizePosObj are in format {x: .., y: ..} 
function backgroundCollision(canvasPosObj, sizeObj, state) {

  let levelPosX = canvasPosObj.x / pixelScale;
  let levelPosY = yLevelPos(canvasPosObj.y, state.viewport.levelScroll);
  let upperLimit = levelPosY;
  let lowerLimit = levelPosY + (sizeObj.y / pixelScale);
  let leftLimit = levelPosX;
  let rightLimit = levelPosX + sizeObj.x / pixelScale;
  let collisionBlocks = [];

  for (let y = Math.floor(upperLimit); y < Math.ceil(lowerLimit); y++) {

    for (let x = Math.floor(leftLimit); x < Math.ceil(rightLimit); x++) {

      if (state.level.rows[y]) {

        if (state.level.rows[y][x] != "empty"
        /*&& state.level.rows[y][x] != "D"*/) {

          collisionBlocks.push({ "row": y, "column": x, "color": state.level.rows[y][x] })
        }
      }
    }
  }
  return collisionBlocks;
}

//Tracks if keys are currently pressed
let pressedKeys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false
}


class Dilo {

  constructor(pos, speed) {
    this.position = pos;
    this.speed = speed;
  }

  static create({ x, y }) {
    return new Dilo({ "x": x, "y": y }, { "up": 0, "down": 0, "left": 0, "right": 0 })
  }

  //Updates Dilo x and y position according to time elapsed and arrows pressed
  //Checks for Dilo collisions with background
  update(timeElapsed, state) {

    let newX = this.position.x;
    let newY = this.position.y;

    if (pressedKeys.ArrowRight == true) {
      if (this.speed.right < diloMaxSpeed) {
        this.speed.right += diloAcceleration;
      }
    } else if (this.speed.right > 0) {
      this.speed.right = Math.max(this.speed.right - diloDeceleration, 0);
    }

    if (pressedKeys.ArrowLeft == true) {
      if (this.speed.left < diloMaxSpeed) {
        this.speed.left += diloAcceleration;
      }
    } else if (this.speed.left > 0) {
      this.speed.left = Math.max(this.speed.left - diloDeceleration, 0);;
    }

    if (pressedKeys.ArrowUp == true) {
      if (this.speed.up < diloMaxSpeed) {
        this.speed.up += diloAcceleration;
      }
    } else if (this.speed.up > 0) {
      this.speed.up = Math.max(this.speed.up - diloDeceleration, 0);;
    }

    if (pressedKeys.ArrowDown == true) {
      if (this.speed.down < diloMaxSpeed) {
        this.speed.down += diloAcceleration;
      }
    } else if (this.speed.down > 0) {
      this.speed.down = Math.max(this.speed.down - diloDeceleration, 0);;
    }

    newX += timeElapsed * this.speed.right;
    newX -= timeElapsed * this.speed.left;
    newY -= timeElapsed * this.speed.up;
    newY += timeElapsed * this.speed.down;

    //Start of Dilo canvas boundary limits
    //Makes sure Dilo character positions don't move past canvas boundaries    
    if (newX < diloFigureRadius) {
      newX = diloFigureRadius;
    }
    if (newX > state.canvas.width - diloFigureRadius) {
      newX = state.canvas.width - diloFigureRadius;
    };
    if (newY < diloFigureRadius) {
      newY = diloFigureRadius;
    };
    if (newY > state.canvas.height - diloFigureRadius) {
      newY = state.canvas.height - diloFigureRadius
    };
    //End of Dilo canvas boundary limits

    //Collided value is array of background elements that Dilo collided with
    let collided = backgroundCollision(
      { "x": newX, "y": newY },
      diloSizeObj,
      state
    );

    //Updates scoreData with how many coins and blocks have been collided with
    //Sets status to lost if blocks touched exceeds blockCollisionMax 
    for (let block of collided) {

      if (state.level.rows[block.row][block.column] != "collided") {

        if (state.level.unparsedRows[block.row][block.column] == "#") {
          state.scoreData.blocksTouched++;

          if (state.scoreData.blocksTouched > blockCollisionMax) {
            state.status = "lost";
          }
        }
        if (state.level.unparsedRows[block.row][block.column] == "*") {
          state.scoreData.coinsCollected++;
        }

        state.level.rows[block.row][block.column] = "collided";
      }
    }

    return new Dilo({ "x": newX, "y": newY }, this.speed)
  }

  //Draws Dilo sprite on canvas
  draw(state) {

    state.cx.shadowColor = "#f07373";
    let spriteTile = Math.floor(Date.now() / 50) % 5;

    state.cx.save();

    // tilt dilo sprite according to mouse position
let mouseX = mousePos.x - state.canvasRect.x;
let mouseY = mousePos.y - state.canvasRect.y;

     if (mousePos) {
       let diloAngleRad = Math.atan2(
         mouseY - this.position.y,
         mouseX - this.position.x
       );

       state.cx.translate(this.position.x, this.position.y)
       state.cx.rotate(diloAngleRad += Math.PI/2);
       state.cx.translate(-this.position.x, -this.position.y)
     }
    //draw dilo sprite from png
    state.cx.drawImage(
      diloSprites,
      spriteTile * diloSpriteWidth,
      0,
      diloSpriteWidth,
      diloSpriteHeight,
      this.position.x,
      this.position.y,
      diloSpriteWidth,
      diloSpriteHeight,
    )
    state.cx.restore();
    /*   drawCenteredCircle(
        state.cx,
        this.position.x,
        this.position.y,
        diloFigureRadius,
        diloColor,
        diloColor,
        10
      ) */
  }

  get type() {
    return "bobDilo"
  }
}

//Poorly named blackhole character is a sparkling background element
class BlackHole {
  constructor(pos) {
    this.position = pos;
  }

  update(timeElapsed, state) {
    let newY = this.position.y += timeElapsed * state.scrollRate * pixelScale;
    return new BlackHole({ "x": this.position.x, "y": newY })
  }

  draw(state) {

    sparkleEffect(
      state.cx,
      this.position.x,
      this.position.y,
      5,
      "green",
      "#84FF6B",
      60
    )
  };

  static create({ x, y }) {
    return new BlackHole({ "x": x, "y": y }, { "x": 0, "y": 0 })
  }

  get type() {
    return "blackHole"
  }
}

//Charkeys contains objects with key to values of each type of character encountered in the level plan strings. Each object of charkeys corresponds to a level (with colors of background elements changing)
var charKeys = {
  0: {
    "#": "#409486",
    "*": "#ffd666",
    ".": "empty",
    "D": Dilo,
    "b": BlackHole
  },
  1: {
    "#": "#b375ff",
    "*": "#ffd666",
    "#": "#ffffcc",
    "*": "#ffd666",
    ".": "empty",
    "D": Dilo,
    "b": BlackHole
  }
  ,
  2: {
    "#": "#ffffcc",
    "*": "#ffd666",
    ".": "empty",
    "D": Dilo,
    "b": BlackHole
  }
}

//Helper object - might be possible to clean up later
var charTypes = {
  "bobDilo": Dilo,
  "blackHole": BlackHole
}


//Takes level plan string as input, and creates level object
var Level = class Level {

  constructor(levelString) {

    let rows = levelString.trim().split("\n").map(r => [...r]);
    this.unparsedRows = rows;
    this.startingCharacters = [];

    this.rows = rows.map((row, y) => {

      return row.map((char, x) => {

        if (typeof charKey[char] == "string") return charKey[char];

        else {
          this.startingCharacters.unshift(charKey[char].create({ "x": x, "y": y }));
          return "empty";
        }
      })
    })
    this.height = rows.length;
    this.width = rows[0].length;
  }
}


class State {

  constructor(
    level,
    characters,
    status,
    canvas,
    scoreCanvas,
    scoreData,
    levelScroll,
    scrollRate,
    //pointerObj
  ) {

    this.level = level;
    this.characters = characters;

    //Tracks if current level is "playing", "won", or "lost"
    this.status = status;

    //Canvas on which game is played
    this.canvas = canvas;

    //Keeps track of score and collisions small canvas above game canvas
    this.scoreCanvas = scoreCanvas;
    this.canvas.width = level.width * pixelScale;
    this.canvas.height = 30 * pixelScale;
    this.scoreCanvas.width = level.width * pixelScale;
    this.scoreCanvas.height = 5 * pixelScale;
    this.canvas.setAttribute("id", "canvas")
    this.scoreCanvas.setAttribute("id", "scoreCanvas")
    document.body.appendChild(this.scoreCanvas);
    document.body.appendChild(this.canvas);
    this.scoreData = scoreData;
    this.cx = this.canvas.getContext("2d");
    this.scoreCx = this.scoreCanvas.getContext("2d");
    this.canvasRect = this.canvas.getBoundingClientRect();
    //this.pointerObj = pointerObj;

    //Keeps track of game canvas edges relative to level plan scrolling across canvas
    this.viewport = {
      levelScroll: levelScroll,
      height: this.canvas.height / pixelScale,
      width: this.canvas.width / pixelScale
    }
    this.scrollRate = scrollRate;
  }

  static start(level, levelsLength, levelIndex) {
    let canvasCharacters = []

    for (let character of level.startingCharacters) {
      let type = character.type;
      character = characterCanvasConversion(character, level, type)
      canvasCharacters.push(character);
    }

    return new State(
      level,
      canvasCharacters,
      "playing",
      document.createElement("canvas"),
      document.createElement("canvas"),
      {
        coinsCollected: 0,
        blocksTouched: 0,
        health: 100,
        level: levelIndex,
        levelsLength,
        gameWon: false,
        levelIntroDone: false
      },
      level.height,
      levelScrollRate
    )
  }

  update(timeElapsed, state) {
    if (counter % 300 == 0) {
      console.log(state);
    }
    this.viewport.levelScroll -= timeElapsed * state.scrollRate;
    let newCharacters = [];

    for (let i = 0; i < this.characters.length; i++) {
      let newChar = this.characters[i].update(timeElapsed, state)
      newCharacters[i] = newChar;
    }

    return new State(
      this.level,
      newCharacters,
      this.status,
      this.canvas,
      this.scoreCanvas,
      this.scoreData,
      this.viewport.levelScroll,
      this.scrollRate,
      {
        x: this.canvasRect.x + this.canvas.width / 2 + 100,
        y: this.canvasRect.y + this.canvas.height / 2
      }

    );
  }

  //Uses elapsed time and state to draw game canvas and score canvas. Alternates between level start, level passed, game, and game won
  syncCanvas(timeElapsed, state) {

    this.drawScoreCanvas();

    //Decides which screen should be displayed according to level result and game status
    if (this.scoreData.levelIntroDone == true) {

      this.drawCanvasBackground(this.level);

      for (let char of this.characters) {
        char.draw(this);
      }
    } else {
      this.drawLevelIntroCanvas()
    }
    if (this.status == "won") {

      if (this.scoreData.gameWon == true) {
        this.drawGameWon();
      } else {

        this.drawLevelPassed();
      }
    }

    if (mousePos && this.scoreData.levelIntroDone) {
      this.drawPointer(
        mousePos.x - this.canvasRect.x,
        mousePos.y - this.canvasRect.y)
    }
  }

  drawScoreCanvas() {
    this.scoreCx.fillStyle = "#2c1c63";
    this.scoreCx.fillRect(0, 0, this.scoreCanvas.width, this.scoreCanvas.height);
    this.scoreCx.font = `bold 20px serif`;
    this.scoreCx.fillStyle = "white"
    this.scoreCx.fillText(`Level: ${this.scoreData.level + 1}      Coins collected: ${this.scoreData.coinsCollected}/${coinsNeededToWin}      Block collisions: ${this.scoreData.blocksTouched}/${blockCollisionMax}`, 10, 50, this.canvas.width - 20);
  }

  drawLevelIntroCanvas() {
    this.cx.fillStyle = backgroundBlocks;
    this.cx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    this.cx.font = 'bold 100px serif';
    this.cx.lineWidth = 1.5;
    this.cx.textAlign = "center";
    this.cx.strokeStyle = charKey["#"]
    this.cx.strokeText(`Level ${this.scoreData.level + 1}`, this.canvas.width / 2, this.canvas.height / 4);
  }

  drawLevelPassed() {
    /* this.cx.fillStyle = backgroundBlocks;
    this.cx.fillRect(0, 0, this.canvas.width, this.canvas.height) */
    this.cx.font = 'bold 80px serif';
    this.cx.textAlign = "center";
    this.cx.strokeStyle = charKey["#"]
    this.cx.strokeText(`Level ${this.scoreData.level + 1}`, this.canvas.width / 2, this.canvas.height / 3, this.canvas.width);
    this.cx.lineWidth = 1.5;
    this.cx.fillStyle = "#f75b4a"
    this.cx.fillText(`PASSED`, this.canvas.width / 2, this.canvas.height / 3 + 80, this.canvas.width);
  }

  drawGameWon() {
    this.cx.fillStyle = backgroundBlocks;
    this.cx.font = 'bold 80px serif';
    this.cx.textAlign = "center";
    this.cx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    this.cx.fillStyle = "white";
    this.cx.fillText(`YOU WIN!`, this.canvas.width / 2, this.canvas.height / 3 + 80, this.canvas.width);
  }

  drawPointer(x, y) {
    //if (counter % 100 == 0) console.log(mousePos)
    this.cx.fillStyle = "red";
    this.cx.arc(x, y, 5, 0, 7)
    this.cx.fill();
  }

  drawCanvasBackground() {

    this.cx.fillStyle = backgroundBlocks;
    this.cx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    let { levelScroll, height, width } = this.viewport;
    let rowPosition;
    let radius = pixelScale / 2;

    for (let y = height; y >= 0; y--) {

      rowPosition = (30 - y - (levelScroll % 1))
      let pixelRow;
      pixelRow = Math.floor(levelScroll - y)

      for (let x = 0; x < width; x++) {

        if (this.level.rows[pixelRow]) {

          let color = this.level.rows[pixelRow][x];

          let shape;

          if (color != "empty") {

            if (color == charKey["*"]) {
              shape = "circle";
              radius = pixelScale / 2;
            }

            if (color == charKey["#"]) {
              shape = "square";
              radius = pixelScale / 2;
            }

            if (color == "collided") {

              if (this.level.unparsedRows[pixelRow][x] == "#") {
                shape = "square";
                color = redBlock;
                radius = pixelScale / 2;
              }
            }
          }

          drawBackgroundBlock(
            this.cx,
            x,
            rowPosition,
            color,
            color,
            8,
            shape,
            radius);
        }
      }
    }
  }
}


window.addEventListener("keydown", event => {
  if (pressedKeys.hasOwnProperty(event.key)) {
    pressedKeys[event.key] = true;
    event.preventDefault();
  }
})


window.addEventListener("keyup", event => {
  if (pressedKeys.hasOwnProperty(event.key)) {
    pressedKeys[event.key] = false;
    event.preventDefault();
  }
})

let mousePos = { x: 0, y: 0 }

//track mouse
window.addEventListener("mousemove", event => {
  let activated;
  if (!activated) {
    mousePos = { x: event.pageX, y: event.pageY };

    activated = null;
  }
  scheduled = true;
})

let counter = 0;


function runLevel(levelsArray, levelIndex) {
  charKey = charKeys[levelIndex];
  let levelObj = new Level(levelsArray[levelIndex]);
  let state = State.start(levelObj, levelsArray.length, levelIndex);
  let startScreenTimer = 0;
  backgroundBlocks = backgroundColors[levelIndex]

  //endTimer used to implement pause to display level status between end of current level and start of next level (or "You Win!")
  let endTimer = 0;

  //gameWonTimer used to implement pause to display "You Win!"" screen before canvas is cleared
  let gameWonTimer = 0;
  return new Promise((resolve) => {
    function frameAnimation(
      timeCurrentFrame,
      timePreviousFrame,
      state
    ) {

      counter++;

      //Uses time elapsed between frames to make animation smooth
      let timeElapsed = timeCurrentFrame - timePreviousFrame;
      if (timeElapsed > 17) timeElapsed = 17;
      startScreenTimer += timeElapsed;

      if (state.scoreData.levelIntroDone == true) {
        state = state.update(timeElapsed, state)
      }

      if (startScreenTimer > 2000) {
        state.scoreData.levelIntroDone = true;
      }

      state.syncCanvas(timeElapsed, state);
      timePreviousFrame = timeCurrentFrame;

      if (state.viewport.levelScroll < 30) {

        if (state.scoreData.coinsCollected < coinsNeededToWin) {
          state.status = "lost"

        } else {
          state.status = "won";
        }
      }

      if (state.status == "playing") {

        requestAnimationFrame(newTime => frameAnimation(newTime, timePreviousFrame, state))
      } else if (endTimer < 1) {

        if (state.status == "lost") {
          diloColor = "white"
        }

        state.scrollRate = 0;
        endTimer += 0.01;

        requestAnimationFrame(newTime => frameAnimation(newTime, timePreviousFrame, state))

        //resolve(state.status);
      } else {

        if ((state.scoreData.level == state.scoreData.levelsLength - 1)
          && (state.status = "won")) {

          state.scoreData.gameWon = true;

          if (gameWonTimer < 1) {
            gameWonTimer += 0.01;
            requestAnimationFrame(newTime => frameAnimation(newTime, timePreviousFrame, state))

          } else {
            state.canvas.remove();
            state.scoreCanvas.remove();
            resolve(state.status);
          }
        } else {
          diloColor = originalDiloColor;
          state.canvas.remove();
          state.scoreCanvas.remove();
          resolve(state.status);
        }
      }
    }

    requestAnimationFrame(newTime => frameAnimation(newTime, oldTime = newTime, state))
  })
}


async function runGame(levelsArray) {
  for (let levelIndex = 0; levelIndex < levelsArray.length;) {
    let status = await runLevel(levelsArray, levelIndex);
    if (status == "won") {
      levelIndex++;
    }
  }

  console.log("YOU WIN!!")
}

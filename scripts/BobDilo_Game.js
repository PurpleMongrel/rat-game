let scaleMultiplier = 1.2,
  pixelScale = 20 * scaleMultiplier,
  diloFigureHeight = 28 * scaleMultiplier,
  diloFigureWidth = 30 * scaleMultiplier,
  diloFigureRadius = 15 * scaleMultiplier,
  diloSizeObj = { "x": 15 * scaleMultiplier, "y": 15 * scaleMultiplier },
  diloMoveRate = 0.05,
  originaldiloMoveRate = 0.05,
  levelScrollRate = 0.005,
  redBlock = "#f75b4a",
  backgroundColors = {
    0: "#000000",
    1: "#000000",
    2: "#000000"
  },
  scoreBGColor = "#000000",
  backgroundBlocks,
  diloColor = "#f07373",
  originalDiloColor = "#f07373",
  scoreFontSize = 20 * scaleMultiplier,
  scoreFontColor = "#048504",
  introFontSize = 80 * scaleMultiplier,
  introFontColor = "#1132D1",
  diloAcceleration = 0.04,
  originalDiloAcceleration = 0.04,
  diloDeceleration = 0.04,
  diloMaxSpeed = 0.6,
  bulletDuration = 1000,
  coinsNeededToWin = 0,
  blockCollisionMax = 100,
  diloSpriteWidth = 30,
  diloSpriteHeight = 86,
  diloSprites = document.createElement("img"),
  bulletExpirationTime = 600,
  bulletExplosionTime = 400,
  bulletColors = {
    0: "1132D1",
    1: "#FDFFDB",
    2: "#28318B",
    3: "#1132D1",
    4: "#1132D1"
  },
  bulletShadowColors = {
    0: "white",
    1: "#1132D1",
    2: "white",
    3: "#28318b",
  },
  bulletExplodingSizes = {
    0: 7,
    1: 3,
    3: 6,
    4: 2,
    5: 5
  }

diloSprites.src = "images/dilo_sprite.png"

var levelKey = 0;

//Creates a randomized "sparkling" of circles drawn around a point
function sparkleEffect(
  cx,
  xPos,
  yPos,
  radius,
  fillStyle,
  shadowColor,
  shadowBlur,
) {

  for (let i = 0; i < 10; i++) {

    cx.shadowColor = shadowColor;
    cx.shadowBlur = shadowBlur;
    cx.fillStyle = fillStyle;

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
  cx.beginPath();
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

/**
 * Checks what background objects Dilo collides with and returns them in an array
 *  canvasPosObj and sizePosObj are in format {x: .., y: ..}
*/
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

class GameCanvas {
  constructor(level) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = level.width * pixelScale;
    this.canvas.height = 30 * pixelScale;
    this.scoreCanvas = document.createElement("canvas");
    this.scoreCanvas.width = level.width * pixelScale;
    this.scoreCanvas.height = 5 * pixelScale;
    this.cxCanvas = this.canvas.getContext("2d");
    this.cxScore = this.scoreCanvas.getContext("2d");
    document.body.appendChild(this.scoreCanvas);
    document.body.appendChild(this.canvas);
    //there is global getBoundingClientRect, so eventually take this one out
    this.canvasRect = this.canvas.getBoundingClientRect();
    this.canvas.setAttribute("id", "canvas");
    this.scoreCanvas.setAttribute("id", "scoreCanvas")
  }
}

GameCanvas.prototype.syncCanvasToState = function (state) {

  //state.canvas.removeEventListener("click", clicker)

  //Nothing Happens when I remove the code below... This should be checked out!
  /*   this.clearCanvas(
      this.cxScore,
      this.scoreCanvas.width,
      this.scoreCanvas.height,
      "#2c1c63"); */

  //updates canvasRect value every frame
  this.canvasRect = this.canvas.getBoundingClientRect();

  this.drawScoreCanvas(state);

  //update viewport

  //remove clearCanvas below for little art experiments
  this.clearCanvas(
    this.cxCanvas,
    this.canvas.width,
    this.canvas.height,
    backgroundBlocks);

  if (state.status == "won") {

    if (state.gameData.gameWon) {
      this.drawGameWon();

    } else {
      this.drawLevelPassed(state);
    }
  } else {
    if (state.gameData.levelIntroDone) {

      //clickListener(this.canvas);

      this.drawBackground(state);

      for (let char of state.characters) {
        char.draw(this)
      }
    } else {
      this.drawLevelIntroCanvas(state)
    }
  }
}

GameCanvas.prototype.clearCanvas = function (
  cx,
  width,
  heigth,
  color) {

  cx.fillStyle = backgroundBlocks;
  cx.fillRect(0, 0, this.canvas.width, this.canvas.height)
}

GameCanvas.prototype.drawScoreCanvas = function (state) {

  this.cxScore.fillStyle = scoreBGColor;
  this.cxScore.fillRect(0, 0, this.scoreCanvas.width, this.scoreCanvas.height);
  this.cxScore.font = scoreFontSize + "px wheaton";
  this.cxScore.fillStyle = scoreFontColor;
  var text = `Level: ${state.gameData.level + 1}      Coins collected: ${state.gameData.coinsCollected}/${coinsNeededToWin}      Block collisions: ${state.gameData.blocksTouched}/${blockCollisionMax}`;
  var blur = 5 * scaleMultiplier;
  this.cxScore.shadowColor = scoreFontColor;
  this.cxScore.shadowBlur = blur;
  this.cxScore.fillText(text, 10, 50, this.scoreCanvas.width - 20);
}

GameCanvas.prototype.drawLevelIntroCanvas = function (state) {

  //SHould check if I should use conditional to avoid extra caculation previous to state.gameData.level == 0 when level is not 0
  this.cxCanvas.font = introFontSize + "px wheaton";

  this.cxCanvas.lineWidth = 2.5 * scaleMultiplier;

  this.cxCanvas.textAlign = "center";

  this.cxCanvas.strokeStyle = introFontColor;

  this.cxCanvas.fillStyle = levelKey["#"];
  var text = `Level ${state.gameData.level + 1}`;
  var blur = 5.5 * scaleMultiplier;
  this.cxCanvas.shadowColor = introFontColor;
  this.cxCanvas.shadowBlur = blur;
  this.cxCanvas.strokeText(text, this.canvas.width / 2, this.canvas.height / 4);

  if (state.gameData.level == 0) {

    let ruleSpacer = 100;
    let gameRules = [
      `Move rat with arrows`,
      `Aim attacks with pointer`,
      `click to shoot`,
      `Collect ${coinsNeededToWin} cheese coins`,
      `Limit block collisions to ${blockCollisionMax}`
    ]

    this.cxCanvas.font = 15 * scaleMultiplier + "px wheaton";
    this.cxCanvas.textAlign = "left";
    this.cxCanvas.fillStyle = "#FDFFDB";
    for (let rule of gameRules) {

      var blur = 5.5 * scaleMultiplier;
      this.cxCanvas.shadowColor = "white";
      this.cxCanvas.shadowBlur = blur;
      this.cxCanvas.fillText(rule, 10, this.canvas.height / 4 + ruleSpacer);

      ruleSpacer += 50;
    }

    ruleSpacer += 50;
  }
}

GameCanvas.prototype.drawBackground = function (state) {

  let level = state.level;


  let { levelScroll, height, width } = state.viewport;

  let rowPosition;

  let radius = pixelScale / 2;

  for (let y = height; y >= 0; y--) {

    rowPosition = (30 - y - (levelScroll % 1))

    let pixelRow;

    pixelRow = Math.floor(levelScroll - y)

    for (let x = 0; x < width; x++) {

      if (level.rows[pixelRow]) {

        let color = level.rows[pixelRow][x];

        let shape;

        if (color != "empty") {

          if (color == levelKey["*"]) {

            shape = "circle";
            radius = pixelScale / 2;
          }

          if (color == levelKey["#"]) {

            shape = "square";
            radius = pixelScale / 2;
          }

          if (color == "collided") {

            if (level.unparsedRows[pixelRow][x] == "#") {
              shape = "square";
              color = redBlock;
              radius = pixelScale / 2;
            }
          }
        }

        drawBackgroundBlock(
          this.cxCanvas,
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

GameCanvas.prototype.drawLevelPassed = function (state) {
  this.cxCanvas.font = 'bold 80px serif';
  this.cxCanvas.textAlign = "center";
  this.cxCanvas.strokeStyle = levelKey["#"]
  this.cxCanvas.strokeText(`Level ${state.gameData.level + 1}`, this.canvas.width / 2, this.canvas.height / 3, this.canvas.width);
  this.cxCanvas.lineWidth = 1.5;
  this.cxCanvas.fillStyle = "#f75b4a"
  this.cxCanvas.fillText(`PASSED`, this.canvas.width / 2, this.canvas.height / 3 + 80, this.canvas.width);
}

GameCanvas.prototype.drawGameWon = function () {
  this.cxCanvas.fillStyle = backgroundBlocks;
  this.cxCanvas.font = 'bold 80px serif';
  this.cxCanvas.textAlign = "center";
  this.cxCanvas.fillRect(0, 0, this.canvas.width, this.canvas.height)
  this.cxCanvas.fillStyle = "white";
  this.cxCanvas.fillText(`YOU WIN!`, this.canvas.width / 2, this.canvas.height / 3 + 80, this.canvas.width);
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

    let canvasWidth = state.level.width * pixelScale;
    let canvasHeight = 30 * pixelScale;

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
    if (newX > canvasWidth - diloFigureRadius) {
      newX = canvasWidth - diloFigureRadius;
    };
    if (newY < diloFigureRadius) {
      newY = diloFigureRadius;
    };
    if (newY > canvasHeight - diloFigureRadius) {
      newY = canvasHeight - diloFigureRadius
    };
    //End of Dilo canvas boundary limits

    //Collided value is array of background elements that Dilo collided with
    let collided = backgroundCollision(
      { "x": newX, "y": newY },
      diloSizeObj,
      state
    );

    //Updates gameData with how many coins and blocks have been collided with
    //Sets status to lost if blocks touched exceeds blockCollisionMax 
    for (let block of collided) {

      if (state.level.rows[block.row][block.column] != "collided") {

        if (state.level.unparsedRows[block.row][block.column] == "#") {
          state.gameData.blocksTouched++;

          if (state.gameData.blocksTouched > blockCollisionMax) {
            state.status = "lost";
          }
        }
        if (state.level.unparsedRows[block.row][block.column] == "*") {
          state.gameData.coinsCollected++;
        }

        state.level.rows[block.row][block.column] = "collided";
      }
    }

    return new Dilo({ "x": newX, "y": newY }, this.speed)
  }

  //Draws Dilo sprite on canvas
  draw(gameCanvas) {

    gameCanvas.cxCanvas.shadowColor = "#f07373";
    let spriteTile = Math.floor(Date.now() / 50) % 5;

    gameCanvas.cxCanvas.save();

    // tilt dilo sprite according to mouse position
    let mouseX = mousePos.x - gameCanvas.canvasRect.x;
    let mouseY = mousePos.y - gameCanvas.canvasRect.y;
    //let diloPosY = 

    if (mousePos) {
      let diloAngleRad = Math.atan2(
        mouseY - this.position.y,
        mouseX - this.position.x
      );

      gameCanvas.cxCanvas.translate(
        this.position.x,
        this.position.y
      )
      gameCanvas.cxCanvas.rotate(
        diloAngleRad += Math.PI / 2
      );
      gameCanvas.cxCanvas.translate(
        -this.position.x,
        -this.position.y
      )
    }
    //draw dilo sprite from png
    gameCanvas.cxCanvas.drawImage(
      diloSprites,
      spriteTile * diloSpriteWidth,
      0,
      diloSpriteWidth,
      diloSpriteHeight,
      this.position.x,
      this.position.y,
      diloSpriteWidth * scaleMultiplier,
      diloSpriteHeight * scaleMultiplier,
    )
    gameCanvas.cxCanvas.restore();

    /*   drawCenteredCircle(
        gameCanvas.cxCanvas,
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

class Bullet {
  constructor(pos, counter, duration, remove, xDrift) {
    this.position = pos;
    //target no longer needed now that bullet moves forward
    //this.target = target;
    this.counter = counter;
    this.duration = duration;
    this.remove = remove;
    this.xDrift = xDrift;
  }

  static create({ x, y }, xDrift) {
    console.log(x)
    return new Bullet({ "x": x, "y": y }, 0, bulletDuration, false, xDrift);
  }

  /**
   * Calculate distance from bullet origin to target
   * Calculate time bullet should take for trajectory
   * Discover how much x and y should increment per frame. steps = Time/17 (17 is approximate duration of each animation frame | steps is number of frames it'll take for bullet to cover distance)
   * X step increment is x distance to be travelled divided by steps
   * Y step increment is y distance to be travelled divided by steps
   */
  update(timeElapsed, state, index) {

    //xDrift math makes side bullets move slower for triangle formation
    this.position.y -= timeElapsed * 0.5 - (Math.abs(this.xDrift) * 3);

    //Math fine tunes x-axis drift here - this could be calculated at bullet creation instead....
    this.position.x += this.xDrift * this.counter / 180;

    /

    //code bellow was used when bullets were tracking mouse click position
    /**
        * x/yReverse account for if x or y is decreasing in value (going in "opposite" direction)
        * value initialized as 1 does nothing. If x or y is going in opposite direction, x/yBackwards is changed to -1 to account for direction in calculation of frame step increments
        */
    /* let xReverse = 1;
    // variables to make code easier to read
    let xOrigin = this.position.x;
    let yOrigin = this.position.y;
    let xTarget = this.target.x;
    let yTarget = this.target.y;
    let xDistance = xTarget - xOrigin;
    let yDistance = yTarget - yOrigin;
    let yReverse = 1; */
    /*  if (xOrigin > xTarget) xReverse = -1;
     if (yOrigin > yTarget) yReverse = -1;
     let bulletTravelDistance = Math.sqrt(
       (xDistance) ** 2 +
       (yDistance) ** 2
     )
     let yDiff = yTarget - yOrigin;
     let dilo = state.characters[0];
     // bullet travel time is how many 17ms frames bullet should take to get from origin to target
     let bulletTravelTime = bulletTravelDistance * 2 / 17;
     //Amount to be added to x and y per frame
     let xIncrement = xDistance / bulletTravelTime;
     let yIncrement = yDistance / bulletTravelTime;
     this.position.x += xIncrement;
    // this.position.y += (yIncrement + (timeElapsed * state.scrollRate * pixelScale));
    this.position.y += yIncrement + 4
     let incrementolio = timeElapsed * state.scrollRate * pixelScale
 
     console.log({ incrementolio })
     console.log({ yDiff })
     console.log({ yOrigin })
     console.log({ yTarget })
     console.log(this)
     console.log({ dilo })
     console.log({ bulletTravelDistance })
     console.log({ bulletTravelTime })
     console.log('\n') 
     */

    this.counter += timeElapsed;

    //Makes bullets expire once counter reaches numver
    if (this.counter > bulletExpirationTime) {
      this.remove = true;
    }
    return new Bullet(this.position, this.counter, this.duration, this.remove, this.xDrift)


    /* this.position.y -= timeElapsed * 0.5;
    this.counter += timeElapsed;
    let newPos = {"x": this.position.x, "y": this.position.y - timeElapsed * 0.5};
    let newCounter = this.counter += timeElapsed;
    if (this.counter > 400) {
      this.remove = true;
    }
    return Bullet.create(newPos, this.target, newCounter, this.duration, this.remove) */

  };

  draw(gameCanvas) {
    // let bulletColor = bulletFireColors[Math.floor(Math.random()* this.counter % 10)]
    //let bulletColor = "#E84222"

    //Keeps bullet shadows flickering
    let shadowColor = bulletShadowColors[Math.floor(Math.random() * this.counter % 10)];
    let bulletSize;
    let bulletColor;

    //cycles through bullet sizes in bulletExplodingSizes array once counter is over bulletExplosionTime
    if (this.counter > bulletExplosionTime) {
      bulletSize = bulletExplodingSizes[Math.floor(Math.random() * this.counter % 10)]
    } else {
      bulletSize = 5
    }

    //cycles through values in bulletColors array once counter is over certain number
    if (this.counter > bulletExplosionTime) {
      bulletColor = bulletColors[Math.floor(Math.random() * this.counter % 10)]
    } else {
      bulletColor = "#1132D1"
    }

    //Multiple drawCenteredCircle calls to make shadows stronger. Must be very computationally inefficient so would like to find a better way
    drawCenteredCircle(
      gameCanvas.cxCanvas,
      this.position.x,
      this.position.y,
      bulletSize,
      bulletColor,
      shadowColor,
      15
    );
    drawCenteredCircle(
      gameCanvas.cxCanvas,
      this.position.x,
      this.position.y,
      bulletSize,
      "black",
      shadowColor,
      5
    )
    drawCenteredCircle(
      gameCanvas.cxCanvas,
      this.position.x,
      this.position.y,
      bulletSize,
      "black",
      shadowColor,
      8
    )


  }

  get type() {
    return "bullet"
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

  draw(gameCanvas) {

    sparkleEffect(
      gameCanvas.cxCanvas,
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

/**
 * levelKeys contains objects with key to values of each type of character encountered in the level plan strings. Each object of levelKeys corresponds to a level (with colors of background elements changing) 
 * Future change/improvement: swap out color values of '#' and '*' for string values 'block' and 'coin'. Might be best to turn coin into its own character class - collected coins would no longer have to be drawn transparently
*/
var levelKeys = {
  0: {
    "#": "#ffffcc",
    "*": "#FE9A39",
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

/**
 * Helper object - might be possible to clean up later
 */
var charTypes = {
  "bobDilo": Dilo,
  "blackHole": BlackHole,
  "bullet": Bullet
}


/**
 * Takes level plan string as input, and creates level object 
 * */
var Level = class Level {

  constructor(levelString) {

    let rows = levelString.trim().split("\n").map(r => [...r]);
    this.unparsedRows = rows;
    this.startingCharacters = [];

    this.rows = rows.map((row, y) => {

      return row.map((char, x) => {

        if (typeof levelKey[char] == "string") return levelKey[char];

        else {
          this.startingCharacters.unshift(levelKey[char].create({ "x": x, "y": y }));
          return "empty";
        }
      })
    })
    this.height = rows.length;
    this.width = rows[0].length;
  }
}


class State {

  /**
   *scrollRate should probably not be state property since it is a global variable as 'levelScrollRate
   * 
   * */
  constructor(
    level,
    characters,
    status,
    gameData,
    levelScroll,
    scrollRate,
    //pointerObj
  ) {
    this.level = level;

    this.characters = characters;

    //Tracks if current level is "playing", "won", or "lost"
    this.status = status;

    this.gameData = gameData;


    //Keeps track of game canvas edges relative to level plan scrolling across canvas
    this.viewport = {
      levelScroll: levelScroll,
      height: 30,
      width: level.width
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

    //levelScrollRate should probably not be state property since it is a global variable
    return new State(
      level,
      canvasCharacters,
      "playing",
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

    this.viewport.levelScroll -= timeElapsed * state.scrollRate;



    // this.characters = filteredChar;
    //console.log({filteredChar})

    //Calls update method of each character in character array and assigns its return value to the character element
    for (let i = 0; i < this.characters.length; i++) {

      /**
       * removes expired bullets
       * splices out expired bullet and decrements loop index by --1 before 'continue' so next loop cycle doesn't miss next index element (which has now shifted one position back)
       * Considered leaving expired bullets in state as a way to keep history, but this is probably less efficient since would mean looping through several expired bullets at every state update  
       */
      if (
        this.characters[i].type == "bullet" &&
        this.characters[i].remove == true
      ) {
        this.characters.splice(i, 1);
        i--;
        continue;
      }
      this.characters[i] = this.characters[i].update(timeElapsed, state, i);
    }


    return new State(
      this.level,
      this.characters,
      this.status,
      this.gameData,
      this.viewport.levelScroll,
      this.scrollRate
    );
  }

  //Uses elapsed time and state to draw game canvas and score canvas. Alternates between level start, level passed, game, and game won

  //Might use again if creating custom crosshair pointer
  /* drawPointer(x, y) {
    this.cx.fillStyle = "white";
    this.cx.arc(x, y, 5, 0, 7)
    this.cx.fill();
  } */

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

//track mouse movement updating position to mousePos object
//scheduled
window.addEventListener("mousemove", event => {
  let activated;
  if (!activated) {
    mousePos = { x: event.pageX, y: event.pageY };

    activated = null;
  }
  scheduled = true;
})

var newBullet;

let counter = 0;

let gameCanvas;

/**
 * runLevel called by runGame
 */
function runLevel(levelsArray, levelIndex) {
  let state;
  levelKey = levelKeys[levelIndex];
  backgroundBlocks = backgroundColors[levelIndex]

  let levelObj = new Level(levelsArray[levelIndex]);

  gameCanvas = new GameCanvas(levelObj);

  state = State.start(levelObj, levelsArray.length, levelIndex);

  function clicker(event) {
    //console.log(`Clicked x: ${event.pageX}, y: ${event.pageY}`)
    //conditional if last bullet creation was not too recent
    //bullet = Bullet.create()
    //add bullet to state.characters

    let diloPos = state.characters[0].position;

    let canvasMouse = {
      'x':
        mousePos.x - gameCanvas.canvasRect.x,
      'y':
        mousePos.y - gameCanvas.canvasRect.y/* - gameCanvas.scoreCanvas.height */
    }

    newBullet = Bullet.create(diloPos, 0);

    state.characters.push(newBullet);

    newBullet = Bullet.create({ "x": diloPos.x + 10, "y": diloPos.y }, 0.7);

    state.characters.push(newBullet);

    newBullet = Bullet.create({ "x": diloPos.x - 10, "y": diloPos.y }, -0.7);

    state.characters.push(newBullet);
  }

  //Event listener shoots bullets on mouse click
  gameCanvas.canvas.addEventListener("click", clicker);

  let levelIntroTimer = 0;

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

      //Keeps time elapsed at a 17ms maximum (between frames) for smooth animation
      let timeElapsed = timeCurrentFrame - timePreviousFrame;
      if (timeElapsed > 17) timeElapsed = 17;
      levelIntroTimer += timeElapsed;

      let charLength = state.characters.length

      if (state.gameData.levelIntroDone == true) {
        state = state.update(timeElapsed, state)
      }
      let levelIntroDuration = 0;

      //levelIntroTimer situation seems unecessarily messy. Needs refactoring
      if (
        state.gameData.levelIntroDone == false &&
        state.gameData.level == 0
      ) {
        levelIntroDuration = 500;
      }
      if (levelIntroTimer > levelIntroDuration) {
        state.gameData.levelIntroDone = true;
      }
      gameCanvas.syncCanvasToState(state);
      timePreviousFrame = timeCurrentFrame;

      if (state.viewport.levelScroll < 30) {

        if (state.gameData.coinsCollected < coinsNeededToWin) {
          state.status = "lost"

        } else {
          state.status = "won";
        }
      }
      let endTimerControl = 1;

      if (state.status == "playing") {
        requestAnimationFrame(newTime => frameAnimation(newTime, timePreviousFrame, state))

      } else if (endTimer < endTimerControl) {

        if (state.status == "lost") {
          diloColor = "white"
        }
        state.scrollRate = 0;
        endTimer += 0.01;

        requestAnimationFrame(newTime => frameAnimation(newTime, timePreviousFrame, state))

        //resolve(state.status);
      } else {

        if ((state.gameData.level == state.gameData.levelsLength - 1)
          && (state.status = "won")) {

          state.gameData.gameWon = true;

          if (gameWonTimer < 1) {
            gameWonTimer += 0.01;
            requestAnimationFrame(newTime => frameAnimation(newTime, timePreviousFrame, state))

          } else {
            gameCanvas.canvas.remove();
            gameCanvas.scoreCanvas.remove();
            resolve(state.status);
          }
        } else {
          diloColor = originalDiloColor;
          gameCanvas.canvas.remove();
          gameCanvas.scoreCanvas.remove();
          resolve(state.status);
        }
      }
    }

    requestAnimationFrame(newTime => frameAnimation(newTime, oldTime = newTime, state))
  })
}

/**
 * runGame called from HTML
 * Calls await runLevel for each level in levelsArray. Keeps calling runLevel for current level untill runLevel resolves with value "won".
 * Once runLevel promise returns "won", levelIndex++ a runLevel gets called with the next next level.
 * Once last level returns promise resolved to value "won", the game is won and finished
 * */
async function runGame(levelsArray) {
  for (let levelIndex = 0; levelIndex < levelsArray.length;) {
    let status = await runLevel(levelsArray, levelIndex);
    if (status == "won") {
      levelIndex++;
    }
  }

  console.log("YOU WIN!!")
}
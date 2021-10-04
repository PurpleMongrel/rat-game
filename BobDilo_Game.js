//document.body.style.background = "black"


let pixelScale = 20;
let diloFigureHeight = 1.4 * pixelScale;
let diloFigureWidth = 1.5 * pixelScale;
let diloFigureRadius = 15;
let diloSizeObj = { "x": 15, "y": 15 };
let diloMoveRate = 0.4;
let scrollRate = 0.04;
let redBlock = "#f75b4a";
let backgroundBlocks = "#191038";
let diloColor = "#f07373";


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
    xPos + pixelScale / 2,
    yPos + pixelScale / 2,
    radius,
    0,
    7
  )
  cx.fill();
}


function yCanvasPos(levelY, levelScroll) {
  return (levelY - levelScroll + 30) * pixelScale;
}


function yLevelPos(canvasY, levelScroll) {
  return (canvasY / pixelScale) + levelScroll - 30
}


function characterCanvasConversion(characterObj, level, type) {
  let newX = characterObj.position.x * pixelScale;
  let newY = yCanvasPos(characterObj.position.y, level.height);
  let canvasCharacter = new charTypes[type]({ "x": newX, "y": newY }, characterObj.speed);
  return canvasCharacter
}


function boundaryValues() {

}

// canvasPosObj and sizePosObj are in format {x: .., y: ..} 
function backgroundCollision(canvasPosObj, sizeObj, state) {

  let levelPosX = canvasPosObj.x / pixelScale;
  let levelPosY = yLevelPos(canvasPosObj.y, state.viewport.levelScroll);
  let upperLimit = levelPosY - (sizeObj.y / pixelScale);
  let lowerLimit = levelPosY + (sizeObj.y / pixelScale);
  let leftLimit = levelPosX - (sizeObj.x / pixelScale);
  let rightLimit = levelPosX + (sizeObj.x / pixelScale);
  let collisionBlocks = [];

  for (let y = Math.floor(upperLimit); y < Math.ceil(lowerLimit); y++) {

    for (let x = Math.floor(leftLimit); x < Math.ceil(rightLimit); x++) {

      if (state.level.rows[y]) {

        if (state.level.rows[y][x] != "empty" &&

          state.level.rows[y][x] != "D") {

          collisionBlocks.push({ "row": y, "column": x, "color": state.level.rows[y][x] })
        }
      }
    }
  }
  return collisionBlocks;
}


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
    return new Dilo({ "x": x, "y": y }, { "x": 0, "y": 0 })
  }

  update(timeElapsed, state) {
    let levelScroll = state.viewport.levelScroll
    let newX = this.position.x;
    let newY = this.position.y;

    if (pressedKeys.ArrowRight == true) newX += timeElapsed * diloMoveRate;
    if (pressedKeys.ArrowLeft == true) newX -= timeElapsed * diloMoveRate;
    if (pressedKeys.ArrowUp == true) newY -= timeElapsed * diloMoveRate;
    if (pressedKeys.ArrowDown == true) newY += timeElapsed * diloMoveRate;

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

    let collided = backgroundCollision(
      { "x": newX, "y": newY },
      diloSizeObj,
      state
    );

    for (let block of collided) {

      if (state.level.rows[block.row][block.column] != "collided") {

        state.level.rows[block.row][block.column] = "collided";
      }
    }
    return new Dilo({ "x": newX, "y": newY }, { "x": 0, "y": 0 })
  }

  draw(state) {

    drawCenteredCircle(
      state.cx,
      this.position.x,
      this.position.y,
      diloFigureRadius,
      diloColor,
      diloColor,
      10
    )
  }

  get type() {
    return "bobDilo"
  }
}


class BlackHole {
  constructor(pos) {
    this.position = pos;
  }

  update(timeElapsed, state) {
    let newY = this.position.y += timeElapsed * scrollRate * pixelScale;
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


var charKey = {
  "#": "#409486",
  "*": "#ffd666",
  ".": "empty",
  "D": Dilo,
  "b": BlackHole
};


var charTypes = {
  "bobDilo": Dilo,
  "blackHole": BlackHole
}


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

  constructor(level, characters, status, canvas, levelScroll) {

    this.level = level;
    this.characters = characters;
    this.status = status;
    this.canvas = canvas;
    this.canvas.width = level.width * pixelScale;
    this.canvas.height = 30 * pixelScale;
    document.body.appendChild(this.canvas);
    this.cx = this.canvas.getContext("2d");

    this.viewport = {
      levelScroll: levelScroll,
      height: this.canvas.height / pixelScale,
      width: this.canvas.width / pixelScale
    }
  }

  static start(level) {

    let canvasCharacters = []

    for (let character of level.startingCharacters) {
      let type = character.type;
      character = characterCanvasConversion(character, level, type)
      canvasCharacters.push(character);
    }

    return new State(
      level, canvasCharacters,
      "playing", document.createElement("canvas"),
      level.height
    )
  }

  update(timeElapsed, state) {

    this.viewport.levelScroll -= timeElapsed * scrollRate;
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
      this.viewport.levelScroll
    );
  }

  syncCanvas(timeElapsed, state) {
    let t = this.characters;
    let bobDilo = this.characters.find(p => p.type == "bobDilo")
    this.drawCanvasBackground(this.level);
    for (let char of this.characters) {
      char.draw(this);
    }
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
              radius = pixelScale / 2.2;
            }

            if (color == charKey["#"]) {
              shape = "square";
              radius = pixelScale / 2;
            }

            if (color == "collided") {

              if (this.level.unparsedRows[pixelRow][x] == "*") {
                shape = "circle";
                color = "rgba(0, 0, 0, 0)";
                radius = pixelScale / 2.2;
              }

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


let counter = 0;

function runLevel(currentLevel) {
  let levelObj = new Level(currentLevel);
  let state = State.start(levelObj);

  return new Promise((resolve) => {
    function frameAnimation(
      timeCurrentFrame,
      timePreviousFrame,
      state
    ) {

      counter++;

      let timeElapsed = timeCurrentFrame - timePreviousFrame;
      if (timeElapsed > 17) timeElapsed = 17;
      state = state.update(timeElapsed, state)
      state.syncCanvas(timeElapsed, state);
      timePreviousFrame = timeCurrentFrame;
      let endTimer = 0;

      if (state.viewport.levelScroll < 30) {
        state.status = "won";
        /* state.cx.fillStyle = backgroundBlocks;
        state.cx.fillRect(0, 0, state.canvas.width, state.canvas.height) */
        state.canvas.remove();
      }

      if (state.status == "playing") {
        requestAnimationFrame(newTime => frameAnimation(newTime, timePreviousFrame, state))

      } else if (endTimer < 1) {

        if (state.viewport.levelScroll > 30) {

          requestAnimationFrame(newTime => frameAnimation(newTime, timePreviousFrame, state))
        }

        resolve(state.status);
      } else resolve(state.status);
    }

    requestAnimationFrame(newTime => frameAnimation(newTime, oldTime = newTime, state))
  })
}


async function runGame(levelsArray) {

  for (let level = 0; level < levelsArray.length;) {
    
    let status = await runLevel(levelsArray[level]);
    if (status == "won") {
      level++;
    }
  }
  console.log("GAME WON!!!")
}

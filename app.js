let GRID_LENGTH = 3
const FLASH_TIME = 1000
const GAME_TIME = 30

// Used to provide and set data
const dataController = (function () {
  const getCookie = (cname) => {
    const name = `${cname}=`
    const decodedCookie = decodeURIComponent(document.cookie)
    const ca = decodedCookie.split(";")
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === " ") {
        c = c.substring(1)
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length)
      }
    }
    return 0
  }

  const setCookie = (key, value) => {
    document.cookie = `${key}=${value}; expires=Thu, 10 Mar 2019 12:00:00 UTC; path=localhost`
  }

  let highScore = getCookie("highscore")
  const setHighScrore = (score) => {
    highScore = score
  }
  const getHighScore = () => highScore
  return {
    getCookie,
    setCookie,
    setHighScrore,
    getHighScore,
  }
}())

// This controller will manipulate only DOM related processing
const UIController = (function () {
  const DOMStrings = {
    grid: "grid",
    highlight: "highlight",
    highScore: ".high__score",
    userScore: ".user__score",
    timer: ".user__timer",
    startBtn: ".btn-start",
  }

  const getRowBoxes = (colIdx) => {
    let rowDivs = ""

    for (let rowIdx = 0; rowIdx < GRID_LENGTH; rowIdx++) {
      rowDivs = `${rowDivs}<div colIdx="${colIdx}" rowIdx="${rowIdx}" id="box-${rowIdx}${colIdx}" class="box"></div>`
    }
    return rowDivs
  }

  const getColumns = () => {
    let columnDivs = ""
    for (let colIdx = 0; colIdx < GRID_LENGTH; colIdx++) {
      let coldiv = getRowBoxes(colIdx)
      coldiv = `<div class="rowStyle">${coldiv}</div>`
      columnDivs += coldiv
    }
    return columnDivs
  }

  const renderMainGrid = () => {
    const parent = document.getElementById(DOMStrings.grid)
    const columnDivs = getColumns()
    parent.innerHTML = `<div class="columnsStyle">${columnDivs}</div>`
  }

  const getDOMStrings = () => DOMStrings

  return {
    getRowBoxes,
    getColumns,
    renderMainGrid,
    getDOMStrings,
  }
}())

// This is the main controller which initializes the application and handles the events
const controller = (function (DataCtrl, UICtrl) {
  let counter = GAME_TIME
  let timer
  let userScore = 0
  const grid = []
  const DOMStrings = UICtrl.getDOMStrings()
  const startBtn = document.querySelector(DOMStrings.startBtn)
  const userTimer = document.querySelector(DOMStrings.timer)

  document.querySelector(DOMStrings.highScore).innerHTML = DataCtrl.getHighScore()

  const initializeGrid = () => {
    for (let colIdx = 0; colIdx < GRID_LENGTH; colIdx++) {
      const tempArray = []
      for (let rowidx = 0; rowidx < GRID_LENGTH; rowidx++) {
        tempArray.push(0)
      }
      grid.push(tempArray)
    }
    document.querySelector(DOMStrings.timer).innerHTML = GAME_TIME
  }

  const endGame = () => {
    clearInterval(timer)
    alert(`Game over!!!\nYour score is ${userScore}`)
    startBtn.disabled = false
    startBtn.innerHTML = "Restart Game"
    userTimer.innerHTML = GAME_TIME
  }

  const onBoxClick = (event) => {
    if (event.target.className.indexOf(DOMStrings.highlight) !== -1) {
      userScore += 1
    } else if (userScore > 0) {
      userScore -= 1
    }
    document.querySelector(DOMStrings.userScore).innerHTML = userScore
    if (userScore === 0) {
      endGame()
    }
    if (userScore >= DataCtrl.getHighScore()) {
      DataCtrl.setHighScrore(userScore)
      document.querySelector(DOMStrings.highScore).innerHTML = DataCtrl.getHighScore()
      DataCtrl.setCookie("highscore", DataCtrl.getHighScore())
    }
  }

  const flashGrid = () => {
    const rowIdx = Math.floor(Math.random() * GRID_LENGTH)
    const colIdx = Math.floor(Math.random() * GRID_LENGTH)
    const gridElement = document.getElementById(`box-${rowIdx}${colIdx}`)
    gridElement.classList.add(DOMStrings.highlight)
    setTimeout(() => {
      gridElement.classList.remove(DOMStrings.highlight)
    }, 1000)
    counter -= 1
    userTimer.innerHTML = counter
    if (counter <= 0) {
      endGame()
    }
  }

  const startGame = () => {
    timer = setInterval(flashGrid, FLASH_TIME)
    startBtn.disabled = true
  }

  const changeGameStage = (event) => {
    window.evt = event
    switch (event.target.getAttribute("stage")) {
      case "easy":
        GRID_LENGTH = 3
        break
      case "medium":
        GRID_LENGTH = 4
        break
      case "hard":
        GRID_LENGTH = 6
        break
      default:
    }
    initializeGrid()
    UICtrl.renderMainGrid()
    setupEventListeners()
  }

  const setupEventListeners = () => {
    const boxes = document.querySelectorAll(".box")
    boxes.forEach((elem) => {
      elem.addEventListener("click", onBoxClick, false)
    })
    const gameStages = document.querySelectorAll(".button")
    gameStages.forEach((elem) => {
      elem.addEventListener("click", changeGameStage, false)
    })
    startBtn.addEventListener("click", startGame, false)
  }

  const init = () => {
    initializeGrid()
    UICtrl.renderMainGrid()
    setupEventListeners()
  }

  return {
    setupEventListeners,
    initializeGrid,
    onBoxClick,
    flashGrid,
    startGame,
    changeGameStage,
    init,
  }
}(dataController, UIController))

controller.init()

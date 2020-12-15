import {Game} from "./Game"

const div = document.getElementById("app") as HTMLElement
div.style.position = "fixed"
div.style.left = "0"
div.style.right = "0"
div.style.top = "0"
div.style.bottom = "0"

const canvas = document.createElement("canvas")
canvas.style.height = "100%"
canvas.style.widows = "100%"
div.appendChild(canvas)

// tslint:disable-next-line: no-unused-expression
// new TestApp(canvas)
new Game(canvas, {}, {
    mapContent: {notes: [], slides: []},
    musicSrc: "./assets/bgm175.mp3",
    backgroundSrc: "./assets/local/bg.jpg",
    skin: "./assets/skins",
    songName: "Ringing Bloom",
    loadingMessages: ["Message1", "Message2"]
}).start();


(document.getElementById("loader") ?? document.createElement("div")).style.display = "none"
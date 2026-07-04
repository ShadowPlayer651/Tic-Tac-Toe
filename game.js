// ---------- BASIC BOARD SETUP ----------
const board = document.getElementById("board");
const statusText = document.getElementById("status");
let cells = [];
let localTurn = "X";
let gameActive = true;

for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    board.appendChild(cell);
    cells.push(cell);
}

// ---------- SETTINGS + PERSISTENCE ----------
const pageRoot = document.getElementById("pageRoot");
const settingsMenu = document.getElementById("settingsMenu");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const darkModeToggle = document.getElementById("darkModeToggle");
const animationsToggle = document.getElementById("animationsToggle");
const languageSelectUI = document.getElementById("languageSelectUI");
const playerNameInput = document.getElementById("playerNameInput");

const SETTINGS_KEY = "ttt_settings_v2";

let settings = {
    darkMode: true,
    animations: true,
    lang: "en",
    playerName: "Player"
};

function loadSettings() {
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (raw) settings = Object.assign(settings, JSON.parse(raw));
    } catch(e){}
    applySettingsToUI();
    applySettings();
}

function saveSettings() {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch(e){}
}

function applySettingsToUI() {
    darkModeToggle.checked = settings.darkMode;
    animationsToggle.checked = settings.animations;
    languageSelectUI.value = settings.lang;
    playerNameInput.value = settings.playerName;
    playerName = settings.playerName || "Player";
}

function applySettings() {
    // dark mode
    document.body.style.background = settings.darkMode ? "#0d0d0d" : "#f0f0f0";
    // animations: toggle class and inline transitions for immediate effect
    if (!settings.animations) {
        pageRoot.classList.add("no-anim");
        // remove transitions inline for existing elements to ensure immediate effect
        document.querySelectorAll(".cell, .bigBtn, #settingsMenu, .xClose").forEach(el => {
            el.style.transition = "none";
        });
    } else {
        pageRoot.classList.remove("no-anim");
        document.querySelectorAll(".cell, .bigBtn, #settingsMenu, .xClose").forEach(el => {
            el.style.transition = "";
        });
    }
    // language
    applyLanguage(settings.lang);
    // player name
    playerName = settings.playerName || "Player";
}

// UI event handlers for settings
darkModeToggle.addEventListener("change", () => {
    settings.darkMode = darkModeToggle.checked;
    saveSettings();
    applySettings();
});
animationsToggle.addEventListener("change", () => {
    settings.animations = animationsToggle.checked;
    saveSettings();
    applySettings();
});
languageSelectUI.addEventListener("change", () => {
    settings.lang = languageSelectUI.value;
    saveSettings();
    applySettings();
});
playerNameInput.addEventListener("input", e => {
    settings.playerName = e.target.value.trim() || "Player";
    saveSettings();
    playerName = settings.playerName;
});

// ---------- LANGUAGE STRINGS ----------
const STR = {
    en: {
        title: "Tic Tac Toe",
        playLocal: "Play Local",
        playOnline: "Play Online",
        settings: "Settings",
        darkMode: "Dark Mode",
        animations: "Animations",
        createRoom: "Create Room",
        joinRoom: "Join Room",
        randomMatch: "Random Match",
        localStatus: "Local mode: click a cell to play.",
        chooseRoom: "Choose a room option.",
        send: "Send",
        placeholderName: "Your name...",
        placeholderRoom: "Room code...",
        placeholderChat: "Type message..."
    },
    de: {
        title: "Tic Tac Toe",
        playLocal: "Lokal spielen",
        playOnline: "Online spielen",
        settings: "Einstellungen",
        darkMode: "Dunkler Modus",
        animations: "Animationen",
        createRoom: "Raum erstellen",
        joinRoom: "Raum beitreten",
        randomMatch: "Zufalls‑Match",
        localStatus: "Lokal: Klicke ein Feld zum Spielen.",
        chooseRoom: "Wähle eine Raum‑Option.",
        send: "Senden",
        placeholderName: "Dein Name...",
        placeholderRoom: "Raumcode...",
        placeholderChat: "Nachricht..."
    }
};

function applyLanguage(lang) {
    const s = STR[lang] || STR.en;
    document.getElementById("titleText").textContent = s.title;
    document.getElementById("playLocalBtn").textContent = s.playLocal;
    document.getElementById("playOnlineBtn").textContent = s.playOnline;
    document.getElementById("settingsBtn").textContent = s.settings;
    // optional labels (may not exist in older HTML)
    const darkLabel = document.getElementById("darkModeLabel");
    if (darkLabel) darkLabel.textContent = s.darkMode;
    const animLabel = document.getElementById("animationsLabel");
    if (animLabel) animLabel.textContent = s.animations;
    document.getElementById("createRoomBtn").textContent = s.createRoom;
    document.getElementById("joinRoomBtn").textContent = s.joinRoom;
    document.getElementById("randomBtn").textContent = s.randomMatch;
    document.getElementById("sendBtn").textContent = s.send;
    playerNameInput.placeholder = s.placeholderName;
    document.getElementById("roomCodeInput").placeholder = s.placeholderRoom;
    document.getElementById("chatInput").placeholder = s.placeholderChat;
    statusText.textContent = settings.lang === "de" ? STR.de.localStatus : STR.en.localStatus;
}

// ---------- WIN ANIMATION ----------
function showWinAnimation(winner) {
    const anim = document.getElementById("winAnimation");
    const label = settings.lang === "de" ? `${winner} gewinnt!` : `${winner} wins!`;
    anim.textContent = label;
    anim.style.display = "flex";
    setTimeout(() => { anim.style.display = "none"; }, 2500);
}

// ---------- LOCAL GAME LOGIC ----------
function checkWin() {
    const winPatterns = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];
    cells.forEach(c => c.classList.remove("win"));
    for (const pattern of winPatterns) {
        const [a,b,c] = pattern;
        if (cells[a].textContent && cells[a].textContent === cells[b].textContent && cells[a].textContent === cells[c].textContent) {
            cells[a].classList.add("win"); cells[b].classList.add("win"); cells[c].classList.add("win");
            return cells[a].textContent;
        }
    }
    return null;
}

function localMove(cell) {
    if (!gameActive) return;
    if (cell.textContent !== "") return;
    cell.textContent = localTurn;
    const winner = checkWin();
    if (winner) {
        statusText.textContent = `${winner} wins! (local)`;
        showWinAnimation(winner);
        gameActive = false;
        return;
    }
    localTurn = localTurn === "X" ? "O" : "X";
    statusText.textContent = settings.lang === "de" ? STR.de.localStatus : STR.en.localStatus;
}

// ---------- FIREBASE SETUP ----------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, update, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCVYlBk5LP2FTPlGQKVyGqKhRqzMdEe4jM",
  authDomain: "tictactoe-online-17a29.firebaseapp.com",
  projectId: "tictactoe-online-17a29",
  storageBucket: "tictactoe-online-17a29.firebasestorage.app",
  messagingSenderId: "676830002684",
  appId: "1:676830002684:web:9db2c8a041bce7dd5b4679"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ---------- ONLINE ROOM STATE ----------
let currentRoom = null;
let roomRef = null;
let chatRef = null;
let mySymbol = null;
let online = false;
let playerName = settings.playerName || "Player";

// ---------- START ONLINE ROOM ----------
function startOnlineRoom() {
    online = true;
    statusText.textContent = `Online — Room: ${currentRoom}`;
    gameActive = true;
    cells.forEach(c => { c.textContent = ""; c.classList.remove("win"); });

    onValue(roomRef, snapshot => {
        const data = snapshot.val();
        if (!data) return;

        if (!mySymbol) {
            if (!data.X) { update(roomRef, { X: true }); mySymbol = "X"; }
            else if (!data.O) { update(roomRef, { O: true }); mySymbol = "O"; }
        }

        if (data.board) data.board.forEach((val,i)=> cells[i].textContent = val || "");

        if (data.turn) { localTurn = data.turn; statusText.textContent = `Online — Turn: ${localTurn}`; }

        if (data.winner) {
            showWinAnimation(data.winner);
            statusText.textContent = `${data.winner} wins!`;
            gameActive = false;
        }
    });

    onValue(chatRef, snapshot => {
        const data = snapshot.val();
        const messagesDiv = document.getElementById("messages");
        messagesDiv.innerHTML = "";
        if (!data) return;
        Object.values(data).forEach(msg => {
            const p = document.createElement("p");
            p.textContent = msg;
            messagesDiv.appendChild(p);
        });
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
}

// ---------- PRIVATE ROOM: CREATE ----------
document.getElementById("createRoomBtn").onclick = async () => {
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    currentRoom = code;
    roomRef = ref(db, "rooms/" + currentRoom);
    chatRef = ref(db, "rooms/" + currentRoom + "/chat");

    // <-- FIXED: ensure valid object properties (no stray characters)
    await update(roomRef, {
        board: ["","","","","","","","",""],
        turn: "X",
        X: false,
        O: false,
        winner: null
    });

    startOnlineRoom();
    alert((settings.lang==="de" ? "Raum erstellt: " : "Room created: ") + code);
};

// ---------- PRIVATE ROOM: JOIN ----------
document.getElementById("joinRoomBtn").onclick = () => {
    const code = document.getElementById("roomCodeInput").value.trim();
    if (!code) return alert(settings.lang==="de" ? "Gib einen Raumcode ein!" : "Enter a room code!");
    currentRoom = code;
    roomRef = ref(db, "rooms/" + currentRoom);
    chatRef = ref(db, "rooms/" + currentRoom + "/chat");
    startOnlineRoom();
};

// ---------- RANDOM MATCHMAKING ----------
document.getElementById("randomBtn").onclick = async () => {
    const roomsSnapshot = await get(ref(db, "rooms"));
    const rooms = roomsSnapshot.val() || {};
    let foundRoom = null;
    for (const code in rooms) {
        const r = rooms[code];
        const players = (r.X ? 1 : 0) + (r.O ? 1 : 0);
        if (players < 2) { foundRoom = code; break; }
    }
    if (!foundRoom) {
        foundRoom = Math.floor(10000 + Math.random() * 90000).toString();
        await update(ref(db, "rooms/" + foundRoom), {
            board:["","","","","","","","",""],
            turn:"X",
            X:false,
            O:false,
            winner:null
        });
    }
    currentRoom = foundRoom;
    roomRef = ref(db, "rooms/" + currentRoom);
    chatRef = ref(db, "rooms/" + currentRoom + "/chat");
    startOnlineRoom();
};

// ---------- ONLINE MOVE ----------
function onlineMove(cell) {
    if (!online) return localMove(cell);
    if (!gameActive) return;
    if (localTurn !== mySymbol) return;
    if (cell.textContent !== "") return;

    const index = cell.dataset.index;
    const newBoard = cells.map(c => c.textContent);
    newBoard[index] = mySymbol;
    const winner = checkWin();

    update(roomRef, { board: newBoard, turn: mySymbol === "X" ? "O" : "X", winner: winner || null });

    if (winner) {
        showWinAnimation(winner);
        gameActive = false;
    }
}

// ---------- CHAT ----------
document.getElementById("sendBtn").onclick = () => {
    if (!online) return;
    const input = document.getElementById("chatInput");
    const text = input.value.trim();
    if (text === "") return;
    const msgId = Date.now();
    update(chatRef, { [msgId]: `${playerName} (${mySymbol || "?"}): ${text}` });
    input.value = "";
};
document.getElementById("chatInput").addEventListener("keydown", e => { if (e.key === "Enter") document.getElementById("sendBtn").click(); });

// ---------- CELL CLICKS ----------
cells.forEach(cell => { cell.onclick = () => { if (online) onlineMove(cell); else localMove(cell); }; });

// ---------- LOBBY + SETTINGS UI ----------
const lobby = document.getElementById("lobby");
const gameScreen = document.getElementById("gameScreen");

document.getElementById("playLocalBtn").onclick = () => {
    lobby.style.display = "none";
    gameScreen.style.display = "block";
    online = false;
    gameActive = true;
    cells.forEach(c => { c.textContent = ""; c.classList.remove("win"); });
    statusText.textContent = settings.lang === "de" ? STR.de.localStatus : STR.en.localStatus;
};

document.getElementById("playOnlineBtn").onclick = () => {
    lobby.style.display = "none";
    gameScreen.style.display = "block";
    statusText.textContent = settings.lang === "de" ? STR.de.chooseRoom : STR.en.chooseRoom;
};

document.getElementById("settingsBtn").onclick = () => { settingsMenu.style.display = "block"; };
closeSettingsBtn.addEventListener("click", () => { settingsMenu.style.display = "none"; });
document.addEventListener("keydown", e => { if (e.key === "Escape") settingsMenu.style.display = "none"; });

// ---------- INIT ----------
loadSettings();
applyLanguage(settings.lang);

// small helper strings for status
const STR = {
    en: { localStatus: "Local mode: click a cell to play.", chooseRoom: "Choose a room option." },
    de: { localStatus: "Lokal: Klicke ein Feld zum Spielen.", chooseRoom: "Wähle eine Raum‑Option." }
};

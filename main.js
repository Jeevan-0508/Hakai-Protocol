/*********************************
 * STORY LORE (30 FLOORS)
 *********************************/
const storyNodes = [
  { id: 1, title: "The Glitch", text: "You notice patterns repeating. Days blur. Something is wrong." },
  { id: 2, title: "The Interface", text: "A system overlays reality. Metrics. Tasks. Progress." },
  { id: 3, title: "The First Choice", text: "Ignore it and remain static — or engage and evolve." },
  { id: 4, title: "Resistance", text: "Discipline hurts. The mind resists change." },
  { id: 5, title: "Seed of Awakening", text: "Something dormant responds. Power is shaped by consistency." }
];

/*********************************
 * GAME CONFIG
 *********************************/
const GAME_START = "2026-02-03";

/*********************************
 * DATE HELPERS
 *********************************/
function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function isBeforeGameStart(date) {
  return date < GAME_START;
}

/*********************************
 * DAILY PROGRESS
 *********************************/
let dailyProgress = JSON.parse(localStorage.getItem("dailyProgress")) || {};
let storyProgress = parseInt(localStorage.getItem("storyProgress")) || 0;
let level = parseInt(localStorage.getItem("level")) || 1;

function saveDailyProgress() {
  localStorage.setItem("dailyProgress", JSON.stringify(dailyProgress));
}
function saveStoryProgress() {
  localStorage.setItem("storyProgress", storyProgress);
}
function saveLevel() {
  localStorage.setItem("level", level);
}

function initDailyProgress(date) {
  if (isBeforeGameStart(date)) return;
  if (!dailyProgress[date]) {
    dailyProgress[date] = { xp: 0, completed: false };
    saveDailyProgress();
  }
}

/*********************************
 * HABITS CONFIG
 *********************************/
let defaultHabits = JSON.parse(localStorage.getItem("defaultHabits")) || [
  { id: "workout", name: "Workout" },
  { id: "reading", name: "Read / Learn" },
  { id: "coding", name: "Build / Code" },
  { id: "meditation", name: "Meditate" },
  { id: "planning", name: "Plan the Day" }
];

let habitsData = JSON.parse(localStorage.getItem("habitsData")) || {};

function saveHabits() {
  localStorage.setItem("habitsData", JSON.stringify(habitsData));
  localStorage.setItem("defaultHabits", JSON.stringify(defaultHabits));
}

/*********************************
 * PLAYER LOAD
 *********************************/
const characters = {
  STRIKER: { displayName: "STRIKER", image: "striker_jk.png" },
  CATH_GEMS: { displayName: "CATH_GEMS", image: "cath_gems.png" }
};

let player = localStorage.getItem("player");
if (!player) window.location.href = "select.html";

document.getElementById("playerName").innerText = `PLAYER: ${characters[player].displayName}`;
document.getElementById("playerImg").src = characters[player].image;

/*********************************
 * UI HELPERS
 *********************************/
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function goBack() {
  window.location.href = "select.html";
}

function logSystem(msg) {
  console.log("[SYSTEM]", msg);
}

function showPopup(msg) {
  const popup = document.getElementById("popup");
  popup.innerText = msg;
  popup.classList.remove("hidden");
  setTimeout(() => popup.classList.add("hidden"), 3000);
}

/*********************************
 * XP UI (DAILY)
 *********************************/
function calculateDailyXP(date) {
  const habits = habitsData[date];
  if (!habits) return 0;

  const total = Object.keys(habits).length;
  const done = Object.values(habits).filter(v => v).length;
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

function updateXPUI(date) {
  const xp = calculateDailyXP(date);
  document.getElementById("xpFill").style.width = xp + "%";
  document.getElementById("xpText").innerText = `${xp} / 100 XP`;
  document.getElementById("playerLevel").innerText = `LV. ${level}`;
}

/*********************************
 * HABITS LOGIC
 *********************************/
function loadHabitsForDate(date) {
  initDailyProgress(date);
  if (!habitsData[date]) {
    habitsData[date] = {};
    defaultHabits.forEach(h => habitsData[date][h.id] = false);
    saveHabits();
  }
  renderHabits(date);
  updateXPUI(date);
}

function toggleHabit(id) {
  const date = getSelectedDateKey();

  // ❌ prevent editing past days
  if (isPastDate(date)) {
    showPopup("Past days are locked.");
    return;
  }

  if (isBeforeGameStart(date)) return;

  habitsData[date][id] = !habitsData[date][id];
  saveHabits();

  renderHabits(date);
  updateXPUI(date);
  checkDailyCompletion(date);
}


function renderHabits(date) {
  const list = document.getElementById("habitList");
  list.innerHTML = "";
  defaultHabits.forEach(h => {
    list.innerHTML += `
      <div class="habit-item">
        <span>${h.name}</span>
        <button onclick="toggleHabit('${h.id}')">${habitsData[date][h.id] ? "✔" : "Complete"}</button>
      </div>
    `;
  });
}

/*********************************
 * DAILY COMPLETION → STORY ASCENSION
 *********************************/
function checkDailyCompletion(date) {
  if (dailyProgress[date].completed) return;

  if (calculateDailyXP(date) < 100) return;

  dailyProgress[date].completed = true;
  level += 1;
  storyProgress += 1;

  saveDailyProgress();
  saveLevel();
  saveStoryProgress();

  renderStoryTower();

  showPopup(`ASCENDED → FLOOR ${storyProgress}`);
  logSystem(`STORY UNLOCKED → ${storyNodes[storyProgress - 1]?.title || "UNKNOWN"}`);
}

/*********************************
 * STORY TOWER (QUESTS TAB)
 *********************************/
const TOTAL_FLOORS = 30;

function renderStoryTower() {
  const tower = document.getElementById("storyTower");
  if (!tower) return;

  tower.innerHTML = "";

  for (let i = 1; i <= TOTAL_FLOORS; i++) {
    let cls = "story-floor locked";
    if (i <= storyProgress) cls = "story-floor completed";
    else if (i === storyProgress + 1) cls = "story-floor current";

    tower.innerHTML += `
      <div class="${cls}" onclick="${i <= storyProgress ? `openStory(${i})` : ''}">
        <div>FLOOR ${i}</div>
        <small>${i <= storyProgress ? "COMPLETED" : i === storyProgress + 1 ? "CURRENT" : "LOCKED"}</small>
      </div>
    `;
  }
}

function openStory(i) {
  const node = storyNodes[i - 1];
  if (!node) return;
  alert(`FLOOR ${node.id}: ${node.title}\n\n${node.text}`);
}

/*********************************
 * DATE SELECTORS
 *********************************/
const monthSelect = document.getElementById("habitMonth");
const daySelect = document.getElementById("habitDay");

function populateMonths() {
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  monthSelect.innerHTML = months.map((m,i)=>`<option value="${i}">${m}</option>`).join("");
}

function populateDays(m,y) {
  const days = new Date(y, m+1, 0).getDate();
  daySelect.innerHTML = Array.from({length:days},(_,i)=>`<option>${String(i+1).padStart(2,"0")}</option>`).join("");
}

function getSelectedDateKey() {
  const y = new Date().getFullYear();
  return `${y}-${String(+monthSelect.value+1).padStart(2,"0")}-${daySelect.value}`;
}

/*********************************
 * INIT
 *********************************/
(function init(){
  const today = new Date();
  populateMonths();
  monthSelect.value = today.getMonth();
  populateDays(today.getMonth(), today.getFullYear());
  daySelect.value = String(today.getDate()).padStart(2,"0");

  loadHabitsForDate(getSelectedDateKey());
  renderStoryTower();
})();

function isPastDate(date) {
  const today = getTodayKey();
  return date < today;
}

function exportProgress() {
  const data = {
    dailyProgress,
    habitsData,
    defaultHabits,
    storyProgress,
    level,
    exportedAt: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `hakai_progress_${getTodayKey()}.json`;
  a.click();
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const data = JSON.parse(reader.result);

    dailyProgress = data.dailyProgress || {};
    habitsData = data.habitsData || {};
    defaultHabits = data.defaultHabits || defaultHabits;
    storyProgress = data.storyProgress || 0;
    level = data.level || 1;

    localStorage.setItem("dailyProgress", JSON.stringify(dailyProgress));
    localStorage.setItem("habitsData", JSON.stringify(habitsData));
    localStorage.setItem("defaultHabits", JSON.stringify(defaultHabits));
    localStorage.setItem("storyProgress", storyProgress);
    localStorage.setItem("level", level);

    location.reload();
  };
  reader.readAsText(file);
}

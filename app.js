const towerEls = {
  A: document.getElementById("towerA"),
  B: document.getElementById("towerB"),
  C: document.getElementById("towerC"),
};

const movesEl = document.getElementById("moves");
const minMovesEl = document.getElementById("minMoves");
const diskCountEl = document.getElementById("diskCount");
const btnReset = document.getElementById("btnReset");
const btnSolve = document.getElementById("btnSolve");

let towers = { A: [], B: [], C: [] }; // cada torre guarda tamaños (1 = más pequeño)
let selectedTower = null;
let moves = 0;
let solving = false;

function calcMinMoves(n) {
  // 2^n - 1
  return (1 << n) - 1; // válido para n <= 30 aprox.
}

function resetGame() {
  solving = false;
  const n = Number(diskCountEl.value);

  towers = { A: [], B: [], C: [] };
  for (let size = n; size >= 1; size--) towers.A.push(size);

  moves = 0;
  selectedTower = null;

  movesEl.textContent = moves;
  minMovesEl.textContent = calcMinMoves(n);

  render();
}

function render() {
  // limpiar DOM
  Object.values(towerEls).forEach(el => el.innerHTML = "");

  // dibujar discos
  for (const key of ["A", "B", "C"]) {
    const stack = towers[key];
    stack.forEach(size => {
      const disk = document.createElement("div");
      disk.className = "disk";
      // ancho proporcional
      const width = 40 + size * 22; // ajusta a gusto
      disk.style.width = `${width}px`;
      disk.dataset.size = String(size);

      towerEls[key].appendChild(disk);
    });
  }

  // resaltar selección
  document.querySelectorAll(".tower").forEach(t => t.classList.remove("selected"));
  if (selectedTower) {
    document.querySelector(`.tower[data-tower="${selectedTower}"]`)?.classList.add("selected");
    // marcar el disco superior como held
    const topDisk = towerEls[selectedTower].querySelector(".disk:last-child");
    if (topDisk) topDisk.classList.add("held");
  }
}

function canMove(from, to) {
  if (towers[from].length === 0) return false;
  const moving = towers[from][towers[from].length - 1];
  const targetTop = towers[to][towers[to].length - 1];
  if (targetTop === undefined) return true;
  return moving < targetTop;
}

function doMove(from, to) {
  const disk = towers[from].pop();
  towers[to].push(disk);
  moves++;
  movesEl.textContent = moves;
  render();
  checkWin();
}

function checkWin() {
  const n = Number(diskCountEl.value);
  if (towers.C.length === n) {
    setTimeout(() => alert(`¡Ganaste! Movimientos: ${moves} (mínimo: ${calcMinMoves(n)})`), 50);
  }
}

function onTowerClick(towerKey) {
  if (solving) return;

  if (!selectedTower) {
    // seleccionar origen si tiene discos
    if (towers[towerKey].length === 0) return;
    selectedTower = towerKey;
    render();
    return;
  }

  // si ya hay seleccionado, intentar soltar en destino
  const from = selectedTower;
  const to = towerKey;

  if (from === to) {
    selectedTower = null;
    render();
    return;
  }

  if (canMove(from, to)) {
    doMove(from, to);
  }
  selectedTower = null;
  render();
}

// listeners torres
document.querySelectorAll(".tower").forEach(tower => {
  tower.addEventListener("click", () => {
    onTowerClick(tower.dataset.tower);
  });
});

btnReset.addEventListener("click", resetGame);
diskCountEl.addEventListener("change", resetGame);

// 5) Auto-solver (opcional, pero “pro”)
function hanoi(n, from, aux, to, outMoves) {
  if (n === 0) return;
  hanoi(n - 1, from, to, aux, outMoves);
  outMoves.push([from, to]);
  hanoi(n - 1, aux, from, to, outMoves);
}

async function playMoves(movesList, delayMs = 350) {
  solving = true;
  selectedTower = null;
  render();

  for (const [from, to] of movesList) {
    if (!solving) break;
    doMove(from, to);
    await new Promise(r => setTimeout(r, delayMs));
  }
  solving = false;
}

btnSolve.addEventListener("click", () => {
  resetGame();
  const n = Number(diskCountEl.value);
  const list = [];
  hanoi(n, "A", "B", "C", list);
  playMoves(list, 300);
});

// init
resetGame();

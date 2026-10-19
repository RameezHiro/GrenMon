import {
  CREATURES,
  INTERACTABLES,
  MAP,
  PLAYER_START,
  createBattle,
  findInteractable,
  getFacingPosition,
  getTile,
  movePlayer,
  resolveTurn,
  shouldEncounter,
} from './domain.js';

const canvas = document.querySelector('#game-canvas');
const ctx = canvas.getContext('2d');
const messageLog = document.querySelector('#message-log');
const liveRegion = document.querySelector('#live-region');
const playerHp = document.querySelector('#player-hp');
const modeLabel = document.querySelector('#mode-label');
const dialogueCard = document.querySelector('#dialogue-card');
const dialogueSpeaker = document.querySelector('#dialogue-speaker');
const dialogueText = document.querySelector('#dialogue-text');
const dialogueDismiss = document.querySelector('#dialogue-dismiss');
const battleActions = document.querySelector('#battle-actions');
const attackButton = document.querySelector('#attack-button');
const retreatButton = document.querySelector('#retreat-button');

const TILE = 32;
const WORLD_X = 48;
const WORLD_Y = 84;
const WORLD_WIDTH = MAP[0].length * TILE;
const WORLD_HEIGHT = MAP.length * TILE;
const ink = '#152f2c';
const inkSoft = '#3b5751';
const paper = '#f3e7c7';
const paperLight = '#fff6dc';
const paperDeep = '#e7d4a6';
const coral = '#ef7258';
const citron = '#c9dc57';
const blue = '#416f9f';

const state = {
  mode: 'world',
  player: { ...PLAYER_START },
  playerCreature: { ...CREATURES.spriggle },
  dialogue: null,
  encounterCooldown: 3,
  battle: null,
  message: 'The trail is waiting. Use the keys to make the first mark.',
  lastEncounterRoll: null,
};

ctx.imageSmoothingEnabled = false;
canvas.tabIndex = 0;

function setMessage(message) {
  state.message = message;
  messageLog.textContent = message;
  liveRegion.textContent = message;
}

function drawText(text, x, y, size = 14, color = ink, weight = '700', align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px "Trebuchet MS", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(text, x, y);
}

function drawPixelRect(x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
}

function drawPaperTexture(x, y, width, height, density = 60) {
  ctx.save();
  ctx.globalAlpha = 0.13;
  for (let index = 0; index < density; index += 1) {
    const dotX = x + ((index * 83) % Math.max(1, width));
    const dotY = y + ((index * 47) % Math.max(1, height));
    drawPixelRect(dotX, dotY, index % 3 === 0 ? 2 : 1, 1, ink);
  }
  ctx.restore();
}

function drawPageFrame() {
  drawPixelRect(0, 0, canvas.width, canvas.height, paper);
  drawPaperTexture(0, 0, canvas.width, canvas.height, 165);
  drawPixelRect(20, 22, 660, 580, paperLight);
  drawPixelRect(20, 22, 660, 580, 'transparent');
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 22, 660, 580);
  drawPixelRect(32, 38, 8, 8, coral);
  drawPixelRect(42, 38, 8, 8, citron);
  drawText('GREΝMON / ROUTE PLATE', 60, 47, 11, ink, '900');
  drawText('SUNWAKE / 001', 664, 47, 10, coral, '900', 'right');
}

function tileRect(x, y) {
  return { x: WORLD_X + x * TILE, y: WORLD_Y + y * TILE };
}

function drawGrassTile(x, y) {
  const { x: px, y: py } = tileRect(x, y);
  drawPixelRect(px, py, TILE, TILE, citron);
  drawPixelRect(px + 5, py + 23, 3, 6, inkSoft);
  drawPixelRect(px + 8, py + 18, 3, 11, inkSoft);
  drawPixelRect(px + 11, py + 13, 3, 16, coral);
  drawPixelRect(px + 19, py + 21, 3, 8, inkSoft);
  drawPixelRect(px + 22, py + 16, 3, 13, inkSoft);
  drawPixelRect(px + 25, py + 12, 2, 17, coral);
}

function drawPathTile(x, y) {
  const { x: px, y: py } = tileRect(x, y);
  const shade = (x + y) % 3 === 0 ? '#eadbb1' : paperDeep;
  drawPixelRect(px, py, TILE, TILE, shade);
  if ((x * 5 + y * 3) % 4 === 0) drawPixelRect(px + 7, py + 8, 2, 2, inkSoft);
  if ((x * 3 + y) % 5 === 0) drawPixelRect(px + 23, py + 23, 2, 2, coral);
}

function drawWallTile(x, y) {
  const { x: px, y: py } = tileRect(x, y);
  drawPixelRect(px, py, TILE, TILE, ink);
  drawPixelRect(px + 2, py + 3, 5, 2, coral);
  drawPixelRect(px + 20, py + 8, 4, 2, citron);
  drawPixelRect(px + 11, py + 25, 7, 2, inkSoft);
}

function drawSign(x, y) {
  const { x: px, y: py } = tileRect(x, y);
  drawPixelRect(px + 14, py + 17, 4, 13, ink);
  drawPixelRect(px + 5, py + 8, 22, 11, coral);
  drawPixelRect(px + 7, py + 10, 18, 7, paperLight);
  drawPixelRect(px + 10, py + 12, 11, 2, ink);
}

function drawMara(x, y) {
  const { x: px, y: py } = tileRect(x, y);
  drawPixelRect(px + 7, py + 25, 18, 4, inkSoft);
  drawPixelRect(px + 9, py + 6, 14, 11, coral);
  drawPixelRect(px + 7, py + 9, 18, 8, coral);
  drawPixelRect(px + 11, py + 13, 10, 8, paperLight);
  drawPixelRect(px + 9, py + 20, 14, 9, blue);
  drawPixelRect(px + 6, py + 21, 5, 8, blue);
  drawPixelRect(px + 21, py + 21, 5, 8, blue);
  drawPixelRect(px + 12, py + 15, 2, 2, ink);
  drawPixelRect(px + 19, py + 15, 2, 2, ink);
}

function drawPlayer(x, y, facing) {
  const { x: px, y: py } = tileRect(x, y);
  drawPixelRect(px + 6, py + 26, 20, 3, inkSoft);
  drawPixelRect(px + 8, py + 7, 16, 13, blue);
  drawPixelRect(px + 10, py + 3, 12, 7, coral);
  drawPixelRect(px + 11, py + 13, 10, 8, paperLight);
  drawPixelRect(px + 9, py + 20, 14, 9, ink);
  drawPixelRect(px + 7, py + 20, 4, 7, ink);
  drawPixelRect(px + 21, py + 20, 4, 7, ink);
  const eyeX = facing === 'left' ? px + 11 : facing === 'right' ? px + 19 : px + 17;
  drawPixelRect(eyeX, py + 15, 2, 2, ink);
}

function drawWorld() {
  drawPageFrame();
  for (let y = 0; y < MAP.length; y += 1) {
    for (let x = 0; x < MAP[y].length; x += 1) {
      const tile = MAP[y][x];
      if (tile === '#') drawWallTile(x, y);
      else if (tile === 'g') drawGrassTile(x, y);
      else drawPathTile(x, y);
    }
  }

  drawSign(5, 12);
  drawMara(3, 10);
  drawPlayer(state.player.x, state.player.y, state.player.facing);

  drawPixelRect(48, 548, 640, 54, paperLight);
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2;
  ctx.strokeRect(48, 548, 640, 54);
  drawText('LIVE FIELD POSITION', 62, 568, 10, coral, '900');
  drawText(`${String(state.player.x).padStart(2, '0')} / ${String(state.player.y).padStart(2, '0')}`, 62, 589, 16, ink, '900');
  drawText('SPACE / E TO INSPECT', 674, 584, 10, inkSoft, '900', 'right');
}

function drawCreature(creature, x, y, scale = 1, mirrored = false) {
  ctx.save();
  if (mirrored) {
    ctx.translate(x, 0);
    ctx.scale(-1, 1);
    x = 0;
  }

  const px = (offsetX, offsetY, width, height, color) => {
    drawPixelRect(x + offsetX * scale, y + offsetY * scale, width * scale, height * scale, color);
  };

  drawPixelRect(x - 48 * scale, y + 48 * scale, 96 * scale, 10 * scale, inkSoft);
  if (creature.id === 'spriggle') {
    // Spriggle is a leafy seedling with a broad leaf-tail and little root feet.
    px(25, -6, 28, 12, ink);
    px(43, -17, 19, 14, ink);
    px(52, -28, 12, 14, ink);
    px(34, -19, 25, 10, citron);
    px(48, -28, 11, 11, '#e8f1b5');
    px(-25, -57, 18, 23, ink);
    px(7, -58, 18, 24, ink);
    px(-22, -61, 12, 20, citron);
    px(10, -62, 14, 21, '#e8f1b5');
    px(-31, -38, 62, 18, ink);
    px(-37, -22, 74, 35, ink);
    px(-29, 11, 58, 27, ink);
    px(-22, 31, 16, 16, ink);
    px(7, 31, 16, 16, ink);
    px(-25, -35, 50, 15, creature.color);
    px(-30, -20, 60, 30, creature.color);
    px(-22, 9, 44, 25, '#8aa33f');
    px(-16, 30, 11, 12, '#8aa33f');
    px(7, 30, 11, 12, '#8aa33f');
    px(-24, -27, 13, 8, '#e8f1b5');
    px(11, -27, 13, 8, '#e8f1b5');
    px(-20, -12, 7, 8, ink);
    px(13, -12, 7, 8, ink);
    px(-17, -10, 2, 2, paperLight);
    px(16, -10, 2, 2, paperLight);
    px(-8, 3, 16, 4, ink);
    px(-5, 8, 10, 3, coral);
    px(-38, -2, 12, 8, coral);
    px(26, -2, 12, 8, coral);
    px(-22, 42, 10, 5, ink);
    px(12, 42, 10, 5, ink);
  } else {
    // Embercub is a flame-eared cub with a curled ember tail and visible paws.
    px(27, 10, 22, 12, ink);
    px(42, 0, 20, 13, ink);
    px(53, -12, 15, 15, ink);
    px(57, -24, 10, 15, coral);
    px(45, 0, 18, 8, coral);
    px(55, -12, 11, 12, '#fac1b0');
    px(-25, -57, 18, 28, ink);
    px(8, -58, 19, 29, ink);
    px(-21, -61, 10, 24, coral);
    px(11, -62, 12, 25, '#fac1b0');
    px(-33, -34, 66, 17, ink);
    px(-40, -18, 80, 36, ink);
    px(-33, 15, 66, 27, ink);
    px(-23, 34, 18, 13, ink);
    px(6, 34, 18, 13, ink);
    px(-27, -30, 54, 15, creature.color);
    px(-34, -14, 68, 29, creature.color);
    px(-27, 15, 54, 22, '#b84138');
    px(-17, 18, 34, 17, '#ef7258');
    px(-24, -23, 15, 8, '#fac1b0');
    px(9, -23, 15, 8, '#fac1b0');
    px(-20, -10, 8, 8, paperLight);
    px(12, -10, 8, 8, paperLight);
    px(-17, -7, 3, 3, ink);
    px(15, -7, 3, 3, ink);
    px(-11, 5, 22, 6, ink);
    px(-5, 11, 10, 3, '#fac1b0');
    px(-40, -3, 13, 8, citron);
    px(27, -3, 13, 8, citron);
    px(-24, 42, 13, 5, ink);
    px(11, 42, 13, 5, ink);
  }
  ctx.restore();
}

function drawBattleCard(x, y, width, creature, isEnemy = false) {
  drawPixelRect(x, y, width, 70, paperLight);
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, 70);
  drawText(creature.name.toUpperCase(), x + 13, y + 24, 14, ink, '900');
  drawText(`LV ${String(creature.level).padStart(2, '0')} / ${creature.type.toUpperCase()}`, x + 13, y + 43, 9, coral, '900');
  drawText(`${creature.hp} / ${creature.maxHp}`, x + width - 12, y + 25, 11, ink, '900', 'right');
  drawPixelRect(x + 13, y + 52, width - 26, 8, paperDeep);
  const ratio = creature.maxHp ? creature.hp / creature.maxHp : 0;
  drawPixelRect(x + 13, y + 52, (width - 26) * ratio, 8, ratio < 0.35 ? coral : citron);
  if (isEnemy) drawPixelRect(x + width - 21, y + 11, 8, 8, coral);
  else drawPixelRect(x + width - 21, y + 11, 8, 8, blue);
}

function drawBattle() {
  drawPageFrame();
  drawPixelRect(WORLD_X, WORLD_Y, WORLD_WIDTH, WORLD_HEIGHT, '#b8cfae');
  drawPaperTexture(WORLD_X, WORLD_Y, WORLD_WIDTH, WORLD_HEIGHT, 90);
  drawPixelRect(WORLD_X, WORLD_Y + 300, WORLD_WIDTH, 148, '#d7df9a');
  drawPixelRect(WORLD_X + 58, WORLD_Y + 318, 188, 12, citron);
  drawPixelRect(WORLD_X + 410, WORLD_Y + 170, 152, 12, citron);
  drawPixelRect(WORLD_X + 82, WORLD_Y + 330, 128, 5, coral);
  drawPixelRect(WORLD_X + 444, WORLD_Y + 182, 98, 5, coral);
  drawText('BATTLE / SPECIMEN 02', WORLD_X + 18, WORLD_Y + 24, 11, ink, '900');
  drawText(state.battle.outcome === 'active' ? 'THE GRASS ANSWERS' : state.battle.outcome.toUpperCase(), WORLD_X + WORLD_WIDTH - 18, WORLD_Y + 24, 11, coral, '900', 'right');

  drawBattleCard(WORLD_X + 372, WORLD_Y + 40, 234, state.battle.enemy, true);
  drawBattleCard(WORLD_X + 24, WORLD_Y + 352, 234, state.battle.player);
  drawCreature(state.battle.enemy, WORLD_X + 490, WORLD_Y + 157, 1.25, true);
  drawCreature(state.battle.player, WORLD_X + 174, WORLD_Y + 296, 1.25);

  drawPixelRect(WORLD_X + 18, WORLD_Y + 408, WORLD_WIDTH - 36, 72, paperLight);
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2;
  ctx.strokeRect(WORLD_X + 18, WORLD_Y + 408, WORLD_WIDTH - 36, 72);
  const recentLogs = state.battle.log.slice(-2);
  recentLogs.forEach((line, index) => drawText(`› ${line}`, WORLD_X + 32, WORLD_Y + 435 + index * 20, 12, index === 0 ? ink : inkSoft, index === 0 ? '900' : '700'));
}

function redraw() {
  if (state.mode === 'world') drawWorld();
  else drawBattle();
}

function updateUi() {
  const hp = state.mode === 'battle' && state.battle ? state.battle.player.hp : state.playerCreature.hp;
  playerHp.textContent = `${hp} / ${state.playerCreature.maxHp}`;
  modeLabel.textContent = state.mode === 'battle' ? 'BATTLE / LIVE' : 'EXPLORATION / LIVE';
  battleActions.hidden = state.mode !== 'battle';
  if (state.mode === 'battle' && state.battle) {
    const finished = state.battle.outcome !== 'active';
    attackButton.textContent = finished ? 'Return to Trail' : 'Vine Snap';
    attackButton.innerHTML = `${finished ? 'Return to Trail' : 'Vine Snap'} <span>${finished ? 'SPACE' : '1'}</span>`;
    retreatButton.innerHTML = `Retreat <span>2</span>`;
    const note = document.querySelector('.battle-note');
    note.textContent = finished
      ? state.battle.outcome === 'victory' ? 'The field note is complete. Return when you are ready.' : 'The trail carried you home. Your companion is resting.'
      : 'A clean hit ends the study. If your HP reaches zero, the trail brings you home.';
  }
}

function openDialogue(target) {
  state.dialogue = { target, index: 0 };
  dialogueSpeaker.textContent = target.speaker;
  dialogueText.textContent = target.lines[0];
  dialogueCard.hidden = false;
  setMessage(`${target.speaker}: ${target.lines[0]}`);
  redraw();
}

function advanceDialogue() {
  if (!state.dialogue) return;
  const nextIndex = state.dialogue.index + 1;
  if (nextIndex >= state.dialogue.target.lines.length) {
    state.dialogue = null;
    dialogueCard.hidden = true;
    setMessage('The note is filed. The trail is yours again.');
  } else {
    state.dialogue.index = nextIndex;
    const line = state.dialogue.target.lines[nextIndex];
    dialogueText.textContent = line;
    setMessage(`${state.dialogue.target.speaker}: ${line}`);
  }
  redraw();
}

function tryInteract() {
  const facing = getFacingPosition(state.player);
  const target = findInteractable(INTERACTABLES, facing);
  if (!target) {
    setMessage('Only paper, stone, and tall grass answer that way.');
    redraw();
    return;
  }
  openDialogue(target);
}

function enterBattle() {
  state.mode = 'battle';
  state.battle = createBattle(state.playerCreature, CREATURES.embercub);
  state.lastEncounterRoll = null;
  setMessage('A wild Embercub stepped from the grass. Choose a move.');
  updateUi();
  redraw();
}

function returnToTrail(message = 'The trail is quiet again.') {
  state.mode = 'world';
  state.battle = null;
  state.playerCreature.hp = state.playerCreature.maxHp;
  state.encounterCooldown = 5;
  setMessage(message);
  updateUi();
  redraw();
  canvas.focus();
}

function performAttack() {
  if (!state.battle) return;
  if (state.battle.outcome !== 'active') {
    returnToTrail(state.battle.outcome === 'victory' ? 'Victory filed. The grass remembers your name.' : 'The trail brought you home. Spriggle is ready when you are.');
    return;
  }
  state.battle = resolveTurn(state.battle, 'vineSnap', Math.random());
  setMessage(state.battle.log[state.battle.log.length - 1]);
  updateUi();
  redraw();
}

function retreat() {
  returnToTrail('You stepped away from the tall grass. Curiosity can wait.');
}

function move(direction) {
  const next = movePlayer(MAP, state.player, direction);
  const moved = next.x !== state.player.x || next.y !== state.player.y;
  state.player = next;
  if (!moved) {
    setMessage('A dark ink wall blocks the route. Try another line.');
    redraw();
    return;
  }

  state.encounterCooldown = Math.max(0, state.encounterCooldown - 1);
  const tile = getTile(MAP, state.player.x, state.player.y);
  if (tile === 'g') {
    if (state.encounterCooldown === 0) {
      const roll = Math.random();
      state.lastEncounterRoll = roll;
      if (shouldEncounter(tile, roll, 0.22)) {
        enterBattle();
        return;
      }
    }
    setMessage('The bright grass shivers under your next step.');
  } else {
    setMessage('A new tile, a new mark.');
  }
  redraw();
}

function handleKeyDown(event) {
  const key = event.key.toLowerCase();
  if (state.dialogue) {
    if (key === ' ' || key === 'enter' || key === 'e') {
      event.preventDefault();
      advanceDialogue();
    }
    return;
  }

  if (state.mode === 'battle') {
    if (key === '1' || key === ' ') {
      event.preventDefault();
      performAttack();
    } else if (key === '2' || key === 'escape') {
      event.preventDefault();
      retreat();
    }
    return;
  }

  const directions = {
    w: 'up', arrowup: 'up',
    s: 'down', arrowdown: 'down',
    a: 'left', arrowleft: 'left',
    d: 'right', arrowright: 'right',
  };
  if (directions[key]) {
    event.preventDefault();
    move(directions[key]);
  } else if (key === ' ' || key === 'e') {
    event.preventDefault();
    tryInteract();
  }
}

dialogueDismiss.addEventListener('click', advanceDialogue);
attackButton.addEventListener('click', performAttack);
retreatButton.addEventListener('click', retreat);
window.addEventListener('keydown', handleKeyDown);
canvas.addEventListener('click', () => canvas.focus());

updateUi();
redraw();
canvas.focus();

import * as THREE from 'three';
import {
  CONDITIONS,
  HABITAT,
  MONSTERS,
  MOVES,
  PLAYER_MOVES,
  TYPES,
  canCapture,
  captureChance,
  calculateDamage,
  cloneMonster,
  encounterForHabitat,
  movePlayer,
  resolveTurn,
} from './domain.js';

const root = document.querySelector('#scene-root');
const sceneKicker = document.querySelector('#scene-kicker');
const sceneReadout = document.querySelector('#scene-readout');
const sceneCaption = document.querySelector('#scene-caption');
const modeLabel = document.querySelector('#mode-label');
const conditionLabel = document.querySelector('#condition-label');
const messageTitle = document.querySelector('#message-title');
const messageCopy = document.querySelector('#message-copy');
const targetBlock = document.querySelector('#target-block');
const battleBlock = document.querySelector('#battle-block');
const targetName = document.querySelector('#target-name');
const targetSpecies = document.querySelector('#target-species');
const targetHp = document.querySelector('#target-hp');
const targetHpMeter = document.querySelector('#target-hp-meter');
const captureLabel = document.querySelector('#capture-label');
const captureChanceLabel = document.querySelector('#capture-chance');
const playerHp = document.querySelector('#player-hp');
const playerHpMeter = document.querySelector('#player-hp-meter');
const playerLevel = document.querySelector('#player-level');
const playerName = document.querySelector('#player-name');
const playerSpecies = document.querySelector('#player-species');
const moveGrid = document.querySelector('#move-grid');
const captureButton = document.querySelector('#capture-button');
const leaveButton = document.querySelector('#leave-button');
const fieldLog = document.querySelector('#field-log');
const capturedList = document.querySelector('#captured-list');
const capturedCount = document.querySelector('#captured-count');
const touchControls = document.querySelector('.touch-controls');
const toast = document.querySelector('#toast');
const liveRegion = document.querySelector('#live-region');

const palette = { ink: 0x112b29, inkSoft: 0x47625d, paper: 0xf1e5c5, paperLight: 0xfff6dc, coral: 0xef7157, citron: 0xc8dc58, meadow: 0x9fbeaa, deepMeadow: 0x739a85, water: 0x78b8c8, stone: 0xb9a879 };
const state = {
  mode: 'world',
  condition: 'clear',
  playerPosition: { x: HABITAT.start.x, y: 0, z: HABITAT.start.z, facing: 'up' },
  player: cloneMonster(MONSTERS.spriggle),
  target: null,
  battleLog: [],
  worldGroup: null,
  battleGroup: null,
  playerMesh: null,
  targetMesh: null,
  steps: 0,
  captured: loadCaptured(),
};

const scene = new THREE.Scene();
scene.background = new THREE.Color(palette.meadow);
const camera = new THREE.OrthographicCamera(-8, 8, 5, -5, 0.1, 100);
camera.position.set(9, 12, 10);
camera.lookAt(0, 0, 0);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
root.append(renderer.domElement);

const hemi = new THREE.HemisphereLight(0xfff3cf, 0x31564d, 2.2);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffe3ae, 3.2);
sun.position.set(-6, 12, 7);
sun.castShadow = true;
scene.add(sun);

function material(color, roughness = 1) { return new THREE.MeshStandardMaterial({ color, roughness, flatShading: true }); }
function box(width, height, depth, color, y = height / 2) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material(color));
  mesh.position.y = y;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}
function addLog(text) {
  state.battleLog.unshift(text);
  fieldLog.innerHTML = state.battleLog.slice(0, 4).map((line) => `<li>${line}</li>`).join('');
  liveRegion.textContent = text;
}
function showToast(text) { toast.textContent = text; toast.classList.add('visible'); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove('visible'), 2600); }
function setMessage(title, copy) { messageTitle.textContent = title; messageCopy.textContent = copy; }
function setCondition(condition) { state.condition = condition; const details = CONDITIONS[condition]; conditionLabel.textContent = details.label.toUpperCase(); }
function updateMeter(element, value, max) { element.style.width = `${Math.max(0, Math.min(100, value / max * 100))}%`; }

function loadCaptured() {
  try {
    const stored = JSON.parse(localStorage.getItem('grenmon-captured') || '[]');
    return ['spriggle', ...stored.filter((id) => id !== 'spriggle' && MONSTERS[id])].filter((id, index, list) => list.indexOf(id) === index);
  } catch {
    return ['spriggle'];
  }
}

function saveCaptured() {
  localStorage.setItem('grenmon-captured', JSON.stringify(state.captured.filter((id) => id !== 'spriggle')));
}

function renderCaptured() {
  capturedCount.textContent = String(state.captured.length).padStart(2, '0');
  capturedList.innerHTML = state.captured.map((id) => {
    const monster = MONSTERS[id];
    const type = monster.type === 'ember' ? 'ember' : monster.type === 'tide' ? 'tide' : 'leaf';
    return `<li><span class="captured-mark ${type}">${monster.name.slice(0, 1)}</span><span><strong>${monster.name}</strong><small>${monster.species.toUpperCase()} / ${TYPES[monster.type].label.toUpperCase()}</small></span><em>LV ${String(monster.level).padStart(2, '0')}</em></li>`;
  }).join('');
}

function monsterMesh(monster, facing = 1) {
  const group = new THREE.Group();
  const body = box(1.3, 1.25, 1, new THREE.Color(monster.color).getHex(), .82);
  body.scale.x = facing;
  group.add(body);
  const belly = box(.86, .55, 1.04, new THREE.Color(monster.accent).getHex(), .63);
  belly.position.z = -.06;
  group.add(belly);
  const head = box(1.45, .82, 1.06, new THREE.Color(monster.color).getHex(), 1.6);
  head.position.z = -.04;
  group.add(head);
  const eyeMaterial = material(palette.ink);
  [-.34, .34].forEach((x) => { const eye = new THREE.Mesh(new THREE.BoxGeometry(.12, .15, .08), eyeMaterial); eye.position.set(x * facing, 1.72, -.56); group.add(eye); });
  const earMaterial = material(new THREE.Color(monster.accent).getHex());
  const earGeometry = monster.id === 'spriggle' ? new THREE.ConeGeometry(.3, .7, 4) : new THREE.ConeGeometry(.34, .75, 4);
  [-.45, .45].forEach((x) => { const ear = new THREE.Mesh(earGeometry, earMaterial); ear.position.set(x * facing, 2.22, 0); ear.rotation.z = facing * (x > 0 ? -.23 : .23); ear.castShadow = true; group.add(ear); });
  const footMaterial = material(palette.ink);
  [-.38, .38].forEach((x) => { const foot = new THREE.Mesh(new THREE.BoxGeometry(.3, .22, .56), footMaterial); foot.position.set(x * facing, .12, -.22); foot.castShadow = true; group.add(foot); });
  const tail = new THREE.Mesh(new THREE.TorusGeometry(.34, .1, 4, 8, Math.PI * 1.6), material(monster.id === 'spriggle' ? palette.citron : palette.coral));
  tail.rotation.x = Math.PI / 2; tail.position.set(-.9 * facing, .82, .05); tail.castShadow = true; group.add(tail);
  if (monster.id === 'spriggle') {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(.35, .85, 4), material(palette.citron));
    leaf.position.set(0, 2.75, .02); leaf.rotation.z = .22; leaf.castShadow = true; group.add(leaf);
  } else {
    const flame = new THREE.Mesh(new THREE.ConeGeometry(.28, .65, 5), material(palette.coral));
    flame.position.set(.78 * facing, 1.35, -.05); flame.rotation.z = -.75 * facing; flame.castShadow = true; group.add(flame);
  }
  return group;
}

function adventurerMesh() {
  const group = new THREE.Group();
  const jacket = box(.72, 1.05, .5, palette.blue, .68);
  jacket.position.z = .03;
  group.add(jacket);
  const vest = box(.42, .64, .53, palette.coral, .84);
  vest.position.z = -.24;
  group.add(vest);
  const head = new THREE.Mesh(new THREE.BoxGeometry(.58, .64, .58), material(0xe3ae7d));
  head.position.set(0, 1.58, -.02);
  head.castShadow = true;
  group.add(head);
  const hair = new THREE.Mesh(new THREE.BoxGeometry(.62, .2, .62), material(palette.ink));
  hair.position.set(0, 1.9, .01);
  hair.castShadow = true;
  group.add(hair);
  const hat = new THREE.Mesh(new THREE.ConeGeometry(.52, .42, 4), material(palette.coral));
  hat.position.set(0, 2.25, .02);
  hat.rotation.y = Math.PI / 4;
  hat.castShadow = true;
  group.add(hat);
  const hatBand = box(.68, .1, .68, palette.ink, 2.16);
  group.add(hatBand);
  [-.5, .5].forEach((x) => {
    const arm = box(.22, .75, .28, palette.blue, .72);
    arm.position.x = x;
    arm.rotation.z = x > 0 ? -.14 : .14;
    group.add(arm);
  });
  [-.2, .2].forEach((x) => {
    const leg = box(.24, .7, .3, palette.ink, .35);
    leg.position.x = x;
    group.add(leg);
  });
  const backpack = box(.52, .7, .22, palette.coral, .74);
  backpack.position.set(0, .78, .34);
  group.add(backpack);
  const lens = new THREE.Mesh(new THREE.BoxGeometry(.12, .12, .08), material(palette.citron));
  lens.position.set(.2, 1.58, -.34);
  group.add(lens);
  return group;
}

function clearGroup(group) { if (group) scene.remove(group); }
function makeTree(x, z, scale = 1) {
  const tree = new THREE.Group(); tree.position.set(x, 0, z); tree.scale.setScalar(scale);
  tree.add(box(.28, 1.2, .28, palette.ink, .6));
  const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(.95, 0), material(palette.deepMeadow)); crown.position.y = 1.75; crown.castShadow = true; tree.add(crown); return tree;
}
function makeGrass(x, z) {
  const group = new THREE.Group(); group.position.set(x, 0, z);
  for (let i = 0; i < 4; i += 1) { const blade = new THREE.Mesh(new THREE.ConeGeometry(.06, .5 + (i % 2) * .18, 3), material(palette.citron)); blade.position.set((i - 1.5) * .14, .25, ((i * 3) % 2) * .12); blade.rotation.z = (i - 1.5) * .22; group.add(blade); } return group;
}
function makeMarker(x, z) { const marker = new THREE.Group(); marker.position.set(x, 0, z); marker.add(box(.12, .7, .12, palette.ink, .35)); marker.add(box(.9, .35, .12, palette.coral, .85)); return marker; }
function makePond(x, z, scale = 1) {
  const pond = new THREE.Group(); pond.position.set(x, .04, z); pond.scale.setScalar(scale);
  const water = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.65, .08, 8), material(palette.water, .45)); water.scale.z = .7; water.receiveShadow = true; pond.add(water);
  const bank = new THREE.Mesh(new THREE.TorusGeometry(1.68, .12, 4, 8), material(palette.stone)); bank.rotation.x = Math.PI / 2; bank.scale.z = .7; bank.position.y = -.01; pond.add(bank);
  return pond;
}
function makeRock(x, z, scale = 1) {
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(.42, 0), material(palette.stone)); rock.position.set(x, .35 * scale, z); rock.scale.set(scale, scale * .75, scale * .8); rock.castShadow = true; return rock;
}
function makeFlower(x, z, color = palette.coral) {
  const flower = new THREE.Group(); flower.position.set(x, 0, z); flower.add(box(.05, .42, .05, palette.deepMeadow, .21));
  const bloom = new THREE.Mesh(new THREE.IcosahedronGeometry(.16, 0), material(color)); bloom.position.y = .52; bloom.castShadow = true; flower.add(bloom); return flower;
}
function makeLog(x, z, rotation = 0) {
  const log = new THREE.Mesh(new THREE.CylinderGeometry(.2, .25, 1.4, 6), material(palette.coral)); log.position.set(x, .25, z); log.rotation.z = Math.PI / 2; log.rotation.y = rotation; log.castShadow = true; return log;
}

function buildWorld() {
  clearGroup(state.worldGroup); clearGroup(state.battleGroup);
  const group = new THREE.Group(); state.worldGroup = group; scene.add(group);
  const ground = new THREE.Mesh(new THREE.BoxGeometry(HABITAT.width, .22, HABITAT.height), material(palette.paperDeep ?? palette.paper)); ground.position.y = -.12; ground.receiveShadow = true; group.add(ground);
  const path = new THREE.Mesh(new THREE.BoxGeometry(3.2, .05, HABITAT.height), material(palette.paperLight)); path.position.set(-3.2, .02, 0); group.add(path);
  for (let x = -6; x <= 6; x += 1.5) for (let z = -4; z <= 4; z += 1.5) if (Math.abs(x - HABITAT.grass.x) > 1.5 || Math.abs(z - HABITAT.grass.z) > 1.5) group.add(makeGrass(x, z));
  [[-5, -3, 1.1], [5, -3, 1.2], [5, 3, .9], [-5, 3, 1]].forEach(([x, z, scale]) => group.add(makeTree(x, z, scale)));
  group.add(makePond(4.4, -2.7, 1.05));
  [[-1.8, -3.7, .7], [1.5, 3.3, .55], [5.1, .8, .65], [-5.5, .5, .75]].forEach(([x, z, scale]) => group.add(makeRock(x, z, scale)));
  [[-1.6, -1.2, palette.coral], [-.8, -1.5, palette.citron], [2.3, 1.8, palette.coral], [5.2, -1.1, palette.citron], [-5.2, 1.6, palette.coral]].forEach(([x, z, color]) => group.add(makeFlower(x, z, color)));
  group.add(makeLog(-.4, 2.8, .22));
  group.add(makeMarker(HABITAT.grass.x, HABITAT.grass.z));
  const shrine = box(1.5, 1.1, .7, palette.stone, .55); shrine.position.set(HABITAT.shrine.x, 0, HABITAT.shrine.z); group.add(shrine);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.3, .7, 4), material(palette.coral)); roof.position.set(HABITAT.shrine.x, 1.45, HABITAT.shrine.z); roof.rotation.y = Math.PI / 4; roof.castShadow = true; group.add(roof);
  state.playerMesh = adventurerMesh(); state.playerMesh.position.set(state.playerPosition.x, 0, state.playerPosition.z); group.add(state.playerMesh);
  camera.position.set(9, 12, 10); camera.lookAt(0, 0, 0); camera.zoom = 1.15; camera.updateProjectionMatrix();
}

function buildBattle() {
  clearGroup(state.worldGroup); clearGroup(state.battleGroup);
  const group = new THREE.Group(); state.battleGroup = group; scene.add(group);
  const floor = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, .25, 8), material(palette.paperLight)); floor.position.y = -.12; floor.receiveShadow = true; group.add(floor);
  const backWall = box(11, .7, .35, state.condition === 'mist' ? palette.inkSoft : palette.deepMeadow, .35); backWall.position.set(0, .1, 3.3); group.add(backWall);
  const arenaStone = new THREE.Mesh(new THREE.DodecahedronGeometry(.7, 0), material(palette.stone)); arenaStone.position.set(-4, .55, 2.5); arenaStone.castShadow = true; group.add(arenaStone);
  const arenaTree = makeTree(4, 2.6, .75); group.add(arenaTree);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(3.4, .06, 4, 8), material(palette.coral)); ring.rotation.x = Math.PI / 2; ring.position.y = .04; group.add(ring);
  state.targetMesh = monsterMesh(state.target, -1); state.targetMesh.position.set(2.5, 0, -.6); state.targetMesh.scale.setScalar(1.12); group.add(state.targetMesh);
  state.playerMesh = monsterMesh(state.player, 1); state.playerMesh.position.set(-2.5, 0, .8); state.playerMesh.scale.setScalar(1.05); group.add(state.playerMesh);
  camera.position.set(9, 7, 11); camera.lookAt(0, .7, 0); camera.zoom = 1.05; camera.updateProjectionMatrix();
}

function resize() { const width = root.clientWidth; const height = Math.max(280, root.clientHeight || Math.min(680, width * .68)); renderer.setSize(width, height, false); if (state.mode === 'world') { camera.left = -9; camera.right = 9; camera.top = 5.8; camera.bottom = -5.8; } else { camera.left = -8; camera.right = 8; camera.top = 5; camera.bottom = -5; } camera.updateProjectionMatrix(); }
function animate() { requestAnimationFrame(animate); if (state.playerMesh) state.playerMesh.rotation.y = Math.sin(performance.now() * .002) * .025; if (state.targetMesh) state.targetMesh.rotation.y = Math.sin(performance.now() * .002 + 1) * .035; renderer.render(scene, camera); }

function updatePlayerUi() { playerName.textContent = state.player.name; playerSpecies.textContent = `${state.player.species.toUpperCase()} / ${TYPES[state.player.type].label.toUpperCase()}`; playerLevel.textContent = String(state.player.level).padStart(2, '0'); playerHp.textContent = `${state.player.hp} / ${state.player.maxHp}`; updateMeter(playerHpMeter, state.player.hp, state.player.maxHp); }
function updateTargetUi() { if (!state.target) return; targetName.textContent = state.target.name; targetSpecies.textContent = `${state.target.species.toUpperCase()} / ${TYPES[state.target.type].label.toUpperCase()}`; targetHp.textContent = `${state.target.hp} / ${state.target.maxHp}`; updateMeter(targetHpMeter, state.target.hp, state.target.maxHp); const ready = canCapture(state.target, state.condition); captureLabel.textContent = ready ? 'SIGNAL WEAKENED — READY' : 'TRACKED — NOT READY'; captureChanceLabel.textContent = `CAPTURE ODDS ${Math.round(captureChance(state.target, state.condition) * 100)}%`; captureButton.hidden = !ready; }
function renderMoves() { moveGrid.innerHTML = PLAYER_MOVES.map((id, index) => { const move = MOVES[id]; return `<button class="move-button" data-move="${id}" type="button"><strong>${index + 1}. ${move.name}</strong><small>${TYPES[move.type].label.toUpperCase()} / ${move.power} PWR</small><em>${move.description}</em></button>`; }).join(''); moveGrid.querySelectorAll('[data-move]').forEach((button) => button.addEventListener('click', () => performMove(button.dataset.move))); }
function showBattleUi() { targetBlock.hidden = false; battleBlock.hidden = false; modeLabel.textContent = 'ENCOUNTER / LIVE'; sceneKicker.textContent = 'ENCOUNTER 01 / SPECIMEN PROTOCOL'; sceneReadout.textContent = 'FIXED ARENA / 3D'; setMessage(`Wild ${state.target.name} detected.`, 'Read its type, choose a move, and weaken the signal before deploying a field capsule.'); renderMoves(); updateTargetUi(); }
function leaveBattle() { state.mode = 'world'; state.target = null; setCondition('clear'); targetBlock.hidden = true; battleBlock.hidden = true; modeLabel.textContent = 'HABITAT / LIVE'; sceneKicker.textContent = 'HABITAT 01 / SUNWAKE MEADOW'; sceneReadout.textContent = 'FIELD OF VIEW 42°'; sceneCaption.innerHTML = '<strong>Track the rustle.</strong><span>Move with WASD or arrow keys. Walk into the marked habitat to find a specimen.</span>'; buildWorld(); resize(); setMessage('The meadow settles.', 'A good field researcher knows when to leave a signal undisturbed.'); }
function startEncounter() { state.mode = 'battle'; state.target = cloneMonster(MONSTERS[encounterForHabitat(Math.random())]); state.battleLog = [`${state.target.name} entered the marked habitat.`]; setCondition('clear'); buildBattle(); resize(); showBattleUi(); addLog(`${state.target.name} entered the marked habitat.`); }
function performMove(moveId) { if (!state.target || state.target.hp <= 0) return; const move = MOVES[moveId]; setCondition(move.condition); const result = resolveTurn({ player: state.player, enemy: state.target, moveId, condition: state.condition, roll: Math.random() }); state.player = result.player; state.target = result.enemy; addLog(result.log[0]); if (result.log[1]) addLog(result.log[1]); updatePlayerUi(); updateTargetUi(); if (result.outcome === 'victory') { setMessage(`${state.target.name} is still.`, 'The signal is weakened enough to capture. Deploy a field capsule or leave the habitat.'); showToast('Signal weakened — capture window open.'); } else if (result.outcome === 'defeat') { setMessage('Spriggle needs a rest.', 'The field was too hot. Return to the meadow and try another approach.'); showToast('Your active specimen fainted.'); } else { setMessage(`${state.target.name} is reading the field.`, `${TYPES[state.target.type].label} against ${TYPES[state.player.type].label}. Use the condition markers to find an edge.`); } }
function captureTarget() { if (!state.target || !canCapture(state.target, state.condition)) return; const chance = captureChance(state.target, state.condition); if (Math.random() <= chance) { const captured = state.target.name; if (!state.captured.includes(state.target.id)) { state.captured.push(state.target.id); saveCaptured(); renderCaptured(); } addLog(`${captured} accepted the field capsule.`); showToast(`${captured} joined the field log.`); setMessage(`${captured} is catalogued.`, 'The next evolution branch is now visible in your research notes.'); leaveBattle(); } else { addLog(`${state.target.name} broke the capsule seal.`); setMessage(`${state.target.name} resisted capture.`, 'The signal is still weak enough to try again.'); showToast('Capture failed — keep reading the field.'); } }
function tryMove(direction) { if (state.mode !== 'world') return; const current = { x: Math.round(state.playerPosition.x + 4), y: Math.round(state.playerPosition.z + 4), facing: state.playerPosition.facing }; const next = movePlayer(['........', '........', '........', '........', '........', '........', '........', '........'], current, direction); state.playerPosition = { ...state.playerPosition, x: next.x - 4, z: next.y - 4, facing: direction }; state.steps += 1; if (state.playerMesh) { state.playerMesh.position.x = state.playerPosition.x; state.playerMesh.position.z = state.playerPosition.z; } if (Math.abs(state.playerPosition.x - HABITAT.grass.x) < 1.2 && Math.abs(state.playerPosition.z - HABITAT.grass.z) < 1.2 && state.steps > 2) startEncounter(); }
function handleKey(event) { const key = event.key.toLowerCase(); if (state.mode === 'battle') { if (key >= '1' && key <= '4') performMove(PLAYER_MOVES[Number(key) - 1]); else if (key === ' ' && !captureButton.hidden) captureTarget(); else if (key === 'escape') leaveBattle(); return; } const direction = { w: 'up', arrowup: 'up', s: 'down', arrowdown: 'down', a: 'left', arrowleft: 'left', d: 'right', arrowright: 'right' }[key]; if (direction) { event.preventDefault(); tryMove(direction); } }

document.addEventListener('keydown', handleKey);
touchControls.querySelectorAll('[data-direction]').forEach((button) => button.addEventListener('pointerdown', (event) => { event.preventDefault(); tryMove(button.dataset.direction); }));
captureButton.addEventListener('click', captureTarget);
leaveButton.addEventListener('click', leaveBattle);
window.addEventListener('resize', resize);
updatePlayerUi(); renderCaptured(); buildWorld(); resize(); animate();

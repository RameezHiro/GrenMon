export const MAP = [
  '####################',
  '#........#.........#',
  '#........#.........#',
  '#....#...#.........#',
  '#....#...#....gggg.#',
  '#........#....gggg.#',
  '#.######.#.........#',
  '#........#.........#',
  '#........#####.....#',
  '#........#.........#',
  '#....#...#.........#',
  '#....#.............#',
  '#..................#',
  '####################',
];

export const MAP_WIDTH = MAP[0].length;
export const MAP_HEIGHT = MAP.length;

export const PLAYER_START = { x: 2, y: 12, facing: 'up' };

export const INTERACTABLES = [
  {
    id: 'mara',
    kind: 'person',
    x: 3,
    y: 10,
    speaker: 'MARA / WAYFINDER',
    lines: [
      'Tall grass is a promise, not a shortcut.',
      'If something rustles, breathe first. Then choose your move.',
    ],
  },
  {
    id: 'trail-sign',
    kind: 'sign',
    x: 5,
    y: 12,
    speaker: 'TRAIL MARKER',
    lines: ['SUNWAKE TRAIL → Keep your eyes open near the bright grass.'],
  },
];

export const CREATURES = {
  spriggle: {
    id: 'spriggle',
    name: 'Spriggle',
    level: 4,
    type: 'leaf',
    maxHp: 28,
    hp: 28,
    color: '#c9dc57',
  },
  embercub: {
    id: 'embercub',
    name: 'Embercub',
    level: 3,
    type: 'spark',
    maxHp: 24,
    hp: 24,
    color: '#ef7258',
  },
};

export const MOVES = {
  vineSnap: { id: 'vineSnap', name: 'Vine Snap', power: 7 },
  emberPaw: { id: 'emberPaw', name: 'Ember Paw', power: 5 },
};

export function getTile(map, x, y) {
  return map[y]?.[x] ?? '#';
}

export function isWalkable(map, x, y) {
  return getTile(map, x, y) !== '#';
}

export function movePlayer(map, position, direction) {
  const deltas = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };
  const delta = deltas[direction];
  if (!delta) return { ...position };
  const next = { x: position.x + delta.x, y: position.y + delta.y, facing: direction };
  return isWalkable(map, next.x, next.y) ? next : { ...position, facing: direction };
}

export function getFacingPosition(position) {
  const deltas = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };
  const delta = deltas[position.facing] ?? deltas.down;
  return { x: position.x + delta.x, y: position.y + delta.y, facing: position.facing };
}

export function findInteractable(interactables, position) {
  return interactables.find((item) => item.x === position.x && item.y === position.y) ?? null;
}

export function shouldEncounter(tile, roll, threshold = 0.18) {
  return tile === 'g' && roll >= 0 && roll < threshold;
}

export function createBattle(player = CREATURES.spriggle, enemy = CREATURES.embercub) {
  return {
    player: { ...player },
    enemy: { ...enemy },
    log: [`A wild ${enemy.name} stepped from the grass.`],
    outcome: 'active',
  };
}

export function resolveTurn(battle, moveId = 'vineSnap', roll = 0.5) {
  if (battle.outcome !== 'active') return battle;
  const move = MOVES[moveId] ?? MOVES.vineSnap;
  const playerDamage = Math.max(1, move.power + Math.floor(Math.max(0, Math.min(0.999, roll)) * 3));
  const nextEnemyHp = Math.max(0, battle.enemy.hp - playerDamage);
  const playerLog = `${battle.player.name} used ${move.name}. ${playerDamage} damage.`;

  if (nextEnemyHp === 0) {
    return {
      ...battle,
      enemy: { ...battle.enemy, hp: 0 },
      log: [playerLog, `${battle.enemy.name} folded into the grass.`],
      outcome: 'victory',
    };
  }

  const enemyDamage = Math.max(1, MOVES.emberPaw.power + Math.floor(Math.max(0, Math.min(0.999, 1 - roll)) * 2));
  const nextPlayerHp = Math.max(0, battle.player.hp - enemyDamage);
  const enemyLog = `${battle.enemy.name} answered with Ember Paw. ${enemyDamage} damage.`;

  return {
    ...battle,
    player: { ...battle.player, hp: nextPlayerHp },
    enemy: { ...battle.enemy, hp: nextEnemyHp },
    log: [playerLog, enemyLog],
    outcome: nextPlayerHp === 0 ? 'defeat' : 'active',
  };
}

export const HABITAT = {
  width: 13,
  height: 9,
  start: { x: -4, z: 2 },
  grass: { x: 3, z: -2 },
  shrine: { x: -2, z: -3 },
  camp: { x: -4, z: 2 },
};

export const TYPES = {
  leaf: { label: 'Leaf', color: '#b7d94c', strongAgainst: ['tide', 'stone'], weakAgainst: ['ember', 'gale'] },
  ember: { label: 'Ember', color: '#f37557', strongAgainst: ['leaf', 'shade'], weakAgainst: ['tide', 'stone'] },
  tide: { label: 'Tide', color: '#63b9d5', strongAgainst: ['ember', 'stone'], weakAgainst: ['leaf', 'spark'] },
  stone: { label: 'Stone', color: '#c7a873', strongAgainst: ['ember', 'shade'], weakAgainst: ['tide', 'gale'] },
  gale: { label: 'Gale', color: '#e6c65b', strongAgainst: ['leaf', 'tide'], weakAgainst: ['stone', 'shade'] },
  shade: { label: 'Shade', color: '#8d7bc2', strongAgainst: ['gale', 'leaf'], weakAgainst: ['ember', 'stone'] },
};

export const CONDITIONS = {
  clear: { label: 'Clear air', icon: '✦', multiplier: 1 },
  mist: { label: 'Silver mist', icon: '≈', multiplier: 0.9 },
  charged: { label: 'Charged soil', icon: '⌁', multiplier: 1.1 },
};

export const MONSTERS = {
  spriggle: {
    id: 'spriggle', name: 'Spriggle', species: 'Rootling', level: 4, type: 'leaf', maxHp: 34,
    color: '#b7d94c', accent: '#eff3ae', captureRate: 1, evolution: 'bloomlet',
  },
  embercub: {
    id: 'embercub', name: 'Embercub', species: 'Cinder Cub', level: 3, type: 'ember', maxHp: 29,
    color: '#f37557', accent: '#ffd0a6', captureRate: 0.44, evolution: 'pyrolion',
  },
  tidefin: {
    id: 'tidefin', name: 'Tidefin', species: 'Pond Runner', level: 3, type: 'tide', maxHp: 31,
    color: '#63b9d5', accent: '#d1f4ed', captureRate: 0.56, evolution: 'marrowhale',
  },
  bloomlet: { id: 'bloomlet', name: 'Bloomlet', species: 'Canopy Sprite', level: 9, type: 'leaf', maxHp: 58, color: '#88b94e', accent: '#f2efb3', captureRate: 1 },
  pyrolion: { id: 'pyrolion', name: 'Pyrolion', species: 'Sun Mane', level: 9, type: 'ember', maxHp: 60, color: '#df5949', accent: '#ffd0a6', captureRate: 1 },
  marrowhale: { id: 'marrowhale', name: 'Marrowhale', species: 'Deep Current', level: 9, type: 'tide', maxHp: 62, color: '#438fb5', accent: '#d1f4ed', captureRate: 1 },
};

export const MOVES = {
  vineSnap: { id: 'vineSnap', name: 'Vine Snap', type: 'leaf', power: 8, accuracy: 0.95, condition: 'clear', description: 'A quick binding lash.' },
  emberPaw: { id: 'emberPaw', name: 'Ember Paw', type: 'ember', power: 7, accuracy: 0.92, condition: 'charged', description: 'A hot-footed strike.' },
  mistVeil: { id: 'mistVeil', name: 'Mist Veil', type: 'tide', power: 5, accuracy: 1, condition: 'mist', description: 'Muffles the next exchange.' },
  stonePeck: { id: 'stonePeck', name: 'Stone Peck', type: 'stone', power: 6, accuracy: 0.98, condition: 'clear', description: 'A mineral-tipped jab.' },
  galeRake: { id: 'galeRake', name: 'Gale Rake', type: 'gale', power: 7, accuracy: 0.9, condition: 'clear', description: 'A slicing current.' },
  shadeSiphon: { id: 'shadeSiphon', name: 'Shade Siphon', type: 'shade', power: 6, accuracy: 0.96, condition: 'mist', description: 'Pulls warmth from the field.' },
};

export const PLAYER_MOVES = ['vineSnap', 'mistVeil', 'galeRake', 'stonePeck'];

export function cloneMonster(monster) {
  return { ...monster, hp: monster.hp ?? monster.maxHp, moves: monster.moves ?? PLAYER_MOVES.slice(0, 4) };
}

export function typeMultiplier(moveType, targetType) {
  const type = TYPES[moveType];
  if (!type) return 1;
  if (type.strongAgainst.includes(targetType)) return 1.5;
  if (type.weakAgainst.includes(targetType)) return 0.65;
  return 1;
}

export function calculateDamage({ attacker, defender, move, condition = 'clear', roll = 0.5 }) {
  const conditionMultiplier = CONDITIONS[condition]?.multiplier ?? 1;
  const typeBonus = typeMultiplier(move.type, defender.type);
  const variance = 0.9 + Math.max(0, Math.min(0.999, roll)) * 0.2;
  const levelBonus = 1 + Math.max(0, attacker.level - defender.level) * 0.05;
  return Math.max(1, Math.floor(move.power * typeBonus * conditionMultiplier * variance * levelBonus));
}

export function movePlayer(map, position, direction) {
  const deltas = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
  const delta = deltas[direction];
  if (!delta) return { ...position };
  const next = { x: position.x + delta.x, y: position.y + delta.y, facing: direction };
  return map[next.y]?.[next.x] !== '#' ? next : { ...position, facing: direction };
}

export function encounterForHabitat(roll, choices = ['embercub', 'tidefin']) {
  const index = Math.min(choices.length - 1, Math.floor(Math.max(0, Math.min(0.999, roll)) * choices.length));
  return choices[index];
}

export function canCapture(monster, condition = 'clear') {
  const healthRatio = monster.hp / monster.maxHp;
  const conditionBonus = condition === 'mist' ? 0.12 : condition === 'charged' ? 0.04 : 0;
  return healthRatio <= 0.55 || conditionBonus > 0.1;
}

export function captureChance(monster, condition = 'clear') {
  const healthRatio = monster.hp / monster.maxHp;
  const conditionBonus = condition === 'mist' ? 0.18 : condition === 'charged' ? 0.06 : 0;
  return Math.min(0.96, monster.captureRate + (1 - healthRatio) * 0.42 + conditionBonus);
}

export function resolveTurn({ player, enemy, moveId, condition = 'clear', roll = 0.5 }) {
  const move = MOVES[moveId] ?? MOVES.vineSnap;
  const damage = calculateDamage({ attacker: player, defender: enemy, move, condition, roll });
  const enemyHp = Math.max(0, enemy.hp - damage);
  const log = [`${player.name} used ${move.name}. ${damage} impact.`];
  if (typeMultiplier(move.type, enemy.type) > 1) log.push(`Advantage: ${TYPES[move.type].label} cuts through ${TYPES[enemy.type].label}.`);
  if (enemyHp === 0) return { player, enemy: { ...enemy, hp: 0 }, log, outcome: 'victory', damage, move };

  const counterMove = MOVES[enemy.moves?.[0] ?? 'emberPaw'] ?? MOVES.emberPaw;
  const counterDamage = calculateDamage({ attacker: enemy, defender: player, move: counterMove, condition, roll: 1 - roll });
  const playerHp = Math.max(0, player.hp - counterDamage);
  log.push(`${enemy.name} answered with ${counterMove.name}. ${counterDamage} impact.`);
  return { player: { ...player, hp: playerHp }, enemy: { ...enemy, hp: enemyHp }, log, outcome: playerHp === 0 ? 'defeat' : 'active', damage, move };
}

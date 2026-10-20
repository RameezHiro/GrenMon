import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CONDITIONS,
  MONSTERS,
  MOVES,
  PLAYER_MOVES,
  calculateDamage,
  canCapture,
  captureChance,
  cloneMonster,
  encounterForHabitat,
  movePlayer,
  resolveTurn,
  typeMultiplier,
} from '../src/domain.js';

test('the starter has a focused four-move field loadout', () => {
  assert.equal(PLAYER_MOVES.length, 4);
  assert.ok(PLAYER_MOVES.every((id) => MOVES[id]));
});

test('type advantages and disadvantages are explicit and asymmetric', () => {
  assert.equal(typeMultiplier('leaf', 'tide'), 1.5);
  assert.equal(typeMultiplier('tide', 'leaf'), 0.65);
  assert.equal(typeMultiplier('leaf', 'stone'), 1.5);
  assert.equal(typeMultiplier('stone', 'leaf'), 1);
});

test('conditions modify damage without replacing type strategy', () => {
  const attacker = cloneMonster(MONSTERS.spriggle);
  const defender = cloneMonster(MONSTERS.embercub);
  const move = MOVES.vineSnap;
  const clearDamage = calculateDamage({ attacker, defender, move, condition: 'clear', roll: 0.5 });
  const mistDamage = calculateDamage({ attacker, defender, move, condition: 'mist', roll: 0.5 });
  assert.ok(clearDamage > mistDamage);
  assert.equal(CONDITIONS.mist.label, 'Silver mist');
});

test('movement updates the field position and blocks map edges', () => {
  const openMap = ['........', '........', '........'];
  const moved = movePlayer(openMap, { x: 2, y: 1, facing: 'up' }, 'right');
  assert.deepEqual(moved, { x: 3, y: 1, facing: 'right' });
  const blocked = movePlayer(['###', '#.#', '###'], { x: 1, y: 1, facing: 'up' }, 'up');
  assert.deepEqual(blocked, { x: 1, y: 1, facing: 'up' });
});

test('habitat encounters select from the local specimen pool', () => {
  assert.equal(encounterForHabitat(0), 'embercub');
  assert.equal(encounterForHabitat(0.99), 'tidefin');
});

test('the expanded habitat pool includes multiple new specimen types', () => {
  const encounters = [0, .2, .4, .6, .99].map((roll) => encounterForHabitat(roll));
  assert.deepEqual(encounters, ['embercub', 'pebblit', 'zephyroo', 'duskmite', 'tidefin']);
});

test('a turn applies damage, records an advantage, and allows capture after weakening', () => {
  const player = cloneMonster(MONSTERS.spriggle);
  const enemy = cloneMonster(MONSTERS.tidefin);
  const result = resolveTurn({ player, enemy, moveId: 'vineSnap', condition: 'clear', roll: 0 });
  assert.ok(result.damage > 0);
  assert.equal(result.log.some((line) => line.startsWith('Advantage:')), true);
  assert.equal(canCapture({ ...enemy, hp: 14 }, 'clear'), true);
  assert.ok(captureChance({ ...enemy, hp: 14 }, 'clear') > enemy.captureRate);
});

test('a mist move opens the capture window even before low health', () => {
  const target = { ...MONSTERS.embercub, hp: MONSTERS.embercub.maxHp };
  assert.equal(canCapture(target, 'clear'), false);
  assert.equal(canCapture(target, 'mist'), true);
});

test('a finishing turn has a stable victory result without a counterattack', () => {
  const player = cloneMonster(MONSTERS.spriggle);
  const enemy = { ...cloneMonster(MONSTERS.embercub), hp: 1 };
  const result = resolveTurn({ player, enemy, moveId: 'vineSnap', condition: 'clear', roll: 0 });
  assert.equal(result.outcome, 'victory');
  assert.equal(result.player.hp, player.hp);
  assert.equal(result.enemy.hp, 0);
});

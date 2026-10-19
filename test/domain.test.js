import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CREATURES,
  INTERACTABLES,
  MAP,
  createBattle,
  findInteractable,
  getFacingPosition,
  isWalkable,
  movePlayer,
  resolveTurn,
  shouldEncounter,
} from '../src/domain.js';

test('the authored map has a stable rectangular shape and outer walls', () => {
  assert.equal(MAP.length, 14);
  assert.equal(MAP[0].length, 20);
  assert.ok(MAP.every((row) => row.length === 20));
  assert.ok(MAP.every((row) => row.startsWith('#') && row.endsWith('#')));
  assert.ok(MAP[0].split('').every((tile) => tile === '#'));
});

test('movement keeps the player on walkable tiles and updates facing on blocked moves', () => {
  const start = { x: 2, y: 12, facing: 'up' };
  const moved = movePlayer(MAP, start, 'up');
  assert.deepEqual(moved, { x: 2, y: 11, facing: 'up' });

  const blocked = movePlayer(MAP, { x: 1, y: 3, facing: 'left' }, 'left');
  assert.equal(blocked.x, 1);
  assert.equal(blocked.y, 3);
  assert.equal(blocked.facing, 'left');
  assert.equal(isWalkable(MAP, blocked.x, blocked.y), true);
});

test('facing and interaction lookup select the tile directly in front of the player', () => {
  const facing = getFacingPosition({ x: 3, y: 11, facing: 'up' });
  assert.deepEqual(facing, { x: 3, y: 10, facing: 'up' });
  assert.equal(findInteractable(INTERACTABLES, facing)?.id, 'mara');
});

test('encounters only trigger in grass below the encounter threshold', () => {
  assert.equal(shouldEncounter('g', 0.17), true);
  assert.equal(shouldEncounter('g', 0.18), false);
  assert.equal(shouldEncounter('.', 0.01), false);
});

test('a deterministic battle turn damages both creatures and logs the exchange', () => {
  const battle = createBattle(
    { ...CREATURES.spriggle, hp: 28 },
    { ...CREATURES.embercub, hp: 24 },
  );
  const result = resolveTurn(battle, 'vineSnap', 0);
  assert.equal(result.player.hp, 22);
  assert.equal(result.enemy.hp, 17);
  assert.equal(result.outcome, 'active');
  assert.equal(result.log.length, 2);
});

test('a finishing attack returns a victory without allowing an enemy counterattack', () => {
  const battle = createBattle(
    { ...CREATURES.spriggle, hp: 28 },
    { ...CREATURES.embercub, hp: 3 },
  );
  const result = resolveTurn(battle, 'vineSnap', 0);
  assert.equal(result.enemy.hp, 0);
  assert.equal(result.player.hp, 28);
  assert.equal(result.outcome, 'victory');
});

test('a creature reaching zero HP produces a stable defeat result', () => {
  const battle = createBattle(
    { ...CREATURES.spriggle, hp: 4 },
    { ...CREATURES.embercub, hp: 24 },
  );
  const result = resolveTurn(battle, 'vineSnap', 0.999);
  assert.equal(result.player.hp, 0);
  assert.equal(result.outcome, 'defeat');
});

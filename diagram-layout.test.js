const { test } = require('node:test');
const assert = require('node:assert/strict');
const { clampDiagramOffset, routeDiagramEdge } = require('./diagram-layout.js');

const box = (x, y, width = 60, height = 40) => ({ x, y, width, height });

test('connections leave and enter the facing bounds in every direction', () => {
  const source = box(100, 100);
  for (const [target, valid] of [
    [box(300, 100), ({ start, end }) => start.x > 160 && end.x < 300 && start.x < end.x],
    [box(0, 100), ({ start, end }) => start.x < 100 && end.x > 60 && start.x > end.x],
    [box(100, 260), ({ start, end }) => start.y > 140 && end.y < 260 && start.y < end.y],
    [box(100, 0), ({ start, end }) => start.y < 100 && end.y > 40 && start.y > end.y]
  ]) assert.ok(valid(routeDiagramEdge(source, target)));
  const diagonal = routeDiagramEdge(source, box(280, 245));
  assert.match(diagonal.path, /^M.+ Q/);
  assert.doesNotMatch(diagonal.path, /NaN/);
});

test('overlapping shapes suppress the connection and it returns once separated', () => {
  const source = box(20, 20);
  assert.equal(routeDiagramEdge(source, box(45, 30)), null);
  assert.ok(routeDiagramEdge(source, box(240, 30)));
});

test('movement clamps to the current viewport including badges', () => {
  const view = box(10, 20, 200, 160);
  const icon = box(45, 50, 65, 80);
  assert.deepEqual(clampDiagramOffset({ x: -400, y: 500 }, icon, view), { x: -25, y: 40 });
  assert.deepEqual(clampDiagramOffset({ x: 12, y: -5 }, icon, view), { x: 12, y: -5 });
});

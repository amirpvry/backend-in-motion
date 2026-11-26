function routeDiagramEdge(source, target) {
  const center = box => ({ x: box.x + box.width / 2, y: box.y + box.height / 2 });
  const from = center(source);
  const to = center(target);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy);
  if (!distance) return null;

  const x = dx / distance;
  const y = dy / distance;
  const radius = box => Math.min(
    x ? box.width / (2 * Math.abs(x)) : Infinity,
    y ? box.height / (2 * Math.abs(y)) : Infinity
  );
  const startGap = radius(source) + 5;
  const endGap = radius(target) + 7;
  const span = distance - startGap - endGap;
  if (span < 12) return null;

  const start = { x: from.x + x * startGap, y: from.y + y * startGap };
  const end = { x: to.x - x * endGap, y: to.y - y * endGap };
  const bend = Math.min(span * .12, 23);
  const control = { x: (start.x + end.x) / 2 - y * bend, y: (start.y + end.y) / 2 + x * bend };
  const point = p => p.x.toFixed(2) + ' ' + p.y.toFixed(2);
  return { start, end, path: 'M' + point(start) + ' Q' + point(control) + ' ' + point(end) };
}

function clampDiagramOffset(offset, box, view) {
  const fit = (value, origin, size, start, length) => {
    const min = start + 10 - origin;
    const max = start + length - 10 - origin - size;
    return min > max ? (min + max) / 2 : Math.min(max, Math.max(min, value));
  };
  return {
    x: fit(offset.x, box.x, box.width, view.x, view.width),
    y: fit(offset.y, box.y, box.height, view.y, view.height)
  };
}

function createDiagramLayout(svg, arrangeButton, resetButton, help, status) {
  const layouts = new Map();
  const zero = { x: 0, y: 0 };
  const byId = new Map();
  let offsets;
  let links = [];
  let editing = false;
  let drag;

  function bounds(element) {
    const box = element.getBBox();
    const matrix = element.transform.baseVal.consolidate()?.matrix;
    if (!matrix) return { x: box.x, y: box.y, width: box.width, height: box.height };
    // Diagram groups use translations, and their artwork may have a uniform scale.
    return { x: box.x * matrix.a + matrix.e, y: box.y * matrix.d + matrix.f,
      width: box.width * matrix.a, height: box.height * matrix.d };
  }

  function place(node, offset) {
    node.offset = clampDiagramOffset(offset, node.box, svg.viewBox.baseVal);
    node.element.setAttribute('transform', 'translate(' + node.offset.x + ' ' + node.offset.y + ') ' + node.transform);
  }

  function boxFor(id, fallback) {
    const node = byId.get(id);
    return node ? { ...node.art, x: node.art.x + node.offset.x, y: node.art.y + node.offset.y } : fallback;
  }

  function refreshLinks() {
    for (const { group, path, from, to } of links) {
      const edge = routeDiagramEdge(boxFor(group.dataset.edgeFrom, from), boxFor(group.dataset.edgeTo, to));
      group.classList.toggle('link-obscured', !edge);
      if (edge) path.setAttribute('d', edge.path);
    }
  }

  function move(node, offset) {
    place(node, offset);
    offsets.set(node.element.dataset.layoutNode, node.offset);
    resetButton.disabled = false;
    refreshLinks();
  }

  function endDrag() {
    if (!drag) return;
    const pointerId = drag.pointerId;
    drag = undefined;
    svg.classList.remove('is-dragging');
    if (svg.hasPointerCapture(pointerId)) svg.releasePointerCapture(pointerId);
  }

  function syncControls() {
    svg.classList.toggle('is-arranging', editing);
    arrangeButton.setAttribute('aria-pressed', String(editing));
    help.hidden = !editing;
    resetButton.disabled = !offsets?.size;
    for (const { element, label } of byId.values()) {
      element.setAttribute('aria-label', editing ? label.replace(/^Inspect /, 'Move ') : label);
      if (editing) {
        element.setAttribute('aria-describedby', help.id);
        element.setAttribute('aria-keyshortcuts', 'ArrowLeft ArrowRight ArrowUp ArrowDown Escape');
      } else {
        element.removeAttribute('aria-describedby');
        element.removeAttribute('aria-keyshortcuts');
      }
      if (!element.hasAttribute('data-inspect')) element.setAttribute('tabindex', editing ? '0' : '-1');
    }
  }

  function render(id) {
    endDrag();
    if (!layouts.has(id)) layouts.set(id, new Map());
    offsets = layouts.get(id);
    byId.clear();
    for (const element of svg.querySelectorAll('[data-layout-node]')) {
      const transform = element.getAttribute('transform') || '';
      const matrix = element.transform.baseVal.consolidate()?.matrix;
      const shape = element.querySelector('.shape');
      const art = bounds(shape || element);
      if (shape && matrix) {
        art.x += matrix.e;
        art.y += matrix.f;
      }
      const node = { element, transform, art, box: bounds(element), offset: zero,
        label: element.getAttribute('aria-label') };
      const key = element.dataset.layoutNode;
      byId.set(key, node);
      if (offsets.has(key)) place(node, offsets.get(key));
    }
    links = Array.from(svg.querySelectorAll('[data-edge-from]'), group => {
      const path = group.querySelector('path');
      const point = at => {
        const { x, y } = path.getPointAtLength(at);
        return { x, y, width: 0, height: 0 };
      };
      return { group, path, from: point(0), to: point(path.getTotalLength()) };
    });
    refreshLinks();
    syncControls();
  }

  function point(event) {
    return new DOMPoint(event.clientX, event.clientY).matrixTransform(svg.getScreenCTM().inverse());
  }

  function getNode(event) {
    const element = event.target.closest('[data-layout-node]');
    return byId.get(element?.dataset.layoutNode);
  }

  arrangeButton.addEventListener('click', () => {
    endDrag();
    editing = !editing;
    syncControls();
  });
  resetButton.addEventListener('click', () => {
    endDrag();
    offsets.clear();
    for (const node of byId.values()) {
      node.offset = zero;
      node.element.setAttribute('transform', node.transform);
    }
    refreshLinks();
    syncControls();
    arrangeButton.focus();
    status.textContent = 'Original layout restored.';
  });
  svg.addEventListener('pointerdown', event => {
    if (!editing || drag || event.button !== 0) return;
    const node = getNode(event);
    if (!node) return;
    const start = point(event);
    node.element.focus({ preventScroll: true });
    drag = { node, start, offset: node.offset, pointerId: event.pointerId };
    svg.setPointerCapture(event.pointerId);
    svg.classList.add('is-dragging');
  });
  svg.addEventListener('pointermove', event => {
    if (drag?.pointerId !== event.pointerId) return;
    const position = point(event);
    const dx = position.x - drag.start.x;
    const dy = position.y - drag.start.y;
    if (dx || dy) move(drag.node, { x: drag.offset.x + dx, y: drag.offset.y + dy });
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    svg.addEventListener(type, event => {
      if (drag?.pointerId === event.pointerId) endDrag();
    });
  }
  svg.addEventListener('keydown', event => {
    if (!editing) return;
    if (event.key === 'Escape') {
      endDrag();
      editing = false;
      syncControls();
      arrangeButton.focus();
      event.preventDefault();
      return;
    }
    const node = getNode(event);
    const direction = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
    if (!node || !direction || event.altKey || event.ctrlKey || event.metaKey) return;
    const step = event.shiftKey ? 32 : 12;
    move(node, { x: node.offset.x + direction[0] * step, y: node.offset.y + direction[1] * step });
    event.preventDefault();
  });
  return { render, isEditing: () => editing };
}

if (typeof module !== 'undefined') module.exports = { routeDiagramEdge, clampDiagramOffset };

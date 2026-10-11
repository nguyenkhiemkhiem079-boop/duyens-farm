import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as THREE from 'three';
import { collectTodos, projectRoot, renderTodos } from '../../scripts/todos.mjs';
import { MON_FUR_COLOR } from '../core/constants';
import { createCatModel, createDuyenModel, createKhimModel } from '../models/characterModels';
import { STORY_CHAPTERS } from '../content/chapters';
import { INITIAL_JOURNAL_PAGES } from '../content/journal';
import { INITIAL_QUESTS } from '../content/quests';
import { INITIAL_LETTERS } from '../content/letters';
import { SaveSystem, createInitialGameState } from '../systems/saveSystem';
import { GameSimulation } from '../systems/GameSimulation';

const todoMarker = '[' + 'TODO';
const blocklist = ['áo sơ mi', 'chạy vội', 'mèo cam', 'hôn lễ', 'đám cưới'];

function contentFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? contentFiles(path) : entry.isFile() ? [path] : [];
  });
}

test('Nội dung không chứa các chi tiết cá nhân chưa xác nhận bị cấm', () => {
  for (const file of contentFiles(join(projectRoot, 'src/content'))) {
    const text = readFileSync(file, 'utf8').normalize('NFC').toLocaleLowerCase('vi');
    for (const term of blocklist) assert.ok(!text.includes(term), `${file}: ${term}`);
  }
});

test('Buổi hẹn chỉ dùng dữ kiện xác nhận; truyện hư cấu và thư thật có nhãn riêng', () => {
  const memories = [STORY_CHAPTERS.chapter_1, INITIAL_QUESTS.chapter_1, INITIAL_JOURNAL_PAGES.find(p => p.id === 'page_chapter_1')!];
  for (const memory of memories) {
    assert.equal(memory.fiction, false);
    assert.ok(JSON.stringify(memory).includes(`${todoMarker}: xác nhận chi tiết buổi hẹn đầu]`));
    assert.doesNotMatch(JSON.stringify(memory), /chỉnh lại|vuốt lại|bàn giao|ba chú mèo|cả tuần/);
  }
  for (const chapter of Object.values(STORY_CHAPTERS).filter(c => c.id !== 'chapter_1')) assert.equal(chapter.fiction, true);
  assert.equal(INITIAL_LETTERS.find(l => l.id === 'letter_family_placeholder')!.fiction, false);
  assert.ok(INITIAL_LETTERS.find(l => l.id === 'letter_family_placeholder')!.contentVi.includes(todoMarker + ':'));
  assert.ok(INITIAL_JOURNAL_PAGES.find(p => p.id === 'page_final_letter_locked')!.quoteVi.includes(todoMarker + ':'));
});

test('Danh sách TODO giữ file/dòng, nhiều marker, Unicode và không quét chính nó', () => {
  const root = mkdtempSync(join(tmpdir(), 'duyens-todos-'));
  try {
    mkdirSync(join(root, 'src/content'), { recursive: true });
    writeFileSync(join(root, 'src/content/a.ts'), `// dòng đầu\r\n// ${todoMarker}: tên quán] ${todoMarker}: màu | lông]\r\n`);
    writeFileSync(join(root, 'src/content/PLACEHOLDERS.md'), `${todoMarker}: không lặp lại]`);
    const rows = collectTodos(root);
    assert.deepEqual(rows, [
      { file: 'src/content/a.ts', line: 2, text: `${todoMarker}: tên quán]` },
      { file: 'src/content/a.ts', line: 2, text: `${todoMarker}: màu | lông]` },
    ]);
    assert.match(renderTodos(rows), /màu \\\| lông/);
    assert.equal(renderTodos(collectTodos(root)), renderTodos(rows));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('PLACEHOLDERS.md khớp nguồn hiện tại', () => {
  assert.equal(readFileSync(join(projectRoot, 'src/content/PLACEHOLDERS.md'), 'utf8'), renderTodos(collectTodos()));
});

function disposeModel(model: THREE.Object3D) {
  model.traverse(object => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose();
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) material.dispose();
    }
  });
}

test('Mon dùng màu xám placeholder chung, không suy đoán màu lông thật', () => {
  const mon = createCatModel('mon');
  try {
    const body = mon.children.find(object => object instanceof THREE.Mesh) as THREE.Mesh;
    assert.equal((body.material as THREE.MeshLambertMaterial).color.getHex(), MON_FUR_COLOR);
  } finally { disposeModel(mon); }
});

test('Mắt Duyên/Khim không bị tóc che ở tâm và các điểm trên mặt trước của mắt', () => {
  const models = [createKhimModel(), ...(['long', 'shoulder'] as const).flatMap(hairStyle =>
    (['yellow', 'cream'] as const).flatMap(outfit => [false, true].map(hat => createDuyenModel({ hairStyle, outfit, hat }))))];
  for (const model of models) {
    try {
      model.updateMatrixWorld(true);
      const hair = model.getObjectByName('hair')!;
      assert.ok(hair);
      for (const name of ['eyeL', 'eyeR']) {
        const eye = model.getObjectByName(name) as THREE.Mesh;
        assert.ok(eye);
        // Ray-test actual triangles, not the bounding box of a partial hair shell.
        for (const [x, y] of [[0, 0], [-0.6, 0], [0.6, 0], [0, 0.6], [0, -0.6]]) {
          const point = eye.localToWorld(new THREE.Vector3(x, y, Math.sqrt(1 - x * x - y * y)));
          const ray = new THREE.Raycaster(point.clone().add(new THREE.Vector3(0, 0, 2)), new THREE.Vector3(0, 0, -1), 0, 2.00001);
          assert.equal(ray.intersectObject(hair, true).length, 0, `${model.name}/${name} bị tóc che`);
          // A clear outward ray also guards against an eye inside the hair shell.
          const center = eye.getWorldPosition(new THREE.Vector3());
          const outward = new THREE.Raycaster(center, new THREE.Vector3(0, 0, 1));
          assert.equal(outward.intersectObject(hair, true).length, 0, `${model.name}/${name} nằm trong tóc`);
        }
      }
    } finally { disposeModel(model); }
  }
});

test('Save v4 giữ nguyên dữ liệu và đồ Mon đang giữ qua export/import, trả đúng một lần', () => {
  const state = createInitialGameState();
  state.completedQuests.chapter_1 = true;
  state.journal.page_chapter_1 = true;
  state.monTheft = { hasStolen: true, item: { id: 'crop_carrot', type: 'crop', name: 'Cà rốt', count: 1, value: 15, description: 'Cà rốt' }, stolenAtTime: 20, stolenDay: 1 };
  const result = SaveSystem.importSaveJson(SaveSystem.exportSaveJson(state));
  assert.equal(result.success, true);
  assert.deepEqual(result.state, state);
  assert.equal(result.state!.version, 4);
  const sim = new GameSimulation(result.state);
  sim.sleep();
  assert.equal(sim.state.inventory.crop_carrot.count, 1);
  sim.sleep();
  assert.equal(sim.state.inventory.crop_carrot.count, 1);
  assert.equal(sim.catchMon().recovered, false);
});

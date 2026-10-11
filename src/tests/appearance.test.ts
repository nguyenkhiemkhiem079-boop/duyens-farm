import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { human } from '../personalModels';
test('Duyên and Khim have visible eyes unobstructed by their hair', () => {
  for (const id of ['duyen', 'khim'] as const) {
    const model = human(id); model.updateMatrixWorld(true);
    for (const eyeName of ['eyeL', 'eyeR']) {
      const eye = model.getObjectByName(eyeName)!;
      const location = eye.getWorldPosition(new THREE.Vector3());
      const ray = new THREE.Raycaster(location.clone().add(new THREE.Vector3(0, 0, 2)), new THREE.Vector3(0, 0, -1), 0, 2);
      assert.equal(ray.intersectObject(model.getObjectByName('hair')!, true).length, 0, `${id} ${eyeName}`);
    }
  }
});

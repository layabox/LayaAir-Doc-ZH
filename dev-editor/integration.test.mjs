import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { resolveDocFile } from './integration.mjs';

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'laya-doc-editor-'));
  const area = path.join(root, 'IDE', 'uiEditor', 'Area2D');
  const ik = path.join(root, 'IDE', 'Component', '3DAnimation', 'ChainsIK');
  fs.mkdirSync(area, { recursive: true });
  fs.mkdirSync(ik, { recursive: true });
  fs.writeFileSync(path.join(area, 'index.mdx'), '---\nslug: "ide/uieditor/area2d"\n---\n');
  fs.writeFileSync(path.join(ik, 'index.md'), '---\nslug: "ide/component/3danimation/chainsik"\n---\n');
  return root;
}

test('部署前缀不会被误认为文档目录', (t) => {
  const docsDir = fixture();
  t.after(() => fs.rmSync(docsDir, { recursive: true, force: true }));

  assert.equal(
    resolveDocFile(docsDir, '/3.x/doc/ide/uieditor/area2d/', '/3.x/doc'),
    path.join(docsDir, 'IDE', 'uiEditor', 'Area2D', 'index.mdx'),
  );
  assert.equal(
    resolveDocFile(docsDir, '/3.x/doc/ide/component/3danimation/chainsik/', '/3.x/doc/'),
    path.join(docsDir, 'IDE', 'Component', '3DAnimation', 'ChainsIK', 'index.md'),
  );
});

test('无部署前缀时仍能定位文档', (t) => {
  const docsDir = fixture();
  t.after(() => fs.rmSync(docsDir, { recursive: true, force: true }));

  assert.equal(
    resolveDocFile(docsDir, '/ide/uieditor/area2d/', '/'),
    path.join(docsDir, 'IDE', 'uiEditor', 'Area2D', 'index.mdx'),
  );
});

const fs = require('fs');
const path = require('path');

const WORKFLOWS_DIR = path.join(__dirname, '..', 'workflows');
const MANIFEST_PATH = path.join(__dirname, '..', 'manifest', 'workflows.json');

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

manifest.forEach(item => {
  const catDir = path.join(WORKFLOWS_DIR, item.categorySlug);
  if (!fs.existsSync(catDir)) {
    fs.mkdirSync(catDir, { recursive: true });
  }

  const oldPath = path.join(WORKFLOWS_DIR, item.originalFilename);
  const newFilename = item.originalFilename;
  const newPath = path.join(catDir, newFilename);

  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`Moved ${item.originalFilename} -> ${item.categorySlug}/${newFilename}`);
  } else if (!fs.existsSync(newPath)) {
    console.warn(`File not found: ${oldPath} or ${newPath}`);
  }

  // Update item.workflow in manifest to match exact actual path
  item.workflow = `workflows/${item.categorySlug}/${newFilename}`;
});

fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
console.log('Successfully reorganized workflows into 10 domain subdirectories.');

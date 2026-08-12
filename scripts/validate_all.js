const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT_DIR, 'manifest', 'workflows.json');
const WORKFLOWS_DIR = path.join(ROOT_DIR, 'workflows');

console.log('🚀 Running AutomataX Comprehensive Repository Validator...\n');

let hasErrors = false;
let warningCount = 0;

// 1. Check Manifest File
if (!fs.existsSync(MANIFEST_PATH)) {
  console.error('❌ [CRITICAL] Manifest file missing: manifest/workflows.json');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
console.log(`✅ Loaded manifest with ${manifest.length} records.`);

if (manifest.length !== 100) {
  console.error(`❌ [FAIL] Expected 100 manifest entries, found ${manifest.length}`);
  hasErrors = true;
}

// Track IDs & Slugs for uniqueness
const seenIds = new Set();
const seenSlugs = new Set();

manifest.forEach((wf, index) => {
  const prefix = `[Workflow ${wf.id || index}]`;

  // ID Uniqueness
  if (seenIds.has(wf.id)) {
    console.error(`❌ ${prefix} Duplicate workflow ID: ${wf.id}`);
    hasErrors = true;
  }
  seenIds.add(wf.id);

  // Slug Uniqueness
  if (seenSlugs.has(wf.slug)) {
    console.error(`❌ ${prefix} Duplicate slug: ${wf.slug}`);
    hasErrors = true;
  }
  seenSlugs.add(wf.slug);

  // Workflow File Existence
  const wfPath = path.join(ROOT_DIR, wf.workflow);
  if (!fs.existsSync(wfPath)) {
    console.error(`❌ ${prefix} Workflow JSON file missing at: ${wf.workflow}`);
    hasErrors = true;
  } else {
    // Validate JSON Structure
    try {
      const jsonContent = fs.readFileSync(wfPath, 'utf8');
      const wJson = JSON.parse(jsonContent);

      if (!wJson.name) console.error(`❌ ${prefix} Workflow JSON missing "name" property`);
      if (!Array.isArray(wJson.nodes)) console.error(`❌ ${prefix} Workflow JSON missing "nodes" array`);
      if (typeof wJson.connections !== 'object') console.error(`❌ ${prefix} Workflow JSON missing "connections" object`);

      // Node ID Uniqueness & Secret Scanning
      const nodeIds = new Set();
      (wJson.nodes || []).forEach(node => {
        if (node.id) {
          if (nodeIds.has(node.id)) {
            console.error(`❌ ${prefix} Duplicate node ID inside JSON: ${node.id}`);
            hasErrors = true;
          }
          nodeIds.add(node.id);
        }

        const nodeStr = JSON.stringify(node);
        if (nodeStr.match(/("password"\s*:\s*"(?!\{\{).*?")/i) && !nodeStr.includes('={{$credentials')) {
          console.error(`❌ ${prefix} Potential plaintext password in node "${node.name}"`);
          hasErrors = true;
        }
        if (nodeStr.match(/("api[_-]?key"\s*:\s*"(?!\{\{).*?")/i) && !nodeStr.includes('={{$credentials')) {
          console.error(`❌ ${prefix} Potential plaintext API key in node "${node.name}"`);
          hasErrors = true;
        }
      });
    } catch (e) {
      console.error(`❌ ${prefix} Invalid JSON formatting: ${e.message}`);
      hasErrors = true;
    }
  }

  // Documentation File Existence
  const docPath = path.join(ROOT_DIR, wf.documentation);
  if (!fs.existsSync(docPath)) {
    console.error(`❌ ${prefix} Documentation file missing at: ${wf.documentation}`);
    hasErrors = true;
  }

  // Architecture SVG Asset Existence
  const svgPath = path.join(ROOT_DIR, 'assets', 'workflows', wf.id, 'architecture.svg');
  if (!fs.existsSync(svgPath)) {
    console.error(`❌ ${prefix} SVG Architecture asset missing at: assets/workflows/${wf.id}/architecture.svg`);
    hasErrors = true;
  }

  // Fixture Verification
  if (wf.maturity === 'demo-verified') {
    const inputFix = path.join(ROOT_DIR, 'fixtures', 'inputs', `${wf.id}.json`);
    const expectedFix = path.join(ROOT_DIR, 'fixtures', 'expected', `${wf.id}.json`);

    if (!fs.existsSync(inputFix) || !fs.existsSync(expectedFix)) {
      console.error(`❌ ${prefix} Maturity marked as demo-verified but missing fixture files in fixtures/`);
      hasErrors = true;
    }
  }
});

console.log('\n--- Validation Summary ---');
if (hasErrors) {
  console.error('🚨 Repository Validation FAILED! Please fix the errors above.');
  process.exit(1);
} else {
  console.log(`🎉 Repository Validation PASSED! All ${manifest.length} workflows, docs, manifest, and assets are fully synchronized and valid.`);
  process.exit(0);
}

const fs = require('fs');
const path = require('path');

const MANIFEST_PATH = path.join(__dirname, '..', 'manifest', 'workflows.json');

if (!fs.existsSync(MANIFEST_PATH)) {
  console.error('❌ Manifest file missing at manifest/workflows.json');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

// Verify manifest structure and update derived attributes
manifest.forEach(wf => {
  const jsonPath = path.join(__dirname, '..', wf.workflow);
  if (fs.existsSync(jsonPath)) {
    const wData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const nodes = wData.nodes || [];

    // Auto-detect trigger
    const triggerNode = nodes.find(n => n.type && (n.type.includes('webhook') || n.type.includes('cron') || n.type.includes('schedule') || n.type.includes('trigger')));
    if (triggerNode) {
      if (triggerNode.type.includes('cron') || triggerNode.type.includes('schedule')) wf.trigger = 'schedule';
      else if (triggerNode.type.includes('webhook')) wf.trigger = 'webhook';
      else wf.trigger = 'event';
    }
  }
});

fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
console.log(`Successfully verified and updated manifest/workflows.json (${manifest.length} records).`);

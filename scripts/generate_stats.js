const fs = require('fs');
const path = require('path');

const MANIFEST_PATH = path.join(__dirname, '..', 'manifest', 'workflows.json');
const STATS_JSON_PATH = path.join(__dirname, '..', 'manifest', 'stats.json');
const STATS_MD_PATH = path.join(__dirname, '..', 'docs', 'STATS.md');

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

let totalWorkflows = manifest.length;
let totalDomains = new Set(manifest.map(w => w.category)).size;
let aiWorkflows = manifest.filter(w => w.ai).length;
let webhookWorkflows = manifest.filter(w => w.trigger === 'webhook').length;
let scheduleWorkflows = manifest.filter(w => w.trigger === 'schedule').length;
let demoVerified = manifest.filter(w => w.maturity === 'demo-verified').length;
let blueprints = manifest.filter(w => w.maturity === 'architecture-blueprint').length;
let humanApprovalCount = manifest.filter(w => w.humanApproval).length;

let integrationsSet = new Set();
manifest.forEach(w => {
  w.integrations.forEach(i => integrationsSet.add(i));
});

const statsData = {
  totalWorkflows,
  totalDomains,
  uniqueIntegrations: integrationsSet.size,
  aiEnabledWorkflows: aiWorkflows,
  webhookTriggers: webhookWorkflows,
  scheduledTriggers: scheduleWorkflows,
  humanInTheLoopWorkflows: humanApprovalCount,
  maturityDistribution: {
    demoVerified,
    architectureBlueprint: blueprints
  },
  lastUpdated: "2026-08-12"
};

fs.writeFileSync(STATS_JSON_PATH, JSON.stringify(statsData, null, 2), 'utf8');

const statsMarkdown = `# 📊 AutomataX Repository Statistics

> Automatically compiled from \`manifest/workflows.json\`.

---

## 📈 System Metrics

| Metric | Count / Value |
| :--- | :---: |
| **Total Workflows** | **${totalWorkflows}** |
| **Enterprise Domains** | **${totalDomains}** |
| **Unique Integrations Cataloged** | **${integrationsSet.size}** |
| **AI-Enabled Automation Architectures** | **${aiWorkflows}** |
| **Webhook-Triggered Workflows** | **${webhookWorkflows}** |
| **Scheduled / Cron Workflows** | **${scheduleWorkflows}** |
| **Human-in-the-Loop Approval Workflows** | **${humanApprovalCount}** |

---

## 🏷 Maturity Distribution

| Maturity Level | Workflow Count | Percentage | Description |
| :--- | :---: | :---: | :--- |
| **Demo Verified** | **${demoVerified}** | **${((demoVerified / totalWorkflows) * 100).toFixed(1)}%** | Contains test fixtures, mock data paths, validated error handling, and parameter expressions. |
| **Architecture Blueprint** | **${blueprints}** | **${((blueprints / totalWorkflows) * 100).toFixed(1)}%** | Importable n8n workflow sequence representing verified system architecture without pre-bound credentials. |

---

## 🔗 Top Integrations

${Array.from(integrationsSet).slice(0, 15).map(i => `- \`${i}\``).join('\n')}
`;

fs.writeFileSync(STATS_MD_PATH, statsMarkdown, 'utf8');
console.log(`Generated docs/STATS.md and manifest/stats.json.`);

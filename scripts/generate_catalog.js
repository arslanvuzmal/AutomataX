const fs = require('fs');
const path = require('path');

const MANIFEST_PATH = path.join(__dirname, '..', 'manifest', 'workflows.json');
const CATALOG_DIR = path.join(__dirname, '..', 'catalog');
const ROOT_DIR = path.join(__dirname, '..');

if (!fs.existsSync(CATALOG_DIR)) {
  fs.mkdirSync(CATALOG_DIR, { recursive: true });
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

const CATEGORIES = [
  { slug: 'finops', catSlug: '01-finops', num: '01', name: 'FinOps & Revenue', file: 'finops.md', desc: 'Multi-currency revenue recognition, AP automation, budget vs actuals, cloud cost monitoring, and subscription dunning.' },
  { slug: 'hr', catSlug: '02-hr', num: '02', name: 'HR & Talent', file: 'hr.md', desc: 'Zero-touch onboarding, offboarding data loss prevention, performance review aggregation, sentiment risk alerting.' },
  { slug: 'supply-chain', catSlug: '03-supply-chain', num: '03', name: 'Supply Chain & Logistics', file: 'supply-chain.md', desc: 'Predictive inventory PO generation, freight delay rerouting, supplier scorecards, 3PL inventory reconciliation.' },
  { slug: 'customer-success', catSlug: '04-customer-success', num: '04', name: 'Customer Success', file: 'customer-success.md', desc: 'Product feature drop-off alerts, AI ticket triage, QBR deck generation, churn deflection, SLA escalation.' },
  { slug: 'sales-crm', catSlug: '05-sales-crm', num: '05', name: 'Sales & CRM', file: 'sales-crm.md', desc: 'Intelligent lead routing & scoring, stale deal detection, CPQ provisioning, competitor price scraping.' },
  { slug: 'itsm-devops', catSlug: '06-itsm-devops', num: '06', name: 'ITSM & DevOps', file: 'itsm-devops.md', desc: 'Incident war room creation, RBAC provisioning, AI CI/CD failure triage, self-healing database backup verification.' },
  { slug: 'marketing', catSlug: '07-marketing', num: '07', name: 'Marketing Operations', file: 'marketing.md', desc: 'End-to-end webinar ops, AI content syndication, ad spend pacing pause, technical SEO monitoring.' },
  { slug: 'legal-compliance', catSlug: '08-legal-compliance', num: '08', name: 'Legal & Compliance', file: 'legal-compliance.md', desc: 'Zero-friction mutual NDA generation, DSAR data extraction, continuous SOC 2 evidence collection, IP takedowns.' },
  { slug: 'data-engineering', catSlug: '09-data-engineering', num: '09', name: 'Data Engineering', file: 'data-engineering.md', desc: 'Self-healing ETL pipeline monitoring, data quality circuit breakers, schema evolution, PII masking.' },
  { slug: 'executive-operations', catSlug: '10-executive', num: '10', name: 'Executive Operations', file: 'executive-operations.md', desc: 'Board deck assembly, CEO morning briefing engine, M&A data room setup, executive OKR tracking.' }
];

// 1. Build catalog/README.md
let catalogReadme = `# 📚 AutomataX Automation Catalog

Welcome to the **AutomataX Master Automation Catalog**. This catalog indexes **100 enterprise business automation architectures** built for n8n.

---

## 🗂 Domains Overview

| Domain | Focus Area | Workflows | Category Page |
| :--- | :--- | :---: | :--- |
${CATEGORIES.map(c => `| **${c.num}. ${c.name}** | ${c.desc} | 10 | [View Category](./${c.file}) |`).join('\n')}

---

## ⚡ Master Index (100 Workflows)

`;

CATEGORIES.forEach(c => {
  const catWorkflows = manifest.filter(w => w.categorySlug === c.catSlug);

  catalogReadme += `### ${c.num}. ${c.name}\n\n`;
  catalogReadme += `![${c.name} Architecture](../assets/catalog/${c.slug}.svg)\n\n`;
  catalogReadme += `| ID | Name | Outcome | Maturity | Complexity | Trigger | AI | Links |\n`;
  catalogReadme += `| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :--- |\n`;

  catWorkflows.forEach(w => {
    const matBadge = w.maturity === 'demo-verified' ? '🟢 Demo Verified' : '🔵 Blueprint';
    const aiBadge = w.ai ? '🤖 Yes' : 'No';
    catalogReadme += `| **${w.id}** | [${w.name}](../${w.documentation}) | ${w.businessOutcome.substring(0, 70)}... | ${matBadge} | \`${w.complexity}\` | \`${w.trigger}\` | ${aiBadge} | [JSON](../${w.workflow}) · [Doc](../${w.documentation}) |\n`;
  });

  catalogReadme += `\n---\n\n`;
});

fs.writeFileSync(path.join(CATALOG_DIR, 'README.md'), catalogReadme, 'utf8');

// 2. Build Category Pages (catalog/finops.md, catalog/hr.md, etc.)
CATEGORIES.forEach(c => {
  const catWorkflows = manifest.filter(w => w.categorySlug === c.catSlug);

  let pageContent = `# ${c.num}. ${c.name} — AutomataX Catalog

![${c.name}](../assets/catalog/${c.slug}.svg)

> **Category Focus:** ${c.desc}

---

## 📋 Available Workflows

| ID | Name | Business Problem | Trigger | Integrations | Maturity | Links |
| :---: | :--- | :--- | :---: | :--- | :---: | :--- |\n`;

  catWorkflows.forEach(w => {
    const matBadge = w.maturity === 'demo-verified' ? '🟢 Demo Verified' : '🔵 Blueprint';
    const integs = w.integrations.slice(0, 3).join(', ');
    pageContent += `| **${w.id}** | **[${w.name}](../${w.documentation})** | ${w.businessProblem.substring(0, 80)}... | \`${w.trigger}\` | \`${integs}\` | ${matBadge} | [JSON](../${w.workflow}) · [Doc](../${w.documentation}) |\n`;
  });

  pageContent += `\n---\n\n## 🛠 Workflow Details\n\n`;

  catWorkflows.forEach(w => {
    pageContent += `### ${w.id} — ${w.name}\n\n`;
    pageContent += `- **Business Outcome:** ${w.businessOutcome}\n`;
    pageContent += `- **Maturity:** \`${w.maturity}\` | **Complexity:** \`${w.complexity}\` | **Trigger:** \`${w.trigger}\`\n`;
    pageContent += `- **Core Integrations:** ${w.integrations.map(i => `\`${i}\``).join(' • ')}\n`;
    pageContent += `- **Documentation:** [Read Specs](../${w.documentation})\n`;
    pageContent += `- **Workflow File:** [Download n8n JSON](../${w.workflow})\n\n`;
    pageContent += `![Architecture](../assets/workflows/${w.id}/architecture.svg)\n\n---\n\n`;
  });

  fs.writeFileSync(path.join(CATALOG_DIR, c.file), pageContent, 'utf8');
});

console.log(`Generated catalog/README.md and all 10 category pages.`);

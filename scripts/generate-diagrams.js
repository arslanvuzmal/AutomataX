const fs = require('fs');
const path = require('path');

const MANIFEST_PATH = path.join(__dirname, '..', 'manifest', 'workflows.json');
const MERMAID_DIR = path.join(__dirname, '..', 'assets', 'generated', 'mermaid');
const BRAND_DIR = path.join(__dirname, '..', 'assets', 'brand');
const CATALOG_DIR = path.join(__dirname, '..', 'assets', 'catalog');
const WORKFLOW_ASSETS_DIR = path.join(__dirname, '..', 'assets', 'workflows');
const ROOT_DIR = path.join(__dirname, '..');

[MERMAID_DIR, BRAND_DIR, CATALOG_DIR, WORKFLOW_ASSETS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

// Node type visual semantic mapper
function getNodeCategory(nodeName, nodeType) {
  const name = (nodeName || '').toLowerCase();
  const type = (nodeType || '').toLowerCase();

  if (type.includes('webhook') || type.includes('cron') || type.includes('schedule') || type.includes('trigger')) return { label: 'TRIGGER', color: '#58A6FF', bg: '#0D2D52' };
  if (name.includes('ai') || name.includes('triage') || name.includes('gpt') || name.includes('sentiment') || name.includes('summary')) return { label: 'AI / REASONING', color: '#A371F7', bg: '#3C1E69' };
  if (type.includes('if') || type.includes('switch') || name.includes('decision') || name.includes('filter')) return { label: 'DECISION', color: '#D29922', bg: '#4D3800' };
  if (type.includes('slack') || type.includes('email') || name.includes('notify') || name.includes('alert')) return { label: 'NOTIFICATION', color: '#3FB950', bg: '#0D3818' };
  if (name.includes('database') || name.includes('sql') || name.includes('postgres') || name.includes('warehouse')) return { label: 'PERSISTENCE', color: '#F0883E', bg: '#481F00' };
  return { label: 'INTEGRATION', color: '#79C0FF', bg: '#161B22' };
}

// Generate SVG diagram for a specific workflow
function generateWorkflowSVG(wf) {
  const jsonPath = path.join(ROOT_DIR, wf.workflow);
  let nodes = [];
  let connections = {};

  if (fs.existsSync(jsonPath)) {
    const wData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    nodes = (wData.nodes || []).filter(n => n.type !== 'n8n-nodes-base.stickyNote');
    connections = wData.connections || {};
  }

  if (nodes.length === 0) {
    // Fallback if no nodes found
    nodes = [
      { name: 'Trigger', type: 'n8n-nodes-base.webhook' },
      ...wf.integrations.map(i => ({ name: i, type: 'n8n-nodes-base.httpRequest' }))
    ];
  }

  const cardWidth = 170;
  const cardHeight = 70;
  const gap = 40;
  const paddingX = 40;
  const paddingY = 50;

  const totalWidth = Math.max(800, paddingX * 2 + nodes.length * cardWidth + (nodes.length - 1) * gap);
  const totalHeight = 220;

  let svgNodesHtml = '';
  let svgArrowsHtml = '';

  // Draw arrow connectors
  for (let i = 0; i < nodes.length - 1; i++) {
    const x1 = paddingX + i * (cardWidth + gap) + cardWidth;
    const y1 = paddingY + cardHeight / 2;
    const x2 = paddingX + (i + 1) * (cardWidth + gap);
    const y2 = y1;

    svgArrowsHtml += `
      <path d="M ${x1} ${y1} L ${x2 - 8} ${y2}" stroke="#58A6FF" stroke-width="2" marker-end="url(#arrow)" />
    `;
  }

  // Draw node cards
  nodes.forEach((node, idx) => {
    const x = paddingX + idx * (cardWidth + gap);
    const y = paddingY;
    const cat = getNodeCategory(node.name, node.type);

    const safeName = (node.name || `Step ${idx+1}`).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    svgNodesHtml += `
      <g transform="translate(${x}, ${y})">
        <rect width="${cardWidth}" height="${cardHeight}" rx="8" fill="#161B22" stroke="${cat.color}" stroke-width="1.5" />
        <rect x="10" y="10" width="75" height="18" rx="4" fill="${cat.bg}" />
        <text x="14" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="9" font-weight="700" fill="${cat.color}">${cat.label}</text>
        <text x="10" y="48" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600" fill="#F0F6FC">${safeName.length > 20 ? safeName.substring(0, 18) + '...' : safeName}</text>
      </g>
    `;
  });

  const titleSafe = wf.name.replace(/&/g, '&amp;');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" width="100%" height="100%">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#58A6FF" />
    </marker>
    <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0D1117" />
      <stop offset="100%" stop-color="#161B22" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#bg-gradient)" rx="10" stroke="#30363D" stroke-width="1" />
  
  <!-- Header -->
  <text x="20" y="28" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#58A6FF">AUTOMATAX ARCHITECTURE // ${wf.id}</text>
  <text x="${totalWidth - 20}" y="28" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="600" fill="#8B949E">${wf.maturity.toUpperCase()}</text>

  <!-- Connectors -->
  ${svgArrowsHtml}

  <!-- Nodes -->
  ${svgNodesHtml}
</svg>`;
}

// Generate Mermaid source file
function generateMermaidMMD(wf) {
  const jsonPath = path.join(ROOT_DIR, wf.workflow);
  let nodes = [];

  if (fs.existsSync(jsonPath)) {
    const wData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    nodes = (wData.nodes || []).filter(n => n.type !== 'n8n-nodes-base.stickyNote');
  }

  if (nodes.length === 0) {
    nodes = [
      { name: 'Trigger', type: 'webhook' },
      ...wf.integrations.map(i => ({ name: i, type: 'integration' }))
    ];
  }

  let mmd = `graph LR\n`;
  nodes.forEach((node, i) => {
    const safeId = `N${i}_${node.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const safeLabel = node.name.replace(/"/g, "'");
    mmd += `    ${safeId}["${safeLabel}"]\n`;
  });

  for (let i = 0; i < nodes.length - 1; i++) {
    const id1 = `N${i}_${nodes[i].name.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const id2 = `N${i+1}_${nodes[i+1].name.replace(/[^a-zA-Z0-9]/g, '_')}`;
    mmd += `    ${id1} --> ${id2}\n`;
  }

  return mmd;
}

// 1. Generate workflow diagrams & mermaid sources
manifest.forEach(wf => {
  const wfAssetDir = path.join(WORKFLOW_ASSETS_DIR, wf.id);
  if (!fs.existsSync(wfAssetDir)) fs.mkdirSync(wfAssetDir, { recursive: true });

  const svgContent = generateWorkflowSVG(wf);
  fs.writeFileSync(path.join(wfAssetDir, 'architecture.svg'), svgContent, 'utf8');

  const mmdContent = generateMermaidMMD(wf);
  fs.writeFileSync(path.join(MERMAID_DIR, `${wf.id}.mmd`), mmdContent, 'utf8');
});

console.log(`Generated SVG architectures and Mermaid sources for all 100 workflows.`);

// 2. Generate AutomataX Hero SVG (assets/brand/automatax-hero.svg)
const heroSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 320" width="100%" height="100%">
  <defs>
    <linearGradient id="hero-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090D11" />
      <stop offset="50%" stop-color="#0D1117" />
      <stop offset="100%" stop-color="#161B22" />
    </linearGradient>
    <linearGradient id="brand-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#58A6FF" />
      <stop offset="100%" stop-color="#A371F7" />
    </linearGradient>
    <marker id="hero-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#58A6FF" />
    </marker>
  </defs>

  <rect width="100%" height="100%" fill="url(#hero-bg)" rx="12" stroke="#30363D" stroke-width="1.5" />

  <!-- Brand Title -->
  <text x="50" y="55" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800" fill="#F0F6FC" letter-spacing="-0.5">AutomataX</text>
  <text x="210" y="55" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" fill="#58A6FF">/ 100 BUSINESS AUTOMATION ARCHITECTURES FOR n8n</text>

  <!-- Flowchart pipeline elements -->
  <!-- 1. INPUTS -->
  <g transform="translate(50, 110)">
    <rect width="120" height="120" rx="10" fill="#161B22" stroke="#58A6FF" stroke-width="1.5" />
    <text x="60" y="35" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="#58A6FF">STAGE 01</text>
    <text x="60" y="65" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="700" fill="#F0F6FC">INPUTS</text>
    <text x="60" y="90" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" fill="#8B949E">Webhooks &amp; Events</text>
  </g>

  <path d="M 170 170 L 195 170" stroke="#58A6FF" stroke-width="2" marker-end="url(#hero-arrow)" />

  <!-- 2. AUTOMATAX ENGINE -->
  <g transform="translate(205, 95)">
    <rect width="180" height="150" rx="12" fill="#161B22" stroke="url(#brand-grad)" stroke-width="2" />
    <text x="90" y="35" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="#A371F7">ORCHESTRATION ENGINE</text>
    <text x="90" y="70" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="800" fill="#F0F6FC">AUTOMATAX</text>
    <text x="90" y="92" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600" fill="#58A6FF">Powered by n8n</text>
    <text x="90" y="125" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" fill="#8B949E">10 Enterprise Domains</text>
  </g>

  <path d="M 385 170 L 410 170" stroke="#58A6FF" stroke-width="2" marker-end="url(#hero-arrow)" />

  <!-- 3. VALIDATE -->
  <g transform="translate(420, 110)">
    <rect width="110" height="120" rx="10" fill="#161B22" stroke="#D29922" stroke-width="1.5" />
    <text x="55" y="35" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="700" fill="#D29922">STAGE 02</text>
    <text x="55" y="65" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#F0F6FC">VALIDATE</text>
    <text x="55" y="90" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" fill="#8B949E">Schema &amp; PII</text>
  </g>

  <path d="M 530 170 L 550 170" stroke="#58A6FF" stroke-width="2" marker-end="url(#hero-arrow)" />

  <!-- 4. ENRICH & DECIDE -->
  <g transform="translate(560, 110)">
    <rect width="120" height="120" rx="10" fill="#161B22" stroke="#A371F7" stroke-width="1.5" />
    <text x="60" y="35" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="700" fill="#A371F7">STAGE 03</text>
    <text x="60" y="65" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#F0F6FC">ENRICH/DECIDE</text>
    <text x="60" y="90" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" fill="#8B949E">AI &amp; Business Rules</text>
  </g>

  <path d="M 680 170 L 700 170" stroke="#58A6FF" stroke-width="2" marker-end="url(#hero-arrow)" />

  <!-- 5. ACT -->
  <g transform="translate(710, 110)">
    <rect width="110" height="120" rx="10" fill="#161B22" stroke="#3FB950" stroke-width="1.5" />
    <text x="55" y="35" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="700" fill="#3FB950">STAGE 04</text>
    <text x="55" y="65" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#F0F6FC">ACT &amp; SYNC</text>
    <text x="55" y="90" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" fill="#8B949E">APIs &amp; Systems</text>
  </g>

  <path d="M 820 170 L 840 170" stroke="#58A6FF" stroke-width="2" marker-end="url(#hero-arrow)" />

  <!-- 6. OBSERVE -->
  <g transform="translate(850, 110)">
    <rect width="100" height="120" rx="10" fill="#161B22" stroke="#79C0FF" stroke-width="1.5" />
    <text x="50" y="35" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="700" fill="#79C0FF">STAGE 05</text>
    <text x="50" y="65" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#F0F6FC">OBSERVE</text>
    <text x="50" y="90" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" fill="#8B949E">Alerts &amp; Audit</text>
  </g>

  <!-- Footer caption -->
  <text x="500" y="285" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600" fill="#8B949E">FROM BUSINESS TRIGGER TO AUTOMATED OUTCOME</text>
</svg>`;

fs.writeFileSync(path.join(BRAND_DIR, 'automatax-hero.svg'), heroSvg, 'utf8');

// 3. Generate Architecture Overview SVG (assets/brand/architecture-overview.svg)
const archSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 300" width="100%" height="100%">
  <defs>
    <linearGradient id="arch-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0D1117" />
      <stop offset="100%" stop-color="#161B22" />
    </linearGradient>
    <marker id="arch-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#58A6FF" />
    </marker>
  </defs>

  <rect width="100%" height="100%" fill="url(#arch-bg)" rx="10" stroke="#30363D" stroke-width="1" />

  <text x="30" y="35" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#58A6FF">AUTOMATAX SYSTEM REPOSITORY ARCHITECTURE</text>

  <!-- Box 1: MANIFEST SOURCE OF TRUTH -->
  <g transform="translate(40, 70)">
    <rect width="230" height="190" rx="8" fill="#161B22" stroke="#58A6FF" stroke-width="1.5" />
    <text x="20" y="30" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#58A6FF">MANIFEST / TRUTH</text>
    <text x="20" y="60" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#F0F6FC">• manifest/workflows.json</text>
    <text x="20" y="85" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#F0F6FC">• 100 Structured Records</text>
    <text x="20" y="110" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#F0F6FC">• Explicit Maturity Tags</text>
    <text x="20" y="135" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#F0F6FC">• Verified Integration Schemas</text>
    <text x="20" y="160" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#F0F6FC">• Automated CI Validator</text>
  </g>

  <path d="M 270 165 L 320 165" stroke="#58A6FF" stroke-width="2" marker-end="url(#arch-arrow)" />

  <!-- Box 2: WORKFLOW TEMPLATES & FIXTURES -->
  <g transform="translate(330, 70)">
    <rect width="250" height="190" rx="8" fill="#161B22" stroke="#A371F7" stroke-width="1.5" />
    <text x="20" y="30" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#A371F7">WORKFLOW ENGINE (n8n)</text>
    <text x="20" y="60" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#F0F6FC">• workflows/01-10 Domains/</text>
    <text x="20" y="85" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#F0F6FC">• Importable JSON Architectures</text>
    <text x="20" y="110" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#F0F6FC">• fixtures/inputs &amp; expected/</text>
    <text x="20" y="135" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#F0F6FC">• Error Handling &amp; Retries</text>
    <text x="20" y="160" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#F0F6FC">• Mock &amp; Demo Verification</text>
  </g>

  <path d="M 580 165 L 630 165" stroke="#58A6FF" stroke-width="2" marker-end="url(#arch-arrow)" />

  <!-- Box 3: DOCUMENTATION & CATALOG -->
  <g transform="translate(640, 70)">
    <rect width="220" height="190" rx="8" fill="#161B22" stroke="#3FB950" stroke-width="1.5" />
    <text x="20" y="30" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#3FB950">DOCUMENTATION &amp; AUDIT</text>
    <text x="20" y="60" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#F0F6FC">• catalog/ Domain Indexes</text>
    <text x="20" y="85" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#F0F6FC">• 100 Workflow Spec Docs</text>
    <text x="20" y="110" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#F0F6FC">• SVG Architecture Visuals</text>
    <text x="20" y="135" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#F0F6FC">• Technical Security Audits</text>
    <text x="20" y="160" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#F0F6FC">• Open Source Governance</text>
  </g>
</svg>`;

fs.writeFileSync(path.join(BRAND_DIR, 'architecture-overview.svg'), archSvg, 'utf8');

// 4. Generate Category Architecture SVGs (assets/catalog/*.svg)
const categoriesList = [
  { slug: 'finops', name: 'FinOps & Revenue', accent: '#58A6FF' },
  { slug: 'hr', name: 'HR & Talent', accent: '#3FB950' },
  { slug: 'supply-chain', name: 'Supply Chain & Logistics', accent: '#D29922' },
  { slug: 'customer-success', name: 'Customer Success', accent: '#A371F7' },
  { slug: 'sales-crm', name: 'Sales & CRM', accent: '#79C0FF' },
  { slug: 'itsm-devops', name: 'ITSM & DevOps', accent: '#F0883E' },
  { slug: 'marketing', name: 'Marketing Operations', accent: '#DB6D28' },
  { slug: 'legal-compliance', name: 'Legal & Compliance', accent: '#F85149' },
  { slug: 'data-engineering', name: 'Data Engineering', accent: '#58A6FF' },
  { slug: 'executive-operations', name: 'Executive Operations', accent: '#A371F7' }
];

categoriesList.forEach(cat => {
  const catSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 180" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#0D1117" rx="8" stroke="#30363D" stroke-width="1" />
  <text x="25" y="35" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="800" fill="${cat.accent}">AUTOMATAX CATALOG // ${cat.name.toUpperCase()}</text>
  <text x="25" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#8B949E">10 Enterprise Workflow Architectures · n8n Compatible</text>
  
  <g transform="translate(25, 80)">
    <rect width="120" height="65" rx="6" fill="#161B22" stroke="${cat.accent}" stroke-width="1" />
    <text x="60" y="25" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="700" fill="${cat.accent}">TRIGGER</text>
    <text x="60" y="45" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#F0F6FC">Event / Webhook</text>
  </g>
  <path d="M 145 112 L 175 112" stroke="#58A6FF" stroke-width="1.5" />

  <g transform="translate(175, 80)">
    <rect width="140" height="65" rx="6" fill="#161B22" stroke="#A371F7" stroke-width="1" />
    <text x="70" y="25" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="700" fill="#A371F7">PROCESSING</text>
    <text x="70" y="45" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#F0F6FC">Validation &amp; Rules</text>
  </g>
  <path d="M 315 112 L 345 112" stroke="#58A6FF" stroke-width="1.5" />

  <g transform="translate(345, 80)">
    <rect width="140" height="65" rx="6" fill="#161B22" stroke="#D29922" stroke-width="1" />
    <text x="70" y="25" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="700" fill="#D29922">INTEGRATION</text>
    <text x="70" y="45" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#F0F6FC">SaaS / ERP / Cloud</text>
  </g>
  <path d="M 485 112 L 515 112" stroke="#58A6FF" stroke-width="1.5" />

  <g transform="translate(515, 80)">
    <rect width="120" height="65" rx="6" fill="#161B22" stroke="#3FB950" stroke-width="1" />
    <text x="60" y="25" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="700" fill="#3FB950">OUTCOME</text>
    <text x="60" y="45" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#F0F6FC">Action &amp; Audit</text>
  </g>
</svg>`;
  fs.writeFileSync(path.join(CATALOG_DIR, `${cat.slug}.svg`), catSvg, 'utf8');
});

console.log(`Generated category SVGs and brand assets.`);

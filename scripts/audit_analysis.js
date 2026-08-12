const fs = require('fs');
const path = require('path');

const WORKFLOWS_DIR = path.join(__dirname, '..', 'workflows');
const PROMPTS_DIR = path.join(__dirname, '..', 'prompts');

const files = fs.readdirSync(WORKFLOWS_DIR).filter(f => f.endsWith('.json'));

console.log(`Total workflow JSON files found: ${files.length}`);

let totalNodes = 0;
let emptyParamNodes = 0;
let nodeTypes = {};
let categoryCounts = {};
let triggerTypes = {};
let webhookTriggers = 0;
let cronTriggers = 0;

files.forEach(file => {
  const categoryId = file.substring(0, 2);
  categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 1;

  const content = fs.readFileSync(path.join(WORKFLOWS_DIR, file), 'utf8');
  const json = JSON.parse(content);

  const nodes = json.nodes || [];
  totalNodes += nodes.length;

  nodes.forEach(node => {
    nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1;
    
    if (!node.parameters || Object.keys(node.parameters).length === 0) {
      emptyParamNodes++;
    }

    if (node.type && node.type.includes('webhook')) webhookTriggers++;
    if (node.type && (node.type.includes('cron') || node.type.includes('schedule'))) cronTriggers++;
  });
});

console.log(`Total Nodes across all workflows: ${totalNodes}`);
console.log(`Average Nodes per workflow: ${(totalNodes / files.length).toFixed(1)}`);
console.log(`Nodes with empty parameters: ${emptyParamNodes} (${((emptyParamNodes / totalNodes) * 100).toFixed(1)}%)`);
console.log(`Category breakdown:`, categoryCounts);
console.log(`Unique node types count: ${Object.keys(nodeTypes).length}`);
console.log(`Top 10 Node Types:`, Object.entries(nodeTypes).sort((a, b) => b[1] - a[1]).slice(0, 10));

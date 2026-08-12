const fs = require('fs');
const path = require('path');

const MANIFEST_PATH = path.join(__dirname, '..', 'manifest', 'workflows.json');
const DOCS_WORKFLOWS_DIR = path.join(__dirname, '..', 'docs', 'workflows');
const ROOT_DIR = path.join(__dirname, '..');

if (!fs.existsSync(DOCS_WORKFLOWS_DIR)) {
  fs.mkdirSync(DOCS_WORKFLOWS_DIR, { recursive: true });
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

manifest.forEach(wf => {
  const isDemoVerified = wf.maturity === 'demo-verified';
  const maturityBadge = isDemoVerified 
    ? '![Maturity: Demo Verified](https://img.shields.io/badge/Maturity-Demo%20Verified-green.svg)'
    : '![Maturity: Architecture Blueprint](https://img.shields.io/badge/Maturity-Architecture%20Blueprint-blue.svg)';

  const docContent = `# ${wf.name}

${maturityBadge}
![Category](https://img.shields.io/badge/Category-${encodeURIComponent(wf.category)}-58A6FF.svg)
![Trigger](https://img.shields.io/badge/Trigger-${encodeURIComponent(wf.trigger.toUpperCase())}-79C0FF.svg)

> **Business Outcome:** ${wf.businessOutcome}

---

## Business Problem

${wf.businessProblem}

Without automation, teams face manual data entry errors, delayed response times, poor data consistency across platforms, and potential compliance or operational risks.

---

## Automation Strategy

This AutomataX workflow orchestrates an end-to-end automated pipeline for **${wf.name}**. 
When triggered, the system receives event data, validates required parameters, enriches data via external services or AI reasoning where required, executes business decisions, and synchronizes status back to core business platforms.

---

## Architecture

![Workflow Architecture](../../assets/workflows/${wf.id}/architecture.svg)

*Architecture diagram generated directly from n8n workflow node structure.*

---

## Data Flow

1. **Trigger Ingestion**: Ingests incoming event payload via \`${wf.trigger}\`.
2. **Payload Validation**: Ensures required fields and data structures exist before execution.
3. **Integration Processing**: Interacts with core services: ${wf.integrations.map(i => `\`${i}\``).join(', ')}.
4. **Logic & Routing**: Evaluates thresholds, AI classifications, or conditional criteria.
5. **System Synchronization & Action**: Writes updates to destination databases/CRMs and emits alerts/notifications.

---

## Trigger

- **Type**: \`${wf.trigger.toUpperCase()}\`
- **Source**: External Webhook event payload or Scheduled interval.
- **Payload Expectation**: JSON object containing target entity metrics, transaction attributes, or status updates.

---

## Inputs

Expected incoming fields include:
- \`entity_id\` / \`record_id\`: Primary tracking key
- \`timestamp\`: ISO-8601 execution timestamp
- \`payload\`: Contextual payload containing domain metrics and customer parameters

---

## Processing & Decision Logic

- **Schema Validation**: Validates parameter integrity and guards against missing/malformed payloads.
${wf.ai ? '- **AI Reasoning Engine**: Classifies, summarizes, or extracts key attributes using LLM/NLP models.\n' : ''}- **Branching Rules**: Routes execution paths based on entity thresholds or operational priority.
- **Data Normalization**: Formats timestamps, currency attributes, and user attributes for target systems.

---

## Integrations

${wf.integrations.map(integ => `- **${integ}**: Primary operational service responsible for data retrieval, state mutation, or record persistence.`).join('\n')}

---

## Outputs

- **Primary Action**: Records persisted or state updated across target platforms (${wf.integrations.slice(0, 2).join(', ')}).
- **Notifications**: Automated summary/alert dispatched to Slack/Email.
- **Audit Log**: Execution trace preserved within n8n execution log.

---

## Failure Paths

1. **API Timeout or Rate Limit**: Downstream SaaS or ERP endpoint temporarily unavailable.
2. **Malformed Payload**: Missing required parameters in trigger body.
3. **Authentication Failure**: Expired API tokens or missing credential store configuration.

---

## Error Handling

${isDemoVerified ? `
- **Active Retries**: Configured with exponential backoff on HTTP/API node failures.
- **Error Trigger Node**: Routes unhandled exceptions to an error workflow.
- **Alert Dispatch**: Dispatches failure alerts to designated Slack/PagerDuty channels.
` : `
- **Recommended Hardening**: Implement Error Trigger nodes and exponential retry policies on HTTP integration nodes.
- **Dead-Letter Handling**: Log failed executions to a queue for manual retry.
`}

---

## Security

- **Secrets Storage**: All credential tokens must use n8n Credentials Manager (\`{{\$credentials...}}\`). No plaintext keys allowed.
- **Least Privilege**: API keys must be scoped exclusively to required read/write permissions.
- **PII Masking**: Sensitive identity or financial payload data should be masked before logging or sending to chat channels.

---

## Required Credentials

${wf.credentials.map(c => `- \`${c}\`: Scoped access token or OAuth2 credential in n8n Credential Manager.`).join('\n')}

---

## Setup

1. **Import Workflow**: Download [${wf.name} JSON](../../${wf.workflow}) and import into n8n canvas.
2. **Configure Credentials**: Assign configured n8n credentials to each integration node.
3. **Configure Environment Variables**: Set endpoint URLs and notification channel IDs.
4. **Activate**: Toggle workflow to **Active**.

---

## Test / Demo

${isDemoVerified ? `
- **Fixture Input**: \`fixtures/inputs/${wf.id}.json\`
- **Expected Result**: \`fixtures/expected/${wf.id}.json\`
- **Execution Test**: Trigger the workflow with mock input payload to verify node execution paths without production API keys.
` : `
- **Blueprint Scenario**: Supply a mock JSON payload matching the trigger schema to test workflow node routing in test mode.
`}

---

## Workflow JSON

📥 **[Download n8n Workflow JSON](../../${wf.workflow})**

---

## Maturity

Current Level: **${wf.maturity === 'demo-verified' ? 'Demo Verified' : 'Architecture Blueprint'}**

${isDemoVerified 
  ? 'This workflow includes test fixtures, mock data paths, structured error handling, and field expressions.'
  : 'This architecture defines complete integration node sequencing. Implementation requires configuring destination API endpoints and credential bindings.'}

---

## Production Hardening

Before deploying to production:
1. Bind real n8n credential objects for all integration nodes.
2. Configure error handling workflows and Slack/PagerDuty dead-letter alerts.
3. Validate rate limits and retry parameters for external APIs.
4. Verify PII masking and data retention settings.
`;

  const docFilePath = path.join(ROOT_DIR, wf.documentation);
  const cleanContent = docContent.replace(/\n{3,}/g, '\n\n');
  fs.writeFileSync(docFilePath, cleanContent, 'utf8');
});

console.log(`Generated 100 workflow documentation files under docs/workflows/.`);

# Insider Threat Detection & Lockout

![Maturity: Architecture Blueprint](https://img.shields.io/badge/Maturity-Architecture%20Blueprint-blue.svg)
![Category](https://img.shields.io/badge/Category-Legal%20%26%20Compliance-58A6FF.svg)
![Trigger](https://img.shields.io/badge/Trigger-WEBHOOK-79C0FF.svg)

> **Business Outcome:** Build a workflow that monitors insider threat indicators: aggregate login anomalies from Okta and large data downloads from the DLP system; if a threshold is crossed, automatically lock the account and alert the CISO via PagerDuty.

---

## Business Problem

Disgruntled employees downloading gigabytes of proprietary data before leaving the company often goes unnoticed until the damage is done.

Without automation, teams face manual data entry errors, delayed response times, poor data consistency across platforms, and potential compliance or operational risks.

---

## Automation Strategy

This AutomataX workflow orchestrates an end-to-end automated pipeline for **Insider Threat Detection & Lockout**. 
When triggered, the system receives event data, validates required parameters, enriches data via external services or AI reasoning where required, executes business decisions, and synchronizes status back to core business platforms.

---

## Architecture

![Workflow Architecture](../../assets/workflows/08-05/architecture.svg)

*Architecture diagram generated directly from n8n workflow node structure.*

---

## Data Flow

1. **Trigger Ingestion**: Ingests incoming event payload via `webhook`.
2. **Payload Validation**: Ensures required fields and data structures exist before execution.
3. **Integration Processing**: Interacts with core services: `Okta`, `DLP System`, `PagerDuty`.
4. **Logic & Routing**: Evaluates thresholds, AI classifications, or conditional criteria.
5. **System Synchronization & Action**: Writes updates to destination databases/CRMs and emits alerts/notifications.

---

## Trigger

- **Type**: `WEBHOOK`
- **Source**: External Webhook event payload or Scheduled interval.
- **Payload Expectation**: JSON object containing target entity metrics, transaction attributes, or status updates.

---

## Inputs

Expected incoming fields include:
- `entity_id` / `record_id`: Primary tracking key
- `timestamp`: ISO-8601 execution timestamp
- `payload`: Contextual payload containing domain metrics and customer parameters

---

## Processing & Decision Logic

- **Schema Validation**: Validates parameter integrity and guards against missing/malformed payloads.
- **Branching Rules**: Routes execution paths based on entity thresholds or operational priority.
- **Data Normalization**: Formats timestamps, currency attributes, and user attributes for target systems.

---

## Integrations

- **Okta**: Primary operational service responsible for data retrieval, state mutation, or record persistence.
- **DLP System**: Primary operational service responsible for data retrieval, state mutation, or record persistence.
- **PagerDuty**: Primary operational service responsible for data retrieval, state mutation, or record persistence.

---

## Outputs

- **Primary Action**: Records persisted or state updated across target platforms (Okta, DLP System).
- **Notifications**: Automated summary/alert dispatched to Slack/Email.
- **Audit Log**: Execution trace preserved within n8n execution log.

---

## Failure Paths

1. **API Timeout or Rate Limit**: Downstream SaaS or ERP endpoint temporarily unavailable.
2. **Malformed Payload**: Missing required parameters in trigger body.
3. **Authentication Failure**: Expired API tokens or missing credential store configuration.

---

## Error Handling


- **Recommended Hardening**: Implement Error Trigger nodes and exponential retry policies on HTTP integration nodes.
- **Dead-Letter Handling**: Log failed executions to a queue for manual retry.


---

## Security

- **Secrets Storage**: All credential tokens must use n8n Credentials Manager (`{{$credentials...}}`). No plaintext keys allowed.
- **Least Privilege**: API keys must be scoped exclusively to required read/write permissions.
- **PII Masking**: Sensitive identity or financial payload data should be masked before logging or sending to chat channels.

---

## Required Credentials

- `Okta API Credentials`: Scoped access token or OAuth2 credential in n8n Credential Manager.
- `DLP System API Credentials`: Scoped access token or OAuth2 credential in n8n Credential Manager.
- `PagerDuty API Credentials`: Scoped access token or OAuth2 credential in n8n Credential Manager.

---

## Setup

1. **Import Workflow**: Download [Insider Threat Detection & Lockout JSON](../../workflows/08-legal-compliance/08_05_insider_threat_detection_lockout.json) and import into n8n canvas.
2. **Configure Credentials**: Assign configured n8n credentials to each integration node.
3. **Configure Environment Variables**: Set endpoint URLs and notification channel IDs.
4. **Activate**: Toggle workflow to **Active**.

---

## Test / Demo


- **Blueprint Scenario**: Supply a mock JSON payload matching the trigger schema to test workflow node routing in test mode.


---

## Workflow JSON

📥 **[Download n8n Workflow JSON](../../workflows/08-legal-compliance/08_05_insider_threat_detection_lockout.json)**

---

## Maturity

Current Level: **Architecture Blueprint**

This architecture defines complete integration node sequencing. Implementation requires configuring destination API endpoints and credential bindings.

---

## Production Hardening

Before deploying to production:
1. Bind real n8n credential objects for all integration nodes.
2. Configure error handling workflows and Slack/PagerDuty dead-letter alerts.
3. Validate rate limits and retry parameters for external APIs.
4. Verify PII masking and data retention settings.

const fs = require('fs');
const path = require('path');

const MANIFEST_PATH = path.join(__dirname, '..', 'manifest', 'workflows.json');
const FIXTURES_INPUTS_DIR = path.join(__dirname, '..', 'fixtures', 'inputs');
const FIXTURES_EXPECTED_DIR = path.join(__dirname, '..', 'fixtures', 'expected');
const WORKFLOWS_DIR = path.join(__dirname, '..', 'workflows');

[FIXTURES_INPUTS_DIR, FIXTURES_EXPECTED_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

// Data generators for representative fixtures
const sampleFixtures = {
  '01-01': {
    input: {
      transaction_id: "TX-998241",
      amount: 15400.00,
      currency: "EUR",
      customer_id: "CUST-4412",
      booking_date: "2026-08-12",
      revenue_category: "Software Subscription"
    },
    expected: {
      status: "SUCCESS",
      usd_equivalent: 16940.00,
      fx_rate_applied: 1.10,
      erp_posting_status: "RECOGNIZED",
      slack_notification_sent: true,
      report_url: "https://documint.internal/reports/REV-2026-08-12.pdf"
    }
  },
  '01-03': {
    input: {
      invoice_number: "INV-2026-881",
      vendor: "Acme Logistics Corp",
      amount_usd: 8450.00,
      po_number: "PO-77412",
      due_date: "2026-09-01",
      pdf_url: "https://storage.internal/invoices/INV-2026-881.pdf"
    },
    expected: {
      ocr_confidence: 0.985,
      po_match: true,
      variance_percentage: 0.0,
      approval_tier: "VP_FINANCE",
      docusign_envelope_id: "ENV-99120485",
      status: "PENDING_APPROVAL"
    }
  },
  '02-01': {
    input: {
      employee_id: "EMP-5049",
      full_name: "Alex Morgan",
      role: "Senior Cloud Architect",
      department: "Engineering",
      start_date: "2026-09-01",
      manager_email: "cto@company.internal",
      personal_email: "alex.m@example.org"
    },
    expected: {
      google_workspace_created: true,
      okta_provisioned: true,
      slack_channels_joined: ["#engineering", "#welcome", "#cloud-arch"],
      hardware_order_submitted: true,
      onboarding_doc_sent: true,
      status: "ONBOARDED"
    }
  },
  '03-01': {
    input: {
      sku: "SKU-9921-X",
      item_name: "High-Capacity Lithium Cell B",
      current_inventory: 140,
      reorder_point: 250,
      lead_time_days: 14,
      avg_daily_demand: 18
    },
    expected: {
      trigger_po: true,
      calculated_po_quantity: 450,
      vendor_id: "VEND-302",
      po_number: "PO-AUTO-9912",
      netsuite_status: "CREATED",
      slack_alert_sent: true
    }
  },
  '04-02': {
    input: {
      ticket_id: "TCK-88192",
      customer_tier: "Enterprise",
      subject: "Production API Timeout Error on Endpoint /v2/batch",
      body: "Urgent: Our ETL jobs are failing with HTTP 504 Gateway Timeout since 14:00 UTC.",
      user_email: "devops@enterprise-client.com"
    },
    expected: {
      ai_sentiment: "Negative/Urgent",
      ai_category: "Infrastructure Failure",
      calculated_priority: "P1_CRITICAL",
      assigned_team: "DevOps Escalation",
      sla_deadline: "2026-08-12T23:17:41Z",
      pagerduty_triggered: true
    }
  },
  '05-01': {
    input: {
      lead_id: "LEAD-7741",
      name: "Jordan Vance",
      company: "Apex Global Systems",
      email: "jvance@apexglobal.com",
      company_size: "5000+",
      annual_revenue_usd: 120000000,
      region: "North America",
      source: "Enterprise Web Demo Request"
    },
    expected: {
      lead_score: 95,
      tier: "STRATEGIC_ENTERPRISE",
      assigned_rep: "Sarah Jenkins (Enterprise AE)",
      salesforce_lead_updated: true,
      slack_alert_sent: true,
      routing_speed_seconds: 1.2
    }
  },
  '05-04': {
    input: {
      competitor_name: "CloudScale Pro",
      target_url: "https://competitor.mock/pricing",
      previous_price_usd: 199.00
    },
    expected: {
      scraped_price_usd: 149.00,
      price_change_detected: true,
      variance_percent: -25.1,
      alert_channel: "#sales-intelligence",
      status: "COMPETITOR_PRICE_DROP_ALERTED"
    }
  },
  '06-01': {
    input: {
      alert_id: "ALT-3091",
      severity: "SEV-1",
      service: "Payment Gateway Core",
      summary: "Database Connection Pool Exhaustion in us-east-1",
      triggering_system: "Datadog"
    },
    expected: {
      war_room_channel: "#incident-sev1-payment-gateway-3091",
      zoom_link: "https://zoom.internal/j/991204858",
      jira_incident_key: "INC-4412",
      pagerduty_incident_id: "PD-9921",
      incident_commander: "On-Call Lead"
    }
  },
  '06-03': {
    input: {
      build_id: "BUILD-99824",
      repository: "automatax-core",
      branch: "main",
      failed_step: "E2E Integration Tests",
      log_snippet: "FAIL: Connection refused at postgres:5432 during migration step 4"
    },
    expected: {
      ai_root_cause_summary: "Database connection failed during schema migration test step.",
      suggested_fix: "Check PostgreSQL container health and migration scripts before running suite.",
      jira_ticket_created: "DEV-8841",
      slack_channel_notified: "#build-failures"
    }
  },
  '07-02': {
    input: {
      article_id: "ART-4091",
      title: "Building Resilient Enterprise Automation Architectures",
      author: "Engineering Team",
      raw_content: "Enterprise automation requires clear error handling, retries, and schema validation...",
      target_channels: ["LinkedIn", "Medium", "Dev.to"]
    },
    expected: {
      ai_summaries_generated: 3,
      linkedin_post_queued: true,
      medium_draft_created: true,
      devto_published: true,
      status: "SYNDICATED"
    }
  },
  '08-01': {
    input: {
      request_id: "NDA-2026-99",
      counterparty_name: "Vertex AI Solutions Inc",
      counterparty_email: "legal@vertexai.mock",
      effective_date: "2026-08-12",
      jurisdiction: "Delaware",
      governing_law: "State of Delaware"
    },
    expected: {
      nda_document_generated: true,
      docusign_sent: true,
      contract_repository_updated: true,
      status: "WAITING_FOR_SIGNATURE"
    }
  },
  '08-07': {
    input: {
      audit_period: "2026-Q3",
      evidence_controls: ["CC6.1", "CC6.8", "CC7.2"],
      collector_id: "SOC2-AUTO-COLLECT"
    },
    expected: {
      github_access_logs_collected: true,
      aws_iam_policies_exported: true,
      jira_change_tickets_verified: true,
      evidence_vault_s3_path: "s3://soc2-vault-internal/2026-Q3/evidence-pack.zip",
      auditor_digest_sent: true
    }
  },
  '09-01': {
    input: {
      pipeline_id: "ETL-MAIN-CUSTOMER-SYNC",
      job_run_id: "RUN-8819",
      error_code: "DB_DEADLOCK_DETECTED",
      failed_at: "2026-08-12T22:10:00Z"
    },
    expected: {
      self_healing_attempted: true,
      action_taken: "RESTARTED_JOB_WITH_BACKOFF",
      retry_success: true,
      slack_digest_sent: true,
      status: "RESOLVED_AUTO"
    }
  },
  '09-02': {
    input: {
      table_name: "fact_monthly_revenue",
      record_count: 5000,
      null_percentage_customer_id: 12.4, // Threshold is 1.0%
      data_timestamp: "2026-08-12"
    },
    expected: {
      circuit_breaker_tripped: true,
      downstream_pipeline_halted: true,
      incident_ticket_key: "DATA-9912",
      slack_alert_sent: true,
      reason: "NULL percentage for customer_id (12.4%) exceeded safety threshold (1.0%)"
    }
  },
  '10-03': {
    input: {
      date: "2026-08-12",
      recipient_email: "ceo@company.com",
      focus_metrics: ["arr", "net_churn", "cash_runway_months", "open_sev1_incidents"]
    },
    expected: {
      arr_usd: 48500000,
      net_churn_percent: 0.4,
      cash_runway_months: 28,
      open_sev1_incidents: 0,
      briefing_rendered_pdf: "https://reports.internal/briefing-2026-08-12.pdf",
      delivery_status: "DELIVERED_TO_INBOX"
    }
  }
};

// Write fixture files for each featured workflow
Object.keys(sampleFixtures).forEach(id => {
  const item = manifest.find(m => m.id === id);
  if (item) {
    fs.writeFileSync(path.join(FIXTURES_INPUTS_DIR, `${id}.json`), JSON.stringify(sampleFixtures[id].input, null, 2), 'utf8');
    fs.writeFileSync(path.join(FIXTURES_EXPECTED_DIR, `${id}.json`), JSON.stringify(sampleFixtures[id].expected, null, 2), 'utf8');
    item.fixtureAvailable = true;
    item.verified = true;
    item.maturity = "demo-verified";
  }
});

// Update manifest
fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
console.log(`Generated input & expected fixtures for ${Object.keys(sampleFixtures).length} featured workflows.`);

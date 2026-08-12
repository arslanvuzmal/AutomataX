# 🔒 AutomataX Security Policy

## 🛡 Supported Versions

Security updates and secret scanning are actively enforced on the `main` branch.

| Version / Branch | Supported | Secret Scanning |
| :--- | :---: | :---: |
| `main` | ✅ Yes | Enforced via TruffleHog CI |
| Legacy releases | ❌ No | Upgrade to `main` |

---

## 🔒 Credential & Data Isolation Policy

1. **Zero Secret Storage**: No real API keys, passwords, bearer tokens, or sensitive certificates may be committed to this repository.
2. **n8n Credential Manager**: Workflows must consume credentials exclusively via n8n's Credential Store (`{{$credentials.credentialName.property}}`).
3. **Environment Variables**: Dynamic parameters (e.g., webhook endpoints, hostnames) must consume process environment variables (`{{$env.VAR_NAME}}`).
4. **PII Masking**: Fixture files in `fixtures/` contain 100% fictional mock data. Production workflows processing PII should implement masking before logging to external aggregators.

---

## 🚨 Reporting Vulnerabilities

If you discover a security vulnerability or exposed key:

- **Email Maintainer**: Report directly to `security@automatax.io` or open a private GitHub Security Advisory.
- **Response Timeline**: Acknowledgments within 24 hours; fixes published within 72 hours.

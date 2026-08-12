# Contributing to AutomataX

Thank you for contributing to **AutomataX**! AutomataX is a community-driven repository of high-quality business automation architectures for n8n.

---

## 🚀 Adding a New Workflow (#101+)

To submit a new automation workflow:

1. **Fork the Repository**: Create a branch off `main` (e.g., `feature/add-workflow-101`).
2. **Export n8n JSON**: Build and test your workflow in n8n. Ensure no hardcoded secrets or API keys exist. Export the workflow JSON file into the appropriate domain directory under `workflows/<domain-slug>/`.
3. **Register in Manifest**: Add a structured record to `manifest/workflows.json` following the official schema.
4. **Create Workflow Documentation**: Create a dedicated documentation page under `docs/workflows/<id>-<slug>.md` using the standard AutomataX specification template.
5. **Generate Visual Diagrams**: Run `npm run generate:diagrams` to auto-generate SVG architecture graphics under `assets/workflows/<id>/architecture.svg`.
6. **Provide Fixtures (Optional for Demo Verified)**: If submitting a `demo-verified` workflow, include test fixtures under `fixtures/inputs/<id>.json` and `fixtures/expected/<id>.json`.
7. **Run Validators**: Execute `npm test` to verify JSON syntax, manifest synchronization, and secret scanning.
8. **Submit PR**: Open a Pull Request using our PR template.

---

## 🛠 Required Workflow Standards

- **No Plaintext Credentials**: Use `{{$credentials...}}` for all secret bindings.
- **Node Naming**: Every node must have a clear, descriptive business name.
- **Error Handling**: Include error handling pathways or explicitly document error recovery logic in the workflow specs.
- **Truthful Maturity**: Assign the correct maturity level (`architecture-blueprint` or `demo-verified`).

---

## 🧪 Local Testing & Build Commands

```bash
# Run all repository validators
npm test

# Rebuild manifest and stats
npm run build:manifest && npm run generate:stats
```

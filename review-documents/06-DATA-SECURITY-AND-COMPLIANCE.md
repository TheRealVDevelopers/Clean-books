# Data, Security and Compliance

## Current prototype position

The prototype contains fictional data and has no active production backend. It must not be used to store real client documents, credentials, tax records or personally identifiable information.

## Required production controls

### Authentication and authorization

- Firebase Authentication or an equivalent identity provider.
- Multi-factor authentication for CA principals and administrators.
- Role-based and tenant-based access controls.
- Server-enforced separation between firms and clients.
- Session expiry and device management.

### Data protection

- Encryption in transit and at rest.
- Restricted document download URLs.
- Malware scanning for uploaded files.
- Data retention and secure-deletion policies.
- Backups and disaster-recovery testing.
- Secrets stored in backend secret management, never front-end environment variables.

### Audit and approvals

- Immutable audit log for all financial and statutory actions.
- Maker-checker approvals for filing, payment and external submission.
- Source-record references for every calculated amount.
- Provider response and acknowledgement storage.
- No automatic statutory filing without authorized human confirmation.

### Privacy

- Documented privacy notice and consent model.
- Data-processing agreements with vendors.
- Purpose limitation and least-privilege access.
- Process for data export, correction and deletion where legally applicable.
- Review against applicable Indian privacy and data-protection requirements before launch.

## GST and portal integrations

- Do not scrape GST or E-Way Bill portals.
- Use authorized GSP/ASP or approved APIs.
- Keep taxpayer credentials and provider secrets on secure backend infrastructure.
- Log request payload references, responses, IRNs, acknowledgement numbers and errors.
- Require CA review before return submission.

## AI safeguards

- AI must access only records permitted to the signed-in user.
- Responses must identify the client, period and source records used.
- AI output must be treated as a draft, not professional advice or a filed return.
- Sensitive data sent to an AI provider must follow the firm's data-processing policy.
- Prompt injection and uploaded-document content must not override authorization or system controls.

## Commercial and professional review

The proposed recurring 20% referral-share arrangement must be reviewed by qualified legal counsel and against ICAI professional-conduct requirements before implementation. The prototype presents the concept and does not establish that the arrangement is permissible.

## Documents required before production launch

- Terms of service.
- Privacy policy.
- Client data-processing agreement.
- Information-security policy.
- Incident-response plan.
- Backup and disaster-recovery plan.
- Vendor and subprocessor register.
- Access-control policy.
- Referral agreement approved for professional compliance.


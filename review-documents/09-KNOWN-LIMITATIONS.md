# Known Limitations

## Prototype limitations

- No production authentication.
- No persistent database-backed business records.
- No real file upload storage.
- No multi-device or multi-user synchronization.
- No government portal submission.
- No real accounting-software integration.
- No WhatsApp, email, bank or payment integration.
- No connected AI model.
- No automated test suite currently configured.
- Demo financial and compliance records are generated or hard-coded.

## Voice invoice limitations

- Browser speech recognition support varies.
- Recognition quality depends on browser, microphone, accent and background noise.
- The parser supports a limited set of sentence patterns.
- Product masters, unit codes, place of supply and tax rules require production expansion.
- Printing is a browser print view, not a finalized statutory PDF service.

## E-Way Bill limitations

- Generated E-Way Bill numbers are fictional.
- No API submission, update, cancellation or extension.
- No transporter document number/date flow.
- No multi-vehicle, transshipment or consolidated E-Way Bill flow.
- Distance and validity logic is a simplified demonstration and must be verified against current rules and provider APIs before production.
- Portal validations and error codes are not represented.

## Engineering limitations

- The production JavaScript bundle currently triggers Vite's large-chunk warning.
- Route-level code splitting has not been implemented.
- Demo actions are centralized in one React context store.
- Formal repository, service and API layers are still required.
- Loading, retry and offline behavior require production implementation.

## Review interpretation

The prototype should be evaluated for product direction, workflow clarity, user experience and architecture planning. It should not be evaluated as a finished statutory filing or accounting product.


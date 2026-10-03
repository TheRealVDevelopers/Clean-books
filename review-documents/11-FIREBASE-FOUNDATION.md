# Firebase Foundation

## Implemented in the first Stage 1 slice

- Firebase Authentication provider for email/password and Google sign-in.
- Password-reset action.
- Protected application routes when Firebase configuration is present.
- Automatic demo mode when Firebase is not configured.
- Firestore tenant and role security-rule foundation.
- Firebase Storage path, type and size restrictions.
- Firebase Hosting configuration.
- Firestore index configuration file.
- Environment and Firebase local files excluded from source control.
- Callable backend functions for platform-created firms, firm invitations and secure invitation acceptance.

## Identity document

Each authenticated account requires `users/{uid}`:

```json
{
  "firmId": "firm_123",
  "role": "principal",
  "status": "active",
  "clientIds": [],
  "displayName": "S. Ramanathan",
  "email": "user@example.com"
}
```

Supported role names in the current rules:

- `principal`
- `manager`
- `staff`
- `reviewer`
- `client_owner`
- `client_manager`
- `employee`

Client users require permitted client IDs in `clientIds`.

## Primary Firestore paths

```text
users/{uid}
firms/{firmId}
firms/{firmId}/clients/{clientId}
firms/{firmId}/clients/{clientId}/documents/{documentId}
firms/{firmId}/clients/{clientId}/transactions/{transactionId}
firms/{firmId}/clients/{clientId}/invoices/{invoiceId}
firms/{firmId}/clients/{clientId}/ewayBills/{ewayBillId}
firms/{firmId}/clients/{clientId}/filings/{filingId}
firms/{firmId}/clients/{clientId}/tasks/{taskId}
firms/{firmId}/clients/{clientId}/auditEvents/{eventId}
```

Client subcollection records must carry matching `firmId` and `clientId` fields.

## Storage path

```text
firms/{firmId}/clients/{clientId}/{category}/{fileName}
```

The first rules allow PDFs, images, CSV files and common vendor-office MIME types up to 15 MB. Production should narrow permitted types per upload category.

## Firebase setup

1. Create separate Firebase projects for development and production.
2. Enable Email/Password and Google providers in Firebase Authentication.
3. Create Firestore and Storage in the required region.
4. Copy `.env.example` to `.env` and add the Web App configuration.
5. Install Firebase CLI and authenticate.
6. Select the correct Firebase project.
7. Deploy rules only after testing them in the Firebase Emulator Suite.

```bash
firebase emulators:start
firebase deploy --only firestore:rules,firestore:indexes,storage
npm run build
firebase deploy --only hosting
```

## Required next step

The trusted Cloud Functions now provision firms and users; direct browser creation is denied by Firestore rules. Next, build the administrator and invitation-acceptance screens, then add automated emulator tests proving cross-firm and cross-client access is denied.

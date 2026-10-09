# Seed users (emulator only)

`npm run seed` wipes the local Firebase emulators and loads these accounts. They exist only in the
emulators of the offline `demo-cleanbook` project. They are not real credentials and must never be
created in a real Firebase project.

Password for every account: `cleanbook-seed-1`

| Email | Role | Firm |
|---|---|---|
| principal.a@cleanbook.test | principal | Seed Firm A (`firm-a`) |
| principal.b@cleanbook.test | principal | Seed Firm B (`firm-b`) |

WO1-15 extends the seed to a manager, staff member and three client owners per firm.

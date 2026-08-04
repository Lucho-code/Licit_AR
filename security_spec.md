# Security Spec

## Data Invariants
- A simulation must belong to a user (`userId` must match `request.auth.uid`).
- A simulation ID must match the document ID.
- Offers state must belong to a user (`userId` must match `request.auth.uid`).
- The document ID for offers state must be the user's ID.

## Dirty Dozen Payloads
1. Unauthenticated read of simulations.
2. Unauthenticated write of simulations.
3. Authenticated read of another user's simulations.
4. Authenticated write of another user's simulations.
5. Create simulation with wrong userId.
6. Create simulation without required fields.
7. Update simulation to change userId.
8. Unauthenticated read of offers state.
9. Unauthenticated write of offers state.
10. Authenticated read of another user's offers state.
11. Authenticated write of another user's offers state.
12. Write offers state to a document ID different from userId.

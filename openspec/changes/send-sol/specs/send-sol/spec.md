## ADDED Requirements

### Requirement: Send SOL action metadata
The system SHALL expose a Solana Action metadata endpoint for `send-sol` that describes transfer actions requiring a recipient wallet and amount.

#### Scenario: Metadata includes parameterized transfer actions
- **WHEN** a client requests the `send-sol` action metadata
- **THEN** the response MUST be of type `action` and include transaction links that carry the required transfer parameters for recipient and amount

#### Scenario: Metadata supports custom transfer input
- **WHEN** a client renders the `send-sol` action from metadata
- **THEN** the action definition MUST include input parameters allowing users to provide custom transfer values needed to build the transaction

### Requirement: Send SOL transaction construction
The system SHALL construct a valid Solana transfer transaction from the connected payer wallet to the requested recipient wallet for the requested amount.

#### Scenario: Valid transfer request returns serialized transaction
- **WHEN** a client submits a POST request with a valid payer account, recipient account, and amount
- **THEN** the system MUST return an `ActionPostResponse` containing a serialized base64 transaction for payer signature

#### Scenario: Invalid recipient is rejected
- **WHEN** the request contains a recipient value that is not a valid Solana public key
- **THEN** the system MUST return a client error and MUST NOT return a transaction payload

#### Scenario: Invalid amount is rejected
- **WHEN** the request amount is missing, non-numeric, or less than or equal to zero
- **THEN** the system MUST return a client error and MUST NOT return a transaction payload

### Requirement: Send SOL balance safety checks
The system SHALL validate payer balance sufficiency before returning the transaction response.

#### Scenario: Insufficient balance is rejected pre-sign
- **WHEN** payer balance is lower than transfer amount plus estimated network fee plus configured safety buffer
- **THEN** the system MUST return a client error with an insufficient-funds message and MUST NOT return a transaction payload

#### Scenario: Sufficient balance allows action response
- **WHEN** payer balance is at least transfer amount plus estimated network fee plus configured safety buffer
- **THEN** the system MUST return a successful action transaction response

### Requirement: Extension compatibility with send-sol
The extension integration SHALL execute `send-sol` actions without protocol changes.

#### Scenario: Extension consumes send-sol action URL
- **WHEN** the extension resolves and fetches a `send-sol` action URL
- **THEN** it MUST process the action through the existing Blink fetch, wallet signing, transaction submission, and confirmation flow

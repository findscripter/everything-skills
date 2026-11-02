# Widget API change: revise before release

The two original, synthetic OpenAPI fixtures were read using `api-design-reviewer`, followed by `api-security-best-practices`. The proposed version is `1.1.0`, while its routes still say `/api/v1`. Four backward-incompatible contract changes and four design/security issues were identified. See [the exact JSON pointers and input hashes](findings.json).

## Contract changes

| Finding | Input evidence | Consumer impact | Suggested revision |
| --- | --- | --- | --- |
| Removed operation | `GET /api/v1/widgets` exists before, disappears after | Existing list clients lose their route | Preserve the old route or introduce a deliberate v2 migration |
| Changed response type | `Widget.properties.id.type`: `string` → `integer` | Clients expecting string IDs may fail parsing or lose leading zeros | Keep the string contract in v1 |
| Removed response property | `Widget.properties.name` disappears | Existing consumers can no longer read the documented name | Retain it, or version the response with a migration guide |
| Newly required request property | `CreateWidget.required`: `name` → `name, ownerId` | Previously valid create requests without `ownerId` become invalid | Keep it optional in v1; determine ownership from authenticated context where appropriate |

## Design and security follow-up

1. `/api/v1/getWidgets` uses a verb rather than a resource noun. Retain `/api/v1/widgets`.
2. The new collection has no bounded `limit`. Specify and implement a maximum page size and continuation contract.
3. The detail operation now has `security: []`, explicitly overriding the root bearer requirement. Restore the intended authentication contract and test access by two users. **This specification cannot prove that a runtime ownership check exists or is missing.**
4. The declared server changes from HTTPS to HTTP. Restore HTTPS for an external deployment. The `.invalid` host is reserved for this fixture and was never contacted.

## Transparent scorecard

The skill proposes weights of consistency 30%, documentation 20%, security 20%, usability 15%, performance 15%. This example operationalizes them with a small, explicitly listed rubric: no breaking/verb routes (0/30), descriptions on each operation/response (20/20), HTTPS and no anonymous override (0/20), bounded collection (0/15), and a declared detail ETag (15/15). Total **35/100, F**, for this deliberately flawed fixture.

The last item checks a **performance design affordance**, not speed. These binary criteria were written for this example and are not a calibrated API-quality standard. The decision is supported by the concrete contract regressions, not the score alone.

## Evidence and limits

The [example script](../reproduce.mjs) actually compares these inputs and rebuilds the findings. It is bounded to the fixture's operations, `Widget` response and `CreateWidget` request; it is not a general `$ref` resolver or a complete OpenAPI validator. We did not run `api_linter.py`, `breaking_change_detector.py`, or `api_scorecard.py`: those filenames are referenced in the skill but absent from its directory. The example uses its own Node implementation.

No API server, token issuer, database, penetration test, throughput test, production workload, or model-client installation was exercised. Missing security text in a specification is a design finding, not proof of an exploitable live service. A real release would need runtime tests for authentication, ownership, input bounds, error redaction, and rate limits.

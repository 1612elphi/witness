# Lore API Surfaces

Verbatim copy of `lore-proto/proto/` from `EpicGames/lore@main` (workspace v0.8.6-nightly, shallow clone in `../upstream/`). These protobuf files are the canonical client↔server API definitions. The small HTTP/1.1 REST surface has no proto — it's documented at the bottom.

## Transports

| Endpoint | Protocol | Notes |
|----------|----------|-------|
| `lore.DOMAIN_SUFFIX:443` udp | QUIC (TLS 1.3, custom binary framing) | Preferred bulk-data path; same logical operations as the storage gRPC service |
| `lore.DOMAIN_SUFFIX:443` tcp | gRPC (HTTP/2) | Full API surface — everything below |
| HTTP/1.1 | REST | Operational + content up/download only (see bottom) |

Clients choose transport by URL scheme: `lores://` = QUIC, `grpcs://` = gRPC.

**Browser-UI note:** browsers can't speak raw gRPC/QUIC. A web UI needs grpc-web translation at the proxy, a thin BFF calling these services, or the REST surface where it suffices. `ThinClientService` was designed by Epic for exactly this kind of consumer.

## Primary surface (the `lore/` tree — current, versioned)

| File | Service | What the UI gets from it |
|------|---------|--------------------------|
| `lore/repository/v1/repository.proto` | `RepositoryService` | Repo create/delete/get/list + metadata. The project browser / repo picker. |
| `lore/revision/v1/revision.proto` | `RevisionService` | Branch create/delete/get/list, `BranchPush`, `RevisionList` (commit history), branch metadata. The branch/history views. |
| `lore/thin_client/v1/thin_client.proto` (+ `model.proto`) | `ThinClientService` | `ContentDiff`, `RevisionInfo`, `RevisionDiff`, `RevisionTree` — ready-made view models for a UI that doesn't hold a local checkout. **Start here.** |
| `lore/storage/v1/storage.proto` | `StorageService` | Raw content-addressed get/put/query of fragments + mutable KV. Bulk data plane; a UI rarely calls this directly except for file download/upload. |
| `lore/environment/v1/environment.proto` | `EnvironmentService` | Server-advertised config and per-service endpoint overrides. Handshake/discovery on connect. |
| `lore/model/v1/model.proto` | — | Shared message types used by the v1 services. |

## Supporting services (top-level files)

| File | Service | What the UI gets from it |
|------|---------|--------------------------|
| `lock.proto` | `LockService` | `Lock`/`Unlock`/`Query`/`Status`/`AdminLock` — file-locking indicators and actions for binary assets. |
| `notification.proto` | `NotificationService` | `Subscribe` (server-streaming) — live change events for "someone pushed" refresh cues. `NotificationAdminService` for streams. |
| `admin.proto` | `AdminService` | `ServerInfo`, `Obliterate` (GDPR-style hard delete). Admin console only. |

## Epic-internal / server-to-server — ignore for UI design

- `auth_api.proto`, `rebac_api.proto` — Epic's own online-services auth; we replace this with our SSO (not part of these files).
- `epic_events.proto` — Epic event plumbing.
- `replication.proto` and `ForwardedRevisionService` (inside `lore/revision/v1/revision.proto`) — server↔server replication, never called by clients.
- `environment.proto`, `model.proto`, `lore_notification.proto` (top level) — legacy pre-v1 versions kept for backward compat; the `lore/**/v1/` files supersede them.

## REST surface (HTTP/1.1, no proto)

Defined in `../upstream/lore-server/src/http/`:

| Route | Auth | Purpose |
|-------|------|---------|
| `GET /health_check` | none | Liveness/readiness |
| `PUT /v1/repository/{repository_id}/content/` | JWT | Upload content |
| `GET /v1/repository/{repository_id}/content/{address}/` | JWT | Download content by content hash |
| `POST /v1/repository/{repository_id}/content/{address}/presign` | JWT | Mint a presigned download URL |
| `GET /v1/presigned/{repository_id}/{address}` | presign token | Redeem presigned URL (browser-friendly file download) |

## Auth model (for UI flows)

Authenticated calls carry a JWT bearer. Per-repository authorization rides on a `resources: [{resource_id, permission}]` claim matched against `urc-<repository>` / `urc-*`. In our deployment these tokens come from Sunbeam SSO (device-code flow for CLI, browser OIDC for web) — that surface lives in the sso-gateway repo and is intentionally not duplicated here.

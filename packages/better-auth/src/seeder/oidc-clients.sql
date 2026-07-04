-- better-auth oauth_client seeder
-- Usage (remote): bunx wrangler d1 execute roppoh-better-auth --remote --file=./packages/better-auth/src/seeder/oidc-clients.sql
-- Usage (local):  bunx wrangler d1 execute roppoh-better-auth --file=./packages/better-auth/src/seeder/oidc-clients.sql

INSERT OR IGNORE INTO "oauth_client" (
  "id",
  "client_id",
  "client_secret",
  "disabled",
  "skip_consent",
  "enable_end_session",
  "subject_type",
  "scopes",
  "user_id",
  "created_at",
  "updated_at",
  "name",
  "uri",
  "icon",
  "contacts",
  "tos",
  "policy",
  "software_id",
  "software_version",
  "software_statement",
  "redirect_uris",
  "post_logout_redirect_uris",
  "token_endpoint_auth_method",
  "grant_types",
  "response_types",
  "public",
  "type",
  "require_pkce",
  "reference_id",
  "metadata"
) VALUES (
  'PPSbyg59SCbw7K5GoX26HC0r40CK08zN',               -- id
  'ilGTgxGHtHPkxLAypNEsAuuVvkfgKuOj',               -- client_id
  'ciVY_uBod4qDvyLzXX-7syB6c685Sb51yXMJRSRCamM',    -- client_secret
  0,                                                  -- disabled
  NULL,                                               -- skip_consent
  NULL,                                               -- enable_end_session
  NULL,                                               -- subject_type
  NULL,                                               -- scopes
  'super-admin-seed-001',                             -- user_id
  cast(unixepoch() * 1000 as integer),                -- created_at
  cast(unixepoch() * 1000 as integer),                -- updated_at
  'ura-roppoh',                                       -- name
  NULL,                                               -- uri
  NULL,                                               -- icon
  NULL,                                               -- contacts
  NULL,                                               -- tos
  NULL,                                               -- policy
  NULL,                                               -- software_id
  NULL,                                               -- software_version
  NULL,                                               -- software_statement
  '"[\"https://ura-roppoh.tsar-bmb.org\",\"http://localhost:51731\"]"', -- redirect_uris
  NULL,                                               -- post_logout_redirect_uris
  'client_secret_basic',                              -- token_endpoint_auth_method
  '"[\"authorization_code\"]"',                       -- grant_types
  '"[\"code\"]"',                                     -- response_types
  0,                                                  -- public
  NULL,                                               -- type
  NULL,                                               -- require_pkce
  NULL,                                               -- reference_id
  NULL                                                -- metadata
);

-- apps/web-console (new; see migration plan decision #7). Mirrors the
-- ura-roppoh row's shape exactly (public=0 / client_secret_basic /
-- require_pkce=NULL) even though the app runs browser PKCE with
-- token_endpoint_auth_method: "none" client-side — that's the proven,
-- already-working shape for the sibling apps. redirect_uris uses the same
-- bare-origin form (not /callback) as the existing rows.
INSERT OR IGNORE INTO "oauth_client" (
  "id",
  "client_id",
  "client_secret",
  "disabled",
  "skip_consent",
  "enable_end_session",
  "subject_type",
  "scopes",
  "user_id",
  "created_at",
  "updated_at",
  "name",
  "uri",
  "icon",
  "contacts",
  "tos",
  "policy",
  "software_id",
  "software_version",
  "software_statement",
  "redirect_uris",
  "post_logout_redirect_uris",
  "token_endpoint_auth_method",
  "grant_types",
  "response_types",
  "public",
  "type",
  "require_pkce",
  "reference_id",
  "metadata"
) VALUES (
  'tWtVaBzTQZSUtFKgITFpNcQdLpAE67T7',               -- id
  'dNIMDgdWx0fkweafSns23Et9v3AKHlT9',               -- client_id
  'QqmdQ3TLWT_4K5YvtaIj3zEzcFPAxfZ_-kQf9M92m0w',    -- client_secret
  0,                                                  -- disabled
  NULL,                                               -- skip_consent
  NULL,                                               -- enable_end_session
  NULL,                                               -- subject_type
  NULL,                                               -- scopes
  'super-admin-seed-001',                             -- user_id
  cast(unixepoch() * 1000 as integer),                -- created_at
  cast(unixepoch() * 1000 as integer),                -- updated_at
  'web-console',                                      -- name
  NULL,                                               -- uri
  NULL,                                               -- icon
  NULL,                                               -- contacts
  NULL,                                               -- tos
  NULL,                                               -- policy
  NULL,                                               -- software_id
  NULL,                                               -- software_version
  NULL,                                               -- software_statement
  '"[\"https://web-console.tsar-bmb.org\",\"http://localhost:51732\"]"', -- redirect_uris
  NULL,                                               -- post_logout_redirect_uris
  'client_secret_basic',                              -- token_endpoint_auth_method
  '"[\"authorization_code\"]"',                       -- grant_types
  '"[\"code\"]"',                                     -- response_types
  0,                                                  -- public
  NULL,                                               -- type
  NULL,                                               -- require_pkce
  NULL,                                               -- reference_id
  NULL                                                -- metadata
);

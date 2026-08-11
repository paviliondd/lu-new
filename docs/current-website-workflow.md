# Current website workflow

```mermaid
flowchart LR
  Reader[Reader] --> Nginx[Nginx TLS proxy]
  Nginx --> Next[Next.js App Router]
  Next --> Payload[Payload CMS]
  Payload --> Postgres[(Postgres)]
  Payload --> S3[(S3 media)]
  S3 --> CDN[CDN]
  CDN --> Reader
  Next --> Redis[(Redis cache)]
  Next -. CMS unavailable .-> Fallback[Local fallback content]
```

Payload is authoritative whenever its query succeeds. Local content is used only when Payload is unavailable or a query fails; an empty successful CMS result remains empty.

# AWS production topology

```mermaid
flowchart TB
  Internet --> VPS[VPS: Nginx + app + workers]
  VPS --> ECR[(Amazon ECR images)]
  VPS --> Media[(payload_media volume)]
  VPS -. optional off-host backup .-> Backup[(S3 backup bucket)]
  VPS --> DB[(Postgres volume)]
  VPS --> Cache[(Redis volume)]
  VPS --> Kuma[(Uptime Kuma volume)]
```

The current production target keeps compute, databases, and Payload media on the VPS. Pre-deploy backups include the media volume; an optional S3 backup target can move encrypted archives off-host when configured. ECR provides immutable application rollback artifacts.

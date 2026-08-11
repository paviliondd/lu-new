# AWS production topology

```mermaid
flowchart TB
  Internet --> CDN[CDN for public media]
  Internet --> VPS[VPS: Nginx + app + workers]
  VPS --> ECR[(Amazon ECR images)]
  VPS --> Media[(S3 media bucket)]
  VPS --> Backup[(S3 backup bucket)]
  VPS --> DB[(Postgres volume)]
  VPS --> Cache[(Redis volume)]
  VPS --> Kuma[(Uptime Kuma volume)]
  Media --> CDN
```

The current production target keeps compute and databases on the VPS. S3 removes uploaded media and backup durability from the VPS failure domain; ECR provides immutable application rollback artifacts.

# Optional serverless workflow

```mermaid
flowchart LR
  Client --> CDN[CloudFront]
  CDN --> Static[S3 static assets]
  CDN --> API[API Gateway]
  API --> Lambda[Lambda functions]
  Lambda --> Data[(Managed data services)]
  Lambda --> Media[(S3 media)]
  Events[EventBridge] --> Lambda
```

This topology is architectural research only. The application remains Next.js, Payload CMS, Postgres, Redis, Docker Compose, and Nginx unless an explicit migration is approved.

# Optional EKS evolution

```mermaid
flowchart LR
  GitHub[GitHub Actions] --> ECR[(ECR)]
  ECR --> EKS[EKS workloads]
  ALB[Application Load Balancer] --> EKS
  EKS --> RDS[(RDS PostgreSQL)]
  EKS --> Redis[(ElastiCache Redis)]
  EKS --> S3[(S3 media)]
  CloudFront[CloudFront] --> ALB
  CloudFront --> S3
```

This is an evolution option, not the active deployment. Moving to EKS requires managed database/cache decisions, workload identity, ingress, observability, and a tested data migration plan.

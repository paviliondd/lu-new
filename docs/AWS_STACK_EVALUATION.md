# AWS Stack Evaluation

## Current runtime

The current production workflow builds an immutable ECR image and deploys it over SSH to a VPS running Docker Compose. Nginx fronts a single Next.js/Payload container. PostgreSQL, Redis, media storage, and Uptime Kuma are colocated as containers and Docker volumes.

This is cost-efficient and matches the repository, but the host, database, cache, and media volume share one failure domain. GitHub Actions also uses long-lived AWS credentials for ECR and an SSH key for deployment.

Diagram: `docs/current-website-workflow.drawio`.

## Recommended serverless-container target

Use serverless managed infrastructure around the existing container rather than converting the full CMS runtime into Lambda functions:

- CloudFront, ACM, and WAF at the edge.
- ALB with ECS Fargate tasks across at least two Availability Zones.
- Aurora PostgreSQL Serverless v2 or RDS PostgreSQL, selected after measuring the steady database floor.
- ElastiCache Serverless for Valkey where the measured cache traffic justifies it.
- S3 for private, versioned Payload media.
- Secrets Manager/KMS and task IAM roles.
- GitHub Actions OIDC, ECR image scanning, and ECS rolling deployment.
- Lambda only for bounded asynchronous work such as revalidation, image jobs, or scheduled audits.

This retains Next.js App Router, Payload CMS, PostgreSQL, Redis-compatible cache, and the bilingual/fallback behavior. It requires a media storage adapter before horizontal scaling because Fargate task storage is ephemeral.

Diagram: `docs/aws-serverless-workflow.drawio`.

## EKS target

EKS can run the application without a framework rewrite, but it introduces a Kubernetes control plane, node lifecycle, ingress/controller upgrades, workload identity, autoscaling, observability, policy, and cluster-version operations.

Use EKS only when at least one of these becomes true:

- Several independently deployed services share the platform.
- The team needs Kubernetes portability or existing Kubernetes operations.
- Custom controllers, service mesh, advanced scheduling, or large Spot fleets create measurable value.
- A platform team owns cluster security and upgrades.

For this single blog/CMS, EKS is primarily a learning/platform choice, not the cost-optimal production choice. Standard-support EKS has a control-plane charge before worker nodes and other infrastructure. EKS Auto Mode adds management charges on top of EC2 capacity.

Diagram: `docs/aws-eks-workflow.drawio`.

## Migration order

1. Replace long-lived GitHub AWS keys with OIDC.
2. Move media from the Docker volume to private S3 and verify legacy imported media.
3. Move PostgreSQL to RDS/Aurora and test backup restoration.
4. Move Redis to Valkey only after confirming cache/session behavior.
5. Deploy one Fargate task in staging, then two tasks across AZs.
6. Add CloudFront/WAF, alarms, budgets, audit logs, and disaster-recovery exercises.
7. Evaluate EKS later using the same ECR image after the application is stateless.


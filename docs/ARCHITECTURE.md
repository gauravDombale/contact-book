# ContactBook - Web-Scale Architecture

## Executive Summary

For personal use, a single FastAPI + SQLite node is enough. For public deployment serving thousands of concurrent users, ContactBook should move to stateless API replicas, managed PostgreSQL, cache-backed rate limiting, external search, and observable infrastructure.

## Current Local Stack

- FastAPI + SQLite + React SPA
- SQLAlchemy 2.0 async ORM with Alembic migrations
- Single-process, file-based database
- Good for demos, personal use, and 1-5 concurrent users

## Production Web Architecture

### 1. Database: SQLite to PostgreSQL

- Managed PostgreSQL through Supabase, RDS, Cloud SQL, or Neon
- PgBouncer for connection pooling
- Read replicas for high-volume list and search queries
- `pg_trgm` indexes for fuzzy name, email, and phone search
- Point-in-time recovery and automated backups

### 2. Caching: Redis

- Cache frequent list and search results with a short TTL, such as 60 seconds
- Store API rate-limit counters
- Support background job queues
- Use cache invalidation on contact create, update, delete, and merge

### 3. Horizontal Scaling

- Run 3+ FastAPI replicas behind an application load balancer
- Keep API workers stateless
- Autoscale on CPU, memory, and request latency
- Use rolling deploys with health checks on `/health`

### 4. Object Storage

- Store contact avatar images in S3, Cloudflare R2, or GCS
- Use presigned URLs for direct client uploads
- Keep only object keys and metadata in PostgreSQL

### 5. Authentication and Multi-Tenancy

- Add OAuth2/OIDC through Clerk, Auth0, Cognito, or a self-hosted identity provider
- Issue short-lived JWTs
- Add `user_id` to contacts
- Enforce tenant isolation through application checks and PostgreSQL row-level security

### 6. API Gateway and Edge

- Terminate HTTPS at CloudFront, Cloudflare, or an ALB
- Apply IP and user-level rate limits
- Enforce request body limits and basic request validation
- Serve the React app from CDN-backed static hosting

### 7. Search at Scale

- Start with PostgreSQL `pg_trgm`
- Move to OpenSearch or Elasticsearch when fuzzy search, ranking, or cross-field matching becomes central
- Normalize phone numbers during writes
- Sync search documents asynchronously from contact mutation events

### 8. Background Jobs

- Use Celery, ARQ, or RQ with Redis
- Handle CSV and vCard import/export
- Run duplicate detection and merge suggestions
- Perform optional email or phone verification

### 9. Observability

- Structured JSON logs with request IDs
- Metrics through Prometheus and Grafana
- Tracing through OpenTelemetry and Jaeger or a managed APM
- Error tracking with Sentry
- Alert on p95 latency, error rate, queue depth, and database saturation

### 10. CI/CD

- GitHub Actions pipeline: test, lint, build, scan, publish, deploy
- Backend image pushed to ECR, GHCR, or Docker Hub
- Frontend static assets deployed to CDN-backed storage
- Preview environments for pull requests
- Alembic migrations applied as a controlled release step

## Architecture Diagram

```text
User Browser
     |
     v
 CloudFront / CDN
     |
     v
  ALB / API Gateway
  +----------+
  |          |
  v          v
 API        API       FastAPI replicas on ECS or Kubernetes
  +----+-----+
       |
  +----+---------+----------+
  v              v          v
PostgreSQL     Redis       S3 / R2
  |
  v
OpenSearch
```

## Data Model Changes for Multi-Tenancy

- Add `user_id` on the `contacts` table
- Add composite indexes on `(user_id, first_name)`, `(user_id, email)`, and `(user_id, phone)`
- Add PostgreSQL row-level security policies
- Store normalized phone and email columns for exact matching
- Add soft-delete fields if audit and recovery are required

## Estimated AWS Cost for About 1000 DAU

| Component | Monthly |
|---|---:|
| RDS t4g.small PostgreSQL | $25-$35 |
| ECS or Fargate API tasks | $15-$40 |
| ElastiCache t4g.micro | $15-$20 |
| S3 + CloudFront | $5-$15 |
| Logs and metrics | $5-$20 |
| Total | ~$65-$130 |

## Migration Path

1. Add authentication and `user_id` locally.
2. Move from SQLite to PostgreSQL using Alembic migrations.
3. Deploy FastAPI as a container and the frontend as static CDN assets.
4. Add Redis-backed rate limiting and cache hot reads.
5. Add search infrastructure only when PostgreSQL search is no longer enough.

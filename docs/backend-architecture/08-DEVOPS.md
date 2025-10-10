# DevOps & Deployment - Docker, CI/CD, Cloud

> **Dokümantasyon**: 08 - DevOps  
> **Versiyon**: 1.0.0  
> **Tarih**: Ekim 2025

---

## 🐳 Docker Configuration

### Dockerfile (Multi-stage)

```dockerfile
# Build stage
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

COPY --from=build /app/target/marifetbul-api-*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:prod}", "app.jar"]
```

### docker-compose.yml (Development)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: marifetbul-postgres
    environment:
      POSTGRES_DB: marifetbul
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - marifetbul-network

  redis:
    image: redis:7-alpine
    container_name: marifetbul-redis
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    networks:
      - marifetbul-network

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: marifetbul-backend
    environment:
      SPRING_PROFILES_ACTIVE: dev
      DATABASE_URL: jdbc:postgresql://postgres:5432/marifetbul
      DATABASE_USERNAME: postgres
      DATABASE_PASSWORD: postgres
      REDIS_HOST: redis
      REDIS_PORT: 6379
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - '8080:8080'
    depends_on:
      - postgres
      - redis
    networks:
      - marifetbul-network

volumes:
  postgres_data:
  redis_data:

networks:
  marifetbul-network:
    driver: bridge
```

### .dockerignore

```
target/
.mvn/
*.md
.git
.gitignore
.idea
*.iml
```

---

## 🚀 CI/CD Pipeline (GitHub Actions)

### .github/workflows/ci.yml

```yaml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_DB: testdb
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: maven

      - name: Build with Maven
        run: mvn clean install -DskipTests

      - name: Run tests
        run: mvn test
        env:
          DATABASE_URL: jdbc:postgresql://localhost:5432/testdb
          DATABASE_USERNAME: test
          DATABASE_PASSWORD: test

      - name: Generate coverage report
        run: mvn jacoco:report

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./target/site/jacoco/jacoco.xml

      - name: Build Docker image
        run: docker build -t marifetbul-backend:${{ github.sha }} .

      - name: Run security scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: marifetbul-backend:${{ github.sha }}
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload scan results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
```

### .github/workflows/deploy.yml

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Build application
        run: mvn clean package -DskipTests

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: eu-west-1

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build and push Docker image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: marifetbul-backend
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest

      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster marifetbul-cluster \
            --service marifetbul-backend-service \
            --force-new-deployment

      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Deployment to production completed!'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## ☁️ Cloud Deployment (AWS)

### Architecture

```
Internet
    ↓
CloudFront (CDN)
    ↓
ALB (Load Balancer)
    ↓
ECS (Container Service)
    ├─ Task 1: Backend API
    ├─ Task 2: Backend API (replica)
    └─ Task 3: Backend API (replica)
    ↓
RDS (PostgreSQL)
ElastiCache (Redis)
S3 (File Storage)
```

### ECS Task Definition

```json
{
  "family": "marifetbul-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [
    {
      "name": "marifetbul-api",
      "image": "{{ECR_REGISTRY}}/marifetbul-backend:latest",
      "portMappings": [
        {
          "containerPort": 8080,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "SPRING_PROFILES_ACTIVE",
          "value": "prod"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:..."
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:..."
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/marifetbul-backend",
          "awslogs-region": "eu-west-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "curl -f http://localhost:8080/actuator/health || exit 1"
        ],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    }
  ]
}
```

---

## 🔧 Environment Configuration

### Environment Variables

```bash
# Development
export SPRING_PROFILES_ACTIVE=dev
export DATABASE_URL=jdbc:postgresql://localhost:5432/marifetbul
export DATABASE_USERNAME=postgres
export DATABASE_PASSWORD=postgres
export REDIS_HOST=localhost
export REDIS_PORT=6379
export JWT_SECRET=dev-secret-key-change-in-production

# Production (from AWS Secrets Manager)
export SPRING_PROFILES_ACTIVE=prod
export DATABASE_URL=$(aws secretsmanager get-secret-value ...)
export JWT_SECRET=$(aws secretsmanager get-secret-value ...)
```

### application-prod.yml

```yaml
spring:
  datasource:
    url: ${DATABASE_URL}
    username: ${DATABASE_USERNAME}
    password: ${DATABASE_PASSWORD}
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5

  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false

  redis:
    host: ${REDIS_HOST}
    port: ${REDIS_PORT}
    ssl: true

server:
  port: 8080
  shutdown: graceful
  compression:
    enabled: true

logging:
  level:
    root: INFO
    com.marifetbul: INFO
```

---

## 📊 Monitoring & Logging

### Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'marifetbul-backend'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['backend:8080']
```

### Grafana Dashboard

```json
{
  "dashboard": {
    "title": "MarifetBul Backend Metrics",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(http_server_requests_seconds_count[5m])"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_server_requests_seconds_count{status=~\"5..\"}[5m])"
          }
        ]
      },
      {
        "title": "Response Time (p95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, http_server_requests_seconds_bucket)"
          }
        ]
      }
    ]
  }
}
```

### ELK Stack (Elasticsearch, Logstash, Kibana)

```yaml
# logstash.conf
input {
beats {
port => 5044
}
}

filter {
json {
source => "message"
}
}

output {
elasticsearch {
hosts => ["elasticsearch:9200"]
index => "marifetbul-logs-%{+YYYY.MM.dd}"
}
}
```

---

## 🔐 Secrets Management

### AWS Secrets Manager

```bash
# Create secret
aws secretsmanager create-secret \
  --name marifetbul/prod/db-credentials \
  --secret-string '{"username":"admin","password":"secure-password"}'

# Retrieve secret
aws secretsmanager get-secret-value \
  --secret-id marifetbul/prod/db-credentials \
  --query SecretString \
  --output text
```

### Environment-specific Secrets

```
Development:  - .env file (git-ignored)
Staging:      - AWS Secrets Manager
Production:   - AWS Secrets Manager + IAM roles
```

---

## 🔄 Backup & Disaster Recovery

### Database Backup

```bash
# Automated daily backup (cron job)
#!/bin/bash
DATE=$(date +%Y-%m-%d)
pg_dump -h $DB_HOST -U $DB_USER $DB_NAME | gzip > backup-$DATE.sql.gz
aws s3 cp backup-$DATE.sql.gz s3://marifetbul-backups/db/
```

### RDS Automated Backups

```
- Daily automated backups (retention: 30 days)
- Manual snapshots before major deployments
- Cross-region replication for disaster recovery
```

---

## 📈 Scaling Strategy

### Horizontal Scaling

```
- Auto-scaling based on CPU/Memory usage
- Min instances: 2
- Max instances: 10
- Target CPU: 70%
- Scale-up: +2 instances
- Scale-down: -1 instance
```

### Vertical Scaling

```
Development:  1 vCPU, 2GB RAM
Staging:      2 vCPU, 4GB RAM
Production:   4 vCPU, 8GB RAM
```

---

## ✅ Deployment Checklist

- [ ] Run all tests locally
- [ ] Update version in pom.xml
- [ ] Update CHANGELOG.md
- [ ] Create git tag
- [ ] Push to repository
- [ ] Verify CI pipeline passes
- [ ] Review deployment logs
- [ ] Run smoke tests
- [ ] Monitor metrics (5-10 minutes)
- [ ] Verify health checks
- [ ] Notify team

---

**Doküman Durumu**: ✅ Tamamlandı  
**Sonraki Adım**: AI Development Guide - [09-AI-DEVELOPMENT-GUIDE.md](./09-AI-DEVELOPMENT-GUIDE.md)

# Self-Healing Infrastructure Project

مشروع متكامل لبنية تحتية ذاتية الإصلاح على AWS باستخدام Terraform, Docker, Jenkins, Prometheus, و Ansible.

## 🏗️ Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Users     │────▶│     ALB     │────▶│    ASG      │
│             │     │ (Blue/Green)│     │  (EC2+Docker)│
└─────────────┘     └─────────────┘     └──────┬──────┘
                                                │
                    ┌─────────────────────────────┘
                    ▼
            ┌─────────────┐
            │  Prometheus  │◀── Metrics
            │  + Grafana   │
            └──────┬──────┘
                   │ Alert
                   ▼
            ┌─────────────┐
            │ Alertmanager │───▶ Slack
            └──────┬──────┘
                   │ Webhook
                   ▼
            ┌─────────────┐
            │   Ansible    │───▶ Auto-Healing
            │  Webhook     │     (Disk/Restart/Memory)
            └─────────────┘
```

## 📁 Project Structure

```
self-healing-infrastructure/
├── terraform/          # Infrastructure as Code
│   ├── modules/
│   │   ├── vpc/        # VPC, Subnets, IGW, NAT
│   │   ├── alb/        # Application Load Balancer
│   │   └── asg/        # Auto Scaling Group
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
├── app/                # Node.js Application
│   ├── server.js       # Express + Prometheus metrics
│   ├── server.test.js  # Unit tests
│   └── package.json
├── docker/             # Docker Configuration
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── nginx.conf
├── ansible/            # Self-Healing Automation
│   ├── playbooks/
│   │   ├── disk_cleanup.yml
│   │   ├── restart_service.yml
│   │   └── memory_cleanup.yml
│   ├── webhook_receiver.py
│   └── docker-compose.yml
├── monitoring/         # Prometheus + Alertmanager + Grafana
│   ├── prometheus/
│   ├── alertmanager/
│   └── docker-compose.yml
├── jenkins/            # CI/CD Pipeline
│   ├── Jenkinsfile
│   ├── Dockerfile
│   └── docker-compose.yml
└── scripts/
    └── run-all.sh      # One command to run everything
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- AWS CLI (configured)
- Terraform
- Node.js 18+

### Option 1: Run Everything with One Command

```bash
chmod +x scripts/run-all.sh
./scripts/run-all.sh "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
```

### Option 2: Run Services Individually

```bash
# Create shared network
docker network create monitoring

# Run the App
cd docker
docker-compose up -d

# Run Monitoring Stack
cd ../monitoring
SLACK_WEBHOOK_URL="your-webhook-url" docker-compose up -d

# Run Ansible + Webhook Receiver
cd ../ansible
SLACK_WEBHOOK_URL="your-webhook-url" docker-compose up -d

# Run Jenkins
cd ../jenkins
docker-compose up -d
```

### 2. Access Services

| Service | URL |
|---------|-----|
| Application | http://localhost:3000 |
| Health Check | http://localhost:3000/health |
| Metrics | http://localhost:3000/metrics |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 (admin/admin123) |
| Alertmanager | http://localhost:9093 |
| Jenkins | http://localhost:8080 |

### 3. Deploy to AWS

```bash
cd terraform

# Initialize
terraform init

# Plan
terraform plan

# Apply
terraform apply
```

## 🧪 Testing Self-Healing

### Test 1: Disk Cleanup
```bash
# On EC2 instance, create large files
sudo dd if=/dev/zero of=/tmp/bigfile bs=1M count=5000

# Prometheus will detect disk > 85%
# Alertmanager sends webhook
# Ansible auto-cleans disk
```

### Test 2: Service Restart
```bash
# Stop the app container
sudo docker stop self-healing-app

# Prometheus detects app is down
# Ansible auto-restarts service
```

### Test 3: Simulate Error Rate
```bash
# Trigger errors
curl http://localhost:3000/api/simulate-error

# High error rate > 5% triggers restart
```

## 📊 Monitoring Alerts

| Alert | Threshold | Auto-Remediation |
|-------|-----------|-----------------|
| HighErrorRate | Error rate > 5% for 2min | restart_service |
| ServiceDown | App down for 1min | restart_service |
| HighDiskUsage | Disk > 85% for 5min | disk_cleanup |
| HighMemoryUsage | Memory > 90% for 5min | memory_cleanup |
| HighCPUUsage | CPU > 80% for 10min | Notification only |
| ContainerRestartLoop | Frequent restarts | restart_service |
| HighResponseTime | P95 > 2s for 5min | Notification only |

## 🔧 CI/CD Pipeline (Jenkins)

1. **Checkout** - Pull code from Git
2. **Test** - Run unit tests
3. **Build** - Build Docker image
4. **Push** - Push to ECR
5. **Deploy** - Rolling update via ASG

## 📝 Environment Variables

```bash
# Required
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# Optional
AWS_REGION=us-east-1
TF_VAR_docker_image=your-image:latest
```

## 🔒 Security Features

- Non-root Docker user
- Security groups with least privilege
- IAM roles for EC2 instances
- Encrypted S3 state bucket
- DynamoDB state locking
- Helmet.js for HTTP headers

---

Built with ❤️ for Self-Healing Infrastructure

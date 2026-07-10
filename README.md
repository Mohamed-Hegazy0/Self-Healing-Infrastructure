cd ~/Self-Healing-Infrastructure

cat << 'EOF' > README.md
# 🚀 Self-Healing Infrastructure Project

A comprehensive, automated Self-Healing Infrastructure project deployed on AWS. This system leverages modern DevSecOps practices to autonomously monitor, detect, and remediate application failures in real-time without human intervention.

![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)
![Prometheus](https://img.shields.io/badge/Prometheus-E6522C?style=for-the-badge&logo=Prometheus&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Slack](https://img.shields.io/badge/Slack-4A154B?style=for-the-badge&logo=slack&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Terraform](https://img.shields.io/badge/Terraform-7B42BC?style=for-the-badge&logo=terraform&logoColor=white)

## 🏗️ Architecture

The system is designed with a closed-loop remediation architecture. When a service fails, Prometheus detects the anomaly and triggers Alertmanager, which simultaneously notifies the engineering team via Slack and triggers a custom Python Webhook to execute recovery commands.

```text
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Users    │────▶│     ALB     │────▶│    ASG      │
│             │     │ (Blue/Green)│     │  (EC2+Docker)
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌──────────────────────────┘
                    ▼
            ┌─────────────┐
            │  Prometheus │◀── Scrapes Metrics (e.g., Container State)
            │  + Grafana  │
            └──────┬──────┘
                   │ Triggers Alert
                   ▼
            ┌─────────────┐
            │ Alertmanager│
            └──────┬──────┘
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
┌─────────────────┐ ┌─────────────────┐
│ Slack Channels  │ │ Custom Webhook  │───▶ Executes `docker restart`
│ (#all-critical) │ │   (Python API)  │     (Auto-Healing Action)
└─────────────────┘ └─────────────────┘
# 📁 Core Project StructurePlaintextself-healing-infrastructure/
├── monitoring/         # Observability Stack
│   ├── prometheus/     # Alert rules (alert.rules.yml)
│   ├── alertmanager/   # Routing config (alertmanager.yml)
│   └── docker-compose.yml
├── ansible/            # Auto-Remediation Engine
│   └── webhook.py      # Python HTTP Server listening on port 5000
├── docker/             # Application Environment
│   └── docker-compose.yml (App, Nginx Proxy)
├── terraform/          # Infrastructure as Code (AWS VPC, EC2, ASG)
└── jenkins/            # CI/CD Pipeline Configuration
#🚀 Quick Start & Deployment1. Start the Infrastructure & Monitoring StackDeploy the core application, Prometheus, Grafana, and Alertmanager using Docker Compose:Bashcd ~/Self-Healing-Infrastructure/docker
docker-compose up -d
2. Initialize the Self-Healing Engine (Webhook)Start the custom Python webhook receiver in the background. This service listens for Alertmanager POST requests and executes recovery commands with host-level permissions.Bashcd ~/Self-Healing-Infrastructure/ansible
nohup python3 -u webhook.py > webhook.log 2>&1 &
3. Verify Running ServicesEnsure all components are healthy and interconnected:Bashdocker ps
ps aux | grep webhook.py
#🎬 Testing Self-Healing (Live Demo Scenario)This scenario demonstrates the core capability of the project: autonomous recovery.Step 1: Simulate a Critical FailureManually stop the main application container to simulate a crash:Bashdocker stop self-healing-app
Step 2: Observation (No Human Intervention)Prometheus detects the missing container and triggers the ServiceDown alert.Alertmanager receives the alert and evaluates routing rules.Slack Integration: An instant notification is pushed to the #all-critical-alerts Slack channel.Auto-Remediation: Simultaneously, Alertmanager sends a POST request to our webhook.py.Step 3: Automated Recovery ValidationCheck the container status after ~1 minute. The webhook will have executed docker restart self-healing-app, restoring the service automatically:Bashdocker ps
# Expected Output: self-healing-app ... Up X seconds (health: starting)
Check the Webhook logs to see the remediation trace:Bashtail -f ~/Self-Healing-Infrastructure/ansible/webhook.log
# 🚨 Alert Received from Alertmanager! Triggering Self-Healing...
# ✅ Container 'self-healing-app' restarted successfully.
# 📊 Alert Routing & Remediation MatrixAlert RuleSeveritySlack ChannelAuto-Remediation ActionServiceDowncritical#all-critical-alertswebhook.py ➔ Container RestartHighErrorRatecritical#all-critical-alertswebhook.py ➔ Service RestartHighDiskUsagewarning#warnningManual Review / Disk CleanupHighMemorywarning#warnningManual Review / Process Kill🔗 Port Mapping ReferenceServiceEndpointNginx Proxy (App)http://<EC2-IP>:80Grafanahttp://<EC2-IP>:3001Prometheushttp://<EC2-IP>:9090Alertmanagerhttp://<EC2-IP>:9093Webhook Receiverhttp://localhost:5000 (Internal)Jenkinshttp://<EC2-IP>:8080Developed with a focus on high availability, rapid incident response, and zero-downtime infrastructure.EOF

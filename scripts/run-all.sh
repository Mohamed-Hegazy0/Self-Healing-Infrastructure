#!/bin/bash
set -e

echo "🚀 Starting Self-Healing Infrastructure..."

# Create network if not exists
docker network create monitoring 2>/dev/null || true

# Run App
echo "📱 Starting Application..."
cd docker
docker-compose up -d
cd ..

# Run Monitoring
echo "📊 Starting Monitoring Stack..."
cd monitoring
if [ -z "$1" ]; then
    echo "Warning: No Slack webhook provided. Using empty value."
    export SLACK_WEBHOOK_URL=""
else
    export SLACK_WEBHOOK_URL="$1"
fi
# السطر ده رجعناه شغال عشان المراقبة تقوم
SLACK_WEBHOOK_URL="$SLACK_WEBHOOK_URL" docker-compose up -d
cd ..

# Run Ansible
echo "🔧 Starting Ansible Controller & Webhook Receiver..."
cd ansible
# السطر ده اللي اتلغى
# SLACK_WEBHOOK_URL="$SLACK_WEBHOOK_URL" docker-compose up -d
# السطر ده اللي ضفناه عشان نشغل البايثون
nohup python3 webhook.py > webhook.log 2>&1 &
cd ..

# Run Jenkins
echo "🔨 Starting Jenkins..."
cd jenkins
docker-compose up -d
cd ..

echo ""
echo "✅ All services are running!"
echo ""
echo "🌐 Access URLs:"
echo "   Application:    http://localhost:3000"
echo "   Health Check:   http://localhost:3000/health"
echo "   Metrics:        http://localhost:3000/metrics"
echo "   Prometheus:     http://localhost:9090"
echo "   Grafana:        http://localhost:3001 (admin/admin123)"
echo "   Alertmanager:   http://localhost:9093"
echo "   Jenkins:        http://localhost:8080"
echo ""
echo "📋 Useful commands:"
echo "   docker ps                    - List running containers"
echo "   docker-compose logs -f       - View logs"
echo "   docker-compose down          - Stop services"

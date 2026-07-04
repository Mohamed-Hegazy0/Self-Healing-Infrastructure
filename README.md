# 🛡️ VSCAN: Self-Healing DevSecOps Infrastructure

![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Terraform](https://img.shields.io/badge/terraform-%235835CC.svg?style=for-the-badge&logo=terraform&logoColor=white)
![Kubernetes](https://img.shields.io/badge/kubernetes-%23326ce5.svg?style=for-the-badge&logo=kubernetes&logoColor=white)
![Ansible](https://img.shields.io/badge/ansible-%231A1918.svg?style=for-the-badge&logo=ansible&logoColor=white)
![Jenkins](https://img.shields.io/badge/jenkins-%232C5263.svg?style=for-the-badge&logo=jenkins&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

Welcome to the core repository for (V-OPS), an advanced DevSecOps automation and security scanning platform. This repository houses the frontend, backend, and the complete Infrastructure as Code (IaC) / Configuration Management setup required to run a fully automated, self-healing cloud environment.

---

## 🌟 Project Highlights

* **Infrastructure as Code (IaC):** Automated provisioning of AWS VPCs, Security Groups, and an Amazon EKS Cluster using **Terraform**.
* **Self-Healing Mechanisms:** Event-driven **Ansible** playbooks that automatically detect and remediate issues (e.g., disk space exhaustion, container crashes, and service failures) without human intervention.
* **CI/CD Automation:** A dedicated Management Node running **Jenkins** to continuously build, test, and deploy Dockerized applications to the EKS cluster.
* **Centralized Management:** A highly secure `t3.micro` bastion/management node acting as the command center for Kubernetes administration (`kubectl`) and automation.

---

## 📂 Repository Structure

The project is structured to keep application code and infrastructure automation cleanly separated:

```text
Self-Healing-Infrastructure/
├── frontend/             # React/Vite web application source code
├── backend/              # Node.js backend & API services
└── ansible/              # Configuration Management & Self-Healing automation
    ├── ansible.cfg       # Ansible configuration settings
    ├── inventories/      # Environment-specific variables and host IPs (EKS nodes)
    ├── playbooks/        # Execution playbooks (health_check.yml, self_healing.yml)
    └── roles/            # Modular Ansible roles
        ├── notifications # Slack/Discord alerting system
        ├── self_healing  # Recovery tasks (Disk, Container, Service)
        └── validation    # Pre/Post execution validation checks

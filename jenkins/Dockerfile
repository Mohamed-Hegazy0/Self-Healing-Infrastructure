FROM jenkins/jenkins:lts-jdk17

USER root

RUN apt-get update && apt-get install -y     apt-transport-https ca-certificates curl gnupg     lsb-release python3-pip unzip     && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://get.docker.com | sh

RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" &&     unzip awscliv2.zip && ./aws/install && rm -rf awscliv2.zip aws

RUN curl -fsSL https://apt.releases.hashicorp.com/gpg | gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" > /etc/apt/sources.list.d/hashicorp.list && \
    apt-get update && apt-get install -y terraform

RUN pip3 install ansible boto3 botocore --break-system-packages

COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt

RUN usermod -aG docker jenkins

USER jenkins

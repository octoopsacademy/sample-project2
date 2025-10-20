# Base Jenkins image
FROM jenkins/jenkins:lts

# Switch to root to install tools
USER root

# Install dependencies
RUN apt-get update && \
    apt-get install -y \
        curl \
        wget \
        unzip \
        git \
        awscli \
        apt-transport-https \
        ca-certificates \
        gnupg \
        lsb-release && \
    rm -rf /var/lib/apt/lists/*

# Install Docker CLI inside Jenkins container
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" \     
    | tee /etc/apt/sources.list.d/docker.list > /dev/null && \
    apt-get update && \
    apt-get install -y docker-ce-cli

# Install kubectl (latest stable)
RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" && \
    install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl && \
    rm kubectl

# Install eksctl
RUN ARCH=amd64 && \
    PLATFORM=$(uname -s)_$ARCH && \
    curl -sLO "https://github.com/eksctl-io/eksctl/releases/latest/download/eksctl_${PLATFORM}.tar.gz" && \
    tar -xzf eksctl_${PLATFORM}.tar.gz -C /tmp && \
    mv /tmp/eksctl /usr/local/bin/ && \
    rm eksctl_${PLATFORM}.tar.gz

# Install Helm (optional, but useful for K8s deployments)
RUN curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Return to Jenkins user
USER jenkins

pipeline {
  agent any
  environment {
    AWS_REGION = 'ap-south-1'
    BACKEND_ECR = "657399551937.dkr.ecr.ap-south-1.amazonaws.com/octoops-backend"
    FRONTEND_ECR = "657399551937.dkr.ecr.ap-south-1.amazonaws.com/octoops-frontend"
  }
  stages {
    stage('Checkout') {
            steps {
                git(
                    branch: 'main',
                    credentialsId: 'github-creds',
                    url: 'https://github.com/octoopsacademy/sample-project2.git'
                )
            }
        }
stage('Configure AWS & Kubeconfig') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'aws-creds-userpass',
                                                 usernameVariable: 'AWS_ACCESS_KEY_ID',
                                                 passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                    sh '''
                        # Configure AWS CLI
                        aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID
                        aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY
                        aws configure set default.region $AWS_REGION
                    '''
                }

                // Copy Kubeconfig file from Jenkins secret
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG_FILE')]) {
                    sh '''
                        mkdir -p ~/.kube
                        cp $KUBECONFIG_FILE ~/.kube/config
                    '''
                }
            }
        }    

    stage('Login to ECR') {
      steps {
        script {
          sh 'aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $BACKEND_ECR'
          sh 'aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $FRONTEND_ECR'
        }
      }
    }

    stage('Build & Push Backend') {
      steps {
        dir('backend') {
          script {
            sh 'docker build -t octoops-backend:latest .'
            sh "docker tag octoops-backend:latest $BACKEND_ECR:latest"
            sh "docker push $BACKEND_ECR:latest"
          }
        }
      }
    }

    stage('Build & Push Frontend') {
      steps {
        dir('frontend') {
          script {
            sh 'docker build -t octoops-frontend:latest .'
            sh "docker tag octoops-frontend:latest $FRONTEND_ECR:latest"
            sh "docker push $FRONTEND_ECR:latest"
          }
        }
      }
    }

        stage('Deploy to EKS') {
            steps {
                sh '''
                    sed -i "s|image:.*|image: $BACKEND_ECR:latest|" k8s/backend.yaml
                    sed -i "s|image:.*|image: $FRONTEND_ECR:latest|" k8s/frontend.yaml

                    kubectl apply -f k8s/deployment.yaml
                    kubectl apply -f k8s/service.yaml

                    kubectl rollout restart deployment octoops-frontend
                    kubectl rollout restart deployment octoops-backend
                '''
            }
        }
  }

  post {
    success {
      echo 'Deployment Successful!'
    }
    failure {
      echo 'Deployment Failed!'
    }
  }
}


pipeline {
  agent any
  environment {
    AWS_REGION = 'ap-south-1' // change if needed
    BACKEND_ECR = "<aws_account_id>.dkr.ecr.${AWS_REGION}.amazonaws.com/octoops-backend"
    FRONTEND_ECR = "<aws_account_id>.dkr.ecr.${AWS_REGION}.amazonaws.com/octoops-frontend"
  }
  stages {
    stage('Checkout') {
      steps {
        checkout scm
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
        script {
          // Replace images in YAML with latest ECR images
          sh "kubectl set image deployment/octoops-backend backend=$BACKEND_ECR:latest --record"
          sh "kubectl set image deployment/octoops-frontend frontend=$FRONTEND_ECR:latest --record"
        }
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


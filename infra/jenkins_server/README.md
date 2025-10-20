This is Dockerfile which builds jenkins image with eksctl, kubectl, awscli, etc., preinstalled.


How to Use This:

1. Attach IAM Role for EC2 Where you wish to run Jenkins container with these policies:
•	AmazonEC2ContainerRegistryFullAccess
•	AmazonEKSClusterPolicy
•	AmazonEKSWorkerNodePolicy
•	AmazonEKS_CNI_Policy
•	AmazonS3ReadOnlyAccess

2. Copy or Clone the this Dockerfile to EC2
3. Build the image

docker build -t jenkins-eks:latest .

4. Run Jenkins

docker run -d --name jenkins \
  -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --user root \
  jenkins-eks:latest


5. Access Jenkins at:
http://<EC2-PUBLIC-IP>:8080


Jenkins writes the initial admin password to:
/var/jenkins_home/secrets/initialAdminPassword.

To get the initial admin password run below command:
docker exec -it jenkins cat /var/jenkins_home/secrets/initialAdminPassword

Paste the admin password

6. Install Suggested Plugins
➡ Install Required Plugins
Ex: Go to:
    Manage Jenkins → Manage Plugins → Available tab → Install:
   •	Pipeline
   •	Docker Pipeline
   •	Amazon ECR
   •	Kubernetes CLI
   •	Credentials Binding
________________________________________
7. Add Credentials in Jenkins
Navigate to: Jenkins → Manage Jenkins → Credentials → Global → Add Credentials
ID	                 Type	                      Purpose
aws-creds-userpass	 Username with password	    For ECR + kubectl auth
github-creds         Username/Password	        To connect to git repo
kubeconfig	         Secret file	              KubeConfig file of EKS cluster


8. Create a Jenkins Pipeline Job
  1.	Click New Item → Pipeline → Name: ex:  octoopsacademy-pipeline
  2.	General: Choose GitHub Project and add repo url.
  3.	In Triggers select : GitHub hook trigger for GITScm polling
  4.	In Pipeline Section → Choose:
        Definition: Pipeline script from SCM
        SCM: Git
        Repo URL: https://github.com/<your-repo>.git
        Credentials: github-creds
        Script Path: Jenkinsfile
        Branch: */main or */master depending on your repo branch
6.	Script Path: Jenkinsfile
7.	Save

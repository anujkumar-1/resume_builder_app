pipeline {
    agent any
    stages {
        stage('Build Image') {
            steps {
                // Build using your specific image name
                sh 'docker build -t my-mvc-app .'
            }
        }
        stage('Deploy Container') {
            steps {
                // Stop and remove the specific container name
                sh 'docker stop running-app || true'
                sh 'docker rm running-app || true'
                // Run on port 3000 as discussed
                sh 'docker run -d --name running-app -p 3000:3000 my-mvc-app'
            }
        }
    }
}

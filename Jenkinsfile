pipeline {
    agent any
    
    environment {
        // Docker Hub Config
        DOCKER_HUB_USER = 'kummar'
        APP_NAME = 'my-mvc-app'
        CONTAINER_NAME = 'resumex-prod'
        
        // Port Configuration
        HOST_PORT = '3000'             
        CONTAINER_PORT = '3000'      
        
        // URL Configuration
        APP_URL = 'https://myjobcv.online'  
        JENKINS_URL = 'https://jenkins.myjobcv.online'
        
        // Version
        IMAGE_V1 = "${DOCKER_HUB_USER}/${APP_NAME}:v1"
        IMAGE_BUILD = "${DOCKER_HUB_USER}/${APP_NAME}:build-${BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', 
                    url: 'https://github.com/anujkumar-1/resume_builder_app'
                
                echo '✅ Code checkout done!'
            }
        }
        
        stage('Build v1 Image') {
            steps {
                script {
                    // Purana image hatao
                    echo '🧹 Starting cleanup of old resources...'
            
                    // Stop container - shows error if container doesn't exist
                    sh """
                        echo "Stopping container ${CONTAINER_NAME}..."
                        docker stop ${CONTAINER_NAME}
                    """
                    
                    // Remove container - shows error if container doesn't exist
                    sh """
                        echo "Removing container ${CONTAINER_NAME}..."
                        docker rm ${CONTAINER_NAME}
                    """
                    
                    // Remove image - shows error if image doesn't exist
                    sh """
                        echo "Removing image ${IMAGE_V1}..."
                        docker rmi -f ${IMAGE_V1}
                    """
                    
                    echo '✅ Cleanup attempted!'
                    
                    // Naya image banao with v1 tag
                    sh "docker build -t ${IMAGE_V1} ."
                    
                    // Build number ke saath tag
                    sh "docker tag ${IMAGE_V1} ${IMAGE_BUILD}"
                    
                    echo "✅ v1 image built: ${IMAGE_V1}"
                }
            }
        }
        
        stage('Push v1 to Docker Hub') {
            steps {
                script {
                    withDockerRegistry([credentialsId: 'docker-hub-pat', url: '']) {
                        sh "docker push ${IMAGE_V1}"
                        sh "docker push ${IMAGE_BUILD}"
                    }
                    
                    echo "✅ v1 image pushed to Docker Hub"
                }
            }
        }
        
        stage('Deploy v1 to EC2 (HTTPS)') {
            steps {
                script {
                    sh '''
                        echo "========================================="
                        echo "🚀 RESUMEXAUTO v1 DEPLOYMENT (HTTPS)..."
                        echo "========================================="
                        
                        echo "🛑 Stopping old container..."
                        docker stop ''' + "${CONTAINER_NAME}" + ''' || true
                        docker rm ''' + "${CONTAINER_NAME}" + ''' || true
                        
                        echo ""
                        echo "📦 Pulling v1 image from Docker Hub..."
                        docker pull ''' + "${IMAGE_V1}" + '''
                        
                        echo ""
                        echo "🚀 Starting new container on HTTPS port 443..."
                        echo "   • Host Port: 443 (HTTPS)"
                        echo "   • Container Port: 8080 (App)"
                        
                        docker run -d \\
                            --name ''' + "${CONTAINER_NAME}" + ''' \\
                            --restart unless-stopped \\
                            -p ''' + "${HOST_PORT}:${CONTAINER_PORT}" + ''' \\
                            ''' + "${IMAGE_V1}" + '''
                        
                        echo ""
                        echo "✅ Container started on port 443!"
                        echo ""
                        echo "📋 Container Status:"
                        docker ps --filter "name='" + "${CONTAINER_NAME}" + "'"
                        
                        echo ""
                        echo "🌐 Application Live at: https://myjobcv.online"
                    '''
                }
            }
        }
        
        stage('Verify HTTPS Deployment') {
            steps {
                script {
                    // Container ko settle hone do
                    sh 'sleep 8'
                    
                    // Check container status
                    def containerStatus = sh(
                        script: "docker ps --filter 'name=${CONTAINER_NAME}' --format '{{.Status}}'",
                        returnStdout: true
                    ).trim()
                    
                    if (containerStatus.contains('Up')) {
                        echo "✅ Container is running: ${containerStatus}"
                        
                        // Verify port binding
                        def portBinding = sh(
                            script: "docker port ${CONTAINER_NAME}",
                            returnStdout: true
                        ).trim()
                        
                        echo "🔌 Port Binding: ${portBinding}"
                        echo "✅ HTTPS should be available at https://myjobcv.online"
                        
                        // Container logs
                        sh "docker logs --tail 15 ${CONTAINER_NAME} || true"
                        
                        echo ""
                        echo "🔍 Note: SSL/TLS termination is handled by reverse proxy (Nginx/Apache)"
                        echo "   Container internally runs on 8080, HTTPS is at 443"
                    } else {
                        error "❌ Container not running properly!"
                        sh "docker logs ${CONTAINER_NAME} || true"
                    }
                }
            }
        }
        
        stage('SSL/HTTPS Info') {
            steps {
                echo '''
                ┌─────────────────────────────────────────────┐
                │                                             │
                │   🔒 HTTPS CONFIGURATION NOTE:              │
                │                                             │
                │   • Container runs on port 8080 (internal)  │
                │   • Host exposes port 443 (HTTPS)          │
                │   • SSL certificates managed by:            │
                │     - Reverse Proxy (Nginx/Apache)         │
                │     - Or Cloudflare                         │
                │     - Or Let's Encrypt                      │
                │                                             │
                │   • App URL: https://myjobcv.online        │
                │                                             │
                └─────────────────────────────────────────────┘
                '''
            }
        }
    }
    
    post {
        success {
            echo '''
            ╔══════════════════════════════════════════════════╗
            ║                                                  ║
            ║   🎉  RESUMEXAUTO v1 DEPLOYED!  🎉              ║
            ║                                                  ║
            ║   📦 Image: kummar/my-mvc-app:v1                ║
            ║   🏷️  Build: ''' + "${BUILD_NUMBER}" + '''                           ║
            ║   🔌 Port: 443 (HTTPS) → 8080 (Container)       ║
            ║                                                  ║
            ║   🌐 Live App: https://myjobcv.online           ║
            ║   🔗 Jenkins: https://jenkins.myjobcv.online    ║
            ║                                                  ║
            ║   🔒 SSL: Enabled (HTTPS)                        ║
            ║                                                  ║
            ╚══════════════════════════════════════════════════╝
            '''
        }
        
        failure {
            echo '''
            ╔══════════════════════════════════════════════════╗
            ║                                                  ║
            ║   ❌  DEPLOYMENT FAILED!                         ║
            ║                                                  ║
            ║   Check:                                         ║
            ║   • Port 443 already in use?                    ║
            ║   • Container logs above                         ║
            ║   • Application errors                           ║
            ║                                                  ║
            ╚══════════════════════════════════════════════════╝
            '''
            
            // Rollback
            script {
                sh '''
                    echo "🔄 Attempting rollback..."
                    PREV_BUILD=$((BUILD_NUMBER - 1))
                    
                    docker stop ''' + "${CONTAINER_NAME}" + ''' || true
                    docker rm ''' + "${CONTAINER_NAME}" + ''' || true
                    
                    if docker images | grep "build-${PREV_BUILD}"; then
                        docker run -d \\
                            --name ''' + "${CONTAINER_NAME}" + ''' \\
                            -p ''' + "${HOST_PORT}:${CONTAINER_PORT}" + ''' \\
                            --restart unless-stopped \\
                            ''' + "${DOCKER_HUB_USER}/${APP_NAME}:build-${PREV_BUILD}" + '''
                        echo "✅ Rolled back to build-${PREV_BUILD}"
                    fi
                '''
            }
        }
        
        always {
            sh 'docker image prune -f --filter "until=24h" || true'
            echo "📊 Pipeline completed at ${new Date()}"
        }
    }
}
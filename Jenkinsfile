pipeline {

  agent any
  tools {nodejs "Node18"}
  environment {
      CERT_DIR = "${WORKSPACE}/docker/nginx/ssl"
  }


  stages {


    stage('Get code') {
      steps {
        // Get the code from a GitHub repository
        git 'https://github.com/grauds/money.tracker.ui.git'
      }
    }


    stage("Verify tooling") {
      steps {
        sh '''
              cd ./apps/money-tracker-ui/jenkins
              docker version
              docker info
              docker compose version
              curl --version
              jq --version
              docker compose ps
            '''
      }
    }

    stage('Prepare Directories') {
        steps {
            sh '''
               # Create directory structure with proper permissions
                mkdir -p "${CERT_DIR}"
                chmod 700 "${CERT_DIR}"
                ls -al "${CERT_DIR}"
            '''
        }
    }

    stage('Deploy Certificates') {
      steps {
          script {
              // Using secret files
              withCredentials([
                  file(credentialsId: 'nginx-ssl-cert', variable: 'SSL_CERT'),
                  file(credentialsId: 'nginx-ssl-key', variable: 'SSL_KEY')
              ]) {
                  sh """
                      # Copy certificates
                      cp "$SSL_CERT" "${CERT_DIR}/certificate.crt"
                      cp "$SSL_KEY" "${CERT_DIR}/private.key"

                      # Set proper permissions
                      chmod 644 "${CERT_DIR}/certificate.crt"
                      chmod 600 "${CERT_DIR}/private.key"

                  """
              }
          }
      }
  }


    stage('Dockerized build for UAT') {
      steps {
        sh '''
           docker build . -t money.tracker.ui.uat -f Dockerfile --build-arg="ENVIRONMENT=uat"
        '''
      }
    }

    stage('Dockerized build for DEMO') {
      steps {
        sh '''
           docker build . -t money.tracker.ui.demo -f Dockerfile --build-arg="ENVIRONMENT=demo"
        '''
      }
    }

    stage('Publish tests') {
      steps {
        sh '''
           export DOCKER_BUILDKIT=1
           docker build --output "type=local,dest=${WORKSPACE}/coverage" --target test-out .
           ls -l ./coverage
        '''
        recordCoverage(
          tools: [[parser: 'COBERTURA', pattern: 'coverage/**/cobertura-coverage.xml']],
          id: 'cobertura',
          name: 'Cobertura Coverage',
          sourceCodeRetention: 'EVERY_BUILD',
          ignoreParsingErrors: true,
          qualityGates: [
            [threshold: 60.0, metric: 'LINE', baseline: 'PROJECT', unstable: true],
            [threshold: 60.0, metric: 'BRANCH', baseline: 'PROJECT', unstable: true]
          ]
        )
      }
    }

    stage ('Dependency-Check') {
        steps {
            sh '''
              npm -version
              npm install
            '''
            catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
              dependencyCheck additionalArguments: '''
                  -o "./"
                  -s "./"
                  -f "ALL"
                  -P "depcheck.properties"
                  --prettyPrint''', nvdCredentialsId: 'NVD_API_Key', odcInstallation: 'Dependency Checker'

              dependencyCheckPublisher pattern: 'dependency-check-report.xml'
            }
        }
    }

    stage("Build and start docker compose services") {
      steps {
        sh '''
           cd ./apps/money-tracker-ui/jenkins
           docker compose stop
           docker stop clematis-money-tracker-ui || true && docker rm clematis-money-tracker-ui || true
           docker stop clematis-money-tracker-ui-demo || true && docker rm clematis-money-tracker-ui-demo || true
           docker compose build
           docker compose up -d
        '''
      }
    }

    stage('Prepare SSL Volume') {
        steps {
            script {
                sh '''
                    # First create or clear the volume
                    docker run --rm -v ssl_certs:/ssl alpine sh -c "rm -rf /ssl/* && mkdir -p /ssl"

                    # Then copy the certificates from the workspace
                    docker cp "${CERT_DIR}/." $(docker create --rm -v ssl_certs:/ssl alpine sh):/ssl/

                    # Finally set the permissions
                    docker run --rm -v ssl_certs:/ssl alpine sh -c "
                        chmod 644 /ssl/certificate.crt && \
                        chmod 600 /ssl/private.key
                    "

                '''
            }
        }
    }

  }
  post {
      always {
          // Clean up sensitive files after use
          sh '''
              if [ -d "${CERT_DIR}" ]; then rm -rf "${CERT_DIR}"; fi
          '''
      }
  }

}

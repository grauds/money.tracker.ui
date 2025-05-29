pipeline {

  agent any
  tools {nodejs "Node18"}
  environment {
      // Store in workspace
      CERT_PATH = "${WORKSPACE}/docker/nginx/ssl/certificate.crt"
      KEY_PATH = "${WORKSPACE}/docker/nginx/ssl/private.key"
  }


  stages {

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

    stage('Get code') {
      steps {
        // Get the code from a GitHub repository
        git 'https://github.com/grauds/money.tracker.ui.git'
      }
    }

    stage('Prepare Directories') {
        steps {
            sh '''
                mkdir -p ${WORKSPACE}/docker/nginx/ssl
                chmod 700 ${WORKSPACE}/docker/nginx/ssl
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
                      cp "\$SSL_CERT" "\${WORKSPACE}/docker/nginx/ssl/"
                      cp "\$SSL_KEY" "\${WORKSPACE}/docker/nginx/ssl/"
                      chmod 644 "\$CERT_PATH"
                      chmod 600 "\$KEY_PATH"
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
  }

}

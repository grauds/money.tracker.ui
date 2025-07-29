// Jenkinsfile - builds locally, deploys remotely to Yoda

pipeline {
  agent any

  tools { nodejs "Node18" }

  environment {
    CERT_DIR = "${WORKSPACE}/docker/nginx/ssl"
    DOCKER_IMAGES_DIR = "${WORKSPACE}/docker/images"
    REMOTE_DEPLOY_DIR = "/home/clematis"
    COMPOSE_FILE = "apps/money-tracker-ui/jenkins/docker-compose.yml"
  }

  stages {
    stage('Get code') {
      steps {
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
          mkdir -p "${CERT_DIR}"
          chmod 700 "${CERT_DIR}"
          ls -al "${CERT_DIR}"
        '''
      }
    }

    stage('Deploy Certificates') {
      steps {
        withCredentials([
          file(credentialsId: 'nginx-ssl-cert', variable: 'SSL_CERT'),
          file(credentialsId: 'nginx-ssl-key', variable: 'SSL_KEY')
        ]) {
          sh '''
            cp "$SSL_CERT" "${CERT_DIR}/certificate.crt"
            cp "$SSL_KEY" "${CERT_DIR}/private.key"
            chmod 644 "${CERT_DIR}/certificate.crt"
            chmod 600 "${CERT_DIR}/private.key"
          '''
        }
      }
    }

    stage('Dockerized build for UAT') {
      steps {
        sh 'docker build . -t money.tracker.ui.uat -f Dockerfile --build-arg="ENVIRONMENT=uat"'
      }
    }

    stage('Dockerized build for DEMO') {
      steps {
        sh 'docker build . -t money.tracker.ui.demo -f Dockerfile --build-arg="ENVIRONMENT=demo"'
      }
    }

    stage('Export Docker Images') {
      steps {
        sh '''
          mkdir -p "${DOCKER_IMAGES_DIR}"
          docker save -o ${DOCKER_IMAGES_DIR}/ui-uat.tar money.tracker.ui.uat
          docker save -o ${DOCKER_IMAGES_DIR}/ui-demo.tar money.tracker.ui.demo
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
            --prettyPrint''',
            nvdCredentialsId: 'NVD_API_Key',
            odcInstallation: 'Dependency Checker'

          dependencyCheckPublisher pattern: 'dependency-check-report.xml'
        }
      }
    }

    stage('Transfer and Deploy to Yoda') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'yoda-anton', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
          script {
            def remote = [:]
            remote.name = "Yoda"
            remote.host = "192.168.1.118"
            remote.user = USERNAME
            remote.password = PASSWORD
            remote.allowAnyHosts = true

            // Transfer certs
            sshPut remote: remote, from: "${CERT_DIR}/certificate.crt", into: "${REMOTE_DEPLOY_DIR}/certs/certificate.crt"
            sshPut remote: remote, from: "${CERT_DIR}/private.key", into: "${REMOTE_DEPLOY_DIR}/certs/private.key"

            // Transfer compose file
            sshPut remote: remote, from: "${COMPOSE_FILE}", into: "${REMOTE_DEPLOY_DIR}/docker-compose.yml"

            // Transfer docker images
            sshPut remote: remote, from: "${DOCKER_IMAGES_DIR}/ui-uat.tar", into: "${REMOTE_DEPLOY_DIR}/ui-uat.tar"
            sshPut remote: remote, from: "${DOCKER_IMAGES_DIR}/ui-demo.tar", into: "${REMOTE_DEPLOY_DIR}/ui-demo.tar"

            // Remote deployment script
            sshCommand remote: remote, command: """
              mkdir -p ${REMOTE_DEPLOY_DIR}/certs
              chmod 700 ${REMOTE_DEPLOY_DIR}/certs
              chmod 644 ${REMOTE_DEPLOY_DIR}/certs/certificate.crt
              chmod 600 ${REMOTE_DEPLOY_DIR}/certs/private.key

              docker load -i ${REMOTE_DEPLOY_DIR}/ui-uat.tar
              docker load -i ${REMOTE_DEPLOY_DIR}/ui-demo.tar

              docker compose -f ${REMOTE_DEPLOY_DIR}/docker-compose.yml down || true
              docker compose -f ${REMOTE_DEPLOY_DIR}/docker-compose.yml up -d
            """
          }
        }
      }
    }
  }

  post {
    always {
      sh '''
        if [ -d "${CERT_DIR}" ]; then rm -rf "${CERT_DIR}"; fi
        if [ -d "${DOCKER_IMAGES_DIR}" ]; then rm -rf "${DOCKER_IMAGES_DIR}"; fi
      '''
    }
  }
}

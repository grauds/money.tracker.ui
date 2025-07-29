pipeline {

  agent any
  tools { nodejs "Node18" }
  environment {
    CERT_DIR = "${WORKSPACE}/docker/nginx/ssl"
    REMOTE_HOST = "192.168.1.118"
    REMOTE_USER = "clematis"
    SSH_DEST = "${REMOTE_USER}@${REMOTE_HOST}"
    REMOTE_APP_DIR = "/home/clematis/money.tracker.ui"
  }

  stages {

    stage('Checkout') {
      steps {
        git 'https://github.com/grauds/money.tracker.ui.git'
      }
    }

    stage('Verify tooling') {
      steps {
        dir('apps/money-tracker-ui/jenkins') {
          sh '''
            docker version
            docker info
            docker compose version
            curl --version
            jq --version
            docker compose ps || true
          '''
        }
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

    stage('Build Docker Images') {
      steps {
        dir('.') {
          sh '''
            docker build -t money.tracker.ui.uat -f Dockerfile --build-arg="ENVIRONMENT=uat" .
            docker build -t money.tracker.ui.demo -f Dockerfile --build-arg="ENVIRONMENT=demo" .
          '''
        }
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

    stage('Export Docker Images') {
      steps {
        sh '''
          mkdir -p docker_export
          docker save money.tracker.ui.uat > docker_export/uat.tar
          docker save money.tracker.ui.demo > docker_export/demo.tar
        '''
      }
    }

    stage('Transfer Files to Yoda') {
      steps {
        sshagent (credentials: ['yoda-anton-key']) {
          sh '''
            mkdir -p ~/.ssh

            scp -o StrictHostKeyChecking=no -r ${CERT_DIR} ${SSH_DEST}:${REMOTE_APP_DIR}/certs
            scp -o StrictHostKeyChecking=no docker_export/*.tar ${SSH_DEST}:${REMOTE_APP_DIR}/
            scp -o StrictHostKeyChecking=no apps/money-tracker-ui/jenkins/docker-compose.yml ${SSH_DEST}:${REMOTE_APP_DIR}/
          '''
        }
      }
    }


    stage('Deploy on Yoda') {
      steps {
        sshagent (credentials: ['yoda-anton-key']) {
          sh '''
            ssh ${SSH_DEST} '
              docker load < ${REMOTE_APP_DIR}/uat.tar && \
              docker load < ${REMOTE_APP_DIR}/demo.tar && \
              docker compose -f ${REMOTE_APP_DIR}/docker-compose.yml down && \
              docker compose -f ${REMOTE_APP_DIR}/docker-compose.yml up -d
            '
          '''
        }
      }
    }

  }

  post {
    always {
      sh '''
        rm -rf docker_export
        rm -rf "${CERT_DIR}"
      '''
    }
  }
}

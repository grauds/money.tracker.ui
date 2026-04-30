pipeline {

  agent any
  tools { nodejs "Node22" }
  environment {
    CERT_DIR = "${WORKSPACE}/docker/nginx/ssl"
    REMOTE_HOST = "192.168.1.118"
    REMOTE_USER = "anton"
    SSH_DEST = "${REMOTE_USER}@${REMOTE_HOST}"
    REMOTE_APP_DIR = "/home/anton/deploy/mt/ui"
  }

  stages {
    stage('Verify tooling') {
      steps {
        dir('apps/money-tracker-ui/jenkins') {
          sh '''
            docker version
            docker info
            docker compose version
            curl --version
            jq --version
            docker compose ps
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
            cp "$SSL_CERT" "${CERT_DIR}/clematis-mt-ssl-cert.crt"
            cp "$SSL_KEY" "${CERT_DIR}/clematis-mt-ssl-key.key"
            chmod 644 "${CERT_DIR}/clematis-mt-ssl-cert.crt"
            chmod 600 "${CERT_DIR}/clematis-mt-ssl-key.key"
          '''
        }
      }
    }

    stage('Build Docker Images') {
      steps {
        sh '''
          docker build \
            --build-arg HTTP_PROXY=http://192.168.1.174:7890 \
            --build-arg HTTPS_PROXY=http://192.168.1.174:7890 \
            . -t money.tracker.ui.uat -f Dockerfile --build-arg="ENVIRONMENT=uat"
          docker build \
            --build-arg HTTP_PROXY=http://192.168.1.174:7890 \
            --build-arg HTTPS_PROXY=http://192.168.1.174:7890 \
            . -t money.tracker.ui.demo -f Dockerfile --build-arg="ENVIRONMENT=demo"
        '''
      }
    }

    stage('Publish tests') {
      steps {
        sh '''
           export DOCKER_BUILDKIT=1
           docker build \
              --build-arg HTTP_PROXY=http://192.168.1.174:7890 \
              --build-arg HTTPS_PROXY=http://192.168.1.174:7890 \
              --output "type=local,dest=${WORKSPACE}/coverage" --target test-out .
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

  stage('Dependency-Check') {
      steps {
          catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
            dependencyCheck additionalArguments: '''
                  -s "./"                                # Source directory
                  -o "./dependency-check-reports"        # Output directory
                  -f "ALL"                               # Generate all report formats
                  --prettyPrint                           # Make JSON report human-readable
                  -P "depcheck.properties"               # Optional config/proxy file
                  --suppression "dependency-check-suppressions.xml" # Suppress known false positives
                  --disableOssIndex
                  --exclude "./.nx/cache"                # Exclude Nx cache
                  --exclude "./coverage"                 # Exclude test coverage output
                  --exclude "./node_modules/@algolia/abtesting/dist" # Exclude noisy library scans
              ''', nvdCredentialsId: 'NVD_API_Key', odcInstallation: 'Dependency Checker'

            dependencyCheckPublisher pattern: 'dependency-check-reports/dependency-check-report.xml'
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
            [ -d ~/.ssh ] || mkdir ~/.ssh && chmod 0700 ~/.ssh
            scp -o StrictHostKeyChecking=no -r "${CERT_DIR}" "${SSH_DEST}:${REMOTE_APP_DIR}/certs"
            scp -o StrictHostKeyChecking=no docker_export/*.tar "${SSH_DEST}:${REMOTE_APP_DIR}/"
            scp -o StrictHostKeyChecking=no "apps/money-tracker-ui/jenkins/docker-compose.yml" "${SSH_DEST}:${REMOTE_APP_DIR}/"
            scp -o StrictHostKeyChecking=no "apps/money-tracker-ui/jenkins/nginx-default.conf" "${SSH_DEST}:${REMOTE_APP_DIR}/"
            scp -o StrictHostKeyChecking=no "apps/money-tracker-ui/jenkins/nginx-demo.conf" "${SSH_DEST}:${REMOTE_APP_DIR}/"
           '''
        }
      }
    }

    stage('Prepare SSL Volume') {
      steps {
        sshagent (credentials: ['yoda-anton-key']) {
          sh '''
            # 1. Ensure the volume exists (does nothing if it already exists)
            ssh ${SSH_DEST} "docker volume create jenkins_ssl_certs"

            # 2. Stream and overwrite files (tar overwrites by default)
            tar -C "${CERT_DIR}" -cf - . | ssh ${SSH_DEST} "docker run --rm -i -v jenkins_ssl_certs:/ssl alpine tar -C /ssl -xf -"

            # 3. Update permissions on the new/updated files
            ssh ${SSH_DEST} "docker run --rm -v jenkins_ssl_certs:/ssl alpine sh -c 'chmod 644 /ssl/clematis-mt-ssl-cert.crt && chmod 600 /ssl/clematis-mt-ssl-key.key'"
          '''
        }
      }
    }

    stage('Deploy on Yoda') {
      steps {
        sshagent (credentials: ['yoda-anton-key']) {
          sh '''
            ssh ${SSH_DEST} "
              docker rm -f clematis-money-tracker-ui clematis-money-tracker-ui-demo 2>/dev/null || true && \
              docker load < ${REMOTE_APP_DIR}/uat.tar && \
              docker load < ${REMOTE_APP_DIR}/demo.tar && \
              docker compose -f ${REMOTE_APP_DIR}/docker-compose.yml up -d
            "
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

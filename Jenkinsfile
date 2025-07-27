pipeline {
  agent any
  tools { nodejs "Node18" }

  environment {
    CERT_DIR = "docker/nginx/ssl"
    REMOTE_CERT_DIR = "/home/jenkins/workspace/certs"
  }

  stages {
    stage('Get code') {
      steps {
        git 'https://github.com/grauds/money.tracker.ui.git'
      }
    }

    stage('Verify tooling') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'yoda-anton', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
          script {
            def remote = [
              name: 'Yoda',
              host: '192.168.1.118',
              user: USERNAME,
              password: PASSWORD,
              allowAnyHosts: true
            ]
            sshCommand remote: remote, command: '''
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
    }

    stage('Deploy Certificates') {
      steps {
        withCredentials([
          usernamePassword(credentialsId: 'yoda-anton', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD'),
          file(credentialsId: 'nginx-ssl-cert', variable: 'SSL_CERT'),
          file(credentialsId: 'nginx-ssl-key', variable: 'SSL_KEY')
        ]) {
          script {
            def remote = [
              name: 'Yoda',
              host: '192.168.1.118',
              user: USERNAME,
              password: PASSWORD,
              allowAnyHosts: true
            ]

            sh "mkdir -p ${CERT_DIR}"
            sh "cp $SSL_CERT ${CERT_DIR}/certificate.crt"
            sh "cp $SSL_KEY ${CERT_DIR}/private.key"

            sshCommand remote: remote, command: "mkdir -p ${REMOTE_CERT_DIR}"
            sshPut remote: remote, from: "${CERT_DIR}/certificate.crt", into: "${REMOTE_CERT_DIR}/certificate.crt"
            sshPut remote: remote, from: "${CERT_DIR}/private.key", into: "${REMOTE_CERT_DIR}/private.key"
            sshCommand remote: remote, command: """
              chmod 644 ${REMOTE_CERT_DIR}/certificate.crt
              chmod 600 ${REMOTE_CERT_DIR}/private.key
            """
          }
        }
      }
    }

    stage('Dockerized build for UAT & DEMO') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'yoda-anton', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
          script {
            def remote = [
              name: 'Yoda',
              host: '192.168.1.118',
              user: USERNAME,
              password: PASSWORD,
              allowAnyHosts: true
            ]
            sshCommand remote: remote, command: """
              cd ~/money.tracker.ui/apps/money-tracker-ui/jenkins
              docker build . -t money.tracker.ui.uat -f Dockerfile --build-arg="ENVIRONMENT=uat"
              docker build . -t money.tracker.ui.demo -f Dockerfile --build-arg="ENVIRONMENT=demo"
            """
          }
        }
      }
    }

    stage('Publish tests') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'yoda-anton', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
          script {
            def remote = [
              name: 'Yoda',
              host: '192.168.1.118',
              user: USERNAME,
              password: PASSWORD,
              allowAnyHosts: true
            ]
            sshCommand remote: remote, command: '''
              export DOCKER_BUILDKIT=1
              cd ~/money.tracker.ui
              docker build --output type=local,dest=./coverage --target test-out .
            '''
            sshGet remote: remote, from: "/home/${USERNAME}/money.tracker.ui/coverage", into: "coverage", override: true
          }
        }

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
        withCredentials([usernamePassword(credentialsId: 'yoda-anton', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
          script {
            def remote = [
              name: 'Yoda',
              host: '192.168.1.118',
              user: USERNAME,
              password: PASSWORD,
              allowAnyHosts: true
            ]
            sshCommand remote: remote, command: '''
              cd ~/money.tracker.ui
              npm install
              ./node_modules/.bin/depcheck -o ./ -s ./ -f ALL -P depcheck.properties --prettyPrint
            '''
            // You can add report pulling logic here too if needed
          }
        }
      }
    }

    stage('Prepare SSL Volume') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'yoda-anton', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
          script {
            def remote = [
              name: 'Yoda',
              host: '192.168.1.118',
              user: USERNAME,
              password: PASSWORD,
              allowAnyHosts: true
            ]
            sshCommand remote: remote, command: """
              docker run --rm -v jenkins_ssl_certs:/ssl alpine sh -c "rm -rf /ssl/* && mkdir -p /ssl"
              docker cp ${REMOTE_CERT_DIR}/. \$(docker create --rm -v jenkins_ssl_certs:/ssl alpine sh):/ssl/
              docker run --rm -v jenkins_ssl_certs:/ssl alpine sh -c "
                chmod 644 /ssl/certificate.crt && \
                chmod 600 /ssl/private.key
              "
            """
          }
        }
      }
    }

    stage('Build and start docker compose services') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'yoda-anton', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
          script {
            def remote = [
              name: 'Yoda',
              host: '192.168.1.118',
              user: USERNAME,
              password: PASSWORD,
              allowAnyHosts: true
            ]
            sshCommand remote: remote, command: """
              cd ~/money.tracker.ui/apps/money-tracker-ui/jenkins
              docker compose stop
              docker stop clematis-money-tracker-ui || true && docker rm clematis-money-tracker-ui || true
              docker stop clematis-money-tracker-ui-demo || true && docker rm clematis-money-tracker-ui-demo || true
              docker compose build
              docker compose up -d
            """
          }
        }
      }
    }
  }

  post {
    always {
      sh '''
        if [ -d "docker/nginx/ssl" ]; then rm -rf docker/nginx/ssl; fi
      '''
    }
  }
}

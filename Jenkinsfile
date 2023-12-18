pipeline {

  agent any

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

    stage('Dockerized build') {
      steps {
        sh '''
           docker build . -t money.tracker.ui -f Dockerfile
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
                  --prettyPrint''', odcInstallation: 'Dependency Checker'

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

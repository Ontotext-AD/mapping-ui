pipeline {

  agent {
    label 'graphdb-jenkins-node'
  }

  environment {
    CI = "true"
    NEXUS_CREDENTIALS = credentials('nexus-kim-user')
  }

  stages {

    stage('Install') {
      steps {
        sh "npm install"
      }
    }

    stage('Lint') {
      steps {
        sh "npm run lint"
      }
    }

    stage('Test') {
      steps {
        sh "npm run test"
      }
    }

    stage('Acceptance Test') {
      steps {
          sh "docker-compose build --force-rm --no-cache --parallel"
          sh "docker-compose up --abort-on-container-exit --exit-code-from cypress-tests"
      }
    }
  }
}


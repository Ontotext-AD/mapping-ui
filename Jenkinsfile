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
        sh "sh docker build -t test/mapping-test ."
        sh "sh docker run test/mapping-test"
      }
    }

  }
}


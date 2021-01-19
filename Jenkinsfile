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

    stage('Sonar') {
      steps {
        withSonarQubeEnv('SonarCloud') {
          sh "node sonar-project.js --branch='${env.ghprbSourceBranch}' --target-branch='${env.ghprbTargetBranch}' --pull-request-id='${env.ghprbPullId}'"
        }
      }
    }

    stage('Acceptance Test') {
      steps {
          sh "docker build -t ontotext-ad/mapping-ui:latest ."
          sh "docker run ontotext-ad/mapping-ui:latest"
      }
    }
  }
}


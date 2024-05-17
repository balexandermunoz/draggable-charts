pipeline {
  environment
    {
        VERSION = 'latest'
        CODE_VERSION = '1.0.0'
        USE_CURRENT_VERSION = true
        PYSPARK_PYTHON  = '/usr/bin/python3.9'
        PYSPARK_DRIVER_PYTHON  = '/usr/bin/python3.9'
    }
  agent {
    label 'medium-datap-slave'
  }
  stages {
    stage('Checkout') {
      steps {
        office365ConnectorSend color: "2c9ae8", message: "Started ${env.JOB_NAME} ${env.BUILD_NUMBER} (<${env.BUILD_URL}|Open>)", status: "INPROGRESS", webhookUrl: "https://outlook.office.com/webhook/df82ac08-a3ca-4e73-95d4-7792a7fb24c5@8f3e36ea-8039-4b40-81a7-7dc0599e8645/JenkinsCI/63376eaeeb9a42b29a1374fdeec063e6/eb8810f2-4492-40be-8f5a-483deedd3452"
        checkout scm
      }
    }

stage('Build preparations')
    {
        steps
        {
            script
            {
                gitCommitHash = sh(returnStdout: true, script: 'git rev-parse HEAD').trim()
                shortCommitHash = gitCommitHash.take(7)
                VERSION = shortCommitHash
                currentBuild.displayName = "#${BUILD_ID}-${VERSION}"
                // previous build of the project that has been built (may be currently building)
                previousBuild = currentBuild.previousBuiltBuild
                if(previousBuild){
                    previousBuildName = previousBuild.displayName
                    echo "Previous Build displayName: ${previousBuildName}"
                    splitList = previousBuildName.split('#')
                    // get last successful build of the project if display name is not proper for pervious build
                    if(splitList.length != 3){
                        lastSuccessfulBuild = currentBuild.previousSuccessfulBuild
                        if(lastSuccessfulBuild){
                            lastSuccessfulBuildName = lastSuccessfulBuild.displayName
                            echo "Last successful build displayName: ${lastSuccessfulBuildName}"
                            splitList = lastSuccessfulBuildName.split('#')
                        }
                    }
                    // if no previous build exists, get version based on build number
                    if(splitList.length != 3){
                        CODE_VERSION = "0.0.${BUILD_ID}"
                        int currentVersionNumber = env.BUILD_NUMBER.toInteger()-1
                        CURRENT_VERSION = "0.0.${currentVersionNumber}"
                        sh "echo currentVersion: ${CURRENT_VERSION}"
                    }
                    else {
                        CURRENT_VERSION = splitList[2]
                        sh "echo currentVersion: ${CURRENT_VERSION}"
                    }
                }
                else{
                    CODE_VERSION = "0.0.${BUILD_ID}"
                    int currentVersionNumber = env.BUILD_NUMBER.toInteger()-1
                    CURRENT_VERSION = "0.0.${currentVersionNumber}"
                    sh "echo currentVersion: ${CURRENT_VERSION}"
                }
            }
        }
    }
stage('Generate Version')
    {
        steps
        {
            withCredentials([[
            $class: 'AmazonWebServicesCredentialsBinding'
            , accessKeyVariable: 'AWS_ACCESS_KEY_ID'
            , credentialsId: 'ci-dswb-da-ecr-dev-jenkins-user'
            , secretKeyVariable: 'AWS_SECRET_ACCESS_KEY']])
            {
                sh "aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 082176615813.dkr.ecr.us-east-1.amazonaws.com"
                script
                {
                     gitVersionValue = '0.0.0'

                     if((env.BRANCH_NAME).startsWith('hotfix/')){
                         USE_CURRENT_VERSION = 'false'
                         sh "echo USE_CURRENT_VERSION: ${USE_CURRENT_VERSION}"
                     }

                     if(env.USE_CURRENT_VERSION == 'true'){
                         gitVersionValue = sh(returnStdout: true, script: "docker run 082176615813.dkr.ecr.us-east-1.amazonaws.com/plt-data-engineering/semantic-version-generator:latest --url https://github.cicd.spglobal.com/api/v3 --owner:platts --repo app-pdp-data-ingestor --branch ${BRANCH_NAME} --accesstoken 65f28559d82482067e9c861d8f4caac66f1f23bc --hotfixbranchprefix hotfix/ --hotfixpatchtype:label --hotfixlabel:patch --output value --sha:${gitCommitHash} --currentversion:${CURRENT_VERSION}").trim()
                     }
                     else{
                         gitVersionValue = sh(returnStdout: true, script: "docker run 082176615813.dkr.ecr.us-east-1.amazonaws.com/plt-data-engineering/semantic-version-generator:latest --url https://github.cicd.spglobal.com/api/v3 --owner:platts --repo app-pdp-data-ingestor --branch ${BRANCH_NAME} --accesstoken 65f28559d82482067e9c861d8f4caac66f1f23bc --hotfixbranchprefix hotfix/ --hotfixpatchtype:label --hotfixlabel:patch --output value --sha:${gitCommitHash}").trim()
                     }
                     CODE_VERSION = gitVersionValue
                     currentBuild.displayName = "#${BUILD_ID}-${VERSION}#${gitVersionValue}"
                     sh "echo gitVersionValue: ${gitVersionValue}"
                 }
            }
        }
    }


stage('Build tarball') {
      steps {
        sh 'rm -fr dist/'
        sh 'python3.9 --version'
        sh "sed -i -e 's/1.0/1.0.${env.BUILD_NUMBER}/g' setup.py"
        sh 'python3.9 -m pip install --user --upgrade setuptools wheel'
        sh 'python3.9 setup.py sdist bdist_wheel'
      }
    }

stage('Push tarball') {
    when {
              expression { BRANCH_NAME ==~ /(develop)/ }
        }
        steps {
            sh "python3.9 -m pip install --user --upgrade twine"
            sh "ls -la dist/*"
            sh "/home/jenkins-slave/.local/bin/twine upload --repository plt-analytics-release dist/*"
        }
     }

stage('Clean up') {
      steps {
        deleteDir()
        script {
          currentBuild.result = 'SUCCESS'
        }
        office365ConnectorSend color: "00ff00", message: "Started ${env.JOB_NAME} ${env.BUILD_NUMBER} (<${env.BUILD_URL}|Open>)", status: "SUCCESS", webhookUrl: "https://outlook.office.com/webhook/df82ac08-a3ca-4e73-95d4-7792a7fb24c5@8f3e36ea-8039-4b40-81a7-7dc0599e8645/JenkinsCI/63376eaeeb9a42b29a1374fdeec063e6/eb8810f2-4492-40be-8f5a-483deedd3452"
      }
    }
  }

post {
    failure {
      script {
        currentBuild.result = 'FAILURE'
        office365ConnectorSend color: "fc003b", message: "Started ${env.JOB_NAME} ${env.BUILD_NUMBER} (<${env.BUILD_URL}|Open>)", status: "FAILED", webhookUrl: "https://outlook.office.com/webhook/df82ac08-a3ca-4e73-95d4-7792a7fb24c5@8f3e36ea-8039-4b40-81a7-7dc0599e8645/JenkinsCI/63376eaeeb9a42b29a1374fdeec063e6/eb8810f2-4492-40be-8f5a-483deedd3452"
      }
    }
  }
}

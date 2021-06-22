Source: https://aws.amazon.com/fr/blogs/aws/new-for-aws-lambda-container-image-support/

## Local development

To test lambda locally:
```
yarn build
```
Make sure you have got [Lambda Runtime Interface Emulator](https://github.com/aws/aws-lambda-runtime-interface-emulator/) installed on your machine.
```
yarn dev
curl -XPOST "http://localhost:9000/2015-03-31/functions/function/invocations" -d '{}'
```
## Deployment:
To create repository in ECR:
```
aws ecr create-repository --repository-name [REPO_NAME] --image-scanning-configuration scanOnPush=true
docker tag [REPO_NAME]:latest [ID].dkr.ecr.[REGION].amazonaws.com/[REPO_NAME]:latest
aws ecr get-login-password | docker login --username AWS --password-stdin [ID].dkr.ecr.[REGION].amazonaws.com/[REPO_NAME]
docker push [ID].dkr.ecr.[REGION].amazonaws.com/[REPO_NAME]:latest
```

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
docker tag doc-2-pdf-lambda-container:latest 704448370111.dkr.ecr.us-east-1.amazonaws.com/doc-2-pdf-lambda-container:latest
aws ecr get-login-password | docker login --username AWS --password-stdin 704448370111.dkr.ecr.us-east-1.amazonaws.com/doc-2-pdf-lambda-container

docker push 704448370111.dkr.ecr.us-east-1.amazonaws.com/doc-2-pdf-lambda-container:latest
```

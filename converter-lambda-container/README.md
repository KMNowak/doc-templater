# doc-2-pdf-lambda-container
Convert any file to PDF on AWS serverless architecture with: `Lambda + ECR + LibreOffice`

Based on: https://aws.amazon.com/fr/blogs/aws/new-for-aws-lambda-container-image-support/

## Why?
Having service for file conversion to PDF on your own, independent of external providers' architecture gives you flexibility, security and consistency.

## How to use
By default `app.js` handler accepts direct events or HTTP GET with below query params:

| Event property name          	| Description                                                                       	|
|------------------------------	|-----------------------------------------------------------------------------------	|
| `sourceBucketName`           	| Path to source S3 Bucket                                                          	|
| `targetBucketName`           	| Path to target S3 Bucket                                                          	|
| `fileName`                   	| Name of the file. Output PDF will be saved as `[fileName].pdf`                    	|
| `ACL` (`private` by default) 	| Optional ACL for out file. Allowed: `public-read`, `private`, `public-read-write` 	|

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
After build and local tests we can proceed with deployment to our AWS architecture.

1. Create repository in ECR:
```
aws ecr create-repository --repository-name [REPO_NAME] --image-scanning-configuration scanOnPush=true
```
2. Tag built image
```
docker tag [REPO_NAME]:latest [ID].dkr.ecr.[REGION].amazonaws.com/[REPO_NAME]:latest
```
3. Authorize to ECR:
```
aws ecr get-login-password | docker login --username AWS --password-stdin [ID].dkr.ecr.[REGION].amazonaws.com/[REPO_NAME]
```
4. Publish image
```
docker push [ID].dkr.ecr.[REGION].amazonaws.com/[REPO_NAME]:latest
```
5. Now connect Lambda with deployed image and any trigger up to your preferences. **Important:** Increase timeout to min. 20 secs and memory to min 4096 MB.
6. Enjoy!

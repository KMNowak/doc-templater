FROM amazon/aws-lambda-nodejs:12

COPY app.js package*.json ./
COPY lo.tar.br lo.tar.br

RUN npm install


CMD [ "app.lambdaHandler" ]

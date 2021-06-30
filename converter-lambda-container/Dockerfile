FROM amazon/aws-lambda-nodejs:14

COPY src src
COPY package*.json lo.tar.br ./

RUN npm install

CMD [ "src/app.lambdaHandler" ]

FROM amazon/aws-lambda-nodejs:14

COPY *.js package*.json ./
COPY lo.tar.br lo.tar.br

RUN npm install

CMD [ "app.lambdaHandler" ]

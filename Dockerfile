FROM node:6.10

WORKDIR /home/ag-test-app

ADD package.json /home/ag-test-app/package.json
RUN npm install

ADD . /home/ag-test-app

ENV NODE_ENV test

CMD ["/home/ag-test-app/node_modules/.bin/gulp", "test"]
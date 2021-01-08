FROM cypress/base:12

COPY . /mapping-ui/

WORKDIR /mapping-ui/

RUN npm install && npm install --save-dev cypress

CMD ["npm", "run", "cy:ci"]

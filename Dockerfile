FROM node:latest

WORKDIR /app

COPY ./xml-parser .

RUN npm install
RUN chmod +x ./export.sh

CMD [ "./export.sh", "-v", "data.xml" ]
FROM node:22-alpine

RUN apk update && apk add --no-cache git

WORKDIR /app

# local testing
# RUN mkdir -p /src
# COPY . /src
# RUN cd /src && npm install && npm link && cd /src/app && npm install && npm run build
# RUN cd /app && tpm config --project --team --timeline --tasks

# production
RUN npm i -g tln-pm@0.18.0 && tpm config --project --team --timeline --tasks

EXPOSE 5445

CMD ["tpm", "serve"]
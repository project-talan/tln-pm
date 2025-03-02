FROM node:22-alpine

WORKDIR /app

# local testing
# RUN mkdir -p /src
# COPY . /src
# RUN cd /src && npm install && npm link && cd /src/app && npm install && npm run build
# RUN cd /app && tpm config --project --team --timeline --tasks

RUN npm i -g tln-pm@0.17.0 && tpm config --project --team --timeline --tasks

EXPOSE 5445

CMD ["tpm", "serve"]
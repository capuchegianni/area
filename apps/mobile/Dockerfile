FROM saschpe/android-ndk:35-jdk22.0.2_9-ndk27.0.12077973-cmake3.22.1

RUN apt-get update && apt-get upgrade -y && apt-get install -y npm

RUN npm install -g npm@10.8.3

RUN npm install -g eas-cli

WORKDIR /tmp/app

COPY .git/ .git/

COPY .npmrc .npmrc

COPY package.json package.json

COPY package-lock.json package-lock.json

COPY apps/mobile/ apps/mobile/

COPY packages/common/ packages/common/

RUN npm install

WORKDIR /tmp/app/apps/mobile

RUN chmod +x scripts/build.sh

ENTRYPOINT ["bash", "scripts/build.sh"]

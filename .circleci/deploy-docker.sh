#!/usr/bin/env bash
set -e # halt script on error

# Setting correct variables based on the environment we're deploying to
if [[ $CIRCLE_BRANCH == ${STAGING_BRANCH} ]]; then
  LATEST_TAG=latest-dev
elif [[ $CIRCLE_BRANCH == ${DEPLOY_BRANCH} ]]; then
  LATEST_TAG=latest-stable
else
  echo "Skipping docker deploy"
  exit 0;
fi

echo "Building source image"
docker build -t $DOCKER_SRC_IMAGE .

docker login -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWD"

echo "Pushing image to Docker Hub:$CIRCLE_SHA1"
docker tag $DOCKER_SRC_IMAGE $DOCKER_REPOSITORY:$CIRCLE_SHA1
docker push $DOCKER_REPOSITORY:$CIRCLE_SHA1

echo "Also pushing as :$LATEST_TAG"
docker tag $DOCKER_SRC_IMAGE $DOCKER_REPOSITORY:$LATEST_TAG
docker push $DOCKER_REPOSITORY:$LATEST_TAG
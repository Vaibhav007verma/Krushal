SHELL=/bin/bash

# Below two lines allows us to accept extra arguments (by doing nothing when we get a job that doesn't match, rather than throwing an error)
%:
	@:

args = `arg="$(filter-out $@,$(MAKECMDGOALS))" && echo $${arg:-${1}}`

.PHONY:
.DEFAULT_GOAL: guide

install-node-modules:
	@export GITLAB_AUTH_TOKEN=${READ_KRUSHAL_IT_GITLAB_AUTH_TOKEN} && npm install

clean-krushal-packages-and-install:
	@rm -rf node_modules/@krushal-it node_modules/@krushal-oc package-lock.json
	@export GITLAB_AUTH_TOKEN=${READ_KRUSHAL_IT_GITLAB_AUTH_TOKEN} && npm install

clean-install:
	@rm -rf node_modules package-lock.json
	@export GITLAB_AUTH_TOKEN=${READ_KRUSHAL_IT_GITLAB_AUTH_TOKEN} && npm install

push-env-dev1:
	@sh updateEnvJsonToDotEnv.sh dev1

build-dev1-emulator:
	@npm run android-dev1-emulator

build-dev1-phone2:
	@npm run android-dev1-phone2

assemble-and-install-dev1-on-mobile:
	@cd android && ./gradlew assembleDev1Debug && ./gradlew installDev1Debug && cd ..

install-dev1-on-mobile:
	@cd android && ./gradlew installDev1Debug && cd ..

start:
	@npm start

reset:
	@npm run reset


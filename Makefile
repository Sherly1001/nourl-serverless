build-NoUrlFunction:
	cp -r dist $(ARTIFACTS_DIR)/
	mkdir -p $(ARTIFACTS_DIR)/front
	cp -r front/dist $(ARTIFACTS_DIR)/front/
	cp package.json $(ARTIFACTS_DIR)/
	cp yarn.lock $(ARTIFACTS_DIR)/
	cd $(ARTIFACTS_DIR) && yarn install --production --frozen-lockfile

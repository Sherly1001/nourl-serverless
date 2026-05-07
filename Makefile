build-NoUrlFunction:
	./node_modules/.bin/esbuild src/lambda.ts \
	  --bundle \
	  --platform=node \
	  --target=node22 \
	  --outfile=$(ARTIFACTS_DIR)/dist/lambda.js \
	  --loader:.node=file
	mkdir -p $(ARTIFACTS_DIR)/front
	cp -r front/dist $(ARTIFACTS_DIR)/front/

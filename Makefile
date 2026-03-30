# Makefile for Birb Hunter Cordova Project

# Variables
NPM = npm
CLEAN_FILES = www/ bundle.js vendors~main.bundle.js index.html platforms/ plugins/ node_modules/

.PHONY: all clean help build-android build-ios build-electron build-browser run-browser run-android run-ios run-electron serve test install

all: help

help:
	@echo "Birb Hunter Makefile"
	@echo "Usage:"
	@echo "  make install         Install project dependencies"
	@echo "  make build-android   Build for Android"
	@echo "  make build-ios       Build for iOS"
	@echo "  make build-electron  Build for Desktop (Electron)"
	@echo "  make build-browser   Build for browser (outputs to www/)"
	@echo "  make run-browser     Run the browser version using a local server"
	@echo "  make run-android     Run on Android emulator/device"
	@echo "  make run-ios         Run on iOS emulator/device"
	@echo "  make run-electron    Run on Desktop (Electron)"
	@echo "  make serve           Alias for run-browser"
	@echo "  make test            Run Jasmine tests"
	@echo "  make clean           Remove build artifacts and platforms/plugins"

install:
	$(NPM) install

clean:
	@echo "Cleaning project..."
	rm -rf $(CLEAN_FILES)

build-android:
	$(NPM) run build:android

build-ios:
	$(NPM) run build:ios

build-electron:
	$(NPM) run build:electron

build-browser:
	$(NPM) run build:browser

run-browser:
	$(NPM) run run:browser

run-android:
	$(NPM) run run:android

run-ios:
	$(NPM) run run:ios

run-electron:
	$(NPM) run run:electron

serve:
	$(NPM) run serve

test:
	$(NPM) run test

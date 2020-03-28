# Numenera-FoundryVTT

## What is this?

This repository is the beginning of support for the [Numenera role playing game](http://numenera.com/) for the [Foundry virtual tabletop](http://foundryvtt.com/#about-foundry-virtual-tabletop). Check them out!

## How do I use it?

First, a word of warning: this system is in an alpha state, so you're more than welcome to try it out but you WILL experience problems.

Still, if you're willing to try it out, simply go to the _Game Systems_ tab of the _Configuration and Setup_ screen, click the _Install System_ button and enter this URL: https://raw.githubusercontent.com/SolarBear/Numenera-FoundryVTT/master/system.json

Foundry will download the current bundle and afterwards you only need to create a new world using that system. Easy as pie!

## How do I bundle up the whole thing?

Users COULD simply checkout the whole repo but the code will not be minified, you'll need to generate the CSS files from Sass... way too much trouble!

OR you could simply create a ZIP archive: just run `npm run build`. It uses rollup.js to bundle up everything inside a nice ZIP archive.
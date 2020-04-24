# Numenera-FoundryVTT

## What is this?

This repository is the beginning of support for the [Numenera role playing game](http://numenera.com/) for the [Foundry virtual tabletop](http://foundryvtt.com/#about-foundry-virtual-tabletop). Check them out!

## How do I use it?

First, a word of warning: this system is in an alpha state, so you're more than welcome to try it out but you WILL experience problems.

Still, if you're willing to try it out, simply go to the _Game Systems_ tab of the _Configuration and Setup_ screen, click the _Install System_ button and enter this URL: https://raw.githubusercontent.com/SolarBear/Numenera-FoundryVTT/master/system.json

Foundry will download the current bundle and afterwards you only need to create a new world using that system. Easy as pie!

## Can I help?

Of course you can!

First and foremost, use it! Use the system for your games and send any feedback you may have, good or bad, to me either directly through Discord or by creating an issue on Github. Show it to your friends. Broadcast it on national television. Everything helps.

Otherwise, I'm always looking for all kinds of help:

* translations: any non-English language translations are welcome
* layout: if you have any HTML and CSS skills, you're probably better at this than I am!
* feature development: there's a LOT of work ahead, so if you're familiar with Javascript, there's work to be done

Whatever the case, just get in touch.

## Roadmap

This is obviously subject to change but this is the current plan, with each version having a hilarious name.

If you'd like something added or prioritized, just drop me a line! You can easily join me through the [Foundry Discord server](https://discordapp.com/invite/DDBZUDf).

### 0.1 A New Hope (TM)

* Minimal but usable character sheet

### 0.2 Much love for the character sheet 

* Dynamic skills, weapons and abilities
* Weapons as Items for inclusion in compendiums

### 0.3 NPCs are people, too - CURRENT

* NPC sheets
* Items sheets

### 0.4 I've got the powers

* Abilities and skills as Items for inclusion in compendiums
* Use of powers (eg. Esoteries, Tricks of the Trade, etc.)
    * Subtract cost from pool, taking Edge and Effort into account
    * Take range into account
    * Enable training and specialization of powers, just like any other skill

### 0.5 Numenera's numenera

* Add numenera (oddities + cyphers + artifacts) as items
* Cypher consumption upon use
* Automatic artifact depletion
* Rollable tables for numenera

### 0.6 Keep on (dice) rollin', baby

* **Data stability arrives here**
* Initiative tracking (players + NPCs)
* Rolls from character sheet
    * Simple roll per stat
    * Roll per skill
        * Take stat into account
        * Using Effort, subtract from the appropriate pool
    * Recovery roll
* Custom roll output in chat
    * Actual roll
    * If provided, target difficulty
        * Success or failure
        * Achieved rank
    * Call out special events
        * GM intrusion (nat 1)
        * Out of combat: minor (19) and major (20) effects
        * In combat: damage bonus on 17+ OR effect selection for 19-20

### 0.7 Wanna fight me, bro?

* Full (well, mostly full) combat system integration
    * Combat-specific skills
        * Initiative
        *  Weapons: check for inability and training/specialization
            * related stat
            * light, medium, heavy
            * bladed, bashing, ranged
        * Defense: check for inability and training/specialization
            * related stat
    * Range management
    * Weapon selection
        * Ease the attack roll for Light weapons
        * Apply the best available armor
    * Support for some weapon special attributes
        * Weapons that need to reload (eg. heavy crossbow)
        * Area weapons
    * Combat attribute tracking
        * players: Might pool? damage track? both, if that's possible?
            * see: primaryTokenAttribute, secondaryTokenAttribute
        * NPCs: health
    * Armor selection
        * Apply shield bonus, if applicable
        * Enable multiple, stackable armor (figure out a means!)
        * On damage inflicted, select applicable armor(s), if any

### 0.8 QoL

* Fancy recovery roll dialog
    * Allow spreading of recovered pool points
* Rerolls from XP spending
    * Allow spending XP from another player
* In-game support for GM intrusions
    * Intrusion dialog
        * Refuse: -1 XP
        * Accept: +1 XP, select PC to send extra XP to
* Character advancement
    * Character advance dialog
    * Tier increase after 4th advance
* Allow Compendiums for various in-game stuff: Types, Foci, powers, etc.

### ????

* Profit !

## Dev info

If you're a regular user, shoo! This is not your section: you should leave now while you still can. It's scary down there, I tell ya.

If you're the kind of person who knows HTML, CSS and/or Javasript, well 1) my condolences and 2) read on.

### How do I deploy this?

#### Method 1: deploy as is

If you want to use the code as is - unminified, without tree-shaking, etc. - follow these steps.

1. Ensure the Foundry server is installed on your machine.
1. Clone the repo to a directory of your liking using your git client of choice. 
1. Open a console and move to that directory.
1. Run `npm install --save-dev` there. Wait for it to finish.
1. Go to your foundry data folder (LINK HERE PLZ) and either move your git repo clone into the `worlds/` subdirectory or create a symlink to that directory.
1. Start the foundry server.
1. Connect to it using your favorite browser.
1. Enjoy.

During developement, just run `npm run watch` to have sass watch over your .sass files and convert them to CSS on the fly.

#### Method 2: deploy an optimized version

First, check the bundling section and follow the steps.

Once you've bundled up the whole thing, unzip the contents of that archive into your `worlds/` subfolder. That's it!

### How do I bundle up the whole thing?

Just run `npm run build`: it uses rollup.js to bundle up everything inside a nice ZIP archive with minified and tree-shaked JS, with all the required JSON, CSS and HTML.

If you add new files that _should_ be added to the bundle (eg. a new HTML template), make sure to add it to the list of files inside rollup.config.js, otherwise it will not be bundled; note this is not necessary for .js files.
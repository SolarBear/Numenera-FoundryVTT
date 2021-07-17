import scss from 'rollup-plugin-scss';
import { terser } from 'rollup-plugin-terser';
import copy from 'rollup-plugin-copy2';
import zip from 'rollup-plugin-zip';

const releaseBuild = true;
const destinationDir = 'dist';

const toBundle = [
    'template.json',
    'system.json',
    'numenera.css',
    "fonts/ogirema.ttf",
    "fonts/source.txt",
    "images/jpg/testbg.jpg",
    "images/svg/dblarrow1.svg",
    "images/svg/dblarrow2.svg",
    "images/svg/edit.svg",
    "images/svg/int.svg",
    "images/svg/mgt.svg",
    "images/svg/spd.svg",
    "images/svg/uparrow1.svg",
    "images/svg/uparrow2.svg",
    "lang/de.json",
    "lang/en.json",
    "lang/es.json",
    "lang/fr.json",
    "lang/pt-BR.json",
    "packs/system-macros.db",
    "templates/actor/characterSheet.html",
    "templates/actor/characterSheetLimited.html",
    "templates/actor/communitySheet.html",
    "templates/actor/communitySheetLimited.html",
    "templates/actor/npcSheet.html",
    "templates/actor/npcSheetLimited.html",
    "templates/actor/partials/artifacts.html",
    "templates/actor/partials/cyphers.html",
    "templates/actor/partials/features.html",
    "templates/actor/partials/oddities.html",
    "templates/actor/partials/pcHeader.html",
    "templates/actor/partials/powerShifts.html",
    "templates/actor/partials/recursions.html",
    "templates/actor/partials/weapons.html",
    "templates/chat/automaticResult.html",
    "templates/chat/items/ability.html",
    "templates/dialog/effort.html",
    "templates/dialog/recovery.html",
    "templates/dialog/spellUse.html",
    "templates/hud/tokenHUD.html",
    "templates/item/abilitySheet.html",
    "templates/item/armorSheet.html",
    "templates/item/artifactSheet.html",
    "templates/item/cypherSheet.html",
    "templates/item/equipmentSheet.html",
    "templates/item/odditySheet.html",
    "templates/item/powerShiftSheet.html",
    "templates/item/skillSheet.html",
    "templates/item/weaponSheet.html",
    "templates/item/recursionSheet.html",
    "templates/scene/tokenConfig.html",
    "templates/settings/features.html",
    "LICENSE",
];

export default [{
    input: 'numenera.js',
    output: {
        dir: destinationDir,
        format: 'umd',
    },
    plugins: [
        terser({
            compress: releaseBuild ? {} : false,
        }),
        scss({
            failOnError: true,
            output: true,
        }),
        copy({
            assets: toBundle,
        }),
        zip({
            dir: destinationDir,
        }),
    ],
}, ];

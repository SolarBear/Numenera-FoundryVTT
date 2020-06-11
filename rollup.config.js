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
    "lang/en.json",
    "lang/fr.json",
    "lib/dragula/dragula.min.css",
    "lib/dragula/dragula.min.js",
    "templates/actor/characterSheet.html",
    "templates/actor/npcSheet.html",
    "templates/dialog/recovery.html",
    "templates/hud/tokenHUD.html",
    "templates/item/abilitySheet.html",
    "templates/item/armorSheet.html",
    "templates/item/artifactSheet.html",
    "templates/item/cypherSheet.html",
    "templates/item/equipmentSheet.html",
    "templates/item/odditySheet.html",
    "templates/item/skillSheet.html",
    "templates/item/weaponSheet.html",
    "templates/scene/tokenConfig.html",
    "templates/item/recursionSheet.html",
    "LICENSE"
];

export default [{
    input: 'numenera.js',
    output: {
        dir: destinationDir,
        format: 'umd',
    },
    plugins: [
        terser({
            sourcemap: !releaseBuild,
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

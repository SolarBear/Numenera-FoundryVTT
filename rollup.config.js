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
    "templates/characterSheet.html",
    "templates/npcSheet.html",
    "templates/cypherSheet.html",
    "templates/artifactSheet.html",
    "templates/cypherSheet.html",
    "templates/equipmentSheet.html",
    "templates/odditySheet.html",
    "templates/weaponSheet.html",
    "templates/parts/range.html",
    "templates/parts/stats.html",
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
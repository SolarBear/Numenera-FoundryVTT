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
  'templates/characterSheet.html',
  'templates/npcSheet.html',
  'templates/roll-dialog.html',
];

export default [
  {
    input: 'numenera.js',
    output: {
      //file: `${destinationDir}/numenera.js`,
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
  },
];

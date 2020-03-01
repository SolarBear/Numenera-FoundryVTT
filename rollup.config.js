import scss from 'rollup-plugin-scss';
import { terser } from 'rollup-plugin-terser';
import copy from 'rollup-plugin-copy2';
import zip from 'rollup-plugin-zip';

const releaseBuild = true;
const destinationDir = 'dist';

export default [
  {
    input: 'numenera.js',
    output: {
      file: `${destinationDir}/numenera.js`,
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
        assets: [
          'template.json',
          'system.json',
          'numenera.css',
          'templates/characterSheet.html',
          'templates/npcSheet.html',
          'templates/roll-dialog.html',
        ],
      }),
      zip(),
    ],
  },
];

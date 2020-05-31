const gulp = require('gulp');
const sass = require('gulp-sass');

const css = gulp.series(() => {
  return gulp.src("sass/**/numenera.scss")
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest("./"))
});

/* ----------------------------------------- */
/*  Watch Updates
/* ----------------------------------------- */

function watchUpdates() {
  gulp.watch('sass/**/*.scss', css);
}

/* ----------------------------------------- */
/*  Export Tasks
/* ----------------------------------------- */

exports.default = gulp.series(
  gulp.parallel(css),
  watchUpdates
);

exports.css = css;

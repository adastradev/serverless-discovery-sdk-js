const gulp = require('gulp');
const snyk = require('@adastradev/gulp-snyk');
 
// Security related tasks/series'
const snykProtect = (cb) => process.env.SNYK_TOKEN ? snyk({ command: 'protect' }, cb) : cb();
// If you run into memory issues on repos with a large number of dependencies, you may have to replace the above command
// with the following. This will remove a default setting that includes dev dependencies in the protect command.
// const snykProtect = (cb) => process.env.SNYK_TOKEN ? snyk({ command: 'protect', options: {}}, cb) : cb();
const snykTest = (cb) => process.env.SNYK_TOKEN ? snyk({ command: 'test' }, cb) : cb();
 
// This is a gulp task, available by running "gulp secure"
exports.secure = gulp.series(snykProtect, snykTest);
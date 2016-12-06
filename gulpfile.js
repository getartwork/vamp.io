/* File: gulpfile.js */

// grab our gulp packages
var gulp  = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var shell = require('gulp-shell');
var merge = require('merge-stream');
var concat = require('gulp-concat')
var env = require('./env.json');
var inject = require('gulp-inject-string');




gulp.task('sass:dev', function() {
    var sassStream = gulp.src('./themes/vamp-theme/static/scss/style.scss')
      .pipe(sass.sync().on('error', sass.logError))
      .pipe(autoprefixer({cascade: false}));
  
    var cssStream = gulp.src('./themes/vamp-theme/static/css/vendor/*.css')
      .pipe(concat('css-files.css'));
  
    var mergedStream = merge(sassStream, cssStream)
      .pipe(concat('style.css'))
      .pipe(gulp.dest('./themes/vamp-theme/static/css'));
    return mergedStream;
});




var developmentBase = '\n<script type="text/javascript">';
    developmentBase +='\ntheBaseUrl = "http://" + location.host + "/";';
    developmentBase +='\ndocument.write(\'<base href="\' + theBaseUrl + \'"/>\');';
    developmentBase +='\n</script>';


var prodUrl = env.prod.baseUrl;

var productionBase = '\n<script type="text/javascript">';
    productionBase +='\ntheBaseUrl = "'+ prodUrl + '";';
    productionBase +='\n</script>';


gulp.task('set-base:development', [], function() {
    return gulp.src('./themes/vamp-theme/layouts/partials/head.html')
        .pipe(inject.after('<head>',  developmentBase))
        .pipe(gulp.dest('./themes/vamp-theme/layouts/partials'))
});

gulp.task('set-base:production', [], function() {
    return gulp.src('./themes/vamp-theme/layouts/partials/head.html')
        .pipe(inject.after('<head>',  '\n'+productionBase+'\n<base href="'+ prodUrl + '" />'))
        .pipe(gulp.dest('./themes/vamp-theme/layouts/partials'))
});

gulp.task('build-search-index',['sass:dev'], shell.task(['node ./buildSearchIndex.js']));
gulp.task('hugo', ['sass:dev', 'build-search-index'], shell.task(['hugo']));

gulp.task('build:prod', ['hugo', 'set-base:production']);
gulp.task('build:dev', ['hugo', 'set-base:development']);


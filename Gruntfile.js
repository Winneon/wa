module.exports = function(grunt){
	grunt.initConfig({
		sass: {
			dist: {
				files: {
					"views/css/style.css": "sass/style.scss",
					"views/css/load.css": "sass/load.scss",
					"views/css/login.css": "sass/login.scss",
					"views/css/dj.css": "sass/dj.scss"
				}
			}
		},
		watch: {
			source: {
				files: ["sass/**/*.scss"],
				tasks: ["sass"]
			}
		}
	});
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-sass");
	grunt.registerTask("default", ["sass"]);
};
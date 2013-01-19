/**
 * Created with JetBrains PhpStorm.
 * User: pdietrich
 * Date: 19.01.13
 * Time: 14:40
 */

var Cell = Backbone.Model.extend({
	defaults: {
		visited: false,
		walls: [],
		coords: []
	},
	initialize: function(maze,coords) {
		//parent maze
		this.set("maze",maze);
		//receiving position in maze via constructor
		this.set("coords",coords);

		var walls=[];
		var num = this.get("maze").get("nbOfNeighbours");
		for (var i=0;i<num;i++) {
			walls.push(true);
		}
		this.set("walls",walls);
	}
});



/**
 * Created with JetBrains PhpStorm.
 * User: pdietrich
 * Date: 19.01.13
 * Time: 14:40
 */

var Maze = Backbone.Model.extend({
	defaults:{
		"rows":3,
		"cols":3,
		"nbOfNeighbours":4,
		"directions":[
			//north, east, south, west
			[-1, 0],
			[0, 1],
			[1, 0],
			[0, -1]
		]
	},
	events:{
		"change rows cols":"reset"
	},
	initialize:function () {
		this.grid = [];
		this.reset();
		_.bindAll(this,"getCell","getNeighbourOf","applyDirectionOnCoords");
	},
	generate:function () {

	},
	reset:function () {
		console.log("Resetting to ", this.get("rows"), this.get("cols"));
		for (var r = 0; r < this.get("rows"); r++) {
			this.grid[r] = [];
			for (var c = 0; c < this.get("cols"); c++) {
				this.grid[r][c] = new Cell(this, [r, c]);
			}
		}
	},
	/**
	 *
	 * Modify given coordinates by direction index
	 * @param coords
	 * @param direction
	 * @return {Array} coords
	 */
	applyDirectionOnCoords:function (coords, direction) {
		var directions = this.get("directions");
		var d = directions[direction];
		return [coords[0] + d[0], coords[1] + d[1]];
	},
	getCell:function (coords) {
		if ((coords[0] < 0) || (coords[1] < 0)) {
			return false;
		}

		if (coords[0] > this.get("rows") - 1) {
			return false;
		}
		if (coords[1] > this.get("cols") - 1) {
			return false;
		}
		return this.grid[coords[0]][coords[1]];
	},
	getNeighbourOf:function (coords, direction) {
		var newCoords = this.applyDirectionOnCoords(coords, direction);
		return this.getCell(newCoords);
	}
});

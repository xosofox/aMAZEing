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
		],
		"startCoords":[0,0],
        "cellStack":[],
        "stepDelay":-1,
        "status": ""
	},
	events:{
		"change rows cols":"reset"
	},
	initialize:function () {
		this.grid = [];
		this.reset();
		_.bindAll(this,"getCell","getNeighbourOf","applyDirectionOnCoords");
	},
	reset:function () {
        var me=this;
		console.log("Resetting to ", this.get("rows"), this.get("cols"));
		for (var r = 0; r < this.get("rows"); r++) {
			this.grid[r] = [];
            this.set("status","Resetting Cells in row "+(r+1));
			for (var c = 0; c < this.get("cols"); c++) {
				this.grid[r][c] = false; //new Cell(this, [r, c]);
			}
		}
                this.set("unvisited",r*c);
            this.set("status","");

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
	setStart:function(coords) {
		this.set("startCoords",coords);
		this.getCell(coords).set({"start":true,"visited":true});
                this.decUnvisited();
	},
	setExit:function(coords) {
		this.set("exitCoords",coords);
		this.getCell(coords).set({"exit":true});
	},
	setVisited: function(coords) {
                var c=this.getCell(coords);
                if (!(c.get("visited"))) {
                    c.set("visited",true);
                    this.decUnvisited();
                }
	},
        decUnvisited: function() {
                this.set("unvisited",this.get("unvisited")-1);
            },

    startDigging: function(coords) {
        this.set("status","digging");
        this.get("cellStack").push(coords);
        this.digMaze();
    },
	validCoords:function(coords) {
		if ((coords[0] < 0) || (coords[1] < 0)) {
			return false;
		}

		if (coords[0] > this.get("rows") - 1) {
			return false;
		}
		if (coords[1] > this.get("cols") - 1) {
			return false;
		}
		return true;
	},
	getCell:function (coords) {
		if (this.validCoords(coords)) {
            var r=coords[0];
            var c=coords[1];
            if (this.grid[r][c]===false) {
                this.grid[r][c]=new Cell(this, [r, c]);
            }
			return this.grid[r][c];
		} else {
			return false;
		}
	},
	getNeighbourOf:function (coords, direction) {
		var newCoords = this.applyDirectionOnCoords(coords, direction);
		return this.getCell(newCoords);
	},
	/**
	 *
	 * Returns all valid neighbours of cell
	 * @param coords
	 * @return {Cells}
	 */
	getNeighboursOf: function(coords) {
		console.error("Obsolete");
		var ns=[];
		for (var d in this.get("directions")) {
			var newCoords = this.applyDirectionOnCoords(coords,d);
			var c=this.getCell(newCoords);
			if (c) {
				ns[d]=c;
			}
		}
		return new Cells(ns);
	},
	getValidDirectionsOf: function(coords) {
		var nb=this.get("nbOfNeighbours");
		var ds=[];
		for (var d=0;d<nb;d++) {
			if (this.validCoords(this.applyDirectionOnCoords(coords,d))) {
				ds.push(d);
			}
		}
		return ds;
	},
	getValidUnvisitedDirectionsOf:function(coords) {
		var ds=this.getValidDirectionsOf(coords);
		var us=[];
		for (var i=0;i<ds.length;i++) {
			var d=ds[i];
			var c=this.getCell(this.applyDirectionOnCoords(coords,d));
			if (c) {
				if (!(c.get("visited"))) {
					us.push(parseInt(d));
				}
			}
		}
		return us;
	},
	getRandomValidUnvisitedDirectionOf:function(coords){
		var v=this.getValidUnvisitedDirectionsOf(coords);
		if (v.length>0) {
			return _.first(_.shuffle(v));
		} else {
			return false;
		}
	},
	oppositeDirection:function(d) {
		var nb=this.get("nbOfNeighbours");
		return (nb/2 + d) % nb;
	},
	MrGorbachevTearDownThisWall:function(coords,direction) {
		var c=this.getCell(coords);
		if (c) {
			c.get("walls")[direction]=false;
		}
		var n=this.getNeighbourOf(coords,direction);
		if (n) {
			n.get("walls")[this.oppositeDirection(direction)]=false;
		}
	},
	digMaze:function() {
        var me=this;
        var cs=this.get("cellStack");
        var l=cs.length;
        var flush=this.get("flush");
        var flush_threshold=1000;
        if (l>0) {
            var coords=cs[l-1];
            maze.setVisited(coords);
            var ds=this.getValidUnvisitedDirectionsOf(coords);
            var d=false;
            if (ds.length>1) {
                d=_.first(_.shuffle(ds));
            } else if (ds.length==1) {
                d=ds[0];
            }
		    if (d!==false) {
                this.MrGorbachevTearDownThisWall(coords,d)
                var newCoords=this.applyDirectionOnCoords(coords,d);
                if (ds.length<=1) {
                    //remove myself, I'm done now, no need to stay on stack
                    cs.pop();
                }
                cs.push(newCoords);
            } else {
                //remove myself, I'm done, no need to stay on stack
                cs.pop();
            }
            this.trigger("cell:changed",coords);
            var sd=this.get("stepDelay");
            if ((sd<0) && (flush<flush_threshold)) {
                this.set("flush",++flush);
                me.digMaze();
            } else {
                this.set("flush",0);
                //allows rendering in parallel
                setTimeout(function(){me.digMaze()},sd);
            }
        } else {
            var callback=this.get("readyCallback");
            if (callback && typeof(callback) === "function") {
                callback();
            }
            console.log("I'm done!");
            this.set("status","");
        }
	}
});

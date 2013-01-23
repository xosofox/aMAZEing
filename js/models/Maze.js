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
        "status": "",
        "flush_threshold": 10000
	},
	events:{
		"change rows cols":"reset"
	},
	initialize:function () {
		this.grid = [];
		this.reset();
		_.bindAll(this,"getCell","applyDirectionOnCoords");
	},
	reset:function () {
        var me=this;
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
		this.getCell(coords).start=true;
		this.getCell(coords).visited=true;
                this.decUnvisited();
	},
	setExit:function(coords) {
		this.set("exitCoords",coords);
		this.getCell(coords).exit=true;
	},
	setVisited: function(coords) {
                var c=this.getCell(coords);
                if (!(c.visited)) {
                    c.visited=true;
                    this.decUnvisited();
                }
	},
        decUnvisited: function() {
                this.set("unvisited",this.get("unvisited")-1);
            },

    startDigging: function(coords) {
        this.set("status","digging");
        this.set("cellStack",[coords]);
        this.digMaze();
    },
    startSolving: function(coords) {
        this.set("status","solving");
        this.set("cellStack",[coords]);
        this.solveMaze();
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
                //cell prototype
                this.grid[r][c]={
                    visited: false,
                    walls: [],
                    coords: [],
                    start: false,
                    exit: false
                }
            }
			return this.grid[r][c];
		} else {
			return false;
		}
	},
	getCellInDirection:function (coords, direction) {
		var newCoords = this.applyDirectionOnCoords(coords, direction);
		return this.getCell(newCoords);
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
				if (!(c.visited)) {
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
			c.walls[direction]=false;
		}
		var n=this.getCellInDirection(coords,direction);
		if (n) {
			n.walls[this.oppositeDirection(direction)]=false;
		}
	},
    getAccessibleDirectionsOf:function(coords) {
        var c = this.getCell(coords);

        var ds=[];
        if (c) {
            var walls= c.walls;
            for (var w=0;w<this.get("nbOfNeighbours");w++) {
                if (c.walls[w] === false) {
                    ds.push(w);
                }
            }
        }
        return ds;
    },
    getUnknownAccessibleDirectionsOf:function(coords) {
        var us=[];
        var ds=this.getAccessibleDirectionsOf(coords);
		for (var i=0;i<ds.length;i++) {
			var d=ds[i];
			var c=this.getCell(this.applyDirectionOnCoords(coords,d));
			if (c) {
				if (typeof c.solution === "undefined" ) {
					us.push(parseInt(d));
				}
			}
		}
        return us;
    },
	digMaze:function() {
        var me=this;
        var cs=this.get("cellStack");
        var l=cs.length;
        var flush=this.get("flush");
        var flush_threshold=this.get("flush_threshold");
        if (l>0) {
            var coords=cs[l-1];
            this.setVisited(coords);
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
	},
	solveMaze:function() {
        var me=this;
        var cs=this.get("cellStack");
        var l=cs.length;
        var flush=this.get("flush");
        var flush_threshold=this.get("flush_threshold");
        if (l>0) {
            var coords=cs[l-1];
            var c=this.getCell(coords);
            c.solution=true;

            if (c.exit) {
                this.set("cellStack",[]);
                setTimeout(function(){me.solveMaze()},0);
                return true;
            }

            var ds=this.getUnknownAccessibleDirectionsOf(coords);
            if (ds.length>0) {
                for (var d=0;d<ds.length;d++) {
                    var newCoords=this.applyDirectionOnCoords(coords,ds[d]);
                    cs.push(newCoords);
                }
            } else {
                c.solution=false;
                //remove myself, I'm done now, no need to stay on stack
                cs.pop();
            }
            this.trigger("cell:changed",coords);
            var sd=this.get("stepDelay");
            if ((sd<0) && (flush<flush_threshold)) {
                this.set("flush",++flush);
                me.solveMaze();
            } else {
                this.set("flush",0);
                //allows rendering in parallel
                setTimeout(function(){me.solveMaze()},sd);
            }
        } else {
            var callback=this.get("readyCallback");
            if (callback && typeof(callback) === "function") {
                callback();
            }
            console.log("I'm done solving!");
            this.set("status","");
        }

    }
});

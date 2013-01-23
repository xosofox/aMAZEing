/**
 * Created with JetBrains PhpStorm.
 * User: pdietrich
 * Date: 19.01.13
 * Time: 14:40
 * To change this template use File | Settings | File Templates.
 */

var MazeView = Backbone.View.extend({
	options:{
		size:10,
		outerBorder: 4,
		border:2,
		zoom:1,
		shape:"rect",
		bgColorStyle: "black",
		fgColorStyle: "white"
	},
	initialize:function () {
        this.options.numNeigh=this.model.get("nbOfNeighbours");
        this.listenTo(this.model,"cell:changed",this.renderCell);
	},
	render:function () {
		this.ctx = this.el.getContext("2d");
		this.calcDimensions();
		this.el.width=this.options.width;
		this.el.height=this.options.height;
		this.el.style.width=this.options.width*this.options.zoom+"px";
		this.el.style.height=this.options.height*this.options.zoom+"px";
		this.fillBg();
	},
	fillBg:function() {
		this.ctx.fillStyle = this.options.bgColorStyle;
		//this.ctx.moveTo(0,0);
		//this.ctx.beginPath();
		this.ctx.fillRect(0, 0, this.options.width,this.options.height);
		//this.ctx.fill();
	},
	renderCell:function(coords) {
		var c = this.model.getCell(coords);
		if (c) {
			if (c.visited) {
				//draw bg
				this.renderCellVisited(coords);

				//draw all walls
				var walls= c.walls;
				for (var w=0;w<this.options.numNeigh;w++) {
					if (typeof walls[w] === "undefined") {
						this.renderWall(coords,w);
					}
				}
			}
		}
	},
	renderCellVisited:function(coords) {
		this.ctx.fillStyle = this.options.fgColorStyle;
		var c=this.model.getCell(coords);
		if (c.start) {
			this.ctx.fillStyle="red";
		}
		if (c.exit) {
			this.ctx.fillStyle="green";
		}

		var top=this.rowToY(coords[0]);
		var left=this.colToX(coords[1]);
		//this.ctx.moveTo(left,top);
		//this.ctx.beginPath();
		this.ctx.fillRect(left,top, this.options.size,this.options.size);
		//this.ctx.fill();
	},
	renderWall:function(coords,wall) {
		var top=this.rowToY(coords[0]);
		var left=this.colToX(coords[1]);
		var size=this.options.size;
		var border=this.options.border;
		this.ctx.fillStyle=this.options.bgColorStyle;

		if (wall==0) {
			//north wall
			this.ctx.fillRect(left,top,size,border);
		} else if (wall==1) {
			//east wall
			this.ctx.fillRect(left+size-border,top,border,size);
		} else if (wall==2) {
			//south wall
			this.ctx.fillRect(left,top+size-border,size,border);
		} else if (wall==3) {
			this.ctx.fillRect(left,top,border,size);
		}

	},
	calcDimensions:function () {
		this.options.width = this.colToX(this.model.get("cols")) + this.options.outerBorder;
		this.options.height = this.rowToY(this.model.get("rows")) + this.options.outerBorder;
	},
	rowToY:function (r) {
		var border = this.options.outerBorder;
		var size = this.options.size;
		return border + r * size;
	},
	colToX:function (c) {
		var border = this.options.outerBorder;
		var size = this.options.size;
		return border + c * size;
	}

});

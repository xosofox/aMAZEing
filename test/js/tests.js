/**
 * Created with JetBrains PhpStorm.
 * User: pdietrich
 * Date: 19.01.13
 * Time: 17:39
 * To change this template use File | Settings | File Templates.
 */

test("Maze init and get/set", function () {
	var maze = new Maze();
	var c = maze.getCell([0,0]);
	deepEqual(c.get("coords"),[0,0],"getCell returns a Cell object with 0|0 coords");

	//use direction defaults
	var coords=[1,2]

	deepEqual(maze.applyDirectionOnCoords(coords,0),[0,2],"coordinates are modified to the north/top")
	deepEqual(maze.applyDirectionOnCoords(coords,1),[1,3],"coordinates are modified to the right/east")
	deepEqual(maze.applyDirectionOnCoords(coords,2),[2,2],"coordinates are modified to the bottom/south")
	deepEqual(maze.applyDirectionOnCoords(coords,3),[1,1],"coordinates are modified to the left/west")
	//maze.getNeighboursOf([0,0])

	//change directions
	maze.set("directions",[
		[-1, 0], //north
		[0, -1], //west
		[1, 0], //south
		[0, 1] //east
	]);
	deepEqual(maze.applyDirectionOnCoords(coords,1),[1,1],"coordinates are modified to the left/west")

	//reset
	var maze = new Maze({
		rows: 2,
		cols: 20
	});

	equal(maze.getCell([-1,2]),false,"coords out of bounds return false");
	equal(maze.getCell([2,2]),false,"coords out of bounds return false");
	deepEqual(maze.getCell([1,2]).get("coords"),[1,2],"two rows results in row index 0 and 1");

	equal(c.get("visited"),false,"cells are initialized with visited cell property as false");
	maze.setVisited([1,2]);
	c=maze.getCell([1,2]);
	equal(c.get("visited"),true,"setVisited marked visited cell property as true");

});

test("Maze neighbours", function () {
	var maze = new Maze({rows:8,cols:8});
	deepEqual(maze.getNeighbourOf([0,0],1).get("coords"),[0,1],"getNeighbourOf returns neighbour of given direction");
	equal(maze.getNeighbourOf([0,0],3),false,"non existing neighbour returns false");

	var ns;
	ns=maze.getNeighboursOf([3,0]);
	equal(ns.size(),3,"getNeighboursOf at the edge returns 3");

	ns=maze.getNeighboursOf([7,7]);
	equal(ns.size(),2,"getNeighboursOf at bottom right corner returns 2");
	deepEqual(ns.at(0).get("coords"),[6,7],"returns north element first");

	ns=maze.getUnvisitedNeighboursOf([3,0]);
	equal(ns.size(),3,"getUnvisitedNeighboursOf at the edge returns 3 if none visited");

	maze.setVisited([2,0]);

	var ns=maze.getUnvisitedNeighboursOf([3,0]);
	equal(ns.size(),2,"getUnvisitedNeighboursOf at the edge returns 2 as one is visited");
	deepEqual(ns.at(0).get("coords"),[3,1],"returns east as north is visited");

	//check randomneess in 100 runs
	//will return [3,1] and [4,0], should return 50 each
	var r0=0;r1=0;
	for (var i=0;i<1000;i++) {

		var n=maze.getRandomUnvisitedNeighbourOf([3,0]);
		var coords= n.get("coords");
		if (coords[0]==3) {
			r0++;
		} else {
			r1++;
		}
	}
	console.log(r0," vs ",r1);
	ok(r0>470,"getRandomUnvistedNeighbourOf returns good randomness with "+r0+">470");
	ok(r0<530,"getRandomUnvistedNeighbourOf returns good randomness with "+r1+"<530");
});

test("MazeView",function() {
	var maze= new Maze({
		rows: 2,
		cols: 4
	});
	var mazeview = new MazeView({
		model: maze,
		size: 5,
		outerBorder: 4,
		border: 2
	});
	equal(mazeview.rowToY(0),4,"rowToY returns left edge of cell");
	equal(mazeview.rowToY(1),9,"rowToY works correctly");
	equal(mazeview.options.width,28,"mazeview width correctly initialized");
	equal(mazeview.options.height,18,"mazeview height correctly initialized");


});

/**
 * Created with JetBrains PhpStorm.
 * User: pdietrich
 * Date: 19.01.13
 * Time: 17:39
 * To change this template use File | Settings | File Templates.
 */

test("Maze init and get/set", function () {
	var maze = new Maze();
    var c;

	//use direction defaults
	var coords=[1,2]

	deepEqual(maze.applyDirectionOnCoords(coords,0),[0,2],"coordinates are modified to the north/top")
	deepEqual(maze.applyDirectionOnCoords(coords,1),[1,3],"coordinates are modified to the right/east")
	deepEqual(maze.applyDirectionOnCoords(coords,2),[2,2],"coordinates are modified to the bottom/south")
	deepEqual(maze.applyDirectionOnCoords(coords,3),[1,1],"coordinates are modified to the left/west")

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

    c=maze.getCell([1,2]);
	equal(c.visited,false,"cells are initialized with visited cell property as false");
	maze.setVisited([1,2]);
	c=maze.getCell([1,2]);
	equal(c.visited,true,"setVisited marked visited cell property as true");

});

test("Maze directions", function () {
	var maze = new Maze({rows:8,cols:8});
    maze.setVisited([0,1]);
	deepEqual(maze.getCellInDirection([0,0],1).visited,true,"CellInDirection returns neighbour of given direction");
	equal(maze.getCellInDirection([0,0],3),false,"non existing neighbour returns false");

	var ds;
	ds=maze.getValidDirectionsOf([3,0]);
	equal(ds.length,3,"getValidDirectionsOf at the edge returns 3");

	ds=maze.getValidDirectionsOf([7,7]);
	equal(ds.length,2,"getValidDirectionsOf at the edge returns 2");
	equal(ds[0],0,"returns north element first");

	ds=maze.getValidDirectionsOf([2,7]);
	equal(ds.length,3,"getValidDirectionsOf at the edge returns 3");

	var maze = new Maze({rows:8,cols:8});
	ds=maze.getValidUnvisitedDirectionsOf([3,0]);
	equal(ds.length,3,"getValidUnvisitedDirectionsOf at the edge returns 3 if none visited");

	ds=maze.getValidUnvisitedDirectionsOf([0,0]);
	equal(ds.length,2,"getValidUnvisitedDirectionsOf at the top left returns 2 if none visited");

	maze.setVisited([2,0]);

	ds=maze.getValidUnvisitedDirectionsOf([3,0]);
	equal(ds.length,2,"getValidUnvisitedDirectionsOf at the edge returns 2 as one is visited");
	deepEqual(ds[0],1,"returns east as north is visited");

	//check randomneess in 100 runs
	//will return 1 and 2, should return 50% each
	var r0=0;r1=0;
	for (var i=0;i<1000;i++) {

		var d=maze.getRandomValidUnvisitedDirectionOf([3,0]);
		if (d==1) {
			r0++;
		} else {
			r1++;
		}
	}
	console.log("Randomwness: ",r0," vs ",r1);
	ok(r0>470,"getRandomValidUnvisitedDirectionOf returns good randomness with "+r0+">470");
	ok(r0<530,"getRandomValidUnvisitedDirectionOf returns good randomness with "+r1+"<530");

	//set all visited
	maze.setVisited([3,1]);
	maze.setVisited([4,0]);
	n=maze.getRandomValidUnvisitedDirectionOf([3,0]);
	equal(n,false,"getRandomValidUnvisitedDirectionOf() returns false if all are visited");
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
    mazeview.calcDimensions();
	equal(mazeview.options.width,28,"mazeview width correctly initialized");
	equal(mazeview.options.height,18,"mazeview height correctly initialized");
});

test("Algorithms",function() {
	var maze=new Maze({
		rows:20,
		cols:10
	});
	equal(maze.oppositeDirection(1),3,"oppositedirection of 1 is 3");
	equal(maze.oppositeDirection(3),1,"oppositedirection of 3 is 1");
	equal(maze.oppositeDirection(2),0,"oppositedirection of 2 is 0");
	//equal(maze.getCell([1,1]).get("walls")[1],true,"there is a wall in the east");  //not initialized but undefined resembles true
	//equal(maze.getCell([1,2]).get("walls")[3],true,"there is a wall in the west");
	maze.MrGorbachevTearDownThisWall([1,1],1);
	equal(maze.getCell([1,1]).walls[1],false,"the wall in the east has been taken down");
	equal(maze.getCell([1,2]).walls[3],false,"the wall in the west has been taken down");
})

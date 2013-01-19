/**
 * Created with JetBrains PhpStorm.
 * User: pdietrich
 * Date: 19.01.13
 * Time: 17:39
 * To change this template use File | Settings | File Templates.
 */

test("Maze init and get", function () {
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

});

test("Maze neighbours", function () {
	var maze = new Maze();
	deepEqual(maze.getNeighbourOf([0,0],1).get("coords"),[0,1],"getNeighbourOf returns neighbour of given direction");
	equal(maze.getNeighbourOf([0,0],3),false,"non existing neighbour returns false");
});

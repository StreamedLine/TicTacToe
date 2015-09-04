var board = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];

var slices = function slices(boardCopy) {
	boardCopy = boardCopy ? boardCopy : board;
	return [
			[ //easier to write to the board when data is represented this way
			[ boardCopy[0], boardCopy[1], boardCopy[2] ],
			[ boardCopy[3], boardCopy[4], boardCopy[5] ],
			[ boardCopy[6], boardCopy[7], boardCopy[8] ],
			
			[ boardCopy[0], boardCopy[3], boardCopy[6] ],
			[ boardCopy[1], boardCopy[4], boardCopy[7] ],
			[ boardCopy[2], boardCopy[5], boardCopy[8] ],
			
			[ boardCopy[0], boardCopy[4], boardCopy[8] ],
			[ boardCopy[6], boardCopy[4], boardCopy[2] ]	
			],
			[ //easier to read the data this way
			boardCopy[0] + boardCopy[1] + boardCopy[2],
			boardCopy[3] + boardCopy[4] + boardCopy[5],
			boardCopy[6] + boardCopy[7] + boardCopy[8],
	
			boardCopy[0] + boardCopy[3] + boardCopy[6],
			boardCopy[1] + boardCopy[4] + boardCopy[7],
			boardCopy[2] + boardCopy[5] + boardCopy[8],
			
			boardCopy[0] + boardCopy[4] + boardCopy[8],
			boardCopy[6] + boardCopy[4] + boardCopy[2]
			],
			[
			[ 0, 1, 2 ],
			[ 3, 4, 5 ],
			[ 6, 7, 8 ],
			
			[ 0, 3, 6 ],
			[ 1, 4, 7 ],
			[ 2, 5, 8 ],
			
			[ 0, 4, 8 ],
			[ 6, 4, 2 ]				
			]
	];
};
function boardSituation(s, boardCopy) {
	boardCopy = boardCopy ? boardCopy : board;
	return (function() {
			var	oneToWin = (function(){
					var i = 0;
					slices(boardCopy)[1].forEach(function(line) {
						if (trimStr(line) == s + s) {i++ };
						// console.log('Seeing: ' + "'" + trimStr(line) + "'");
					});
					return i;
				})(),

				oneToLose = (function(){
					var nots = notS(s);
					var i = 0;
					slices(boardCopy)[1].forEach(function(line) {
						if (trimStr(line) == nots + nots) {i++ };
					});
					return i;
				})(),
				wins = (function(){
					var i = 0;
					slices(boardCopy)[1].forEach(function(line) {
						if (line == s + s + s) {i++ };
						// console.log('seeing ' + line)
					});
					return i;
				})(),
				singles = (function(){
					var i = 0;
					slices(boardCopy)[1].forEach(function(line){
						if (trimStr(line) == s) {i++ };
					});
					return i;
				})(),
				traps = (function(){
					var winP = oneToLose;
					if (winP > 1) {
						return winP - 1;
					} else {
						return 0;
					}
				})();

			return {
				oneToWin: oneToWin,
				oneToLose: oneToLose,
				wins: wins,
				singles: singles,
				traps: traps
			}
		})()
}

function recur(boardCopy, s, plyr1or2, stackWatch) {
	var singles = [0, 1, 2, 3, 4, 5, 6, 7];
	var singleLines = [], temp;
	var index = false, x, y;


	console.log(boardCopy);

	if (boardCopy.indexOf(' ') == -1) {return false }; //if it's full- return

	//if there is a trap return true
	if (boardSituation(s, boardCopy).oneToWin > 1) {
		return plyr1or2;
	}
	if (boardSituation(s, boardCopy).oneToLose > 1) {
		return !plyr1or2;
	}

	//if you must block then block
	if (boardSituation(s, boardCopy).oneToLose == 1) {
		
		//find location
		slices(boardCopy)[1].forEach(function findEmptyLoc(strLine, i){
			if (trimStr(strLine) == notS(s) + notS(s)) {
				index = lineProfile(boardCopy, i, notS(s)).oneEmpty;
				index[1] = lineProfile(boardCopy, i, notS(s)).digitized[index[1]];
			};
		});
		//block
		if (index) {
			boardCopy[index[1]] = s;
			return recur(boardCopy, notS(s), !plyr1or2, stackWatch+1)
		};
	};

	//get list of singles (of s)
	singles = singles.filter(function findSingles(lindex) {
		return lineProfile(boardCopy, lindex, s).oneFull[0] == true; 
	});

	//get all lines associated with above singles and store in a array
	singles.forEach(function(single) {
		singleLines.push(lineProfile(boardCopy, single, s).arr)
	});

	//try the first position within the first line in the array
	for (var i = 0; i < singles.length; i++) {
		for (var j = 0; j < singleLines[i].length; j++) {
			if (singleLines[i][j] == ' ') {
				temp = boardCopy.slice();
				temp[lineProfile(boardCopy, singles[i], s).digitized[j]] = s;
				if (recur(temp, notS(s), !plyr1or2, stackWatch+1)) {return lineProfile(boardCopy, singles[i], s).digitized[j] };
			};
		};
	};
	return false;

	//call recur with the new board and notS() and !plyr1or2

	//if recur returns false then try the next position

	//return the position
}





//= = = == = = == = = == = = == = = == = = == = = == = = =


//removes whitespace from string
function trimStr(str) {
	var len = str.length, newStr=  '';

	str = str.split('');
	for (var i = 0; i < len; i++) {
		if (str[i] !== ' ') {newStr += str[i] };
	}
	return newStr;
}//end


function lineProfile(boardCopy, i, s) {
	//===-->
	var	     trimmedStr = trimStr(slices(boardCopy)[1][i]),
		            arr = slices(boardCopy)[0][i],
			   lineType =(function() {
			   				if (i < 3) {return 0 }; // 0 == horizontal
			   				if (i > 2 && i < 6) {return 1 }; // 1 == vertical
			   				if (i > 5) {return 2 }; // 2 == diagonal
			   			 })(),
		         lrUdXY =(function() {
		         			var digs = slices(boardCopy)[2][i]; //digitized line
		         			var horizAligned = slices(boardCopy)[2]; //digitized horizontaly aligned board is the first 3 arrays of slices(boardCopy)[2]
		         			var results = [[], [], []]; //[[x,y], [x,y], [x,y]]
		         			digs.forEach(function(dig, id) { //takes each digit in the line searches a horizontily aligned index for it. thus retreaving the x and y values
		         				[0,1,2].forEach(function(digY) {
		         					if (horizAligned[digY].indexOf(dig) !== -1) {
		         						results[id].push(horizAligned[digY].indexOf(dig)); //stores the x
		         						results[id].push(digY); //stores the y
		         					};
		         				});
		         			});
		         		 })(),
		      lrUdInner =(function lrUdInner() {
		         			var locs = slices(boardCopy)[1][i];
		         			return [locs[0], locs[1], locs[2] ];
		         		 })(),
		      digitized =(function digitized() {
		         			var locs = slices(boardCopy)[2][i];
		         			return [locs[0], locs[1], locs[2] ];
		         		 })(),
		       oneEmpty =(function oneEmpty() { //[true/false, digit]							       
		       				var line = slices(boardCopy)[0][i];	   //2 of the same symbol  &&  1 empty space
		       				if (line.filter(function(each){return each == s}).length == 2 && line.filter(function(each){return each == ' '}).length == 1) {
		       					return [true, line.indexOf(' ')];
		       				} else {
		       					return [false, -1];
		       				}
		       			 })(),
		       	oneFull =(function oneFull() { //[true/false, digit]							       
		       				var line = slices(boardCopy)[0][i];		     //1 of thesymbol  &&  2 empty spaces
		       				if (line.filter(function(each){return each == s}).length == 1 && line.filter(function(each){return each == ' '}).length == 2) {
		       					return [true, line.indexOf(s)];
		       				} else {
		       					return [false, -1];
		       				}
		       			 })(),		
		     interCross =(function interCross() { //DEVELOPEMENT
		     				var locs = slices(boardCopy[2]);
		     			 })(); 
    //var end.

	return {
		trimmedStr: trimmedStr, //line in the form of a trimmed(no whitespace) string
		arr: arr, //full line in array format
		lineType: lineType, //0, 1 or 2; (horizontal, vertical or diagonal)
		lrUdXY: lrUdXY, //[ [], [], [] ] left to right or up to down
		lrUdInner: lrUdInner, //diagonals are left to right only vertical are up-down. returns the values (x,o,' ') of each space.
		digitized: digitized, //digit associated with location
		oneEmpty: oneEmpty, //true or false and where is the empty one on the line
		oneFull: oneFull, //true or false and where is the full one
		interCross: [, , , , ] // indexes //DEVELOPEMENT
	}
}//end



//===============================================================

//reverse symbol
function notS(s) {
	if (s == 'x') {return 'o'};
	if (s == 'o') {return 'x'};
}

//Print board
function printB() {
	var line = '', boardCopy = slices()[0];
	console.log(' -  -  -  -  -  -  -  -  ');
	[0,1,2].forEach(function(i) {
		[0,1,2].forEach(function(e) {
			line += '  [' + boardCopy[i][e] + ']  ';
		});
		console.log(' ');
		console.log(line);
		line = '';
	});
	console.log(' ');
	console.log(' -  -  -  -  -  -  -  -  ');
}
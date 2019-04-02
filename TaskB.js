process.stdin.resume();

let input= '', readline;

process.stdin.on('data', function(chunk) {
	input+=chunk;
});

process.stdin.on('end', function() {
	input = input.split('\n');

	let inputLineIndex = 0;
	readline = function() {
		return inputLineIndex>=input.length?undefined:input[inputLineIndex++]
	};
	process.exit(main() || 0);
});


function main()
{
	class Parser {

		parsePiece(piece) {
			switch (piece.toLowerCase()) {
				case 'r': return new Rook();
				case 'n': return new Knight();
				case 'q': return new Queen();
				case 'b': return new Bishop();
			}
		}

		parsePosition(position) {
			return new Position(this.parseX(position[0]), this.parseY(position[1]));
		}

		parseX(x) {
			switch (x) {
				case 'a': return 0;
				case 'b': return 1;
				case 'c': return 2;
				case 'd': return 3;
				case 'e': return 4;
				case 'f': return 5;
				case 'g': return 6;
				case 'h': return 7;
			}
		}

		parseY(y) {
			return y - 1;
		}
	}


	class Player {
		constructor(chessProcessor) {
			this.chessProcessor = chessProcessor;
		}

		findMinimalMoves(piece, startPosition, endPosition) {
			let positionQueue = new Queue();
			const testedPositions = {};
			testedPositions[startPosition.toString()] = true;

			positionQueue.enqueue({position: startPosition, moveNumber: 0});
			let currentPosition;

			while ((currentPosition = positionQueue.dequeue()) !== null) {
				if (currentPosition.position.x === endPosition.x && currentPosition.position.y === endPosition.y) {
					return currentPosition.moveNumber;
				}
				const possiblePositions = this.chessProcessor.calculatePositions(piece, currentPosition.position);

				possiblePositions.forEach(position => {
					if (!testedPositions[position.toString()]) {
						testedPositions[position.toString()] = true;
						positionQueue.enqueue({position: position, moveNumber: currentPosition.moveNumber + 1});
					}
				});
			}
			return -1;
		}
	}


	class ChessProcessor {
		constructor(board) {
			this.board = board;
		}

		calculatePositions(piece, position) {
			let positionsAllowed = [];

			piece.getMoveSet().forEach(move => {
				move.forEach(shift => {
					const newPosition = new Position(position.x + shift.x, position.y + shift.y);
					if (this.board.checkPosition(newPosition))
						positionsAllowed.push(newPosition);
				});
			});
			return positionsAllowed;
		}
	}


	class ChessBoard {
		constructor() {
			this.size = 8;
			this.board = new Array(this.size);

			for (let i = 0; i < this.size; i++) {
				this.board[i] = new Array(this.size);
			}
		}

		checkPosition(position) {
			return position.x >= 0 && position.x <= this.size - 1 && position.y >= 0 && position.y <= this.size - 1;
		}
	}


	class Position {
		constructor(x, y) {
			this.x = x;
			this.y = y;
		}

		toString() {
			return `${this.x},${this.y}`;
		}
	}


	class Knight {

		getMoveSet() {
			return [
				[{x: 1, y: 2}],
				[{x: 1, y: -2}],
				[{x: -1, y: 2}],
				[{x: -1, y: -2}],
				[{x: 2, y: 1}],
				[{x: 2, y: -1}],
				[{x: -2, y: 1}],
				[{x: -2, y: -1}]
			];
		}
	}


	class Bishop {

		getMoveSet() {
			return [
				[{x: 1, y: 1}, {x: 2, y: 2}, {x: 3, y: 3}, {x: 4, y: 4}, {x: 5, y: 5}, {x: 6, y: 6}, {x: 7, y: 7}],
				[{x: 1, y: -1}, {x: 2, y: -2}, {x: 3, y: -3}, {x: 4, y: -4}, {x: 5, y: -5}, {x: 6, y: -6}, {x: 7, y: -7}],
				[{x: -1, y: 1}, {x: -2, y: 2}, {x: -3, y: 3}, {x: -4, y: 4}, {x: -5, y: 5}, {x: -6, y: 6}, {x: -7, y: 7}],
				[{x: -1, y: -1}, {x: -2, y: -2}, {x: -3, y: -3}, {x: -4, y: -4}, {x: -5, y: -5}, {x: -6, y: -6}, {x: -7, y: -7}]
			];
		}
	}


	class Rook {

		getMoveSet() {
			return [
				[{x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 4, y: 0}, {x: 5, y: 0}, {x: 6, y: 0}, {x: 7, y: 0}],
				[{x: -1, y: 0}, {x: -2, y: 0}, {x: -3, y: 0}, {x: -4, y: 0}, {x: -5, y: 0}, {x: -6, y: 0}, {x: -7, y: 0}],
				[{x: 0, y: 1}, {x: 0, y: 2}, {x: 0, y: 3}, {x: 0, y: 4}, {x: 0, y: 5}, {x: 0, y: 6}, {x: 0, y: 7}],
				[{x: 0, y: -1}, {x: 0, y: -2}, {x: 0, y: -3}, {x: 0, y: -4}, {x: 0, y: -5}, {x: 0, y: -6}, {x: 0, y: -7}]
			]
		}
	}


	class Queen {

		getMoveSet() {
			return [
				[{x: 1, y: 1}, {x: 2, y: 2}, {x: 3, y: 3}, {x: 4, y: 4}, {x: 5, y: 5}, {x: 6, y: 6}, {x: 7, y: 7}],
				[{x: 1, y: -1}, {x: 2, y: -2}, {x: 3, y: -3}, {x: 4, y: -4}, {x: 5, y: -5}, {x: 6, y: -6}, {x: 7, y: -7}],
				[{x: -1, y: 1}, {x: -2, y: 2}, {x: -3, y: 3}, {x: -4, y: 4}, {x: -5, y: 5}, {x: -6, y: 6}, {x: -7, y: 7}],
				[{x: -1, y: -1}, {x: -2, y: -2}, {x: -3, y: -3}, {x: -4, y: -4}, {x: -5, y: -5}, {x: -6, y: -6}, {x: -7, y: -7}],

				[{x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 4, y: 0}, {x: 5, y: 0}, {x: 6, y: 0}, {x: 7, y: 0}],
				[{x: -1, y: 0}, {x: -2, y: 0}, {x: -3, y: 0}, {x: -4, y: 0}, {x: -5, y: 0}, {x: -6, y: 0}, {x: -7, y: 0}],
				[{x: 0, y: 1}, {x: 0, y: 2}, {x: 0, y: 3}, {x: 0, y: 4}, {x: 0, y: 5}, {x: 0, y: 6}, {x: 0, y: 7}],
				[{x: 0, y: -1}, {x: 0, y: -2}, {x: 0, y: -3}, {x: 0, y: -4}, {x: 0, y: -5}, {x: 0, y: -6}, {x: 0, y: -7}]
			]
		}
	}


	class Queue {
		constructor() {
			this.head = null;
			this.tail = null;
		}

		enqueue(value) {
			const newNode = new QueueNode(value);

			if (this.head === null) {
				this.head = newNode;
				this.tail = newNode;
				return;
			}

			this.tail.next = newNode;
			this.tail = newNode;
		}

		dequeue() {
			if (this.head === null)
				return null;
			const dequeuedNode = this.head;
			this.head = this.head.next;
			return dequeuedNode.value;
		}
	}


	class QueueNode {
		constructor(value) {
			this.value = value;
			this.next = null;
		}
	}


	const line1 = readline().trim().replace('\n', '');
	const line2 = readline().trim().replace('\n', '');

	const parser = new Parser();
	const piece = parser.parsePiece(line1[0]);

	const positions = line2.split('-');

	const from = parser.parsePosition(positions[0]);
	const to = parser.parsePosition(positions[1]);


	const chessBoard = new ChessBoard();

	const chessProcessor = new ChessProcessor(chessBoard);
	const player = new Player(chessProcessor);
	const answer = player.findMinimalMoves(piece, from, to);

	console.log(answer);

}

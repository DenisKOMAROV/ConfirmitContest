process.stdin.resume();

let input= '', readline;

process.stdin.on('data', function(chunk) {
	input+=chunk;
});

process.stdin.on('end', function() {
	input = input.split('\n');

	let inputLineIndex = 0;
	readline = function() {
		return inputLineIndex>=input.length?undefined:input[inputLineIndex++];
	};
	process.exit(main() || 0);
});


function main() {

	class Parser {

		parsePiece(piece, color) {
			switch (piece.toLowerCase()) {
				case 'n': return new Knight(color);
				case 'q': return new Queen(color);
			}
		}

		parsePosition(position) {
			return new Position(this.parseX(position[0]), this.parseY(position[1]));
		}

		parseX(x) {
			switch (x.toLowerCase()) {
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
				const possiblePositions = chessProcessor.calculatePositions(piece, currentPosition.position);

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
				for (let i = 0; i < move.length; i++) {
					const newPosition = new Position(position.x + move[i].x, position.y + move[i].y);
					// check if position is possible at all
					if (this.board.checkPosition(newPosition)) {
						// check if there is a piece in check
						const blocker = this.board.getPiece(newPosition);
						if (blocker) {
							if (blocker.color !== piece.color) {
								positionsAllowed.push(newPosition);
							}
							break;
						}
						positionsAllowed.push(newPosition);
					} else {
						break;
					}
				}
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

		addPiece(piece, position) {
			this.board[position.x][position.y] = piece;
		}

		getPiece(position) {
			return this.board[position.x][position.y];
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


	class Piece {
		constructor(color) {
			this.color = color;
		}
	}


	class Knight extends Piece {
		constructor() {
			super();
		}

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


	class Queen extends Piece {
		constructor() {
			super();
		}

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
	const line3 = readline().trim().replace('\n', '');
	const line4 = readline().trim().replace('\n', '');

	const parser = new Parser();
	const piece = parser.parsePiece(line1[0]);
	const allyColor = 'w';
	const opponentColor = 'b';
	piece.color = allyColor;


	const chessBoard = new ChessBoard();

	const positions = line2.split('-');
	const from = parser.parsePosition(positions[0]);
	const to = parser.parsePosition(positions[1]);

	if (line3 && line3 !== '') {
		const allies = line3.split(',');
		allies.forEach(allyPosition => {
			chessBoard.addPiece(new Piece(allyColor), parser.parsePosition(allyPosition));
		});
	}

	if (line4 && line4 !== '') {
		const opponents = line4.split(',');
		opponents.forEach(opponentPosition => {
			chessBoard.addPiece(new Piece(opponentColor), parser.parsePosition(opponentPosition));
		});
	}

	const chessProcessor = new ChessProcessor(chessBoard);
	const player = new Player(chessProcessor);
	const answer = player.findMinimalMoves(piece, from, to);

	console.log(answer);
}

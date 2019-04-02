class Parser {

	parsePiece(piece) {
		switch (piece.toLowerCase()) {
			case 'n': return new Knight();
			case 'q': return new Queen();
			case 'b': return new Bishop();
			case 'r': return new Rook();
			case 'p': return new Pawn();
			case 'm': return new Maharaja();
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

	findMinimalMoves(board, piece, startPosition, endPosition) {
		let positionQueue = new Queue();
		const testedPositions = {};
		testedPositions[startPosition.toString()] = true;

		positionQueue.enqueue({board: board, position: startPosition, moveNumber: 0});
		let currentPosition;

		while ((currentPosition = positionQueue.dequeue()) !== null) {
			if (currentPosition.position.x === endPosition.x && currentPosition.position.y === endPosition.y) {
				return currentPosition.moveNumber;
			}
			const possiblePositions = chessProcessor.calculatePositions(
				currentPosition.board,
				piece,
				currentPosition.position,
				true);

			possiblePositions.forEach(position => {
				if (!testedPositions[position.toString()]) {
					testedPositions[position.toString()] = true;
					const updatedBoard = currentPosition.board.getCopy();
					updatedBoard.movePiece(currentPosition.position, position);
					positionQueue.enqueue({
						board: updatedBoard,
						position: position,
						moveNumber: currentPosition.moveNumber + 1
					});
				}
			});
		}
		return -1;
	}
}


class ChessProcessor {
	calculatePositions(board, piece, position, inDanger = false) {
		let positionsAllowed = [];

		const dangerousPositions = inDanger ? board.getDangerousPositions(piece.color, this) : {};

		piece.getMoveSet().forEach(move => {
			for (let i = 0; i < move.length; i++) {
				const newPosition = new Position(position.x + move[i].x, position.y + move[i].y);
				if (board.checkPosition(newPosition)) {
					if (!dangerousPositions[newPosition.toString()]) {
						const blocker = board.getPiece(newPosition);
						if (blocker) {
							if (blocker.color !== piece.color) {
								positionsAllowed.push(newPosition);
							}
							break;
						}
						positionsAllowed.push(newPosition);
					}
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

	movePiece(from, to) {
		this.board[to.x][to.y] = this.board[from.x][from.y];
		this.board[from.x][from.y] = null;
	}

	getDangerousPositions(color, chessProcessor) {
		const dangerousPositions = {};

		for (let i = 0; i < this.size; i++) {
			for (let j = 0; j < this.size; j++) {
				const position = new Position(i, j);
				const danger = this.getPiece(position);
				if (danger) {
					if (danger.color !== color) {
						chessProcessor.calculatePositions(this, danger, position).forEach(position => {
								dangerousPositions[position.toString()] = true;
							}
						);
					}
				}
			}
		}

		return dangerousPositions;
	}

	checkPosition(position) {
		return position.x >= 0 && position.x <= this.size - 1 && position.y >= 0 && position.y <= this.size - 1;
	}

	getCopy() {
		const copy = new ChessBoard();

		for (let i = 0; i < this.size; i++) {
			for (let j = 0; j < this.size; j++) {
				copy.board[i][j] = this.board[i][j];
			}
		}

		return copy;
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


class Maharaja extends Piece {
	constructor(color) {
		super(color);
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
			[{x: -2, y: -1}],

			[{x: 1, y: 1}, {x: 2, y: 2}, {x: 3, y: 3}, {x: 4, y: 4}, {x: 5, y: 5}, {x: 6, y: 6}, {x: 7, y: 7}],
			[{x: 1, y: -1}, {x: 2, y: -2}, {x: 3, y: -3}, {x: 4, y: -4}, {x: 5, y: -5}, {x: 6, y: -6}, {x: 7, y: -7}],
			[{x: -1, y: 1}, {x: -2, y: 2}, {x: -3, y: 3}, {x: -4, y: 4}, {x: -5, y: 5}, {x: -6, y: 6}, {x: -7, y: 7}],
			[{x: -1, y: -1}, {x: -2, y: -2}, {x: -3, y: -3}, {x: -4, y: -4}, {x: -5, y: -5}, {x: -6, y: -6}, {x: -7, y: -7}],

			[{x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 4, y: 0}, {x: 5, y: 0}, {x: 6, y: 0}, {x: 7, y: 0}],
			[{x: -1, y: 0}, {x: -2, y: 0}, {x: -3, y: 0}, {x: -4, y: 0}, {x: -5, y: 0}, {x: -6, y: 0}, {x: -7, y: 0}],
			[{x: 0, y: 1}, {x: 0, y: 2}, {x: 0, y: 3}, {x: 0, y: 4}, {x: 0, y: 5}, {x: 0, y: 6}, {x: 0, y: 7}],
			[{x: 0, y: -1}, {x: 0, y: -2}, {x: 0, y: -3}, {x: 0, y: -4}, {x: 0, y: -5}, {x: 0, y: -6}, {x: 0, y: -7}]
		];
	}
}


class Knight extends Piece {
	constructor(color) {
		super(color);
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
			[{x: -2, y: -1}],
		];
	}
}


class Bishop extends Piece {
	constructor() {
		super();
	}

	getMoveSet() {
		return [
			[{x: 1, y: 1}, {x: 2, y: 2}, {x: 3, y: 3}, {x: 4, y: 4}, {x: 5, y: 5}, {x: 6, y: 6}, {x: 7, y: 7}],
			[{x: 1, y: -1}, {x: 2, y: -2}, {x: 3, y: -3}, {x: 4, y: -4}, {x: 5, y: -5}, {x: 6, y: -6}, {x: 7, y: -7}],
			[{x: -1, y: 1}, {x: -2, y: 2}, {x: -3, y: 3}, {x: -4, y: 4}, {x: -5, y: 5}, {x: -6, y: 6}, {x: -7, y: 7}],
			[{x: -1, y: -1}, {x: -2, y: -2}, {x: -3, y: -3}, {x: -4, y: -4}, {x: -5, y: -5}, {x: -6, y: -6}, {x: -7, y: -7}]
		]
	}
}


class Rook extends Piece {
	constructor(color) {
		super(color);
	}

	getMoveSet() {
		return [
			[{x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 4, y: 0}, {x: 5, y: 0}, {x: 6, y: 0}, {x: 7, y: 0}],
			[{x: -1, y: 0}, {x: -2, y: 0}, {x: -3, y: 0}, {x: -4, y: 0}, {x: -5, y: 0}, {x: -6, y: 0}, {x: -7, y: 0}],
			[{x: 0, y: 1}, {x: 0, y: 2}, {x: 0, y: 3}, {x: 0, y: 4}, {x: 0, y: 5}, {x: 0, y: 6}, {x: 0, y: 7}],
			[{x: 0, y: -1}, {x: 0, y: -2}, {x: 0, y: -3}, {x: 0, y: -4}, {x: 0, y: -5}, {x: 0, y: -6}, {x: 0, y: -7}]
		]
	}
}


class Queen extends Piece {
	constructor(color) {
		super(color);
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

class Pawn extends Piece {
	constructor(color) {
		super(color);
	}

	getMoveSet() {
		return this.color === 'w' ?
			[
				[{x: -1, y: 1}],
				[{x: 1, y: 1}]
			]
			:
			[
				[{x: -1, y: -1}],
				[{x: 1, y: -1}]
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
const piece = parser.parsePiece(line1[1]);
const allyColor = line1[0];
const opponentColor = allyColor === 'w' ? 'b' : 'w';
piece.color = allyColor;


const chessBoard = new ChessBoard();

const positions = line2.split('-');
const from = parser.parsePosition(positions[0]);
const to = parser.parsePosition(positions[1]);

if (line3 && line3 !== '') {
	const allies = line3.split(',');
	allies.forEach(ally => {
		const allyPiece = parser.parsePiece(ally[0]);
		allyPiece.color = allyColor;
		const allyPosition = parser.parsePosition(ally.slice(1));
		chessBoard.addPiece(allyPiece, allyPosition);
	});
}

if (line4 && line4 !== '') {
	const opponents = line4.split(',');
	opponents.forEach(opponent => {
		const opponentPiece = parser.parsePiece(opponent[0]);
		opponentPiece.color = opponentColor;
		const opponentPosition = parser.parsePosition(opponent.slice(1));
		chessBoard.addPiece(opponentPiece, opponentPosition);
	});
}

const chessProcessor = new ChessProcessor();
const player = new Player(chessProcessor);
const answer = player.findMinimalMoves(chessBoard, piece, from, to);

console.log(answer);

from flask import Flask, jsonify
from randomizing import gen, print_board
from freeflow import Solver
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/puzzle/', methods=['GET', 'POST'])
def board():
    return jsonify(gen())

def solution(boardId):
    pass
    # return jsonify(Solver.solve(board[boardId]))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001, debug=True)
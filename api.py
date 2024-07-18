from flask import Flask, jsonify
from randomizing import gen, print_board
from freeflow import Solver
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
bd = []

@app.route('/puzzle/', methods=['GET', 'POST'])
def board():
    global bd
    bd = gen()
    return jsonify(bd)

@app.route('/solution/', methods=['GET', 'POST'])
def solution():
    global bd
    print("board is ", bd)
    for j in range(len(bd)):
        for k in range(len(bd[j])):
            if bd[j][k] == 0: bd[j][k] = '.'
    solver = Solver(bd)
    solver.solve()
    return jsonify(solver.board)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001, debug=True)
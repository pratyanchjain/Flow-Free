from flask import Flask, jsonify, request
from randomizing import RandomBoard
from freeflow import Solver
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
bd = []

@app.route('/puzzle/', methods=['GET', 'POST'])
def board():
    if request.method == 'POST':
        print("posting")
        size = request.json.get('size')
        if size is not None and isinstance(size, int):
            print(size)
            b = RandomBoard(size)
            global bd
            bd = b.gen()
            return jsonify(bd)
        else:
            return jsonify("Invalid Input!")

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
    app.run(host='0.0.0.0', port=3003, debug=True)
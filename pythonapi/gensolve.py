from randomizing import gen, print_board
from freeflow import Solver
board = gen()
print_board(board)
print()
for j in range(len(board)):
    for k in range(len(board[j])):
        if board[j][k] == 0:
            board[j][k] = '.'
Solver(board).solve()
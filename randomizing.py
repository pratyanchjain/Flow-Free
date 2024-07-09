import random
import time
ITER = 1000
MINLEN= 3
n = 9

def print_board(board):
    color_map = {
            0: '\033[30m',  
            1: '\033[31m',
            2: '\033[32m',  
            3: '\033[33m',
            4: '\033[34m',
            5: '\033[35m',
            6: '\033[36m',  
            7: '\033[37m',
            8: '\033[30m',  
            9: '\033[31m',
            '.':   '\033[0m',
            }
    for j in range(n):
        for k in range(n):
            print(f"{color_map[board[j][k]]}{board[j][k]}{color_map['.']}", end="")
        print()

def valid_neighbour(i, j):
    ls = [(i+1, j), (i-1, j), (i, j - 1), (i, j + 1)]
    ret = []
    for a, b in ls:
        if a >= 0 and a < n and b >= 0 and b < n:
            ret.append((a, b))
    return ret

board = [['.' for _ in range(n)] for _ in range(n)]
for j in range(n):
    for k in range(n):
        board[j][k] = j + 1
length = []
for j in range(n):
    length.append(n)

tails = [[0 for _ in range(n)] for _ in range(n)]
endpoints = [[] for _ in range(n + 1)]
for j in range(n):
    tails[j][0] = j + 1
    tails[j][-1] = j + 1
    endpoints[j + 1] = [(j, 0), (j, n-1)]



seed = random.randrange(10**9)
rng = random.Random(seed)
print("Seed was:", seed)
random.seed(seed)
# random.seed( 824755430)

# basically there are two things that can happen
# 1. the endpoint extended ends up being adjacent to its other endpoint
# 2. The endpoint being shrunk cannot end up being adjacent to its other endpoint
# because we are asserting that MINLEN = 3

# because a lot of cancellation happens try and avoid the last move
# for that also lets choose flows by random

# key takeaway is to achieve good randomization keep high iterations
# but more importantly choose flows at random.
# this way you dont have to keep track of the last moves also
# and repeatability and move cancellation gets reduced apparently
# by a good amount

last = [set() for _ in range(n + 1)]
for _ in range(ITER):
    for flow in [random.randint(1, n)]:
        for a, b in endpoints[flow]:
            nb = valid_neighbour(a, b)
            ls = []
            for c, d in nb:
                # first check if it is an endpoint from another flow
                if tails[c][d] and length[tails[c][d] - 1] > MINLEN and tails[c][d] != flow:
                    # extending the current flow shouldnt make it adjacent to more than one of its colors
                    pos = True
                    newx, newy = (-1, -1)
                    cntflow = 0
                    for x, y in valid_neighbour(c, d):
                        if (x, y) != (a, b):
                            if board[x][y] == flow:
                                cntflow += 1
                        # if tails[x][y] == tails[c][d]:
                        #     pos = False
                        #     break
                        if board[x][y] == board[c][d]:
                            newx, newy = x, y
                    if pos and cntflow == 0:
                        assert newx != -1 and newy != -1
                        ls.append((c, d, newx, newy))
            if ls:
                idx = random.randint(0, len(ls) - 1)
                c, d, newx, newy = ls[idx]
                length[flow - 1] += 1
                length[tails[c][d] - 1] -= 1
                movedcolor = tails[c][d]
                board[c][d] = board[a][b]
                tails[c][d] = tails[a][b]
                tails[a][b] = 0
                tails[newx][newy] = movedcolor
                endpoints[flow].remove((a, b))
                endpoints[flow].insert(0, (c, d))
                endpoints[movedcolor].remove((c, d))
                endpoints[movedcolor].insert(0, (newx, newy))
                sm = 0
                for j in range(n):
                    sm += n - tails[j].count(0)
                assert sm == n * 2

print_board(board)

print()

print_board(tails)
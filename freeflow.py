# solving free flow with a sat solver

# what are the requirements to solve this puzzle?

# basically I have n cells and c colors that I can predetermine from the puzzle

# 1. each cell must have a color so at least one and no two colors must be true

# 2. endpoint cells will have predetermined colors which will be set to true

# 3. endpoints must be connected thats the whole puzzle. To enforce this,
# we say that each endpoint must be adjacent to exactly one cell of same colour
# and that each non endpoint cell must be adjacent to exactly 2 of the same colour
# which means they terminate at the endpoints
from itertools import combinations
import pycosat
from tabulate import tabulate
import os
import time


def findcolors():
    st = set()
    for j in range(n):
        for k in range(n):
            st.add(board[j][k])
    st.remove(".")
    for i, j in enumerate(st):
        colors[j] = i
        revcolors[i] = j

def endpoints():
    exp = []
    for j in range(n):
        for k in range(n):
            if board[j][k] != ".":
                exp.append([booleans[j][k][colors[board[j][k]]]])
                for x in range(c):
                    if x != colors[board[j][k]]:
                        exp.append([-booleans[j][k][x]])
    return exp

def distinctcolor():
    exp = []
    for j in range(n):
        for k in range(n):
            sub = []
            for l in range(c):
                sub.append(booleans[j][k][l])
            exp.append(sub)
            for l in range(c):
                for x in range(l+1, c):
                    sub = []    
                    sub.append(-booleans[j][k][l])
                    sub.append(-booleans[j][k][x])
                    exp.append(sub)
    return exp

def valid_neighbour(i, j):
    ls = [(i+1, j), (i-1, j), (i, j - 1), (i, j + 1)]
    ret = []
    for a, b in ls:
        if a >= 0 and a < n and b >= 0 and b < n:
            ret.append((a, b))
    return ret

def flow():
    def exactly2neighbours(i, j, color):
        nb = valid_neighbour(i, j)
        # if len(nb) == 2:
        cmb = combinations(nb, len(nb)-1)
        cmb1 = combinations(nb, 3)
        exp = [[booleans[i][j][color]]]
        for x in cmb:
            sb = []
            for a, b in x:
                sb.append(booleans[a][b][color])
            exp.append(sb)
        
        for x in cmb1:
            sb = []
            for a, b in x:
                sb.append(-booleans[a][b][color])
            exp.append(sb)
        return exp
    
    def transcribe(exp):
        st = set()
        for j in exp:
            for x in j:
                st.add(abs(x))
        st = list(st)
        new = []
        for j in exp:
            new.append("(")
            for x in j:
                if x < 0:
                    new.append("not")
                new.append(chr(97 + st.index(abs(x))))
                new.append("or")
            new.pop()
            new.append(")")
            new.append("and")
        new.pop()
        print(" ".join([x for x in new]))

    def auxvar(exp):
        global varnum
        varnum += 1
        aux = varnum
        impl1 = [[-aux] + j for j in exp]
        if len(exp) == 2:
            impl2 = [aux]
            for j in exp:
                impl2.append(-j[0])
            impl1.append(impl2)
            return impl1
        impl2 = []
        # after simplifying the second implication we get
        auxls = []
        for j in exp: 
            varnum += 1
            subaux = varnum
            auxls.append(subaux)
            sbimpl = [j + [subaux]]
            ls = [[-subaux, -x] for x in j]
            sbimpl.extend(ls)
            impl2.extend(sbimpl)
        auxls.append(aux)
        impl2.append(auxls)
        impl1.extend(impl2)
        return impl1


    exp = []
    # every endpoint must be connected to exactly one adjacent cell of the same color
    for j in range(n):
        for k in range(n):
            if board[j][k] != ".":
                val = colors[board[j][k]]
                nb = valid_neighbour(j, k)
                sb = []
                for a, b in nb:
                    sb.append(booleans[a][b][val])
                exp.append(sb)
                for x in combinations(nb, 2):
                    sb = []
                    for a, b in x:
                        sb.append(-booleans[a][b][val])
                    exp.append(sb)
            else:
                auxiliary = []
                for color in range(c):
                    auxiliary.append(varnum + 1)
                    exp.extend(auxvar(exactly2neighbours(j, k, color)))
                exp.append(auxiliary)
    return exp

def print_board(solve):
    if solve == "UNSAT" or solve == "UNKNOWN":
        print(solve)
    else:
        color_map = {
            'A': '\033[34m',  # Blue
            'B': '\033[32m',  # Green
            'C': '\033[31m',  # Red
            'D': '\033[33m',  # Yellow
            'E': '\033[35m',  # Magenta
            'F': '\033[36m',  # Cyan
            'G': '\033[37m',  # White/Gray
            'H': '\033[97m',  # Bright White
            'I': '\033[34m',  # Navy
            'J': '\033[35m',  # Purple
            'K': '\033[32m',  # Olive (Green)
            'L': '\033[31m',  # Maroon
            'M': '\033[33m',  # Orange (Yellow)
            'N': '\033[36m',  # Teal
            'O': '\033[30m',   # Black,
            'P': '\033[90m',  # Cyan
            'Q': '\033[91m',  # White/Gray
            'R': '\033[92m',  # Bright White
            'S': '\033[93m',  # Navy
            'T': '\033[94m',  # Purple
            'U': '\033[95m',  # Olive (Green)
            'V': '\033[88m',  # Maroon
            'W': '\033[87m',  # Orange (Yellow)
            'X': '\033[86m',  # Teal
            'Y': '\033[85m',   # Black,
            'Z': '\033[84m',   # Black,
            'a': '\033[34m',  # Blue
            'b': '\033[32m',  # Green
            'c': '\033[31m',  # Red
            'd': '\033[33m',  # Yellow
            'e': '\033[35m',  # Magenta
            'f': '\033[36m',  # Cyan
            'g': '\033[37m',  # White/Gray
            'h': '\033[97m',  # Bright White
            'i': '\033[34m',  # Navy
            'j': '\033[35m',  # Purple
            'k': '\033[32m',  # Olive (Green)
            'l': '\033[31m',  # Maroon
            'm': '\033[33m',  # Orange (Yellow)
            'n': '\033[36m',  # Teal
            'o': '\033[30m',   # Black,
            'p': '\033[90m',  # Cyan
            'q': '\033[91m',  # White/Gray
            'r': '\033[92m',  # Bright White
            's': '\033[93m',  # Navy
            't': '\033[94m',  # Purple
            'u': '\033[95m',  # Olive (Green)
            'v': '\033[88m',  # Maroon
            'w': '\033[87m',  # Orange (Yellow)
            'x': '\033[86m',  # Teal
            'y': '\033[85m',   # Black,
            'z': '\033[84m',   # Black,
            'ENDC': '\033[0m'
        }

        for j in range(n * n * c):
            if solve[j] > 0:
                cellno = j//c
                row =cellno//n
                col = cellno % n
                board[row][col] = revcolors[j%c]
        for j in board:
            for x in j:
                print(f"{color_map[x]}{x}", end="")
            print()

stats = [["file", "# SAT Vars", "# Clauses", "time"]]
for filename in sorted(os.listdir("puzzles")):
    file = os.path.join("puzzles", filename)
    with open(file) as file:
        start = time.time()
        board = file.readlines()
        for j in range(len(board)):
            board[j] = [x for x in board[j]]
            board[j].pop()
        try:

            colors = {}
            revcolors = {}
            n = len(board)
            findcolors()
            c = len(colors)
            booleans = [[[l + k * c + j * c * n + 1 for l in range(c)] for k in range(n)] for j in range(n)]
            varnum = booleans[-1][-1][-1]
            clauses = []

            clauses.extend(distinctcolor())
            clauses.extend(endpoints())
            clauses.extend(flow())

            solve = pycosat.solve(clauses)

            # print("Solution for ", filename)

            print_board(solve)

            end = time.time()
            
            # print("total time taken: ", end - start)

            # print("Variables used", varnum)

            # print("Clauses: ", len(clauses))

            stats.append([filename, varnum, len(clauses), end-start])
        except:
            print("error occurred in ", filename)
            break
print(tabulate(stats))
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
import time
class Solver():
    def __init__(self, board) -> None:
        self.board = board
        self.colors = {}
        self.revcolors = {}
        self.booleans = []
        self.n = len(board)
        self.c = 0
        self.varnum = 0

    def solve(self):
        start = time.time()
        self.findcolors()
        self.varnum = self.booleans[-1][-1][-1]
        clauses = []
        clauses.extend(self.distinctcolor())
        clauses.extend(self.endpoints())
        clauses.extend(self.flow())

        solve = pycosat.solve(clauses)

        # print("Solution for ", filename)

        self.print_board(solve)

        end = time.time()

        print("total time taken: ", end - start)

        print("Variables used", self.varnum)

        print("Clauses: ", len(clauses))


    def findcolors(self):
        st = set()
        for j in range(self.n):
            for k in range(self.n):
                st.add(self.board[j][k])
        if "." in st:
            st.remove(".")
        for i, j in enumerate(st):
            self.colors[j] = i
            self.revcolors[i] = j
        self.c = len(self.colors)
        self.booleans = [[[l + k * self.c + j * self.c * self.n + 1 for l in range(self.c)] for k in range(self.n)] for j in range(self.n)]

    def endpoints(self):
        exp = []
        for j in range(self.n):
            for k in range(self.n):
                if self.board[j][k] != ".":
                    exp.append([self.booleans[j][k][self.colors[self.board[j][k]]]])
                    for x in range(self.c):
                        if x != self.colors[self.board[j][k]]:
                            exp.append([-self.booleans[j][k][x]])
        return exp
    
    def distinctcolor(self):
        exp = []
        for j in range(self.n):
            for k in range(self.n):
                sub = []
                for l in range(self.c):
                    sub.append(self.booleans[j][k][l])
                exp.append(sub)
                for l in range(self.c):
                    for x in range(l + 1, self.c):
                        sub = []
                        sub.append(-self.booleans[j][k][l])
                        sub.append(-self.booleans[j][k][x])
                        exp.append(sub)
        return exp

    def valid_neighbour(self, i, j):
        ls = [(i+1, j), (i-1, j), (i, j - 1), (i, j + 1)]
        ret = []
        for a, b in ls:
            if a >= 0 and a < self.n and b >= 0 and b < self.n:
                ret.append((a, b))
        return ret

    def flow(self):
        def exactly2neighbours(i, j, color):
            nb = self.valid_neighbour(i, j)
            # if len(nb) == 2:
            cmb = combinations(nb, len(nb)-1)
            cmb1 = combinations(nb, 3)
            exp = [[self.booleans[i][j][color]]]
            for x in cmb:
                sb = []
                for a, b in x:
                    sb.append(self.booleans[a][b][color])
                exp.append(sb)
            
            for x in cmb1:
                sb = []
                for a, b in x:
                    sb.append(-self.booleans[a][b][color])
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
            self.varnum += 1
            aux = self.varnum
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
                self.varnum += 1
                subaux = self.varnum
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
        for j in range(self.n):
            for k in range(self.n):
                if self.board[j][k] != ".":
                    val = self.colors[self.board[j][k]]
                    nb = self.valid_neighbour(j, k)
                    sb = []
                    for a, b in nb:
                        sb.append(self.booleans[a][b][val])
                    exp.append(sb)
                    for x in combinations(nb, 2):
                        sb = []
                        for a, b in x:
                            sb.append(-self.booleans[a][b][val])
                        exp.append(sb)
                else:
                    auxiliary = []
                    for color in range(self.c):
                        auxiliary.append(self.varnum + 1)
                        exp.extend(auxvar(exactly2neighbours(j, k, color)))
                    exp.append(auxiliary)
        return exp

    def print_board(self, solve):
        if solve == "UNSAT" or solve == "UNKNOWN":
            print(solve)
        else:
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
                }
            for j in range(self.n * self.n * self.c):
                if solve[j] > 0:
                    cellno = j // self.c
                    row = cellno // self.n
                    col = cellno % self.n
                    self.board[row][col] = self.revcolors[j % self.c]

            # for row in self.board:
            #     for x in row:
            #         print(f"{color_map[x]}{x}", end="")
            #     print()

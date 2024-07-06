import pycosat

def oneineachcol():
    exp = []
    for j in range(n):
        sb = []
        for k in range(n):
            sb.append(cnf[k][j])
            for l in range(k + 1, n):
                subexp = []
                subexp.append(-cnf[k][j])
                subexp.append(-cnf[l][j])
                exp.append(subexp)
        exp.append(sb)
    return exp

def oneineachrow():
    exp = []
    for j in range(n):
        sb = []
        for k in range(n):
            sb.append(cnf[j][k])
            for l in range(k + 1, n):
                subexp = []
                subexp.append(-cnf[j][k])
                subexp.append(-cnf[j][l])
                exp.append(subexp)
        exp.append(sb)
    return exp

def atmostoneineachdiagonal():
    exp = []
    for j in range(n-1, -1, -1):
        subexp = []
        for k in range(n-j):
            subexp.append(cnf[j+k][k])
        for k in range(len(subexp)):
            for l in range(k + 1, len(subexp)):
                sb = []
                sb.append(-subexp[k])
                sb.append(-subexp[l])
                exp.append(sb)
    for j in range(n):
        subexp = []
        for k in range(n-j):
            subexp.append(cnf[k][k+j])
        for k in range(len(subexp)):
            for l in range(k + 1, len(subexp)):
                sb = []
                sb.append(-subexp[k])
                sb.append(-subexp[l])
                exp.append(sb)

    for j in range(n-1, -1, -1):
        subexp = []
        for k in range(n-j):
            subexp.append(cnf[n-1-j-k][k])
        for k in range(len(subexp)):
            for l in range(k + 1, len(subexp)):
                sb = []
                sb.append(-subexp[k])
                sb.append(-subexp[l])
                exp.append(sb)
    for j in range(n):
        subexp = []
        for k in range(n-j):
            subexp.append(cnf[n-k-1][k+j])
        for k in range(len(subexp)):
            for l in range(k + 1, len(subexp)):
                sb = []
                sb.append(-subexp[k])
                sb.append(-subexp[l])
                exp.append(sb)
    return exp
n = 5

cnf = [[k * n + j + 1 for j in range(n)] for k in range(n)]

clauses = []

clauses.extend(oneineachcol())

clauses.extend(oneineachrow())

clauses.extend(atmostoneineachdiagonal())
# print
sol = pycosat.solve(clauses) 
print(sol)
if sol == "UNSAT" and sol == "UNKNOWN":
    print(sol)
else:
    ans = [["." for _ in range(n)] for _ in range(n)]
    for j in range(n):
        for k in range(n):
            if sol[k * n + j] > 0:
                ans[j][k] = "Q"
    for j in ans:
        print(*j)

# ok so for starters lets try and solve the n queens problem using a SAT solver

# we know how to solve it by brute force

# lets compare runtimes ig

# basically the problem statements is to figure out if there exists a configuration of n queens on a n x n chess board
# such that no two queens attack each other
# so there are n cells
# each row, column, and diagonal must contain at most one queen and there must be exactly n queens in total
# how do you express this as a boolean logical expression
# I can write the logic for one in each row and col
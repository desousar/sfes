const sub = (a, b) => {
  return a - b;
};
const mult = (a, b) => {
  return a * b;
};
const div = (a, b) => {
  return a / b;
};

export default class Matrix {
  constructor({ ary, row, column }) {
    this.row = row !== undefined ? row : ary.length;
    this.column = column !== undefined ? column : ary[0].length;
    this.mtx = ary !== undefined ? ary : this.initZeros();
  }

  initZeros() {
    this.mtx = [];
    for (let i = 0; i < this.row; ++i) {
      this.mtx.push(new Array(this.column).fill(0));
    }
    return this.mtx;
  }

  set(row, col, value) {
    this.mtx[row][col] = value;
  }
  get(row, col) {
    return this.mtx[row][col];
  }

  print(msg) {
    console.log('======' + msg + '=========');
    console.log('rows', this.row, 'and cols', this.column);
    for (let i = 0; i < this.row; ++i) {
      let line = '';
      for (let j = 0; j < this.column; ++j) {
        line += this.mtx[i][j] + ', ';
      }
      console.log(line);
    }
    console.log('==========================');
  }
  deepCopy() {
    return Object.assign(
      Object.create(Object.getPrototypeOf(this)),
      JSON.parse(JSON.stringify(this))
    );
  }

  toReducedRowEchelonForm() {
    console.log('--##########--ReducedRowEchelonForm--##########--');
    let lead = 0;
    for (let r = 0; r < this.row; r++) {
      if (this.column <= lead) {
        this.rank = this.row;
        for (let i = 0; i < this.row; i++) {
          if (this.mtx[i].every((item) => item === 0)) {
            this.rank--;
          }
        }
        return this;
      }
      let i = r;
      while (this.mtx[i][lead] == 0) {
        i++;
        if (this.row == i) {
          i = r;
          lead++;
          if (this.column == lead) {
            this.rank = this.row;
            for (let i = 0; i < this.row; i++) {
              if (this.mtx[i].every((item) => item === 0)) {
                this.rank--;
              }
            }
            return this;
          }
        }
      }

      let tmp = this.mtx[i];
      this.mtx[i] = this.mtx[r];
      this.mtx[r] = tmp;

      let val = this.mtx[r][lead];
      for (let j = 0; j < this.column; j++) {
        this.mtx[r][j] = div(this.mtx[r][j], val);
      }

      for (let i = 0; i < this.row; i++) {
        if (i == r) continue;
        val = this.mtx[i][lead];
        for (let j = 0; j < this.column; j++) {
          this.mtx[i][j] = sub(this.mtx[i][j], mult(val, this.mtx[r][j]));
        }
      }
      lead++;
    }
    this.rank = this.row;
    return this;
  }

  /*-----------Gauss Elimination Function in Class-----------*/

  diagonalize() {
    let m = this.row;
    let n = this.column;
    for (let k = 0; k < Math.min(m, n); ++k) {
      // Find the k-th pivot
      let i_max = this.findPivot(k);
      if (this.mtx[(i_max, k)] == 0) throw 'matrix is singular';
      this.swap_rows(k, i_max);
      // Do for all rows below pivot
      for (let i = k + 1; i < m; ++i) {
        // Do for all remaining elements in current row:
        let c = div(this.mtx[i][k], this.mtx[k][k]);
        for (let j = k + 1; j < n; ++j) {
          this.mtx[i][j] = sub(this.mtx[i][j], mult(this.mtx[k][j], c));
        }
        // Fill lower triangular matrix with zeros
        this.mtx[i][k] = 0;
      }
    }
  }
  findPivot(k) {
    let i_max = k;
    for (let i = k + 1; i < this.row; ++i) {
      if (Math.abs(this.mtx[i][k]) > Math.abs(this.mtx[i_max][k])) {
        i_max = i;
      }
    }
    return i_max;
  }
  swap_rows(i_max, k) {
    if (i_max != k) {
      let temp = this.mtx[i_max];
      this.mtx[i_max] = this.mtx[k];
      this.mtx[k] = temp;
    }
  }

  makeAug(b) {
    for (let i = 0; i < this.row; ++i) {
      this.mtx[i].push(b.mtx[i][0]);
    }
    this.column++;
  }

  substitute() {
    let m = this.row;
    for (let i = m - 1; i >= 0; --i) {
      let x = div(this.mtx[i][m], this.mtx[i][i]);
      for (let j = i - 1; j >= 0; --j) {
        this.mtx[j][m] = sub(this.mtx[j][m], mult(x, this.mtx[j][i]));
        this.mtx[j][i] = 0;
      }
      this.mtx[i][m] = x;
      this.mtx[i][i] = 1;
    }
  }

  extractX() {
    let x = [];
    let m = this.row;
    let n = this.column - 1;
    for (let i = 0; i < m; ++i) {
      if (Object.is(this.mtx[i][n], -0)) {
        x.push([0]);
      } else {
        x.push([this.mtx[i][n]]);
      }
    }
    return x;
  }

  solve(b) {
    console.log('--##########--Gauss Elimination--##########--');
    this.print('A');
    b.print('b');
    this.print('A');
    this.makeAug(b);
    this.print('Aug');
    this.diagonalize();
    this.print('diag');
    this.substitute();
    this.print('subst');
    let x = new Matrix({
      ary: this.extractX()
    });
    console.log('*******************');
    x.mtx.forEach((n) => {
      n[0] = parseFloat(n[0]).toFixed(6);
    });
    //x.print("x");
    return x;
  }
}

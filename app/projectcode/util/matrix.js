/**
 * 2x2 matrix math only!
 * matricies are expected to be 2d arrays.
 */
export default class Matrix {

  static determinant(m) {
      let a, b, c, d;
      [[a, b], [c, d]] = m;
      return (a * d) - (b * c);
  }

  /**
   * inverse of a 2x2 matrix is
   * [  d, -b ] * 1 / determinant
   * [ -c,  a ]
   */
  static inverse(m) {
    const inverseDeterminant = 1 / (Matrix.determinant(m));
    let a, b, c, d;
    [[a, b], [c, d]] = m;
    return [[inverseDeterminant * d, -1 * inverseDeterminant * b], [-1 * inverseDeterminant * c, inverseDeterminant * a]];
  }

  /**
   * [ a1a2+b1c2, a1b2+b1d2 ]
   * [ c1a2+d1c2, c1b2+d1d2 ]
   */
  static multiply(m1, m2) {
    let a1, b1, c1, d1, a2, b2, c2, d2;
    [[a1, b1], [c1, d1]] = m1;
    [[a2, b2], [c2, d2]] = m2;

    return [
      [(a1 * a2) + (b1 * c2), (a1 * b2) + (b1 * d2)],
      [(c1 * a2) + (d1 * c2), (c1 * b2) + (d1 * d2)]
    ];
  }
}

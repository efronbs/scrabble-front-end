import UiComponent from './ui-component';
import MathExtended from '../../../util/math-extended';
import Matrix from '../../../util/matrix';

const origin = {x: 0, y: 0};
const initialRotation = Math.PI / 2;

/**
 * Matrix to correct rotation direction for inverted y axis.
 *
 * [ -1, 0 ]
 * [  0, 1 ]
 */
const correctionMatrix = [[-1, 0],[0, 1]];

export default class ArrowComponent extends UiComponent {

  static lineThickness = 2;

  // ROTATION IS IN DEGREES
  constructor(x, y, squareSize, rotation = 0) {
    super();

    //debugging
    this.done = false;

    // state information
    this.x = x;
    this.y = y;
    this.basePoint = {x: this.x, y: this.y};
    this.squareSize = squareSize;
    this.rawRotation = ((Math.PI * rotation) / 180);
    this.adjustedRotation = this.rawRotation - initialRotation;

    // mutable state
    this.direction = 1;
    this.animationMillis = 500;
    this.animationDirection = 1;
    this.animationProgress = 1;
    this.animationPathLength = this.squareSize * .5;
    this.currentPoints = this.rotatedPoints;

    // points for drawing
    this.rotationMatrix = this.buildRotationMatrix();
    this.correctedRotationMatrix = Matrix.multiply(correctionMatrix, this.rotationMatrix);

    this.inverseCorrectedRotationMatrix = Matrix.inverse(this.correctedRotationMatrix);

    const init = this.buildPointMap();
    const rot = this.applyRotation(init, this.correctedRotationMatrix);

    this.unrotatedPoints = init;
    this.rotatedPoints = rot;
    this.animationDistance = this.initializeAnimationPath();

    this.unrotatedClickBox = this.setupClickBox();
  }

  getId() {
    return this.constructor.name + this.x + this.y + this.squareSize;
  }

  containsPoint(x, y) {

    const rotated = this.applyRotation({p: {x: x, y: y}}, this.inverseCorrectedRotationMatrix).p;``

    // console.log('clickable box: ');
    // console.log(this.unrotatedClickBox);

    return rotated.x >= this.unrotatedClickBox.x1
            && rotated.x <= this.unrotatedClickBox.x2
            && rotated.y >= this.unrotatedClickBox.y1
            && rotated.y <= this.unrotatedClickBox.y2;
  }

  // ******************
  // * Initialization *
  // ******************

  // TODO break this up into smaller functions
  buildPointMap() {
    // initial position of arrow is "up"
    let result = {};

    // *****************************
    // * initial sizing and points *
    // *****************************

    // y calculations
    // calculated from top of square
    let topOffset = this.squareSize * .9;
    let bottomOffset = this.squareSize * .1
    // calculated from top of arrow
    let innerTipOffset = .333 * (topOffset - bottomOffset);

    let topY = this.y - topOffset;
    let bottomY = this.y - bottomOffset;
    let innerTipY = this.y - bottomOffset - innerTipOffset;

    // x calculation
    let sideOffset = this.squareSize * .4;

    let leftSideX = this.x - sideOffset;
    let rightSideX = this.x + sideOffset;

    // points for extremes. drawing lines between these makes all arrow edges sharp
    let p1 = {x: this.x, y: topY};
    let p2 = {x: leftSideX, y: bottomY};
    let p3 = {x: this.x, y: innerTipY};
    let p4 = {x: rightSideX, y: bottomY};
    let p5 = {x: this.x, y: topY};

    // *******************
    // * shrink for arcs *
    // *******************
    // shrink the line segments between the extreme points. keep extremes as "tangent"
    // points to guide arc
    result['p1'] = this.findPointOnLineForPercentage(p1, p2, .1);
    result['p2'] = this.findPointOnLineForPercentage(p1, p2, .8);
    result['p3'] = this.findPointOnLineForPercentage(p2, p3, .2);
    result['p4'] = p3;
    result['p5'] = this.findPointOnLineForPercentage(p3, p4, .8);
    result['p6'] = this.findPointOnLineForPercentage(p4, p1, .2);
    result['p7'] = this.findPointOnLineForPercentage(p4, p1, .9);

    // guiding tangets and associated radii
    const arcAngle = (45 * Math.PI) / 180;
    result['t1'] = p2;
    // result['r1'] = this.findRadiusForPointsAndAngle(result['p2'], result['p3'], arcAngle);

    result['t2'] = p4;
    // result['r2'] = this.findRadiusForPointsAndAngle(result['p5'], result['p6'], arcAngle);

    result['t3'] = p1;
    // result['r3'] = this.findRadiusForPointsAndAngle(result['p7'], result['p1'], arcAngle);

    return result;
  }

  /**
  *  2D rotaion matrix
  *  [ cos(t)  -sin(t) ]
  *  [ sin(t)  cos(t)  ]
  * second matrix corrects rotational direction for inverted y axis
  */
  buildRotationMatrix() {
    return [
      [Math.cos(this.adjustedRotation), -1 * Math.sin(this.adjustedRotation)],
      [Math.sin(this.adjustedRotation), Math.cos(this.adjustedRotation)]
    ];
  }

  initializeAnimationPath() {
    const tipOfArrow = this.rotatedPoints.t3;
    const angle = this.rawRotation;

    const distanceComponents = {
      x: this.animationPathLength * Math.cos(angle),
      y: -1 * this.animationPathLength * Math.sin(angle) // axis is switched for y; down is positive up is negative
    };

    return distanceComponents
  }

  setupClickBox() {
    const xValues = Object.values(this.unrotatedPoints).map(p => p.x);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);

    const yValues = Object.values(this.unrotatedPoints).map(p => p.y);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);

    return {
      x1: minX,
      // when UNROTATED, animation does not move in x direction
      x2: maxX,
      // y direction is reversed
      y1: minY - this.animationPathLength,
      y2: maxY,
    }
  }

  /**
   * finds the point that is "percentage" into the line segmenet p1p2.
   */
  findPointOnLineForPercentage(p1, p2, percentage) {
    // first find length of x & y
    let a = p2.x - p1.x;
    let b = p2.y - p1.y;
    // angle of the triangle made
    let angle = Math.atan(Math.abs(b / a));
    // length of hypotenuse
    let c = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
    // scale hypotenuse by percentage
    let cPrime = percentage * c;
    // find the new x and y centered at the origin
    let aPrime = cPrime * Math.cos(angle);
    let bPrime = cPrime * Math.sin(angle);
    // finally, translate back to original location and return point
    return {
      x: p1.x + (Math.sign(a) * aPrime),
      y: p1.y + (Math.sign(b) * bPrime)
    };
  }

  // angle is in RADS
  findRadiusForPointsAndAngle(p1, p2, angle) {
    const d = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    return d / (2 * Math.sin(angle / 2));
  }


  applyRotation(points, rotationMatrix, debug = false) {
    let result = {};
    for (const key in points) {

      const originalPoint = points[key];
      const translatedToOrigin = this.translateAxis(this.basePoint, origin, originalPoint);
      const rotatedAtOrigin = this.rotatePoint(translatedToOrigin, rotationMatrix);
      const translatedBack = this.translateAxis(origin, this.basePoint, rotatedAtOrigin);

      if (debug) {
        console.log('point being rotated around: ' + this.basePoint.x + ', ' + this.basePoint.y);
        console.log('point before rotation: ' + originalPoint.x + ', ' + originalPoint.y);
        console.log('translation to origin: ' + translatedToOrigin.x + ', ' + translatedToOrigin.y);
        console.log('rotated: ' + rotatedAtOrigin.x + ', ' + rotatedAtOrigin.y);
        console.log('translated back (final point): ' + translatedBack.x + ', ' + translatedBack.y);
      }

      result[key] = translatedBack;
    }

    return result;
  }

  translateAxis(currentCenterPoint, targetCenterPoint, pointToTranslate) {
    let xTranslation = targetCenterPoint.x - currentCenterPoint.x;
    let yTranslation= targetCenterPoint.y - currentCenterPoint.y;
    return {x: pointToTranslate.x + xTranslation, y: pointToTranslate.y + yTranslation};
  }

  /**
   * Rotates the point using the precomputed rotation matrix.
   *
   * note, because canvas inverses y direction, we are multiplying the rotation matrix by
   * [ -x ]
   * [ y  ]
   *
   * Inverted y axis causes rotation to occur in opposite direction, corrected by
   * multiplying result of rotations x value by -1.
   */
  rotatePoint(point, rotationMatrix) {
    return {
      x: (point.x * rotationMatrix[0][0] + point.y * rotationMatrix[0][1]),
      y: (point.x * rotationMatrix[1][0] + point.y *  rotationMatrix[1][1])
    };
  }

  // ***********
  // * drawing *
  // ***********

  /**
   * Applies the translation for the animation
   */
  step(timeDelta) {
    const signedTimeDelta = this.direction * timeDelta;
    this.animationProgress = MathExtended.clamp(this.animationProgress + signedTimeDelta, 0, this.animationMillis);
    const animationPercentage = this.animationProgress / this.animationMillis;

    const interpolatedTranslate = {
      x: this.animationDistance.x * animationPercentage,
      y: this.animationDistance.y * animationPercentage
    };

    this.currentPoints = this.translateBy(this.rotatedPoints, interpolatedTranslate);

    if (this.animationProgress == 0 || this.animationProgress == this.animationMillis) {
      this.direction *= -1;
    }
  }

  draw(ctx) {
    ctx.lineWidth = ArrowComponent.lineThickness;
    ctx.strokeStyle = "blue";
    ctx.fillStyle = "green";

    ctx.beginPath();

    // performing final drawing
    ctx.moveTo(this.currentPoints.p1.x, this.currentPoints.p1.y);
    ctx.lineTo(this.currentPoints.p2.x, this.currentPoints.p2.y);
    ctx.quadraticCurveTo(this.currentPoints.t1.x, this.currentPoints.t1.y, this.currentPoints.p3.x, this.currentPoints.p3.y);
    ctx.lineTo(this.currentPoints.p4.x, this.currentPoints.p4.y);
    ctx.lineTo(this.currentPoints.p5.x, this.currentPoints.p5.y);
    ctx.quadraticCurveTo(this.currentPoints.t2.x, this.currentPoints.t2.y, this.currentPoints.p6.x, this.currentPoints.p6.y);
    ctx.lineTo(this.currentPoints.p7.x, this.currentPoints.p7.y);
    ctx.quadraticCurveTo(this.currentPoints.t3.x, this.currentPoints.t3.y, this.currentPoints.p1.x, this.currentPoints.p1.y);

    ctx.fill();
    ctx.stroke();

    // this.renderPoint(ctx, this.x, this.y);
    // this.renderClickBox(ctx);
  }

  renderPoint(ctx, centerX, centerY) {
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(centerX, centerY, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  }

  renderClickBox(ctx) {
    ctx.fillStyle = 'rgba(166, 37, 245, 0.5)';
    ctx.strokeStyle = 'black';

    ctx.fillRect(
      this.unrotatedClickBox.x1,
      this.unrotatedClickBox.y1,
      this.unrotatedClickBox.x2 - this.unrotatedClickBox.x1,
      this.unrotatedClickBox.y2 - this.unrotatedClickBox.y1
    );
  }

  translateBy(originalPoints, translationDistances) {
    let result = {};
    for (const key in originalPoints) {
      let p = {};
      p.x = originalPoints[key].x + translationDistances.x;
      p.y = originalPoints[key].y + translationDistances.y;
      result[key] = p;
    }

    return result;
  }
}

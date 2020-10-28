export default class MathExtended {
    static clamp(num, min, max) {
      return Math.min(Math.max(num, min), max);
    }
}

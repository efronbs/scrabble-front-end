
export default class UiClock {

  time_step_millis = 20;

  // TODO refactor this to handle z index. Array of sets where index = render level.
  observers = new Set();
  canvas = null;
  canvasCtx = null;

  // mutable state
  prevTime = 0;
  intervalToken = null;

  /**
   * Registers a clock observer. Observers must have a "draw" method that
   * takes a single integer argument representing the time delta since the last
   * time the clock triggered
   */
  registerObserver(observer) {
    this.observers.add(observer);
  }

  /**
   * Removes the UI observer.
   *
   * @return whether or not the provided observer was successfully removed.
   */
  removeObserver(observer) {
    return this.observers.delete(observer);
  }

  /**
   * Checks if the clock is running or not.
   *
   * @return whether or not the clock is running
   */
  running() {
    return this.intervalToken != null;
  }

  /**
   * Starts the clock.
   *
   * @param canvas  The canvas to draw on.
   */
  start() {
    if (this.running()) {
      return;
    }

    this.intervalToken = window.setInterval(this.loopFunction, this.time_step_millis, this);
  }

  /**
   * Stops the clock.
   */
  stop() {
    if (! this.running()) {
      return;
    }

    window.clearInterval(this.intervalToken);
    this.intervalToken = null;
    this.prevTime = 0;
  }

  /**
   * Core loop called every frame. Notifies all registered observers of the
   * time delta then tells them to redraw themselves.
   */
  loopFunction(clockState) {
    let currentTime = new Date().getTime();
    let timeDelta = clockState.prevTime <= 0 ? 0 : currentTime - clockState.prevTime;
    // NOTE: iteration order is NOT guaranteed. If this becomes a requirement
    // this datastructure must be updated.
    clockState.observers.forEach(c => c.draw(timeDelta));
    clockState.prevTime = currentTime;
  }
}

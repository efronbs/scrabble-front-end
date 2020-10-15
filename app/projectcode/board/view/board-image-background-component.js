import UiComponent from './ui-component';

export default class BoardImageBackgroundComponent extends UiComponent {

  constructor(image, startX, startY, width, height) {
    super();

    this.image = image;
    this.startX = startX;
    this.startY = startY;
    this.width = width;
    this.height = height;
  }

  draw(ctx) {
    ctx.drawImage(
      this.image,
      this.startX,
      this.startY,
      this.width,
      this.height
    );
  }
}

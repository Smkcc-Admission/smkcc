const { Jimp } = require("jimp");

(async () => {
  const images = ["public/building.jpg", "public/envelope.jpg"];
  for (const img of images) {
    const image = await Jimp.read(img);
    // Find pure white and make it transparent.
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      
      // If color is close to white (> 240)
      if (red > 240 && green > 240 && blue > 240) {
        this.bitmap.data[idx + 3] = 0; // Set alpha to 0 (transparent)
      }
    });
    const outFile = img.replace(".jpg", ".png");
    await image.write(outFile);
    console.log("Saved", outFile);
  }
})();

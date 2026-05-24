const { nativeImage } = require('electron');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

const fillColor = '#FF6A6A';

const createOverlayIconWithText = text => {
  const size = 36;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
  ctx.fillStyle = '#000';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(size / 2, size / 2, (size / 2) - 2, 0, 2 * Math.PI);
  ctx.fillStyle = fillColor;
  ctx.fill();

  ctx.font = '23px sans-serif';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(text), size / 2 - 1, size / 2 - 2);

  return nativeImage.createFromBuffer(canvas.toBuffer('image/png'));
};

const createDotAttachedImage = async (baseIconPath, size) => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  const baseImg = await loadImage(baseIconPath).catch(err => {
    console.error('Error loading base image, ', baseIconPath, err);
  });
  ctx.drawImage(baseImg, 0, 0, size, size);

  const dotRadius = size * 0.5 / 2;
  const dotX = size - dotRadius * 0.9;
  const dotY = size - dotRadius * 0.95;

  ctx.beginPath();
  ctx.arc(dotX, dotY, dotRadius + 2, 0, 2 * Math.PI);
  ctx.fillStyle = '#000';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(dotX, dotY, dotRadius, 0, 2 * Math.PI);
  ctx.fillStyle = fillColor;
  ctx.fill();

  return nativeImage.createFromBuffer(canvas.toBuffer('image/png'));
}

const createImageFromSVG = async (svgPath, size) => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const svgData = fs.readFileSync(svgPath, 'utf8');
  const img = await loadImage('data:image/svg+xml;base64,' + Buffer.from(svgData).toString('base64'));
  ctx.drawImage(img, 0, 0, size, size);

  return nativeImage.createFromBuffer(canvas.toBuffer('image/png'));
}

const replaceAsarPath = (path) => path.replace('app.asar', 'app.asar.unpacked')

module.exports = {
  createOverlayIconWithText,
  createDotAttachedImage,
  createImageFromSVG,
  replaceAsarPath
}
/**
 * Vitest setup file
 */

// Mock canvas and other browser APIs that LeaferJS might need
class MockCanvasRenderingContext2D {
  canvas = { width: 800, height: 600 }
  fillStyle = ''
  strokeStyle = ''
  lineWidth = 1
  font = ''
  textAlign = 'left'
  textBaseline = 'alphabetic'
  
  fillRect() {}
  strokeRect() {}
  clearRect() {}
  beginPath() {}
  closePath() {}
  moveTo() {}
  lineTo() {}
  arc() {}
  fill() {}
  stroke() {}
  fillText() {}
  strokeText() {}
  measureText() {
    return { width: 100 }
  }
  save() {}
  restore() {}
  translate() {}
  rotate() {}
  scale() {}
  transform() {}
  setTransform() {}
  resetTransform() {}
  drawImage() {}
  createLinearGradient() {
    return {
      addColorStop() {}
    }
  }
  createRadialGradient() {
    return {
      addColorStop() {}
    }
  }
  createPattern() {
    return null
  }
  getImageData() {
    return {
      data: new Uint8ClampedArray(4),
      width: 1,
      height: 1
    }
  }
  putImageData() {}
}

// @ts-ignore
global.CanvasRenderingContext2D = MockCanvasRenderingContext2D
global.HTMLCanvasElement.prototype.getContext = function() {
  return new MockCanvasRenderingContext2D() as any
}

// Mock other canvas-related APIs
global.Path2D = class Path2D {} as any
global.ImageData = class ImageData {} as any

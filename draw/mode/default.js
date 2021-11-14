import { testColor } from '../utils.js'
// 前景色填充
export const defaultFill = async (oQRCode, _oContext, _htOption) => {
  var nCount = oQRCode.getModuleCount();
  var canvasWidth = _oContext.canvas.width
  var canvasHeight = _oContext.canvas.height
  var nWidth = _htOption.codeWidth / nCount;
  var nHeight = _htOption.codeHeight / nCount;
  var drawModules = JSON.parse(JSON.stringify(oQRCode.modules));
  // 如果前景色是颜色就直接绘制在当前的画布上就好了
  if (testColor(_htOption.colorDark)) {
    _oContext.fillStyle = _htOption.colorDark;
    // 绘制材质
    for (var row = 0; row < nCount; row++) {
      for (var col = 0; col < nCount; col++) {
        var nLeft = col * nWidth;
        var nTop = row * nHeight;
        if (drawModules[row][col]) { // 如果当前单元为true，表示可以填充
          _oContext.fillRect(nLeft, nTop, nWidth + 0.22, nHeight + 0.22);
          drawModules[row][col] = false;
        }
      }
    }
  } else { // 如果是 一张图片
    // 1. 得到前景图片资源
    let foreGround = await new Promise((resolve2) => { // 加载图片
      var image = new Image()
      image.src = _htOption.colorDark
      image.setAttribute("crossOrigin", 'anonymous')
      image.onload = () => {
        resolve2(image)
      }
    })

    // 2. 得到黑色的二维码区域（这里的二维码区域除了黑色的绘制区域外，其余地方是没有绘制内容的，是透明的）
    let newCanvas = document.createElement('canvas')
    newCanvas.width = canvasWidth
    newCanvas.height = canvasHeight
    let newCanvasCTX = newCanvas.getContext("2d")
    for (var row = 0; row < nCount; row++) {
      for (var col = 0; col < nCount; col++) {
        var nLeft = col * nWidth;
        var nTop = row * nHeight;
        if (drawModules[row][col]) { // 如果当前单元为true，表示可以填充
          newCanvasCTX.fillRect(nLeft, nTop, nWidth, nHeight);
          drawModules[row][col] = false;
        }
      }
    }

    // 得到图片资源后，将两张图像合并，按照二维码的区域来切割前景图片
    newCanvasCTX.globalCompositeOperation = "source-over";
    newCanvasCTX.drawImage(newCanvas, 0, 0, newCanvas.width, newCanvas.height);
    newCanvasCTX.globalCompositeOperation = "source-in";
    newCanvasCTX.drawImage(foreGround, 0, 0, newCanvas.width / 2, newCanvas.height / 2);
    // 3. 将结果重新绘制到大的画布中
    _oContext.drawImage(newCanvas, 0, 0, newCanvas.width, newCanvas.width);
  }
}

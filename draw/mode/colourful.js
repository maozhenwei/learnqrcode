import { QRUtil } from '../../core/util.js'
export const COLOURFUL_OPTION = { // 多彩配置项
  mode: 'linear gradient', // 默认线性渐变
  direction: 'to right', // 默认方向向右
  colors: ['#ffff00', '#33ff00', '#66ffff'] // 默认颜色
}

// 多彩填充
export function colourfulFill (oQRCode, _oContext, _htOption) {
  var nCount = oQRCode.getModuleCount();
  var nWidth = _htOption.codeWidth / nCount;
  var nHeight = _htOption.codeHeight / nCount;
  var drawModules = JSON.parse(JSON.stringify(oQRCode.modules));
  var colourfulOption = _htOption.colourfulOption
  const mode = { // 多彩模式
    LINNER: 'linear gradient', // 线性渐变
    RADIAL: 'radial gradient', // 线性渐变
    RANDOM: 'random block', // 随机块
  }
  const QRGradientDirection = { // 方向
    LEFT: 'to left',
    RIGHT: 'to right',
    TOP: 'to top',
    TOPRIGHT: 'to top right',
    TOPLEFT: 'to top left',
    BOTTOM: 'to bottom',
    BOTTOMRIGHT: 'to bottom right',
    BOTTOMLEFT: 'to bottom left'
  }
  // -----------------------------------------------------------------------------------------------------------------
  // 多彩模式
  switch (colourfulOption.mode) {
    case mode.LINNER:
      linerGradientMode()
      break
    case mode.RADIAL:
      radialGradientMode()
      break
    case mode.RANDOM:
      randomBlockMode()
      break
    default:
      linerGradientMode()
  }
  // -----------------------------------------------------------------------------------------------------------------
  // 获取方向对应的笔触路径
  function createLinearGradient (direction) {
    switch (direction) { // 渐变方向
      case QRGradientDirection.LEFT:
        return _oContext.createLinearGradient(_htOption.width, 0, 0, 0);
      case QRGradientDirection.TOP:
        return _oContext.createLinearGradient(0, _htOption.height, 0, 0);
      case QRGradientDirection.TOPLEFT:
        return _oContext.createLinearGradient(_htOption.width, _htOption.height, 0, 0);
      case QRGradientDirection.TOPRIGHT:
        return _oContext.createLinearGradient(0, _htOption.height, _htOption.width, 0);
      case QRGradientDirection.BOTTOM:
        return _oContext.createLinearGradient(0, 0, 0, _htOption.height);
      case QRGradientDirection.BOTTOMLEFT:
        return _oContext.createLinearGradient(_htOption.width, 0, 0, _htOption.height);
      case QRGradientDirection.BOTTOMRIGHT:
        return _oContext.createLinearGradient(0, 0, _htOption.width, _htOption.height);
      case QRGradientDirection.RIGHT:
      default:
        return _oContext.createLinearGradient(0, 0, _htOption.width, 0);
    }
  }
  // 线性渐变模式
  function linerGradientMode () {
    let gradient = createLinearGradient(colourfulOption.direction) // 渐变路径
    let colors = colourfulOption.colors
    for (let i = 0; i < colors.length; i++) { // 添加颜色
      gradient.addColorStop(i / (colors.length - 1), colors[i]); // 色彩范围只能从 0~1 之间取值，现在是平均分配
    }
    _oContext.lineWidth = 1;
    _oContext.fillStyle = gradient;
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
  }
  // 径向渐变模式
  function radialGradientMode () {
    let gradient = _oContext.createRadialGradient(_htOption.codeWidth / 2, _htOption.codeHeight / 2, 10, _htOption.codeWidth / 2, _htOption.codeHeight / 2, _htOption.codeHeight / 1.6) // 渐变路径
    let colors = colourfulOption.colors
    for (let i = 0; i < colors.length; i++) { // 添加颜色
      gradient.addColorStop(i / (colors.length - 1), colors[i]); // 色彩范围只能从 0~1 之间取值，现在是平均分配
    }
    _oContext.lineWidth = 1;
    _oContext.fillStyle = gradient;
    for (var row = 0; row < nCount; row++) {
      for (var col = 0; col < nCount; col++) {
        var nLeft = col * nWidth;
        var nTop = row * nHeight;
        if (drawModules[row][col]) { // 如果当前单元为true，表示可以填充
          _oContext.fillRect(nLeft, nTop, nWidth, nHeight);
          drawModules[row][col] = false;
        }
      }
    }
  }
  // 随机块模式
  function randomBlockMode () {
    let sameList = [] // 已经遍历过的列表
    let colors = colourfulOption.colors
    // 为了美观一些，将三个定位符和矫正图形的颜色统一
    // _oContext.fillStyle = colors[0]; // 随机获得一种颜色
    // colors.splice(0, 1)
    // findSameBlock(0, 0) // 左上角定位符的外框
    // findSameBlock(2, 2) // 左上角定位符的实心
    // findSameBlock(nCount - 1, 0) // 右上角定位符的外框
    // findSameBlock(nCount - 1 - 2, 2) // 右上角定位符的实心
    // findSameBlock(2, nCount - 1) // 左下角定位符的外框
    // findSameBlock(2, nCount - 1 - 2) // 左下角定位符的实心
    // colorFill()
    // 遍历矩阵，寻找相邻相同色块，赋相同的颜色
    for (var row = 0; row < nCount; row++) {
      for (var col = 0; col < nCount; col++) {
        if (drawModules[row][col]) { // 如果当前单元为true，表示可以填充
          sameList = [] // 重置已遍历的列表
          findSameBlock(row, col) // 找出相邻的色块
          _oContext.fillStyle = colors[Math.floor(Math.random() * (colors.length))]; // 随机获得一种颜色
          colorFill() // 给这些相邻的块填充相同的颜色
        }
      }
    }
    function findSameBlock (row, col) {// 查找当前点的四个方向上的点，是否是同一颜色
      if (sameList.indexOf(JSON.stringify([row, col])) != -1) return // 如果在已查找的序列中存在了，则结束当前方向的查找
      sameList.push(JSON.stringify([row, col])) // 将当前点加入到已查找的序列中
      // 上
      if ((row - 1) >= 0 && drawModules[row - 1][col]) {
        findSameBlock(row - 1, col)
      }
      // 下
      if ((row + 1) < nCount && drawModules[row + 1][col]) {
        findSameBlock(row + 1, col)
      }
      // 左
      if ((col - 1) >= 0 && drawModules[row][col - 1]) {
        findSameBlock(row, col - 1)
      }
      // 右
      if ((col + 1) < nCount && drawModules[row][col + 1]) {
        findSameBlock(row, col + 1)
      }
      return
    }
    function colorFill () { // 颜色填充
      for (var i = 0; i < sameList.length; i++) { // 给这些相同色块填充相同的颜色
        let currentBlock = JSON.parse(sameList[i]) // 当前块的位置
        var nLeft = currentBlock[0] * nWidth;
        var nTop = currentBlock[1] * nHeight;
        _oContext.fillRect(nLeft, nTop, nWidth + 0.22, nHeight + 0.22);
        drawModules[currentBlock[0]][currentBlock[1]] = false;
      }
    }
  }
  //--------------以上方法和变量的定义--------------------------------------------------------------------------------------------------
}


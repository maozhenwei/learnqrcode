import { testColor, loadScript, blobToBase64, dataURLtoFile, isNumber } from '../utils.js'
import { QRUtil } from '../../core/util.js'
import drawLogo from '../drawLogo.js'
export const GIF_OPTION = {
  src: '', // gif的图片地址
  delay: 40 // 生成的gif的帧速率
}
// 因为是动态引入的文件，在打包时或者说在热更新时,它是访问不到文件的，得给他绝对路径，要不直接放在public目录下也行，直接'./'去读好了
const gifJsUrl = '@/utils/qrcode/plug/gif/gif.js' // 用来生成gif的工具
const gifWorkerJsUrl = '@/utils/qrcode/plug/gif/gif.worker.js' // gif需要借助web worker 来辅助创建gif
const libGifUrl = '@/utils/qrcode/plug/gif/libgif.js' // 用来拆分gif的工具
// 动态加载gif.js，这个gif.js是指的是 plug/gif/gif.js，它是用来生成gif的，不是当前文件
if (typeof GIF == 'undefined') await loadScript(gifJsUrl)
if (typeof SuperGif == 'undefined') await loadScript(libGifUrl)
// gif作为背景填充
export const gifFill = async (oQRCode, _oContext, _htOption) => {
  // 是为了防止可能上面的第一次加载文件失败了，在每次创建gif的时候，都先判断一下
  if (typeof GIF == 'undefined') await loadScript(gifJsUrl)
  // 绘制二维码区域
  let QRCodeCanvas = await drawQRArea(oQRCode, _oContext, _htOption)
  // 接下来将gif图片拆解成每一帧，作为背景和二维码组合起来，合成新的二维码
  let gif = await createGif(QRCodeCanvas, _htOption)
  return gif
}

async function drawQRArea (oQRCode, _oContext, _htOption) {
  let foreColor = testColor(_htOption.colorDark) ? _htOption.colorDark : '#000'
  let drawModules = JSON.parse(JSON.stringify(oQRCode.modules));
  let nCount = oQRCode.getModuleCount();
  let nWidth = _htOption.codeWidth / nCount;
  let nHeight = _htOption.codeHeight / nCount;

  let newCanvas = document.createElement('canvas')
  newCanvas.height = _htOption.codeWidth * 2
  newCanvas.width = _htOption.codeWidth * 2
  let canvasCTX = newCanvas.getContext('2d')
  canvasCTX.scale(2, 2);
  let sameList = [] // 已经遍历过的列表
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
  // 基线
  function setupTimingPattern () {
    // 找出左上角和左下角定位符之间的基线
    for (var r = 8; r < nCount - 8; r++) {
      if (drawModules[r][6]) {
        if (sameList.indexOf(JSON.stringify([r, 6])) != -1) continue // 如果在已查找的序列中存在了，则结束当前方向的查找
        sameList.push(JSON.stringify([r, 6])) // 将当前点加入到已查找的序列中
      }
    }
    // 找出左上角和右上角定位符之间的基线
    for (var c = 8; c < nCount - 8; c++) {
      if (drawModules[6][c]) {
        if (sameList.indexOf(JSON.stringify([6, c])) != -1) continue // 如果在已查找的序列中存在了，则结束当前方向的查找
        sameList.push(JSON.stringify([6, c])) // 将当前点加入到已查找的序列中
      }
    }
  }
  // 绘制矫正图形
  function setupPositionAdjustPattern () {
    var pos = QRUtil.getPatternPosition(oQRCode.typeNumber);
    for (var i = 0; i < pos.length; i++) {
      for (var j = 0; j < pos.length; j++) {
        var row = pos[i];
        var col = pos[j];
        // 不能让矫正图形与定位符相交
        if (row < 7 && col < 7 || row < 7 && col >= nCount - 7 || col < 7 && row >= nCount - 7) {
          continue
        }
        for (var r = -2; r <= 2; r++) {
          for (var c = -2; c <= 2; c++) {
            if (r == -2 || r == 2 || c == -2 || c == 2 || (r == 0 && c == 0)) {
              if (sameList.indexOf(JSON.stringify([row + r, col + c])) != -1) continue
              sameList.push(JSON.stringify([row + r, col + c]))
            }
          }
        }
      }
    }
  }
  function colorFill () { // 颜色填充
    for (var i = 0; i < sameList.length; i++) { // 给这些相同色块填充相同的颜色
      let currentBlock = JSON.parse(sameList[i]) // 当前块的位置
      var nLeft = currentBlock[0] * nWidth;
      var nTop = currentBlock[1] * nHeight;
      canvasCTX.fillRect(nLeft, nTop, nWidth + 0.22, nHeight + 0.22);
      drawModules[currentBlock[0]][currentBlock[1]] = false;
    }
  }
  canvasCTX.fillStyle = foreColor // 随机获得一种颜色
  findSameBlock(0, 0) // 左上角定位符的外框
  findSameBlock(2, 2) // 左上角定位符的实心
  findSameBlock(nCount - 1, 0) // 右上角定位符的外框
  findSameBlock(nCount - 1 - 2, 2) // 右上角定位符的实心
  findSameBlock(2, nCount - 1) // 左下角定位符的外框
  findSameBlock(2, nCount - 1 - 2) // 左下角定位符的实心
  setupTimingPattern() // 寻找基线
  setupPositionAdjustPattern() // 矫正图形
  colorFill()
  //----以下开始绘制数据区域
  for (var row = 0; row < nCount; row++) {
    for (var col = 0; col < nCount; col++) {
      var nLeft = col * nWidth;
      var nTop = row * nHeight;
      if (drawModules[row][col]) { // 如果当前单元为true，表示可以填充
        canvasCTX.fillRect(nLeft + nWidth * 1 / 4, nTop + nHeight * 1 / 4, nWidth * 3 / 4, nHeight * 3 / 4);
        drawModules[row][col] = false;
      }
    }
  }
  // 如果传了logo，则设置logo信息, gif是不同的，需要单独处理
  if (_htOption.logo) {
    await drawLogo(newCanvas, _htOption.logo)
  }
  return newCanvas
}

// element 可是canvas或img
async function createGif (canvas, _htOption) {
  let width = _htOption.codeWidth
  let height = _htOption.codeHeight
  let background = await loadGif(_htOption.gifOption.src)
  let delayTime = 40
  if (isNumber(_htOption.gifOption.delay)) {
    delayTime = _htOption.gifOption.delay
  } else {
    console.warn('delay 接收到了一个非数值的值，所而采用默认参数 40 ')
  }
  return new Promise(async (resolve) => {
    // 创建一个画布对象，用于放置新的单帧图片
    let newImg = document.createElement('canvas')
    let newImgCTX = newImg.getContext('2d')
    newImg.width = width
    newImg.height = height
    // 创建gif拆解对象
    let gifSplitObj
    try {
      gifSplitObj = new SuperGif({ gif: background })
    } catch { }
    // 拆解gif图片
    let splitList = await new Promise((loadOk) => {
      gifSplitObj.load(() => {
        var img_list = [];
        for (let i = 1; i <= gifSplitObj.get_length(); i++) {
          gifSplitObj.move_to(i);
          var imgImag = new Image()
          imgImag.src = gifSplitObj.get_canvas().toDataURL('image/jpeg')
          img_list.push(imgImag)
        }
        loadOk(img_list)
      })
    })
    // 创建一个gif对象
    let gif = new GIF({
      workers: 2,
      quality: 10,
      workerScript: gifWorkerJsUrl
    })
    for (let i = 0; i < splitList.length; i++) {
      newImgCTX.drawImage(splitList[i], 0, 0, width, height) // 绘制二维码背景
      newImgCTX.drawImage(canvas, 0, 0, width, height) // 绘制二维码前景
      // 绘制gif单帧背景
      gif.addFrame(newImg, { copy: true, delay: delayTime })
    }
    // 开始渲染
    gif.render()
    // 渲染完成时，将生成的图片传递出去
    gif.on('finished', (blob) => {
      blobToBase64(blob).then(res => {
        resolve(res)
      })
    })
  })
}


function loadGif (src) {
  // 如果是字符串，就尝试去加载改文件，
  // 否则，就返回，比如如果穿的是个file对象，就可以直接拿去用了，别的情况不管了
  if (typeof src != 'string') {
    return src
  }
  return new Promise((resolve) => {
    let image = new Image()
    image.src = src
    image.setAttribute("crossOrigin", 'anonymous')
    image.onload = () => {
      image.style.display = "none"
      // document.body.appendChild(image)
      resolve(image)
    }
  })
}

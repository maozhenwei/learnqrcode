import { FILL_MODE } from '../index.js'
import { materialFill } from './mode/material.js'
import { defaultFill } from './mode/default.js'
import { colourfulFill } from './mode/colourful.js'
import { testColor } from './utils.js'
import { gifFill } from './mode/gif.js'
import drawLogo from './drawLogo.js'
class Drawing {
  constructor(htOption) {
    this._bIsPainted = false; // 是否绘制
    this._htOption = htOption; // 传入的配置副本
    this._elCanvas = document.createElement("canvas"); // 画布对象
    /**
       * 解决 canvas模糊的问题
       * 图像放大二倍，在实际dom中再缩小为50%
       * */
    this._elCanvas.width = htOption.width * 2;
    this._elCanvas.height = htOption.height * 2;
    this._oContext = this._elCanvas.getContext("2d"); // 画布的上下文对象
    this._oContext.scale(2, 2);
    this._bSupportDataURI = null; // 是否支持DataUrl
    this.finishedProduct = null // 最终产出
  }
  // 绘画
  draw = async (oQRCode) => {
    var _oContext = this._oContext; // canvas的上下文对象
    var _htOption = this._htOption; // 用户的配置信息
    var _fillMode = this._htOption.fillMode // 填充模式
    var bgWidth = this._elCanvas.width
    var bgHeight = this._elCanvas.height
    this.clear(); // 清除画布

    // 背景板绘制,如果是 颜色值，就绘制矩形
    if (testColor(_htOption.colorLight)) {
      _oContext.fillStyle = _htOption.colorLight; // 背景色
      _oContext.fillRect(0, 0, bgWidth, bgHeight)
    } else {// 反之，绘制图形
      let backGround = await new Promise((resolve2, reject) => {
        var image = new Image()
        image.src = _htOption.colorLight
        image.setAttribute("crossOrigin", 'anonymous') // 允许跨域
        image.onload = () => {
          resolve2(image)
        }
      })
      _oContext.drawImage(backGround, 0, 0, bgWidth / 2, bgHeight / 2)
    }

    // 以不同的方式填充
    switch (_fillMode) {
      case FILL_MODE.DEFAULT:
        await defaultFill(oQRCode, _oContext, _htOption)
        break
      case FILL_MODE.MATERIAL:
        await materialFill(oQRCode, _oContext, _htOption)
        break
      case FILL_MODE.COLOURFUL:
        colourfulFill(oQRCode, _oContext, _htOption)
        break
      case FILL_MODE.GIF:
        this.finishedProduct = await gifFill(oQRCode, _oContext, _htOption)
        break
      default:
        await defaultFill(oQRCode, _oContext, _htOption)
        break
    }
    // 如果传了logo，则设置logo信息, gif是不同的，需要单独处理
    if (_htOption.logo && _fillMode !== FILL_MODE.GIF) {
      await drawLogo(this._elCanvas, _htOption.logo)
    }
    _fillMode !== FILL_MODE.GIF && (this.finishedProduct = this.canvasToBase64())
    this._bIsPainted = true;
  };
  /**
     * 检查用户浏览器是否支持数据URI,不支持canvas就使用img
     *
     * @private
     * @param {Function} fSuccess 成功回调
     * @param {Function} fFail 失败回调
     */
  _safeSetDataURI = (fSuccess, fFail) => {
    var self = this;
    self._fFail = fFail;
    self._fSuccess = fSuccess;

    // Check it just once
    if (self._bSupportDataURI === null) {
      var el = document.createElement("img");
      var fOnError = function () {
        self._bSupportDataURI = false;

        if (self._fFail) {
          self._fFail.call(self);
        }
      };
      var fOnSuccess = function () {
        self._bSupportDataURI = true;

        if (self._fSuccess) {
          self._fSuccess.call(self);
        }
      };

      el.onabort = fOnError;
      el.onerror = fOnError;
      el.onload = fOnSuccess;
      el.src = "data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="; // the Image contains 1px data.
      return;
    } else if (self._bSupportDataURI === true && self._fSuccess) {
      self._fSuccess.call(self);
    } else if (self._bSupportDataURI === false && self._fFail) {
      self._fFail.call(self);
    }
  };
}
// Drawing.prototype.
Drawing.prototype.clear = function () {
  this._oContext.clearRect(0, 0, this._elCanvas.width, this._elCanvas.height);
  this._bIsPainted = false;
};
Drawing.prototype.canvasToBase64 = function () {
  // 再利用一个canvas对象，是最终导出的画布图像缩小
  let tempCanvas = document.createElement('canvas')
  tempCanvas.width = this._elCanvas.width / 2
  tempCanvas.height = this._elCanvas.height / 2
  let ctx = tempCanvas.getContext("2d")
  ctx.drawImage(this._elCanvas, 0, 0, tempCanvas.width, tempCanvas.height)
  return tempCanvas.toDataURL('image/png')
}
/**
     * Make the image from Canvas if the browser supports Data URI.
     */
Drawing.prototype.makeImage = function () {
  if (this._bIsPainted) {
    return this.finishedProduct
  }
};
export default Drawing

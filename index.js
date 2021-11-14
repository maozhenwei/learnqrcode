import { MATERIAL_OPTION } from './draw/mode/material.js'
import { COLOURFUL_OPTION } from './draw/mode/colourful.js'
import { GIF_OPTION } from './draw/mode/gif.js'
import { CORRECT_LEVEL, _getTypeNumber } from './core/correctLevel.js'
import { QRCodeModel } from './core/model.js'
import Drawing from './draw/index.js'
export const FILL_MODE = {
  DEFAULT: 'default', // 默认
  MATERIAL: 'material', // 材质填充模式
  COLOURFUL: 'colourful', // 多彩模式
  GIF: 'gif'
}
export class ArtQrCode {
  _htOption // 配置信息
  _callback // 外部传入的回调方法
  _oQRCode // 二维码的数据模型
  _oDrawing // 绘画对象
  constructor(vOption, callback) {
    // 如果没传递text就不要往下走了
    if (typeof vOption != 'string' && !vOption.text) {
      console.error('二维码缺少关键参数text')
      return
    }
    this._htOption = { // 默认配置
      text: '', // 二维码传递的文本
      width: 256, // 输出图的宽高
      height: 256,
      bgWidth: 256, // 如果有背景图，则背景图的宽高
      bgHeight: 256,
      codeWidth: 256, // 二维码的宽高
      codeHeight: 256,
      top: 0, // 主要配合背景图使用，有了背景图后，就得靠自己来规定二维码在背景图中的位置
      left: 0,
      colorDark: "#000000", // 前景色 也可以是 图片
      colorLight: "#ffffff", // 背景色 也可以是 图片
      correctLevel: CORRECT_LEVEL.H, // 容错等级,H最大 容错30%，L最小 容错7%
      fillMode: 'default', // 填充模式[]
      logo: '', // 中心logo
      materialOption: MATERIAL_OPTION, // 材质模式配置项
      colourfulOption: COLOURFUL_OPTION, // 多彩模式配置项
      gifOption: GIF_OPTION // gif模式配置项
    }
    if (typeof vOption === 'string') { // 如果用户传递的是文本，就处理成对象形式，方便下面统一重写属性
      vOption = {
        text: vOption
      };
    }
    // 重写属性
    if (vOption) {
      // 重写了用户配置的属性
      for (var key in vOption) {
        this._htOption[key] = vOption[key];
      }
      // 复杂属性的重写
      this._htOption.colourfulOption = {
        ...COLOURFUL_OPTION,
        ...vOption.colourfulOption
      }
      this._htOption.materialOption = {
        ...MATERIAL_OPTION,
        ...vOption.materialOption
      }
    }
    // 如果没有输入二维码的宽高，则直接使用输出图形的宽高
    if (!vOption.codeWidth) {
      this._htOption.codeWidth = this._htOption.width;
    }
    if (!vOption.codeHeight) {
      this._htOption.codeHeight = this._htOption.height;
    }
    if (vOption.logo && !vOption.correctLevel) {
      this._htOption.correctLevel = CORRECT_LEVEL.H
    }
    // 获取 回调方法
    if (typeof callback == "function") {
      this._callback = callback
    }
    // 静态信息赋值完毕，开始制作二维码
    this.makeCode()
  }
  // 创建QRCode
  makeCode = async () => {
    // 创建二维码的数据模型，可以说是绘制矩阵数据模型，根据传入的 文字和容错等级 决定了要绘制成什么规格的矩阵（二维码的Version1 21*21的矩阵、Version2 25 * 25的矩阵）
    this._oQRCode = new QRCodeModel(_getTypeNumber(this._htOption.text, this._htOption.correctLevel), this._htOption.correctLevel);
    this._oQRCode.addData(this._htOption.text); // 添加数据
    this._oQRCode.make(); // 将添加的内容们转化成对应的编码（字符或中文转换成对应的scroll码）, 绘制矩阵数据模型
    // 数据准备好了，开始绘制
    this._oDrawing = new Drawing(this._htOption) // 创建画板
    await this._oDrawing.draw(this._oQRCode); // 在画布上操作
    let base64Img = await this._oDrawing.makeImage(); // 获取生成的图片地址
    this._callback && this._callback.call(this, base64Img) // 执行回调
  }
}


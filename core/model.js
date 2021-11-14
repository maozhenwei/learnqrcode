import { QR8bitByte } from './qr8BitByte.js'
import QRBitBuffer from './bitBuffer.js'
import { QRUtil } from './util.js'
import QRRSBlock from './RSBlock.js'
import QRPolynomial from './polynomial.js'
/*
  二维码的数据模型
  @params version               number          二维码的版本
          errorCorrectLevel     number          容错级别
*/
export class QRCodeModel {
  constructor(version, errorCorrectLevel) {
    this.typeNumber = version; // 二维码的版本
    this.errorCorrectLevel = errorCorrectLevel; // 容错级别
    this.modules = null; // 数据矩阵，一个二维数组
    this.moduleCount = 0; // 总的矩阵单元个数，二维矩阵的长度
    this.dataCache = null; // 数据缓存，这个是完整的数据，经过编码的
    this.dataList = []; // 数据列表，未处理
  }
  make = () => {
    this.makeImpl(false, this.getBestMaskPattern());
  }
  /*
   @params test        <boolean> : 是否设置版本和格式信息
   @params maskPattern <number>  : 掩码图案的索引
  */
  makeImpl = (test, maskPattern) => { // 创建了二维数组，一个包含了位置信息的矩阵，可以输出看一下 console.log(this.modules)
    this.moduleCount = this.typeNumber * 4 + 17; // 这个算法的原因是：官方版本中 Version 1 21 * 21 的矩阵 Version2 25 * 25 的矩阵，共有40个尺寸，每个尺寸之间的递进关系是4
    this.modules = new Array(this.moduleCount); // 每次都重新创建数组
    for (var row = 0; row < this.moduleCount; row++) { // 初始化单元矩阵，标记
      this.modules[row] = new Array(this.moduleCount);
      for (var col = 0; col < this.moduleCount; col++) {
        this.modules[row][col] = null; // 初始标记为null，表示未被使用， true表示有色区域（1）， false表示无色区域（0）
      }
    }
    // 定位符的绘制：三个最大的矩形
    this.setupPositionProbePattern(0, 0);                    // 左上角
    this.setupPositionProbePattern(this.moduleCount - 7, 0); // 右上角
    this.setupPositionProbePattern(0, this.moduleCount - 7); // 左下角
    // 矫正图形的绘制：二维码中 小区域的矩形，这个不明显，数据越多，则矫正图形越多
    this.setupPositionAdjustPattern();
    // 标准线的绘制：为了防止尺寸过大后扫描可能会发生扫歪的情况，就是三个定位符之间的一条线
    this.setupTimingPattern();
    // 格式信息区域的绘制：在定位符的附近有一圈区域记录格式信息
    this.setupTypeInfo(test, maskPattern);
    // 版本号区域的绘制：当二维码的版本大于等于7时，需要添加版本号信息
    if (this.typeNumber >= 7) {
      this.setupTypeNumber(test);
    }
    // 最后绘制 数据区域
    if (this.dataCache == null) { // 在第一次执行或是数据增加后，会清空缓存，在这里判断，以便填充最新的数据到矩阵中
      this.dataCache = QRCodeModel.createData(this.typeNumber, this.errorCorrectLevel, this.dataList);
    }
    this.mapData(this.dataCache, maskPattern); // 填充数据到二维码矩阵中
  }
  // 获取最佳的MaskPattern(掩码图案),保证最终编码形成的区域不会会存在点不均衡，不出现有大面积的空白或者黑块，而使扫描识别就会变得非常的困难
  // 该操作只能应用在数据码和纠错码放置的区域，操作会遵循以下四个规则:
  getBestMaskPattern = () => {
    var minLostPoint = 0; // 最小惩罚分数
    var pattern = 0; // mask partten的索引
    for (var i = 0; i < 8; i++) { // QR有8个Mask可以使用，寻找出惩罚分数最小的哪一种
      this.makeImpl(true, i); // 利用每一种mark partten 计算出填充的区域
      var lostPoint = QRUtil.getLostPoint(this); // 计算出惩罚分数
      if (i == 0 || minLostPoint > lostPoint) {
        minLostPoint = lostPoint;
        pattern = i;
      }
    }
    return pattern;
  }
  /*
  *   回 0 回   // 这方法的目的：找出三个定位符，就是二维码中最大的那个矩形，明显的有三个，分布在三个角落，左上 左下 右上
  *   0 0 0     // 将对应的位置标记出来
  *   回 0 0
  */
  setupPositionProbePattern = (row, col) => {
    /*  双重for循环的目的,根据预设的理想中的布局位置，找出一个 “ 回 ”这样的区域
        此方法接收一个位置信息，这个位置就是“ 回 ”的左上角的点的位置，将根据这个点来找出它的“ 回 ”区域
        为什么r 和 c 是从-1~7，
          因为，你试着画一下，一个“回”中的矩形需要3*3的位置去绘制，
          那么在这个矩形上套一圈白色剧需要5*5，
          在套一圈黑边就是7*7，
          为了区别于其他信息区域，还会再套一圈白边，就8*8了，由于边缘是不需要白边的，所以下标从-1开始，到7结束，里面会判断筛掉最边缘的行和列
      */
    for (var r = -1; r <= 7; r++) {
      if (row + r <= -1 || this.moduleCount <= row + r) continue; // 绘制内容限制在单元内，超出就跳过
      for (var c = -1; c <= 7; c++) {
        if (col + c <= -1 || this.moduleCount <= col + c) continue; // 绘制内容限制在单元内，超出就跳过
        if ((0 <= r && r <= 6 && (c == 0 || c == 6)) || (0 <= c && c <= 6 && (r == 0 || r == 6)) || (2 <= r && r <= 4 && 2 <= c && c <= 4)) {
          this.modules[row + r][col + c] = true;
        } else {
          this.modules[row + r][col + c] = false;
        }
      }
    }
  }
  // 绘制矫正图形
  setupPositionAdjustPattern = () => {
    var pos = QRUtil.getPatternPosition(this.typeNumber);
    for (var i = 0; i < pos.length; i++) {
      for (var j = 0; j < pos.length; j++) {
        var row = pos[i];
        var col = pos[j];
        if (this.modules[row][col] != null) {
          continue;
        }
        for (var r = -2; r <= 2; r++) {
          for (var c = -2; c <= 2; c++) {
            if (r == -2 || r == 2 || c == -2 || c == 2 || (r == 0 && c == 0)) {
              this.modules[row + r][col + c] = true;
            } else {
              this.modules[row + r][col + c] = false;
            }
          }
        }
      }
    }
  }
  // 基线
  setupTimingPattern = () => {
    for (var r = 8; r < this.moduleCount - 8; r++) {
      if (this.modules[r][6] != null) {
        continue;
      }
      this.modules[r][6] = (r % 2 == 0);
    }
    for (var c = 8; c < this.moduleCount - 8; c++) {
      if (this.modules[6][c] != null) {
        continue;
      }
      this.modules[6][c] = (c % 2 == 0);
    }
  }
  // 设置版本信息
  setupTypeNumber = (test) => {
    var bits = QRUtil.getBCHTypeNumber(this.typeNumber);
    for (var i = 0; i < 18; i++) {
      var mod = (!test && ((bits >> i) & 1) == 1);
      this.modules[Math.floor(i / 3)][i % 3 + this.moduleCount - 8 - 3] = mod;
    }
    for (var i = 0; i < 18; i++) {
      var mod = (!test && ((bits >> i) & 1) == 1);
      this.modules[i % 3 + this.moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
    }
  }
  // 设置格式信息
  setupTypeInfo = (test, maskPattern) => {
    var data = (this.errorCorrectLevel << 3) | maskPattern;
    var bits = QRUtil.getBCHTypeInfo(data);
    for (var i = 0; i < 15; i++) {
      var mod = (!test && ((bits >> i) & 1) == 1);
      if (i < 6) {
        this.modules[i][8] = mod;
      } else if (i < 8) {
        this.modules[i + 1][8] = mod;
      } else {
        this.modules[this.moduleCount - 15 + i][8] = mod;
      }
    }
    for (var i = 0; i < 15; i++) {
      var mod = (!test && ((bits >> i) & 1) == 1);
      if (i < 8) {
        this.modules[8][this.moduleCount - i - 1] = mod;
      } else if (i < 9) {
        this.modules[8][15 - i - 1 + 1] = mod;
      } else {
        this.modules[8][15 - i - 1] = mod;
      }
    }
    this.modules[this.moduleCount - 8][8] = (!test);
  }
  mapData = (data, maskPattern) => {
    var inc = -1;
    var row = this.moduleCount - 1;
    var bitIndex = 7;
    var byteIndex = 0;
    for (var col = this.moduleCount - 1; col > 0; col -= 2) {
      if (col == 6) col--;
      while (true) {
        for (var c = 0; c < 2; c++) {
          if (this.modules[row][col - c] == null) {
            var dark = false;
            if (byteIndex < data.length) {
              dark = (((data[byteIndex] >>> bitIndex) & 1) == 1);
            }
            var mask = QRUtil.getMask(maskPattern, row, col - c);
            if (mask) {
              dark = !dark;
            }
            this.modules[row][col - c] = dark;
            bitIndex--;
            if (bitIndex == -1) {
              byteIndex++;
              bitIndex = 7;
            }
          }
        }
        row += inc;
        if (row < 0 || this.moduleCount <= row) {
          row -= inc;
          inc = -inc;
          break;
        }
      }
    }
  }
  // 添加信息
  addData = (data) => {
    let newData = new QR8bitByte(data); // 找出文字对应的字节索引
    this.dataList.push(newData);
    this.dataCache = null; // 每次新增数据后，重置数据缓存，在下次更新数据模型时，会判断数据缓存，以便及时更新最新的数据
  }
  // 判断该坐标处是否为Dark(前景色)，也就是有数据的项，二维码中有数据为深色块，无数据为浅色快  对应计算机语言中的1 和 0
  isDark = (row, col) => {
    if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) {
      throw new Error(row + "," + col);
    }
    return this.modules[row][col];
  }
  getModuleCount = () => {
    return this.moduleCount;
  }
}
// 创建数据
QRCodeModel.createData = function (typeNumber, errorCorrectLevel, dataList) {
  var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectLevel); // 根据二维码的版本和容错级别，确定如何对数据分组（块），每个组（块）可以包含的内容（即多少的数据码和多少的纠错码）
  var buffer = new QRBitBuffer(); // 字节缓冲池 buffer数组中的每个元素存储一个字节
  for (var i = 0; i < dataList.length; i++) {// 将字符编码模式、字符长度、数据信息加入缓冲池---此为数据码
    var data = dataList[i];
    buffer.put(data.mode, 4); // 第一步 将对应的字符编码模式加在开头，模式说明字符占4个bits的长度
    buffer.put(data.getLength(), QRUtil.getLengthInBits(data.mode, typeNumber)); // 第二步，字符的总长度 放进去，这个的所占bits数，根据二维码的版本来，比如 version1 在H模式下为 9 bits
    data.write(buffer); // 然后是将数据信息编进去，编码每个字节的结果，每个字节存8bits的长度
  }
  var totalDataCount = 0;
  for (var i = 0; i < rsBlocks.length; i++) { // 统计该纠错级别下可容纳的总的字节数
    totalDataCount += rsBlocks[i].dataCount;
  }
  if (buffer.getLengthInBits() > totalDataCount * 8) { // 如果缓冲池的总位数（bits）超过了纠错级别总的能够承载的位数，抛出错误
    throw new Error("code length overflow. ("
      + buffer.getLengthInBits()
      + ">"
      + totalDataCount * 8
      + ")");
  }
  if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) { // 位数没有达到纠错级别所能承载的容量，就加上结束符0000
    buffer.put(0, 4);
  }
  while (buffer.getLengthInBits() % 8 != 0) { // 如果总位数（bits）不是8的倍数，则插入0，增加长度，直到满足8的倍数
    buffer.putBit(false);
  }
  while (true) {
    if (buffer.getLengthInBits() >= totalDataCount * 8) { // 总位数超了就结束
      break;
    }
    buffer.put(QRCodeModel.PAD0, 8); // 如果最后还没有达到我们的最大bits数的限制，还要加上一些补齐码
    if (buffer.getLengthInBits() >= totalDataCount * 8) { // 总位数超了就结束
      break;
    }
    buffer.put(QRCodeModel.PAD1, 8); // 如果最后还没有达到我们的最大bits数的限制，还要加上一些补齐码
  }
  return QRCodeModel.createBytes(buffer, rsBlocks);
};
QRCodeModel.createBytes = function (buffer, rsBlocks) {
  var offset = 0; // 偏移量，这个偏移量按照位（bit）来的
  var maxDcCount = 0; // 最大数据容量
  var maxEcCount = 0; // // 最大纠错码容量
  var dcdata = new Array(rsBlocks.length); // 数据码
  var ecdata = new Array(rsBlocks.length); // 纠错码
  for (var r = 0; r < rsBlocks.length; r++) { // 当前分块
    var dcCount = rsBlocks[r].dataCount; // 当前分块可以容纳的数据码长度（字节数量）
    var ecCount = rsBlocks[r].totalCount - dcCount; // 当前分块可以容纳的纠错码长度（字节数量）
    maxDcCount = Math.max(maxDcCount, dcCount);
    maxEcCount = Math.max(maxEcCount, ecCount);
    dcdata[r] = new Array(dcCount);
    for (var i = 0; i < dcdata[r].length; i++) {  // 在当前块所能容纳的字节数
      dcdata[r][i] = 0xff & buffer.buffer[i + offset]; // 给每一个字节位置上填充内容， 这里算是转成8bits吧，通过按位与操作，将内容限制在8bits
    }
    offset += dcCount;
    var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
    var rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1);
    var modPoly = rawPoly.mod(rsPoly);
    ecdata[r] = new Array(rsPoly.getLength() - 1);
    for (var i = 0; i < ecdata[r].length; i++) {
      var modIndex = i + modPoly.getLength() - ecdata[r].length;
      ecdata[r][i] = (modIndex >= 0) ? modPoly.get(modIndex) : 0;
    }
  }
  var totalCodeCount = 0;
  for (var i = 0; i < rsBlocks.length; i++) {
    totalCodeCount += rsBlocks[i].totalCount;
  }
  var data = new Array(totalCodeCount);
  var index = 0;
  for (var i = 0; i < maxDcCount; i++) {
    for (var r = 0; r < rsBlocks.length; r++) {
      if (i < dcdata[r].length) {
        data[index++] = dcdata[r][i];
      }
    }
  }
  for (var i = 0; i < maxEcCount; i++) {
    for (var r = 0; r < rsBlocks.length; r++) {
      if (i < ecdata[r].length) {
        data[index++] = ecdata[r][i];
      }
    }
  }
  return data;
};
QRCodeModel.PAD0 = 0xEC; // 补齐码 相当于十进制 236
QRCodeModel.PAD1 = 0x11; // 补齐码 相当于十进制 17
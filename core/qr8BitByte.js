// <<偏移量  1 << 1 表示向左偏移1位   就是说 本来 1的 二进制是 0001 偏移1位后 0010 
export const QR_MODE = { // 字符编码，在最终转化成二进制时需要在信息头部加入的编码模式
  MODE_NUMBER: 1 << 0, // 数字编码
  MODE_ALPHA_NUM: 1 << 1, // 字符编码
  MODE_8BIT_BYTE: 1 << 2, // 字节编码
  MODE_KANJI: 1 << 3 // kanji模式,日文，双字节
};
export class QR8bitByte { // 将字符串中的每个字符转换成对应编码，汉字占2~4个字节
  constructor(data) {
    this.mode = QR_MODE.MODE_8BIT_BYTE; // 默认为字节编码
    this.data = data; // 数据原文
    this.parsedData = []; // 数据原文拆解后的ascll码的数组

    // 添加支持 UTF-8 编码
    for (var i = 0, l = this.data.length; i < l; i++) {
      var byteArray = [];
      var code = this.data.charCodeAt(i);

      if (code > 0x10000) { // 四字节 汉字
        byteArray[0] = 0xF0 | ((code & 0x1C0000) >>> 18);
        byteArray[1] = 0x80 | ((code & 0x3F000) >>> 12);
        byteArray[2] = 0x80 | ((code & 0xFC0) >>> 6);
        byteArray[3] = 0x80 | (code & 0x3F);
      } else if (code > 0x800) { // 三字节 汉字
        byteArray[0] = 0xE0 | ((code & 0xF000) >>> 12);
        byteArray[1] = 0x80 | ((code & 0xFC0) >>> 6);
        byteArray[2] = 0x80 | (code & 0x3F);
      } else if (code > 0x80) { // 二字节 汉字
        byteArray[0] = 0xC0 | ((code & 0x7C0) >>> 6);
        byteArray[1] = 0x80 | (code & 0x3F);
      } else { // 其他字符
        byteArray[0] = code;
      }
      this.parsedData.push(byteArray);
    }

    this.parsedData = Array.prototype.concat.apply([], this.parsedData);

    // 添加这个的目的是为了表明这是utf-8格式的，如果没加则就加上
    if (this.parsedData.length != this.data.length) {
      // 以下三个编码ascii码239,187,191 对应着 UTF-8的bom头 EF BB BF
      this.parsedData.unshift(191);
      this.parsedData.unshift(187);
      this.parsedData.unshift(239);
    }
  }
  getLength = () => {
    return this.parsedData.length;
  }
  write = (buffer) => {
    for (var i = 0, l = this.parsedData.length; i < l; i++) {
      buffer.put(this.parsedData[i], 8);
    }
  }
}
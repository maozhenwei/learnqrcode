class QRBitBuffer {
  constructor() {
    this.buffer = []; // 缓冲池
    this.length = 0; // 这个长度是指 bits（字节位数），不是指this.buffer的长度
  }
  get (index) {
    var bufIndex = Math.floor(index / 8);
    return ((this.buffer[bufIndex] >>> (7 - index % 8)) & 1) == 1;
  }
  put (num, length) {
    for (var i = 0; i < length; i++) {
      this.putBit(((num >>> (length - i - 1)) & 1) == 1);
    }
  }
  // 返回字节位数
  getLengthInBits () {
    return this.length;
  }
  putBit (bit) {
    // 10000000 100000000 10001010 10010101 ...
    var bufIndex = Math.floor(this.length / 8); // 1个字节是8位，所以要按照8位一分，这个得到的是当前正在操作的字节的位置
    if (this.buffer.length <= bufIndex) { // 当缓冲池的总bits（位数）达到一个8的倍数时，就在缓冲池中放置一个0（空位），接下来就是操作这个空位，直到到了下一个8的倍数，就在进一个字节位置
      this.buffer.push(0); // 相当于增加了 一个字节 00000000
    }
    if (bit) { // 如果是奇数
      // 0x80: 10000000 就是十进制中的128。  向右偏移操作就是 128 64 32 16 8 4 2 1
      // 这一步是为了将正在操作的缓冲池的字节位置上的内容累加    比如：总位数为14,正在操作第二个字节（此时buffer[1] = 64）就是  buffer[1] |= 128 >>> (14 % 8); 
      //                                                                                                     或操作：   0100 0000
      //                                                                                                               0000 0010
      //                                                                                                     结果就是： 1011 1101   将buffer[1]改为 189                          
      this.buffer[bufIndex] |= (0x80 >>> (this.length % 8)); // 位或之后赋值,相当于相加，目的就是为了计算这个字节的内容
    }
    this.length++;
  }
}
export default QRBitBuffer
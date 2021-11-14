export const CORRECT_LEVEL = { // 容错等级，这里存储的实际是数组的索引，各个等级对应着QRCodeLimitLength数组元素中每个小项中的位置（是不是很疑惑为什么容错等级跟数组的索引不对应，感觉怪怪的，我换过位置，发现识别不了了。。。）
  L: 1,
  M: 0,
  Q: 3,
  H: 2
}
// 文本长度限制列表，每一项对应着二维码的各个版本的容错范围，而每一小项目对应着在这个版本下各个容错等级下所能接收的消息长度，二维码一共40个版本
const QRCodeLimitLength = [[17, 14, 11, 7], [32, 26, 20, 14], [53, 42, 32, 24], [78, 62, 46, 34], [106, 84, 60, 44], [134, 106, 74, 58], [154, 122, 86, 64], [192, 152, 108, 84], [230, 180, 130, 98], [271, 213, 151, 119], [321, 251, 177, 137], [367, 287, 203, 155], [425, 331, 241, 177], [458, 362, 258, 194], [520, 412, 292, 220], [586, 450, 322, 250], [644, 504, 364, 280], [718, 560, 394, 310], [792, 624, 442, 338], [858, 666, 482, 382], [929, 711, 509, 403], [1003, 779, 565, 439], [1091, 857, 611, 461], [1171, 911, 661, 511], [1273, 997, 715, 535], [1367, 1059, 751, 593], [1465, 1125, 805, 625], [1528, 1190, 868, 658], [1628, 1264, 908, 698], [1732, 1370, 982, 742], [1840, 1452, 1030, 790], [1952, 1538, 1112, 842], [2068, 1628, 1168, 898], [2188, 1722, 1228, 958], [2303, 1809, 1283, 983], [2431, 1911, 1351, 1051], [2563, 1989, 1423, 1093], [2699, 2099, 1499, 1139], [2809, 2213, 1579, 1219], [2953, 2331, 1663, 1273]];

// 根据文本长度和容错等级，返回对应的限制类型的索引位置，即二维码的版本
export function _getTypeNumber (sText, nCorrectLevel) {
  var nType = 1;
  var length = _getUTF8Length(sText); // 将文本转化成scroll码后的长度，一个文字占据2~4个字节，utf格式3个字节
  for (var i = 0, len = QRCodeLimitLength.length; i <= len; i++) {
    var nLimit = 0;
    switch (nCorrectLevel) {
      case CORRECT_LEVEL.L:
        nLimit = QRCodeLimitLength[i][0];
        break;
      case CORRECT_LEVEL.M:
        nLimit = QRCodeLimitLength[i][1];
        break;
      case CORRECT_LEVEL.Q:
        nLimit = QRCodeLimitLength[i][2];
        break;
      case CORRECT_LEVEL.H:
        nLimit = QRCodeLimitLength[i][3];
        break;
    }
    if (length <= nLimit) {
      break;
    } else {
      nType++;
    }
  }
  if (nType > QRCodeLimitLength.length) { // 消息文本超出了二维码所能承载的长度
    throw new Error("Too long data");
  }

  return nType;
}
// 获取文本的utf格式下的字节长度
function _getUTF8Length (sText) {
  var replacedText = encodeURI(sText).toString().replace(/\%[0-9a-fA-F]{2}/g, 'a');
  return replacedText.length + (replacedText.length != sText ? 3 : 0); // 防止传入的是空值
}
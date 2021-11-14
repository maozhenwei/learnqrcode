import { testColor } from "../utils";
const MATERIALS = { // 材质默认值
  eye: "",
  row2col3: "",
  row3col2: "",
  row4: "",
  col4: "",
  row3: "",
  col3: "",
  row2col2: "",
  corner: "",
  col2: "",
  row2: "",
  single: ""
}
export const MATERIAL_OPTION = {
  materials: MATERIALS
}
// 材质填充
// 传入 数据模型、画布的上下文对象、配置项
export async function materialFill (oQRCode, _oContext, _htOption) {
  var nCount = oQRCode.getModuleCount();
  var nWidth = _htOption.codeWidth / nCount;
  var nHeight = _htOption.codeHeight / nCount;
  var bgWidth = _oContext.canvas.width
  var bgHeight = _oContext.canvas.height
  const { data: materials } = await loadMaterial(_htOption)
  var drawModules = JSON.parse(JSON.stringify(oQRCode.modules));
  // 绘制背景图，如果存在的话
  console.log(_oContext)
  materials.border && _oContext.drawImage(materials.border, 0, 0, bgWidth, bgHeight)
  // 绘制材质
  for (var row = 0; row < nCount; row++) {
    for (var col = 0; col < nCount; col++) {
      // var bIsDark = oQRCode.isDark(row, col);
      var nLeft = col * nWidth + _htOption.left;
      var nTop = row * nHeight + _htOption.top;
      // 以此从最大的开始往最小的判断
      if (drawModules[row][col]) { // 如果当前单元为true，表示可以填充
        //draw eye： 绘制三个定位符
        if (materials.eye && (row == 0 && col == 0 || row + 7 == nCount && col == 0 || row == 0 && col + 7 == nCount)) {
          _oContext.drawImage(_getRealMaterial(materials.eye), nLeft, nTop, nWidth * 7, nHeight * 7);
          _updateDrawModules(row, col, 7, 7, drawModules);
        }
        // 如果空间足够，放下对应的图片，并将对应的单元位置标记false，表示已经绘制过了
        //draw row2col3
        else if (materials.row2col3 && _isSatisfyUnit(row, col, 2, 3, drawModules)) {
          _oContext.drawImage(_getRealMaterial(materials.row2col3), nLeft, nTop, nWidth * 3, nHeight * 2);
          _updateDrawModules(row, col, 2, 3, drawModules);
        }
        //draw row3col2
        else if (materials.row3col2 && _isSatisfyUnit(row, col, 3, 2, drawModules)) {
          _oContext.drawImage(_getRealMaterial(materials.row3col2), nLeft, nTop, nWidth * 2, nHeight * 3);
          _updateDrawModules(row, col, 3, 2, drawModules);
        }
        //draw row4
        else if (materials.row4 && _isSatisfyUnit(row, col, 4, 1, drawModules)) {
          _oContext.drawImage(_getRealMaterial(materials.row4), nLeft, nTop, nWidth * 1, nHeight * 4);
          _updateDrawModules(row, col, 4, 1, drawModules);
        }
        // draw col4
        else if (materials.col4 && _isSatisfyUnit(row, col, 1, 4, drawModules)) {
          _oContext.drawImage(_getRealMaterial(materials.col4), nLeft, nTop, nWidth * 4, nHeight);
          _updateDrawModules(row, col, 1, 4, drawModules);
        }
        //draw row2col2
        else if (materials.row2col2 && _isSatisfyUnit(row, col, 2, 2, drawModules)) {
          _oContext.drawImage(_getRealMaterial(materials.row2col2), nLeft, nTop, nWidth * 2, nHeight * 2);
          _updateDrawModules(row, col, 2, 2, drawModules);
        }
        //draw row3 
        else if (materials.row3 && _isSatisfyUnit(row, col, 3, 1, drawModules)) {
          _oContext.drawImage(_getRealMaterial(materials.row3), nLeft, nTop, nWidth, nHeight * 3);
          _updateDrawModules(row, col, 3, 1, drawModules);
        }
        //draw col3
        else if (materials.col3 && _isSatisfyUnit(row, col, 1, 3, drawModules)) {
          _oContext.drawImage(_getRealMaterial(materials.col3), nLeft, nTop, nWidth * 3, nHeight);
          _updateDrawModules(row, col, 1, 3, drawModules);
        }
        //draw corner
        else if (materials.corner && _isSatisfyUnit(row, col, 2, 1, drawModules) && _isSatisfyUnit(row, col, 1, 2, drawModules)) {
          _oContext.drawImage(_getRealMaterial(materials.corner), nLeft, nTop, nWidth * 2, nHeight * 2);
          _updateDrawModules(row, col, 2, 2, drawModules);
        }
        //draw row2
        else if (materials.row2 && _isSatisfyUnit(row, col, 2, 1, drawModules)) {
          _oContext.drawImage(_getRealMaterial(materials.row2), nLeft, nTop, nWidth, nHeight * 2);
          _updateDrawModules(row, col, 2, 1, drawModules);
        }
        //draw col2
        else if (materials.col2 && _isSatisfyUnit(row, col, 1, 2, drawModules)) {
          _oContext.drawImage(_getRealMaterial(materials.col2), nLeft, nTop, nWidth * 2, nHeight);
          _updateDrawModules(row, col, 1, 2, drawModules);
        }
        //draw single
        else if (materials.single && drawModules[row][col]) {
          // console.log(materials.single)
          _oContext.drawImage(_getRealMaterial(materials.single), nLeft, nTop, nWidth, nHeight);
          drawModules[row][col] = false;
        }
        // 否则， 默认以矩形填充
        else {
          _oContext.fillStyle = testColor(_htOption.colorDark) ? _htOption.colorDark : '#000';
          _oContext.fillRect(nLeft, nTop, nWidth + 1, nHeight + 1);
          drawModules[row][col] = false;
        }
      }
    }
  }
}



//---
/**
 * 绘制材质后，将当前的单元设置为false
 *
 * @private
 * @param {Number} row the current row index
 * @param {Number} col the current col index
 * @param {Number} rowRange the row index Range
 * @param {Number} colRange the col index Range
 * 
 */
function _updateDrawModules (row, col, rowRange, colRange, drawModules) {
  for (var i = 0; i < rowRange; i++) {
    for (var j = 0; j < colRange; j++) {
      drawModules[row + i][col + j] = false
    }
  }
}
/**
   * 判断当前 单元 是否满足此材质规则：就是宽高匹不匹配
   *
   * @private
   * @param {Number} row the current row index
   * @param {Number} col the current col index
   * @param {Number} rowRange the row index Range
   * @param {Number} colRange the col index Range
   * 
   */
function _isSatisfyUnit (row, col, rowRange, colRange, drawModules) {
  var nCount = drawModules.length
  var isSatisfy = true;
  if (!(row + rowRange <= nCount) || !(col + colRange <= nCount)) {
    return false;
  }
  for (var i = 0; i < rowRange; i++) {
    for (var j = 0; j < colRange; j++) {
      if (!drawModules[row + i][col + j]) {
        return false
      }
    }
  }
  return isSatisfy;
}
// 加载材质
const loadMaterial = (_htOption) => {
  return new Promise((reslove, reject) => {
    let materials = Object.getOwnPropertyNames(_htOption.materials); // 获取配置中的材质属性，这里是属性名称的数组
    let materialsLength = materials.length // 材质数量
    let counter = 0 // 加载了几个材质的 计数器
    let data = JSON.parse(JSON.stringify(_htOption.materials)) // 最终要返回的数据

    const materialLoaded = () => { // 资源加载完成的回调事件
      counter++
      if (counter === materialsLength) { // 材质已全部加载完毕
        console.log('二维码所需材质加载完成')
        setTimeout(() => { // 为什么要延时，具体原因我也不知道，只知道，不延时的话，虽然这里显示图片加载完成了，实际上却还没有完全加载，导致生成的二维码缺少素材而不能准确显示信息
          reslove({ success: true, data, message: '材质加载成功' })
        }, 500)
      }
    }
    const createImage = (src) => { // 创建图片对象的方法
      let image = new Image() // 创建图片对象
      image.src = src
      image.setAttribute("crossOrigin", 'anonymous') // 允许跨域
      image.onload = materialLoaded // 图片加载完成后立刻执行事件
      image.onerror = function () {
        console.error(`${src} 材质加载失败`)
      }
      return image
    }

    for (let i = 0; i < materialsLength; i++) {
      let material = materials[i] // 材质
      let marterialSrc = _htOption.materials[material] // 用户传入的材质的路径,字符串 或 数组

      if (!marterialSrc) { // 如果没有对应的传入的材质地址，就不加载图片了
        materialLoaded()
        continue
      }

      if (typeof marterialSrc === 'string') { // 如果是字符串，直接创建
        data[material] = createImage(marterialSrc)
        continue
      }

      if (marterialSrc instanceof Array) { // 如果是数组，需要遍历数组，加载材质
        for (let j = 0; j < marterialSrc.length; j++) {
          j && materialsLength++ // 相应的，需要增加的材质增加了，数量++
          data[material][j] = createImage(_htOption.materials[material][j])
        }
      }
    }
  })
}
/**
   * 材质绘制
   *
   * @private
   * @param {String | Array} material input the original material
   * 
   */
const _getRealMaterial = (material) => {
  if (material instanceof Array) {
    return material[Math.floor(Math.random() * material.length)];
  } else {
    return material;
  }
}
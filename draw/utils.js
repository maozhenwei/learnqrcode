export function testColor (color) {
  var re1 = /^#([0-9a-f]{6}|[0-9a-f]{3})$/i
  var re2 = /^rgb\(([0-9]|[0-9][0-9]|25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9])\,([0-9]|[0-9][0-9]|25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9])\,([0-9]|[0-9][0-9]|25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9])\)$/i
  var re3 = /^rgba\(([0-9]|[0-9][0-9]|25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9])\,([0-9]|[0-9][0-9]|25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9])\,([0-9]|[0-9][0-9]|25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9])\,(1|1.0|0.[0-9])\)$/i
  var colorList = ['lightpink', 'pink', 'crimson', 'black', 'gray', 'red', 'navy', 'blue', 'purple', 'teal', 'green', 'yellow', 'orange', 'white']
  return re2.test(color) || re1.test(color) || re3.test(color) || colorList.indexOf(color.toLowerCase()) != -1;
}

// 加载js文件
export async function loadScript (url, callback = null) {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = 'async';
  script.src = url;
  document.body.appendChild(script);

  return await new Promise((reslove) => {
    if (script.readyState) {   //IE
      script.onreadystatechange = function () {
        if (script.readyState == 'complete' || script.readyState == 'loaded') {
          script.onreadystatechange = null;
          callback && callback()
          reslove('ok')
        }
      }
    } else {    //非IE
      script.onload = function () {
        callback && callback()
        reslove('ok')
      }
    }
  })
}
// blob转成base64位格式
export function blobToBase64 (blob) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      resolve(e.target.result);
    };
    fileReader.readAsDataURL(blob);
    fileReader.onerror = () => {
      reject(new Error('blobToBase64 error'));
    };
  });
}

//将base64转换为file
export function dataURLtoFile (dataurl, filename) {
  var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}
// 判断是否是数值
export function isNumber (value) {
  return typeof value === 'number' && !isNaN(value)
}
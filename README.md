|属性  | 描述
|--|--|
| text |  二维码的内容
| width|  输出图的宽,默认256
| height|  输出图的高,默认256
| bgWidth|  如果存在背景图，则背景图的宽,默认256
| bgHeight|  如果存在背景图，则背景图的高,默认256
| top|  配合背景图使用，有了背景图后，就得靠自己来调整二维码在背景图中的位置
| left|  配合背景图使用，有了背景图后，就得靠自己来调整二维码在背景图中的位置
| codeWidth|  二维码区域图的宽,默认256
| codeHeight|  二维码区域图的高,默认256
| colorDark|  前景色，默认黑色，也可以接收以个图片地址
| colorLight|  背景色，默认白色，也可以接收一个图片地址
| correctLevel| 容错等级1,0,3,2 ，默认为1（其实我也没搞懂它的代码中顺序为什么是这样的）
| fillMode|填充模式default, material,colourful,gif，默认default
| logo| 图片地址，可以传一个图片或者一个对象
| materialOption|  设置了材质填充模式时，需要传递的参数
| colourfulOption|  设置了多彩填充模式时，需要传递的参数
| gifOption|  设置了gif填充模式时，需要传递的参数

logo可配置项
|  属性|描述  |
|--|--|
| src |  图片地址|
| logoSize|  logo的大小|
| borderSize|  边框的大小|
| borderRadius|  边框角度|
| logoRadius|  logo的角度|
| borderColor|  边框的颜色|
| borderLineWidth|  边框的粗细|


materialOption可配置项
|  属性|描述  |
|--|--|
| materials|  所需的不同的分块对应的图片资源，需要配置eye, row2col3,  row3col2,  row4, col4, row3,  col3,row2col2, corner,  col2, row2,  single

colourfulOption可配置项
|  属性|描述  |
|--|--|
| mode|  多彩模式，默认线性渐变，可选linear gradient（线性）、radial gradient（径向）、random block（随机块）
|direction|线性渐变的方向，to left、to right 等等
colors|接收一个颜色值数组：例如：['#ffff00', '#33ff00', '#66ffff']

gifOption可配置项
|  属性|描述  |
|--|--|
|src|图片地址|
|delay|每帧的间隔时间，默认40|

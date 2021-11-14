
>代码的原型是这位老哥的，他的[github地址-ArtQRCode](https://github.com/252860883/ArtQRCode)

配合另一位老哥对二维码的讲解--[深度探索二维码及其应用](https://www.cnblogs.com/yunlambert/p/10290367.html)，让我对二维码的理解更深了，我大部分代码都加了注释，不过关于纠错算法的地方，我肝不动了，看不下去了。

初衷是想用在vue项目中，[github地址](https://github.com/maozhenwei/learnqrcode)
#### 效果
普通模式
![在这里插入图片描述](https://img-blog.csdnimg.cn/4df9374a89724b5a85d1ca947f2411c4.png)
原本有的艺术二维码（以图片作为填充元素）
![在这里插入图片描述](https://img-blog.csdnimg.cn/38e57d79320a4792b0356441a586107c.png)


**附加的内容**：我主要是做了些canvas的操作

图片作为前景色填充
![在这里插入图片描述](https://img-blog.csdnimg.cn/72c1f5796e03447c8187bca25a74a26c.png)
图片作为背景色填充
![在这里插入图片描述](https://img-blog.csdnimg.cn/6e2c6428b3dd42a48aa79b0629280a92.png)
多彩模式-线性渐变
![在这里插入图片描述](https://img-blog.csdnimg.cn/f7f99ed0b751477db1e43a3e03612e8b.png)
多彩模式-径向渐变
![在这里插入图片描述](https://img-blog.csdnimg.cn/eb5d93b837084cb1babc8d4d1fdfa359.png)
多彩模式-随机块
![在这里插入图片描述](https://img-blog.csdnimg.cn/9194949673564126a732973054cd3d45.png)
gif--(用到了libgif.js和gif.js)，其实这是一张gif图片，后面小人在跑的
![在这里插入图片描述](https://img-blog.csdnimg.cn/926e375ab6d34416b49faf2ee65fd59c.png)
中心logo
![在这里插入图片描述](https://img-blog.csdnimg.cn/def8aae00a6742dca12abafd0b8bdd7e.png)
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

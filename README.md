<!--
 * @Description:
 * @Version: 1.0.0
 * @Autor: zhangjy
 * @Date: 2023-01-11 14:24:53
 * @LastEditors: zhangjy
 * @LastEditTime: 2023-01-11 14:39:29
-->

## 下载仓库

`git clone https://github.com/zjy2931/alioss-download.git`

## 示例

```js
const downloadDir = require('alioss-d')({
    {
        region: '<Your region>',
        accessKeyId: '<Your AccessKeyId>',
        accessKeySecret: '<Your AccessKeySecret>',
        bucket: 'Your bucket name'
    }
})
/* 
    osspath
    localpath
*/
await downloadDir('test', './test')
```

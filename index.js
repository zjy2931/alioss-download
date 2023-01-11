/*
 * @Description:
 * @Version: 1.0.0
 * @Autor: zhangjy
 * @Date: 2020-08-04 19:18:56
 * @LastEditors: zhangjy
 * @LastEditTime: 2023-01-11 15:29:32
 */
const OSS = require('ali-oss');
const fs = require('fs');
const path = require('path');
const slog = require('single-line-log').stdout;
let dirList = [];
let fileList = [];
let successNums = 0;
let  client = null;
async function downloadDir(ossPath, localPath) {
    console.log('开始下载');
    ossPath = ossPath + '/';
    localPath = localPath + '/';
    dirList = [],
    fileList = []
    successNums = 0;
    await getOssFileList(ossPath);
    await readOssDir(ossPath);
    //创建本地目录
    await _mkdirs(ossPath, localPath);
    //下载文件
    for (let file of fileList) {
        let ossName = file.name;
        let localName = ossName.replace(ossPath, localPath);
        downloadFile(ossName, localName, file);
    }
}
async function downloadFile(ossPath, localPath, e) {
    try {
        await client.get(ossPath, localPath);
    } catch (error) {
        slog('下载失败', e.name, '重新下载');
        downloadFile(ossPath, localPath, e);
        return;
    }
    successNums++;
    slog(`已下载${successNums}/${fileList.length}`);
    if (successNums >= fileList.length) {
        console.log('\n完成下载');
    }
}
async function readOssDir(ossPath, marker) {
    try {
        const result = await client.list({
            prefix: ossPath,
            marker: marker || null,
            delimiter: '/',
        });
        if (result.prefixes) {
            for (let i = 0; i < result.prefixes.length; i++) {
                await readOssDir(result.prefixes[i]);
            }
            result.prefixes.forEach(subDir => {
                dirList.push(subDir);
            });
        }

        if (result.nextMarker) {
            await readOssDir(ossPath, result.nextMarker);
        }
    } catch (e) {
        console.log(e);
    }
}

/**
 * 获取取 oss 文件列表信息
 * @param ossPath oss的文件路径
 */
async function getOssFileList(ossPath) {
    const result = await client.list({
        prefix: ossPath,
    });
    result.objects.forEach(file => {
        let name = file.name;
        if (name.substr(-1) != '/') {
            fileList.push(file);
        }
    });
}
async function getOssFileList(ossPath, marker) {
    const result = await client.list({
        prefix: ossPath,
        marker: marker || null,
    });
    result.objects.forEach(file => {
        let name = file.name;
        if (name.substr(-1) != '/') {
            fileList.push(file);
        }
    });
    if (result.nextMarker) {
        await getOssFileList(ossPath, result.nextMarker);
    }
}
function _mkdirs(ossPath, localPath) {
    return new Promise(resolve => {
        let n = 0;
        for (let i = 0; i < dirList.length; i++) {
            let dir = dirList[i];
            dir = dir.replace(ossPath, localPath);
            mkdirs(dir, () => {
                n++;
                if (n >= dirList.length) {
                    resolve();
                }
            });
        }
    });
}
function mkdirs(dirname, callback) {
    fs.exists(dirname, exists => {
        if (exists) return callback();
        mkdirs(path.dirname(dirname), () => {
            fs.mkdir(dirname, callback);
        });
    });
}
module.exports =  function(options) {
    client = new OSS(options);
    return downloadDir
}


let axios = require('axios');
const download = require('download');
let shell = require('shelljs');
function downloadTs(url,name,options){
    return download(url,name,options)
}
const fs = require('fs');
const path = require('path');
const textName = 'index.txt';
const tsName ='ffts.txt';
function setALlupdate(){
    axios.get('https://liveplay-byte.xiaoeknow.com/live/5060_Z43s4yJ4DT8xGHAC_720P.m3u8').then(res=>{
        let reg = /\n(.*\.ts)\n/g;
        let result = res.data.match(reg).map(item=>item.replace(/\n/g,'')).map(item=>{
            return {
                url:"https://liveplay-byte.xiaoeknow.com/live/"+item,
                name:item
            }
        }).map(item=>{
           let fileName = item.name;
           if(checkFieIsExist('/raw/'+fileName)){

           }else{
            downloadTs(item.url,'raw/',{filename:item.name})
           }
            
            
        })
        setALlupdate();
    })
}
function checkFieIsExist(filename){
    return fs.existsSync(filename)
}
// setALlupdate()
function handlerTs({name,url}={},filepath){
    writeText(name,path.join(filepath,'/',textName));
    downloadTs(url,path.join(filepath,'/'),{filename:name})
}
function writeText(url,txtPath){
    let res = fs.readFileSync(txtPath,'utf-8');
    if(!res.includes(url)){
        fs.appendFileSync(txtPath,url+'\n');
    }
}
function getBasePath(url){
    return path.resolve(__dirname,url)
}
function makeDir(path){
    if(!checkFieIsExist(path)){
        fs.mkdirSync(path)
    }
}
function makeFile(path){ 
    if(!checkFieIsExist(path)){
        fs.mkdirSync(path)
    }
}
function initPath(dirPath){
    let rootPath = getBasePath(dirPath);
    makeDir(path.join(rootPath))
    fs.writeFileSync(path.join(rootPath,'/',textName),'')
    // makeFile();
    return rootPath;
}
function initDown(url,path){
    axios.get(url).then(res=>{
        let reg = /\n(.*\.ts)\n/g;
        let result = res.data.match(reg).map(item=>item.replace(/\n/g,'')).map(item=>{
            return {
                url:"https://liveplay-byte.xiaoeknow.com/live/"+item,
                name:item
            }
        }).map(item=>{
           handlerTs(item,path);
        })
        initDown(url,path);
    }).catch(err=>{
        if(err.response.statusText == 'Not Found'){
            getMp4(path);
        }else{
            console.log(err)
            console.error("报错啦！！:"+err.response.statusText);
            initDown(url,path);
        }
       
    })
}
function createNewText(dirPath){
    // fs.readdir(dirPath,(err,files)=>{
    //     let res = files.filter(item=>{
    //         return item.includes('.ts')
    //     }).map(item=>{
    //         return `file ${dirPath}\\${item}`.replace(/\\/g,"/")
    //     }).join('\n');
    //     fs.writeFileSync(path.join(dirPath,'/',tsName),res);
    //     console.log(res)
    // })
    // return
    // let res = fs.readFileSync(path.join(dirPath,'/',textName),'utf-8');
    // let data =res.replace(/^(?=(.*\n))/gm,'file '+dirPath+'\\').replace(/\\/g,"/");
    // fs.writeFileSync(path.join(dirPath,'/',tsName),data);
    let videoName = dirPath.split('\\').pop()
    return {
        textPath:path.join(dirPath,'/',tsName),
        videoPath:path.join(dirPath,'/',`${videoName}.mp4`)
    }
}
function mergeVideo(orderPath,resFileName){
   
    let shellLs = `ffmpeg -f concat -safe 0 -i ${orderPath}  -acodec copy -vcodec copy -absf aac_adtstoasc ${resFileName}`;
    shell.exec(shellLs,{async: false})
}
function getMp4(path){
   let {textPath,videoPath} = createNewText(path);
  console.log(textPath,videoPath)
//    return
    mergeVideo(textPath,videoPath)
}
function main(url,dirPath){
    let path = initPath(dirPath);
    initDown(url,path)
}
main('https://liveplay-byte.xiaoeknow.com/live/5060_b3AtFrkbWbDTcJfM.m3u8?time=1663329886490&uuid=u_631f159951a1a_y4UWW72lHG','第二天');

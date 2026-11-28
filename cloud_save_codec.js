/* Compact, lossless cloud transport. Legacy protected Base64 remains readable. */
(function(host){
 'use strict';
 const PREFIX='acgz1:',MAX_CODE=32*1024*1024,MAX_RAW=22*1024*1024,MAX_CLOUD_BYTES=90000;
 function bytesToBase64(bytes){let binary='';for(let i=0;i<bytes.length;i+=32768)binary+=String.fromCharCode(...bytes.subarray(i,i+32768));return host.btoa(binary);}
 function base64Bytes(text){if(typeof text!=='string'||!text.length||text.length>MAX_CODE||text.length%4!==0||!/^[A-Za-z0-9+/]*={0,2}$/.test(text))throw Error('Invalid backup code.');const binary=host.atob(text);if(host.btoa(binary)!==text)throw Error('Invalid backup code.');return Uint8Array.from(binary,c=>c.charCodeAt(0));}
 async function transform(bytes,kind){const Constructor=kind==='pack'?host.CompressionStream:host.DecompressionStream;if(!Constructor)throw Error('This browser cannot decompress the save. Use a current browser.');const reader=new Blob([bytes]).stream().pipeThrough(new Constructor('gzip')).getReader();let size=0;const chunks=[];try{while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>MAX_RAW){await reader.cancel();throw Error('Backup exceeds the safe decoded size.');}chunks.push(value);}}finally{reader.releaseLock();}const result=new Uint8Array(size);let at=0;for(const chunk of chunks){result.set(chunk,at);at+=chunk.length;}return result;}
 async function pack(protectedCode){if(!host.CompressionStream||!host.DecompressionStream)return protectedCode;const compact=PREFIX+bytesToBase64(await transform(base64Bytes(protectedCode),'pack'));return compact.length<protectedCode.length?compact:protectedCode;}
 async function unpack(code){if(typeof code!=='string'||code.length>MAX_CODE)throw Error('Backup code exceeds the safe size.');if(!code.startsWith(PREFIX))return code;return bytesToBase64(await transform(base64Bytes(code.slice(PREFIX.length)),'unpack'));}
 // Use only progression for comparison. The live clock still travels in a
 // snapshot, but changing weather/time alone must not produce a cloud write.
 function progression(bundle,summary,mainKey){const storage={...bundle.storage},main={...storage[mainKey]};delete main.weather;delete main.lastResultId;storage[mainKey]=main;return host.OnlineUtils.stable({storage,summary});}
 host.CloudSaveCodec=Object.freeze({pack,unpack,progression,MAX_CLOUD_BYTES,MAX_CODE});
})(window);

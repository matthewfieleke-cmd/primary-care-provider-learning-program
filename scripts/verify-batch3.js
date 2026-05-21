const fs = require("fs");
const start = fs.readFileSync("index.html","utf8").indexOf("const QUESTIONS = [");
let d=0,e=-1,h=fs.readFileSync("index.html","utf8");
for(let i=start;i<h.length;i++){if(h[i]==="[")d++;if(h[i]===']'){d--;if(d===0){e=i+1;break;}}}
const qs=eval(h.slice(start,e).replace("const QUESTIONS = ",""));
console.log("Total:", qs.length, "Max:", Math.max(...qs.map(q=>q.id)));
function wc(s){return s.split(/\s+/).filter(Boolean).length;}
qs.filter(q=>q.id>=769&&q.id<=793).forEach(q=>{
  const w=wc(q.explanation);
  console.log((w>=400&&w<=425?"OK":"!!")+` Q${q.id}: ${w}w`);
});

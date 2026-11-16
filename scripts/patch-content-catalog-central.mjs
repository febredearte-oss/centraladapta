import { readFileSync, writeFileSync } from "node:fs";

const file="public/index.html";
let html=readFileSync(file,"utf8");
const old=`function allPosts(){
  return[
    ...POSTS,
    ...(state.holidayContents||[]).filter(post=>post.active!==false)
  ];
}`;
const replacement=`function allPosts(){
  const centralCatalog=Array.isArray(state?.contentCatalog)&&state.contentCatalog.length
    ? state.contentCatalog
    : POSTS;
  return[
    ...centralCatalog,
    ...(state.holidayContents||[]).filter(post=>post.active!==false)
  ];
}`;
if(!html.includes(old)) throw new Error("allPosts original não encontrado");
html=html.replace(old,replacement);
writeFileSync(file,html,"utf8");
console.log("Content catalog now reads from central D1 state.");

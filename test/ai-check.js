const E=require('../src/engine.js');
function duel(lvlA, lvlB, n){
  let a=0,b=0,d=0;
  for(let s=0;s<n;s++){
    const st=E.newGame({seed:4000+s*13, aiLevel:'normal',
      player:{empire:'rajput',ally:'neutral',deck:E.buildDeck('rajput','neutral')},
      enemy:{empire:'rajput',ally:'neutral',deck:E.buildDeck('rajput','neutral')}});
    let g=0;
    while(!st.over && g++<300){ E.aiTurn(st, st.active, st.active===0?lvlA:lvlB); }
    if(st.winner===0)a++; else if(st.winner===1)b++; else d++;
  }
  console.log(`${lvlA} (p0) vs ${lvlB} (p1):`, a,'/',b,'/',d);
}
duel('hard','normal',120);
duel('normal','hard',120);
duel('normal','easy',120);
duel('hard','hard',80);

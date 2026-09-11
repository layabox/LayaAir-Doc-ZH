(function(){
  const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
  let w=0,h=0,dpr=1,p1=270,p2=730,keys={};
  addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(['ArrowLeft','ArrowRight'].includes(e.key))e.preventDefault()});
  addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
  function resize(){dpr=Math.min(devicePixelRatio||1,2);w=innerWidth;h=innerHeight;canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0)}
  addEventListener('resize',resize);resize();
  function world(viewX,viewW,player,color,label){
    ctx.save();ctx.beginPath();ctx.rect(viewX,0,viewW,h);ctx.clip();
    const cam=Math.max(viewW/2,Math.min(1000-viewW/2,player));
    ctx.translate(viewX+viewW/2-cam,0);
    const grad=ctx.createLinearGradient(0,0,0,h);grad.addColorStop(0,'#183153');grad.addColorStop(1,'#0f766e');ctx.fillStyle=grad;ctx.fillRect(0,0,1000,h);
    ctx.fillStyle='#334155';ctx.fillRect(0,h-100,1000,100);ctx.fillStyle='#64748b';for(let x=0;x<1000;x+=80)ctx.fillRect(x,h-104,50,4);
    for(let x=110;x<950;x+=170){ctx.fillStyle='#1e293b';ctx.fillRect(x,h-190,90,90);ctx.fillStyle='#fbbf24';ctx.fillRect(x+15,h-170,20,25)}
    ctx.fillStyle=color;ctx.fillRect(player-18,h-150,36,50);ctx.beginPath();ctx.arc(player,h-162,17,0,Math.PI*2);ctx.fill();
    ctx.restore();ctx.fillStyle='#fff';ctx.font='700 22px system-ui';ctx.fillText(label,viewX+18,46);ctx.font='13px system-ui';ctx.fillStyle='#bae6fd';ctx.fillText('Camera center: '+Math.round(cam),viewX+18,68);
  }
  function tick(){const s=4;if(keys.a)p1-=s;if(keys.d)p1+=s;if(keys.arrowleft)p2-=s;if(keys.arrowright)p2+=s;p1=Math.max(20,Math.min(980,p1));p2=Math.max(20,Math.min(980,p2));ctx.clearRect(0,0,w,h);const half=w/2;world(0,half,p1,'#38bdf8','1P · Area2D A');world(half,w-half,p2,'#fb7185','2P · Area2D B');ctx.fillStyle='#e2e8f0';ctx.fillRect(half-2,0,4,h);requestAnimationFrame(tick)}tick();
})();

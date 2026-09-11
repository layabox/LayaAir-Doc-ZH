(function(){
 const c=document.getElementById('game'),g=c.getContext('2d');let w,h,d=1,target={x:650,y:160};
 function size(){d=Math.min(devicePixelRatio||1,2);w=innerWidth;h=innerHeight;c.width=w*d;c.height=h*d;g.setTransform(d,0,0,d,0,0)}addEventListener('resize',size);size();
 function point(e){const p=e.touches?e.touches[0]:e;target.x=p.clientX;target.y=p.clientY}addEventListener('mousemove',point);addEventListener('touchmove',e=>{point(e);e.preventDefault()},{passive:false});
 function loop(){g.clearRect(0,0,w,h);const root={x:w*.5,y:h*.76},lens=[105,90,72],pts=[root],dx=target.x-root.x,dy=target.y-root.y,base=Math.atan2(dy,dx),bend=Math.max(-.65,Math.min(.65,(target.y-root.y)/240));let a=base-bend*.65;
  for(let i=0;i<lens.length;i++){if(i===1)a+=bend;if(i===2)a+=bend*.25;pts.push({x:pts[i].x+Math.cos(a)*lens[i],y:pts[i].y+Math.sin(a)*lens[i]})}
  g.strokeStyle='#334155';g.lineWidth=1;for(let x=0;x<w;x+=40){g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke()}for(let y=0;y<h;y+=40){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke()}
  g.strokeStyle='#ef4444';g.lineWidth=3;g.beginPath();g.arc(root.x,root.y,70,-2.7,-.45);g.stroke();
  g.lineCap='round';g.lineJoin='round';g.strokeStyle='#f8fafc';g.lineWidth=18;g.beginPath();g.moveTo(root.x,root.y);for(let i=1;i<pts.length;i++)g.lineTo(pts[i].x,pts[i].y);g.stroke();g.strokeStyle='#38bdf8';g.lineWidth=7;g.stroke();
  for(const p of pts){g.fillStyle='#fbbf24';g.beginPath();g.arc(p.x,p.y,10,0,Math.PI*2);g.fill()}
  g.strokeStyle='#fb7185';g.lineWidth=3;g.beginPath();g.arc(target.x,target.y,14,0,Math.PI*2);g.moveTo(target.x-22,target.y);g.lineTo(target.x+22,target.y);g.moveTo(target.x,target.y-22);g.lineTo(target.x,target.y+22);g.stroke();
  g.fillStyle='#cbd5e1';g.font='14px system-ui';g.fillText('IK_Comp：求解目标',18,h-42);g.fillText('BoneConstraints：限制关节角度',18,h-20);requestAnimationFrame(loop)}loop();
})();

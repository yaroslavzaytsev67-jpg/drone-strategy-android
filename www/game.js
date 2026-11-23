(()=>{
'use strict';
const W=720,H=1280;
class AirDefense extends Phaser.Scene{
 constructor(){super('air-defense');this.cash=520;this.wave=0;this.cityHp=12;this.kills=0;this.towers=[];this.enemies=[];this.missiles=[];this.effects=[];this.pick=null;this.structures=[];this.audioOn=true;this.active=false;this.paused=false;this.speed=1;this.spawnLeft=0;this.spawnClock=0;this.message='РАЗМЕСТИ ПВО НА КАРТЕ И ЗАПУСТИ ВОЛНУ';}
 create(){this.paintTerrain();this.units=this.add.graphics();this.fx=this.add.graphics();this.hud=this.add.container();this.makeHud();this.input.on('pointerdown',p=>this.onTap(p.x,p.y));this.events.on('update',this.updateGame,this);this.redraw();}
 paintTerrain(){
 const g=this.add.graphics();
 g.fillGradientStyle(0x657b50,0x657b50,0x425e43,0x425e43,1);g.fillRect(0,0,W,H);
 let seed=813;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<650;i++){let x=rnd()*W,y=180+rnd()*900,r=2+rnd()*12;g.fillStyle([0x354f39,0x466441,0x718153,0x526d48][i%4],.28+rnd()*.28);g.fillCircle(x,y,r);}
 // river and banks
 g.lineStyle(54,0x9b9a70,1).beginPath().moveTo(-30,360).lineTo(130,390).lineTo(270,350).lineTo(410,430).lineTo(570,402).lineTo(750,455).strokePath();
 g.lineStyle(43,0x38788a,1).beginPath().moveTo(-30,360).lineTo(130,390).lineTo(270,350).lineTo(410,430).lineTo(570,402).lineTo(750,455).strokePath();
 g.lineStyle(3,0x9bc4b8,.5).beginPath().moveTo(-30,350).lineTo(130,380).lineTo(270,340).lineTo(410,420).lineTo(570,392).lineTo(750,445).strokePath();
 // road route
 this.route=[[-25,1050],[85,950],[178,865],[255,785],[350,705],[390,610],[478,540],[520,430],[615,360],[750,290]];
 g.lineStyle(42,0x3d423c,1).beginPath();this.route.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.strokePath();
 g.lineStyle(31,0xb6a27a,1).beginPath();this.route.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.strokePath();
 g.lineStyle(2,0xe2d1a5,.75).beginPath();this.route.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.strokePath();
 // topographic contour lines and drainage gullies
 for(let k=0;k<6;k++){g.lineStyle(2,0xc3c18a,.17).strokeEllipse(115+k*4,690+k*3,170+k*23,88+k*17);g.lineStyle(2,0x263f35,.2).strokeEllipse(570-k*5,760+k*4,145+k*19,105+k*15);}
 g.lineStyle(13,0x53654a,.9).beginPath().moveTo(20,570).lineTo(110,535).lineTo(190,565).lineTo(260,520).strokePath();
 g.lineStyle(5,0x8a9665,.8).beginPath().moveTo(20,570).lineTo(110,535).lineTo(190,565).lineTo(260,520).strokePath();
 // fields and crop lines
 for(let k=0;k<8;k++){let x=20+(k%4)*170,y=230+Math.floor(k/4)*610;g.lineStyle(2,0x9a9a63,.32);for(let n=0;n<5;n++){g.beginPath().moveTo(x+n*18,y).lineTo(x+n*18+55,y+90).strokePath();}}
 // woodland clusters
 for(let i=0;i<23;i++){let x=18+(i*97)%680,y=220+(i*173)%820;if(Math.abs(y-360)<80||Math.abs(y-430)<75)continue;for(let j=0;j<5;j++){let tx=x+(j%3)*18-15,ty=y+Math.floor(j/3)*19;g.fillStyle(0x263d2d,.7).fillCircle(tx+3,ty+5,12);g.fillStyle([0x31543a,0x3e6341,0x52734a][j%3],1).fillCircle(tx,ty,11);}}
 // town blocks
 const blocks=[[395,180],[500,190],[430,255],[540,270],[610,205],[330,240],[600,300]];
 for(const [x,y] of blocks){for(let n=0;n<3;n++){let bx=x+(n%2)*32,by=y+Math.floor(n/2)*30;g.fillStyle(0x393e3a,.5).fillRect(bx+3,by+4,27,21);g.fillStyle(0xb7b09b,1).fillRect(bx,by,27,20);g.fillStyle(0x8c5949,1).fillTriangle(bx-3,by,bx+13,by-10,bx+30,by);g.fillStyle(0x53636a,1).fillRect(bx+5,by+6,6,7);}}
 // protected industrial site
 g.fillStyle(0x293b3b,1).fillRoundedRect(490,82,164,70,8);g.lineStyle(2,0xa3c6b8,1).strokeRoundedRect(490,82,164,70,8);g.fillStyle(0x738c79,1).fillRect(505,99,130,38);g.fillStyle(0xd6cba1,1).fillRect(518,110,34,15);g.fillStyle(0xc5a66b,1).fillCircle(588,118,9);g.fillStyle(0xd8e7d4,1).fillCircle(620,118,5);
 // airstrip
 g.fillStyle(0x555c54,1).fillRoundedRect(55,205,180,42,5);g.lineStyle(2,0xd3d2bc,1).strokeRoundedRect(55,205,180,42,5);g.lineStyle(2,0xe4e3d0,.8).beginPath().moveTo(68,226).lineTo(220,226).strokePath();
 this.structures=[{x:590,y:118,w:92,h:65,type:'power',name:'ЭЛЕКТРОСТАНЦИЯ',hp:8,max:8},{x:115,y:300,w:96,h:60,type:'gas',name:'ГАЗОВАЯ СТАНЦИЯ',hp:6,max:6},{x:395,y:190,w:48,h:42,type:'home',name:'ДОМ',hp:3,max:3},{x:500,y:210,w:48,h:42,type:'home',name:'ДОМ',hp:3,max:3},{x:440,y:275,w:48,h:42,type:'home',name:'ДОМ',hp:3,max:3},{x:565,y:290,w:48,h:42,type:'home',name:'ДОМ',hp:3,max:3},{x:635,y:220,w:48,h:42,type:'home',name:'ДОМ',hp:3,max:3},{x:340,y:260,w:48,h:42,type:'home',name:'ДОМ',hp:3,max:3}];
 this.drawStructures(g);
 // labels
 this.add.text(28,177,'СЕКТОР 04 / КАРТА ОБОРОНЫ',{fontSize:16,color:'#f4f1d9',fontStyle:'bold',stroke:'#26392d',strokeThickness:3});
 this.add.text(498,58,'ОБЪЕКТ «СЕВЕР»',{fontSize:13,color:'#f7e6b7',fontStyle:'bold',stroke:'#26392d',strokeThickness:3});
 this.add.text(28,1002,'НАПРАВЛЕНИЕ УДАРА',{fontSize:12,color:'#fff0c6',fontStyle:'bold',stroke:'#3a4135',strokeThickness:3});
 }
 makeHud(){
 const panel=(x,y,w,h,c=0x102638)=>{let r=this.add.rectangle(x,y,w,h,c,.96).setStrokeStyle(2,0x829c9c);this.hud.add(r);};
 panel(360,34,700,70);this.stats=this.add.text(20,12,'',{fontSize:19,color:'#f0f6ed',fontStyle:'bold'});this.res=this.add.text(20,43,'',{fontSize:15,color:'#ffdfa0',fontStyle:'bold'});this.hud.add([this.stats,this.res]);
 panel(360,1184,700,184,0x102638);
 this.status=this.add.text(20,1088,this.message,{fontSize:15,color:'#fff2cf',fontStyle:'bold',wordWrap:{width:680}});this.hud.add(this.status);
 this.button(18,1120,160,58,'ПУЛЕМЁТНАЯ\nЗСУ  •  90',()=>this.select('gun'),0x496447);
 this.button(190,1120,160,58,'РАКЕТНОЕ ПВО\nЗРК  •  180',()=>this.select('sam'),0x315f7b);
 this.button(362,1120,160,58,'РАДАР\nОБНАРУЖЕНИЕ • 120',()=>this.select('radar'),0x60537d);
 this.button(534,1120,168,58,'НАЧАТЬ\nВОЛНУ',()=>this.startWave(),0x874b3d);
 this.button(18,1192,160,50,'СКОРОСТЬ ×'+this.speed,()=>{this.speed=this.speed%3+1;this.refreshHud();},0x344d60);
 this.button(190,1192,150,50,'ПАУЗА',()=>{this.paused=!this.paused;this.refreshHud();},0x344d60);
 this.button(350,1192,170,50,'ЗВУК: ВКЛ',()=>{this.audioOn=!this.audioOn;this.refreshHud();},0x344d60);this.button(530,1192,172,50,'НОВАЯ ОПЕРАЦИЯ',()=>this.scene.restart(),0x59434b);
 this.refreshHud();
 }
 button(x,y,w,h,label,fn,color){let r=this.add.rectangle(x+w/2,y+h/2,w,h,color).setStrokeStyle(2,0xb8c8bb).setInteractive();let t=this.add.text(x+w/2,y+h/2,label,{fontSize:13,color:'#fff',fontStyle:'bold',align:'center',lineSpacing:1}).setOrigin(.5).setInteractive();r.on('pointerdown',fn);t.on('pointerdown',fn);this.hud.add([r,t]);}
 refreshHud(){this.stats.setText('SKYFRONT  •  ВОЛНА '+this.wave+'  •  ЦЕЛОСТНОСТЬ ОБЪЕКТА '+this.cityHp+'/12');this.res.setText('БЮДЖЕТ '+this.cash+'  •  УНИЧТОЖЕНО '+this.kills+'  •  СКОРОСТЬ ×'+this.speed);this.status.setText((this.paused?'ПАУЗА • ':'')+(this.audioOn?'ЗВУК ВКЛ • ':'ЗВУК ВЫКЛ • ')+this.message);}
 select(type){this.pick=type;this.message=({gun:'ВЫБРАНА ЗСУ: скорострельная установка. Нажми на площадку вне дороги.',sam:'ВЫБРАН ЗРК: ракеты поражают бронированные цели на большой дальности.',radar:'ВЫБРАН РАДАР: увеличивает обнаружение и дальность работы ПВО.'})[type];this.refreshHud();this.redraw();}
 onTap(x,y){if(y<170||y>1080||!this.pick)return;let cost={gun:90,sam:180,radar:120}[this.pick];if(this.cash<cost){this.message='НЕ ХВАТАЕТ БЮДЖЕТА';this.refreshHud();return;}if(this.route.some(p=>Math.hypot(p[0]-x,p[1]-y)<58)||Math.hypot(575-x,120-y)<78||this.towers.some(t=>Math.hypot(t.x-x,t.y-y)<58)){this.message='ЭТА ПОЗИЦИЯ НЕ ПОДХОДИТ. ВЫБЕРИ ДРУГУЮ ПЛОЩАДКУ.';this.refreshHud();return;}this.cash-=cost;this.towers.push({type:this.pick,x,y,range:{gun:150,sam:250,radar:310}[this.pick],cool:0,ammo:this.pick==='sam'?14:999});this.pick=null;this.soundTone(520,.09);this.message='ПОЗИЦИЯ ЗАНЯТА. СИСТЕМА ГОТОВА К РАБОТЕ.';this.refreshHud();this.redraw();}
 startWave(){if(this.active||this.paused)return;this.wave++;this.active=true;this.spawnLeft=5+this.wave*2;this.spawnClock=0;this.message='ВОЗДУШНАЯ АТАКА! ПВО АВТОМАТИЧЕСКИ ОБСТРЕЛИВАЕТ ЦЕЛИ.';this.refreshHud();}
 spawn(){let heavy=this.wave>2&&Math.random()<.32;this.enemies.push({x:this.route[0][0],y:this.route[0][1],i:0,h:heavy?6:2,max:heavy?6:2,v:heavy?31:47,heavy,phase:Math.random()*6.28});}
 updateGame(time,ms){if(this.paused)return;let dt=Math.min(ms/1000,.05)*this.speed;
 if(this.active){this.spawnClock+=dt;if(this.spawnLeft&&this.spawnClock>.9){this.spawnClock=0;this.spawnLeft--;this.spawn();}if(!this.spawnLeft&&!this.enemies.length){this.active=false;let bonus=100+this.wave*25;this.cash+=bonus;this.message='АТАКА ОТБИТА. НАГРАДА: +'+bonus+' БЮДЖЕТА.';this.refreshHud();}}
 for(const e of [...this.enemies]){let b=this.route[e.i+1];if(!b){this.enemies=this.enemies.filter(a=>a!==e);this.cityHp=Math.max(0,this.cityHp-1);let target=this.structures.filter(s=>s.hp>0).sort((a,b)=>Math.hypot(a.x-e.x,a.y-e.y)-Math.hypot(b.x-e.x,b.y-e.y))[0];if(target){target.hp=Math.max(0,target.hp-(target.type==='home'?1:2));this.effects.push({x:target.x,y:target.y,life:.9,max:.9,big:true});}this.soundTone(75,.35);this.message=target?'ПРОРЫВ! ПОПАДАНИЕ: '+target.name+'.':'ПРОРЫВ! ОБЪЕКТ ПОВРЕЖДЁН.';this.refreshHud();continue;}let dx=b[0]-e.x,dy=b[1]-e.y,d=Math.hypot(dx,dy),v=e.v*dt;if(d<v){e.x=b[0];e.y=b[1];e.i++;}else{e.x+=dx/d*v;e.y+=dy/d*v;}e.phase+=dt*5;}
 for(const t of this.towers){if(t.type==='radar')continue;t.cool-=dt;if(t.cool>0)continue;let e=this.enemies.filter(a=>Math.hypot(a.x-t.x,a.y-t.y)<t.range+(this.towers.some(r=>r.type==='radar')?45:0)).sort((a,b)=>Math.hypot(a.x-t.x,a.y-t.y)-Math.hypot(b.x-t.x,b.y-t.y))[0];if(e&&(t.type==='gun'||t.ammo)){t.cool=t.type==='gun'?.36:1.55;if(t.type==='sam')t.ammo--;this.missiles.push({x:t.x,y:t.y-10,target:e,dmg:t.type==='sam'?3:1,kind:t.type});}}
 for(const m of [...this.missiles]){if(!this.enemies.includes(m.target)){this.missiles=this.missiles.filter(a=>a!==m);continue;}let dx=m.target.x-m.x,dy=m.target.y-m.y,d=Math.hypot(dx,dy),v=(m.kind==='sam'?390:570)*dt;if(d<v+7){m.target.h-=m.dmg;this.missiles=this.missiles.filter(a=>a!==m);this.effects.push({x:m.target.x,y:m.target.y,life:.38,max:.38});this.soundTone(110,.06);if(m.target.h<=0){this.enemies=this.enemies.filter(a=>a!==m.target);this.kills++;this.cash+=20;}}else{m.x+=dx/d*v;m.y+=dy/d*v;}}
 for(const fx of this.effects)fx.life-=dt;this.effects=this.effects.filter(f=>f.life>0);this.redraw();}
 soundTone(freq,duration){if(!this.audioOn)return;try{const ctx=this.sound.context;if(ctx.state==='suspended')ctx.resume();const o=ctx.createOscillator(),gain=ctx.createGain();o.type='triangle';o.frequency.setValueAtTime(freq,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(35,freq*.55),ctx.currentTime+duration);gain.gain.setValueAtTime(.0001,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.12,ctx.currentTime+.012);gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration);o.connect(gain);gain.connect(ctx.destination);o.start();o.stop(ctx.currentTime+duration+.02);}catch(e){}}
 drawStructures(g){for(const s of this.structures){if(s.hp<=0){g.fillStyle(0x272b29,1).fillRect(s.x-s.w/2,s.y-s.h/2,s.w,s.h);g.fillStyle(0x171b1b,.8).fillCircle(s.x,s.y,13);g.lineStyle(3,0x6c5443,1).beginPath().moveTo(s.x-20,s.y-15).lineTo(s.x+18,s.y+15).moveTo(s.x+18,s.y-15).lineTo(s.x-20,s.y+15).strokePath();continue;}if(s.type==='power'){g.fillStyle(0x333e42,1).fillRoundedRect(s.x-48,s.y-31,96,62,6);g.fillStyle(0x8d9b91,1).fillRect(s.x-38,s.y-22,76,44);g.fillStyle(0x4d5e5a,1).fillRect(s.x-28,s.y-12,25,25);g.fillStyle(0xb8b4a0,1).fillRect(s.x+9,s.y-26,14,48);g.fillStyle(0xb5d4d2,.8).fillRect(s.x+12,s.y-38,8,12);g.fillStyle(0xd8c58b,1).fillCircle(s.x-14,s.y-1,5);}else if(s.type==='gas'){g.fillStyle(0x40464a,1).fillRoundedRect(s.x-48,s.y-30,96,60,7);g.fillStyle(0xd5c8a3,1).fillRoundedRect(s.x-35,s.y-18,70,36,4);g.fillStyle(0xb44e3e,1).fillRect(s.x-28,s.y-12,56,8);g.fillStyle(0xe8dfc4,1).fillRect(s.x-23,s.y+2,46,12);g.fillStyle(0x435c65,1).fillRect(s.x-7,s.y-4,14,18);}else{g.fillStyle(0x3b3b36,.5).fillRect(s.x-s.w/2+3,s.y-s.h/2+5,s.w,s.h);g.fillStyle(0xc7bda4,1).fillRect(s.x-s.w/2,s.y-s.h/2,s.w,s.h);g.fillStyle(0x974e43,1).fillTriangle(s.x-s.w/2-4,s.y-s.h/2,s.x,s.y-s.h/2-17,s.x+s.w/2+4,s.y-s.h/2);g.fillStyle(0x546b72,1).fillRect(s.x-7,s.y-5,13,14);}g.fillStyle(0x1a2925,.85).fillRect(s.x-s.w/2,s.y-s.h/2-11,s.w,4);g.fillStyle(s.hp/s.max>.5?0x73d18b:0xe8a14c,1).fillRect(s.x-s.w/2,s.y-s.h/2-11,s.w*s.hp/s.max,4);}}
 drawUnit(g,t){const c=t.type==='sam'?0x8bd8ff:t.type==='gun'?0xffd27c:0xd1b3ff;g.lineStyle(2,c,.15).strokeCircle(t.x,t.y,t.range);
 if(t.type==='radar'){g.fillStyle(0x202e32,1).fillRoundedRect(t.x-31,t.y-22,62,44,7);for(let k=0;k<4;k++){g.fillStyle(0x687a70,1).fillCircle(t.x-20+k*13,t.y+17,5);}g.lineStyle(4,0x87958a,1).beginPath().moveTo(t.x-3,t.y-5).lineTo(t.x+9,t.y-31).strokePath();g.lineStyle(3,c,1).strokeCircle(t.x+9,t.y-31,12);g.lineStyle(2,c,.7).beginPath().arc(t.x+9,t.y-31,17,-2.6,1.4,false).strokePath();g.fillStyle(c,1).fillCircle(t.x,t.y-4,5);return;}
 // tracked mobile chassis and wheels
 g.fillStyle(0x202a2a,1).fillRoundedRect(t.x-34,t.y-17,68,34,8);g.fillStyle(0x64766a,1).fillRoundedRect(t.x-30,t.y-13,60,26,6);for(let k=-2;k<=2;k++){g.fillStyle(0x222c2d,1).fillCircle(t.x+k*12,t.y+13,5);g.fillStyle(0x91a094,1).fillCircle(t.x+k*12,t.y+13,2);}
 if(t.type==='sam'){g.fillStyle(0x43564f,1).fillRoundedRect(t.x-17,t.y-13,34,26,5);g.fillStyle(0x87988d,1).fillRoundedRect(t.x-10,t.y-23,20,12,4);g.lineStyle(5,0x9aaea3,1).beginPath().moveTo(t.x-8,t.y-17).lineTo(t.x-26,t.y-46).moveTo(t.x+8,t.y-17).lineTo(t.x+26,t.y-46).strokePath();g.lineStyle(2,0xe0e8d7,1).beginPath().moveTo(t.x-26,t.y-46).lineTo(t.x-30,t.y-52).moveTo(t.x+26,t.y-46).lineTo(t.x+30,t.y-52).strokePath();g.fillStyle(0xffc27a,1).fillTriangle(t.x-32,t.y-51,t.x-25,t.y-51,t.x-28,t.y-59);g.fillTriangle(t.x+25,t.y-51,t.x+32,t.y-51,t.x+28,t.y-59);g.fillStyle(c,1).fillCircle(t.x,t.y-17,4);}
 else{g.fillStyle(0x3a4942,1).fillRoundedRect(t.x-15,t.y-16,30,24,6);g.fillStyle(0x9b9b81,1).fillEllipse(t.x,t.y-14,32,18);g.lineStyle(6,0x9da99b,1).beginPath().moveTo(t.x+3,t.y-16).lineTo(t.x+37,t.y-28).moveTo(t.x+3,t.y-11).lineTo(t.x+37,t.y-23).strokePath();g.lineStyle(2,0x303a38,1).beginPath().moveTo(t.x+34,t.y-30).lineTo(t.x+41,t.y-30).moveTo(t.x+34,t.y-20).lineTo(t.x+41,t.y-20).strokePath();g.fillStyle(c,1).fillCircle(t.x,t.y-14,5);g.fillStyle(0x242d2d,1).fillRect(t.x-7,t.y-3,14,8);}
 }
 drawDrone(g,e){let bob=Math.sin(e.phase)*3,x=e.x,y=e.y+bob;g.lineStyle(3,0x1c2526,.9).strokeCircle(x,y,22);g.fillStyle(e.heavy?0x722f38:0x303d3c,1).fillEllipse(x,y,34,18);g.fillStyle(e.heavy?0xd57a6b:0x9eaaa0,1).fillTriangle(x-6,y-5,x+22,y,x-6,y+5);g.fillStyle(0x202a2b,1).fillRect(x-13,y-3,20,6);g.lineStyle(3,0x242e30,1).beginPath().moveTo(x-7,y-4).lineTo(x-25,y-18).moveTo(x+7,y-4).lineTo(x+25,y-18).moveTo(x-7,y+4).lineTo(x-25,y+18).moveTo(x+7,y+4).lineTo(x+25,y+18).strokePath();for(const [dx,dy] of [[-25,-18],[25,-18],[-25,18],[25,18]]){g.fillStyle(0x252d2e,1).fillEllipse(x+dx,y+dy,15,5);g.fillStyle(0x8a9990,1).fillCircle(x+dx,y+dy,3);}g.fillStyle(0x252d2e,1).fillRect(x-19,y-33,38,5);g.fillStyle(0x73d88d,1).fillRect(x-19,y-33,38*e.h/e.max,5);if(e.heavy){g.lineStyle(2,0xffb69b,1).strokeCircle(x,y,28);g.fillStyle(0x8d3c40,1).fillCircle(x,y+8,5);}}
 redraw(){this.units.clear();this.fx.clear();this.drawStructures(this.units);for(const t of this.towers)this.drawUnit(this.units,t);for(const e of this.enemies)this.drawDrone(this.units,e);for(const m of this.missiles){this.fx.lineStyle(m.kind==='sam'?4:2,0xffe69a,1).beginPath().moveTo(m.x,m.y).lineTo(m.x-8,m.y+13).strokePath();this.fx.fillStyle(0xfff2bc,1).fillCircle(m.x,m.y,3);}for(const f of this.effects){this.fx.lineStyle(3,0xffcf80,f.life/f.max).strokeCircle(f.x,f.y,22*(1-f.life/f.max)+5);this.fx.fillStyle(0xff9c58,.18).fillCircle(f.x,f.y,18*(1-f.life/f.max)+4);} }
}
new Phaser.Game({type:Phaser.AUTO,parent:'game',width:W,height:H,backgroundColor:'#536a48',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},render:{antialias:true},scene:[AirDefense]});
})();
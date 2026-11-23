(()=>{
'use strict';
const W=720,H=1280;
class AirDefense extends Phaser.Scene{
 constructor(){super('air-defense');this.cash=520;this.wave=0;this.cityHp=12;this.kills=0;this.towers=[];this.enemies=[];this.missiles=[];this.effects=[];this.pick=null;this.active=false;this.paused=false;this.speed=1;this.spawnLeft=0;this.spawnClock=0;this.message='РАЗМЕСТИ ПВО НА КАРТЕ И ЗАПУСТИ ВОЛНУ';}
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
 this.button(18,1192,210,50,'СКОРОСТЬ ×'+this.speed,()=>{this.speed=this.speed%3+1;this.refreshHud();},0x344d60);
 this.button(245,1192,210,50,'ПАУЗА',()=>{this.paused=!this.paused;this.refreshHud();},0x344d60);
 this.button(472,1192,230,50,'НОВАЯ ОПЕРАЦИЯ',()=>this.scene.restart(),0x59434b);
 this.refreshHud();
 }
 button(x,y,w,h,label,fn,color){let r=this.add.rectangle(x+w/2,y+h/2,w,h,color).setStrokeStyle(2,0xb8c8bb).setInteractive();let t=this.add.text(x+w/2,y+h/2,label,{fontSize:13,color:'#fff',fontStyle:'bold',align:'center',lineSpacing:1}).setOrigin(.5).setInteractive();r.on('pointerdown',fn);t.on('pointerdown',fn);this.hud.add([r,t]);}
 refreshHud(){this.stats.setText('SKYFRONT  •  ВОЛНА '+this.wave+'  •  ЦЕЛОСТНОСТЬ ОБЪЕКТА '+this.cityHp+'/12');this.res.setText('БЮДЖЕТ '+this.cash+'  •  УНИЧТОЖЕНО '+this.kills+'  •  СКОРОСТЬ ×'+this.speed);this.status.setText(this.paused?'ПАУЗА':this.message);}
 select(type){this.pick=type;this.message=({gun:'ВЫБРАНА ЗСУ: скорострельная установка. Нажми на площадку вне дороги.',sam:'ВЫБРАН ЗРК: ракеты поражают бронированные цели на большой дальности.',radar:'ВЫБРАН РАДАР: увеличивает обнаружение и дальность работы ПВО.'})[type];this.refreshHud();this.redraw();}
 onTap(x,y){if(y<170||y>1080||!this.pick)return;let cost={gun:90,sam:180,radar:120}[this.pick];if(this.cash<cost){this.message='НЕ ХВАТАЕТ БЮДЖЕТА';this.refreshHud();return;}if(this.route.some(p=>Math.hypot(p[0]-x,p[1]-y)<58)||Math.hypot(575-x,120-y)<78||this.towers.some(t=>Math.hypot(t.x-x,t.y-y)<58)){this.message='ЭТА ПОЗИЦИЯ НЕ ПОДХОДИТ. ВЫБЕРИ ДРУГУЮ ПЛОЩАДКУ.';this.refreshHud();return;}this.cash-=cost;this.towers.push({type:this.pick,x,y,range:{gun:150,sam:250,radar:310}[this.pick],cool:0,ammo:this.pick==='sam'?14:999});this.pick=null;this.message='ПОЗИЦИЯ ЗАНЯТА. СИСТЕМА ГОТОВА К РАБОТЕ.';this.refreshHud();this.redraw();}
 startWave(){if(this.active||this.paused)return;this.wave++;this.active=true;this.spawnLeft=5+this.wave*2;this.spawnClock=0;this.message='ВОЗДУШНАЯ АТАКА! ПВО АВТОМАТИЧЕСКИ ОБСТРЕЛИВАЕТ ЦЕЛИ.';this.refreshHud();}
 spawn(){let heavy=this.wave>2&&Math.random()<.32;this.enemies.push({x:this.route[0][0],y:this.route[0][1],i:0,h:heavy?6:2,max:heavy?6:2,v:heavy?31:47,heavy,phase:Math.random()*6.28});}
 updateGame(time,ms){if(this.paused)return;let dt=Math.min(ms/1000,.05)*this.speed;
 if(this.active){this.spawnClock+=dt;if(this.spawnLeft&&this.spawnClock>.9){this.spawnClock=0;this.spawnLeft--;this.spawn();}if(!this.spawnLeft&&!this.enemies.length){this.active=false;let bonus=100+this.wave*25;this.cash+=bonus;this.message='АТАКА ОТБИТА. НАГРАДА: +'+bonus+' БЮДЖЕТА.';this.refreshHud();}}
 for(const e of [...this.enemies]){let b=this.route[e.i+1];if(!b){this.enemies=this.enemies.filter(a=>a!==e);this.cityHp=Math.max(0,this.cityHp-1);this.message='ПРОРЫВ! ОБЪЕКТ ПОВРЕЖДЁН.';this.refreshHud();continue;}let dx=b[0]-e.x,dy=b[1]-e.y,d=Math.hypot(dx,dy),v=e.v*dt;if(d<v){e.x=b[0];e.y=b[1];e.i++;}else{e.x+=dx/d*v;e.y+=dy/d*v;}e.phase+=dt*5;}
 for(const t of this.towers){if(t.type==='radar')continue;t.cool-=dt;if(t.cool>0)continue;let e=this.enemies.filter(a=>Math.hypot(a.x-t.x,a.y-t.y)<t.range+(this.towers.some(r=>r.type==='radar')?45:0)).sort((a,b)=>Math.hypot(a.x-t.x,a.y-t.y)-Math.hypot(b.x-t.x,b.y-t.y))[0];if(e&&(t.type==='gun'||t.ammo)){t.cool=t.type==='gun'?.36:1.55;if(t.type==='sam')t.ammo--;this.missiles.push({x:t.x,y:t.y-10,target:e,dmg:t.type==='sam'?3:1,kind:t.type});}}
 for(const m of [...this.missiles]){if(!this.enemies.includes(m.target)){this.missiles=this.missiles.filter(a=>a!==m);continue;}let dx=m.target.x-m.x,dy=m.target.y-m.y,d=Math.hypot(dx,dy),v=(m.kind==='sam'?390:570)*dt;if(d<v+7){m.target.h-=m.dmg;this.missiles=this.missiles.filter(a=>a!==m);this.effects.push({x:m.target.x,y:m.target.y,life:.28,max:.28});if(m.target.h<=0){this.enemies=this.enemies.filter(a=>a!==m.target);this.kills++;this.cash+=20;}}else{m.x+=dx/d*v;m.y+=dy/d*v;}}
 for(const fx of this.effects)fx.life-=dt;this.effects=this.effects.filter(f=>f.life>0);this.redraw();}
 drawUnit(g,t){
 const c=t.type==='sam'?0x8bd8ff:t.type==='gun'?0xffd27c:0xd1b3ff;
 if(t.type==='radar'){g.lineStyle(2,c,.14).strokeCircle(t.x,t.y,t.range);g.fillStyle(0x263642,1).fillRoundedRect(t.x-29,t.y-22,58,44,8);g.lineStyle(4,c,1).beginPath().moveTo(t.x,t.y-5).lineTo(t.x+15,t.y-34).strokePath();g.strokeCircle(t.x+15,t.y-34,9);g.lineStyle(2,c,.8).strokeCircle(t.x,t.y,19);g.lineStyle(2,c,.65).beginPath().arc(t.x,t.y,31,-1.1,1.1,false).strokePath();g.fillStyle(c,1).fillCircle(t.x,t.y,4);return;}
 g.lineStyle(2,c,.18).strokeCircle(t.x,t.y,t.range);g.fillStyle(0x202e32,1).fillRoundedRect(t.x-28,t.y-21,56,42,8);g.fillStyle(0x52665e,1).fillRoundedRect(t.x-23,t.y-16,46,32,5);g.fillStyle(0x273b3e,1).fillCircle(t.x,t.y,13);
 if(t.type==='sam'){g.fillStyle(0x8a9a92,1).fillRoundedRect(t.x-17,t.y-9,34,18,4);g.fillStyle(c,1).fillCircle(t.x,t.y,6);g.lineStyle(5,0xd7e5e2,1).beginPath().moveTo(t.x-10,t.y-8).lineTo(t.x-25,t.y-32).moveTo(t.x+10,t.y-8).lineTo(t.x+25,t.y-32).strokePath();g.fillStyle(0xffc17d,1).fillTriangle(t.x-29,t.y-34,t.x-21,t.y-34,t.x-25,t.y-43);g.fillStyle(0xffc17d,1).fillTriangle(t.x+21,t.y-34,t.x+29,t.y-34,t.x+25,t.y-43);}
 else{g.lineStyle(7,0x65746a,1).beginPath().moveTo(t.x-2,t.y).lineTo(t.x+32,t.y-15).strokePath();g.lineStyle(3,c,1).beginPath().moveTo(t.x+7,t.y-4).lineTo(t.x+35,t.y-18).strokePath();g.fillStyle(c,1).fillCircle(t.x,t.y,6);g.fillStyle(0x202c2b,1).fillCircle(t.x+34,t.y-18,6);g.lineStyle(2,0xe8d6a0,1).strokeCircle(t.x+34,t.y-18,8);}
 }
 drawDrone(g,e){let bob=Math.sin(e.phase)*2;let x=e.x,y=e.y+bob;g.lineStyle(2,0x1b2427,.7).strokeCircle(x,y,17);g.fillStyle(e.heavy?0x8c343b:0xc65b37,1);g.fillTriangle(x,y-17,x-17,y+11,x+17,y+11);g.fillStyle(e.heavy?0xd98d82:0xf4c28a,1).fillTriangle(x,y-12,x-5,y+7,x+5,y+7);g.lineStyle(3,0x282e2c,1).beginPath().moveTo(x-13,y-1).lineTo(x-27,y+7).moveTo(x+13,y-1).lineTo(x+27,y+7).strokePath();g.fillStyle(0x202626,1).fillEllipse(x-27,y+7,12,5);g.fillEllipse(x+27,y+7,12,5);g.fillStyle(0x242b2a,1).fillRect(x-18,y-29,36,5);g.fillStyle(0x74d38a,1).fillRect(x-18,y-29,36*e.h/e.max,5);if(e.heavy){g.lineStyle(2,0xffc0a2,1).strokeCircle(x,y,22);}}
 redraw(){this.units.clear();this.fx.clear();for(const t of this.towers)this.drawUnit(this.units,t);for(const e of this.enemies)this.drawDrone(this.units,e);for(const m of this.missiles){this.fx.lineStyle(m.kind==='sam'?4:2,0xffe69a,1).beginPath().moveTo(m.x,m.y).lineTo(m.x-8,m.y+13).strokePath();this.fx.fillStyle(0xfff2bc,1).fillCircle(m.x,m.y,3);}for(const f of this.effects){this.fx.lineStyle(3,0xffcf80,f.life/f.max).strokeCircle(f.x,f.y,22*(1-f.life/f.max)+5);this.fx.fillStyle(0xff9c58,.18).fillCircle(f.x,f.y,18*(1-f.life/f.max)+4);} }
}
new Phaser.Game({type:Phaser.AUTO,parent:'game',width:W,height:H,backgroundColor:'#536a48',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},render:{antialias:true},scene:[AirDefense]});
})();
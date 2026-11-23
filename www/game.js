(() => {
'use strict';
const W=720,H=1280;
const C={bg:0x0a1724,panel:0x132538,ink:0xeaf4ff,muted:0xa7bdcc,blue:0x52b6f0,red:0xf07870,gold:0xf1c56d,green:0x79d2a0};
class Skyfront extends Phaser.Scene{
 constructor(){super('skyfront');this.turn=1;this.credits=180;this.intel=50;this.energy=70;this.mode='select';this.selected=null;this.msg='Выберите технику на карте';this.units=[];this.nextId=10;}
 create(){
  this.cameras.main.setBackgroundColor(C.bg);
  this.mapBox={x:18,y:164,w:684,h:760};this.cols=9;this.rows=10;this.cell=76;
  this.terrain=[];for(let y=0;y<this.rows;y++){this.terrain[y]=[];for(let x=0;x<this.cols;x++){let n=(x*19+y*13+x*y*5)%17;this.terrain[y][x]=n<3?'forest':n<5?'hill':n<7?'field':'plain';}}
  this.mapBox.h=this.rows*this.cell;
  this.units=[
   {id:1,x:2,y:7,team:'blue',type:'drone',name:'БПЛА «Сокол»',hp:3,ap:1,range:3},
   {id:2,x:5,y:7,team:'blue',type:'sam',name:'Батарея ПВО',hp:4,ap:1,range:4},
   {id:3,x:4,y:5,team:'blue',type:'radar',name:'РЛС обнаружения',hp:4,ap:1,range:5},
   {id:4,x:1,y:8,team:'blue',type:'hq',name:'Командный пункт',hp:5,ap:1,range:0},
   {id:5,x:7,y:2,team:'red',type:'air',name:'Воздушная цель',hp:3,ap:1,range:2},
   {id:6,x:6,y:3,team:'red',type:'air',name:'БПЛА противника',hp:2,ap:1,range:2}
  ];
  this.mapLayer=this.add.container(0,0);this.unitLayer=this.add.container(0,0);this.ui=this.add.container(0,0);
  this.drawMap();this.makeUI();this.refresh();
 }
 p(x,y){return{x:this.mapBox.x+x*this.cell+this.cell/2,y:this.mapBox.y+y*this.cell+this.cell/2};}
 addText(x,y,s,size=15,color='#eaf4ff',origin=.5){const t=this.add.text(x,y,s,{fontFamily:'Arial,sans-serif',fontSize:size+'px',color,fontStyle:'bold',align:'center'}).setOrigin(origin);this.ui.add(t);return t;}
 drawMap(){
  this.mapLayer.removeAll(true);
  const g=this.add.graphics();this.mapLayer.add(g);
  g.fillStyle(0x263e37,1);g.fillRoundedRect(this.mapBox.x-4,this.mapBox.y-4,this.mapBox.w+8,this.mapBox.h+8,16);
  for(let y=0;y<this.rows;y++)for(let x=0;x<this.cols;x++){
   const px=this.mapBox.x+x*this.cell,py=this.mapBox.y+y*this.cell,t=this.terrain[y][x];
   let col=t==='forest'?0x244d3d:t==='hill'?0x58634d:t==='field'?0x6a7048:0x3d614c;
   g.fillStyle(col,1);g.fillRect(px+1,py+1,this.cell-2,this.cell-2);
   g.lineStyle(1,0x91a98a,.12);g.strokeRect(px,py,this.cell,this.cell);
   if(t==='forest'){for(let k=0;k<3;k++){let tx=px+14+((x*13+k*19)%48),ty=py+14+((y*17+k*23)%48);g.fillStyle(0x173b31,.9);g.fillCircle(tx,ty,8);g.fillStyle(0x3e7651,.9);g.fillCircle(tx-2,ty-3,5);}}
   if(t==='hill'){g.lineStyle(2,0x9a9a70,.5);g.beginPath();g.moveTo(px+10,py+54);g.lineTo(px+36,py+18);g.lineTo(px+64,py+54);g.strokePath();}
   if(t==='field'){g.lineStyle(1,0xa7a36a,.35);for(let k=0;k<4;k++){g.beginPath();g.moveTo(px+8,py+18+k*11);g.lineTo(px+66,py+18+k*11);g.strokePath();}}
  }
  // winding river
  g.lineStyle(20,0x1b526b,1);g.beginPath();g.moveTo(18,480);g.lineTo(112,455);g.lineTo(205,490);g.lineTo(300,470);g.lineTo(400,510);g.lineTo(510,480);g.lineTo(702,520);g.strokePath();
  g.lineStyle(3,0x65a6b6,.75);g.beginPath();g.moveTo(18,480);g.lineTo(112,455);g.lineTo(205,490);g.lineTo(300,470);g.lineTo(400,510);g.lineTo(510,480);g.lineTo(702,520);g.strokePath();
  // roads and settlement
  g.lineStyle(8,0xb7a77c,.9);g.beginPath();g.moveTo(24,825);g.lineTo(170,740);g.lineTo(280,665);g.lineTo(430,585);g.lineTo(690,410);g.strokePath();
  g.lineStyle(2,0xeee0b0,.8);g.beginPath();g.moveTo(24,825);g.lineTo(170,740);g.lineTo(280,665);g.lineTo(430,585);g.lineTo(690,410);g.strokePath();
  // village
  const village=this.add.container(0,0);this.mapLayer.add(village);
  for(let i=0;i<7;i++){let x=400+(i%3)*24,y=300+Math.floor(i/3)*25;let b=this.add.rectangle(x,y,18,14,0xb8a98c).setStrokeStyle(2,0x554e43);village.add(b);village.add(this.add.rectangle(x,y-9,20,5,0x794e43));}
  this.mapLayer.add(this.add.text(446,353,'ПОСЁЛОК ЛЕСНОЙ',{fontSize:12,color:'#f1e4c2',fontStyle:'bold'}));
  this.mapLayer.add(this.add.text(38,180,'СЕВЕРНЫЙ СЕКТОР  •  УЧАСТОК 04',{fontSize:12,color:'#e6e2c8',fontStyle:'bold'}));
  this.mapLayer.add(this.add.text(510,895,'РЕКА СЕВЕРНАЯ',{fontSize:11,color:'#9bd2df'}));
  // tap target grid
  for(let y=0;y<this.rows;y++)for(let x=0;x<this.cols;x++){
   const r=this.add.rectangle(this.mapBox.x+x*this.cell+38,this.mapBox.y+y*this.cell+38,74,74,0xffffff,0.001).setInteractive();
   r.on('pointerdown',()=>this.tapCell(x,y));this.mapLayer.add(r);
  }
 }
 drawDrone(g,x,y,color){
  g.lineStyle(5,color,1);g.beginPath();g.moveTo(x-21,y-18);g.lineTo(x+21,y+18);g.moveTo(x+21,y-18);g.lineTo(x-21,y+18);g.strokePath();
  [[-23,-20],[23,-20],[-23,20],[23,20]].forEach(([a,b])=>{g.fillStyle(0x142333,1);g.fillCircle(x+a,y+b,9);g.lineStyle(2,color,1);g.strokeCircle(x+a,y+b,9);});
  g.fillStyle(color,1);g.fillRoundedRect(x-12,y-8,24,16,5);g.fillStyle(0xe7f4fa,1);g.fillCircle(x,y,3);
  g.fillStyle(0x172738,1);g.fillTriangle(x,y-8,x-5,y-16,x+5,y-16);
 }
 drawSAM(g,x,y,color){
  g.fillStyle(0x172c35,1);g.fillRoundedRect(x-28,y-16,56,32,7);g.fillStyle(0x6e897b,1);g.fillRoundedRect(x-23,y-12,46,24,5);
  g.fillStyle(color,1);g.fillRoundedRect(x-16,y-29,32,9,3);g.fillRoundedRect(x-16,y+20,32,9,3);
  g.lineStyle(5,0xcbd5d2,1);g.beginPath();g.moveTo(x-9,y-8);g.lineTo(x-27,y-30);g.moveTo(x+9,y-8);g.lineTo(x+27,y-30);g.strokePath();
  g.fillStyle(0xd5e0df,1);g.fillCircle(x,y-2,8);g.lineStyle(2,color,1);g.strokeCircle(x,y-2,8);
 }
 drawRadar(g,x,y,color){
  g.fillStyle(0x203541,1);g.fillRoundedRect(x-24,y-13,48,26,6);g.fillStyle(0x7d9c91,1);g.fillCircle(x,y-2,10);
  g.lineStyle(3,color,1);g.beginPath();g.moveTo(x,y-4);g.lineTo(x+19,y-29);g.strokePath();g.lineStyle(2,0xd8e9ed,1);g.strokeCircle(x+19,y-29,7);
  g.lineStyle(1,color,.7);g.strokeCircle(x,y,35);g.strokeCircle(x,y,49);
 }
 drawHQ(g,x,y,color){
  g.fillStyle(0x283e4b,1);g.fillRoundedRect(x-26,y-20,52,40,5);g.fillStyle(0xb5c2bd,1);g.fillRect(x-17,y-12,34,24);g.fillStyle(color,1);g.fillTriangle(x-22,y-13,x,y-29,x+22,y-13);g.fillStyle(0x253440,1);g.fillRect(x-5,y+1,10,11);g.lineStyle(3,color,1);g.beginPath();g.moveTo(x+20,y-17);g.lineTo(x+20,y-37);g.strokePath();g.fillCircle(x+20,y-39,4);
 }
 drawAir(g,x,y,color){
  g.fillStyle(color,1);g.fillTriangle(x,y-29,x-9,y+14,x,y+8);g.fillTriangle(x,y-29,x+9,y+14,x,y+8);
  g.fillTriangle(x-5,y-1,x-31,y+12,x-6,y+10);g.fillTriangle(x+5,y-1,x+31,y+12,x+6,y+10);
  g.fillStyle(0x202d3a,1);g.fillCircle(x,y-8,4);g.lineStyle(2,0xffd6c9,1);g.strokeCircle(x,y-8,4);
 }
 drawUnits(){
  this.unitLayer.removeAll(true);
  for(const u of this.units){
   const p=this.p(u.x,u.y),col=u.team==='blue'?C.blue:C.red,g=this.add.graphics();
   if(u.type==='sam'&&u.team==='blue') {g.lineStyle(2,col,.2);g.strokeCircle(p.x,p.y,150);}
   if(u.type==='radar')this.drawRadar(g,p.x,p.y,col);
   else if(u.type==='drone')this.drawDrone(g,p.x,p.y,col);
   else if(u.type==='sam')this.drawSAM(g,p.x,p.y,col);
   else if(u.type==='hq')this.drawHQ(g,p.x,p.y,col);
   else this.drawAir(g,p.x,p.y,col);
   this.unitLayer.add(g);
   if(this.selected?.id===u.id){const ring=this.add.graphics();ring.lineStyle(3,0xffffff,1);ring.strokeCircle(p.x,p.y,38);this.unitLayer.add(ring);}
   const label=this.add.text(p.x,p.y+42,u.type==='sam'?'ПВО':u.type==='radar'?'РЛС':u.type==='drone'?'БПЛА':u.type==='hq'?'КП':'ЦЕЛЬ',{fontSize:11,fontStyle:'bold',color:u.team==='blue'?'#e6f6ff':'#ffe2de',backgroundColor:'#10202ccc',padding:{x:4,y:2}}).setOrigin(.5);
   this.unitLayer.add(label);
   const hp=this.add.text(p.x,p.y+56,'■'.repeat(u.hp),{fontSize:9,color:u.team==='blue'?'#82d8ff':'#ff9b8e'}).setOrigin(.5);this.unitLayer.add(hp);
   const hit=this.add.circle(p.x,p.y,33,0xffffff,.001).setInteractive();hit.on('pointerdown',()=>this.tapUnit(u));this.unitLayer.add(hit);
  }
 }
 makeUI(){
  this.addText(28,28,'SKYFRONT  /  СЕКТОР 04',22,'#a9dfff',0);
  this.turnText=this.addText(28,68,'ХОД 1',17,'#ffffff',0);
  this.resText=this.addText(690,68,'',16,'#f1d28b',1);
  const header=this.add.rectangle(360,106,684,48,0x14283a).setStrokeStyle(1,0x3d5d75);this.ui.add(header);
  this.msgText=this.addText(360,106,this.msg,15,'#d9e8f3',.5);
  const panel=this.add.rectangle(360,1060,684,280,0x102235).setStrokeStyle(2,0x35556c);this.ui.add(panel);
  this.infoTitle=this.addText(34,936,'ОБСТАНОВКА',14,'#9fcde4',0);
  this.info=this.addText(34,965,'Выберите единицу техники на карте.',16,'#ffffff',0);
  this.btn(28,1010,205,62,'ПЕРЕМЕЩЕНИЕ',()=>this.setMode('move'),0x24648a);
  this.btn(257,1010,205,62,'ОБОРОНА',()=>this.defend(),0x286a5a);
  this.btn(486,1010,205,62,'ПЕРЕХВАТ',()=>this.setMode('attack'),0x8a4545);
  this.btn(28,1087,205,62,'РАЗВЕРНУТЬ ПВО',()=>this.deploy(),0x765d36);
  this.btn(257,1087,205,62,'РАЗВЕДКА',()=>this.research(),0x435d81);
  this.btn(486,1087,205,62,'СЛЕДУЮЩИЙ ХОД',()=>this.endTurn(),0x326c4d);
  this.btn(28,1170,318,48,'СОХРАНИТЬ',()=>this.save(),0x34495d);
  this.btn(374,1170,318,48,'ЗАГРУЗИТЬ',()=>this.load(),0x34495d);
  this.addText(360,1238,'СИНИЕ — СВОИ  •  КРАСНЫЕ — ВОЗДУШНЫЕ ЦЕЛИ  •  КРУГ — ЗОНА ПВО',10,'#91a8ba');
 }
 btn(x,y,w,h,s,fn,col){const r=this.add.rectangle(x+w/2,y+h/2,w,h,col).setStrokeStyle(2,0x91aebe).setInteractive();const t=this.add.text(x+w/2,y+h/2,s,{fontSize:15,fontStyle:'bold',color:'#fff',align:'center',wordWrap:{width:w-10}}).setOrigin(.5).setInteractive();r.on('pointerdown',fn);t.on('pointerdown',fn);this.ui.add([r,t]);}
 tapUnit(u){if(u.team==='blue'){this.selected=u;this.mode='select';this.msg='Выбрано: '+u.name;}else if(this.selected&&this.mode==='attack')this.attack(u);else this.msg='Воздушная цель обнаружена. Выберите ПВО и нажмите «Перехват».';this.refresh();}
 tapCell(x,y){if(!this.selected){this.msg='Сначала выберите свою технику.';this.refresh();return;}if(this.mode==='attack'){this.msg='Для перехвата коснитесь красной воздушной цели.';this.refresh();return;}if(this.mode==='defend'){this.selected.ap=0;this.msg=this.selected.name+' закрепилась на позиции.';this.refresh();return;}if(this.mode!=='move'){this.msg='Выберите приказ.';this.refresh();return;}if(this.units.some(u=>u.x===x&&u.y===y)){this.msg='Клетка занята.';this.refresh();return;}if(this.selected.ap<1||Math.abs(x-this.selected.x)+Math.abs(y-this.selected.y)>3){this.msg='Недостаточно очков действия или слишком далеко.';this.refresh();return;}this.selected.x=x;this.selected.y=y;this.selected.ap=0;this.msg='Техника перемещена.';this.refresh();}
 setMode(m){if(!this.selected)this.msg='Сначала выберите свою технику.';else{this.mode=m;this.msg=m==='move'?'Коснитесь свободной клетки для перемещения.':'Коснитесь красной воздушной цели для перехвата.';}this.refresh();}
 defend(){if(!this.selected)this.msg='Сначала выберите технику.';else{this.selected.ap=0;this.selected.hp=Math.min(5,this.selected.hp+1);this.msg='Позиция укреплена, прочность восстановлена.';}this.refresh();}
 attack(t){if(!this.selected||this.selected.type!=='sam'){this.msg='Для перехвата нужна батарея ПВО.';this.refresh();return;}if(this.selected.ap<1){this.msg='Батарея уже действовала в этом ходу.';this.refresh();return;}if(Math.abs(t.x-this.selected.x)+Math.abs(t.y-this.selected.y)>this.selected.range){this.msg='Цель вне игровой зоны действия ПВО.';this.refresh();return;}t.hp--;this.selected.ap=0;if(t.hp<=0){this.units=this.units.filter(v=>v.id!==t.id);this.credits+=25;this.msg='Воздушная цель перехвачена. +25 ресурсов.';}else this.msg='Цель повреждена, требуется повторный перехват.';this.selected=null;this.mode='select';this.refresh();}
 deploy(){if(this.credits<80){this.msg='Для новой батареи нужно 80 ресурсов.';this.refresh();return;}let pos=[[4,8],[3,6],[6,6],[2,5],[7,7]].find(([x,y])=>!this.units.some(u=>u.x===x&&u.y===y));if(!pos){this.msg='Нет свободной позиции для развёртывания.';this.refresh();return;}this.units.push({id:this.nextId++,x:pos[0],y:pos[1],team:'blue',type:'sam',name:'Мобильная батарея ПВО',hp:4,ap:1,range:4});this.credits-=80;this.msg='Мобильная батарея ПВО развёрнута.';this.refresh();}
 research(){if(this.intel<25){this.msg='Недостаточно разведданных: нужно 25.';}else{this.intel-=25;this.energy+=15;this.units.filter(u=>u.team==='blue').forEach(u=>u.hp=Math.min(5,u.hp+1));this.msg='Разведка завершена: позиции обновлены.';}this.refresh();}
 endTurn(){this.turn++;this.units.filter(u=>u.team==='blue').forEach(u=>u.ap=1);this.credits+=15;this.intel+=8;this.energy=Math.min(100,this.energy+5);for(const e of this.units.filter(u=>u.team==='red')){const targets=this.units.filter(u=>u.team==='blue');if(!targets.length)break;targets.sort((a,b)=>(Math.abs(a.x-e.x)+Math.abs(a.y-e.y))-(Math.abs(b.x-e.x)+Math.abs(b.y-e.y)));const t=targets[0];if(Math.abs(t.x-e.x)+Math.abs(t.y-e.y)<=1){t.hp--;if(t.hp<=0)this.units=this.units.filter(u=>u.id!==t.id);}else{const nx=e.x+Math.sign(t.x-e.x),ny=e.y+Math.sign(t.y-e.y);if(nx>=0&&nx<this.cols&&ny>=0&&ny<this.rows&&!this.units.some(u=>u.x===nx&&u.y===ny)) {e.x=nx;e.y=ny;}}}this.selected=null;this.mode='select';this.msg='Ход противника завершён. Проверьте воздушную обстановку.';this.refresh();}
 refresh(){this.turnText.setText('ХОД '+this.turn+'  •  СЕКТОР 04');this.resText.setText('◈ '+this.credits+'   ◆ '+this.intel+'   ⚡ '+this.energy);this.msgText.setText(this.msg);if(this.selected)this.info.setText(this.selected.name+'\\nПрочность: '+this.selected.hp+'   Действие: '+(this.selected.ap?'готово':'использовано')+'\\nИгровая дальность: '+this.selected.range);else this.info.setText('Коснитесь значка техники на карте.\\nКруг вокруг ПВО показывает игровую зону прикрытия.');this.drawUnits();}
 save(){try{localStorage.setItem('skyfront-save',JSON.stringify({turn:this.turn,credits:this.credits,intel:this.intel,energy:this.energy,units:this.units,nextId:this.nextId}));this.msg='Игра сохранена на устройстве.';}catch(e){this.msg='Не удалось сохранить игру.';}this.refresh();}
 load(){try{const d=JSON.parse(localStorage.getItem('skyfront-save')||'null');if(!d)throw Error();Object.assign(this,d);this.selected=null;this.msg='Сохранение загружено.';}catch(e){this.msg='Сохранение не найдено.';}this.refresh();}
}
new Phaser.Game({type:Phaser.AUTO,parent:'game',backgroundColor:'#0a1724',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH,width:W,height:H},input:{activePointers:3},render:{antialias:true},scene:[Skyfront]});
})();
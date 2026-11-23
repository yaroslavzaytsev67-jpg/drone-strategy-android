(() => {
'use strict';
const W=720,H=1280;
const C={bg:0x081321,panel:0x132337,text:0xeaf4ff,muted:0x9bb0c5,blue:0x3c9be8,red:0xe36b69,gold:0xf0c36a,green:0x69c58d,land:0x203b43,water:0x102a40};
class Front extends Phaser.Scene {
 constructor(){super('front');this.turn=1;this.credits=120;this.intel=35;this.energy=60;this.mode='select';this.selected=null;this.units=[];this.owned=new Set();this.message='Выберите синий отряд, затем коснитесь клетки';}
 create(){
  this.cameras.main.setBackgroundColor(C.bg);
  this.mx=36;this.my=250;this.cell=72;this.cols=9;this.rows=9;
  this.terrain=[];
  for(let y=0;y<this.rows;y++){this.terrain[y]=[];for(let x=0;x<this.cols;x++){const n=(x*17+y*31+x*y*7)%13;this.terrain[y][x]=n<2?'water':n<5?'ridge':'plain';}}
  this.terrain[4][4]='base';
  this.units=[{id:1,x:2,y:6,team:'blue',kind:'scout',hp:3,ap:1},{id:2,x:3,y:7,team:'blue',kind:'guard',hp:4,ap:1},{id:3,x:6,y:2,team:'red',kind:'raider',hp:3,ap:1},{id:4,x:7,y:3,team:'red',kind:'guard',hp:4,ap:1}];
  this.owned=new Set(['2,6','3,7','4,4']);
  this.map=this.add.container(0,0);this.unitsLayer=this.add.container(0,0);this.ui=this.add.container(0,0);
  this.drawMap();this.makeUI();this.refresh();
 }
 txt(x,y,s,size=18,color='#eaf4ff',style='normal'){const t=this.add.text(x,y,s,{fontFamily:'system-ui,sans-serif',fontSize:size+'px',color,fontStyle:style,wordWrap:{width:660}});this.ui.add(t);return t;}
 drawMap(){
  this.map.removeAll(true);
  for(let y=0;y<this.rows;y++)for(let x=0;x<this.cols;x++){
   const t=this.terrain[y][x],px=this.mx+x*this.cell,py=this.my+y*this.cell;
   const fill=t==='water'?C.water:t==='ridge'?0x35444b:t==='base'?0x3b5267:C.land;
   const r=this.add.rectangle(px+36,py+36,68,68,fill).setStrokeStyle(2,0x38546a).setInteractive();
   r.on('pointerdown',()=>this.tapTile(x,y));this.map.add(r);
   if(t==='ridge')this.map.add(this.add.text(px+36,py+35,'▲',{fontSize:25,color:'#83949b'}).setOrigin(.5));
   if(t==='water')this.map.add(this.add.text(px+36,py+35,'≈',{fontSize:29,color:'#4b91b2'}).setOrigin(.5));
   if(t==='base')this.map.add(this.add.text(px+36,py+35,'⌂',{fontSize:29,color:'#f0c36a'}).setOrigin(.5));
  }
 }
 drawUnits(){
  this.unitsLayer.removeAll(true);
  for(const u of this.units){
   const x=this.mx+u.x*this.cell+36,y=this.my+u.y*this.cell+36,col=u.team==='blue'?C.blue:C.red;
   const c=this.add.circle(x,y,23,col).setStrokeStyle(this.selected?.id===u.id?5:2,this.selected?.id===u.id?0xffffff:0x091321).setInteractive();
   c.on('pointerdown',()=>this.tapUnit(u));this.unitsLayer.add(c);
   const glyph=this.add.text(x,y,u.kind==='scout'?'✦':u.kind==='guard'?'◆':'✚',{fontSize:24,color:'#fff'}).setOrigin(.5).setInteractive();
   glyph.on('pointerdown',()=>this.tapUnit(u));this.unitsLayer.add(glyph);
   this.unitsLayer.add(this.add.text(x,y+28,'♥'.repeat(u.hp),{fontSize:10,color:'#ffb1a9'}).setOrigin(.5));
  }
 }
 makeUI(){
  this.txt(28,25,'SKYFRONT  /  КОМАНДОВАНИЕ',22,'#8ed4ef','bold');
  this.turnLabel=this.txt(28,68,'ХОД 1',20,'#fff','bold');
  this.resLabel=this.txt(28,105,'',18,'#f0c36a');
  this.status=this.txt(28,180,this.message,16,'#b7c9d9');
  this.selLabel=this.txt(28,920,'ОТРЯД НЕ ВЫБРАН',18,'#fff','bold');
  this.detail=this.txt(28,954,'Коснитесь синего отряда на карте',15,'#9bb0c5');
  this.button(28,1015,205,68,'ПЕРЕМЕЩЕНИЕ',()=>this.setMode('move'),C.blue);
  this.button(257,1015,205,68,'ЗАЩИТА',()=>this.defend(),0x367b70);
  this.button(486,1015,205,68,'АТАКА',()=>this.setMode('attack'),0x9b4d50);
  this.button(28,1097,205,68,'НАНЯТЬ ОТРЯД',()=>this.recruit(),0x765e35);
  this.button(257,1097,205,68,'РАЗВЕДКА',()=>this.research(),0x4c6288);
  this.button(486,1097,205,68,'КОНЕЦ ХОДА',()=>this.endTurn(),0x367b55);
  this.button(28,1180,318,48,'СОХРАНИТЬ',()=>this.save(),0x34465a);
  this.button(374,1180,318,48,'ЗАГРУЗИТЬ',()=>this.load(),0x34465a);
 }
 button(x,y,w,h,label,fn,color){
  const b=this.add.rectangle(x+w/2,y+h/2,w,h,color).setStrokeStyle(2,0x91a9be).setInteractive();
  const t=this.add.text(x+w/2,y+h/2,label,{fontSize:16,fontStyle:'bold',color:'#fff',align:'center',wordWrap:{width:w-12}}).setOrigin(.5).setInteractive();
  b.on('pointerdown',fn);t.on('pointerdown',fn);this.ui.add([b,t]);
 }
 tapUnit(u){
  if(u.team==='blue'){this.selected=u;this.mode='select';this.message='Выбран '+this.unitName(u)+'. Выберите приказ внизу.';}
  else if(this.selected&&this.mode==='attack')this.attack(u);
  else this.message='Враг. Выберите свой отряд и режим атаки.';
  this.refresh();
 }
 tapTile(x,y){
  const unit=this.units.find(u=>u.x===x&&u.y===y);if(unit){this.tapUnit(unit);return;}
  if(!this.selected){this.message='Сначала выберите свой отряд.';this.refresh();return;}
  if(this.mode==='attack'){this.message='Для атаки коснитесь вражеского отряда.';this.refresh();return;}
  if(this.mode==='defend'){this.selected.ap=0;this.selected.hp=Math.min(5,this.selected.hp+1);this.message='Отряд укрепился и восстановил прочность.';}
  else{
   if(this.mode!=='move'&&this.mode!=='select'){this.message='Выберите приказ.';this.refresh();return;}
   if(this.terrain[y][x]==='water'||this.terrain[y][x]==='base'||this.selected.ap<1){this.message='Клетка недоступна или действие уже использовано.';this.refresh();return;}
   if(Math.abs(x-this.selected.x)+Math.abs(y-this.selected.y)>3){this.message='Слишком далеко: радиус перемещения — 3 клетки.';this.refresh();return;}
   this.selected.x=x;this.selected.y=y;this.selected.ap=0;this.owned.add(x+','+y);this.message='Приказ выполнен. Отряд занял позицию.';
  }
  this.refresh();
 }
 setMode(m){if(!this.selected)this.message='Сначала выберите свой отряд.';else{this.mode=m;this.message=m==='move'?'Коснитесь свободной клетки в радиусе 3.':'Коснитесь врага для атаки.';}this.refresh();}
 defend(){if(!this.selected){this.message='Сначала выберите отряд.';}else{this.mode='defend';this.selected.ap=0;this.selected.hp=Math.min(5,this.selected.hp+1);this.message='Отряд перешёл в оборону и восстановил 1 прочность.';}this.refresh();}
 attack(t){
  if(!this.selected||this.selected.ap<1){this.message='У отряда нет очков действия.';this.refresh();return;}
  if(Math.abs(t.x-this.selected.x)+Math.abs(t.y-this.selected.y)>2){this.message='Цель вне радиуса атаки.';this.refresh();return;}
  t.hp--;this.selected.ap=0;
  if(t.hp<=0){this.units=this.units.filter(u=>u.id!==t.id);this.credits+=20;this.message='Вражеский отряд выведен из строя. +20 ресурсов.';}
  else this.message='Попадание! Прочность противника снижена.';
  this.selected=null;this.mode='select';this.checkWin();this.refresh();
 }
 recruit(){
  if(this.credits<55)this.message='Недостаточно ресурсов: нужно 55.';
  else{const spots=[[2,5],[3,6],[1,6],[2,7]],p=spots.find(([x,y])=>!this.units.some(u=>u.x===x&&u.y===y));
   if(!p)this.message='Нет свободной точки для нового отряда.';
   else{this.units.push({id:Date.now(),x:p[0],y:p[1],team:'blue',kind:'scout',hp:3,ap:1});this.credits-=55;this.message='Разведотряд сформирован.';}}
  this.refresh();
 }
 research(){
  if(this.intel<25)this.message='Недостаточно данных разведки: нужно 25.';
  else{this.intel-=25;this.energy+=15;this.units.filter(u=>u.team==='blue').forEach(u=>u.hp=Math.min(5,u.hp+1));this.message='Исследование завершено: отряды восстановлены, энергия +15.';}
  this.refresh();
 }
 endTurn(){
  this.turn++;this.units.filter(u=>u.team==='blue').forEach(u=>u.ap=1);this.credits+=15;this.intel+=8;this.energy=Math.min(100,this.energy+5);
  for(const e of this.units.filter(u=>u.team==='red')){
   const friends=this.units.filter(u=>u.team==='blue');if(!friends.length)break;
   friends.sort((a,b)=>(Math.abs(a.x-e.x)+Math.abs(a.y-e.y))-(Math.abs(b.x-e.x)+Math.abs(b.y-e.y)));
   const f=friends[0],d=Math.abs(f.x-e.x)+Math.abs(f.y-e.y);
   if(d<=1){f.hp--;if(f.hp<=0){this.units=this.units.filter(u=>u.id!==f.id);this.message='Противник атаковал: ваш отряд потерян!';}}
   else{const nx=e.x+Math.sign(f.x-e.x),ny=e.y+Math.sign(f.y-e.y);if(nx>=0&&nx<this.cols&&ny>=0&&ny<this.rows&&this.terrain[ny][nx]!=='water'&&!this.units.some(u=>u.x===nx&&u.y===ny)){e.x=nx;e.y=ny;}}
  }
  this.selected=null;this.mode='select';if(!this.message.includes('потерян'))this.message='Ход противника завершён. Ваши отряды готовы.';this.checkWin();this.refresh();
 }
 unitName(u){return u.kind==='scout'?'разведотряд':u.kind==='guard'?'отряд охраны':'штурмовой отряд';}
 refresh(){
  this.turnLabel.setText('ХОД '+this.turn+'  •  ВАША ФАЗА');
  this.resLabel.setText('◈ '+this.credits+'     ◆ '+this.intel+'     ⚡ '+this.energy);
  this.status.setText(this.message);
  if(this.selected){this.selLabel.setText('ВЫБРАН: '+this.unitName(this.selected).toUpperCase());this.detail.setText('Прочность: '+this.selected.hp+'   Действие: '+(this.selected.ap?'доступно':'использовано')+'\nРежим: '+this.mode);}
  else{this.selLabel.setText('ОТРЯД НЕ ВЫБРАН');this.detail.setText('Коснитесь синего отряда на карте');}
  this.drawUnits();
 }
 save(){try{localStorage.setItem('skyfront-save',JSON.stringify({turn:this.turn,credits:this.credits,intel:this.intel,energy:this.energy,units:this.units,owned:[...this.owned]}));this.message='Сохранение записано на устройстве.';}catch(e){this.message='Не удалось сохранить прогресс.';}this.refresh();}
 load(){try{const d=JSON.parse(localStorage.getItem('skyfront-save')||'null');if(!d)throw Error();Object.assign(this,{turn:d.turn,credits:d.credits,intel:d.intel,energy:d.energy,units:d.units,owned:new Set(d.owned),selected:null});this.message='Сохранение загружено.';}catch(e){this.message='Сохранение не найдено.';}this.refresh();}
 checkWin(){if(!this.units.some(u=>u.team==='red'))this.message='ПОБЕДА! Противник отступил.';else if(!this.units.some(u=>u.team==='blue'))this.message='ПОРАЖЕНИЕ. Ваши отряды потеряны.';}
}
new Phaser.Game({type:Phaser.AUTO,parent:'game',backgroundColor:'#081321',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH,width:W,height:H},input:{activePointers:3},render:{antialias:true},scene:[Front]});
})();
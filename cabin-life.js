import * as T from './vendor/three.module.js';

// Fictional banter: cultural references are clues and jokes, not historical dialogue.
const idle=[
 ['东坡','这一船的好东西，怎么没有一样肯自己过来？','佛印','你走两步，它们就过来了。'],
 ['佛印','先借一阵扇风？','东坡','小声些，别把窗里的月亮吹跑。'],
 ['东坡','此处少一位拨弦的人。','佛印','你负责听，倒安排得很周全。'],
 ['佛印','太湖石的洞眼，你数清了吗？','东坡','数到月亮那一个，就忘了。'],
 ['东坡','苏州的窗，借景不还。','佛印','你还借走了我的茶。去茶席看看？'],
 ['佛印','月亮还没找着？试试转动花窗。','东坡','找到了就放进杯里，谁也别晃船。']
];
const replies={
 fan:[['东坡','借苏扇一阵风，我也好乘凉。','佛印','风到我这儿了，你的胡子倒先忙起来。'],['佛印','苏扇收起半面江南。','东坡','展开能不能多收半碟点心？']],
 lute:[['东坡','这一声，颇有水巷里说书的兴致。','佛印','你先别唱，给评弹留些余地。'],['佛印','再拨一声？我来接拍。','东坡','好，弹错了便说是水声。']],
 rock:[['东坡','米芾拜石，我向这块太湖石借个月亮。','佛印','借得到再作揖，别先把腰闪了。'],['佛印','瘦、皱、漏、透，你偏看中那个洞。','东坡','洞里若有月，便值我多看两眼。']],
 tea:[['佛印','这一盏，借的是洞庭碧螺春的香。','东坡','这船连后世的茶也借来了？那我不客气了。'],['东坡','听说它旧有“吓煞人香”的传说。','佛印','香没吓着我，你端走两杯倒吓着我了。']],
 dong:[['东坡','你也来找月亮？','佛印','他方才还问石头借呢。去转转花窗吧。'],['东坡','这扇、这石、这茶，都是好题目。','佛印','先把杯子放回去，再作诗。']],
 fo:[['佛印','舟虽小，走慢些，茶还满着。','东坡','他护茶，比我护月亮还认真。'],['佛印','你拨弦，我打拍，他负责胡说。','东坡','这叫即兴。']]
};

export function makeCabinLife(dong,fo,panel){
 const actors=[{root:dong,x:-1.7,z:-3.5,phase:0},{root:fo,x:1.7,z:2.9,phase:2}];
 const counts={};let time=0,next=0,index=0,actionUntil=0,action='idle';
 for(const a of actors){a.root.position.set(a.x,0,a.z);a.heading=0;a.wait=2+a.phase;a.target=a.phase? -2.8:2.9;}
 function show(lines){panel.replaceChildren();for(let i=0;i<4;i+=2){const p=document.createElement('p'),name=document.createElement('b');name.textContent=lines[i];p.append(name,document.createTextNode(lines[i+1]));panel.append(p);}const hint=document.createElement('small');hint.textContent='舟中幻想闲话 · 点击人物或小物，接一句';panel.append(hint);}
 function interact(kind){const list=replies[kind]||replies.dong;const n=counts[kind]||0;counts[kind]=n+1;show(list[n%list.length]);next=time+13;actionUntil=time+4.5;action=kind;}
 return {actors,interact,update(dt,enabled,player){
   panel.hidden=!enabled;if(!enabled)return;time+=dt;
   if(time>=next){show(idle[index++%idle.length]);next=time+12;}
   for(let i=0;i<actors.length;i++){
     const a=actors[i],p=a.root.position,perform=time<actionUntil;
     let walking=false,heading=a.heading;
     if(perform){heading=i? -Math.PI/2:Math.PI/2;}
     else if(a.wait>0){a.wait-=dt;heading=i?-Math.PI/2:Math.PI/2;}
     else {const dz=a.target-p.z;heading=dz>0?0:Math.PI;
       const step=Math.sign(dz)*Math.min(Math.abs(dz),dt*.34);
       // Both characters stay in separate clear lanes; yield to the visitor.
       if(Math.hypot(p.x-player.x,p.z+step-player.z)>.85){p.z+=step;walking=true;}
       if(Math.abs(dz)<.035){a.wait=4+i;a.target=a.target>0?-3.5:2.9;}
     }
     const delta=Math.atan2(Math.sin(heading-a.heading),Math.cos(heading-a.heading));a.heading+=delta*(1-Math.exp(-dt*3));
     a.root.rotation.y=a.heading;
     const bow=perform&&action==='rock'?Math.sin(Math.min(1,(actionUntil-time)/4.5)*Math.PI)*.16:0;
     a.root.rotation.x=bow;
     a.root.rotation.z=walking?Math.sin(time*5+i)*.014:perform&&action==='lute'?Math.sin(time*7+i)*.025:Math.sin(time*1.4+i)*.004;
     p.y=walking?Math.abs(Math.sin(time*5+i))*.016:0;
   }
 }};
}

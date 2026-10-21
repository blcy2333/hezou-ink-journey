// Camera footprint includes clearance from carved furniture and walls.
const furniture=[[-3.20,-3.6],[3.45,-3.15],[-3.45,1.4],[3.45,2.5]];
export function moveCabin(position,yaw,distance,actors=[]){
 const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
 const blocked=(x,z)=>actors.some(a=>Math.hypot(x-a.x,z-a.z)<.86)||furniture.some(([fx,fz])=>Math.abs(x-fx)<1.08&&Math.abs(z-fz)<.98);
 const count=Math.max(1,Math.ceil(Math.abs(distance)/.12)),d=distance/count;
 let {x,z}=position;
 for(let i=0;i<count;i++){
  const nx=clamp(x+Math.sin(yaw)*d,-3.62,3.62);if(!blocked(nx,z))x=nx;
  const nz=clamp(z-Math.cos(yaw)*d,-4.35,4.86);if(!blocked(x,nz))z=nz;
 }
 return {x,z};
}

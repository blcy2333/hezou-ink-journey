// Camera footprint includes clearance from carved furniture and walls.
const furniture=[[-3.45,-3.6],[3.45,-3.15],[-3.45,1.4],[3.45,2.5],[-3.25,-4.9],[3.55,3.7]];
export function moveCabin(position,yaw,distance){
 const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
 const blocked=(x,z)=>furniture.some(([fx,fz])=>Math.abs(x-fx)<1.03&&Math.abs(z-fz)<.94);
 const count=Math.max(1,Math.ceil(Math.abs(distance)/.12)),d=distance/count;
 let {x,z}=position;
 for(let i=0;i<count;i++){
  const nx=clamp(x+Math.sin(yaw)*d,-3.8,3.8);if(!blocked(nx,z))x=nx;
  const nz=clamp(z-Math.cos(yaw)*d,-4.5,5.1);if(!blocked(x,nz))z=nz;
 }
 return {x,z};
}

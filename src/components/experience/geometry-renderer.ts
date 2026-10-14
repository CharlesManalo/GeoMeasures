import * as THREE from "three";
export type SolidKind="cube"|"prism"|"cylinder"|"cone"|"sphere"|"pyramid"|"net"|"comparison"|"tank";
export type GeometryConfig={kind:SolidKind;size?:number;height?:number;radius?:number;unfold?:number;fill?:number;yaw:number;pitch:number;wireframe:boolean;paused:boolean;interacting:boolean};
const ink=0x65467d;
const colors=[0xdac7ed,0xb8dfd1,0xc3e2f6,0xe7a2c1,0xf4d58f,0xc9b5e2];

export function createGeometryRenderer(canvas:HTMLCanvasElement,initial:GeometryConfig){
 const context=canvas.getContext("webgl2",{antialias:true,alpha:true,powerPreference:"low-power"});
 if(!context)throw new Error("WebGL is unavailable");
 const renderer=new THREE.WebGLRenderer({canvas,context,antialias:true,alpha:true,powerPreference:"low-power"});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));
 renderer.setClearColor(0xfffaf4,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
 const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(38,1,.1,100);
 scene.add(new THREE.HemisphereLight(0xffffff,0xb1a1b8,2.5));
 const key=new THREE.DirectionalLight(0xfff8e8,3);key.position.set(-3,6,5);scene.add(key);
 const rim=new THREE.DirectionalLight(0xe1eaff,1.5);rim.position.set(4,2,-3);scene.add(rim);
 const root=new THREE.Group();scene.add(root);let config=initial;let signature="";let disposed=false;
 let visible=true,idleYaw=0,idleTime=0,lastTime=0,lastFrame=0,resumeAfter=0;
 const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)");
 function clear(){root.traverse(object=>{const mesh=object as THREE.Mesh;if(mesh.geometry)mesh.geometry.dispose();if(mesh.material){const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];materials.forEach(material=>material.dispose());}});root.clear();}
 function shape(geometry:THREE.BufferGeometry,color:number,parent:THREE.Object3D=root,opacity=1,edges=true){
  const material=new THREE.MeshStandardMaterial({color,roughness:.48,metalness:0,side:THREE.DoubleSide,transparent:opacity<1,opacity,depthWrite:opacity===1,wireframe:config.wireframe});
  const mesh=new THREE.Mesh(geometry,material);parent.add(mesh);
  if(edges&&!config.wireframe){const outline=new THREE.LineSegments(new THREE.EdgesGeometry(geometry,25),new THREE.LineBasicMaterial({color:ink,transparent:opacity<1,opacity:Math.max(.2,opacity*.6)}));mesh.add(outline);}
  return mesh;
 }
 function rebuild(){
  clear();const {kind}=config;
  if(kind==="net"){
   const s=(config.size??3)*.43,angle=(1-(config.unfold??0)/100)*Math.PI/2;
   const net=new THREE.Group();root.add(net);net.position.set(0,-s*(config.unfold??0)/200,s*(1-(config.unfold??0)/100)/2);
   const face=(parent:THREE.Object3D,color:number,x=0,y=0)=>{const mesh=shape(new THREE.PlaneGeometry(s,s),color,parent);mesh.position.set(x,y,0);};
   face(net,colors[0]);
   const hinge=(x:number,y:number,axis:"x"|"y",rotation:number)=>{const group=new THREE.Group();group.position.set(x,y,0);group.rotation[axis]=rotation;net.add(group);return group;};
   const right=hinge(s/2,0,"y",angle);face(right,colors[1],s/2);
   const left=hinge(-s/2,0,"y",-angle);face(left,colors[2],-s/2);
   const top=hinge(0,s/2,"x",-angle);face(top,colors[3],0,s/2);
   const bottom=hinge(0,-s/2,"x",angle);face(bottom,colors[4],0,-s/2);
   const back=new THREE.Group();back.position.y=s;back.rotation.x=-angle;top.add(back);face(back,colors[5],0,s/2);
  }else if(kind==="comparison"){
   const r=(config.radius??3)*.28,h=(config.height??5)*.28;
   const cylinder=shape(new THREE.CylinderGeometry(r,r,h,48),colors[1]);cylinder.position.set(-1.5,h/2-1.5,0);
   const cone=shape(new THREE.ConeGeometry(r,h,48),colors[0]);cone.position.set(1.5,h/2-1.5,0);
   for(const x of [-1.5,1.5]){const base=shape(new THREE.CircleGeometry(r,48),0x725486);base.rotation.x=-Math.PI/2;base.position.set(x,-1.505,0);}
  }else if(kind==="tank"){
   const h=1.5,w=3,d=1.5,fill=Math.max(0,Math.min(100,config.fill??75))/100;
   shape(new THREE.BoxGeometry(w,h,d),0xe9e2f1,root,.13);
   if(fill>0){const water=shape(new THREE.BoxGeometry(w-.05,(h-.05)*fill,d-.05),0x77bddb,root,.72);water.position.y=-(h-.05)*(1-fill)/2;}
   const floor=shape(new THREE.BoxGeometry(w+.14,.08,d+.14),colors[1]);floor.position.y=-h/2-.06;
  }else{
   const s=2.25;
   if(kind==="cube")shape(new THREE.BoxGeometry(s,s,s),colors[0]);
   if(kind==="prism")shape(new THREE.BoxGeometry(2.8,1.5,1.6),colors[1]);
   if(kind==="sphere")shape(new THREE.SphereGeometry(1.35,40,28),colors[4],root,1,false);
   if(kind==="cylinder")shape(new THREE.CylinderGeometry(1.1,1.1,2.4,48),colors[2]);
   if(kind==="cone")shape(new THREE.ConeGeometry(1.35,2.6,48),colors[3]);
   if(kind==="pyramid"){const pyramid=shape(new THREE.ConeGeometry(1.7,2.5,4),colors[5]);pyramid.rotation.y=Math.PI/4;}
  }
 }
 function render(){if(disposed)return;root.rotation.set(config.pitch+Math.sin(idleTime*.55)*.22,config.yaw+idleYaw,Math.sin(idleTime*.32)*.04);const distance=config.kind==="net"?9+(config.unfold??0)*.15:config.kind==="comparison"?10:7.8;camera.position.set(0,1.7,distance);camera.lookAt(0,0,0);renderer.render(scene,camera);canvas.dataset.frame=String(Number(canvas.dataset.frame||0)+1);canvas.dataset.rotation=`${root.rotation.x.toFixed(4)},${root.rotation.y.toFixed(4)}`;}
 function animate(time:number){if(!lastTime)lastTime=time;const delta=Math.min((time-lastTime)/1000,.05);lastTime=time;if(config.interacting||time<resumeAfter)return;idleTime+=delta;idleYaw=(idleYaw+delta*.32)%(Math.PI*2);if(time-lastFrame>=1000/30){lastFrame=time;render();}}
 function syncMotion(){lastTime=0;renderer.setAnimationLoop(!disposed&&visible&&!document.hidden&&!config.paused&&!reducedMotion.matches?animate:null);}
 function update(next:GeometryConfig){if(config.yaw!==next.yaw||config.pitch!==next.pitch||config.interacting!==next.interacting)resumeAfter=performance.now()+2200;config=next;const nextSignature=JSON.stringify([config.kind,config.size,config.height,config.radius,config.unfold,config.fill,config.wireframe]);if(signature!==nextSignature){signature=nextSignature;rebuild();}render();syncMotion();}
 function resize(){const {width,height}=canvas.getBoundingClientRect();if(!width||!height||disposed)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();render();}
 const observer=new ResizeObserver(resize);observer.observe(canvas);
 const visibility=new IntersectionObserver(entries=>{visible=entries.some(entry=>entry.isIntersecting);syncMotion();});visibility.observe(canvas);
 document.addEventListener("visibilitychange",syncMotion);reducedMotion.addEventListener("change",syncMotion);update(initial);resize();
 return {update,dispose(){disposed=true;renderer.setAnimationLoop(null);observer.disconnect();visibility.disconnect();document.removeEventListener("visibilitychange",syncMotion);reducedMotion.removeEventListener("change",syncMotion);clear();renderer.dispose();renderer.forceContextLoss();}};
}

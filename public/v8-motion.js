(() => {
  const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
  const lerp=(a,b,p)=>a+(b-a)*p;
  const progress=(el)=>{const r=el.getBoundingClientRect();return clamp((-r.top)/Math.max(1,r.height-innerHeight));};
  const set=(el,transform,opacity)=>{if(!el)return;el.style.transform=transform;if(opacity!==undefined)el.style.opacity=String(clamp(opacity));};
  function mount(){
    const root=document.querySelector('.mb-v8-story');
    if(!root){requestAnimationFrame(mount);return;}
    if(root.dataset.motion==='1')return;root.dataset.motion='1';
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const hero=root.querySelector('[data-v8="hero"]');
    const services=root.querySelector('[data-v8="services"]');
    const route=root.querySelector('[data-v8="route"]');
    const rows=[...root.querySelectorAll('.v8-service-list>div')];
    const road=root.querySelector('.v8-road-live');
    let raf=0;
    const draw=()=>{
      raf=0;
      if(hero){
        const p=progress(hero);
        set(hero.querySelector('.v8-hero-copy'),`translate3d(0,${lerp(0,-46,p)}px,0)`,1-p*.72);
        set(hero.querySelector('.v8-hero-media'),`translate3d(${lerp(18,-18,p)}px,${lerp(10,-10,p)}px,0) scale(${lerp(1,1.025,p)})`,1-p*.16);
        set(hero.querySelector('.v8-media-hero'),`scale(${lerp(1.04,1.095,p)})`);
      }
      if(services){
        const p=progress(services);
        const enter=clamp(p/.32), exit=clamp((p-.72)/.28);
        set(services.querySelector('.v8-services-copy'),`translate3d(0,${lerp(28,-18,p)}px,0)`,enter*(1-exit*.55));
        set(services.querySelector('.v8-services-media'),`translate3d(${lerp(24,-12,p)}px,0,0) scale(${lerp(.985,1.02,p)})`,clamp(enter+.18));
        set(services.querySelector('.v8-media-services'),`scale(${lerp(1.08,1.02,p)}) translate3d(0,${lerp(12,-12,p)}px,0)`);
        const active=Math.min(rows.length-1,Math.floor(clamp(p*.98)*rows.length));
        rows.forEach((row,i)=>row.classList.toggle('active',i===active));
      }
      if(route){
        const p=progress(route);
        set(route.querySelector('.v8-route-visual'),`translate3d(${lerp(-18,16,p)}px,${lerp(10,-8,p)}px,0) scale(${lerp(.985,1.015,p)})`,clamp(.35+p*1.2));
        set(route.querySelector('.v8-route-copy'),`translate3d(0,${lerp(34,-12,p)}px,0)`,clamp(p*1.8));
        if(road) road.style.strokeDashoffset=String(1050*(1-clamp(p*1.12)));
      }
    };
    const queue=()=>{if(!raf)raf=requestAnimationFrame(draw);};
    addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue);draw();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();

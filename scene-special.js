function isoPlatform(x,y,w,h,color='#d4ead0'){const cx=x+w/2,cy=y,rx=w/2,ry=h/2,r=Math.min(12,rx/4,ry/3);const top=`M${x+r} ${cy-r*ry/rx} L${cx-r} ${cy-ry+r*ry/rx} Q${cx} ${cy-ry} ${cx+r} ${cy-ry+r*ry/rx} L${x+w-r} ${cy-r*ry/rx} Q${x+w} ${cy} ${x+w-r} ${cy+r*ry/rx} L${cx+r} ${cy+ry-r*ry/rx} Q${cx} ${cy+ry} ${cx-r} ${cy+ry-r*ry/rx} L${x+r} ${cy+r*ry/rx} Q${x} ${cy} ${x+r} ${cy-r*ry/rx}Z`;return `<g class="iso-platform"><path d="${top}" transform="translate(0 9)" fill="#d7e4d0" stroke="#9fcaa0" stroke-width="1.5"/><path d="${top}" fill="${color}88" stroke="#9fcaa0" stroke-width="2"/></g>`}
function isoPeople(x,y,count=8){const colors=['#f5ba8e','#cbb9ea','#b6d9f4','#d8e9ae'];let s='';for(let i=0;i<count;i++){const col=i%4,row=Math.floor(i/4),px=x+col*22+row*10,py=y+row*22-col*3,c=colors[i%4];s+=`<g transform="translate(${px} ${py})"><ellipse cy="11" rx="8" ry="4" fill="#24382d33"/><path d="M-6 -4 Q0 -9 6 -4 L6 11 Q0 16 -6 11Z" fill="${c}" stroke="#344437" stroke-width="1.8"/><circle cy="-11" r="5" fill="#fff8eb" stroke="#344437" stroke-width="1.7"/></g>`}return s}
function isoMiniServer(x,y,failed=false){const c=failed?'#f5b0a7':'#b8d1ed';return `<g transform="translate(${x} ${y}) scale(.42)" class="mini-server ${failed?'mini-failed':''}"><g stroke="#2b3e42" stroke-width="3" stroke-linejoin="round">${shapeSvg('cube',c)}</g><rect x="-33" y="-15" width="27" height="17" rx="4" fill="#f8fcff" stroke="#2b3e42" stroke-width="2"/><path d="M-27 -9h14m-14 5h14" stroke="#2b3e42" stroke-width="2"/></g>`}
function isoTag(x,y,text){return `<g class="iso-tag" transform="translate(${x} ${y})"><rect x="-58" y="-14" width="116" height="27" rx="13" fill="#fffdf6" stroke="#334236" stroke-width="1.7"/><text text-anchor="middle" y="4">${svgEscape(text)}</text></g>`}
function isoTrail(id, from, to, path, load, stroke, dashed = false) {
  return flowLink({ id, from, to, path, load, stroke,
    state: dashed ? 'muted' : 'active', className: dashed ? 'scene-trail trail-dashed' : 'scene-trail' });
}
function sceneDefs(){return `<defs><filter id="isoShadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="5" dy="8" stdDeviation="5" flood-color="#2f4330" flood-opacity=".22"/></filter>${flowMarkers()}<pattern id="isoGrid" width="32" height="18" patternUnits="userSpaceOnUse"><path d="M0 0L32 18M32 0L0 18" stroke="#c5d8c1" stroke-opacity=".45" stroke-width=".7"/></pattern></defs><rect width="1000" height="500" fill="url(#isoGrid)" opacity=".52"/>`}
function sceneNode(id,x,y,shape,color,label,hot=false,scale=1){return `<g class="diagram-node ${hot?'node-hot':''}" data-inspect="${id}" data-layout-node="${id}" tabindex="0" role="button" aria-label="Inspect ${svgEscape(label)}" transform="translate(${x} ${y})"><g class="shape" filter="url(#isoShadow)" transform="scale(${scale})" stroke="#34463c" stroke-width="2.3" stroke-linejoin="round">${shapeSvg(shape,color)}</g>${isoTag(0,scale*83,label)}</g>`}
function mathScene(lesson,step,scenario,load){const peak=Math.round(23*load),servers=Math.max(2,Math.ceil(peak/65));let out=sceneDefs();
out+=isoPlatform(125,300,215,92);
if(step>=1)out+=isoPlatform(280,214,335,144)+isoTrail('requests', 'users', 'app', 'M252 300 Q315 263 373 274',load,'#438b5b');
if(step>=4)out+=isoPlatform(330,385,175,75)+isoTrail('cache', 'cache', 'app', 'M416 185 Q458 219 498 245',load,'#6b9b62',true)+isoTrail('cdn', 'cdn', 'app', 'M418 376 Q482 330 520 311',load,'#6b9b62',true);
if(step>=6)out+=isoPlatform(630,340,240,98)+isoTrail('storage', 'app', 'storage', 'M570 298 Q633 315 692 334',load,'#8c77a9');
out+=`<g class="iso-scene-group scene-reveal ${step===0?'scene-hot':''}" data-inspect="users" data-layout-node="users" tabindex="0" role="button" aria-label="Inspect users"><g class="shape">${isoPeople(157,274,12)}</g>${isoTag(218,366,'100k daily users')}</g>`;
if (step >= 1) {
  out += '<g data-inspect="app" data-layout-node="app" tabindex="0" role="button" aria-label="Inspect app servers"><g class="shape">';
  for (let i = 0; i < 8; i++) {
    const row = Math.floor(i / 4), col = i % 4;
    out += isoMiniServer(396 + col * 44 + row * 22, 244 + row * 40 - col * 14, scenario && i === 5);
  }
  out += `</g>${isoTag(485,353,`${servers} app servers`)}</g>`;
}
if(step>=4)out+=sceneNode('cache',348,158,'cube','#c9e8b6','CACHE',step===4,.64)+sceneNode('cdn',405,385,'cube','#c9e8b6','CDN',step===4,.62);
if (step >= 6) {
  out += '<g data-layout-node="storage" tabindex="-1" role="button" aria-label="Move storage"><g class="shape">';
  for (let i = 0; i < 3; i++) {
    out += `<g transform="translate(${686 + i * 56} ${337 + (i % 2) * 28}) scale(.43)" filter="url(#isoShadow)" stroke="#403a4e" stroke-width="3">${shapeSvg('cylinder','#dfcdf1')}</g>`;
  }
  out += `</g>${isoTag(754,445,'STORAGE')}</g>`;
}
if(step>=2)out+=`<g class="estimate-card scene-reveal" transform="translate(704 36)"><rect width="250" height="133" rx="11" fill="#fffdf8" stroke="#3c4940" stroke-width="2"/><text x="17" y="25" class="estimate-title">THE ESTIMATE · EXAMPLE</text><path d="M17 34H232" stroke="#d6ded2"/><text x="17" y="57">daily users</text><text x="229" y="57" text-anchor="end">100,000</text><text x="17" y="77">average</text><text x="229" y="77" text-anchor="end">≈ 23 req/s</text><text x="17" y="97">peak at ${load}×</text><text x="229" y="97" text-anchor="end">≈ ${peak} req/s</text><text x="17" y="117">event storage</text><text x="229" y="117" text-anchor="end">≈ 730 GB/year</text></g>`;
if(scenario&&step>=1)out+=`<g class="failure-banner"><rect x="350" y="38" width="264" height="34" rx="17"/><text x="482" y="60" text-anchor="middle">ONE SERVER FAILS · ROUTE TO HEALTHY NODES</text></g>`;
return {html:out,nodes:[],layout:{kind:'math'},failedNode:scenario?'app':null}}
function deployScene(lesson,step,scenario,load){let out=sceneDefs();out+=isoPlatform(80,306,220,98);const manual=step<2;
if(step>=2)out+=isoPlatform(340,265,180,82);
if(step>=4)out+=isoPlatform(554,320,190,85)+isoPlatform(760,352,195,90);
if(step===0)out+=isoTrail('manual', 'laptop', 'production', 'M253 259 Q405 185 632 271',load,'#443e37',true);
if(step>=2)out+=isoTrail('build', 'laptop', 'ci', 'M256 263 Q335 239 386 247',load,'#443e37');
if(step>=3)out+=isoTrail('release', 'ci', 'production', 'M478 256 Q551 265 623 275',load,'#cf8652');
if(step>=4)out+=isoTrail('serve', 'production', 'users', 'M689 305 Q776 324 808 328',load,'#41845d');
out+=sceneNode('laptop',187,248,'browser','#e4d2ee','DEVELOPER',step<=1,.85);
if(step>=2)out+=sceneNode('ci',425,250,'cube',scenario?'#f6b4aa':'#d8e5f6','CI PIPELINE',step>=2&&step<=3,.64);
if(step===0||step>=4)out+=sceneNode('production',636,278,'cube',scenario?'#f4b2a8':'#bdd6ef','PRODUCTION',step>=4,.77);
if(step===0||step>=4)out+=`<g data-inspect="users" data-layout-node="users" tabindex="0" role="button" aria-label="Inspect users"><g class="shape">${isoPeople(805,323,8)}</g>${isoTag(849,434,'USERS')}</g>`;
if(step>=1)out+=`<g class="release-note scene-reveal" transform="translate(335 52)"><rect width="255" height="58" rx="10" fill="#fffdf7" stroke="#455449" stroke-width="1.6"/><text x="14" y="23">COMMIT → TEST → BUILD → DEPLOY</text><text x="14" y="44" class="small">${scenario?'Health check failed · rollback':'Versioned artifact · health checked'}</text></g>`;
if(step>=5)out+=`<g class="estimate-card scene-reveal" transform="translate(744 40)"><rect width="210" height="111" rx="11" fill="#fffdf8" stroke="#3c4940" stroke-width="2"/><text x="16" y="24" class="estimate-title">RELEASE SIGNALS</text><path d="M16 32H194" stroke="#d6ded2"/><text x="16" y="53">tests</text><text x="193" y="53" text-anchor="end">${scenario?'FAILED':'PASSING'}</text><text x="16" y="75">rollout</text><text x="193" y="75" text-anchor="end">${step<6?'canary 10%':'100%'}</text><text x="16" y="97">recovery</text><text x="193" y="97" text-anchor="end">${scenario?'ROLLBACK':'READY'}</text></g>`;
if (scenario && step >= 4) out += flowLink({
  id: 'rollback', from: 'production', to: 'ci', path: 'M616 224 Q512 155 435 190',
  state: 'failed', className: 'rollback-path', stroke: '#d45f54'
});
return {html:out,nodes:[],layout:{kind:'deploy'},failedNode:scenario?'production':null}}

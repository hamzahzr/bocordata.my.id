const API = {
  login: '/api/login.php',
  register: '/api/register.php',
  logout: '/api/logout.php',
  session: '/api/session.php',
  check: '/api/check.php',
  admin: '/api/admin.php'
};

const $ = (id) => document.getElementById(id);
const views = { login: $('loginView'), register: $('registerView'), app: $('appView'), admin: $('adminView') };
let currentResult = null;

function showView(name){ Object.values(views).forEach(v => v.classList.add('hidden')); views[name].classList.remove('hidden'); }
function message(el, text, ok=false){ el.textContent=text; el.classList.toggle('hidden', !text); el.classList.toggle('success', ok); el.classList.toggle('error', !ok); }
async function jsonFetch(url, options={}){
  const r=await fetch(url,{credentials:'same-origin',...options});
  const data=await r.json().catch(()=>({error:'Respons server bukan JSON'}));
  if(!r.ok) throw new Error(data.error||'Permintaan gagal');
  return data;
}

async function loadSession(){
  try{
    const data=await jsonFetch(API.session);
    if(data.authenticated){
      showView('app');
      $('adminBtn').classList.toggle('hidden', data.user.role !== 'admin');
      setUserIdentity(data.user);
      return data.user;
    }
  }catch(e){}
  showView('login');
  return null;
}

function setUserIdentity(user){
  const name=user?.name||user?.username||user?.email||'Pengguna';
  $('usernameDisplay').textContent=name;
  $('heroUsername').textContent=name;
  $('userAvatar').textContent=name.trim().charAt(0).toUpperCase();
}

$('showRegister').addEventListener('click',()=>showView('register'));
$('backLogin').addEventListener('click',()=>showView('login'));
$('loginForm').addEventListener('submit',async e=>{
  e.preventDefault(); message($('loginError'),'');
  try{
    const data=await jsonFetch(API.login,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:$('email').value.trim(),password:$('password').value})});
    $('adminBtn').classList.toggle('hidden',data.user.role!=='admin');
    setUserIdentity(data.user);
    showView('app');
  }catch(err){message($('loginError'),err.message)}
});

$('registerForm').addEventListener('submit',async e=>{
  e.preventDefault(); message($('registerError'),''); message($('registerSuccess'),'');
  try{
    const data=await jsonFetch(API.register,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:$('regName').value.trim(),email:$('regEmail').value.trim(),password:$('regPassword').value})});
    message($('registerSuccess'),data.message||'Pendaftaran berhasil. Tunggu persetujuan admin.',true);
    $('registerForm').reset();
  }catch(err){message($('registerError'),err.message)}
});

$('logout').addEventListener('click',async()=>{try{await jsonFetch(API.logout,{method:'POST'})}catch(e){} showView('login');});
$('backDashboard').addEventListener('click',()=>showView('app'));

function escapeHtml(v){return String(v??'').replace(/[&<>'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]));}
function flattenValue(v){
  if(v===null||v===undefined||v==='') return '—';
  if(typeof v==='object') return JSON.stringify(v,null,2);
  return String(v);
}
function isNoResultRow(row){
  const text=JSON.stringify(row||{}).toLowerCase();
  return text.includes('no results found') || text.includes('no result found');
}
function renderResults(payload){
  const root=$('resultData'); root.innerHTML='';
  const data=payload?.data ?? payload;
  const list=data?.List;
  if(!list || typeof list!=='object'){
    const pre=document.createElement('pre'); pre.textContent=JSON.stringify(data,null,2); root.appendChild(pre); return;
  }
  const keys=Object.keys(list);
  const normalized=keys.map(name=>{
    const item=list[name]||{};
    const rows=Array.isArray(item.Data)?item.Data:[];
    return {name,item,rows:rows.filter(row=>!isNoResultRow(row))};
  });
  const totalData=normalized.reduce((n,x)=>n+x.rows.length,0);
  const sourcesFound=normalized.filter(x=>x.rows.length>0).length;
  const hasNoResults=totalData===0;

  root.innerHTML=`<div class="result-summary"><div class="summary-card"><span>Sumber ditemukan</span><strong>${sourcesFound}</strong></div><div class="summary-card"><span>Total data</span><strong>${totalData}</strong></div><div class="summary-card"><span>Status</span><strong>${hasNoResults?'TIDAK DITEMUKAN':'SELESAI'}</strong></div></div><div class="result-toolbar"><input id="resultFilter" placeholder="Cari di hasil pemeriksaan…" autocomplete="off"><span class="hint">Tampilan vertikal • mudah dibaca di HP</span></div><div id="resultCards"></div>`;
  const cards=$('resultCards');
  const renderFiltered=()=>{
    const filter=($('resultFilter')?.value||'').trim().toLowerCase(); cards.innerHTML='';
    normalized.forEach((source,index)=>{
      const {name,item,rows}=source;
      const sourceText=(name+' '+(item.InfoLeak||'')+' '+JSON.stringify(rows)).toLowerCase();
      if(filter && !sourceText.includes(filter)) return;
      const card=document.createElement('article'); card.className='leak-card';
      let html=`<div class="leak-head"><div><div class="eyebrow">SUMBER ${index+1}</div><h3>${escapeHtml(name)}</h3><p>${escapeHtml(item.InfoLeak||'Informasi sumber tidak tersedia.')}</p></div><span class="source-badge">${rows.length} data</span></div>`;
      if(rows.length){
        html+=`<button class="secondary source-toggle" type="button" data-toggle="${index}">Tampilkan detail ↓</button><div class="data-stack hidden" id="source-${index}">`;
        rows.slice(0,100).forEach((row,rowIndex)=>{
          html+=`<div class="data-record"><div class="record-label">DATA ${rowIndex+1}</div>`;
          const fields=Object.entries(row||{});
          fields.forEach(([key,val])=>{
            const text=flattenValue(val);
            html+=`<div class="data-row"><div class="data-key">${escapeHtml(key)}</div><div class="data-value">${escapeHtml(text)}<button class="copy-field" type="button" data-copy="${escapeHtml(text)}">Salin</button></div></div>`;
          });
          html+='</div>';
        });
        if(rows.length>100) html+=`<div class="hint">Menampilkan 100 data pertama dari ${rows.length} data.</div>`;
        html+='</div>';
      } else {
        html+='<div class="empty-result"><strong>0 hasil ditemukan</strong><p>Coba gunakan data lain, misalnya <b>email</b>, <b>nama lengkap</b>, atau <b>nomor telepon</b>. Pastikan juga identifier yang dimasukkan sudah benar.</p></div>';
      }
      cards.innerHTML+=html;
    });
    if(!cards.children.length) cards.innerHTML='<div class="empty">Tidak ada hasil yang cocok dengan pencarian.</div>';
  };
  renderFiltered();
  $('resultFilter').addEventListener('input',renderFiltered);
  cards.addEventListener('click',async e=>{
    const toggle=e.target.closest('[data-toggle]');
    if(toggle){const box=$('source-'+toggle.dataset.toggle);box.classList.toggle('hidden');toggle.textContent=box.classList.contains('hidden')?'Tampilkan detail ↓':'Sembunyikan detail ↑';return;}
    const copy=e.target.closest('[data-copy]');
    if(copy){try{await navigator.clipboard.writeText(copy.dataset.copy);const old=copy.textContent;copy.textContent='Tersalin ✓';setTimeout(()=>copy.textContent=old,1200)}catch(err){}}
  });
}

$('checkBtn').addEventListener('click',async()=>{
  const query=$('query').value.trim(); if(!query)return;
  $('checkBtn').disabled=true; $('checkBtn').textContent='Memeriksa…'; $('resultPanel').classList.remove('hidden');
  $('resultTitle').textContent='Memproses pemeriksaan'; $('resultBadge').textContent='LOADING'; $('resultMeta').textContent='Menghubungi server…'; $('resultData').innerHTML='<div class="loading">Sedang memproses permintaan…</div>';
  try{
    const data=await jsonFetch(API.check,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query})});
    currentResult=data;
    const payloadList=data?.data?.List;
    const totalFound=payloadList&&typeof payloadList==='object'?Object.values(payloadList).reduce((n,item)=>n+(Array.isArray(item?.Data)?item.Data.filter(row=>!isNoResultRow(row)).length:0),0):null;
    $('resultTitle').textContent=totalFound===0?'Tidak ditemukan':'Pemeriksaan selesai';
    $('resultBadge').textContent=totalFound===0?'0 DATA':'SUCCESS';
    $('resultMeta').textContent=`Query: ${query} · ${new Date().toLocaleString('id-ID')}`;
    renderResults(data);
  }catch(err){$('resultTitle').textContent='Pemeriksaan gagal';$('resultBadge').textContent='ERROR';$('resultMeta').textContent='';$('resultData').innerHTML=`<div class="error">${escapeHtml(err.message)}</div>`;}
  finally{$('checkBtn').disabled=false;$('checkBtn').innerHTML='Periksa <span>→</span>';}
});

$('downloadPdf').addEventListener('click',()=>{
  if(!currentResult)return;
  if(!window.jspdf){window.print();return;}
  const {jsPDF}=window.jspdf; const doc=new jsPDF({unit:'mm',format:'a4'}); const query=$('query').value.trim();
  doc.setFontSize(18); doc.text('BocorData.my.id',15,18); doc.setFontSize(10); doc.text('Laporan Pemeriksaan Data',15,25); doc.text(`Identifier: ${query}`,15,31); doc.text(`Waktu: ${new Date().toLocaleString('id-ID')}`,15,37);
  let y=44; const list=currentResult?.data?.List;
  if(list && typeof list==='object') Object.entries(list).forEach(([name,item])=>{if(y>270){doc.addPage();y=18;} doc.setFontSize(13);doc.text(String(name).slice(0,80),15,y);y+=5;doc.setFontSize(8);const info=String(item?.InfoLeak||'').slice(0,140);if(info){doc.text(doc.splitTextToSize(info,180),15,y);y+=8;}const rows=Array.isArray(item?.Data)?item.Data.filter(row=>!isNoResultRow(row)):[];if(rows.length&&doc.autoTable){const cols=[...new Set(rows.flatMap(r=>Object.keys(r||{})))].slice(0,8);doc.autoTable({startY:y,head:[cols],body:rows.slice(0,100).map(r=>cols.map(c=>String(r?.[c]??''))),styles:{fontSize:7,cellPadding:2},headStyles:{fontSize:7}});y=doc.lastAutoTable.finalY+10;}else{doc.text('Tidak ada hasil yang ditemukan. Coba gunakan email, nama lengkap, atau nomor telepon.',15,y);y+=10;}}); else {doc.setFontSize(8);doc.text(doc.splitTextToSize(JSON.stringify(currentResult,null,2),180),15,y);}
  doc.save(`bocordata-${Date.now()}.pdf`);
});

$('copyResult').addEventListener('click',async()=>{if(!currentResult)return;try{await navigator.clipboard.writeText(JSON.stringify(currentResult,null,2));$('copyResult').textContent='Tersalin ✓';setTimeout(()=>$('copyResult').textContent='Salin hasil',1500);}catch(e){}});

$('adminBtn').addEventListener('click',async()=>{showView('admin');await loadAdmin();});
$('refreshAdmin').addEventListener('click',loadAdmin);
async function loadAdmin(){
  const box=$('userTable');box.innerHTML='<div class="loading">Memuat pengguna…</div>';
  try{
    const data=await jsonFetch(API.admin); const users=data.users||[];
    $('pendingCount').textContent=users.filter(u=>u.status==='pending').length; $('approvedCount').textContent=users.filter(u=>u.status==='approved').length; $('rejectedCount').textContent=users.filter(u=>u.status==='rejected').length;
    if(!users.length){box.innerHTML='<div class="empty">Belum ada pengguna.</div>';return;}
    box.innerHTML=users.map(u=>`<div class="user-row"><div><strong>${escapeHtml(u.name)}</strong><span>${escapeHtml(u.email)}</span><small>${escapeHtml(u.created_at||'')}</small></div><div class="user-actions"><span class="status-pill ${u.status}">${escapeHtml(u.status)}</span>${u.status==='pending'?`<button class="approve" data-action="approve" data-id="${u.id}">Setujui</button><button class="reject" data-action="reject" data-id="${u.id}">Tolak</button>`:''}</div></div>`).join('');
  }catch(err){box.innerHTML=`<div class="error">${escapeHtml(err.message)}</div>`;}
}
$('userTable').addEventListener('click',async e=>{const btn=e.target.closest('button[data-action]');if(!btn)return;btn.disabled=true;try{await jsonFetch(API.admin,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:btn.dataset.action,id:btn.dataset.id})});await loadAdmin();}catch(err){alert(err.message);btn.disabled=false;}});

loadSession();

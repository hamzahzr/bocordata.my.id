const activityApi='/api/activity.php';
const $=id=>document.getElementById(id);
function escapeHtml(v){return String(v??'').replace(/[&<>\'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function activityLabel(action){const map={'Pemeriksaan data':'Pemeriksaan data','Pemeriksaan gagal':'Pemeriksaan gagal','Login':'Login','Logout':'Keluar','Pendaftaran':'Pendaftaran'};return map[action]||action||'Aktivitas';}
function activityIcon(action){return action==='Pemeriksaan data'?'⌕':action==='Pemeriksaan gagal'?'!':action==='Login'?'↪':action==='Logout'?'↩':'•';}
async function loadActivity(){
 const box=$('activityList');box.innerHTML='<div class="loading">Memuat riwayat…</div>';
 try{const data=await jsonFetch(activityApi);const items=data.activities||[];if(!items.length){box.innerHTML='<div class="empty">Belum ada aktivitas.</div>';return;}
 box.innerHTML=items.map(x=>`<div class="activity-row"><div class="activity-icon">${activityIcon(x.action)}</div><div class="activity-main"><strong>${escapeHtml(activityLabel(x.action))}</strong><span>${escapeHtml(x.detail||'Aktivitas akun')}</span></div><time>${new Date(x.created_at).toLocaleString('id-ID')}</time></div>`).join('');
 }catch(e){box.innerHTML='<div class="empty">Riwayat belum dapat dimuat.</div>';}
}
async function init(){
 try{const session=await jsonFetch('/api/session.php');if(!session.authenticated){location.href='index.html';return;}
 const user=session.user||{};const name=user.name||user.username||user.email||'Pengguna';$('usernameDisplay').textContent=name;$('userAvatar').textContent=name.trim().charAt(0).toUpperCase()||'U';
 $('logout').addEventListener('click',async()=>{try{await jsonFetch('/api/logout.php',{method:'POST'})}catch(e){}location.href='index.html';});
 $('refreshActivity').addEventListener('click',loadActivity);loadActivity();
 }catch(e){location.href='index.html';}
}
document.addEventListener('DOMContentLoaded',init);

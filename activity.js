const activityApi='/api/activity.php';
function activityLabel(action){
 const map={'Pemeriksaan data':'Pemeriksaan data','Pemeriksaan gagal':'Pemeriksaan gagal','Login':'Login','Logout':'Keluar','Pendaftaran':'Pendaftaran'};return map[action]||action||'Aktivitas';
}
function activityIcon(action){return action==='Pemeriksaan data'?'⌕':action==='Pemeriksaan gagal'?'!':action==='Login'?'↪':'•';}
async function loadActivity(){
 const box=document.getElementById('activityList'); if(!box)return; box.innerHTML='<div class="loading">Memuat riwayat…</div>';
 try{
  const data=await jsonFetch(activityApi); const items=data.activities||[];
  if(!items.length){box.innerHTML='<div class="empty">Belum ada aktivitas.</div>';return;}
  box.innerHTML=items.map(x=>`<div class="activity-row"><div class="activity-icon">${activityIcon(x.action)}</div><div class="activity-main"><strong>${escapeHtml(activityLabel(x.action))}</strong><span>${escapeHtml(x.detail||'Aktivitas akun')}</span></div><time>${new Date(x.created_at).toLocaleString('id-ID')}</time></div>`).join('');
 }catch(e){box.innerHTML='<div class="empty">Riwayat belum dapat dimuat.</div>';}
}
document.addEventListener('DOMContentLoaded',()=>{const b=document.getElementById('refreshActivity');if(b)b.addEventListener('click',loadActivity);loadActivity();});

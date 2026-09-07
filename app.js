/* Plain HTML version — edit these values for your test environment. */
const DEMO_EMAIL = 'admin@example.com';
const DEMO_PASSWORD = 'admin123';
// For a real deployment, do NOT put a secret API key here. Point this to a backend/proxy instead.
const API_URL = '/api/check';

const loginView=document.getElementById('loginView');
const appView=document.getElementById('appView');
const loginForm=document.getElementById('loginForm');
const loginError=document.getElementById('loginError');
const checkBtn=document.getElementById('checkBtn');
const resultPanel=document.getElementById('resultPanel');
const resultTitle=document.getElementById('resultTitle');
const resultBadge=document.getElementById('resultBadge');
const resultData=document.getElementById('resultData');

function showApp(){loginView.classList.add('hidden');appView.classList.remove('hidden')}
function showLogin(){appView.classList.add('hidden');loginView.classList.remove('hidden')}
if(sessionStorage.getItem('bocordata_logged_in')==='1')showApp();

loginForm.addEventListener('submit',e=>{e.preventDefault();const email=document.getElementById('email').value.trim();const password=document.getElementById('password').value;if(email===DEMO_EMAIL&&password===DEMO_PASSWORD){sessionStorage.setItem('bocordata_logged_in','1');loginError.classList.add('hidden');showApp()}else loginError.classList.remove('hidden')});
document.getElementById('logout').addEventListener('click',()=>{sessionStorage.removeItem('bocordata_logged_in');showLogin()});

checkBtn.addEventListener('click',async()=>{const query=document.getElementById('query').value.trim();if(!query)return;checkBtn.disabled=true;checkBtn.innerHTML='Memeriksa…';resultPanel.classList.remove('hidden');resultTitle.textContent='Memproses pemeriksaan';resultBadge.textContent='LOADING';resultData.textContent='Menghubungi API…';try{const r=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query})});const data=await r.json().catch(()=>({error:'Respons API bukan JSON'}));if(!r.ok)throw new Error(data.error||'Pemeriksaan gagal');resultTitle.textContent='Pemeriksaan selesai';resultBadge.textContent=(data.status||'UNKNOWN').toString().toUpperCase();resultData.textContent=JSON.stringify(data.data??data,null,2)}catch(err){resultTitle.textContent='Pemeriksaan gagal';resultBadge.textContent='ERROR';resultData.textContent=err.message+'\n\nPastikan endpoint API tersedia dan mengizinkan request dari website ini.'}finally{checkBtn.disabled=false;checkBtn.innerHTML='Periksa Data <span>→</span>'}});

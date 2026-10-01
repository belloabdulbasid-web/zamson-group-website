
document.addEventListener('DOMContentLoaded',()=>{
 const toggle=document.querySelector('.menu-toggle'),nav=document.querySelector('nav');
 if(toggle&&nav) toggle.addEventListener('click',()=>{nav.classList.toggle('open');toggle.setAttribute('aria-expanded',nav.classList.contains('open')?'true':'false')});
 const current=location.pathname.split('/').pop()||'index.html';
 document.querySelectorAll('nav a').forEach(a=>{if(a.getAttribute('href')===current)a.classList.add('active')});
 const form=document.querySelector('#enquiry-form');
 if(form) form.addEventListener('submit',e=>{e.preventDefault();const d=new FormData(form);const subject=encodeURIComponent('Website enquiry - '+d.get('name'));const body=encodeURIComponent('Name: '+d.get('name')+'\nEmail: '+d.get('email')+'\nCompany: '+(d.get('company')||'Not provided')+'\n\n'+d.get('message'));location.href='mailto:?subject='+subject+'&body='+body;});
});

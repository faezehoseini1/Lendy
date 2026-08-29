const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const W=300,CX=150,CY=150,CR=144,COIN_R=15;
const coins=[];let spawnCount=0;const TOTAL=5;

function rand(a,b){return a+Math.random()*(b-a);}
function groundAt(x){
  const dx=x-CX;
  let best=CY+Math.sqrt(Math.max(0,CR*CR-dx*dx))-COIN_R;
  for(const c of coins){
    if(!c.settled)continue;
    const ddx=x-c.x;
    if(Math.abs(ddx)<COIN_R*2.4){
      const s=Math.sqrt(Math.max(0,(COIN_R*2.4)*(COIN_R*2.4)-ddx*ddx));
      if(c.y-s<best)best=c.y-s;
    }
  }
  return best;
}

function drawCoin(x,y,rot,alpha){
  ctx.save();
  ctx.globalAlpha=alpha;
  ctx.translate(x,y);ctx.rotate(rot);
  ctx.beginPath();ctx.ellipse(1,2,COIN_R,COIN_R*0.26,0,0,Math.PI*2);
  ctx.fillStyle='rgba(0,0,0,0.18)';ctx.fill();
  const g=ctx.createRadialGradient(-4,-4,1,0,0,COIN_R);
  g.addColorStop(0,'#fff8c0');
  g.addColorStop(0.35,'#f7cc00');
  g.addColorStop(0.72,'#c88000');
  g.addColorStop(1,'#7a4800');
  ctx.beginPath();ctx.arc(0,0,COIN_R,0,Math.PI*2);
  ctx.fillStyle=g;ctx.fill();
  ctx.strokeStyle='rgba(255,215,50,0.7)';ctx.lineWidth=1.5;ctx.stroke();
  ctx.beginPath();ctx.arc(0,0,COIN_R-4,0,Math.PI*2);
  ctx.strokeStyle='rgba(255,230,80,0.2)';ctx.lineWidth=1;ctx.stroke();
  ctx.beginPath();ctx.arc(-4,-5,COIN_R*0.25,0,Math.PI*2);
  ctx.fillStyle='rgba(255,255,255,0.22)';ctx.fill();
  ctx.fillStyle='rgba(90,50,0,0.9)';
  ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('$',0,1);
  ctx.restore();
}

let fadeTimer=0;const WAIT=100;

function loop(){
  ctx.clearRect(0,0,W,W);
  ctx.save();
  ctx.beginPath();ctx.arc(CX,CY,CR,0,Math.PI*2);ctx.clip();
  const allSettled=coins.length>0&&coins.every(c=>c.settled);
  if(allSettled){
    fadeTimer++;
    if(fadeTimer>WAIT){
      const done=coins.every(c=>c.alpha<=0);
      if(done){coins.length=0;spawnCount=0;fadeTimer=0;setTimeout(scheduleSpawn,500);}
      else coins.forEach(c=>c.alpha=Math.max(0,c.alpha-0.022));
    }
  }
  for(let i=coins.length-1;i>=0;i--){
    const f=coins[i];
    if(!f.settled){
      f.vy+=0.42;f.x+=f.vx;f.y+=f.vy;f.rot+=f.vrot;
      const dx=f.x-CX;
      if(Math.abs(dx)>CR-COIN_R){f.x=CX+(CR-COIN_R)*Math.sign(dx);f.vx*=-0.3;}
      const fl=groundAt(f.x);
      if(f.y>=fl){
        f.y=fl;f.vx*=0.28;f.vy*=-0.14;
        if(Math.abs(f.vy)<0.65){f.settled=true;f.vx=0;f.vy=0;}
      }
    }
    drawCoin(f.x,f.y,f.rot,f.alpha);
  }
  ctx.restore();
  requestAnimationFrame(loop);
}

loop();

function spawnOne(){
  coins.push({x:CX+rand(-CR*0.42,CR*0.42),y:-COIN_R,vx:rand(-0.7,0.7),vy:rand(2.5,5),rot:rand(0,Math.PI*2),vrot:rand(-0.07,0.07),settled:false,alpha:1});
  spawnCount++;
}

function scheduleSpawn(){
  if(spawnCount<TOTAL){spawnOne();setTimeout(scheduleSpawn,650);}
}

scheduleSpawn();
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, i * 100);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.card, .step, .stat, .item').forEach(el => {
    observer.observe(el);
});
const sections = document.querySelectorAll('section');
const menuLinks = document.querySelectorAll('.menu a');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        if (window.scrollY >= section.offsetTop - 200) {
            current = section.className;
        }
    });
    menuLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
});
// FAQ
document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
        const item = q.parentElement;
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
    });
});

// CHAT
const chatToggle = document.getElementById('chat-toggle');
const chatWidget = document.getElementById('chat-widget');
const chatClose = document.getElementById('chat-close');
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');
const chatMessages = document.getElementById('chat-messages');
const chatBadge = document.querySelector('.chat-badge');

const botReplies = [
    'ممنون از پیامت! تیم پشتیبانی در اسرع وقت پاسخ می‌ده 🙏',
    'سوال خوبیه! می‌تونی با ما از طریق تلگرام هم در ارتباط باشی.',
    'حتماً بررسی می‌کنیم و جواب می‌دیم 😊',
    'برای اطلاعات بیشتر می‌تونی بخش سوالات متداول رو هم ببینی.',
];

chatToggle.addEventListener('click', () => {
    chatWidget.classList.toggle('open');
    chatBadge.style.display = 'none';
});

chatClose.addEventListener('click', () => {
    chatWidget.classList.remove('open');
});

function addMessage(text, type) {
    const now = new Date();
    const time = now.getHours() + ':' + String(now.getMinutes()).padStart(2,'0');
    const msg = document.createElement('div');
    msg.className = 'chat-msg ' + type;
    msg.innerHTML = `<div class="chat-bubble">${text}</div><span class="chat-time">${time}</span>`;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    addMessage(text, 'user');
    chatInput.value = '';
    setTimeout(() => {
        const reply = botReplies[Math.floor(Math.random() * botReplies.length)];
        addMessage(reply, 'bot');
    }, 1000);
}

chatSend.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') sendMessage();
});
const logoEl = document.getElementById('logo-type');
const logoText = 'LENDY';
let logoIndex = 0;
let isDeleting = false;
document.querySelectorAll('.logo-word span').forEach((el, i) => {
    setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
    }, 200 + i * 100);
});

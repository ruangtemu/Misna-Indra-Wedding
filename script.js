document.addEventListener('DOMContentLoaded', function() {
    
    // --- 0. KONFIGURASI AWAL ---
    const urlParams = new URLSearchParams(window.location.search);
    const namaTamu = urlParams.get('to');
    const guestNameElement = document.getElementById('guestName');
    if (namaTamu && guestNameElement) {
        guestNameElement.innerText = decodeURIComponent(namaTamu);
    }

    const btnOpen = document.getElementById('open-invitation');
    const contentWrapper = document.getElementById('content-wrapper');
    const mainContainer = document.getElementById('main-container');
    const music = document.getElementById('background-music');
    const loader = document.getElementById('preloader');

    const pageOrder = ['page1', 'page2', 'page3', 'halaman4', 'halaman5', 'halaman6', 'halaman7', 'halaman9'];
    let touchStartY = null;
    let isInvitationOpened = false;

    if (loader) {
        setTimeout(() => {
            loader.classList.add('fade-out');
            setTimeout(() => { loader.style.display = 'none'; }, 1000);
        }, 2000);
    }

    // --- 1. INTERSECTION OBSERVER (UNTUK GALERI & ELEMEN LAIN) ---
    const globalObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animasi Galeri Khusus
                if (entry.target.classList.contains('masonry-item')) {
                    entry.target.style.opacity = "1";
                    entry.target.style.transform = "translateY(0)";
                    entry.target.classList.add('show');
                } else if (!entry.target.hasAttribute('data-aos')) {
                    entry.target.classList.add('active', 'aktif', 'animate-now');
                }
            }
        });
    }, { threshold: 0.1 });

    // --- 2. LOGIKA BUKA UNDANGAN ---
    if (btnOpen) {
        btnOpen.addEventListener('click', function(e) {
            e.preventDefault();
            isInvitationOpened = true;
            
            if (contentWrapper) {
                contentWrapper.style.display = 'block';
                void contentWrapper.offsetWidth; 
            }

            if (mainContainer) {
                mainContainer.style.overflowY = 'auto';
                mainContainer.style.height = 'auto';
            }

            if (typeof AOS !== 'undefined') {
                AOS.init({
                    duration: 1000,
                    once: true,
                    offset: 50
                });
                
                setTimeout(() => { 
                    AOS.refresh(); 
                    const page2 = document.getElementById('page2');
                    if (page2) page2.scrollIntoView({ behavior: 'smooth' });
                    
                    // Mulai observasi semua elemen setelah dibuka
                    document.querySelectorAll('section, .animate, .reveal, .gift-card, .masonry-item').forEach(el => {
                        globalObserver.observe(el);
                    });
                }, 400);
            }

            this.style.display = 'none';
            if (music) {
                music.play().catch(() => console.log("Musik aktif"));
            }
        });
    }

    // --- 3. ONE TAP SCROLL (FIX TOTAL UNTUK RSV/FORM) ---
    document.addEventListener('pointerdown', (e) => {
        // JIKA KLIK DI AREA FORM ATAU ELEMEN INTERAKTIF, MATIKAN SISTEM SCROLL
        if (e.target.closest('#container-pesan, form, input, textarea, select, button, a, .btn-maps, .copy-btn, .message-card')) {
            touchStartY = null; 
            return;
        }
        touchStartY = e.clientY;
    });

    document.addEventListener('pointerup', function(e) {
        if (!isInvitationOpened || touchStartY === null) return;

        // Validasi ulang saat jari dilepas
        if (e.target.closest('#container-pesan, form, input, textarea, select, button, a, .btn-maps, .copy-btn, .message-card')) {
            touchStartY = null;
            return; 
        }

        const deltaY = touchStartY - e.clientY;
        if (Math.abs(deltaY) < 15) { 
            const windowHeight = window.innerHeight;
            for (let i = 0; i < pageOrder.length; i++) {
                const currentEl = document.getElementById(pageOrder[i]);
                if (currentEl) {
                    const rect = currentEl.getBoundingClientRect();
                    if (rect.top < windowHeight / 2 && rect.bottom > windowHeight / 2) {
                        const nextEl = document.getElementById(pageOrder[i + 1]);
                        if (nextEl) {
                            nextEl.scrollIntoView({ behavior: 'smooth' });
                            break;
                        }
                    }
                }
            }
        }
        touchStartY = null;
    });

    // --- 4. COUNTDOWN (FIX ANGKA HILANG) ---
    const weddingDate = new Date(2026, 3, 11, 10, 0, 0).getTime();
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = weddingDate - now;
        if (distance < 0) return;
        const d = Math.floor(distance / (1000 * 60 * 60 * 24));
        const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);
        
        const ids = ["days", "hours", "minutes", "seconds"];
        const vals = [d, h, m, s];
        
        ids.forEach((id, index) => {
            const el = document.getElementById(id);
            if (el) {
                el.innerText = String(vals[index]).padStart(2, '0');
                el.style.opacity = "1";
                el.style.visibility = "visible";
            }
        });
    }
    setInterval(updateCountdown, 1000);
    updateCountdown();

    // --- 5. FIREBASE (FIX RSV SUBMIT) ---
    const firebaseConfig = {
        apiKey: "AIzaSyBNlmCpL5O7DD8kKh82S8u1grXphKuWGYA",
        authDomain: "misna-indra.firebaseapp.com",
        projectId: "misna-indra",
        storageBucket: "misna-indra.firebasestorage.app",
        messagingSenderId: "574443036305",
        appId: "1:574443036305:web:eb85744be69d50b0762930",
        measurementId: "G-YHNTN6591X"
    };

    if (typeof firebase !== 'undefined') {
        if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore();
        const btnKirim = document.getElementById("btn-kirim");
        const containerPesan = document.getElementById("container-pesan");

        if (btnKirim) {
            btnKirim.addEventListener('click', async function(e) {
                e.preventDefault();
                e.stopPropagation(); // Kunci agar tidak scroll
                
                const nama = document.getElementById("nama").value.trim();
                const pesan = document.getElementById("pesan").value.trim();
                const hadir = document.getElementById("kehadiran").value;
                
                if (nama && pesan && hadir) {
                    btnKirim.disabled = true;
                    btnKirim.innerText = "Mengirim...";
                    try {
                        await db.collection("ucapan").add({
                            nama, pesan, status: hadir, waktu: firebase.firestore.FieldValue.serverTimestamp()
                        });
                        document.getElementById("nama").value = "";
                        document.getElementById("pesan").value = "";
                        alert("Pesan Terkirim!");
                    } catch (err) { 
                        alert("Gagal kirim."); 
                    } finally { 
                        btnKirim.disabled = false; 
                        btnKirim.innerText = "Kirim Pesan"; 
                    }
                } else { 
                    alert("Lengkapi data ya!"); 
                }
            });
        }

        if (containerPesan) {
            db.collection("ucapan").orderBy("waktu", "desc").onSnapshot(snap => {
                containerPesan.innerHTML = "";
                let stats = { t:0, h:0, a:0 };
                snap.forEach(doc => {
                    const m = doc.data();
                    stats.t++; m.status === "Hadir" ? stats.h++ : stats.a++;
                    const card = document.createElement("div");
                    card.className = "message-card";
                    card.setAttribute("style", "background:rgba(255,255,255,0.08); padding:10px; border-radius:8px; margin-bottom:8px; border-left:3px solid #fff;");
                    card.innerHTML = `<h5 style="margin:0; font-size:0.85rem; color:#fff;">${m.nama} ${m.status === 'Hadir' ? '✔' : '✘'}</h5><p style="margin:4px 0 0; font-size:0.8rem; opacity:0.8; color:#fff;">${m.pesan}</p>`;
                    containerPesan.appendChild(card);
                });
                if(document.getElementById("total-pesan")) document.getElementById("total-pesan").innerText = stats.t;
                if(document.getElementById("total-hadir")) document.getElementById("total-hadir").innerText = stats.h;
                if(document.getElementById("total-tidak")) document.getElementById("total-tidak").innerText = stats.a;
            });
        }
    }
});

// --- 6. FUNGSI GLOBAL ---
function copyNum(val, el) {
    navigator.clipboard.writeText(val).then(() => {
        const originalHTML = el.innerHTML;
        el.innerHTML = '<i class="fa-solid fa-check"></i> Tersalin';
        setTimeout(() => { el.innerHTML = originalHTML; }, 2000);
    });
}

function copyVoucher() {
    const codeEl = document.getElementById('promoCode');
    if (codeEl) {
        navigator.clipboard.writeText(codeEl.innerText).then(() => {
            const toast = document.getElementById('toast');
            if (toast) {
                toast.classList.add('show');
                setTimeout(() => { toast.classList.remove('show'); }, 2000);
            }
        });
    }
}

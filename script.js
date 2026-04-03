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
    let touchStartY = 0;

    if (loader) {
        setTimeout(() => {
            loader.classList.add('fade-out');
            setTimeout(() => { loader.style.display = 'none'; }, 1000);
        }, 2000);
    }

    // --- 1. LOGIKA BUKA UNDANGAN (PERBAIKAN) ---
    if (btnOpen) {
        btnOpen.addEventListener('click', function() {
            if (contentWrapper) {
                contentWrapper.style.display = 'block';
            }

            if (mainContainer) {
                mainContainer.style.overflowY = 'auto';
                mainContainer.style.height = 'auto';
            }

            if (typeof AOS !== 'undefined') {
                // Inisialisasi AOS SATU KALI SAJA DI SINI
                AOS.init({
                    duration: 2500,
                    once: false,
                    mirror: true,
                    offset: 120, // Diperbesar sedikit agar tidak langsung muncul
                    easing: 'ease-in-out-sine'
                });
                
                setTimeout(() => { 
                    AOS.refresh(); 
                    const page2 = document.getElementById('page2');
                    if (page2) page2.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }

            this.style.display = 'none';
            if (music) {
                music.play().catch(() => console.log("Musik butuh interaksi"));
            }
        });
    }

    // --- 2. ONE TAP SCROLL ---
    document.addEventListener('pointerdown', (e) => touchStartY = e.clientY);
    document.addEventListener('pointerup', function(e) {
        if (e.target.closest('a, button, iframe, .btn-maps, #open-invitation, .message-card, form, input, textarea, select')) return;
        if (contentWrapper && contentWrapper.style.display === 'block') {
            const deltaY = touchStartY - e.clientY;
            if (Math.abs(deltaY) < 30) {
                const windowHeight = window.innerHeight;
                for (let i = 0; i < pageOrder.length; i++) {
                    const currentEl = document.getElementById(pageOrder[i]);
                    if (currentEl) {
                        const rect = currentEl.getBoundingClientRect();
                        if (rect.top <= windowHeight / 2 && rect.bottom >= windowHeight / 2) {
                            const nextEl = document.getElementById(pageOrder[i + 1]);
                            if (nextEl) {
                                nextEl.scrollIntoView({ behavior: 'smooth' });
                                return;
                            }
                        }
                    }
                }
            }
        }
    });

    // --- 3. INTERSECTION OBSERVER (DIPERBAIKI AGAR TIDAK BENTROK AOS) ---
    const globalObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // HANYA tambah class aktif jika elemen TIDAK pakai AOS
                if (!entry.target.hasAttribute('data-aos')) {
                    entry.target.classList.add('active', 'aktif', 'animate-now');
                }
                
                if (entry.target.id === 'gallery-trigger') {
                    const photos = entry.target.querySelectorAll('.masonry-item');
                    photos.forEach((photo, index) => {
                        setTimeout(() => {
                            photo.style.opacity = "1";
                            photo.classList.add('show');
                        }, index * 200);
                    });
                }
            } else {
                // Supaya bisa muncul lagi pas scroll balik (seperti mirror:true)
                if (!entry.target.hasAttribute('data-aos')) {
                    entry.target.classList.remove('active', 'aktif', 'animate-now');
                }
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('section, .animate, .reveal, .gift-card, .masonry-item').forEach(el => {
        globalObserver.observe(el);
    });

    // --- 4. COUNTDOWN ---
    const weddingDate = new Date(2026, 3, 11, 10, 0, 0).getTime();
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = weddingDate - now;
        if (distance < 0) return;
        const d = Math.floor(distance / (1000 * 60 * 60 * 24));
        const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);
        if (document.getElementById("days")) document.getElementById("days").innerText = String(d).padStart(2, '0');
        if (document.getElementById("hours")) document.getElementById("hours").innerText = String(h).padStart(2, '0');
        if (document.getElementById("minutes")) document.getElementById("minutes").innerText = String(m).padStart(2, '0');
        if (document.getElementById("seconds")) document.getElementById("seconds").innerText = String(s).padStart(2, '0');
    }
    setInterval(updateCountdown, 1000);
    updateCountdown();

    // --- 5. FIREBASE ---
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
            btnKirim.onclick = async function(e) {
                e.preventDefault();
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
                    } catch (err) { alert("Gagal kirim."); }
                    finally { btnKirim.disabled = false; btnKirim.innerText = "Kirim Pesan"; }
                } else { alert("Lengkapi data ya!"); }
            };
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

// ==========================================
// 1. إعداد الاتصال الموحد بـ Supabase
// ==========================================
function getSupabaseClient() {
    return window.supabaseClient || window.supabase || null;
}

(async function initSupabase() {
    try {
        const client = getSupabaseClient();
        if (client) {
            const { data, error } = await client.from('trips').select('*').limit(1);
            if (error) throw error;
            console.log("تم الاتصال بـ Supabase بنجاح");
        } else {
            console.warn("تنبيه: لم يتم العثور على عميل Supabase.");
        }
    } catch (e) {
        console.warn("تنبيه: تعذر الاتصال بـ Supabase، يرجى التأكد من الإعدادات.", e);
    }
})();

// ==========================================
// 2. دالة تأكيد الحجز وحفظه في Supabase
// ==========================================
async function confirmBooking() {
    const client = getSupabaseClient();
    const nameEl = document.getElementById("name");
    const phoneEl = document.getElementById("phone");
    const tripEl = document.getElementById("trip");
    const dateEl = document.getElementById("date");
    const peopleEl = document.getElementById("people");
    const notesEl = document.getElementById("notes");

    const name = nameEl ? nameEl.value.trim() : "";
    const phone = phoneEl ? phoneEl.value.trim() : "";
    const trip = tripEl ? tripEl.value : "";
    const date = dateEl ? dateEl.value.trim() : "";
    const people = peopleEl ? parseInt(peopleEl.value) || 1 : 1;
    const notes = notesEl ? notesEl.value.trim() : "";

    if (!name || !date) {
        alert("الرجاء تعبئة جميع الحقول المطلوبة (الاسم والتاريخ).");
        return;
    }

    if (!client) {
        alert("تعذر الاتصال بقاعدة البيانات. يرجى إعادة محاولة تحميل الصفحة.");
        return;
    }

    const bookingData = {
        name: name,
        phone: phone,
        trip: trip,
        date: date,
        people: people,
        notes: notes,
        status: "قيد الانتظار"
    };

    try {
        const { data, error } = await client
            .from('bookings')
            .insert([bookingData]);

        if (error) {
            console.error("خطأ أثناء إرسال الحجز:", error.message);
            alert("حدث خطأ أثناء إرسال الحجز: " + error.message);
            return;
        }

        alert("شكرًا " + name + "! تم تسجيل حجزك إلى " + trip + " بنجاح. سنتواصل معك قريبًا لتأكيد الحجز.");
        
    } catch (err) {
        console.error("خطأ عام في الشبكة:", err);
        alert("حدث خطأ أثناء الاتصال بالسيرفر.");
    }
}

function showMessage() {
    alert("شكرًا لاهتمامك! سنتواصل معك قريبًا لتأكيد الحجز.");
}

function toggleContact() {
    const contactSection = document.getElementById("contact");
    if (contactSection) {
        contactSection.classList.toggle("contact-hidden");
    }
}

function toggleGallery() {
    const gallery = document.getElementById("gallery");
    if (gallery) gallery.classList.toggle("hidden");
}

// ==========================================
// 3. نظام الترجمة وتذكر اللغة (Local Storage)
// ==========================================
const translations = {
    ar: {
        home: "الرئيسية",
        destinations: "الوجهات",
        offers: "عروضنا",
        about: "من نحن",
        contact: "اتصل بنا",
        hero_title: "اكتشف رحلات فاخرة وراقية",
        hero_desc: "عش تجارب فريدة في أجمل الوجهات حول العالم.",
        btn_book: "احجز الآن ✈️",
        btnDetails: "🔍 التفاصيل",
        btn_trips: "شاهد رحلاتنا",
        btn_trips2: "شاهد رحلاتنا",
        seatsAvailable: "المقاعد المتاحة:"
    },
    fr: {
        home: "Accueil",
        destinations: "Destinations",
        offers: "Nos Offres",
        about: "À propos",
        contact: "Contact",
        hero_title: "Découvrez des voyages prestigieux et luxueux",
        hero_desc: "Vivez des expériences uniques dans les plus belles destinations du monde.",
        btn_book: "Réserver ✈️",
        btnDetails: "🔍 Détails",
        btn_trips: "Voir nos voyages",
        btn_trips2: "Voir nos voyages",
        seatsAvailable: "Places disponibles:"
    },
    en: {
        home: "Home",
        destinations: "Destinations",
        offers: "Our Offers",
        about: "About Us",
        contact: "Contact",
        hero_title: "Discover prestigious and luxurious trips",
        hero_desc: "Live unique experiences in the most beautiful destinations around the world.",
        btn_book: "Book Now ✈️",
        btnDetails: "🔍 Details",
        btn_trips: "See our trips",
        btn_trips2: "See our trips",
        seatsAvailable: "Available seats:"
    }
};

// تشغيل وقراءة الإعدادات عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", function() {
    const savedLang = localStorage.getItem("preferred_language") || localStorage.getItem("selectedLang") || "ar";
    changeLang(savedLang);

    const langBtn = document.getElementById("langBtn");
    const langMenu = document.getElementById("langMenu");

    if (langBtn && langMenu) {
        langBtn.addEventListener("click", function(e) {
            e.stopPropagation();
            langMenu.classList.toggle("hidden");
        });

        document.addEventListener("click", function(e) {
            if (!langMenu.classList.contains("hidden") && !langMenu.contains(e.target) && e.target !== langBtn) {
                langMenu.classList.add("hidden");
            }
        });
    }

    // تحميل العروض تلقائيًا عند التحميل إذا كان الحاوي موجودًا
    if (document.getElementById('offersContainer') || document.getElementById('offers-container')) {
        loadOffers('all');
    }
    if (document.getElementById('trips-showcase')) {
        loadTripsShowcase();
    }
});

function changeLang(lang) {
    if (!translations[lang]) return;

    // دعم الخصائص data-key و data-i18n بنفس الوقت
    const elements = document.querySelectorAll("[data-key], [data-i18n]");
    elements.forEach(function(el) {
        const key = el.getAttribute("data-key") || el.getAttribute("data-i18n");
        if (translations[lang] && translations[lang][key]) {
            el.innerHTML = translations[lang][key];
        }
    });

    // ترجمة أزرار البطاقات المباشرة لضمان الترجمة الفورية
    document.querySelectorAll("button, a").forEach(function(btn) {
        const text = btn.textContent.trim();
        if (lang === "fr") {
            if (text.includes("احجز الآن")) btn.innerHTML = translations.fr.btn_book;
            if (text.includes("التفاصيل")) btn.innerHTML = translations.fr.btnDetails;
        } else if (lang === "en") {
            if (text.includes("احجز الآن")) btn.innerHTML = translations.en.btn_book;
            if (text.includes("التفاصيل")) btn.innerHTML = translations.en.btnDetails;
        } else if (lang === "ar") {
            if (text.includes("Réserver") || text.includes("Book Now")) btn.innerHTML = translations.ar.btn_book;
            if (text.includes("Détails") || text.includes("Details")) btn.innerHTML = translations.ar.btnDetails;
        }
    });

    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === "ar") ? "rtl" : "ltr";

    localStorage.setItem("preferred_language", lang);
    localStorage.setItem("selectedLang", lang);

    const langMenu = document.getElementById("langMenu");
    if (langMenu) langMenu.classList.add("hidden");
    
    const langBtn = document.getElementById("langBtn");
    if (langBtn) langBtn.textContent = lang.toUpperCase();
}

// دالة للتبديل الفوري للزر التلقائي
function toggleLanguage() {
    const currentLang = localStorage.getItem("preferred_language") || localStorage.getItem("selectedLang") || "ar";
    let nextLang = 'ar';
    if (currentLang === 'ar') nextLang = 'fr';
    else if (currentLang === 'fr') nextLang = 'en';
    else nextLang = 'ar';
    
    changeLang(nextLang);
}

// ==========================================
// 4. وظائف العروض والبطاقات
// ==========================================
function updatePrice(tripId) {
    const select = document.getElementById(`formule-${tripId}`);
    if (!select) return;
    const selectedOption = select.options[select.selectedIndex];
    const newPrice = selectedOption.getAttribute('data-price');
    
    const priceElement = document.getElementById(`price-${tripId}`);
    if (priceElement) {
        priceElement.textContent = newPrice;
    }
}

function quickBook(tripName, formuleSelectId) {
    const select = document.getElementById(formuleSelectId);
    if (!select) return;
    const selectedFormule = select.options[select.selectedIndex].text;
    
    localStorage.setItem('selected_trip', tripName);
    localStorage.setItem('selected_formule', selectedFormule);
}

function openFlightOptions() {
    const mainCards = document.getElementById('main-cards');
    const flightOptions = document.getElementById('flight-options');
    if (mainCards) mainCards.classList.add('hidden');
    if (flightOptions) flightOptions.classList.remove('hidden');
}

function toggleCard(cardElement) {
    document.querySelectorAll('.option-card').forEach(card => {
        if (card !== cardElement) {
            card.classList.remove('active-card');
        }
    });
    cardElement.classList.toggle('active-card');
}

function toggleSocialButtons() {
    const socialContainer = document.getElementById('social-links');
    if (socialContainer) socialContainer.classList.toggle('hidden');
}

window.toggleCatCard = function(card) {
    const opts = card.querySelector(".cat-options");
    if (opts) opts.classList.toggle("hidden");
};

function escapeHTML(str) {
    return String(str || '').replace(/[&<>"']/g, function(m) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[m];
    });
}

// ==========================================
// 5. جلب وعرض العروض والرحلات بمرونة مع دعم الترجمة
// ==========================================
async function loadOffers(categoryFilter = 'all') {
    const container = document.getElementById('offersContainer') || document.getElementById('offers-container');
    if (!container) return;

    const client = getSupabaseClient();

    if (!client) {
        container.innerHTML = '<p class="error-msg" style="color:#ff4d4d; text-align:center;">خطأ: تعذر الاتصال بقاعدة البيانات.</p>';
        return;
    }

    try {
        let query = client.from('trips').select('*');
        if (categoryFilter !== 'all') {
            query = query.eq('category', categoryFilter);
        }

        const { data: trips, error } = await query;

        if (error) {
            console.error("خطأ Supabase:", error);
            container.innerHTML = '<p class="error-msg" style="color:#ff4d4d; text-align:center;">خطأ: تعذر الاتصال بقاعدة البيانات.</p>';
            return;
        }

        if (!trips || trips.length === 0) {
            container.innerHTML = '<p class="loading-trips" style="text-align:center;">لا توجد عروض متاحة حالياً لهذا التصنيف.</p>';
            return;
        }

        container.innerHTML = '';
        trips.forEach(function(trip) {
            const card = document.createElement('div');
            card.className = 'offer-card';
            
            const title = escapeHTML(trip.title);
            const imageUrl = escapeHTML(trip.image_url || 'trip.png.png');
            const price = escapeHTML(trip.price || 'السعر عند الطلب');

            // تم إدراج data-key لتطبيق الترجمة التلقائية للزر
            card.innerHTML = `
                <img src="${imageUrl}" alt="${title}">
                <div class="offer-card-body">
                    <h3>${title}</h3>
                    <p class="offer-price">${price}</p>
                    <div style="display:flex; gap:8px; justify-content:center;">
                        <button class="btn-details" onclick="if(typeof openDetailsModal==='function') openDetailsModal('${trip.id}')" data-key="btnDetails">🔍 التفاصيل</button>
                        <a href="form.html?trip=${encodeURIComponent(title)}" class="glass-btn" data-key="btn_book">احجز الآن ✈️</a>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        // ✨ تطبيق الترجمة على الأزرار فوراً بعد رسمها
        const currentLang = localStorage.getItem("preferred_language") || localStorage.getItem("selectedLang") || "ar";
        changeLang(currentLang);

    } catch (e) {
        console.error("خطأ غير متوقع:", e);
        container.innerHTML = '<p class="error-msg" style="color:#ff4d4d; text-align:center;">خطأ: تعذر الاتصال بقاعدة البيانات.</p>';
    }
}

async function loadTripsShowcase() {
    const container = document.getElementById('trips-showcase');
    if (!container) return;

    const client = getSupabaseClient();

    if (!client) {
        container.innerHTML = '<p class="loading-trips">تعذر الاتصال بقاعدة البيانات حالياً.</p>';
        return;
    }

    try {
        const { data: trips, error } = await client.from('trips').select('*');

        if (error || !trips || trips.length === 0) {
            container.innerHTML = '<p class="loading-trips">لا توجد رحلات متاحة حالياً.</p>';
            return;
        }

        container.innerHTML = '';
        trips.forEach(function(trip) {
            const card = document.createElement('div');
            card.className = 'trip-showcase-card';
            
            const title = escapeHTML(trip.title);
            const imageUrl = escapeHTML(trip.image_url || 'trip.png.png');
            const price = escapeHTML(trip.price || 'السعر عند الطلب');
            const category = escapeHTML(trip.category || '');

            // تم إدراج data-key الأزرار
            card.innerHTML = `
                <img src="${imageUrl}" alt="${title}">
                <div class="trip-showcase-body">
                    <div class="trip-showcase-title">${title}</div>
                    <div class="trip-showcase-price">${price}</div>
                    <div style="display:flex; gap:8px; justify-content:center; margin-top:10px;">
                        <button class="btn-details" onclick="if(typeof openDetailsModal==='function') openDetailsModal('${trip.id}')" data-key="btnDetails">🔍 التفاصيل</button>
                        <a href="form.html?trip=${encodeURIComponent(title)}&type=${encodeURIComponent(category)}" class="trip-showcase-btn" data-key="btn_book">احجز الآن ✈️</a>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        container.dataset.loaded = "true";

        // ✨ تطبيق الترجمة على البطاقات فوراً بعد رسمها
        const currentLang = localStorage.getItem("preferred_language") || localStorage.getItem("selectedLang") || "ar";
        changeLang(currentLang);

    } catch (e) {
        console.error("خطأ أثناء تحميل الرحلات:", e);
        container.innerHTML = '<p class="loading-trips">حدث خطأ غير متوقع أثناء تحميل البيانات.</p>';
    }
}

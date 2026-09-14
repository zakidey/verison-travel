// ==========================================
// إعدادات واصلة Supabase
// ==========================================
var SUPABASE_URL = 'https://lyuoijtzygrmomugejcw.supabase.co';
var SUPABASE_ANON_KEY = 'sb_publishable_f50dyzXJ_JFrf2gq9QenGA_2ur3a18t';

// إنشاء عميل Supabase وإتاحته على مستوى النافذة العامة
(function initSupabaseConnection() {
    try {
        const supabaseLib = window.supabase || (typeof supabase !== 'undefined' ? supabase : null);

        if (supabaseLib && typeof supabaseLib.createClient === 'function') {
            window.supabaseClient = supabaseLib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log("✅ تم الاتصال بـ Supabase بنجاح");
        } else {
            console.error("❌ تعذر تحميل مكتبة Supabase من الصفحة");
        }
    } catch (err) {
        console.error("❌ حدث خطأ أثناء تهيئة Supabase:", err);
    }
})();

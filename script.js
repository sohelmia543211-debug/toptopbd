const SUPABASE_URL = 'https://mzqqkkgdggwmpegvqaol.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16cXFra2dkZ2d3bXBlZ3ZxYW9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4MDU4NDUsImV4cCI6MjEwMjM4MTg0NX0.hbUQ4dKjX2iXTF-ugi7JkV_-J5gKIpSEsPN8RpJ0EEo';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentMainCatId = "সব";  // এখানে এখন আইডি বা "সব" থাকবে
let currentSubCatId = "সব";   // এখানে সাব-ক্যাটাগরি আইডি বা "সব" থাকবে
let currentSearchKeyword = "";

let currentPage = 1;
const pageSize = 12; 
let isLoadingMore = false;
let hasMoreData = true;

let globalBanners = [];
let bannerIndex = 0;
let bannerInterval = null;

// ক্যাটাগরি ও সাব-ক্যাটাগরির সাথে আইডি যুক্ত করা হয়েছে
const hardcodedCategories = [
  {
    id: 1, // Main Category ID
    name: { bn: "ইলেক্ট্রনিক্স", en: "Electronics" },
    icon: "fa-laptop",
    subcategories: [
      { id: 1, name: { bn: "কিচেন গ্যাজেট ও অ্যাপ্লায়েন্সেস", en: "Kitchen Gadgets & Appliances" }, icon: "fa-blender" },
      { id: 2, name: { bn: "স্মার্টফোন ও গ্যাজেট", en: "Smartphones & Gadgets" }, icon: "fa-mobile-screen" },
      { id: 3, name: { bn: "হোম ইউটিলিটি ও লাইটিং", en: "Home Utility & Lighting" }, icon: "fa-lightbulb" },
      { id: 4, name: { bn: "স্মার্ট ওয়াচ ও ইয়ারফোন", en: "Smartwatches & Earphones" }, icon: "fa-headphones" }
    ]
  },
  {
    id: 2, // Main Category ID
    name: { bn: "কসমেটিক্স", en: "Cosmetics" },
    icon: "fa-wand-magic-sparkles",
    subcategories: [
      { id: 1, name: { bn: "মেকআপ ও কসমেটিক্স আইটেম", en: "Makeup & Cosmetic Items" }, icon: "fa-palette" },
      { id: 2, name: { bn: "স্কিন কেয়ার ও লোশন", en: "Skin Care & Lotions" }, icon: "fa-pump-soap" },
      { id: 3, name: { bn: "মেকআপ অর্গানাইজার ও বক্স", en: "Makeup Organizers & Boxes" }, icon: "fa-box-archive" }
    ]
  }
];

function getLang() {
    return localStorage.getItem('toptop_lang') || 'bn';
}

async function fetchBanners() {
    try {
        const { data, error } = await supabaseClient.from('banners').select('*');
        if (error) { console.error('ব্যানার লোড এরর:', error.message); return; }

        if (data && data.length > 0) {
            globalBanners = data;
            renderBannerSlider();
            startBannerInterval();
        }
    } catch (err) { console.error('ব্যানার কানেকশন এরর:', err); }
}

function renderBannerSlider() {
    const bannerContainer = document.getElementById('bannerContainer');
    if (!bannerContainer || globalBanners.length === 0) return;

    const banner = globalBanners[bannerIndex];
    
    let dotsHtml = '<div style="position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); display: flex; gap: 5px; z-index: 3;">';
    globalBanners.forEach((_, idx) => {
        const dotBg = idx === bannerIndex ? '#ff5722' : 'rgba(255,255,255,0.6)';
        dotsHtml += `<div onclick="changeBanner(${idx})" style="width: 8px; height: 8px; border-radius: 50%; background: ${dotBg}; cursor: pointer; transition: 0.3s;"></div>`;
    });
    dotsHtml += '</div>';

    bannerContainer.innerHTML = `
        <div class="banner-slider" style="background-image: url('${banner.image_url}'); position: relative; background-size: cover; background-position: center; transition: background-image 0.5s ease-in-out;">
            <div class="banner-overlay" style="background: rgba(0,0,0,0.3); width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; padding: 15px; color: white;">
                <h2 class="banner-title" style="margin: 0; font-size: 18px; font-weight: bold; text-shadow: 1px 1px 3px rgba(0,0,0,0.7);">${banner.title}</h2>
                <p class="banner-subtitle" style="margin: 5px 0 0 0; font-size: 13px; text-shadow: 1px 1px 2px rgba(0,0,0,0.7);">${banner.subtitle}</p>
            </div>
            ${dotsHtml}
        </div>
    `;
}

function startBannerInterval() {
    if (bannerInterval) clearInterval(bannerInterval);
    bannerInterval = setInterval(() => {
        if (globalBanners.length > 0) {
            bannerIndex = (bannerIndex + 1) % globalBanners.length;
            renderBannerSlider();
        }
    }, 3500);
}

function changeBanner(index) {
    bannerIndex = index;
    renderBannerSlider();
    startBannerInterval();
}

async function fetchInitialData() {
    try {
        renderFilterCards(); 
        renderMainCategories();
        renderSubCategories();
        loadProducts(false);
    } catch (err) {
        console.error('ডাটা ফেচ এরর:', err);
    }
}

function renderFilterCards() {
    const searchBarContainer = document.getElementById('searchBarContainer');
    if (!searchBarContainer) return;

    const lang = getLang();
    const placeholderText = lang === 'en' ? 'Search premium items...' : 'প্রিমিয়াম ও জনপ্রিয় পণ্য খুঁজুন...';

    searchBarContainer.innerHTML = `
        <div style="display: flex; width: 100%; align-items: center; gap: 0;">
            <input type="text" class="header-search-input" id="mainSearchInput" value="${currentSearchKeyword}" placeholder="${placeholderText}" readonly onclick="window.location.href='search.html'" style="flex: 1; border-radius: 6px 0 0 6px; height: 40px; padding: 0 12px; border: 1px solid #ddd; border-right: none; font-size: 14px; cursor: pointer;" />

            <button class="header-search-btn" onclick="window.location.href='search.html'" style="border-radius: 0 6px 6px 0; height: 40px; background: #ff5722; color: white; border: none; padding: 0 16px; cursor: pointer;">
                <i class="fa-solid fa-magnifying-glass" style="font-size: 14px;"></i>
            </button>
        </div>
    `;
}

function renderMainCategories() {
    const grid = document.getElementById('mainCategories');
    if (!grid) return;

    const lang = getLang();
    const allText = lang === 'en' ? 'All' : 'সব';
    const isAllActive = currentMainCatId === "সব" ? 'active' : '';
    
    let html = `
        <div class="cat-card ${isAllActive}" onclick="selectMainCategory('সব')">
            <div style="width: 35px; height: 35px; margin: 0 auto 3px auto; background: #ff5722; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white;">
                <i class="fa-solid fa-border-all" style="font-size: 14px;"></i>
            </div>
            <span>${allText}</span>
        </div>
    `;

    hardcodedCategories.forEach((cat) => {
        const isActive = currentMainCatId === cat.id ? 'active' : '';
        const catName = cat.name[lang] || cat.name.bn;
        html += `
            <div class="cat-card ${isActive}" onclick="selectMainCategory(${cat.id})">
                <div style="width: 35px; height: 35px; margin: 0 auto 3px auto; background: #fff5f2; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #ff5722;">
                    <i class="fa-solid ${cat.icon}" style="font-size: 14px;"></i>
                </div>
                <span>${catName}</span>
            </div>
        `;
    });
    grid.innerHTML = html;
}

function selectMainCategory(catId) {
    currentMainCatId = catId;
    currentSubCatId = "সব"; // মূল ক্যাটাগরি বদলালে সাব-ক্যাটাগরি 'সব' হয়ে যাবে
    renderMainCategories();
    renderSubCategories(); 
    currentPage = 1;
    loadProducts(false);
}

function renderSubCategories() {
    const grid = document.getElementById('subCategories');
    if (!grid) return;

    const lang = getLang();
    const allText = lang === 'en' ? 'All' : 'সব';

    let filteredSubs = [];
    if (currentMainCatId === "সব") {
        filteredSubs = hardcodedCategories.flatMap((cat) => 
            cat.subcategories.map((sub) => ({ ...sub, mainCatId: cat.id }))
        );
    } else {
        const matchedCat = hardcodedCategories.find(c => c.id === currentMainCatId);
        filteredSubs = matchedCat ? matchedCat.subcategories : [];
    }

    const allOptionActive = currentSubCatId === "সব" ? 'active' : '';
    let html = `
        <div class="sub-card ${allOptionActive}" onclick="selectSubCategory('সব')">
            <div style="width: 28px; height: 28px; margin: 0 auto 3px auto; background: #ff5722; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 11px;">
                <i class="fa-solid fa-border-all"></i>
            </div>
            <span>${allText}</span>
        </div>
    `;

    filteredSubs.forEach(sub => {
        const subName = sub.name[lang] || sub.name.bn;
        const isActive = currentSubCatId === sub.id ? 'active' : '';
        html += `
            <div class="sub-card ${isActive}" onclick="selectSubCategory(${sub.id})">
                <div style="width: 28px; height: 28px; margin: 0 auto 3px auto; background: #fff5f2; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ff5722; font-size: 11px;">
                    <i class="fa-solid ${sub.icon || 'fa-tag'}"></i>
                </div>
                <span>${subName}</span>
            </div>
        `;
    });

    grid.innerHTML = html;
}

function selectSubCategory(subId) {
    currentSubCatId = subId;
    renderSubCategories();
    currentPage = 1;
    loadProducts(false);
}

async function loadProducts(isAppend = false) {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    if (isLoadingMore) return;
    isLoadingMore = true;

    const lang = getLang();
    const noProductText = lang === 'en' ? 'No items found.' : 'কোনো পণ্য পাওয়া যায়নি।';

    if (!isAppend) {
        let shimmerHtml = '';
        for (let i = 0; i < 4; i++) {
            shimmerHtml += `
                <div class="shimmer-card">
                    <div class="shimmer-img"></div>
                    <div class="shimmer-info">
                        <div class="shimmer-line"></div>
                        <div class="shimmer-line short"></div>
                    </div>
                </div>
            `;
        }
        grid.innerHTML = shimmerHtml;
    }

    // Supabase কুয়েরি সরাসরি আইডি (ID) দিয়ে ফিল্টার করবে
    let query = supabaseClient.from('products').select('*');

    if (currentMainCatId !== "সব") {
        query = query.eq('MainCategory_id', currentMainCatId);
    }

    if (currentSubCatId !== "সব") {
        query = query.eq('subcategory_id', currentSubCatId);
    }

    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error } = await query;

    isLoadingMore = false;

    if (error) {
        console.error('প্রোডাক্ট লোড করতে সমস্যা হয়েছে:', error);
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; color:red; padding:20px;">ফিল্টারিংয়ে ত্রুটি হয়েছে: ${error.message}</div>`;
        return;
    }

    if (!isAppend) {
        grid.innerHTML = "";
    }

    if (!data || data.length === 0) {
        hasMoreData = false;
        if (!isAppend) {
            grid.innerHTML = `<div class="no-product" style="grid-column: 1/-1; text-align:center; padding:30px;"><i class="fa-solid fa-box-open" style="font-size: 28px; margin-bottom: 8px; display:block; color:#ff5722;"></i>${noProductText}</div>`;
        }
        return;
    }

    hasMoreData = true;
    let productHtml = isAppend ? grid.innerHTML : "";
    
    data.forEach(p => {
        // WhatsApp বাটনটি সম্পূর্ণ বাদ দেওয়া হয়েছে এবং কার্ডে ক্লিক করলেই ডিটেইলস পেজে যাবে
        productHtml += `
            <div class="product-card" onclick="window.location.href='product_details.html?id=${p.id}'" style="cursor: pointer; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <div class="product-img-box">
                        ${p.image_url ? `<img src="${p.image_url}">` : `<i class="fa-solid fa-image" style="font-size: 22px;"></i>`}
                    </div>
                    <div class="product-info">
                        <h3>${p.name}</h3>
                        <div class="price">৳ ${p.price}</div>
                        ${p.short_description ? `<p style="font-size: 12px; color: #666; margin-top: 6px; margin-bottom: 0; line-height: 1.3;">${p.short_description}</p>` : ''}
                    </div>
                </div>
            </div>
        `;
    });
    grid.innerHTML = productHtml;
}

window.addEventListener('scroll', () => {
    if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 150) {
        if (!isLoadingMore && hasMoreData) {
            currentPage++;
            loadProducts(true);
        }
    }
});

window.onload = () => {
    if (typeof applyLanguage === 'function') {
        applyLanguage();
    }
    fetchBanners();
    fetchInitialData();
};
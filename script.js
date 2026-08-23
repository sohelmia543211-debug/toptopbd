const SUPABASE_URL = 'https://mzqqkkgdggwmpegvqaol.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16cXFra2dkZ2d3bXBlZ3ZxYW9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4MDU4NDUsImV4cCI6MjEwMjM4MTg0NX0.hbUQ4dKjX2iXTF-ugi7JkV_-J5gKIpSEsPN8RpJ0EEo';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentMainCategory = "সব"; 
let currentSubCategory = "সব";
let currentProductType = "used_product"; 
let currentDistrict = "সব"; 
let currentThana = "সব";
let currentUnion = "সব";
let currentSearchKeyword = "";

let globalProducts = [];
let globalLocations = [];

const hardcodedCategories = [
  {
    id: "mobiles",
    name: { bn: "মোবাইল ও ট্যাব", en: "Mobiles & Tablets" },
    icon: "fa-mobile-screen-button",
    subcategories: [
      { name: { bn: "স্মার্টফোন", en: "Smartphones" }, icon: "fa-mobile" },
      { name: { bn: "ফিচার ফোন", en: "Feature Phones" }, icon: "fa-phone-flip" },
      { name: { bn: "ট্যাব ও আইপ্যাড", en: "Tablets & iPads" }, icon: "fa-tablet-screen-button" },
      { name: { bn: "মোবাইল এক্সেসরিজ", en: "Mobile Accessories" }, icon: "fa-headphones" },
      { name: { bn: "পাওয়ার ব্যাংক", en: "Power Banks" }, icon: "fa-battery-full" },
      { name: { bn: "স্মার্টওয়াচ", en: "Smartwatches" }, icon: "fa-clock" }
    ]
  },
  {
    id: "electronics",
    name: { bn: "ইলেকট্রনিক্স", en: "Electronics" },
    icon: "fa-laptop",
    subcategories: [
      { name: { bn: "ল্যাপটপ ও কম্পিউটার", en: "Laptops & Computers" }, icon: "fa-computer" },
      { name: { bn: "টিভি ও সাউন্ড সিস্টেম", en: "TV & Sound Systems" }, icon: "fa-tv" },
      { name: { bn: "এসি ও ফ্রিজ", en: "AC & Refrigerators" }, icon: "fa-snowflake" },
      { name: { bn: "হোম অ্যাপ্লায়েন্সেস", en: "Home Appliances" }, icon: "fa-blender" },
      { name: { bn: "ক্যামেরা ও ড্রোন", en: "Cameras & Drones" }, icon: "fa-camera" },
      { name: { bn: "রাউটার ও নেটওয়ার্কিং", en: "Routers & Networking" }, icon: "fa-wifi" }
    ]
  },
  {
    id: "vehicles",
    name: { bn: "যানবাহন", en: "Vehicles" },
    icon: "fa-motorcycle",
    subcategories: [
      { name: { bn: "মোটরসাইকেল", en: "Motorcycles" }, icon: "fa-motorcycle" },
      { name: { bn: "বাইসাইকেল", en: "Bicycles" }, icon: "fa-person-biking" },
      { name: { bn: "প্রাইভেট কার", en: "Private Cars" }, icon: "fa-car" }
    ]
  },
  {
    id: "property",
    name: { bn: "প্রপার্টি", en: "Property" },
    icon: "fa-building",
    subcategories: [
      { name: { bn: "বাসা/ফ্লাট ভাড়া", en: "House/Flat Rent" }, icon: "fa-house-chimney" },
      { name: { bn: "জমি বা প্লট বিক্রি", en: "Land/Plot Sale" }, icon: "fa-map" },
      { name: { bn: "সাবলেট রুম", en: "Sublet Rooms" }, icon: "fa-door-open" }
    ]
  },
  {
    id: "fashion",
    name: { bn: "ফ্যাশন", en: "Fashion" },
    icon: "fa-shirt",
    subcategories: [
      { name: { bn: "পুরুষদের পোশাক", en: "Men's Clothing" }, icon: "fa-user-tie" },
      { name: { bn: "নারীদের পোশাক", en: "Women's Clothing" }, icon: "fa-person-dress" }
    ]
  },
  {
    id: "home_living",
    name: { bn: "হোম ও লিভিং", en: "Home & Living" },
    icon: "fa-couch",
    subcategories: [
      { name: { bn: "ঘরের আসবাবপত্র", en: "Home Furniture" }, icon: "fa-bed" }
    ]
  },
  {
    id: "pets",
    name: { bn: "পোষা প্রাণী", en: "Pets & Animals" },
    icon: "fa-dog",
    subcategories: [
      { name: { bn: "বিড়াল ও কুকুর", en: "Cats & Dogs" }, icon: "fa-paw" }
    ]
  },
  {
    id: "books_sports",
    name: { bn: "বই ও শখ", en: "Books & Hobbies" },
    icon: "fa-book",
    subcategories: [
      { name: { bn: "একাডেমিক বই", en: "Academic Books" }, icon: "fa-book-open" }
    ]
  },
  {
    id: "agriculture",
    name: { bn: "কৃষি ও বাগান", en: "Agriculture & Garden" },
    icon: "fa-seedling",
    subcategories: [
      { name: { bn: "বীজ ও সার", en: "Seeds & Fertilizers" }, icon: "fa-plant-wilt" }
    ]
  },
  {
    id: "jobs",
    name: { bn: "চাকরি", en: "Jobs" },
    icon: "fa-briefcase",
    subcategories: [
      { name: { bn: "ফুলটাইম জব", en: "Full-Time Jobs" }, icon: "fa-id-badge" }
    ]
  },
  {
    id: "services",
    name: { bn: "সার্ভিস", en: "Services" },
    icon: "fa-tools",
    subcategories: [
      { name: { bn: "আইটি ও গ্রাফিক্স ডিজাইন", en: "IT & Graphics Design" }, icon: "fa-pen-nib" }
    ]
  },
  {
    id: "others",
    name: { bn: "অন্যান্য", en: "Others" },
    icon: "fa-box",
    subcategories: [
      { name: { bn: "অন্যান্য আইটেম", en: "Miscellaneous Items" }, icon: "fa-box-open" }
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
            const banner = data[0]; 
            const bannerContainer = document.getElementById('bannerContainer');
            if(bannerContainer) {
                bannerContainer.innerHTML = `
                    <div class="banner-slider" style="background-image: url('${banner.image_url}');">
                        <div class="banner-overlay">
                            <h2 class="banner-title">${banner.title}</h2>
                            <p class="banner-subtitle">${banner.subtitle}</p>
                        </div>
                    </div>
                `;
            }
        }
    } catch (err) { console.error('ব্যানার কানেকশন এরর:', err); }
}

async function fetchInitialData() {
    try {
        renderSearchBarAboveBanner(); 
        renderMainCategories();
        renderSubCategories();

        const { data: locData, error: locError } = await supabaseClient.from('locations').select('*');
        if (!locError && locData) {
            globalLocations = locData;
        }
        renderFilterCards(); 

        const { data, error } = await supabaseClient.from('products').select('*');
        if (!error && data) {
            globalProducts = data;
        }
        renderProducts();
    } catch (err) {
        console.error('ডাটা ফেচ এরর:', err);
    }
}

// ব্যানার উপরে বড় ও সুন্দর সার্চ বার
function renderSearchBarAboveBanner() {
    const topSearchContainer = document.getElementById('topSearchContainer');
    if (!topSearchContainer) return;

    const lang = getLang();
    const placeholderText = lang === 'en' ? 'Search your products, brands...' : 'আপনার পছন্দের পণ্য বা ব্র্যান্ড খুঁজুন...';

    topSearchContainer.innerHTML = `
        <div style="width: 100%; max-width: 950px; margin: 12px auto; padding: 0 12px;">
            <div style="display: flex; align-items: center; background: #fff; border: 2px solid #ff5722; border-radius: 35px; padding: 12px 20px; box-shadow: 0 4px 15px rgba(255,87,34,0.18);">
                <i class="fa-solid fa-magnifying-glass" style="color: #ff5722; font-size: 20px; margin-right: 12px;"></i>
                <input type="text" id="mainSearchInput" value="${currentSearchKeyword}" placeholder="${placeholderText}" oninput="handleSearchInput(this.value)" style="border: none; outline: none; width: 100%; font-size: 15px; background: transparent; color: #333;" />
                ${currentSearchKeyword ? `<button onclick="clearSearchInput()" style="background: none; border: none; color: #ff5722; cursor: pointer; font-size: 16px;"><i class="fa-solid fa-xmark"></i></button>` : ''}
            </div>
        </div>
    `;
}

function handleSearchInput(val) {
    currentSearchKeyword = val;
    renderProducts();
}

function clearSearchInput() {
    currentSearchKeyword = "";
    const input = document.getElementById('mainSearchInput');
    if(input) input.value = "";
    renderProducts();
}

// ব্যানার নিচে দুটি ড্রপডাউন এবং রিসেট বাটন
function renderFilterCards() {
    const searchBarContainer = document.getElementById('searchBarContainer');
    if (!searchBarContainer) return;

    const lang = getLang();
    const usedText = lang === 'en' ? 'Used Products' : 'পুরাতন পণ্য';
    const newText = lang === 'en' ? 'New Products' : 'নতুন পণ্য';
    const propText = lang === 'en' ? 'Property' : 'প্রপার্টি';

    const allDistText = lang === 'en' ? 'All Districts (সব জেলা)' : 'সব জেলা (সকল এলাকা)';
    const districts = [...new Set(globalLocations.map(item => item.district))].filter(Boolean);

    let locationLabel = allDistText;
    if (currentDistrict !== "সব" && currentThana === "সব") {
        locationLabel = `📍 জেলা: ${currentDistrict}`;
    } else if (currentThana !== "সব" && currentUnion === "সব") {
        locationLabel = `📍 থানা: ${currentThana}`;
    } else if (currentUnion !== "সব") {
        locationLabel = `📍 ইউনিয়ন: ${currentUnion}`;
    }

    searchBarContainer.innerHTML = `
        <div style="width: 100%; max-width: 950px; margin: 10px auto; background: #fff; border: 1px solid #e0e0e0; border-radius: 12px; padding: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.04); display: flex; align-items: center; gap: 8px; position: relative;">
            
            <!-- ড্রপডাউন ১: পণ্য বা প্রপার্টি ফিল্টার -->
            <div style="flex: 1; background: #fff3ed; border: 1px solid #ffd8cc; border-radius: 8px; padding: 8px 12px; display: flex; align-items: center; gap: 8px;">
                <i class="fa-solid fa-filter" style="color: #ff5722; font-size: 13px;"></i>
                <select id="productTypeSelect" onchange="handleProductTypeChange(this.value)" style="border: none; font-size: 13px; font-weight: 600; color: #ff5722; background: transparent; outline: none; width: 100%; cursor: pointer;">
                    <option value="used_product" ${currentProductType === 'used_product' ? 'selected' : ''}>📦 ${usedText}</option>
                    <option value="new_product" ${currentProductType === 'new_product' ? 'selected' : ''}>✨ ${newText}</option>
                    <option value="property" ${currentProductType === 'property' ? 'selected' : ''}>🏢 ${propText}</option>
                </select>
            </div>

            <!-- ড্রপডাউন ২: ডাইনামিক লোকেশন ড্রপডাউন (স্টেপ-বাই-স্টেপ ফিল্টার) -->
            <div style="flex: 1; background: #eef4ff; border: 1px solid #d0e1fd; border-radius: 8px; padding: 8px 12px; display: flex; align-items: center; gap: 8px;">
                <i class="fa-solid fa-location-dot" style="color: #0066cc; font-size: 13px;"></i>
                <select id="singleLocationSelect" onchange="handleLocationSelection(this.value)" style="border: none; font-size: 13px; font-weight: 600; color: #0066cc; background: transparent; outline: none; width: 100%; cursor: pointer;">
                    <option value="ALL">${locationLabel}</option>
                    ${renderDynamicLocationOptions(districts)}
                </select>
            </div>

            <!-- রিসেট বাটন -->
            <button onclick="resetAllFilters()" title="Reset Filters" style="background: #fff5f2; border: 1px solid #ff5722; color: #ff5722; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0;">
                <i class="fa-solid fa-rotate-right"></i>
            </button>

        </div>
    `;
}

// আপনার চাহিদা অনুযায়ী স্টেপ-বাই-স্টেপ লোকেশন দেখানোর লজিক
function renderDynamicLocationOptions(districts) {
    let html = "";

    // যদি জেলা সিলেক্ট করা না থাকে, তবে শুধু জেলাগুলো দেখাবে
    if (currentDistrict === "সব") {
        html += `<optgroup label="--- জেলাসমূহ ---">`;
        districts.forEach(d => {
            html += `<option value="DIST_${d}">${d}</option>`;
        });
        html += `</optgroup>`;
    } 
    // যদি জেলা সিলেক্ট করা থাকে কিন্তু থানা সিলেক্ট করা না থাকে, তবে শুধু সেই জেলার থানাসমূহ দেখাবে (জেলা দেখাবে না)
    else if (currentThana === "সব") {
        const thanas = [...new Set(globalLocations.filter(item => item.district === currentDistrict).map(item => item.thana))].filter(Boolean);
        html += `<optgroup label="--- ${currentDistrict} জেলার থানাসমূহ ---">`;
        thanas.forEach(t => {
            html += `<option value="THANA_${t}">👉 ${t}</option>`;
        });
        html += `</optgroup>`;
    } 
    // যদি থানা সিলেক্ট করা থাকে, তবে শুধু সেই থানার ইউনিয়নসমূহ দেখাবে
    else {
        const unions = [...new Set(globalLocations.filter(item => item.district === currentDistrict && item.thana === currentThana).map(item => item.union_name || item.union))].filter(Boolean);
        html += `<optgroup label="--- ${currentThana} থানার ইউনিয়নসমূহ ---">`;
        unions.forEach(u => {
            html += `<option value="UNION_${u}">⭐ ${u}</option>`;
        });
        html += `</optgroup>`;
    }

    return html;
}

function handleLocationSelection(val) {
    if (val === "ALL") {
        // ড্রপডাউন থেকে রিসেট বা ডিফল্ট সিলেক্ট করলে এক ধাপ পেছনে যাবে বা রিসেট হবে
        if (currentUnion !== "সব") {
            currentUnion = "সব";
        } else if (currentThana !== "সব") {
            currentThana = "সব";
        } else {
            currentDistrict = "সব";
        }
    } else if (val.startsWith("DIST_")) {
        currentDistrict = val.replace("DIST_", "");
        currentThana = "সব";
        currentUnion = "সব";
    } else if (val.startsWith("THANA_")) {
        currentThana = val.replace("THANA_", "");
        currentUnion = "সব";
    } else if (val.startsWith("UNION_")) {
        currentUnion = val.replace("UNION_", "");
    }
    renderFilterCards();
    renderProducts();
}

function handleProductTypeChange(val) {
    currentProductType = val;
    renderProducts();
}

function resetAllFilters() {
    currentDistrict = "সব";
    currentThana = "সব";
    currentUnion = "সব";
    currentMainCategory = "সব";
    currentSubCategory = "সব";
    currentProductType = "used_product";
    currentSearchKeyword = "";
    
    const input = document.getElementById('mainSearchInput');
    if(input) input.value = "";

    renderMainCategories();
    renderSubCategories();
    renderFilterCards();
    renderProducts();
}

function renderMainCategories() {
    const grid = document.getElementById('mainCategories');
    if (!grid) return;

    const lang = getLang();
    const allText = lang === 'en' ? 'All' : 'সব';
    const isAllActive = currentMainCategory === "সব" ? 'active' : '';
    
    let html = `
        <div class="cat-card ${isAllActive}" onclick="selectMainCategory('সব')">
            <div style="width: 35px; height: 35px; margin: 0 auto 3px auto; background: #ff5722; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white;">
                <i class="fa-solid fa-border-all" style="font-size: 14px;"></i>
            </div>
            <span>${allText}</span>
        </div>
    `;

    hardcodedCategories.forEach(cat => {
        const isActive = (currentMainCategory !== "সব" && currentMainCategory.id === cat.id) ? 'active' : '';
        const catName = cat.name[lang] || cat.name.bn;
        html += `
            <div class="cat-card ${isActive}" onclick="selectMainCategory('${cat.id}')">
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
    if (catId === 'সব') {
        currentMainCategory = "সব";
    } else {
        currentMainCategory = hardcodedCategories.find(c => c.id === catId) || "সব";
    }
    currentSubCategory = "সব"; 
    renderMainCategories();
    renderSubCategories(); 
    renderProducts();
}

function renderSubCategories() {
    const grid = document.getElementById('subCategories');
    if (!grid) return;

    const lang = getLang();
    const allText = lang === 'en' ? 'All' : 'সব';

    let filteredSubs = [];
    if (currentMainCategory === "সব") {
        filteredSubs = hardcodedCategories.flatMap(cat => cat.subcategories);
    } else {
        filteredSubs = currentMainCategory.subcategories || [];
    }

    const allOptionActive = currentSubCategory === "সব" ? 'active' : '';
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
        const isActive = subName === currentSubCategory ? 'active' : '';
        html += `
            <div class="sub-card ${isActive}" onclick="selectSubCategory('${subName}')">
                <div style="width: 28px; height: 28px; margin: 0 auto 3px auto; background: #fff5f2; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ff5722; font-size: 11px;">
                    <i class="fa-solid ${sub.icon || 'fa-tag'}"></i>
                </div>
                <span>${subName}</span>
            </div>
        `;
    });

    grid.innerHTML = html;
}

function selectSubCategory(subName) {
    currentSubCategory = subName;
    renderSubCategories();
    renderProducts();
}

function renderProducts() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    const lang = getLang();
    const noProductText = lang === 'en' ? 'No products found.' : 'কোনো পণ্য পাওয়া যায়নি।';

    let filteredProducts = globalProducts.filter(p => {
        let matchesType = true;
        if (currentProductType === 'property') {
            matchesType = (p.category === 'প্রপার্টি' || p.category_id === 'property' || p.main_category_id === 'property');
        } else if (p.product_type && currentProductType) {
            matchesType = (p.product_type === currentProductType);
        }

        let matchesMain = true;
        if (currentMainCategory !== "সব") {
            const mBn = currentMainCategory.name.bn;
            const mEn = currentMainCategory.name.en;
            const mId = currentMainCategory.id;
            matchesMain = (p.category === mBn || p.category === mEn || p.main_category_id === mId || p.category_id === mId);
        }

        let matchesSub = true;
        if (currentSubCategory !== "সব") {
            matchesSub = (p.sub_category === currentSubCategory || p.category === currentSubCategory || p.subcategory === currentSubCategory);
        }

        let matchesDistrict = (currentDistrict === "সব" || p.district === currentDistrict);
        let matchesThana = (currentThana === "সব" || p.thana === currentThana);
        let matchesUnion = (currentUnion === "সব" || p.union_name === currentUnion || p.union === currentUnion);

        let matchesSearch = true;
        if (currentSearchKeyword.trim() !== "") {
            const keyword = currentSearchKeyword.toLowerCase();
            const nameMatch = p.name ? p.name.toLowerCase().includes(keyword) : false;
            const descMatch = p.short_description ? p.short_description.toLowerCase().includes(keyword) : false;
            matchesSearch = nameMatch || descMatch;
        }

        return matchesType && matchesMain && matchesSub && matchesDistrict && matchesThana && matchesUnion && matchesSearch;
    });

    if (filteredProducts.length === 0) {
        grid.innerHTML = `<div class="no-product" style="grid-column: 1/-1; text-align:center; padding:30px;"><i class="fa-solid fa-box-open" style="font-size: 28px; margin-bottom: 8px; display:block; color:#ff5722;"></i>${noProductText}</div>`;
        return;
    }

    let productHtml = "";
    filteredProducts.forEach(p => {
        productHtml += `
            <div class="product-card" onclick="window.location.href='product_details.html?id=${p.id}'" style="cursor: pointer;">
                <div class="product-img-box">
                    ${p.image_url ? `<img src="${p.image_url}">` : `<i class="fa-solid fa-image" style="font-size: 22px;"></i>`}
                </div>
                <div class="product-info">
                    <h3>${p.name}</h3>
                    <div class="price">৳ ${p.price}</div>
                    ${p.short_description ? `<p style="font-size: 12px; color: #666; margin-top: 6px; margin-bottom: 0; line-height: 1.3;">${p.short_description}</p>` : ''}
                </div>
            </div>
        `;
    });
    grid.innerHTML = productHtml;
}

window.onload = () => {
    if (typeof applyLanguage === 'function') {
        applyLanguage();
    }
    fetchBanners();
    fetchInitialData();
}
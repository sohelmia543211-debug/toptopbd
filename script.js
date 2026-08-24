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
let globalBanners = [];
let bannerIndex = 0;
let bannerInterval = null;

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
      { name: { bn: "রাউটার ও নেটওয়ার্কিং", en: "Routers & Networking" }, icon: "fa-wifi" },
      { name: { bn: "প্রিন্টার ও স্ক্যানার", en: "Printers & Scanners" }, icon: "fa-print" },
      { name: { bn: "মাইক্রোওয়েভ ও ওভেন", en: "Microwave & Ovens" }, icon: "fa-fire-burner" },
      { name: { bn: "আইপিএস ও জেনারেটর", en: "IPS & Generators" }, icon: "fa-bolt" },
      { name: { bn: "স্টাবিলাইজার ও ইউপিএস", en: "Stabilizers & UPS" }, icon: "fa-shield-halved" }
    ]
  },
  {
    id: "vehicles",
    name: { bn: "যানবাহন", en: "Vehicles" },
    icon: "fa-motorcycle",
    subcategories: [
      { name: { bn: "মোটরসাইকেল", en: "Motorcycles" }, icon: "fa-motorcycle" },
      { name: { bn: "বাইসাইকেল", en: "Bicycles" }, icon: "fa-person-biking" },
      { name: { bn: "প্রাইভেট কার", en: "Private Cars" }, icon: "fa-car" },
      { name: { bn: "ইলেকট্রিক বাইক ও স্কুটার", en: "Electric Bikes & Scooters" }, icon: "fa-bolt" },
      { name: { bn: "বাস ও ট্রাক", en: "Buses & Trucks" }, icon: "fa-truck" },
      { name: { bn: "অন্যান্য যান ও পার্টস", en: "Other Vehicles & Parts" }, icon: "fa-gears" }
    ]
  },
  {
    id: "property",
    name: { bn: "প্রপার্টি", en: "Property" },
    icon: "fa-building",
    subcategories: [
      { name: { bn: "বাসা/ফ্লাট ভাড়া", en: "House/Flat Rent" }, icon: "fa-house-chimney" },
      { name: { bn: "জমি বা প্লট বিক্রি", en: "Land/Plot Sale" }, icon: "fa-map" },
      { name: { bn: "সাবলেট রুম", en: "Sublet Rooms" }, icon: "fa-door-open" },
      { name: { bn: "দোকান বা অফিস স্পেস", en: "Shop or Office Space" }, icon: "fa-shop" },
      { name: { bn: "মেস সিট ভাড়া", en: "Mess Seat Rent" }, icon: "fa-bed" }
    ]
  },
  {
    id: "fashion",
    name: { bn: "ফ্যাশন", en: "Fashion" },
    icon: "fa-shirt",
    subcategories: [
      { name: { bn: "পুরুষদের পোশাক", en: "Men's Clothing" }, icon: "fa-user-tie" },
      { name: { bn: "নারীদের পোশাক", en: "Women's Clothing" }, icon: "fa-person-dress" },
      { name: { bn: "ছেলেদের জুতো", en: "Men's Shoes" }, icon: "fa-shoe-prints" },
      { name: { bn: "মেয়েদের জুতো", en: "Women's Shoes" }, icon: "fa-shoe-prints" },
      { name: { bn: "ব্যাগ ও লাগেজ", en: "Bags & Luggage" }, icon: "fa-bag-shopping" },
      { name: { bn: "পাঞ্জাবি ও শেরওয়ანი", en: "Panjabi & Sherwani" }, icon: "fa-shirt" },
      { name: { bn: "শাড়ি ও থ্রিপিস", en: "Saree & Three-Piece" }, icon: "fa-vest" },
      { name: { bn: "বাচ্চাদের পোশাক", en: "Kids' Clothing" }, icon: "fa-child" },
      { name: { bn: "ঘড়ি ও সানগ্লাস", en: "Watches & Sunglasses" }, icon: "fa-glasses" },
      { name: { bn: "কসমেটিক্স ও মেকআপ", en: "Cosmetics & Makeup" }, icon: "fa-wand-magic-sparkles" }
    ]
  },
  {
    id: "home_living",
    name: { bn: "হোম ও লিভিং", en: "Home & Living" },
    icon: "fa-couch",
    subcategories: [
      { name: { bn: "ঘরের আসবাবপত্র", en: "Home Furniture" }, icon: "fa-bed" },
      { name: { bn: "হোম ডেকোর বা শোপিস", en: "Home Decor & Showpieces" }, icon: "fa-image" },
      { name: { bn: "কিচেন ও ডাইনিং", en: "Kitchen & Dining" }, icon: "fa-utensils" },
      { name: { bn: "লাইটিং ও ফ্যান", en: "Lighting & Fans" }, icon: "fa-lightbulb" },
      { name: { bn: "বেডিং ও কার্পেট", en: "Bedding & Carpets" }, icon: "fa-mattress-pillow" }
    ]
  },
  {
    id: "pets",
    name: { bn: "পোষা প্রাণী", en: "Pets & Animals" },
    icon: "fa-dog",
    subcategories: [
      { name: { bn: "বিড়াল ও কুকুর", en: "Cats & Dogs" }, icon: "fa-paw" },
      { name: { bn: "পাখি ও মাছ", en: "Birds & Fish" }, icon: "fa-dove" },
      { name: { bn: "গবাদিপশু", en: "Livestock" }, icon: "fa-cow" },
      { name: { bn: "পেট ফুড ও কেয়ার", en: "Pet Food & Care" }, icon: "fa-bone" }
    ]
  },
  {
    id: "books_sports",
    name: { bn: "বই ও শখ", en: "Books & Hobbies" },
    icon: "fa-book",
    subcategories: [
      { name: { bn: "একাডেমিক বই", en: "Academic Books" }, icon: "fa-book-open" },
      { name: { bn: "উপন্যাস ও ইসলামিক বই", en: "Novels & Islamic Books" }, icon: "fa-book" },
      { name: { bn: "জিম ও স্পোর্টস আইটেম", en: "Gym & Sports Items" }, icon: "fa-dumbbell" },
      { name: { bn: "মিউজিক্যাল ইন্সট্রুমেন্ট", en: "Musical Instruments" }, icon: "fa-guitar" },
      { name: { bn: "খেলনা ও ভিডিও গেমস", en: "Toys & Video Games" }, icon: "fa-gamepad" }
    ]
  },
  {
    id: "agriculture",
    name: { bn: "কৃষি ও বাগান", en: "Agriculture & Garden" },
    icon: "fa-seedling",
    subcategories: [
      { name: { bn: "বীজ ও সার", en: "Seeds & Fertilizers" }, icon: "fa-plant-wilt" },
      { name: { bn: "কৃষিকাজের যন্ত্রপাতি", en: "Agricultural Machinery" }, icon: "fa-tractor" },
      { name: { bn: "গাছের চারা ও টব", en: "Saplings & Pots" }, icon: "fa-tree" },
      { name: { bn: "সেচ সরঞ্জাম", en: "Irrigation Equipment" }, icon: "fa-faucet-drip" },
      { name: { bn: "গবাদিপশুর খাদ্য", en: "Animal Feed" }, icon: "fa-wheat-awn" }
    ]
  },
  {
    id: "jobs",
    name: { bn: "চাকরি", en: "Jobs" },
    icon: "fa-briefcase",
    subcategories: [
      { name: { bn: "ফুলটাইম জব", en: "Full-Time Jobs" }, icon: "fa-id-badge" },
      { name: { bn: "পার্টটাইম ও রিমোট জব", en: "Part-Time & Remote Jobs" }, icon: "fa-laptop-file" },
      { name: { bn: "ইন্টার্নশিপ", en: "Internships" }, icon: "fa-graduation-cap" },
      { name: { bn: "কাজের লোক বা সার্ভিস", en: "Workers or Services" }, icon: "fa-user-gear" }
    ]
  },
  {
    id: "services",
    name: { bn: "সার্ভিস", en: "Services" },
    icon: "fa-tools",
    subcategories: [
      { name: { bn: "আইটি ও গ্রাফিক্স ডিজাইন", en: "IT & Graphics Design" }, icon: "fa-pen-nib" },
      { name: { bn: "ইলেকট্রিক ও প্লাম্বিং", en: "Electric & Plumbing" }, icon: "fa-screwdriver-wrench" },
      { name: { bn: "ইভেন্ট ম্যানেজমেন্ট", en: "Event Management" }, icon: "fa-calendar-days" },
      { name: { bn: "টিউশন বা কোচিং", en: "Tuition or Coaching" }, icon: "fa-chalkboard-user" }
    ]
  },
  {
    id: "others",
    name: { bn: "অন্যান্য", en: "Others" },
    icon: "fa-box",
    subcategories: [
      { name: { bn: "মিসেলেনিয়াস বা অন্যান্য আইটেম", en: "Miscellaneous Items" }, icon: "fa-box-open" }
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

function renderFilterCards() {
    const searchBarContainer = document.getElementById('searchBarContainer');
    if (!searchBarContainer) return;

    searchBarContainer.style.paddingLeft = '4px';
    searchBarContainer.style.paddingRight = '4px';
    searchBarContainer.style.marginLeft = '0px';
    searchBarContainer.style.marginRight = '0px';

    const lang = getLang();
    const placeholderText = lang === 'en' ? 'Search...' : 'পণ্য খুঁজুন...';
    const allDistText = lang === 'en' ? 'All Districts' : 'সব জেলা';
    const districts = [...new Set(globalLocations.map(item => item.district))].filter(Boolean);

    let locationLabel = allDistText;
    if (currentDistrict !== "সব" && currentThana === "সব") {
        locationLabel = currentDistrict;
    } else if (currentThana !== "সব" && currentUnion === "সব") {
        locationLabel = currentThana;
    } else if (currentUnion !== "সব") {
        locationLabel = currentUnion;
    }

    searchBarContainer.innerHTML = `
        <div style="display: flex; width: 100%; align-items: center; gap: 0;">
            <select class="header-location-select" id="singleLocationSelect" onchange="handleLocationSelection(this.value)" style="background: #ff5722; color: #ffffff; border: none; border-radius: 6px 0 0 6px; padding: 0 8px; font-weight: 500; height: 40px; cursor: pointer; max-width: 115px; text-overflow: ellipsis; font-size: 13px;">
                <option value="ALL" style="background: #ffffff; color: #333;">${locationLabel}</option>
                ${renderDynamicLocationOptions(districts)}
            </select>

            <button class="header-reset-btn" onclick="resetAllFilters()" title="Reset Filters" style="background: #e65100; color: #ffffff; border: none; border-radius: 0; padding: 0 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; height: 40px; border-left: 1px solid rgba(255,255,255,0.2);">
                <i class="fa-solid fa-rotate-right" style="font-size: 12px;"></i>
            </button>

            <!-- এখানে সার্চ বারে ক্লিক করলেই search.html পেজে রিডাইরেক্ট হবে -->
            <input type="text" class="header-search-input" id="mainSearchInput" value="${currentSearchKeyword}" placeholder="${placeholderText}" readonly onclick="window.location.href='search.html'" style="flex: 1; border-radius: 0; height: 40px; padding: 0 10px; border: 1px solid #ddd; border-left: none; border-right: none; font-size: 14px; cursor: pointer;" />

            <button class="header-search-btn" onclick="window.location.href='search.html'" style="border-radius: 0 6px 6px 0; height: 40px; background: #ff5722; color: white; border: none; padding: 0 12px; cursor: pointer;">
                <i class="fa-solid fa-magnifying-glass" style="font-size: 14px;"></i>
            </button>
        </div>
    `;
}

function renderDynamicLocationOptions(districts) {
    let html = "";
    if (currentDistrict === "সব") {
        districts.forEach(d => {
            html += `<option value="DIST_${d}" style="background: #ffffff; color: #333;">${d}</option>`;
        });
    } else if (currentThana === "সব") {
        const thanas = [...new Set(globalLocations.filter(item => item.district === currentDistrict).map(item => item.thana))].filter(Boolean);
        thanas.forEach(t => {
            html += `<option value="THANA_${t}" style="background: #ffffff; color: #333;">👉 ${t}</option>`;
        });
    } else {
        const unions = [...new Set(globalLocations.filter(item => item.district === currentDistrict && item.thana === currentThana).map(item => item.union_name || item.union))].filter(Boolean);
        unions.forEach(u => {
            html += `<option value="UNION_${u}" style="background: #ffffff; color: #333;">⭐ ${u}</option>`;
        });
    }
    return html;
}

function handleLocationSelection(val) {
    if (val === "ALL") {
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
    
    const tabUsed = document.getElementById('tabUsed');
    const tabNew = document.getElementById('tabNew');
    const tabProp = document.getElementById('tabProp');

    if(tabUsed && tabNew && tabProp) {
        tabUsed.style.background = val === 'used_product' ? '#ff5722' : '#f1f1f1';
        tabUsed.style.color = val === 'used_product' ? 'white' : '#333';

        tabNew.style.background = val === 'new_product' ? '#ff5722' : '#f1f1f1';
        tabNew.style.color = val === 'new_product' ? 'white' : '#333';

        tabProp.style.background = val === 'land_property' ? '#ff5722' : '#f1f1f1';
        tabProp.style.color = val === 'land_property' ? 'white' : '#333';
    }

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

    handleProductTypeChange('used_product');
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
        if (currentProductType === 'land_property') {
            matchesType = (p.product_type === 'land_property' || p.Maincategory === 'প্রপার্টি' || p.category === 'প্রপার্টি' || p.category_id === 'property' || p.main_category_id == 3);
        } else if (currentProductType) {
            matchesType = (p.product_type === currentProductType);
        }

        let matchesMain = true;
        if (currentMainCategory !== "সব") {
            const mBn = currentMainCategory.name.bn;
            const mEn = currentMainCategory.name.en;
            const mId = currentMainCategory.id;
            matchesMain = (
                p.Maincategory === mBn || p.Maincategory === mEn || p.Maincategory === mId ||
                p.category === mBn || p.category === mEn || p.category === mId || 
                p.main_category_id == mId || p.category_id === mId
            );
        }

        let matchesSub = true;
        if (currentSubCategory !== "সব") {
            matchesSub = (
                p.sub_categor === currentSubCategory || 
                p.sub_category === currentSubCategory || 
                p.subcategory === currentSubCategory || 
                p.category === currentSubCategory
            );
        }

        let matchesDistrict = (currentDistrict === "সব" || p.District === currentDistrict || p.district === currentDistrict);
        let matchesThana = (currentThana === "সব" || p.Thana === currentThana || p.thana === currentThana);
        let matchesUnion = (currentUnion === "সব" || p.Union === currentUnion || p.union_name === currentUnion || p.union === currentUnion);

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
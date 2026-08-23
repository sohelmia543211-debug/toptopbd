const SUPABASE_URL = 'https://mzqqkkgdggwmpegvqaol.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16cXFra2dkZ2d3bXBlZ3ZxYW9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4MDU4NDUsImV4cCI6MjEwMjM4MTg0NX0.hbUQ4dKjX2iXTF-ugi7JkV_-J5gKIpSEsPN8RpJ0EEo';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentMainCategory = "সব"; 
let currentSubCategory = "সব";
let currentProductType = "used_product"; 
let currentDistrict = "সব"; 
let currentThana = "সব";
let currentUnion = "সব";

let globalProducts = [];
let globalLocations = [];

// পূর্ণাঙ্গ ১২টি ক্যাটাগরি ও সাব-ক্যাটাগরি ডেটা
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
      { name: { bn: "মাইক্রোওয়েভ ও ওভেন", en: "Microwaves & Ovens" }, icon: "fa-fire-burner" },
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
      { name: { bn: "পাঞ্জাবি ও শেরওয়ানি", en: "Panjabis & Sherwanis" }, icon: "fa-shirt" },
      { name: { bn: "শাড়ি ও থ্রিপিস", en: "Sarees & Three-Pieces" }, icon: "fa-vest" },
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
      { name: { bn: "কাজের লোক বা সার্ভিস", en: "Service Workers" }, icon: "fa-user-gear" }
    ]
  },
  {
    id: "services",
    name: { bn: "সার্ভিস", en: "Services" },
    icon: "fa-tools",
    subcategories: [
      { name: { bn: "আইটি ও গ্রাফিক্স ডিজাইন", en: "IT & Graphics Design" }, icon: "fa-pen-nib" },
      { name: { bn: "ইলেকট্রিক ও প্লাম্বিং", en: "Electrical & Plumbing" }, icon: "fa-screwdriver-wrench" },
      { name: { bn: "ইভেন্ট ম্যানেজমেন্ট", en: "Event Management" }, icon: "fa-calendar-days" },
      { name: { bn: "টিউশন বা কোচিং", en: "Tuition & Coaching" }, icon: "fa-chalkboard-user" }
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
        renderMainCategories();
        renderSubCategories();

        const { data: locData, error: locError } = await supabaseClient.from('locations').select('*');
        if (!locError && locData) {
            globalLocations = locData;
        }
        renderLocationDropdowns();

        const { data, error } = await supabaseClient.from('products').select('*');
        if (!error && data) {
            globalProducts = data;
        }
        renderProducts();
    } catch (err) {
        console.error('ডাটা ফেচ এরর:', err);
    }
}

// সার্চবার, চেইন লোকেশন ড্রপডাউন ও রিসেট বাটন মোবাইল ও ডেস্কটপে সুন্দরভাবে রেন্ডার করার ফাংশন
function renderLocationDropdowns() {
    const searchBarContainer = document.getElementById('searchBarContainer');
    if (!searchBarContainer) return;

    const lang = getLang();
    const allDistText = lang === 'en' ? 'All Districts' : 'সব জেলা';
    const allThanaText = lang === 'en' ? 'All Thanas' : 'সব থানা';
    const allUnionText = lang === 'en' ? 'All Unions' : 'সব ইউনিয়ন';
    const searchPlaceholder = lang === 'en' ? 'Search your favorite products...' : 'আপনার পছন্দের পণ্য খুঁজুন...';
    const resetText = lang === 'en' ? 'Reset' : 'রিসেট';

    const districts = [...new Set(globalLocations.map(item => item.district))].filter(Boolean);
    
    let thanas = [];
    if (currentDistrict !== "সব") {
        thanas = [...new Set(globalLocations.filter(item => item.district === currentDistrict).map(item => item.thana))].filter(Boolean);
    }

    let unions = [];
    if (currentThana !== "সব") {
        unions = [...new Set(globalLocations.filter(item => item.district === currentDistrict && item.thana === currentThana).map(item => item.union_name || item.union))].filter(Boolean);
    }

    const existingSearchVal = document.getElementById('searchBox') ? document.getElementById('searchBox').value : '';

    searchBarContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); width: 100%; max-width: 1200px; margin: 10px auto; box-sizing: border-box;">
            
            <!-- টপ রো: লোকেশন ড্রপডাউন ও রিসেট বাটন -->
            <div style="display: flex; gap: 6px; width: 100%; flex-wrap: wrap;">
                
                <!-- জেলা বক্স -->
                <div style="display: flex; align-items: center; gap: 4px; background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 8px; padding: 6px 8px; flex: 1; min-width: 100px; box-sizing: border-box;">
                    <i class="fa-solid fa-location-dot" style="color: #4f46e5; font-size: 12px;"></i>
                    <select id="districtSelect" onchange="onDistrictChange(this.value)" style="border: none; outline: none; background: transparent; font-size: 12px; font-weight: 600; cursor: pointer; color: #312e81; width: 100%;">
                        <option value="সব">${allDistText}</option>
                        ${districts.map(d => `<option value="${d}" ${currentDistrict === d ? 'selected' : ''}>${d}</option>`).join('')}
                    </select>
                </div>

                <!-- থানা বক্স -->
                <div style="display: flex; align-items: center; gap: 4px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 6px 8px; flex: 1; min-width: 100px; box-sizing: border-box;">
                    <i class="fa-solid fa-map-pin" style="color: #16a34a; font-size: 12px;"></i>
                    <select id="thanaSelect" onchange="onThanaChange(this.value)" style="border: none; outline: none; background: transparent; font-size: 12px; font-weight: 600; cursor: pointer; color: ${currentDistrict === 'সব' ? '#9ca3af' : '#14532d'}; width: 100%;" ${currentDistrict === 'সব' ? 'disabled' : ''}>
                        <option value="সব">${allThanaText}</option>
                        ${thanas.map(t => `<option value="${t}" ${currentThana === t ? 'selected' : ''}>${t}</option>`).join('')}
                    </select>
                </div>

                <!-- ইউনিয়ন বক্স -->
                <div style="display: flex; align-items: center; gap: 4px; background: #fdf4ff; border: 1px solid #f5d0fe; border-radius: 8px; padding: 6px 8px; flex: 1; min-width: 100px; box-sizing: border-box;">
                    <i class="fa-solid fa-building-flag" style="color: #c026d3; font-size: 12px;"></i>
                    <select id="unionSelect" onchange="onUnionChange(this.value)" style="border: none; outline: none; background: transparent; font-size: 12px; font-weight: 600; cursor: pointer; color: ${currentThana === 'সব' ? '#9ca3af' : '#701a75'}; width: 100%;" ${currentThana === 'সব' ? 'disabled' : ''}>
                        <option value="সব">${allUnionText}</option>
                        ${unions.map(u => `<option value="${u}" ${currentUnion === u ? 'selected' : ''}>${u}</option>`).join('')}
                    </select>
                </div>

                <!-- রিসেট বাটন -->
                <button onclick="resetFilters()" title="Reset Filters" style="background: #fff1f2; border: 1px solid #fecdd3; color: #e11d48; padding: 6px 10px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; font-size: 11px; font-weight: 600; white-space: nowrap;">
                    <i class="fa-solid fa-rotate-right" style="font-size: 10px;"></i> ${resetText}
                </button>
            </div>

            <!-- বটম রো: সার্চ বার ও সার্চ বাটন -->
            <div style="display: flex; align-items: center; gap: 6px; width: 100%;">
                <div style="display: flex; align-items: center; gap: 8px; flex: 1; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px 12px; box-sizing: border-box;">
                    <i class="fa-solid fa-magnifying-glass" style="color: #64748b; font-size: 14px;"></i>
                    <input type="text" id="searchBox" placeholder="${searchPlaceholder}" value="${existingSearchVal}" oninput="renderProducts(this.value)" style="border: none; outline: none; width: 100%; font-size: 13px; background: transparent; color: #1e293b;">
                </div>
                <button onclick="renderProducts()" style="background: #ff5722; border: none; color: white; padding: 9px 16px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px; box-shadow: 0 2px 4px rgba(255,87,34,0.3); white-space: nowrap;">
                    <i class="fa-solid fa-magnifying-glass" style="font-size: 13px;"></i>
                </button>
            </div>

        </div>
    `;
}

function onDistrictChange(val) {
    currentDistrict = val;
    currentThana = "সব";
    currentUnion = "সব";
    renderLocationDropdowns();
    renderProducts();
}

function onThanaChange(val) {
    currentThana = val;
    currentUnion = "সব";
    renderLocationDropdowns();
    renderProducts();
}

function onUnionChange(val) {
    currentUnion = val;
    renderProducts();
}

// ফিল্টার রিসেট করার ফাংশন
function resetFilters() {
    currentDistrict = "সব";
    currentThana = "সব";
    currentUnion = "সব";
    currentMainCategory = "সব";
    currentSubCategory = "সব";
    
    const searchBox = document.getElementById('searchBox');
    if (searchBox) searchBox.value = "";

    renderMainCategories();
    renderSubCategories();
    renderLocationDropdowns();
    renderProducts();
}

function filterProductsByType(type) {
    currentProductType = type;
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

function renderProducts(searchKeyword = "") {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    const lang = getLang();
    const noProductText = lang === 'en' ? 'No products found.' : 'কোনো পণ্য পাওয়া যায়নি।';
    const searchInput = document.getElementById('searchBox');
    const keyword = searchKeyword || (searchInput ? searchInput.value : "");

    let filteredProducts = globalProducts.filter(p => {
        let matchesType = true;
        if (p.product_type && currentProductType) {
            matchesType = p.product_type === currentProductType;
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

        let matchesSearch = p.name ? p.name.toLowerCase().includes(keyword.toLowerCase()) : true;

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
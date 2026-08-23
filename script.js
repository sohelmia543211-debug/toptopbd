const SUPABASE_URL = 'https://mzqqkkgdggwmpegvqaol.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16cXFra2dkZ2d3bXBlZ3ZxYW9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4MDU4NDUsImV4cCI6MjEwMjM4MTg0NX0.hbUQ4dKjX2iXTF-ugi7JkV_-J5gKIpSEsPN8RpJ0EEo';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentMainCategory = "সব"; 
let currentSubCategory = "সব";
let currentProductType = "used_product"; 
let currentDistrict = "সব"; 
let currentThana = "সব";     
let currentUnion = "সব";     // ইউনিয়ন ফিল্টারের জন্য ভেরিয়েবল
let globalProducts = [];
let globalLocations = [];   

// ১২টি হার্ডকোডেড মেইন ক্যাটাগরি এবং সাব-ক্যাটাগরি লিস্ট
const hardcodedCategories = [
  {
    id: "mobiles",
    name: "মোবাইল ও ট্যাব",
    icon: "fa-mobile-screen-button",
    subcategories: ["স্মার্টফোন", "ফিচার ফোন", "ট্যাব ও আইপ্যাড", "মোবাইল এক্সেসরিজ"]
  },
  {
    id: "electronics",
    name: "ইলেকট্রনিক্স",
    icon: "fa-laptop",
    subcategories: ["ল্যাপটপ ও কম্পিউটার", "টিভি ও সাউন্ড সিস্টেম", "এসি ও ফ্রিজ", "হোম অ্যাপ্লায়েন্সেস"]
  },
  {
    id: "vehicles",
    name: "যানবাহন",
    icon: "fa-motorcycle",
    subcategories: ["মোটরসাইকেল", "বাইসাইকেল", "প্রাইভেট কার", "অন্যান্য যান ও পার্টস"]
  },
  {
    id: "property",
    name: "প্রপার্টি",
    icon: "fa-building",
    subcategories: ["বাসা/ফ্লাট ভাড়া", "জমি বা প্লট বিক্রি", "সাবলেট রুম", "দোকান বা অফিস স্পেস"]
  },
  {
    id: "fashion",
    name: "ফ্যাশন",
    icon: "fa-shirt",
    subcategories: ["পুরুষদের পোশাক", "নারীদের পোশাক", "জুতো ও ব্যাগ", "প্রসাধনী ও ঘড়ি"]
  },
  {
    id: "home_living",
    name: "হোম ও লিভিং",
    icon: "fa-couch",
    subcategories: ["ঘরের আসবাবপত্র", "হোম ডেকোর বা শোপিস", "কিচেন ও ডাইনিং", "লাইটিং ও ফ্যান"]
  },
  {
    id: "pets",
    name: "পোষা প্রাণী",
    icon: "fa-dog",
    subcategories: ["বিড়াল ও কুকুর", "পাখি ও মাছ", "গবাদিপশু", "পেট ফুড ও কেয়ার"]
  },
  {
    id: "books_sports",
    name: "বই ও শখ",
    icon: "fa-book",
    subcategories: ["একাডেমিক বই ও উপন্যাস", "জিম ও স্পোর্টস আইটেম", "মিউজিক্যাল ইন্সট্রুমেন্ট", "খেলনা ও শখ"]
  },
  {
    id: "agriculture",
    name: "কৃষি ও বাগান",
    icon: "fa-seedling",
    subcategories: ["বীজ ও সার", "কৃষিকাজের যন্ত্রপাতি", "গাছের চারা ও টব", "সেচ সরঞ্জাম"]
  },
  {
    id: "jobs",
    name: "চাকরি",
    icon: "fa-briefcase",
    subcategories: ["ফুলটাইম জব", "পার্টটাইম ও রিমোট জব", "ইন্টার্নশিপ", "কাজের লোক বা সার্ভিস"]
  },
  {
    id: "services",
    name: "সার্ভিস",
    icon: "fa-tools",
    subcategories: ["আইটি ও গ্রাফিক্স ডিজাইন", "ইলেকট্রিক ও প্লাম্বিং", "ইভেন্ট ম্যানেজমেন্ট", "টিউশন বা কোচিং"]
  },
  {
    id: "others",
    name: "অন্যান্য",
    icon: "fa-box",
    subcategories: ["মিসেলেনিয়াস বা অন্যান্য আইটেম"]
  }
];

// ১. ব্যানার লোড করা
async function fetchBanners() {
    try {
        const { data, error } = await supabaseClient.from('banners').select('*');
        if (error) { console.error('ব্যানার লোড এরর:', error.message); return; }

        if (data && data.length > 0) {
            const banner = data[0]; 
            document.getElementById('bannerContainer').innerHTML = `
                <div class="banner-slider" style="background-image: url('${banner.image_url}');">
                    <div class="banner-overlay">
                        <h2 class="banner-title">${banner.title}</h2>
                        <p class="banner-subtitle">${banner.subtitle}</p>
                    </div>
                </div>
            `;
        }
    } catch (err) { console.error('ব্যানার কানেকশন এরর:', err); }
}

// লোকেশন ডাটা ফেচ করা
async function fetchLocations() {
    try {
        const { data, error } = await supabaseClient.from('locations').select('*');
        if (!error && data) {
            globalLocations = data;
            renderDistrictDropdown(); 
        }
    } catch (err) {
        console.error('লোকেশন লোড এরর:', err);
    }
}

// ১. ইউনিক জেলাগুলো ড্রপডাউনে লোড করা
function renderDistrictDropdown() {
    const districtSelect = document.getElementById('districtFilter');
    if (!districtSelect) return;

    const uniqueDistricts = [...new Set(globalLocations.map(loc => loc.district))];

    let html = `<option value="সব">📍 সব জেলা</option>`;
    uniqueDistricts.forEach(district => {
        html += `<option value="${district}">${district}</option>`;
    });
    districtSelect.innerHTML = html;
}

// ২. জেলা সিলেক্ট করলে থানা ড্রপডাউন বের হবে
function onDistrictChange(districtName) {
    currentDistrict = districtName;
    currentThana = "সব";
    currentUnion = "সব";

    const thanaSelect = document.getElementById('thanaFilter');
    const unionSelect = document.getElementById('unionFilter');

    if (districtName === "সব") {
        thanaSelect.style.display = "none";
        unionSelect.style.display = "none";
    } else {
        thanaSelect.style.display = "block";
        unionSelect.style.display = "none"; 

        const filteredThanas = [...new Set(globalLocations.filter(loc => loc.district === districtName).map(loc => loc.thana))];
        
        let html = `<option value="সব">📍 সব থানা</option>`;
        filteredThanas.forEach(thana => {
            html += `<option value="${thana}">${thana}</option>`;
        });
        thanaSelect.innerHTML = html;
    }
    renderProducts();
}

// ৩. থানা সিলেক্ট করলে ইউনিয়ন ড্রপডাউন বের হবে
function onThanaChange(thanaName) {
    currentThana = thanaName;
    currentUnion = "সব";

    const unionSelect = document.getElementById('unionFilter');

    if (thanaName === "সব") {
        unionSelect.style.display = "none";
    } else {
        unionSelect.style.display = "block";

        const filteredUnions = globalLocations.filter(loc => loc.district === currentDistrict && loc.thana === thanaName);
        
        let html = `<option value="সব">📍 সব ইউনিয়ন</option>`;
        filteredUnions.forEach(loc => {
            html += `<option value="${loc.union_name}">${loc.union_name}</option>`;
        });
        unionSelect.innerHTML = html;
    }
    renderProducts();
}

// ৪. ইউনিয়ন সিলেক্ট করার ফাংশন
function onUnionChange(unionName) {
    currentUnion = unionName;
    renderProducts();
}

// প্রোডাক্ট ডাটা ফেচ করা এবং ক্যাটাগরি রেন্ডার করা
async function fetchInitialData() {
    const productGrid = document.getElementById('productGrid');
    if (productGrid) productGrid.innerHTML = `<div class="cat-card shimmer-card" style="height: 120px; width: 100%;"></div>`.repeat(4);

    try {
        renderMainCategories();
        renderSubCategories();
        await fetchLocations(); 

        const { data, error } = await supabaseClient.from('products').select('*');
        if (!error && data) {
            globalProducts = data;
        }
        renderProducts();

    } catch (err) {
        console.error('ডাটা ফেচ এরর:', err);
    }
}

// প্রোডাক্ট টাইপ ফিল্টার করার ফাংশন
function filterProductsByType(type) {
    currentProductType = type;
    renderProducts();
}

// মেইন ক্যাটাগরি রেন্ডার করা
function renderMainCategories() {
    const grid = document.getElementById('mainCategories');
    if (!grid) return;

    const isAllActive = currentMainCategory === "সব" ? 'active' : '';
    let html = `
        <div class="cat-card ${isAllActive}" onclick="selectMainCategory('সব')">
            <div style="width: 35px; height: 35px; margin: 0 auto 3px auto; background: #ff5722; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white;">
                <i class="fa-solid fa-border-all" style="font-size: 14px;"></i>
            </div>
            <span>সব</span>
        </div>
    `;

    hardcodedCategories.forEach(cat => {
        const isActive = (currentMainCategory !== "সব" && currentMainCategory.id === cat.id) ? 'active' : '';
        html += `
            <div class="cat-card ${isActive}" onclick="selectMainCategory('${cat.id}')">
                <div style="width: 35px; height: 35px; margin: 0 auto 3px auto; background: #fff5f2; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #ff5722;">
                    <i class="fa-solid ${cat.icon}" style="font-size: 14px;"></i>
                </div>
                <span>${cat.name}</span>
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

// সাব-ক্যাটাগরি রেন্ডার করা
function renderSubCategories() {
    const grid = document.getElementById('subCategories');
    if (!grid) return;

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
            <span>সব</span>
        </div>
    `;

    filteredSubs.forEach(subName => {
        const isActive = subName === currentSubCategory ? 'active' : '';
        html += `
            <div class="sub-card ${isActive}" onclick="selectSubCategory('${subName}')">
                <div style="width: 28px; height: 28px; margin: 0 auto 3px auto; background: #fff5f2; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ff5722; font-size: 11px;">
                    <i class="fa-solid fa-tag"></i>
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

// প্রোডাক্ট ফিল্টার করা
function renderProducts(searchKeyword = "") {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    let filteredProducts = globalProducts.filter(p => {
        let matchesType = p.product_type === currentProductType;

        let matchesMain = true;
        if (currentMainCategory !== "সব") {
            matchesMain = (p.category === currentMainCategory.name || p.main_category_id === currentMainCategory.id);
        }

        let matchesSub = true;
        if (currentSubCategory !== "সব") {
            matchesSub = (p.sub_category === currentSubCategory || p.category === currentSubCategory);
        }

        // জেলা, থানা ও ইউনিয়ন অনুযায়ী ফিল্টার শর্ত
        let matchesDistrict = (currentDistrict === "সব" || p.district === currentDistrict);
        let matchesThana = (currentThana === "সব" || p.thana === currentThana || p.location === currentThana);
        let matchesUnion = (currentUnion === "সব" || p.union_name === currentUnion);

        let matchesSearch = p.name.toLowerCase().includes(searchKeyword.toLowerCase());
        return matchesType && matchesMain && matchesSub && matchesDistrict && matchesThana && matchesUnion && matchesSearch;
    });

    if (filteredProducts.length === 0) {
        grid.innerHTML = `<div class="no-product"><i class="fa-solid fa-box-open" style="font-size: 28px; margin-bottom: 8px; display:block; color:#ff5722;"></i>কোনো পণ্য পাওয়া যায়নি।</div>`;
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

// সার্চ বক্স লাইভ ফিল্টার
const searchBox = document.getElementById('searchBox');
if (searchBox) {
    searchBox.addEventListener('input', (e) => {
        renderProducts(e.target.value);
    });
}

// উইন্ডো লোড হ্যান্ডলার
window.onload = () => {
    fetchBanners();
    fetchInitialData();
};
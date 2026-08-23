const SUPABASE_URL = 'https://mzqqkkgdggwmpegvqaol.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16cXFra2dkZ2d3bXBlZ3ZxYW9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4MDU4NDUsImV4cCI6MjEwMjM4MTg0NX0.hbUQ4dKjX2iXTF-ugi7JkV_-J5gKIpSEsPN8RpJ0EEo';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentMainCategory = "সব"; 
let currentSubCategory = "সব";
let currentProductType = "used_product"; 
let currentDistrict = "সব"; 
let globalProducts = [];

// ক্যাটাগরি ডেটা (ভাষা সাপোর্ট সহ ঠিক করা হয়েছে)
const hardcodedCategories = [
  {
    id: "mobiles",
    name: { bn: "মোবাইল ও ট্যাব", en: "Mobiles & Tablets" },
    icon: "fa-mobile-screen-button",
    subcategories: [
      { name: { bn: "স্মার্টফোন", en: "Smartphones" }, icon: "fa-mobile" },
      { name: { bn: "ফিচার ফোন", en: "Feature Phones" }, icon: "fa-phone-flip" },
      { name: { bn: "ট্যাব ও আইপ্যাড", en: "Tablets & iPads" }, icon: "fa-tablet" },
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
      { name: { bn: "ক্যামেরা ও ড্রোন", en: "Cameras & Drones" }, icon: "fa-camera" }
    ]
  },
  {
    id: "vehicles",
    name: { bn: "যানবাহন", en: "Vehicles" },
    icon: "fa-motorcycle",
    subcategories: [
      { name: { bn: "মোটরসাইকেল", en: "Motorcycles" }, icon: "fa-motorcycle" },
      { name: { bn: "বাইসাইকেল", en: "Bicycles" }, icon: "fa-bicycle" },
      { name: { bn: "প্রাইভেট কার", en: "Private Cars" }, icon: "fa-car" }
    ]
  },
  {
    id: "property",
    name: { bn: "প্রপার্টি", en: "Property" },
    icon: "fa-building",
    subcategories: [
      { name: { bn: "বাসা/ফ্লাট ভাড়া", en: "House/Flat Rent" }, icon: "fa-house-chimney" },
      { name: { bn: "জমি বা প্লট বিক্রি", en: "Land/Plot Sale" }, icon: "fa-earth-americas" }
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

async function fetchInitialData() {
    try {
        renderMainCategories();
        renderSubCategories();

        const { data, error } = await supabaseClient.from('products').select('*');
        if (!error && data) {
            globalProducts = data;
        }
        renderProducts();
    } catch (err) {
        console.error('ডাটা ফেচ এরর:', err);
    }
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
    const keyword = searchKeyword || document.getElementById('searchBox').value;

    let filteredProducts = globalProducts.filter(p => {
        let matchesType = p.product_type === currentProductType;

        let matchesMain = true;
        if (currentMainCategory !== "সব") {
            matchesMain = (p.category === currentMainCategory.name.bn || p.category === currentMainCategory.name.en || p.main_category_id === currentMainCategory.id);
        }

        let matchesSub = true;
        if (currentSubCategory !== "সব") {
            matchesSub = (p.sub_category === currentSubCategory || p.category === currentSubCategory);
        }

        let matchesDistrict = (currentDistrict === "সব" || p.district === currentDistrict);
        let matchesSearch = p.name.toLowerCase().includes(keyword.toLowerCase());

        return matchesType && matchesMain && matchesSub && matchesDistrict && matchesSearch;
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

const searchBox = document.getElementById('searchBox');
if (searchBox) {
    searchBox.addEventListener('input', (e) => {
        renderProducts(e.target.value);
    });
}

window.onload = () => {
    applyLanguage();
    fetchBanners();
    fetchInitialData();
};
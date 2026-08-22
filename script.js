const SUPABASE_URL = 'https://mzqqkkgdggwmpegvqaol.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16cXFra2dkZ2d3bXBlZ3ZxYW9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4MDU4NDUsImV4cCI6MjEwMjM4MTg0NX0.hbUQ4dKjX2iXTF-ugi7JkV_-J5gKIpSEsPN8RpJ0EEo';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentMainCategory = "সব"; 
let currentSubCategory = "সব";
let currentProductType = "used_product"; // ডিফল্টভাবে পুরনো পণ্য সিলেক্ট থাকবে
let globalMainCategories = [];
let globalSubCategories = [];
let globalProducts = [];

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

// ২. ইনিশিয়ালি সব ডাটা একসাথে ফেচ করে মেমোরিতে রাখা
async function fetchInitialData() {
    const mainGrid = document.getElementById('mainCategories');
    const subGrid = document.getElementById('subCategories');

    if (mainGrid) mainGrid.innerHTML = `<div class="cat-card shimmer-card" style="height: 90px; min-width: 100px;"></div>`.repeat(4);
    if (subGrid) subGrid.innerHTML = `<div class="cat-card shimmer-card" style="height: 60px; min-width: 90px;"></div>`.repeat(4);

    try {
        const [mainRes, subRes, prodRes] = await Promise.all([
            supabaseClient.from('MainCategory').select('*'),
            supabaseClient.from('categories').select('*'),
            supabaseClient.from('products').select('*')
        ]);

        if (!mainRes.error) globalMainCategories = mainRes.data;
        if (!subRes.error) globalSubCategories = subRes.data.filter(sub => sub.name.trim() !== "সব");
        if (!prodRes.error) globalProducts = prodRes.data;

        renderMainCategories();
        renderSubCategories();
        renderProducts();

    } catch (err) {
        console.error('ডাটা ফেচ এরর:', err);
    }
}

// ৩. ড্রপডাউন থেকে প্রোডাক্ট টাইপ ফিল্টার করার ফাংশন
function filterProductsByType(type) {
    currentProductType = type;
    renderProducts();
}

// ৪. মেইন ক্যাটাগরি রেন্ডার করা
function renderMainCategories() {
    const grid = document.getElementById('mainCategories');
    if (!grid) return;
    grid.innerHTML = "";

    const isAllActive = currentMainCategory === "সব" ? 'active' : '';
    let html = `
        <div class="cat-card ${isAllActive}" onclick="selectMainCategory('সব')">
            <div style="width: 45px; height: 45px; margin: 0 auto 6px auto; background: #ff5722; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white;">
                <i class="fa-solid fa-border-all"></i>
            </div>
            <span>সব</span>
        </div>
    `;

    globalMainCategories.forEach(cat => {
        const isActive = (currentMainCategory !== "সব" && cat.id === currentMainCategory.id) ? 'active' : '';
        html += `
            <div class="cat-card ${isActive}" onclick='selectMainCategory(${JSON.stringify(cat)})'>
                <img src="${cat.image_url}" alt="${cat.name}" style="width: 45px; height: 45px; border-radius: 8px; object-fit: cover; margin-bottom: 6px;">
                <span>${cat.name}</span>
            </div>
        `;
    });
    grid.innerHTML = html;
}

// মেইন ক্যাটাগরিতে ক্লিক করলে শুধু সাব-ক্যাটাগরি ইনস্ট্যান্ট আপডেট হবে (প্রোডাক্ট আপডেট হবে না)
function selectMainCategory(cat) {
    currentMainCategory = cat;
    currentSubCategory = "সব"; // মেইন বদলালে সাব-ক্যাটাগরি রিসেট হয়ে "সব" হবে
    
    renderMainCategories();
    renderSubCategories(); 
    
    // সাব-ক্যাটাগরি সেকশনে হালকা এনিমেশন এফেক্ট দেওয়া হলো যাতে আপডেটের বিষয়টি বোঝা যায়
    const subGrid = document.getElementById('subCategories');
    if(subGrid) {
        subGrid.style.opacity = '0.3';
        subGrid.style.transform = 'translateY(5px)';
        setTimeout(() => {
            subGrid.style.transition = 'all 0.2s ease-in-out';
            subGrid.style.opacity = '1';
            subGrid.style.transform = 'translateY(0)';
        }, 50);
    }
}

// ৫. সাব-ক্যাটাগরি রেন্ডার করা
function renderSubCategories() {
    const grid = document.getElementById('subCategories');
    if (!grid) return;
    grid.innerHTML = "";

    let filteredSubs = [];

    if (currentMainCategory === "সব") {
        filteredSubs = globalSubCategories;
    } else {
        filteredSubs = globalSubCategories.filter(sub => 
            sub.Category_id == currentMainCategory.id || sub.category_id == currentMainCategory.id
        );
    }

    const allOptionActive = currentSubCategory === "সব" ? 'active' : '';
    let html = `
        <div class="sub-card ${allOptionActive}" onclick="selectSubCategory('সব')">
            <div style="width: 32px; height: 32px; margin: 0 auto 5px auto; background: #ff5722; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px;">
                <i class="fa-solid fa-border-all"></i>
            </div>
            <span>সব</span>
        </div>
    `;

    filteredSubs.forEach(sub => {
        const isActive = sub.name === currentSubCategory ? 'active' : '';
        html += `
            <div class="sub-card ${isActive}" onclick="selectSubCategory('${sub.name}')">
                ${sub.image_url ? `<img src="${sub.image_url}" alt="${sub.name}">` : ''}
                <span>${sub.name}</span>
            </div>
        `;
    });

    grid.innerHTML = html;
}

// সাব-ক্যাটাগরিতে ক্লিক করলে শুধুমাত্র প্রোডাক্টগুলো আপডেট হবে এবং ভিজ্যুয়াল এফেক্ট দেখাবে
function selectSubCategory(subName) {
    currentSubCategory = subName;
    renderSubCategories();
    renderProducts(); 

    // প্রোডাক্ট গ্রিডে আপডেটের জন্য ভিজ্যুয়াল এফেক্ট বা পপ এফেক্ট দেওয়া হলো
    const prodGrid = document.getElementById('productGrid');
    if(prodGrid) {
        prodGrid.style.opacity = '0.3';
        prodGrid.style.transform = 'scale(0.98)';
        setTimeout(() => {
            prodGrid.style.transition = 'all 0.2s ease-in-out';
            prodGrid.style.opacity = '1';
            prodGrid.style.transform = 'scale(1)';
        }, 50);
    }
}

// ৬. লোকাল অ্যারে থেকে ইনস্ট্যান্ট প্রোডাক্ট ফিল্টার করা
function renderProducts(searchKeyword = "") {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    grid.innerHTML = "";

    let filteredProducts = globalProducts.filter(p => {
        let matchesType = p.product_type === currentProductType;

        let matchesMain = true;
        if (currentMainCategory !== "সব") {
            matchesMain = p.main_category_id == currentMainCategory.id || p.category === currentMainCategory.name || p.Category_id == currentMainCategory.id;
        }
        
        let matchesSub = true;
        if (currentSubCategory !== "সব") {
            matchesSub = p.sub_category === currentSubCategory || p.category === currentSubCategory;
        }

        const matchesSearch = p.name.toLowerCase().includes(searchKeyword.toLowerCase());

        return matchesType && matchesMain && matchesSub && matchesSearch;
    });

    if (filteredProducts.length === 0) {
        grid.innerHTML = `<div class="no-product" style="grid-column: 1 / -1; text-align: center; padding: 30px;"><i class="fa-solid fa-box-open" style="font-size: 28px; margin-bottom: 8px; display:block; color:#ff5722;"></i>কোনো পণ্য পাওয়া যায়নি।</div>`;
        return;
    }

    let productHtml = "";
    filteredProducts.forEach(p => {
        productHtml += `
            <div class="product-card" onclick="window.location.href='product_details.html?id=${p.id}'" style="cursor: pointer;">
                <div class="product-img-box">
                    ${p.image_url ? `<img src="${p.image_url}" style="width:100%; height:100%; object-fit:cover;">` : `<i class="fa-solid fa-image" style="font-size: 22px;"></i>`}
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

// ৭. সার্চ বক্স লাইভ ফিল্টার
const searchBox = document.getElementById('searchBox');
if (searchBox) {
    searchBox.addEventListener('input', (e) => {
        renderProducts(e.target.value);
    });
}

// পেজ লোড হলে রান হবে
window.onload = () => {
    fetchBanners();
    fetchInitialData();
};
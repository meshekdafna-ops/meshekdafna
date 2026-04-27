// 1. מאגר הנתונים
let allProducts = [];

// 2. ניהול העגלה (טעינה ראשונית מהזיכרון)
let cart = JSON.parse(localStorage.getItem('meshek_dafna_cart')) || [];

// פונקציית עזר לשמירה ב-LocalStorage
function saveCart() {
    localStorage.setItem('meshek_dafna_cart', JSON.stringify(cart));
}

async function fetchProducts() {
    const progressFill = document.getElementById('progress-fill');
    const percentText = document.getElementById('percent');
    const preloader = document.getElementById('preloader');
    
    let currentPercent = 0;

    const loadingInterval = setInterval(() => {
        if (currentPercent < 90) {
            currentPercent += Math.floor(Math.random() * 3) + 1;
            if (currentPercent > 90) currentPercent = 90;
            updateLoader(currentPercent);
        }
    }, 400); // זריז יותר

    function updateLoader(percent) {
        if(progressFill) progressFill.style.width = percent + '%';
        if(percentText) percentText.innerText = percent + '%';
    }

    try {
        const response = await fetch('https://backend-meshekdafna.onrender.com/api/products');
        allProducts = await response.json();
        
        clearInterval(loadingInterval);
        updateLoader(100);
        
        setTimeout(() => {
            renderProducts();
            if(preloader) preloader.classList.add('loader-hidden');
        }, 500);

    } catch (error) {
        clearInterval(loadingInterval);
        console.error("Failed to fetch:", error);
        const statusText = document.getElementById('status-text');
        if(statusText) statusText.innerText = "תקלה בחיבור לשרת...";
    }
}

function renderCollection(categoryId, targetElementId) {
    const target = document.getElementById(targetElementId);
    if (!target) return;

    const filtered = allProducts.filter(p => p.category === categoryId);
    
    // שינוי חשוב: product._id במקום product.id
    // שינוי חשוב: product.image (כמו ב-Model) במקום product.img
    target.innerHTML = filtered.map(product => `
        <div class="product-card">
            <img src="${product.image || product.img}" alt="${product.name}">
            <h3>${product.name}</h3>
            <div class="product-details">
                <span class="price">₪${product.price.toFixed(2)}</span>
                <span class="stock">מלאי: ${product.stock}</span>
            </div>
            <button class="add-btn" 
                    ${product.stock <= 0 ? 'disabled' : ''} 
                    onclick="addToCart('${product._id}')">
                ${product.stock > 0 ? 'הוסף לסל' : 'אזל מהמלאי'}
            </button>
        </div>
    `).join('');
}

// הוספה לעגלה - שימוש ב-_id
function addToCart(productId) {
    const product = allProducts.find(p => p._id === productId);
    const existingItem = cart.find(item => item._id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveCart();
    updateUI();
    
    // בונוס: פתיחת העגלה אוטומטית בהוספה
    const modal = document.getElementById('cart-modal');
    if(!modal.classList.contains('open')) toggleCart();
}

// עדכון הממשק
function updateUI() {
    const cartCount = document.getElementById('cart-count');
    if(cartCount) cartCount.innerText = cart.reduce((sum, item) => sum + item.quantity, 0);

    const cartItemsElement = document.getElementById('cart-items');
    if (!cartItemsElement) return;
    
    if (cart.length === 0) {
        cartItemsElement.innerHTML = '<p style="text-align:center; padding:20px;">העגלה ריקה</p>';
    } else {
        cartItemsElement.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image || item.img}">
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p>₪${item.price.toFixed(2)}</p>
                    <div class="qty-controls">
                        <button class="qty-btn" onclick="changeQty('${item._id}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="changeQty('${item._id}', 1)">+</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalElement = document.getElementById('cart-total');
    if(totalElement) totalElement.innerText = `₪${total.toFixed(2)}`;
}

// שינוי כמות - שימוש ב-_id
function changeQty(id, delta) {
    const item = cart.find(i => i._id === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i._id !== id);
        }
    }
    saveCart();
    updateUI();
}

function toggleCart() {
    const modal = document.getElementById('cart-modal');
    const overlay = document.getElementById('cart-overlay');
    const body = document.body;
    
    modal.classList.toggle('open');
    
    if (modal.classList.contains('open')) {
        overlay.style.display = 'block';
        body.style.overflow = 'hidden'; 
    } else {
        overlay.style.display = 'none';
        body.style.overflow = ''; 
    }
}

function scrollSlider(id, direction) {
    const slider = document.getElementById(id);
    const scrollAmount = 300; 
    slider.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
}

function renderProducts() {
    renderCollection('fruits', 'fruits-grid');
    renderCollection('veggies', 'veggies-grid');
    renderCollection('packs', 'packs-grid');
}

window.onload = () => {
    fetchProducts(); // קודם טוענים נתונים, ה-render קורה בתוך ה-fetch
    updateUI();
};
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

    // פונקציית עזר להרצת האחוזים באופן ויזואלי
    const loadingInterval = setInterval(() => {
        if (currentPercent < 90) { // רץ עד 90% ומחכה לתשובה מהשרת
            currentPercent += Math.floor(Math.random() * 5) + 1; // קפיצות אקראיות למראה "אמיתי"
            if (currentPercent > 90) currentPercent = 90;
            updateLoader(currentPercent);
        }
    }, 400);

    function updateLoader(percent) {
        progressFill.style.width = percent + '%';
        percentText.innerText = percent + '%';
    }

    try {
        const response = await fetch('https://backend-meshekdafna.onrender.com/api/products');
        allProducts = await response.json();
        
        // כשהנתונים הגיעו - קופצים ל-100% ומעלימים
        clearInterval(loadingInterval);
        updateLoader(100);
        
        setTimeout(() => {
            renderProducts();
            preloader.classList.add('loader-hidden');
        }, 500); // השהייה קטנה כדי שיראו את ה-100%

    } catch (error) {
        clearInterval(loadingInterval);
        console.error("Failed to fetch:", error);
        document.getElementById('status-text').innerText = "תקלה בחיבור לשרת...";
    }
}

function renderCollection(categoryId, targetElementId) {
    const target = document.getElementById(targetElementId);
    if (!target) return;

    const filtered = allProducts.filter(p => p.category === categoryId);
    
    target.innerHTML = filtered.map(product => `
        <div class="product-card">
            <img src="${product.img}" alt="${product.name}">
            <h3>${product.name}</h3>
            <div class="product-details">
                <span class="price">₪${product.price.toFixed(2)}</span>
                <span class="stock">מלאי: ${product.stock}</span>
            </div>
            <button class="add-btn" 
                    ${product.stock <= 0 ? 'disabled' : ''} 
                    onclick="addToCart(${product.id})">
                ${product.stock > 0 ? 'הוסף לסל' : 'אזל מהמלאי'}
            </button>
        </div>
    `).join('');
}
// הוספה לעגלה
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveCart();   // שמירה בזיכרון
    updateUI();   // עדכון הממשק
}

// עדכון הממשק (מספר בעגלה, רשימה ומחיר)
function updateUI() {
    // עדכון המספר על העיגול הצף
    document.getElementById('cart-count').innerText = cart.length;

    const cartItemsElement = document.getElementById('cart-items');
    
    if (cart.length === 0) {
        cartItemsElement.innerHTML = '<p style="text-align:center; padding:20px;">העגלה ריקה</p>';
    } else {
        cartItemsElement.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.img}">
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p>₪${item.price.toFixed(2)}</p>
                    <div class="qty-controls">
                        <button class="qty-btn" onclick="changeQty(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('cart-total').innerText = `₪${total.toFixed(2)}`;
}

// שינוי כמות או הסרה
function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity += delta;
        
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== id);
        }
    }
    
    saveCart();   // שמירה בזיכרון
    updateUI();   // עדכון הממשק
}

// פתיחה/סגירה של העגלה
// פתיחה/סגירה של העגלה עם חסימת גלילה הרמטית
function toggleCart() {
    const modal = document.getElementById('cart-modal');
    const overlay = document.getElementById('cart-overlay');
    const body = document.body;
    
    modal.classList.toggle('open');
    
    if (modal.classList.contains('open')) {
        overlay.style.display = 'block';
        // חסימת גלילה - פתרון משולב
        body.style.overflow = 'hidden'; 
        body.style.height = '100vh';
        body.classList.add('modal-open');
    } else {
        overlay.style.display = 'none';
        // שחרור גלילה
        body.style.overflow = ''; 
        body.style.height = '';
        body.classList.remove('modal-open');
    }
}

// גלילה בחיצים
function scrollSlider(id, direction) {
    const slider = document.getElementById(id);
    const scrollAmount = 300; 
    slider.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
    });
}

// רינדור כל המוצרים בדף
function renderProducts() {
    renderCollection('fruits', 'fruits-grid');
    renderCollection('veggies', 'veggies-grid');
    renderCollection('packs', 'packs-grid');
}

// הרצה בטעינת הדף
window.onload = () => {
    renderProducts();
    fetchProducts(); // הצגת המוצרים בסליידרים
    updateUI();       // טעינת העגלה מה-LocalStorage
};
console.log(cart);
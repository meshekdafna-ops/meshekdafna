// 1. מאגר הנתונים
const allProducts = [
    // פירות
    { id: 1, name: "אפרסק עסיסי", price: 12.90, category: "fruits", img: "https://images.unsplash.com/photo-1523520495916-bc16d89552fc?q=80&w=300" },
    { id: 2, name: "ענבים ירוקים", price: 18.00, category: "fruits", img: "https://images.unsplash.com/photo-1537084642907-629340c7e59c?q=80&w=300" },
    { id: 3, name: "מנגו מאיה", price: 15.50, category: "fruits", img: "https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=300" },
    { id: 4, name: "בננה צהובה", price: 6.90, category: "fruits", img: "https://images.unsplash.com/photo-1528825876-01085c292f75?q=80&w=300" },
    
    // ירקות
    { id: 101, name: "עגבנייה מגי", price: 9.90, category: "veggies", img: "https://images.unsplash.com/photo-1546473472-3d7ad6665793?q=80&w=300" },
    { id: 102, name: "מלפפון פריך", price: 7.50, category: "veggies", img: "https://images.unsplash.com/photo-1449333254714-23e0024971c7?q=80&w=300" },
    { id: 103, name: "פלפל אדום", price: 11.00, category: "veggies", img: "https://images.unsplash.com/photo-1563513307168-a405904f666b?q=80&w=300" },
    
    // מארזים
    { id: 201, name: "מארז סלט ישראלי", price: 45.00, category: "packs", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=300" },
    { id: 202, name: "מארז פירות העונה", price: 89.00, category: "packs", img: "https://images.unsplash.com/photo-1610832958506-ee5633817d70?q=80&w=300" }
];

// 2. ניהול העגלה (טעינה ראשונית מהזיכרון)
let cart = JSON.parse(localStorage.getItem('meshek_dafna_cart')) || [];

// פונקציית עזר לשמירה ב-LocalStorage
function saveCart() {
    localStorage.setItem('meshek_dafna_cart', JSON.stringify(cart));
}

// פונקציית הרינדור לקולקציות
function renderCollection(categoryId, targetElementId) {
    const target = document.getElementById(targetElementId);
    if (!target) return;

    const filtered = allProducts.filter(p => p.category === categoryId);
    
    target.innerHTML = filtered.map(product => `
        <div class="product-card">
            <img src="${product.img}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="price">₪${product.price.toFixed(2)}</p>
            <button class="add-btn" onclick="addToCart(${product.id})">הוסף לסל</button>
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
function toggleCart() {
    const modal = document.getElementById('cart-modal');
    const overlay = document.getElementById('cart-overlay');
    
    modal.classList.toggle('open');
    overlay.style.display = (overlay.style.display === 'block') ? 'none' : 'block';
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
    renderProducts(); // הצגת המוצרים בסליידרים
    updateUI();       // טעינת העגלה מה-LocalStorage
};
console.log(cart);
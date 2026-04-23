document.addEventListener('DOMContentLoaded', () => {
    // משיכת העגלה מהלוקאל סטורג' (אותו מפתח שבו השתמשנו בדף הבית)
    const cart = JSON.parse(localStorage.getItem('meshek_dafna_cart')) || [];
    const summaryContainer = document.getElementById('summary-items');
    const finalPriceElement = document.getElementById('final-price');

    if (cart.length === 0) {
        summaryContainer.innerHTML = '<p>העגלה שלך ריקה. חזור לחנות כדי להוסיף מוצרים.</p>';
        document.querySelector('.submit-order-btn').disabled = true;
        document.querySelector('.submit-order-btn').style.opacity = "0.5";
    } else {
        // רינדור המוצרים לסיכום
        summaryContainer.innerHTML = cart.map(item => `
            <div class="summary-item">
                <div class="summary-item-info">
                    <img src="${item.img}" alt="${item.name}">
                    <div>
                        <strong>${item.name}</strong><br>
                        <small>כמות: ${item.quantity}</small>
                    </div>
                </div>
                <span>₪${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');

        // חישוב מחיר סופי
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        finalPriceElement.innerText = `₪${total.toFixed(2)}`;
    }

    // טיפול בשליחת הטופס
    const form = document.getElementById('order-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const orderData = {
            customer: {
                firstName: document.getElementById('first-name').value,
                lastName: document.getElementById('last-name').value,
                phone: document.getElementById('phone').value,
                city: document.getElementById('city').value,
                address: document.getElementById('address').value
            },
            items: cart,
            totalPrice: finalPriceElement.innerText
        };

        console.log('הזמנה מוכנה לשליחה ל-Backend:', orderData);
        alert('תודה ' + orderData.customer.firstName + '! ההזמנה התקבלה (בשלב הבא נחבר את זה ל-Node.js)');
        
        // כאן בהמשך תוכל לנקות את העגלה:
        // localStorage.removeItem('meshek_dafna_cart');
    });
});
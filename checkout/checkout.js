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

    function setLoader(isLoading) {
    const btn = document.querySelector('.submit-order-btn');
    if (isLoading) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> מעבד הזמנה...';
    } else {
        btn.disabled = false;
        btn.innerHTML = 'אישור וסיום הזמנה';
    }
}

   form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setLoader(true);

    const orderData = {
        customer: {
            firstName: document.getElementById('first-name').value,
            lastName: document.getElementById('last-name').value,
            phone: document.getElementById('phone').value,
            city: document.getElementById('city').value,
            address: document.getElementById('address').value
        },
        items: cart
    };

    try {
        const response = await fetch('https://backend-meshekdafna.onrender.com/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();

        if (result.success) {
            // הצלחה - ניקוי עגלה והצגת הודעה
            localStorage.removeItem('meshek_dafna_cart');
            document.querySelector('.checkout-container').innerHTML = `
                <div class="success-message" style="text-align:center; padding: 50px;">
                    <i class="fas fa-check-circle" style="font-size: 50px; color: #4CAF50;"></i>
                    <h2>תודה ${orderData.customer.firstName}!</h2>
                    <p>ההזמנה שלך התקבלה בהצלחה ותגיע אליך בקרוב.</p>
                    <button onclick="window.location.href='../index.html'" class="submit-order-btn">חזרה לחנות</button>
                </div>
            `;
        } else {
            // שגיאת מלאי או שגיאה מהשרת
            alert('שגיאה: ' + result.message);
        }
    } catch (error) {
        console.error('Checkout error:', error);
        alert('קרתה תקלה בחיבור לשרת. נסו שוב בעוד כמה דקות.');
    } finally {
        setLoader(false);
    }
});
});
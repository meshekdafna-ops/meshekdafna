document.addEventListener('DOMContentLoaded', () => {
    // 1. הגדרת המשתנים והאלמנטים מה-HTML
    const cart = JSON.parse(localStorage.getItem('meshek_dafna_cart')) || [];
    const summaryContainer = document.getElementById('summary-items');
    const finalPriceElement = document.getElementById('final-price');
    const form = document.getElementById('order-form'); // <--- זה מה שהיה חסר!

    // 2. בדיקה אם העגלה ריקה
    if (cart.length === 0) {
        summaryContainer.innerHTML = '<p>העגלה שלך ריקה. חזור לחנות כדי להוסיף מוצרים.</p>';
        const submitBtn = document.querySelector('.submit-order-btn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.style.opacity = "0.5";
        }
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

    // פונקציית לואדר
    function setLoader(isLoading) {
        const btn = document.querySelector('.submit-order-btn');
        if (!btn) return;
        if (isLoading) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> מעבד הזמנה...';
        } else {
            btn.disabled = false;
            btn.innerHTML = 'אישור וסיום הזמנה';
        }
    }

    // 3. טיפול בשליחת הטופס (רק אם הוא קיים בדף)
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); // מונע את רענון הדף
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
                // וודא שזו הכתובת הנכונה של השרת שלך ב-Render!
                const response = await fetch('https://backend-meshekdafna.onrender.com/api/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderData)
                });

                const result = await response.json();

                if (result.success) {
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
                    alert('שגיאה: ' + result.message);
                }
            } catch (error) {
                console.error('Checkout error:', error);
                alert('קרתה תקלה בחיבור לשרת. נסו שוב בעוד כמה דקות.');
            } finally {
                setLoader(false);
            }
        });
    }
});
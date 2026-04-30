// =====================
// 🔔 TOAST SYSTEM
// =====================
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
            z-index: 99999; display: flex; flex-direction: column;
            align-items: center; gap: 10px; pointer-events: none;
        `;
        document.body.appendChild(container);
    }

    const colors = {
        success: { bg: '#2E7D32', icon: '✅' },
        error:   { bg: '#C62828', icon: '❌' },
    };
    const { bg, icon } = colors[type] || colors.success;

    const toast = document.createElement('div');
    toast.style.cssText = `
        background: ${bg}; color: white;
        padding: 14px 24px; border-radius: 12px;
        font-family: 'Noto Sans Hebrew', sans-serif;
        font-size: 1rem; font-weight: 600;
        box-shadow: 0 6px 20px rgba(0,0,0,0.2);
        display: flex; align-items: center; gap: 10px;
        direction: rtl; pointer-events: auto;
        animation: toastIn 0.35s ease;
        transition: opacity 0.4s ease;
        min-width: 260px; text-align: center; justify-content: center;
    `;
    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;

    if (!document.getElementById('toast-style')) {
        const style = document.createElement('style');
        style.id = 'toast-style';
        style.textContent = `
            @keyframes toastIn {
                from { opacity: 0; transform: translateY(-16px); }
                to   { opacity: 1; transform: translateY(0); }
            }
            .field-error {
                border: 2px solid #C62828 !important;
                background: #fff5f5 !important;
            }
            .error-msg {
                color: #C62828; font-size: 0.8rem;
                margin: -4px 0 8px; display: block;
                font-family: 'Noto Sans Hebrew', sans-serif;
            }
        `;
        document.head.appendChild(style);
    }

    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

// =====================
// ולידציה inline
// =====================
function setFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.classList.add('field-error');

    const existing = field.parentNode.querySelector('.error-msg');
    if (!existing) {
        const err = document.createElement('span');
        err.className = 'error-msg';
        err.innerText = message;
        field.insertAdjacentElement('afterend', err);
    }

    field.addEventListener('input', () => {
        field.classList.remove('field-error');
        const msg = field.parentNode.querySelector('.error-msg');
        if (msg) msg.remove();
    }, { once: true });
}

function validateForm(data) {
    let valid = true;

    if (!data.firstName.trim()) {
        setFieldError('first-name', 'שדה חובה');
        valid = false;
    }
    if (!data.lastName.trim()) {
        setFieldError('last-name', 'שדה חובה');
        valid = false;
    }
    if (!data.city.trim()) {
        setFieldError('city', 'שדה חובה');
        valid = false;
    }
    if (!data.address.trim()) {
        setFieldError('address', 'שדה חובה');
        valid = false;
    }

    const phoneRegex = /^0[0-9]{8,9}$/;
    if (!phoneRegex.test(data.phone.trim())) {
        setFieldError('phone', 'מספר טלפון לא תקין (לדוג׳: 0501234567)');
        valid = false;
    }

    return valid;
}

// =====================
// לוגיקת Checkout
// =====================
document.addEventListener('DOMContentLoaded', () => {
    const cart = JSON.parse(localStorage.getItem('meshek_dafna_cart')) || [];
    const summaryContainer = document.getElementById('summary-items');
    const finalPriceElement = document.getElementById('final-price');
    const form = document.getElementById('order-form');

    if (cart.length === 0) {
        summaryContainer.innerHTML = '<p>העגלה שלך ריקה. חזור לחנות כדי להוסיף מוצרים.</p>';
        const submitBtn = document.querySelector('.submit-order-btn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.style.opacity = "0.5";
        }
    } else {
        summaryContainer.innerHTML = cart.map(item => `
            <div class="summary-item">
                <div class="summary-item-info">
                    <img src="${item.image || item.img}" alt="${item.name}">
                    <div>
                        <strong>${item.name}</strong><br>
                        <small>כמות: ${item.quantity}</small>
                    </div>
                </div>
                <span>₪${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        finalPriceElement.innerText = `₪${total.toFixed(2)}`;
    }

    function setLoader(isLoading) {
        const btn = document.querySelector('.submit-order-btn');
        if (!btn) return;
        btn.disabled = isLoading;
        btn.innerHTML = isLoading
            ? '<i class="fas fa-spinner fa-spin"></i> מעבד הזמנה...'
            : 'אישור וסיום הזמנה';
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const customerData = {
                firstName: document.getElementById('first-name').value,
                lastName:  document.getElementById('last-name').value,
                phone:     document.getElementById('phone').value,
                city:      document.getElementById('city').value,
                address:   document.getElementById('address').value
            };

            // ולידציה לפני שליחה
            if (!validateForm(customerData)) {
                showToast('יש לתקן את השדות המסומנים', 'error');
                return;
            }

            setLoader(true);

            try {
                const response = await fetch('https://backend-meshekdafna.onrender.com/api/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ customer: customerData, items: cart })
                });

                const result = await response.json();

                if (result.success) {
                    localStorage.removeItem('meshek_dafna_cart');
                    document.querySelector('.checkout-container').innerHTML = `
                        <div style="text-align:center; padding: 60px 20px;">
                            <div style="font-size: 64px; margin-bottom: 16px;">✅</div>
                            <h2 style="color: #2E7D32; font-family: 'Noto Sans Hebrew', sans-serif;">תודה ${customerData.firstName}!</h2>
                            <p style="color: #555; font-family: 'Noto Sans Hebrew', sans-serif; font-size: 1.1rem;">
                                ההזמנה שלך התקבלה בהצלחה ותגיע אליך בקרוב 🌿
                            </p>
                            <button onclick="window.location.href='../index.html'"
                                style="margin-top:24px; background:#2E7D32; color:#fff; border:none; padding:14px 32px; border-radius:10px; font-size:1rem; cursor:pointer; font-family:'Noto Sans Hebrew',sans-serif;">
                                חזרה לחנות
                            </button>
                        </div>
                    `;
                } else {
                    showToast('שגיאה: ' + result.message, 'error');
                }
            } catch (error) {
                console.error('Checkout error:', error);
                showToast('קרתה תקלה בחיבור לשרת. נסו שוב בעוד כמה דקות.', 'error');
            } finally {
                setLoader(false);
            }
        });
    }
});
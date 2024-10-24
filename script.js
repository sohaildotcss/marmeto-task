document.addEventListener('DOMContentLoaded', () => {
    loadCartFromLocalStorage();
    if (!localStorage.getItem('cart')) {
        fetchCartData();
    }
});

async function fetchCartData() {
    const loader = document.createElement('div');
    loader.innerText = 'Loading...';
    loader.style.position = 'fixed';
    loader.style.top = '50%';
    loader.style.left = '50%';
    loader.style.transform = 'translate(-50%, -50%)';
    loader.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    loader.style.padding = '20px';
    loader.style.borderRadius = '5px';
    loader.style.zIndex = '1000';
    document.body.appendChild(loader);

    try {
        const response = await fetch('https://cdn.shopify.com/s/files/1/0883/2188/4479/files/apiCartData.json?v=1728384889');
        const data = await response.json();
        displayCartItems(data.items);
        updateCartTotals(data.items);
        saveCartToLocalStorage(data.items);
    } catch (error) {
        console.error('Error fetching cart data:', error);
    } finally {
        loader.remove();
    }
}

function displayCartItems(items) {
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = ''; // Clear existing items
    items.forEach(item => {
        const itemElement = document.createElement('tr');
        itemElement.classList.add('cart-item');
        itemElement.innerHTML = `
            <td>
                <img src="${item.image}" alt="${item.title}">
                ${item.title}
            </td>
            <td>₹${(item.price / 100).toFixed(2)}</td>
            <td>
                <input type="number" value="${item.quantity}" min="1" onchange="updateSubtotal(this, ${item.price})">
            </td>
            <td class="subtotal">₹${(item.line_price / 100).toFixed(2)}</td>
            <td>
                <button onclick="confirmRemoveItem(this)">🗑️</button>
            </td>
        `;
        cartItemsContainer.appendChild(itemElement);
    });
    updateCartTotals(items);
}

function confirmRemoveItem(button) {
    const itemElement = button.closest('tr');
    const modal = document.getElementById('remove-modal');
    modal.style.display = 'flex';
    document.getElementById('confirm-remove').onclick = () => {
        itemElement.remove();
        modal.style.display = 'none';
        updateCartTotalsFromDOM();
        saveCartToLocalStorage(getCurrentCartItems());
    };
    document.getElementById('cancel-remove').onclick = () => {
        modal.style.display = 'none';
    };
}

function updateCartTotals(items) {
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    const subtotal = items.reduce((total, item) => total + item.line_price, 0);
    subtotalElement.innerText = `₹${(subtotal / 100).toFixed(2)}`;
    totalElement.innerText = `₹${(subtotal / 100).toFixed(2)}`;
}

function updateSubtotal(input, price) {
    const quantity = input.value;
    const subtotalElement = input.closest('tr').querySelector('.subtotal');
    const newSubtotal = (quantity * price) / 100;
    subtotalElement.innerText = `₹${newSubtotal.toFixed(2)}`;
    updateCartTotalsFromDOM();
    saveCartToLocalStorage(getCurrentCartItems());
}

function loadCartFromLocalStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        const items = JSON.parse(savedCart);
        displayCartItems(items);
        updateCartTotals(items);
    }
}

function saveCartToLocalStorage(items) {
    console.log('Saving cart to local storage:', items); // Debug log
    localStorage.setItem('cart', JSON.stringify(items));
}

function getCurrentCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartItems = [];
    cartItemsContainer.querySelectorAll('.cart-item').forEach(itemElement => {
        const image = itemElement.querySelector('img').src;
        const title = itemElement.querySelector('td').innerText.trim();
        const price = parseFloat(itemElement.querySelector('td:nth-child(2)').innerText.replace('₹', '')) * 100;
        const quantity = parseInt(itemElement.querySelector('input').value);
        const line_price = price * quantity;
        cartItems.push({ image, title, price, quantity, line_price });
    });
    console.log('Current cart items:', cartItems); // Debug log
    return cartItems;
}

function updateCartTotalsFromDOM() {
    const items = getCurrentCartItems();
    updateCartTotals(items);
    saveCartToLocalStorage(items);  // Persist updates after changes
}

document.getElementById('checkout-button').addEventListener('click', () => {
    // Show the checkout confirmation modal
    const checkoutModal = document.getElementById('checkout-modal');
    checkoutModal.style.display = 'flex';

    // Close the modal when the close button is clicked
    document.getElementById('close-checkout-modal').onclick = () => {
        checkoutModal.style.display = 'none';
        // Optionally, you can clear the cart or redirect to another page here
    };
});

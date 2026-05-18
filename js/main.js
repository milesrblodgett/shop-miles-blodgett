/* ================================================
   SHOP MILES BLODGETT — Main JS
   Handles product modal, size selection, and Stripe Checkout
   ================================================ */

// ---- Product Data ----
// Add new products to this array as you create new designs.
// Each product needs: id, name, description, price (in dollars), and image slugs.
const PRODUCTS = [
  {
    id: 'make-friends-not-enemies',
    name: 'Make Friends Not Enemies',
    description: 'A clean white tee with a simple message. Wear what you believe in.',
    price: 25,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    frontImage: '/images/make-friends-not-enemies-front.jpg',
    backImage: '/images/make-friends-not-enemies-back.jpg',
  },
  {
    id: 'project-hail-mary',
    name: 'Project Hail Mary',
    description: 'A black tee for the sci-fi faithful. Amaze, amaze, amaze.',
    price: 35,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    frontImage: '/images/project-hail-mary-front.jpg',
    backImage: '/images/project-hail-mary-back.jpg',
  },
  {
    id: 'cloud-kitten',
    name: 'That Cloud Looks Just Like a Kitten',
    description: 'A clean white tee for daydreamers. Out past the break, that cloud looks just like a kitten.',
    price: 30,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    frontImage: '/images/cloud-kitten-front.jpg',
    backImage: '/images/cloud-kitten-back.jpg',
  },
  // To add a new product, copy the object above and change the values.
];

// ---- DOM Elements ----
const modal = document.getElementById('product-modal');
const modalName = document.getElementById('modal-name');
const modalPrice = document.getElementById('modal-price');
const modalDescription = document.getElementById('modal-description');
const modalImgFront = document.getElementById('modal-img-front');
const modalImgBack = document.getElementById('modal-img-back');
const sizeOptions = document.getElementById('size-options');
const sizeError = document.getElementById('size-error');
const buyBtn = document.getElementById('btn-buy');

// Track current state
let selectedProduct = null;
let selectedSize = null;

// ---- Product Card Click → Open Modal ----
document.querySelectorAll('.product-card').forEach(card => {
  card.addEventListener('click', () => {
    const productId = card.dataset.product;
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    openModal(product);
  });
});

function openModal(product) {
  selectedProduct = product;
  selectedSize = null;

  // Fill in modal content
  modalName.textContent = product.name;
  modalPrice.textContent = `$${product.price}`;
  modalDescription.textContent = product.description;
  modalImgFront.src = product.frontImage;
  modalImgFront.alt = `${product.name} - Front`;
  modalImgBack.src = product.backImage;
  modalImgBack.alt = `${product.name} - Back`;
  buyBtn.textContent = `Buy Now — $${product.price}`;

  // Reset image view to front
  modalImgFront.classList.add('modal__img--active');
  modalImgBack.classList.remove('modal__img--active');
  document.querySelectorAll('.modal__img-btn').forEach(btn => {
    btn.classList.toggle('modal__img-btn--active', btn.dataset.view === 'front');
  });

  // Reset size selection
  document.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('selected'));
  sizeError.classList.remove('visible');

  // Show modal
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
  selectedProduct = null;
  selectedSize = null;
}

// ---- Modal Close Events ----
document.querySelector('.modal__close').addEventListener('click', closeModal);
document.querySelector('.modal__backdrop').addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ---- Image Toggle (Front / Back) ----
document.querySelectorAll('.modal__img-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const view = btn.dataset.view;

    // Toggle active image
    modalImgFront.classList.toggle('modal__img--active', view === 'front');
    modalImgBack.classList.toggle('modal__img--active', view === 'back');

    // Toggle active button
    document.querySelectorAll('.modal__img-btn').forEach(b => {
      b.classList.toggle('modal__img-btn--active', b.dataset.view === view);
    });
  });
});

// ---- Size Selection ----
document.querySelectorAll('.size-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    selectedSize = btn.dataset.size;

    // Update selected visual
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');

    // Hide error if it was showing
    sizeError.classList.remove('visible');
  });
});

// ---- Buy Now → Create Stripe Checkout Session ----
buyBtn.addEventListener('click', async () => {
  // Make sure a size is selected
  if (!selectedSize) {
    sizeError.classList.add('visible');
    return;
  }

  if (!selectedProduct) return;

  // Disable button while loading
  buyBtn.disabled = true;
  buyBtn.textContent = 'Loading...';

  try {
    // Call our serverless function to create a Checkout session
    const response = await fetch('/.netlify/functions/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: selectedProduct.id,
        size: selectedSize,
      }),
    });

    const data = await response.json();

    if (data.url) {
      // Redirect to Stripe's hosted checkout page
      window.location.href = data.url;
    } else {
      throw new Error(data.error || 'Something went wrong');
    }
  } catch (err) {
    console.error('Checkout error:', err);
    alert('Something went wrong. Please try again.');
    buyBtn.disabled = false;
    buyBtn.textContent = `Buy Now — $${selectedProduct.price}`;
  }
});

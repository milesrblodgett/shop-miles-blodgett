/* ================================================
   SERVER-SIDE PRODUCT CATALOG — source of truth for pricing.
   The browser only sends a productId + size. The server looks up
   the real price here so a tampered request can't change what
   the customer is charged.

   When you add/edit a product, update this AND the PRODUCTS array
   in /js/main.js (that one is display-only). Keep ids in sync.
   ================================================ */

const PRODUCTS = {
  'make-friends-not-enemies': {
    name: 'Make Friends Not Enemies',
    price: 25,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  'project-hail-mary': {
    name: 'Project Hail Mary',
    price: 35,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  'cloud-kitten': {
    name: 'Chicken Joe',
    price: 30,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
};

module.exports = { PRODUCTS };

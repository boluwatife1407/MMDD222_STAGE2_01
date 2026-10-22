// Sub Sandwich Ordering Application Prototype Logic
// Simple Vanilla JS implementation

const fallbackData = {
  "stores": [
    { "id": 1, "name": "Main Street Branch", "address": "123 Main St, Downtown" },
    { "id": 2, "name": "University Campus Branch", "address": "456 University Ave, Block B" },
    { "id": 3, "name": "Westside Mall Branch", "address": "789 West Mall Blvd, Suite 10" }
  ],
  "premadeSubs": [
    {
      "id": "sub-1",
      "name": "Philly Cheesesteak",
      "category": "Fresh Grilled hot subs",
      "price": 8.99,
      "description": "Thinly sliced steak, melted provolone, grilled onions, and peppers on Italian bread.",
      "defaultIngredients": ["Steak", "Provolone", "Grilled Onions", "Peppers"]
    },
    {
      "id": "sub-2",
      "name": "Chipotle Grilled Chicken",
      "category": "Fresh Grilled hot subs",
      "price": 8.49,
      "description": "Grilled chicken breast, cheddar cheese, lettuce, tomato, and spicy chipotle sauce.",
      "defaultIngredients": ["Grilled Chicken", "Cheddar", "Lettuce", "Tomato", "Chipotle Sauce"]
    },
    {
      "id": "sub-3",
      "name": "Buffalo Hot Chicken Sub",
      "category": "Fresh Grilled hot subs",
      "price": 8.49,
      "description": "Hot buffalo chicken, swiss cheese, pickles, lettuce, and ranch dressing.",
      "defaultIngredients": ["Buffalo Chicken", "Swiss Cheese", "Lettuce", "Pickles", "Ranch"]
    },
    {
      "id": "sub-4",
      "name": "Classic Italian Sub",
      "category": "Classic Subs",
      "price": 7.99,
      "description": "Salami, pepperoni, ham, provolone cheese, lettuce, tomato, oil & vinegar.",
      "defaultIngredients": ["Salami", "Pepperoni", "Ham", "Provolone", "Lettuce", "Tomato", "Oil & Vinegar"]
    },
    {
      "id": "sub-5",
      "name": "Turkey & Bacon Club",
      "category": "Classic Subs",
      "price": 7.99,
      "description": "Oven-roasted turkey, crispy bacon, cheddar, lettuce, tomato, and mayo.",
      "defaultIngredients": ["Turkey", "Bacon", "Cheddar", "Lettuce", "Tomato", "Mayo"]
    },
    {
      "id": "sub-6",
      "name": "Veggie Delight",
      "category": "Classic Subs",
      "price": 6.99,
      "description": "Fresh lettuce, tomatoes, cucumbers, green peppers, onions, swiss cheese, and honey mustard.",
      "defaultIngredients": ["Lettuce", "Tomato", "Cucumber", "Green Peppers", "Onion", "Swiss", "Honey Mustard"]
    }
  ],
  "customOptions": {
    "breads": [
      { "name": "White Italian", "price": 0.00 },
      { "name": "9-Grain Wheat", "price": 0.00 },
      { "name": "Italian Herb & Cheese", "price": 0.50 }
    ],
    "sizes": [
      { "name": "6-inch Sub", "priceMultiplier": 1.0 },
      { "name": "12-inch Footlong", "priceMultiplier": 1.6 }
    ],
    "proteins": [
      { "name": "Grilled Steak", "price": 4.00 },
      { "name": "Grilled Chicken", "price": 3.50 },
      { "name": "Turkey Breast", "price": 3.00 },
      { "name": "Ham & Salami", "price": 3.00 },
      { "name": "Plant-Based Patty", "price": 3.50 }
    ],
    "cheeses": [
      { "name": "Provolone", "price": 0.50 },
      { "name": "Cheddar", "price": 0.50 },
      { "name": "Swiss", "price": 0.50 },
      { "name": "American Cheese", "price": 0.50 },
      { "name": "No Cheese", "price": 0.00 }
    ],
    "veggies": [
      "Lettuce", "Tomatoes", "Cucumbers", "Pickles", 
      "Green Peppers", "Red Onions", "Jalapenos", "Black Olives"
    ],
    "sauces": [
      "Mayonnaise", "Yellow Mustard", "Honey Mustard", 
      "Chipotle Southwest", "Ranch", "Oil & Vinegar", "BBQ Sauce"
    ]
  }
};

const app = {
  data: null,
  orderState: {
    userType: 'guest', // 'signedIn' or 'guest'
    fulfillment: 'Delivery',
    address: '',
    store: '',
    cart: []
  },
  currentCustomizingSub: null,

  init: function() {
    // Attempt to fetch local JSON, fallback to embedded object if CORS/file protocol restricts fetch
    fetch('data.json')
      .then(res => res.json())
      .then(json => {
        this.data = json;
        this.populateStoreSelect();
        this.renderPremadeSubs('all');
      })
      .catch(() => {
        // Fallback for file:// direct opening
        this.data = fallbackData;
        this.populateStoreSelect();
        this.renderPremadeSubs('all');
      });
  },

  // Screen Navigation Helper
  showScreen: function(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) target.classList.add('active');

    // Update Header Bar Visibility
    const infoBar = document.getElementById('order-info-bar');
    const cartBtn = document.getElementById('view-cart-btn');

    if (screenId !== 'start-screen' && screenId !== 'signin-screen' && screenId !== 'guest-address-screen') {
      infoBar.classList.remove('hidden');
      cartBtn.classList.remove('hidden');
      this.updateHeaderBar();
    } else {
      infoBar.classList.add('hidden');
      cartBtn.classList.add('hidden');
    }

    if (screenId === 'payment-screen') {
      this.renderCart();
    }
  },

  updateHeaderBar: function() {
    document.getElementById('info-mode').textContent = this.orderState.fulfillment;
    document.getElementById('info-address').textContent = this.orderState.address || 'No Address Set';
    document.getElementById('info-store').textContent = this.orderState.store || 'Main Branch';
    document.getElementById('cart-count').textContent = this.orderState.cart.length;
  },

  populateStoreSelect: function() {
    const select = document.getElementById('store-select');
    if (!select || !this.data) return;
    select.innerHTML = '';
    this.data.stores.forEach(store => {
      const opt = document.createElement('option');
      opt.value = store.name;
      opt.textContent = `${store.name} (${store.address})`;
      select.appendChild(opt);
    });
  },

  // Signed In User Flow
  handleSignIn: function(e) {
    e.preventDefault();
    this.orderState.userType = 'signedIn';
    this.orderState.address = document.getElementById('user-default-address').value;
    this.orderState.store = document.getElementById('user-default-store').value;
    this.showScreen('user-setup-screen');
  },

  confirmUserSetup: function() {
    const selectedMode = document.querySelector('input[name="user-fulfillment"]:checked').value;
    this.orderState.fulfillment = selectedMode;
    this.showScreen('main-menu-screen');
  },

  // Guest Flow
  handleGuestAddress: function(e) {
    e.preventDefault();
    const addr = document.getElementById('guest-address').value;
    this.orderState.address = addr;
    this.showScreen('guest-store-screen');
  },

  handleGuestStore: function(e) {
    e.preventDefault();
    const mode = document.querySelector('input[name="guest-fulfillment"]:checked').value;
    const store = document.getElementById('store-select').value;
    this.orderState.fulfillment = mode;
    this.orderState.store = store;
    this.showScreen('main-menu-screen');
  },

  // Helper to generate SVG images for sub cards
  getSubSvgImage: function(subName, category) {
    const isHot = category.toLowerCase().includes('hot') || subName.toLowerCase().includes('steak') || subName.toLowerCase().includes('chicken');
    const meatColor = isHot ? '#8C4332' : '#c55d4c';
    const breadColor = isHot ? '#e5a960' : '#dcb378';
    
    return `
      <svg viewBox="0 0 240 120" width="100%" height="100" style="border-radius: 4px;">
        <rect width="100%" height="100%" fill="#f1f5f9"/>
        <!-- Bottom Bread Roll -->
        <path d="M 30 75 Q 120 95 210 75 Q 215 90 200 95 Q 120 105 40 95 Q 25 90 30 75 Z" fill="${breadColor}" stroke="#a3661f" stroke-width="2"/>
        
        <!-- Meat / Protein Layer -->
        <path d="M 35 68 C 70 55, 110 75, 150 60 C 180 70, 195 62, 205 68 Q 200 78 190 76 Q 120 85 40 76 Z" fill="${meatColor}"/>
        
        <!-- Melted Cheese Layer -->
        <path d="M 40 64 Q 60 72 80 64 Q 120 74 160 62 Q 180 70 200 64 L 195 70 Q 120 78 45 70 Z" fill="#f59e0b"/>
        
        <!-- Lettuce / Veggies -->
        <path d="M 30 60 Q 50 50 70 62 Q 90 52 110 60 Q 130 52 150 62 Q 170 52 190 60 Q 210 55 210 65 Q 120 75 30 65 Z" fill="#10b981"/>
        
        <!-- Tomatoes -->
        <circle cx="70" cy="56" r="8" fill="#D94436"/>
        <circle cx="120" cy="54" r="8" fill="#D94436"/>
        <circle cx="170" cy="56" r="8" fill="#D94436"/>
        
        <!-- Top Bread Roll -->
        <path d="M 25 58 Q 120 20 215 58 Q 220 48 200 40 Q 120 15 40 40 Q 20 48 25 58 Z" fill="${breadColor}" stroke="#a3661f" stroke-width="2"/>
        <!-- Sesame Seeds -->
        <circle cx="80" cy="36" r="1.5" fill="#fff"/>
        <circle cx="120" cy="30" r="1.5" fill="#fff"/>
        <circle cx="160" cy="34" r="1.5" fill="#fff"/>
      </svg>
    `;
  },

  // Main Menu & Filtering
  renderPremadeSubs: function(categoryFilter) {
    const container = document.getElementById('subs-grid');
    if (!container || !this.data) return;

    container.innerHTML = '';
    const filtered = categoryFilter === 'all' 
      ? this.data.premadeSubs 
      : this.data.premadeSubs.filter(s => s.category.toLowerCase() === categoryFilter.toLowerCase());

    filtered.forEach(sub => {
      const card = document.createElement('div');
      card.className = 'sub-card';
      card.innerHTML = `
        <div class="sub-image-container">${this.getSubSvgImage(sub.name, sub.category)}</div>
        <div class="sub-title">${sub.name}</div>
        <div class="sub-category-tag">${sub.category}</div>
        <div class="sub-description">${sub.description}</div>
        <div class="sub-footer">
          <span class="sub-price">$${sub.price.toFixed(2)}</span>
          <button class="btn btn-secondary" onclick="app.openCustomizePremade('${sub.id}')">Select & Customize</button>
        </div>
      `;
      container.appendChild(card);
    });
  },

  filterCategory: function(category) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target && event.target.classList) {
      event.target.classList.add('active');
    }
    this.renderPremadeSubs(category);
  },

  navigateToMenu: function(category) {
    this.showScreen('main-menu-screen');
    this.renderPremadeSubs(category);
    // highlight corresponding tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
      if ((category === 'all' && btn.textContent.includes('All')) ||
          (category !== 'all' && btn.textContent.toLowerCase().includes(category.toLowerCase()))) {
        btn.classList.add('active');
      }
    });
  },

  // Live Visual Sandwich Layer Stack Preview Update
  updateLivePreview: function() {
    const stack = document.getElementById('sandwich-stack');
    const pills = document.getElementById('ingredient-pills-list');
    if (!stack || !pills) return;

    let bread = "White Italian";
    let protein = "";
    let cheese = "";
    let veggies = [];
    let sauces = [];

    if (!this.currentCustomizingSub.isCustom) {
      const checkedIng = Array.from(document.querySelectorAll('input[name="cust-ingredients"]:checked')).map(i => i.value);
      const extraSauces = Array.from(document.querySelectorAll('input[name="cust-extra-sauces"]:checked')).map(s => s.value);
      
      // Categorize checked ingredients
      checkedIng.forEach(ing => {
        const lower = ing.toLowerCase();
        if (lower.includes('steak') || lower.includes('chicken') || lower.includes('ham') || lower.includes('turkey') || lower.includes('salami') || lower.includes('pepperoni') || lower.includes('bacon')) {
          protein = ing;
        } else if (lower.includes('provolone') || lower.includes('cheddar') || lower.includes('swiss') || lower.includes('cheese')) {
          cheese = ing;
        } else {
          veggies.push(ing);
        }
      });
      sauces = extraSauces;
    } else {
      const breadSelect = document.getElementById('cust-bread');
      const proteinSelect = document.getElementById('cust-protein');
      const cheeseSelect = document.getElementById('cust-cheese');
      
      if (breadSelect) bread = breadSelect.value;
      if (proteinSelect) protein = proteinSelect.value;
      if (cheeseSelect) cheese = cheeseSelect.value;

      veggies = Array.from(document.querySelectorAll('input[name="cust-custom-veggie"]:checked')).map(v => v.value);
      sauces = Array.from(document.querySelectorAll('input[name="cust-custom-sauce"]:checked')).map(s => s.value);
    }

    // Build Sandwich Visual Layers (Top to Bottom)
    let layersHtml = `<div class="layer layer-bread-top">🍞 Top Roll (${bread})</div>`;
    
    if (sauces.length > 0) {
      layersHtml += `<div class="layer layer-sauce">🥣 ${sauces.join(', ')}</div>`;
    }
    if (veggies.length > 0) {
      layersHtml += `<div class="layer layer-veggie">🥗 ${veggies.join(', ')}</div>`;
    }
    if (cheese && !cheese.toLowerCase().includes('no cheese')) {
      layersHtml += `<div class="layer layer-cheese">🧀 ${cheese}</div>`;
    }
    if (protein) {
      layersHtml += `<div class="layer layer-protein">🥩 ${protein}</div>`;
    }

    layersHtml += `<div class="layer layer-bread-bottom">🍞 Bottom Roll</div>`;

    stack.innerHTML = layersHtml;

    // Active Pills List
    const allActive = [bread, protein, cheese, ...veggies, ...sauces].filter(x => x && !x.toLowerCase().includes('no cheese'));
    pills.innerHTML = allActive.map(ing => `<span class="ingredient-pill">+ ${ing}</span>`).join('');

    this.updateCustomizePrice();
  },

  // Customize Premade Sub
  openCustomizePremade: function(subId) {
    const sub = this.data.premadeSubs.find(s => s.id === subId);
    if (!sub) return;

    this.currentCustomizingSub = {
      isCustom: false,
      baseId: sub.id,
      name: sub.name,
      basePrice: sub.price
    };

    document.getElementById('customize-title').textContent = `Customize: ${sub.name}`;
    
    const fieldsContainer = document.getElementById('customize-fields');
    fieldsContainer.innerHTML = `
      <div class="form-group">
        <label>Select Size</label>
        <div class="radio-group">
          <label><input type="radio" name="cust-size" value="6-inch Sub" data-multiplier="1.0" checked onchange="app.updateLivePreview()"> 6-inch Sub ($${sub.price.toFixed(2)})</label>
          <label><input type="radio" name="cust-size" value="12-inch Footlong" data-multiplier="1.6" onchange="app.updateLivePreview()"> 12-inch Footlong ($${(sub.price * 1.6).toFixed(2)})</label>
        </div>
      </div>

      <div class="form-group">
        <label>Toasted Preference</label>
        <div class="radio-group">
          <label><input type="radio" name="cust-toast" value="Toasted" checked> Toasted Hot</label>
          <label><input type="radio" name="cust-toast" value="Not Toasted"> Cold / Not Toasted</label>
        </div>
      </div>

      <div class="form-group">
        <label>Included Ingredients (Uncheck to remove):</label>
        <div class="checkbox-grid">
          ${sub.defaultIngredients.map(ing => `
            <label class="checkbox-label">
              <input type="checkbox" name="cust-ingredients" value="${ing}" checked onchange="app.updateLivePreview()"> ${ing}
            </label>
          `).join('')}
        </div>
      </div>

      <div class="form-group">
        <label>Add Extra Sauces:</label>
        <div class="checkbox-grid">
          ${this.data.customOptions.sauces.map(sauce => `
            <label class="checkbox-label">
              <input type="checkbox" name="cust-extra-sauces" value="${sauce}" onchange="app.updateLivePreview()"> ${sauce}
            </label>
          `).join('')}
        </div>
      </div>
    `;

    this.showScreen('customize-screen');
    this.updateLivePreview();
  },

  // Build Your Own Custom Sub Option
  openCustomBuilder: function() {
    this.currentCustomizingSub = {
      isCustom: true,
      name: "Custom Sub",
      basePrice: 0.00
    };

    document.getElementById('customize-title').textContent = "Build Your Own Custom Sub";
    const fieldsContainer = document.getElementById('customize-fields');

    const opts = this.data.customOptions;

    fieldsContainer.innerHTML = `
      <div class="form-group">
        <label>1. Choose Bread</label>
        <select id="cust-bread" onchange="app.updateLivePreview()">
          ${opts.breads.map(b => `<option value="${b.name}" data-price="${b.price}">${b.name} ${b.price > 0 ? '(+$' + b.price.toFixed(2) + ')' : ''}</option>`).join('')}
        </select>
      </div>

      <div class="form-group">
        <label>2. Choose Size</label>
        <div class="radio-group">
          ${opts.sizes.map((s, idx) => `
            <label>
              <input type="radio" name="cust-custom-size" value="${s.name}" data-multiplier="${s.priceMultiplier}" ${idx === 0 ? 'checked' : ''} onchange="app.updateLivePreview()">
              ${s.name}
            </label>
          `).join('')}
        </div>
      </div>

      <div class="form-group">
        <label>3. Choose Protein / Meat</label>
        <select id="cust-protein" onchange="app.updateLivePreview()">
          ${opts.proteins.map(p => `<option value="${p.name}" data-price="${p.price}">${p.name} (+$${p.price.toFixed(2)})</option>`).join('')}
        </select>
      </div>

      <div class="form-group">
        <label>4. Choose Cheese</label>
        <select id="cust-cheese" onchange="app.updateLivePreview()">
          ${opts.cheeses.map(c => `<option value="${c.name}" data-price="${c.price}">${c.name} ${c.price > 0 ? '(+$' + c.price.toFixed(2) + ')' : ''}</option>`).join('')}
        </select>
      </div>

      <div class="form-group">
        <label>5. Choose Fresh Veggies</label>
        <div class="checkbox-grid">
          ${opts.veggies.map(v => `
            <label class="checkbox-label">
              <input type="checkbox" name="cust-custom-veggie" value="${v}" onchange="app.updateLivePreview()"> ${v}
            </label>
          `).join('')}
        </div>
      </div>

      <div class="form-group">
        <label>6. Choose Sauces & Dressings</label>
        <div class="checkbox-grid">
          ${opts.sauces.map(s => `
            <label class="checkbox-label">
              <input type="checkbox" name="cust-custom-sauce" value="${s}" onchange="app.updateLivePreview()"> ${s}
            </label>
          `).join('')}
        </div>
      </div>

      <div class="form-group">
        <label>Toasted Preference</label>
        <div class="radio-group">
          <label><input type="radio" name="cust-toast" value="Toasted" checked> Toasted Hot</label>
          <label><input type="radio" name="cust-toast" value="Not Toasted"> Cold / Not Toasted</label>
        </div>
      </div>
    `;

    this.showScreen('customize-screen');
    this.updateLivePreview();
  },

  // Live Price Calculator
  updateCustomizePrice: function() {
    let finalPrice = 0;

    if (!this.currentCustomizingSub.isCustom) {
      const selectedSize = document.querySelector('input[name="cust-size"]:checked');
      const mult = selectedSize ? parseFloat(selectedSize.dataset.multiplier) : 1.0;
      finalPrice = this.currentCustomizingSub.basePrice * mult;
    } else {
      const breadSelect = document.getElementById('cust-bread');
      const proteinSelect = document.getElementById('cust-protein');
      const cheeseSelect = document.getElementById('cust-cheese');
      const sizeRadio = document.querySelector('input[name="cust-custom-size"]:checked');

      const breadPrice = breadSelect ? parseFloat(breadSelect.options[breadSelect.selectedIndex].dataset.price || 0) : 0;
      const proteinPrice = proteinSelect ? parseFloat(proteinSelect.options[proteinSelect.selectedIndex].dataset.price || 0) : 0;
      const cheesePrice = cheeseSelect ? parseFloat(cheeseSelect.options[cheeseSelect.selectedIndex].dataset.price || 0) : 0;
      const mult = sizeRadio ? parseFloat(sizeRadio.dataset.multiplier) : 1.0;

      finalPrice = (breadPrice + proteinPrice + cheesePrice) * mult;
    }

    this.currentCustomizingSub.calculatedPrice = finalPrice;
    document.getElementById('custom-item-price').textContent = `$${finalPrice.toFixed(2)}`;
  },

  // Add Item to Cart
  handleAddToCart: function(e) {
    e.preventDefault();
    let details = '';

    if (!this.currentCustomizingSub.isCustom) {
      const size = document.querySelector('input[name="cust-size"]:checked').value;
      const toast = document.querySelector('input[name="cust-toast"]:checked').value;
      const ingList = Array.from(document.querySelectorAll('input[name="cust-ingredients"]:checked')).map(i => i.value);
      const extraSauces = Array.from(document.querySelectorAll('input[name="cust-extra-sauces"]:checked')).map(s => s.value);
      const notes = document.getElementById('special-instructions').value;

      details = `${size}, ${toast}. Ingredients: ${ingList.join(', ') || 'None'}. ${extraSauces.length ? 'Extra Sauces: ' + extraSauces.join(', ') : ''} ${notes ? '(' + notes + ')' : ''}`;
    } else {
      const bread = document.getElementById('cust-bread').value;
      const size = document.querySelector('input[name="cust-custom-size"]:checked').value;
      const protein = document.getElementById('cust-protein').value;
      const cheese = document.getElementById('cust-cheese').value;
      const veggies = Array.from(document.querySelectorAll('input[name="cust-custom-veggie"]:checked')).map(v => v.value);
      const sauces = Array.from(document.querySelectorAll('input[name="cust-custom-sauce"]:checked')).map(s => s.value);
      const toast = document.querySelector('input[name="cust-toast"]:checked').value;
      const notes = document.getElementById('special-instructions').value;

      details = `${size}, ${bread}, ${protein}, ${cheese}, ${toast}. Veggies: ${veggies.join(', ') || 'None'}. Sauces: ${sauces.join(', ') || 'None'}. ${notes ? '(' + notes + ')' : ''}`;
    }

    this.orderState.cart.push({
      name: this.currentCustomizingSub.name,
      price: this.currentCustomizingSub.calculatedPrice,
      details: details
    });

    this.updateHeaderBar();
    this.showScreen('main-menu-screen');
  },

  // Render Cart Screen
  renderCart: function() {
    const listContainer = document.getElementById('cart-items-list');
    if (!listContainer) return;

    if (this.orderState.cart.length === 0) {
      listContainer.innerHTML = '<p style="color:#666;">Your cart is empty. Please select a sub from the menu.</p>';
      document.getElementById('cart-subtotal').textContent = '$0.00';
      document.getElementById('cart-tax').textContent = '$0.00';
      document.getElementById('cart-total').textContent = '$0.00';
      document.getElementById('pay-submit-btn').disabled = true;
      return;
    }

    document.getElementById('pay-submit-btn').disabled = false;
    listContainer.innerHTML = '';
    let subtotal = 0;

    this.orderState.cart.forEach((item, index) => {
      subtotal += item.price;
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <div>
          <strong>${item.name}</strong>
          <div class="cart-item-details">${item.details}</div>
        </div>
        <div style="text-align:right;">
          <strong>$${item.price.toFixed(2)}</strong><br>
          <button class="btn-link" style="color:#e53e3e; font-size:0.8rem;" onclick="app.removeFromCart(${index})">Remove</button>
        </div>
      `;
      listContainer.appendChild(div);
    });

    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    document.getElementById('cart-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('cart-tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;
  },

  removeFromCart: function(index) {
    this.orderState.cart.splice(index, 1);
    this.updateHeaderBar();
    this.renderCart();
  },

  // Handle Order Payment
  handlePayment: function(e) {
    e.preventDefault();
    if (this.orderState.cart.length === 0) return;

    const subtotal = this.orderState.cart.reduce((sum, item) => sum + item.price, 0);
    const total = subtotal * 1.08;

    document.getElementById('summary-order-id').textContent = '#SUB-' + Math.floor(1000 + Math.random() * 9000);
    document.getElementById('summary-mode').textContent = this.orderState.fulfillment;
    document.getElementById('summary-location').textContent = this.orderState.fulfillment === 'Delivery' ? this.orderState.address : this.orderState.store;
    
    const summaryItems = document.getElementById('summary-items-list');
    summaryItems.innerHTML = '';
    this.orderState.cart.forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.name} ($${item.price.toFixed(2)}) - ${item.details}`;
      summaryItems.appendChild(li);
    });

    document.getElementById('summary-total').textContent = `$${total.toFixed(2)}`;

    this.showScreen('order-screen');
  },

  // Reset Order
  resetOrder: function() {
    this.orderState = {
      userType: 'guest',
      fulfillment: 'Delivery',
      address: '',
      store: '',
      cart: []
    };
    this.updateHeaderBar();
    this.showScreen('start-screen');
  }
};

document.addEventListener('DOMContentLoaded', () => app.init());

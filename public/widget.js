/**
 * Agalaz Virtual Try-On Widget
 *
 * Usage:
 *   <script src="https://your-app.vercel.app/widget.js" data-api-key="agz_live_..."></script>
 *   <div id="agalaz-tryon" data-garment="https://example.com/product.jpg"></div>
 *
 * If data-garment is not set, the widget auto-detects the main product image.
 */
(function () {
  'use strict';

  var currentScript = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.indexOf('widget.js') !== -1) return scripts[i];
    }
    return scripts[scripts.length - 1];
  })();
  var apiKey = currentScript.getAttribute('data-api-key') || '';
  var baseUrl = currentScript.src.replace(/\/widget\.js.*$/, '');

  if (!apiKey) {
    console.warn('[Agalaz] Missing data-api-key attribute on script tag.');
    return;
  }

  var lang = document.documentElement.lang === 'es' ? 'es' : 'en';
  var BUTTON_TEXT = lang === 'es' ? 'Pruébatela con IA' : 'Try it on with AI';
  var MODAL_ID = 'agalaz-modal-overlay';

  // Styles
  var style = document.createElement('style');
  style.textContent = [
    '.agalaz-btn {',
    '  display: flex; align-items: center; justify-content: center; gap: 8px;',
    '  width: 100%; padding: 14px 24px; border: none; border-radius: 10px;',
    '  background: #4f46e5; color: white; cursor: pointer;',
    '  font-family: inherit;',
    '  font-size: 14px; font-weight: 800; letter-spacing: 0.05em;',
    '  transition: background 0.2s, transform 0.1s;',
    '  box-sizing: border-box;',
    '}',
    '.agalaz-btn:hover { background: #4338ca; transform: translateY(-1px); }',
    '.agalaz-btn:active { transform: translateY(0); }',
    '.agalaz-btn svg { width: 18px; height: 18px; }',
    '#' + MODAL_ID + ' {',
    '  position: fixed; inset: 0; z-index: 999999;',
    '  background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);',
    '  display: flex; align-items: center; justify-content: center;',
    '  animation: agalazFadeIn 0.2s ease;',
    '}',
    '#' + MODAL_ID + ' .agalaz-modal {',
    '  background: white; border-radius: 16px; overflow: hidden;',
    '  width: 90vw; max-width: 420px; height: 85vh; max-height: 750px;',
    '  box-shadow: 0 25px 50px rgba(0,0,0,0.25);',
    '  animation: agalazSlideUp 0.3s ease;',
    '}',
    '#' + MODAL_ID + ' iframe {',
    '  width: 100%; height: 100%; border: none;',
    '}',
    '@keyframes agalazFadeIn { from { opacity: 0; } to { opacity: 1; } }',
    '@keyframes agalazSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }',
  ].join('\n');
  document.head.appendChild(style);

  var sparklesSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>';

  function detectProductImage() {
    var selectors = [
      // Shopify
      '.product__media img',
      '.product-featured-media img',
      '[data-product-featured-image]',
      '.product-single__photo img',
      '.product__main-photos img',
      '.product-gallery__image img',
      '.product__image-wrapper img',
      '[data-product-image]',
      '.featured-image',
      // WooCommerce
      '.woocommerce-product-gallery__image img',
      '.woocommerce-main-image img',
      '.wp-post-image',
      // Generic
      '[data-main-image]',
      '.product-image-main img',
      '.product-detail-image img',
      '.pdp-image img',
      '.gallery-image--active img',
      '.product-photo-container img',
    ];

    for (var i = 0; i < selectors.length; i++) {
      var img = document.querySelector(selectors[i]);
      if (img) {
        var src = img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-zoom-image') || '';
        if (src && src.length > 10) return src;
      }
    }

    var productArea = document.querySelector('.product, [data-product], .product-detail, #product, main');
    if (productArea) {
      var imgs = productArea.querySelectorAll('img');
      var best = null;
      var bestSize = 0;
      for (var j = 0; j < imgs.length; j++) {
        var w = imgs[j].naturalWidth || imgs[j].width || 0;
        var h = imgs[j].naturalHeight || imgs[j].height || 0;
        var size = w * h;
        if (size > bestSize && size > 10000) {
          bestSize = size;
          best = imgs[j];
        }
      }
      if (best) {
        var bestSrc = best.getAttribute('src') || best.getAttribute('data-src') || '';
        if (bestSrc) return bestSrc;
      }
    }

    return '';
  }

  function resolveUrl(rawUrl) {
    if (!rawUrl) return '';
    if (rawUrl.indexOf('http') === 0) return rawUrl;
    if (rawUrl.indexOf('//') === 0) return window.location.protocol + rawUrl;
    try {
      return new URL(rawUrl, window.location.href).href;
    } catch (e) {
      return window.location.origin + (rawUrl.charAt(0) === '/' ? '' : '/') + rawUrl;
    }
  }

  function extractProductVariants() {
    var sizes = [];
    var colors = [];

    // Try Shopify JSON
    var scripts = document.querySelectorAll('script[type="application/json"]');
    for (var i = 0; i < scripts.length; i++) {
      try {
        var json = JSON.parse(scripts[i].textContent || '');
        var variants = json.variants || (json.product && json.product.variants);
        if (variants && variants.length) {
          for (var v = 0; v < variants.length; v++) {
            var opt1 = (variants[v].option1 || '').trim();
            var opt2 = (variants[v].option2 || '').trim();
            var opt3 = (variants[v].option3 || '').trim();
            [opt1, opt2, opt3].forEach(function (val) {
              if (!val) return;
              if (/^(XXS|XS|S|M|L|XL|XXL|2XL|3XL|4XL|5XL|\d{2,3})$/i.test(val)) {
                if (sizes.indexOf(val) === -1) sizes.push(val);
              } else if (sizes.indexOf(val) === -1 && val.length < 20) {
                if (colors.indexOf(val) === -1) colors.push(val);
              }
            });
          }
          break;
        }
      } catch (e) { /* skip */ }
    }

    // Fallback: read from variant selectors on the page
    if (sizes.length === 0 && colors.length === 0) {
      var selects = document.querySelectorAll('select[name*="option"], .product-form__input select, .variant-input select');
      selects.forEach(function (sel) {
        var opts = sel.querySelectorAll('option');
        opts.forEach(function (o) {
          var val = o.textContent.trim();
          if (!val || val === '--') return;
          if (/^(XXS|XS|S|M|L|XL|XXL|2XL|3XL|4XL|5XL|\d{2,3})$/i.test(val)) {
            if (sizes.indexOf(val) === -1) sizes.push(val);
          }
        });
      });

      // Swatch buttons
      var swatches = document.querySelectorAll('[data-option-value], .swatch__button, .color-swatch');
      swatches.forEach(function (s) {
        var val = (s.getAttribute('data-option-value') || s.getAttribute('title') || s.textContent || '').trim();
        if (!val) return;
        if (/^(XXS|XS|S|M|L|XL|XXL|2XL|3XL|4XL|5XL|\d{2,3})$/i.test(val)) {
          if (sizes.indexOf(val) === -1) sizes.push(val);
        } else if (val.length < 20) {
          if (colors.indexOf(val) === -1) colors.push(val);
        }
      });
    }

    return { sizes: sizes, colors: colors };
  }

  function detectProductId() {
    var scripts = document.querySelectorAll('script[type="application/json"]');
    for (var i = 0; i < scripts.length; i++) {
      try {
        var json = JSON.parse(scripts[i].textContent || '');
        var id = json.id || (json.product && json.product.id);
        if (id) return String(id).replace(/[^0-9]/g, '');
      } catch (e) { /* skip */ }
    }
    var meta = document.querySelector('meta[property="product:retailer_item_id"], meta[name="product:id"]');
    if (meta) {
      var mval = meta.getAttribute('content');
      if (mval) return String(mval).replace(/[^0-9]/g, '');
    }
    return '';
  }

  function openModal(garmentUrl, productId) {
    if (document.getElementById(MODAL_ID)) return;

    var variants = extractProductVariants();
    var params = 'key=' + encodeURIComponent(apiKey) + '&lang=' + lang;
    if (garmentUrl) params += '&garment=' + encodeURIComponent(garmentUrl);
    if (variants.sizes.length) params += '&sizes=' + encodeURIComponent(variants.sizes.join(','));
    if (variants.colors.length) params += '&colors=' + encodeURIComponent(variants.colors.join(','));
    if (productId) params += '&productId=' + encodeURIComponent(productId);

    var overlay = document.createElement('div');
    overlay.id = MODAL_ID;

    var modal = document.createElement('div');
    modal.className = 'agalaz-modal';

    var iframe = document.createElement('iframe');
    iframe.src = baseUrl + '/embed?' + params;
    iframe.allow = 'camera';

    modal.appendChild(iframe);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', handleEscape);
  }

  function closeModal() {
    var overlay = document.getElementById(MODAL_ID);
    if (overlay) overlay.remove();
    document.removeEventListener('keydown', handleEscape);
  }

  function handleEscape(e) {
    if (e.key === 'Escape') closeModal();
  }

  window.addEventListener('message', function (e) {
    if (!e.data || !e.data.type) return;
    if (e.data.type === 'agalaz:close') closeModal();
  });

  function createButton(container) {
    if (container.getAttribute('data-agalaz-init')) return;
    container.setAttribute('data-agalaz-init', 'true');

    var btn = document.createElement('button');
    btn.className = 'agalaz-btn';
    btn.innerHTML = sparklesSvg + ' ' + BUTTON_TEXT;
    btn.addEventListener('click', function () {
      var rawGarment = container.getAttribute('data-garment') || '';
      var garmentUrl = resolveUrl(rawGarment);
      if (!garmentUrl) garmentUrl = resolveUrl(detectProductImage());
      var productId = (container.getAttribute('data-product-id') || '').replace(/[^0-9]/g, '');
      if (!productId) productId = detectProductId();
      openModal(garmentUrl, productId);
    });

    container.appendChild(btn);
  }

  function isProductPage() {
    var path = window.location.pathname;
    return /\/products\//.test(path) || /\/producto\//.test(path);
  }

  function autoInjectButton() {
    if (!isProductPage()) return;
    if (document.querySelector('#agalaz-tryon, [data-agalaz-tryon]')) return;

    // Find the best place to inject: after add-to-cart button or buy buttons
    var targets = [
      '.product-form__buttons',
      '.product-form',
      '[data-product-form]',
      '.product__info-container',
      '.product-single__meta',
      '.product__submit',
      'form[action*="/cart/add"]',
      '.botones-de-compra',
      '.buy-buttons',
    ];

    var target = null;
    for (var i = 0; i < targets.length; i++) {
      target = document.querySelector(targets[i]);
      if (target) break;
    }

    if (!target) {
      // Fallback: find the add to cart button and inject after its parent
      var addToCart = document.querySelector('[name="add"], .add-to-cart, .product-form__submit, button[type="submit"][name="add"]');
      if (addToCart) target = addToCart.closest('form') || addToCart.parentElement;
    }

    if (target) {
      var container = document.createElement('div');
      container.id = 'agalaz-tryon';
      container.style.cssText = 'margin: 10px 0; width: 100%;';
      target.parentNode.insertBefore(container, target.nextSibling);
    }
  }

  function init() {
    autoInjectButton();

    var containers = document.querySelectorAll('#agalaz-tryon, [data-agalaz-tryon]');
    containers.forEach(function (container) {
      createButton(container);
    });
  }

  function startObserver() {
    if (typeof MutationObserver !== 'undefined' && document.body) {
      var observer = new MutationObserver(function () {
        var uninit = document.querySelectorAll('#agalaz-tryon:not([data-agalaz-init]), [data-agalaz-tryon]:not([data-agalaz-init])');
        if (uninit.length > 0) init();
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  function bootstrap() {
    init();
    startObserver();
    setTimeout(init, 500);
    setTimeout(init, 1500);
    setTimeout(init, 3000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();

/* ==========================================================================
   ANCYA — Cookie banner + Google Consent Mode v2
   Shared by index.html and all legal pages.
   The GA4 tag + consent defaults live inline in each page's <head> (they must
   fire before the page view). This file handles the banner UI and pushes the
   visitor's choice to gtag('consent', 'update', …) after the DOM is ready.
   ========================================================================== */
(function () {
  'use strict';

  var banner  = document.getElementById('cookie-banner');
  var accept  = document.getElementById('cookie-accept');
  var decline = document.getElementById('cookie-decline');
  var consentKey = 'ancya-cookie';

  function setConsent(granted) {
    if (typeof gtag !== 'function') return;
    gtag('consent', 'update', {
      'ad_storage':         granted ? 'granted' : 'denied',
      'analytics_storage':  granted ? 'granted' : 'denied',
      'ad_user_data':       granted ? 'granted' : 'denied',
      'ad_personalization': granted ? 'granted' : 'denied'
    });
  }

  /* Restore a previously stored choice (also accepts legacy values) */
  var saved = null;
  try { saved = localStorage.getItem(consentKey); } catch (e) { /* storage may be blocked */ }
  if (saved === 'accepted' || saved === 'granted') {
    setConsent(true);
  } else if (saved === 'declined' || saved === 'denied') {
    setConsent(false);
  } else if (banner) {
    banner.hidden = false;
  }

  function closeBanner(val) {
    if (banner) banner.hidden = true;
    try { localStorage.setItem(consentKey, val); } catch (e) { /* storage may be blocked */ }
    setConsent(val === 'granted');
  }

  if (accept)  accept.addEventListener('click',  function () { closeBanner('granted'); });
  if (decline) decline.addEventListener('click', function () { closeBanner('denied');  });
})();

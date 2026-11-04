/* ==========================================================================
   ANCYA — Cookie banner + Google Consent Mode v2
   Shared by the home page and all legal pages.

   The consent defaults live inline in each page's <head> (they must exist
   before anything else). This file loads gtag.js only after the visitor
   accepts, so an unconsented visit makes no Google Analytics request and
   sets no analytics cookies.
   ========================================================================== */
(function () {
  'use strict';

  var banner  = document.getElementById('cookie-banner');
  var accept  = document.getElementById('cookie-accept');
  var decline = document.getElementById('cookie-decline');
  var consentKey = 'ancya-cookie';
  var analyticsId = window.ancyaAnalyticsId;
  var analyticsLoaded = false;

  function loadAnalytics() {
    if (!analyticsId || analyticsLoaded) return;
    analyticsLoaded = true;

    gtag('js', new Date());
    gtag('config', analyticsId, { 'anonymize_ip': true });

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(analyticsId);
    document.head.appendChild(script);
  }

  function setConsent(granted) {
    if (typeof gtag !== 'function') return;
    gtag('consent', 'update', {
      'ad_storage':         granted ? 'granted' : 'denied',
      'analytics_storage':  granted ? 'granted' : 'denied',
      'ad_user_data':       granted ? 'granted' : 'denied',
      'ad_personalization': granted ? 'granted' : 'denied'
    });
    if (granted) loadAnalytics();
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

// UI visibility only. Firestore rules remain responsible for data authorization.
(function () {
  'use strict';
  if (window.TRI_ADMIN_STATUS_STARTED) return;
  window.TRI_ADMIN_STATUS_STARTED = true;
  var revision = 0;
  function publish(value) {
    window.TRI_IS_ADMIN = value;
    document.dispatchEvent(new CustomEvent('tri-admin-status', { detail: value }));
  }
  function check(user) {
    var current = ++revision;
    publish(false);
    if (!user || typeof window.triDB !== 'function') return;
    Promise.resolve().then(function () { return window.triDB(); }).then(function (f) {
      return f.getDoc(f.doc(f.db, 'admin', 'check'));
    }).then(function () {
      if (current === revision) publish(true);
    }).catch(function () {
      if (current === revision) publish(false);
    });
  }
  document.addEventListener('tri-user', function (event) { check(event.detail); });
  check(window.TRI_USER);
})();

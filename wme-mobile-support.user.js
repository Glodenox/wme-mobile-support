// ==UserScript==
// @name        WME Mobile Support
// @author      Tom 'Glodenox' Puttemans
// @namespace   http://tomputtemans.com/
// @description A userscript that makes the WME more useable on mobile devices
// @include     /^https:\/\/(www|beta)\.waze\.com\/(?!user\/)(.{2,6}\/)?editor.*$/
// @version     0.2.2
// @supportURL  https://github.com/Glodenox/wme-mobile-support/issues
// @grant       none
// ==/UserScript==

// Style element to reuse whenever it gets removed by the WME (user login, for example)
var styleElement;

// Initialisation of the script, this will only run completely one time
function init(e) {
  if (e && e.user == null) {
    return;
  }
  // if you require certain features to be loaded, you can add them here
  if (typeof I18n === 'undefined' || typeof W === 'undefined' || typeof W.loginManager === 'undefined') {
    setTimeout(init, 200);
    return;
  }
  if (!W.loginManager.user) {
    W.loginManager.events.register("login", null, performScript);
    W.loginManager.events.register("loginStatus", null, performScript);
  }
  var viewportMeta = document.createElement('meta');
  viewportMeta.name = 'viewport';
  viewportMeta.content = 'width=device-width, initial-scale=1';
  document.head.appendChild(viewportMeta);

  setModeChangeListener();
  performScript();
}

// Attempt to hook into the controller that can notify us whenever the editor's mode changes
function setModeChangeListener() {
  if (!W.app || !W.app.modeController) {
    setTimeout(setModeChangeListener, 400);
    return;
  }
  W.app.modeController.model.bind('change:mode', function(model, modeId) {
    if (modeId == 0) { // 0 = Default, 1 = Events
      performScript();
    }
  });
}

function performScript() {
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.textContent = `@media screen and (max-width: 1000px) {
  /* Login dialog modifications */
  .modal-dialog-login { width: 100%; margin: 0 }
  .modal-dialog-login .modal-content { width: 350px }
  #login-popup { padding: 10px; width: auto }
  #login-popup .login-popup-content { display: block }
  #login-popup .login-form { padding: 15px; height: auto }
  .modal-dialog-login .login-title { font-size: 19px }
  .modal-open .edit-area > .fluid-fixed { width: 100%; height: 100vh }
  .modal-open #editor-container #WazeMap { height: calc(100vh - 46px) !important }

  /* Hide a lot of stuff */
  .login-popup-links, .language-select, .welcome-message p, .title-text, #links, #advanced-tools, .WazeControlMousePosition, #user-box, #chat-overlay, .google-permalink { display: none !important }

  /* Set the default width to several objects so they don't stretch the page */
  #editor-container, #editor-container #map { min-width: auto }

  /* Adjust the sidebar and map so they appear on top of eachother */
  @media (orientation: portrait) {
    .show-sidebar .row-fluid .fluid-fixed { width: 100%; margin-left: 0 }
    .row-fluid #sidebar { width: auto }
    .edit-area { display: flex; flex-direction: column-reverse }
    #editor-container #WazeMap { height: 40vh !important }
    #editor-container:before, .show-sidebar #map, .show-sidebar #map:after { border-radius: 0 }
    .toolbar .toolbar-icon { width: 30px }
    #edit-buttons .toolbar-button { padding: 0 5px }
  }

  /* Adjust the sidebar and map so they share the space horizontally */
  @media (orientation: landscape) {
    .show-sidebar .row-fluid .fluid-fixed { width: calc(100% - 330px); min-width: 50%; margin-left: 0 }
    .row-fluid #sidebar { max-width: 50% }
    #sidebar .tab-scroll-gradient { width: 100%; margin-left: -15px }
    .edit-area { display: flex }
  }

  /* Adjust toolbar */
  .toolbar #search { width: 50px; min-width: auto }
  #app-head aside #brand, .group-title { display: none }
  .toolbar .toolbar-icon { position: relative }
  #edit-buttons .toolbar-button .item-icon { display: block; top: 8px; position: relative }
  #edit-buttons .toolbar-button .menu-title { display: none }
  #edit-buttons { flex-grow: 1 }
  #edit-buttons .toolbar-submenu { margin-right: 0 }
  #toolbar .toolbar, #edit-buttons { min-width: auto }

  /* Map adjustments */
  .olControlPanZoomBar { bottom: 50px }
}`;
  }
  if (!styleElement.parentNode) {
    document.head.appendChild(styleElement);
  }

  var adjustToolbar = function() {
    if (!document.querySelector('#mode-switcher') || !document.querySelector('#edit-buttons')) {
      setTimeout(adjustToolbar, 100);
      return;
    }
    document.querySelector('#mode-switcher .short-title').textContent = 'Mode';
    var addStickyClasses = function(el, classes) {
      var observer = new MutationObserver(function() {
        el.querySelector('.item-icon').classList.add(...classes);
      });
      observer.observe(el, {
        childList: true
      });
      el.querySelector('.item-icon').classList.add(...classes);
    };
    addStickyClasses(document.querySelector('#edit-buttons .toolbar-button.waze-icon-save'), ['fa', 'fa-save']);
    addStickyClasses(document.querySelector('#edit-buttons .toolbar-button.waze-icon-redo'), ['fa', 'fa-chevron-right']);
    addStickyClasses(document.querySelector('#edit-buttons .toolbar-button.waze-icon-undo'), ['fa', 'fa-chevron-left']);
  };
  adjustToolbar();
}

init();
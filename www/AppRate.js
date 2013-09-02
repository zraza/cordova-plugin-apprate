var AppRate, channel, locales, preferences;

preferences = require("./preferences");

locales = require("./locales");

channel = require("cordova/channel");

AppRate = (function() {
  var navigateToAppStore, promptForRatingWindowButtonClickHandler, rate_reset, rate_stop, rate_try, thisObj,promptForRating;

  thisObj = AppRate;

  AppRate.rate_app = parseInt(window.localStorage.getItem("rate_app") || 1);

  AppRate.usesUntilPromptCounter = parseInt(window.localStorage.getItem("usesUntilPromptCounter") || 0);

 function AppRate() {
    if (preferences.promptAtLaunch === true) {
      channel.onCordovaReady.subscribe(function() {
        promptForRating();
        // subscribe to resume
        channel.onResume.subscribe(function(){
          promptForRating();
        });
        
      });
    }
  }

  navigateToAppStore = function() {
    if (/(iPhone|iPod|iPad)/i.test(navigator.userAgent.toLowerCase())) {
      return window.open("itms-apps://ax.itunes.apple.com/WebObjects/MZStore.woa/wa/viewContentsUserReviews?type=Purple+Software&id=" + preferences.appStoreID.ios);
    } else if (/(Android)/i.test(navigator.userAgent.toLowerCase())) {
      return window.open("market://details?id=" + preferences.appStoreID.android, "_system");
    } else if (/(BlackBerry)/i.test(navigator.userAgent.toLowerCase())) {
      return window.open("http://appworld.blackberry.com/webstore/content/" + preferences.appStoreID.blackberry);
    }
  };

  promptForRatingWindowButtonClickHandler = function(buttonIndex) {
    switch (buttonIndex) {
      case 1:
        rate_stop();
        return setTimeout(navigateToAppStore, 1000);
      case 2:
        return rate_reset();
      case 3:
        return rate_stop();
    }
  };

  rate_stop = function() {
    // Update current object for resume
    thisObj.rate_app = 0;
    window.localStorage.setItem("rate_app", 0);
    return window.localStorage.removeItem("usesUntilPromptCounter");
  };

  rate_reset = function() {
    // Update current object for resume
    thisObj.usesUntilPromptCounter = 0;
    return window.localStorage.setItem("usesUntilPromptCounter", 0);
  };

  rate_try = function() {
    var localeObj;
    localeObj = locales[preferences.useLanguage];// || preferences.useLanguage;
    if (thisObj.usesUntilPromptCounter === preferences.usesUntilPrompt && thisObj.rate_app !== 0) {
      return navigator.notification.confirm(localeObj.message, promptForRatingWindowButtonClickHandler, localeObj.title, localeObj.buttonLabels);
    } else if (thisObj.usesUntilPromptCounter < preferences.usesUntilPrompt) {
      thisObj.usesUntilPromptCounter++;
      return window.localStorage.setItem("usesUntilPromptCounter", thisObj.usesUntilPromptCounter);
    }
  };

  promptForRating = function() {
     rate_try();
  };

  AppRate.prototype.navigateToAppStore = navigateToAppStore;
  AppRate.prototype.promptForRating = promptForRating;

  return AppRate;

})();

module.exports = new AppRate(this);

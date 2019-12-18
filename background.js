// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// To make sure we can uniquely identify each screenshot tab, add an id as a
// query param to the url that displays the screenshot.
// Note: It's OK that this is a global variable (and not in localStorage),
// because the event page will stay open as long as any screenshot tabs are
// open.
var id = 100;

// Listen for a click on the camera icon. On that click, take a screenshot.
chrome.browserAction.onClicked.addListener(function () {

  chrome.tabs.captureVisibleTab(function (screenshotUrl) {
    var viewTabUrl = chrome.extension.getURL('screenshot.html?id=' + id++)
    var targetId = null;

    chrome.tabs.onUpdated.addListener(function listener(tabId, changedProps) {
      // We are waiting for the tab we opened to finish loading.
      // Check that the tab's id matches the tab we opened,
      // and that the tab is done loading.
      if (tabId != targetId || changedProps.status != "complete")
        return;

      // Passing the above test means this is the event we were waiting for.
      // There is nothing we need to do for future onUpdated events, so we
      // use removeListner to stop getting called when onUpdated events fire.
      chrome.tabs.onUpdated.removeListener(listener);

      // Look through all views to find the window which will display
      // the screenshot.  The url of the tab which will display the
      // screenshot includes a query parameter with a unique id, which
      // ensures that exactly one view will have the matching URL.
      var views = chrome.extension.getViews();
      var base64img = screenshotUrl.substr(23)
      // view.clickNext();

      
      console.log(document.getElementsByClassName("coreSpriteRightChevron"))
      
      // document.getElementsByClassName("coreSpriteRightChevron")[0].click()
      // console.log()
      for (var i = 0; i < views.length; i++) {
        var view = views[i];
        if (view.location.href == viewTabUrl) {
          view.setScreenshotUrl(screenshotUrl);

          var data = JSON.stringify({
            "requests": [
              {
                "image": {
                  "content": base64img
                },
                "features": [
                  {
                    "type": "TEXT_DETECTION"
                  }
                ]
              }
            ]
          });

          var xhr = new XMLHttpRequest();
          xhr.withCredentials = true;

          xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
              // console.log(this.responseText);
              var jsonResponse = JSON.parse(this.responseText)
              // console.log(this.responseText);
              console.log(jsonResponse.responses[0].textAnnotations[0].description)
              // view.setText(screenshotUrl)
              view.setText(jsonResponse.responses[0].textAnnotations[0].description)
            }
          });

          xhr.open("POST", "https://vision.googleapis.com/v1/images:annotate");
          xhr.setRequestHeader("Content-Type", "application/json");
          xhr.setRequestHeader("Authorization", "Bearer ya29.c.Kl61B0qDC7EiqPnexV23twSOql55ygh_aN6ez9yH-4Ro7DYlG_BOiH8qUbyUqEBUzDAooJq3BbRMgk-jSEJu3z9EHk3wWubzgE2Zwdih3rZ22TKygieEIkF4Go_A43pu");
          xhr.setRequestHeader("User-Agent", "PostmanRuntime/7.20.1");
          xhr.setRequestHeader("Accept", "*/*");
          xhr.setRequestHeader("Cache-Control", "no-cache");
          xhr.setRequestHeader("Postman-Token", "829d4da5-f3ed-409f-8505-0b340c0ed834,eabfd060-aa4f-498e-8a8c-ccbb6ecec67a");
          xhr.setRequestHeader("Host", "vision.googleapis.com");
          xhr.setRequestHeader("Accept-Encoding", "gzip, deflate");
          xhr.setRequestHeader("Content-Length", "166");
          xhr.setRequestHeader("Connection", "keep-alive");
          xhr.setRequestHeader("cache-control", "no-cache");
          xhr.send(data);
          break;
        }
      }
    });

    chrome.tabs.create({ url: viewTabUrl }, function (tab) {
      targetId = tab.id;
    });
  });
});

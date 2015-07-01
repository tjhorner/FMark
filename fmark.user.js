// ==UserScript==
// @name         FMark
// @namespace    https://horner.tj/
// @version      0.3
// @description  Enables Markdown on Facebook
// @author       TJ Horner
// @match        *://*.facebook.com/*
// @require      https://raw.githubusercontent.com/chjj/marked/master/lib/marked.js
// @require      https://code.jquery.com/jquery.js
// @grant        none
// ==/UserScript==

FacebookMarkdown = (function(){
  var getUserContent = function(){
    return $(".userContent:not([fmark-replaced]) p, .UFICommentBody:not([fmark-replaced]) span, ._5yl5:not([fmark-replaced]) span");
  };
  
  var replaceUserContent = function(){
    var userContent = getUserContent();
    console.log("userContent", userContent);
    $.each(userContent, function(i, e){
      var $e = $(e);
      var $replacement = $(marked($e.text().replace("<", "&lt;").replace(">", "&gt;")));
      $e.parent().attr("fmark-replaced", true);
      $e.html($replacement[0].innerHTML);
    });
  };
  
  // listen for DOM changes, then act on them
  var observer = new MutationObserver(replaceUserContent);
  
  observer.observe($("#globalContainer")[0], {
    subtree: true,
    childList: true,
    attribute: true,
  });
}());

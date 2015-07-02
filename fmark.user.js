// ==UserScript==
// @name         FMark
// @namespace    https://horner.tj/
// @version      0.4.2
// @description  Enables Markdown on Facebook
// @author       TJ Horner
// @match        https://www.facebook.com/*
// @match        https://facebook.com/*
// @exclude      https://*.facebook.com/ai.php
// @require      https://raw.githubusercontent.com/chjj/marked/master/lib/marked.js
// @require      https://code.jquery.com/jquery.js
// @grant        GM_xmlhttpRequest
// ==/UserScript==

if(typeof(facebook) !== "undefined"){
  FacebookMarkdown = (function(){
    var users = {};
    
    var identServer = "hydro-poutine-5010.herokuapp.com";
    
    var getUser = function(id, callback){
      if(!users[id.toString()]){
        GM_xmlhttpRequest({
          method: "GET",
          url: "http://" + identServer + "/user?id=" + encodeURIComponent(id),
          onload: function(res) {
            var user = JSON.parse(res.responseText);
            users[user.id.toString()] = user;
            callback(user);
          }
        });
      }else{
        return users[id.toString()];
      }
    };
    
    var extractIdFromUrl = function(url){
      var userId = url.substr(25);
      
      if(userId.indexOf("profile.php") !== -1){
        userId = userId.substr(15);
      }
      
      return userId;
    };
    
    var getUserContent = function(){
      return $(".userContent:not([fmark-replaced]) p, .UFICommentBody:not([fmark-replaced]) span, ._5yl5:not([fmark-replaced]) span");
    };
    
    var replaceUserContent = function(){
      var userContent = getUserContent();
      // console.log("userContent", userContent);
      $.each(userContent, function(i, e){
        var $e = $(e);
        var $replacement = $(marked($e.text().replace("<", "&lt;").replace(">", "&gt;")));
        $e.parent().attr("fmark-replaced", true);
        $e.html($replacement[0].innerHTML);
      });
      
      $.each($(".titlebarText"), function(i, e){
        var $e = $(e);
        if($e.attr("fmark-checked") !== "true"){
          var extUserId = extractIdFromUrl($e.attr("href"));
          getUser(extUserId, function(user){
            console.log(user);
            // bug
            $e.parent().find(".fmarker").remove();
            if(user.hasExtension){
              $e.parent().prepend("<span class='fmarker' title='This user uses FMark!'>(+FM)" + (user.version !== GM_info.script.version ? " [v" + user.version + "]" : "") + "</span> ");
              $e.attr("fmark-checked", true);
            }else{
              $e.parent().prepend("<span class='fmarker' title='This user does not use FMark.'>(-FM)</span> ");
              $e.attr("fmark-checked", true);
            }
          });
        }
      });
    };
    
    $(document).ready(function(){
      // listen for DOM changes, then act on them
      var observer = new MutationObserver(replaceUserContent);
      
      observer.observe(document.body, {
        subtree: true,
        childList: true,
        attribute: true,
      });
      
      var userId = extractIdFromUrl($("._2dpe._1ayn").attr("href"));
      
      GM_xmlhttpRequest({
        method: "GET",
        url: "http://" + identServer + "/identify?id=" + encodeURIComponent(userId) + "&version=" + encodeURIComponent(GM_info.script.version),
        onload: function(res) {
          console.log("registered with server, verifying");
          getUser(userId, function(user){
            if(user.version === GM_info.script.version){
              console.log("server registration complete");
            }
          });
        }
      });
    });
    
    return "hi!";
  }());
}

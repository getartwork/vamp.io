$(window).on('load', documentReady);
var thePath;


function documentReady() {
  thePath = window.location.pathname;
  setSideMenu();
  setDropdown();

  // Top menu color change
  $(window).on("scroll", function () {
    setColorMenu();
  });

  setColorMenu();
  function setColorMenu() {
    if ($(window).scrollTop() > 0 || thePath !== '/') {
      $("#header").addClass("active");
    } else {
      //remove the background property so it comes transparent again (defined in your css)
      $("#header").removeClass("active");
    }
  }

  // Set mobile menu
  $('#menu-toggle').on('click', function (e) {
    $('.top-menu-items').toggleClass('open');
  });

  $('top-menu-item').on('click', function(e) {
    $('.top-menu-items').removeClass('open');
  });

  $('pre code').each(function(i, block) {
    var codeText = $(this).text();
    hljs.highlightBlock(block);

    $(this).append('<button class="copy-button" data-clipboard-text=\''+codeText+'\'><p class="copy"><i class="fa fa-lg fa-paperclip" aria-hidden="true"></i>&nbsp;&nbsp;Copy</p><p class="copied"><i class="fa fa-lg fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Copied to clipboard</p></button>');
  });

  var client = new ZeroClipboard( $('.copy-button') );


  $('.copy-button').click(function() {
    var self = this;
    $(self).addClass('clicked');

    window.setTimeout(function () {
      $(self).removeClass('clicked');
    }, 5000);

  });

  //unsticky menu
  $(window).scroll(function () {
    var offsetTop = $('.footer').offset().top;
    var scrollBottom = $(window).scrollTop() + $(window).height();

    if(scrollBottom >= offsetTop) {
      $('#side-menu').css('position', 'absolute');
      $('#side-menu').css('bottom', '0');

    } else {
      $('#side-menu').css('position', 'fixed');
      $('#side-menu').css('bottom', '');
    }
  });

  // Set target="_blank" on external links
  $(document.links).filter(function() {
    return this.hostname != window.location.hostname;
  }).attr('target', '_blank');

  //check if emails are correct
  var inputfields = $('#mc-embedded-subscribe-form input');

  $('#mc-embedded-subscribe-form input').on('change paste keyup', function () {
    var emailValue = $(this).val();


    //
    if(isEmail(emailValue) && (emailValue !== '')) {
      $(this).parent().find('.button').removeClass('not-active');
    } else {
      $(this).parent().find('.button').addClass('not-active');
    }

  });

  function isEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
  }

  buildSearch();

}

// Set side menu 
function setSideMenu() {
  var firstPartUrl = thePath.split('/')[1];
  $('.side-menu-list').each(function() {
    var parentUrl = $(this).data('parenturl');
    var firstPartUrlMenu = parentUrl.split('/')[1];
    if(firstPartUrl === firstPartUrlMenu) {
      $(this).css('display', 'block');
    }
  });

  $('.top-menu-item').each(function() {
    var parentUrl = $(this).data('parenturl');
    var firstPartUrlMenu = parentUrl.split('/')[1];
    $(this).removeClass('active');
    if(firstPartUrl === firstPartUrlMenu) {
      $(this).addClass('active');
    }
  });

  var versions = [];

  var linkOfSideMenu = $('.side-menu__sub__item__text').each(function() {
    var linkOfSideMenu = $(this).data('url');
    var menuLinkVersion = getVersionFromUrl(linkOfSideMenu);
    var urlLinkVersion = getVersionFromUrl(thePath);

    
    if(menuLinkVersion === urlLinkVersion) {
     $(this).css('display', 'block'); 
    } 

    if(urlLinkVersion) {
      if(versions.indexOf(menuLinkVersion) < 0 && (getEndOfUrl(linkOfSideMenu) === getEndOfUrl(thePath))) {
        var isSelected = menuLinkVersion === urlLinkVersion ? 'selected' : '';
        var optionsSting = '<option value="'+linkOfSideMenu+'"'+isSelected+'>'+menuLinkVersion+'</option>';

        versions.push(menuLinkVersion);
        $('#versions-dropdown').append(optionsSting);
      }

      $('#versions-dropdown').css('display', 'block');

    } else {
      $(this).css('display', 'block');
    }
  });

  $("#versions-dropdown").append($("#versions-dropdown option").remove().sort(function(a, b) {
      var at = $(a).text(), bt = $(b).text();
      return (at < bt)?1:((at > bt)?-1:0);
  }));
  
}

function getVersionFromUrl(url) {
  var urlSplitted = url.split('/');
  var versionInPath = urlSplitted[urlSplitted.length - 3];
  if(versionInPath.substring(0,1) === 'v') {
    return versionInPath;
  } else {
    return false;
  }
}

function getEndOfUrl(url) {
  var urlSplitted = url.split('/');
  return urlSplitted[urlSplitted.length - 2];
}



function setDropdown() {
  
}


// Search function
function buildSearch() {
  var self = this;
  self.theIndex = {};

  $.getJSON(theBaseUrl + 'pages.json', function (data) {
    self.pages = data;
    $.getJSON(theBaseUrl + 'searchIndex.json', function (indexData) {
      self.theIndex = lunr.Index.load(indexData);
    }, function(error){
      console.log(error);
    });
  }, function(error) {
    console.log(error);
  });

  
  $('.search-bar__input').keydown($.debounce(250, function( event ) {
    if ( event.which == 13 ) {
      event.preventDefault();
    }
    console.log();
    var searchResults = self.theIndex.search($(this).val());
    console.log(searchResults);
    $('.search-results ul').empty();


    for (var sri = 0; sri < searchResults.length; sri++) {
      if(searchResults[sri]) {
        var parsedResult = self.pages[searchResults[sri].ref];
        var goToUrl = theBaseUrl + ((parsedResult.path.split(' ').join('-')).substring(1, parsedResult.path.length));
        $('.search-results ul').append('<li><a href="' + goToUrl + '"><h2>' + parsedResult.title + '</h2><p class="url">' + parsedResult.path.split(' ').join('-') + '</p><p class="the-content">' + parsedResult.content + '</p></li>');
      }
    }

  }));

  
  $('.search-button').click(function(event) {
    $('#search').toggleClass('active');
    $('.search-bar__input').focus();
    event.preventDefault();
    event.stopPropagation();
  });

  $('.search-bar__back').click(function(event) {
    event.preventDefault();
    event.stopPropagation();
    exitSearch(event);
  });

  //escape key
  $('.search-bar__input').keyup(function(e) {
    //escape key
    if (e.keyCode == 27) {
      exitSearch(e);
    }
    //enter key
    if (e.keyCode == 13) {

    }
  
  });

  function exitSearch(event) {
    event && event.preventDefault();
    event && event.stopPropagation();
    $('.search-bar__input').val('');
    $('.search-bar__input').focusout();
    $('#search').toggleClass('active');

  }
}







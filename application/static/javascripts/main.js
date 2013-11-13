require.config({
    paths : {
        "jquery" : "vendor/jquery",

        "foundation" : "vendor/foundation/foundation",
        "foundation.magellan": "vendor/foundation/foundation.magellan",
        "foundation.topbar": "vendor/foundation/foundation.topbar",
        "foundation.reveal": "vendor/foundation/foundation.reveal",
        "foundation.dropdown": "vendor/foundation/foundation.dropdown",

        "scout" : "vendor/Scout/jquery.bp.scout.min",

        "google-plusone": "//apis.google.com/js/plusone",
        "twitter-widgets": "//platform.twitter.com/widgets",

    },
    shim : {
        "scout" : ["jquery"],
        "foundation" : ["jquery"],
        "foundation.magellan" : ["foundation"],
        "foundation.topbar" : ["foundation"],
        "foundation.dropdown" : ["foundation"],
        "foundation.reveal" : ["foundation"]
    }
});

require(["jquery",
         "scout",
         "google-plusone",
         "twitter-widgets",
         "foundation",
         "foundation.magellan",
         "foundation.dropdown",
         "foundation.reveal",
         "foundation.topbar"], function($) {

            $(document).foundation('magellan topbar dropdown alerts reveal', { threshold: 0 })
            $(function(){

                $.scout();

                $("#messages li").each(function(index, item){
                    var $item = $(item);
                        $item.attr("data-alert", "")
                    var $closeButton = $item.find('[data-close]').on('click', function(){
                            $item.toggleClass("active")
                        });
                        $item.toggleClass("active");
                        $item.append($closeButton);
                });

                $("form input[type='checkbox']").each(function(index, item){
                    var $item = $(item);
                    var name = $item.attr('name'),
                        id = $item.attr('id'),
                        off_label = $item.attr("data-switch-off") || $item.parents('form').attr('data-switch-off') ||"Off",
                        on_label = $item.attr("data-switch-on") || $item.parents('form').attr('data-switch-on') || "On"

                        $item.replaceWith('<div class="switch round">\
  <input id="'+id+'" name="'+name+'" type="radio" checked>\
  <label for="'+id+'" onclick="">'+off_label+'</label>\
  <input id="'+id+'" name="'+name+'" type="radio">\
  <label for="'+id+'" onclick="">'+on_label+'</label>\
  <span></span>\
</div>')
                });


                var topScrollerContainer = $("[data-topscroll-container]");
                if(topScrollerContainer){
                    var topScrollerAlign = topScrollerContainer.attr("data-topscroll-align");
                    var topScroller =  $("<a id='return-to-top' href='' class='button simple-outline transparent muted'><span class='icon-chevron-up'></span></a>")
                        topScroller.click(function(){
                                $("html, body").animate({ scrollTop: 0 }, 600);
                                return false;
                            })
                        topScroller.appendTo(topScrollerContainer);
                        topScroller.addClass(topScrollerAlign)

                    function alignTopScroller(){
                        var offset = topScrollerContainer.offset()
                        if(!!offset && offset.hasOwnProperty('left')){
                            var offsetLeft = offset.left
                            if(topScrollerAlign=='right') offsetLeft += topScrollerContainer.width()
                            topScroller.css('left', offsetLeft)
                        }
                    }

                    $(window).scroll(function(){
                        alignTopScroller()
                        if ($(this).scrollTop() > 350) {
                            $('#return-to-top').addClass('active');
                        } else {
                            $('#return-to-top').removeClass('active');
                        }
                    });
                }

            })

        });
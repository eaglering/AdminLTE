+function ($) {
    'use strict';

    var Selector = {
        container: '#pjax-container',
        scriptTag: 'data-exec-on-popstate'
    };

    $(function () {

    // if ($.support.pjax) {
        $.pjax.defaults.timeout = 5000;
        $.pjax.defaults.maxCacheLength = 0;
        $.pjax.defaults.pushState = false;

        $(document).on('pjax:timeout', function (event) {
            event.preventDefault();
        });
        $(document).on('click', 'a[data-pjax]', function(e) {
            var options = Object.assign({}, {container: Selector.container}, $(this).data());
            $.pjax.click(e, options);
        });
        $(document).on('submit', 'form[data-pjax]', function(e) {
            e.preventDefault();
            var options = Object.assign({}, {container: Selector.container}, $(this).data());
            $.pjax.submit(e, options);
        });
        $(document).on("pjax:popstate", function () {
            $(document).one("pjax:end", function (event) {
                $(event.target).find("script[" + Selector.scriptTag + "]").each(function () {
                    $.globalEval(this.text || this.textContent || this.innerHTML || '');
                });
            });
        });
        $(document).on('pjax:send', function (xhr) {
            if (xhr.relatedTarget && xhr.relatedTarget.tagName && xhr.relatedTarget.tagName.toLowerCase() === 'form') {
                var $submit_btn = $('form[pjax-container] :submit');
                if ($submit_btn) {
                    $submit_btn.button('loading')
                }
            }
            // NProgress.start();
        });

        $(document).on('pjax:complete', function (xhr) {
            if (xhr.relatedTarget && xhr.relatedTarget.tagName && xhr.relatedTarget.tagName.toLowerCase() === 'form') {
                var $submit_btn = $('form[pjax-container] :submit');
                if ($submit_btn) {
                    $submit_btn.button('reset')
                }
            }
            // NProgress.done();
        });

        $.reload = function (container, options) {
            $.pjax.reload(container || Selector.container, options || {});
        };

        $.redirect = function (url, options) {
            options = Object.assign({}, {container: Selector.container}, options || {}, {url: url});
            $.pjax(options);
        };
    });
    // }
}(jQuery);

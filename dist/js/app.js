+function ($) {
    'use strict';

    var Selector = {
        app: '.content-wrapper',
        container: '#pjax-container',
        scriptTag: 'data-exec-on-popstate'
    };
    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-top-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": 300,
        "hideDuration": 1000,
        "timeOut": 0,
        "extendedTimeOut": 1000,
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    };

    NProgress.configure({parent: Selector.app});
    $.pjax.defaults.timeout = 5000;
    $.pjax.defaults.maxCacheLength = 0;

    $.toast = toastr;
    $.layer = layer;
    $.reload = function (container, options) {
        $.pjax.reload(container || Selector.container, options || {});
    };
    $.redirect = function (url, options) {
        options = Object.assign({}, {container: Selector.container}, options || {}, {url: url});
        $.pjax(options);
    };
    $.loadedScripts = [];
    $.loadScripts = function(arr) {
        var _arr = $.map(arr, function(src) {
            if ($.inArray(src, $.loadedScripts)) {
                return;
            }
            $.loadedScripts.push(src);
            return $.getScript(src);
        });
        _arr.push($.Deferred(function(deferred){
            $(deferred.resolve);
        }));
        return $.when.apply($, _arr);
    }

    $.getQueryVariable = function getQueryVariable(variable) {
        var query = window.location.search.substring(1)
            , vars = query.split("&"), varCol = {};
        for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");
            varCol[pair[0]] = pair[1];
            if(variable && pair[0] === variable){return pair[1];}
        }
        return varCol;
    }
    function initialContainer(_) {
        var container = $(_), vars = $.getQueryVariable();
        // 初始化跳转控件
        container.find('[data-widget=paginator-elevator]').keydown(function (event) {
            if (event.keyCode === 13) {
                var $this = $(this), value = $this.val(), min = $this.attr('min'), max = $this.attr('max');
                if (/[1-9]\d*/.test(value) && value * 1 >= min && value * 1 <= max) {
                    var data = Object.assign({}, vars, {page: value});
                    $.redirect(window.location.pathname, {data});
                }
            }
        });
        // 初始化每页限制控件
        container.find('[data-widget=paginator-list-rows]').change(function () {
            var $this = $(this), data = Object.assign({}, vars, {listRows: $this.val()});
            $.redirect(window.location.pathname, {data});
        });
        // 初始化分页控件
        container.find('[data-widget=paginator-page]').click(function () {
            var $this = $(this), data = Object.assign({}, vars, {page: $this.data('page')});
            $.redirect(window.location.pathname, {data});
        });
        // 初始化可选按钮组件
        container.find('.checkable-btn-group').each(function () {
            var $this = $(this), value = $this.data('value').toString();
            if (value.length > 0) {
                value.split(',').forEach(function (v) {
                    $this.find('input[value="' + v + '"]').attr('checked', true);
                })
            }
        });
        container.find('button[data-toggle-target]').each(function () {
            var $btn = $(this), $text = $btn.find('span').text(), cache = $btn.data('cache'),
                value = cache ? localStorage.getItem('er:cache.' + cache) : false;
            if (value && $text !== value) {
                $btn.trigger('click');
            }
        });
        // 初始化时间范围选择组件
        container.find('input[data-widget=daterangepicker]').daterangepicker({
            alwaysShowCalendars: true,
            buttonClasses: 'btn btn-xs',
            autoUpdateInput: false,
            locale: {
                format: 'YYYY-MM-DD',
                separator: ' 至 ',
                applyLabel: '确定',
                cancelLabel: '清除',
                customRangeLabel: '自定义范围',
                fromLabel: '开始时间',
                toLabel: '结束时间',
                daysOfWeek: ['日', '一', '二', '三', '四', '五','六'],
                monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
            },
            ranges: {
                '今天': [moment(), moment()],
                '昨天': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                '最近7天': [moment().subtract(6, 'days'), moment()],
                '最近30天': [moment().subtract(29, 'days'), moment()],
                '这个月': [moment().startOf('month'), moment().endOf('month')],
                '上个月': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            }
        }).on('cancel.daterangepicker', function (ev, picker) {
            var $this = $(this), from = $this.data('from'), to = $this.data('to');
            $this.val('');
            $this.siblings('input[name="' + from + '"]').val('');
            $this.siblings('input[name="' + to + '"]').val('');
        }).on('apply.daterangepicker', function (ev, picker) {
            var $this = $(this), from = $this.data('from'), to = $this.data('to')
                , fromDate = picker.startDate.format(picker.locale.format)
                , toDate = picker.endDate.format(picker.locale.format);
            $this.val(fromDate == toDate ? fromDate : fromDate + picker.locale.separator + toDate);
            $this.siblings('input[name="' + from + '"]').val(fromDate);
            $this.siblings('input[name="' + to + '"]').val(toDate);
        });
    }

    $(document).on('click', 'a[data-pjax]', function(event) {
        var options = Object.assign({}, {container: Selector.container}, $(this).data());
        $.pjax.click(event, options);
    });

    $(document).on('pjax:timeout', function (event) {
        event.preventDefault();
    });

    $(document).on('submit', 'form[data-pjax]', function(event) {
        $.pjax.submit(event, Selector.container);
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
        NProgress.start();
    });

    $(document).on('pjax:complete', function (xhr) {
        if (xhr.relatedTarget && xhr.relatedTarget.tagName && xhr.relatedTarget.tagName.toLowerCase() === 'form') {
            var $submit_btn = $('form[pjax-container] :submit');
            if ($submit_btn) {
                $submit_btn.button('reset')
            }
        }
        initialContainer(Selector.container);
        NProgress.done();
    });

    $(document).on('click', 'button[data-toggle-target]', function () {
        var $btn = $(this), $text = $btn.find('span'), id = $btn.data('toggle-target'),
            on = $btn.data('toggle-on'), off = $btn.data('toggle-off'), cache = $btn.data('cache');
        if ($text.text() === on) {
            $text.text(off);
            cache && localStorage.setItem('er:cache.' + cache, off);
            $(id).hide();
        } else {
            $text.text(on);
            cache && localStorage.setItem('er:cache.' + cache, on);
            $(id).show();
        }
    });

    $(document).on('click', 'button[data-ajax]', function (event) {
        var $btn = $(this), defaults = Object.assign({
            url: '',
            data: '',
            type: 'post',
            title: '提示',
            body: '确定要执行操作吗？',
            confirm: true,
        }, $btn.data());
        $.layer.confirm(defaults.body, {title: defaults.title}, function (index) {
            $.layer.close(index);
            $btn.button('loading');
            $.ajax({
                url: defaults.url,
                data: defaults.data,
                type: defaults.type,
                success: function (resp) {
                    if (!resp.success) {
                        $.toast.error(resp.msg);
                    } else if (!resp.url){
                        $.reload();
                    } else {
                        $.redirect(resp.url);
                    }
                },
                complete: function () {
                    $btn.button('reset');
                }
            })
        });
    });
    initialContainer(document);
}(jQuery);

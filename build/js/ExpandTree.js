/* Tree()
 * ======
 * Converts a nested list into a multilevel
 * tree view menu.
 *
 * @Usage: $('.my-menu').tree(options)
 *         or add [data-widget="tree"] to the ul element
 *         Pass any option as data-option="value"
 */
+function ($) {
  'use strict';

  var DataKey = 'lte.expand-tree';

  var Default = {
    animationSpeed: 500,
    accordion     : true,
    followLink    : false,
    trigger       : '.expend-tree-view a',
    box           : '.sidebar-secondary .sidebar'
  };

  var Selector = {
    sidebarMenu: '.sidebar-menu',
    open        : '.active',
    data        : '[data-widget="expand-tree"]',
  };

  var ClassName = {
    expand: 'has-sidebar-secondary',
    open: 'active',
    hidden: 'hidden',
    tree: 'expand-tree'
  };

  // Tree Class Definition
  // =====================
  var ExpandTree = function (element, options) {
    this.element = element;
    this.options = options;

    $(this.element).addClass(ClassName.tree);

    this._setUpListeners();
  };

  ExpandTree.prototype.toggle = function (link, event) {
    var sidebarMenu = link.next(Selector.sidebarMenu);
    var parentLi     = link.parent();
    var isOpen       = parentLi.hasClass(ClassName.open);

    if (!this.options.followLink || link.attr('href') === '#') {
      event.preventDefault();
    }

    if (!isOpen) {
      this.expand(sidebarMenu, parentLi);
    }
  };

  ExpandTree.prototype.expand = function (tree, parent) {
    if (tree.length > 0) {
      parent.addClass(ClassName.open).siblings(Selector.open).removeClass(ClassName.open);
      var menu = tree.clone().removeClass(ClassName.hidden).tree();
      $(this.options.box).html(menu);
      $('body').addClass(ClassName.expand);
    } else {
      $('body').removeClass(ClassName.expand);
    }
  };

  // Private

  ExpandTree.prototype._setUpListeners = function () {
    var that = this;

    $(this.element).on('click', this.options.trigger, function (event) {
      that.toggle($(this), event);
    });
  };

  // Plugin Definition
  // =================
  function Plugin(option) {
    return this.each(function () {
      var $this = $(this);
      var data  = $this.data(DataKey);

      if (!data) {
        var options = $.extend({}, Default, $this.data(), typeof option == 'object' && option);
        $this.data(DataKey, new ExpandTree($this, options));
      }
    });
  }

  var old = $.fn.expandTree;

  $.fn.expandTree             = Plugin;
  $.fn.expandTree.Constructor = ExpandTree;

  // No Conflict Mode
  // ================
  $.fn.expandTree.noConflict = function () {
    $.fn.expandTree = old;
    return this;
  };

  // Tree Data API
  // =============
  $(window).on('load', function () {
    $(Selector.data).each(function () {
      Plugin.call($(this));
    });
  });

}(jQuery);

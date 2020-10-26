/**
 * @Usage:
 * $.toast.info('Display a info toast, with no title!')
 * $.toast.warning('Display a warning toast, with no title')
 * $.toast.success('Display a success toast, with a title', 'Miracle Max Says')
 * $.toast.error('Display an error toast, with a title', 'Inconceivable!')
 * // Immediately remove current toasts without using animation
 * toastr.remove()
 * // Remove current toasts using animation
 * toastr.clear()
 * // Override global options
 * toastr.success('We do have the Kapua suite available.', 'Turtle Bay Resort', {timeOut: 5000})
 */
+function ($) {
    'use strict';

    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-top-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "0",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    };
    $.toast = toastr;
}(jQuery, toastr);

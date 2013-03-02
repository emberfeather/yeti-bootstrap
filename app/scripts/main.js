require.config({
    paths: {
        angular: '../components/angular/angular',
        jquery: '../components/jquery/jquery',
        bootstrap: 'vendor/bootstrap'
    },
    shim: {
        bootstrap: {
            deps: ['jquery'],
            exports: 'jquery'
        }
    }
});

require(['jquery', 'angular', 'bootstrap', 'snowball', 'i18n/locale_en-us', 'controller/Snowball'], function ($) {
    'use strict';
});

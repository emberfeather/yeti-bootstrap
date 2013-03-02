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

require(['jquery', 'angular', 'bootstrap', 'snowball', 'controller/Snowball'], function ($) {
    'use strict';
});

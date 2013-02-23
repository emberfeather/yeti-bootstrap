require.config({
    paths: {
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

require(['app', 'jquery', 'bootstrap', 'snowball'], function (app, $) {
    'use strict';

    var snow = new Snowball();
    var loans = [];

    loans.push(new Loan('Loan 1', 4335.85, 13.54, 48.92));
    loans.push(new Loan('Loan 2', 2488.69, 12.33, 25.57));
    loans.push(new Loan('Loan 3', 6891.83, 11.48, 68.92));

    snow.schedule(loans, 179.26);
});

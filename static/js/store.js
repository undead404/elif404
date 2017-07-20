/*jshint unused:false */

(function (exports) {

    'use strict';

    var STORAGE_KEY = 'companies-vuejs';

    exports.companyStorage = {
        fetch: function () {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        },
        save: function (companies) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
        }
    };

})(window);
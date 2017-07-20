"use strict";
//using jQuery
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        var cookies = document.cookie.split(";");
        for (var i = 0; i < cookies.length; i++) {
            var cookie = $.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
var csrftoken = getCookie("csrftoken");

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
Vue.component("company", {
    "computed": {
        "depth": function () {
            // var i = 0;
            // while (current.parent !== undefined) {
            //     current = current.parent
            //     i++;
            // }
            for (var i = 0, current = this; current.parent !== undefined; current = current.parent, i++);
            return i;
        },
        "earnings": {
            "get": function () {
                return this.earningsValue;
            },
            "set": _.debounce(function (newEarnings) {
                var self = this;
                self.loadingTasksNum++;
                var data = {
                    "earnings": newEarnings,
                    "parent": self.parent ? self.parent.id : null,
                    "title": self.title
                };
                $.ajax({
                    "data": data,
                    "type": "PATCH",
                    "url": "/companies/" + self.id + "/"
                }).done(function (response) {
                    var delta = response.earnings - self.earnings;
                    self.earningsValue = response.earnings;
                    if (self.parent !== undefined) {
                        self.parent.earnings = parseInt(self.parent.earnings) + parseInt(delta);
                    }
                }).fail(function (error) {
                    window.app.errorMessages.push(error.responseText);
                }).always(function () {
                    self.loadingTasksNum--;
                });
            }, 500)
        },
        "loadingTasksNum": {
            "get": function () {
                return this.loadingTasksNumValue < 0 ? 0 : this.loadingTasksNumValue;
            },
            "set": function (newLoadingTasksNumValue) {
                if (newLoadingTasksNumValue >= 0) {
                    this.loadingTasksNumValue = newLoadingTasksNumValue;
                } else {
                    this.loadingTasksNumValue = 0;
                }
            }
        },
        "title": {
            "get": function () {
                return this.titleValue;
            },
            "set": _.debounce(function (newTitle) {
                var self = this;
                self.loadingTasksNum++;
                $.ajax({
                    "data": {
                        "earnings": self.earnings,
                        "parent": self.parent ? self.parent.id : null,
                        "title": newTitle
                    },
                    "type": "PATCH",
                    "url": "/companies/" + self.id + "/"
                }).done(function (response) {
                    self.titleValue = response.title;
                }).fail(function (error) {
                    window.app.errorMessages.push(error.responseText);
                }).always(function () {
                    self.loadingTasksNum--;
                });
            }, 500)
        }
    },
    "created": function () {

        var self = this;
        _.forEach(self.childCompanyIds, function (companyId) {
            self.loadingTasksNum++;
            // var self = self;
            $.get("/companies/" + companyId).done(function (response) {
                self.childCompanies.push({
                    "child_companies": response.child_companies,
                    "earnings": response.earnings,
                    "id": response.id,
                    "parent": self,
                    "title": response.title
                });
            }).fail(function (error) {
                window.app.errorMessages.push(error.responseText);
            }).always(function () {
                self.loadingTasksNum--;
            });
        });
    },
    "data": function () {
        return {
            "earningsValue": this.company.earnings || 0,
            "childCompanies": [],
            "childCompanyIds": this.company.child_companies || [],
            "deleted": false,
            "id": this.company.id || undefined,
            "isBeingEdited": false,
            "isBeingExtended": false,
            "loadingTasksNumValue": 0,
            "newChildEarnings": 0,
            "newChildTitle": "",
            "parent": this.company.parent || undefined,
            "titleValue": this.company.title
        };
    },
    "methods": {
        "addChildCompany": function () {
            var self = this;
            if (self.newChildEarnings && self.newChildTitle) {
                var data = {
                    "earnings": parseInt(self.newChildEarnings),
                    "parent": self.id,
                    "title": self.newChildTitle
                };
                self.loadingTasksNum++;
                $.ajax({
                    "data": data,
                    "type": "POST",
                    "url": "/companies/"
                }).done(function (response) {
                    self.childCompanies.push({
                        "earnings": response.earnings,
                        "id": response.id,
                        "parent": self,
                        "title": response.title
                    });
                    self.earnings = self.earnings + response.earnings;
                    self.isBeingExtended = false;
                    self.newChildEarnings = 0;
                    self.newChildTitle = "";
                }).fail(function (error) {
                    window.app.errorMessages.push(error.responseText);
                }).always(function () {
                    self.loadingTasksNum--;
                });

            }
        },
        "del": function () {
            var self = this;
            if (confirm("Are you sure to delete " + self.title + " and all its children?")) {
                self.loadingTasksNum++;
                $.ajax({
                    "type": "DELETE",
                    "url": "/companies/" + self.id + "/"
                }).done(function (response) {
                    if (self.parent) {
                        self.parent.earnings = self.parent.earnings - self.earnings;
                    }
                    self.deleted = true;
                }).fail(function (error) {
                    window.app.errorMessages.push(error.responseText);
                }).always(function () {
                    self.loadingTasksNum--;
                });
            }
        }
    },
    "name": "company",
    "props": ["company"],
    "template": "#company-template"
});

window.app = new Vue({
    "computed": {
        "loadingTasksNum": {
            "get": function () {
                return this.loadingTasksNumValue < 0 ? 0 : this.loadingTasksNumValue;
            },
            "set": function (newLoadingTasksNumValue) {
                if (newLoadingTasksNumValue >= 0) {
                    this.loadingTasksNumValue = newLoadingTasksNumValue;
                } else {
                    this.loadingTasksNumValue = 0;
                }
            }
        }
    },
    "created": function () {
        $.ajaxSetup({
            "beforeSend": function (xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            }
            // "complete": function (xhr, textStatus) {
            //     window.app.loadingTasksNum--;
            // }
        });
        var self = this;
        self.loadingTasksNum++;
        $.get("/companies/").done(function (response) {
            self.companies = response.results;
        }).fail(function (error) {
            self.errorMessages.push(error.responseText);
        }).always(function () {
            self.loadingTasksNum--;
        });
    },
    "data": {
        "companies": [],
        "errorMessages": [],
        "loadingTasksNumValue": 0,
        "newEarnings": 0,
        "newTitle": ""
    },
    // delimiters: ["[[", "]]"],
    "el": "#companies-app",
    "methods": {
        "addCompany": function () {
            var self = this;
            if (self.newEarnings && self.newTitle) {
                window.app.loadingTasksNum++;
                $.ajax({
                    "data": {
                        "earnings": parseInt(self.newEarnings),
                        "parent": null,
                        "title": self.newTitle
                    },
                    "type": "POST",
                    "url": "/companies/"
                }).done(function (response) {
                    self.companies.push({
                        "earnings": response.earnings,
                        "id": response.id,
                        "title": response.title
                    });
                    self.newEarnings = 0;
                    self.newTitle = "";
                }).fail(function (error) {
                    window.app.errorMessages.push(error.responseText);
                }).always(function () {
                    window.app.loadingTasksNum--;
                });
            }
        }
    }
});
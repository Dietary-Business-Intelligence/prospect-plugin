var current_page = 1;
var total_pages = 0;
var filter_data = '';
var total_entries = 10;
var sortOrder = "";
var fieldName = "";
let customElement = document.querySelector("companies-list");
let selectedDomains = [];
let selectedItems = [];
let dataLinkedinUrl = [];
let go_to_review = false

$(document).ready(function() {

    $(customElement.shadowRoot.querySelectorAll('.select2-show-search')).each(function() {
        var selectElement = $(this);  // Get a jQuery object for the select element
        var isSelect2Clicked = false;
        selectElement.select2({
            ajax: {
                url: window.envConfig.masterapi_url + "/companies_aggregation_data",
                type: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "x-api-key": window.envConfig.api_key
                },
                delay: 250,
                data: function (params) {
                    return JSON.stringify({
                            'filter_value': params.term,
                            'filter_type': selectElement.attr('data-type'),
                            'filter_index': selectElement.attr('data-index')
                    });
                },
                processResults: function (data, params) {
                    try {
                        var parsedData = JSON.parse(data);
                        return {
                            results: $.map(parsedData.unique_names, function (item,key) {
                                return {
                                    text: item.key,
                                    id: item.key
                                };
                            })
                        };
                    } catch (e) {
                        console.error("Error parsing JSON data", e);
                        return {
                            results: []
                        };
                    }
                }
            },
            // dropdownParent: selectElement.parent(),
            // minimumInputLength: 1,
            multiple: true,
            width: '100%'
        });
    })
    $(customElement.shadowRoot.querySelector('#companies_selected')).on('click', function () {
        location.reload();
    })
    

        // Pagination functionality    
        function setupPaginationListener(selector) {
            $(customElement.shadowRoot.querySelector(selector)).on('change', function () {
                current_page = parseInt($(customElement.shadowRoot.querySelector(selector)).val());
                if ($(customElement.shadowRoot.querySelector('#find_people_content')).hasClass('active')) {
                    getPeople(selectedDomains);
                    // showPagination(1)
                } else if ($(customElement.shadowRoot.querySelector("#review_prospects_content")).hasClass('active')) {
                    // showPagination(2)
                    addToLeadNew(selectedDomains);
                } else {
                    getCompanies();
                    // showPagination(0)
                }
        
                $(customElement.shadowRoot.querySelector('html, body')).scrollTop(0);
            });
        }
        
        // Set up listeners for each pagination select
        setupPaginationListener('#pageSelect1');
        setupPaginationListener('#pageSelect2');
        setupPaginationListener('#pageSelect3');


        function setUpEntriesListener(selector){
            $(customElement.shadowRoot.querySelector(selector)).on('change', function (){
                current_page = 1;
                $(customElement.shadowRoot.querySelector('html, body')).scrollTop(0);
                total_entries = $(this).val();
                if ($(customElement.shadowRoot.querySelector('#find_people_content')).hasClass('active')) {
                    getPeople(selectedDomains);
                   
                } else if ($(customElement.shadowRoot.querySelector("#review_prospects_content")).hasClass('active')) {
                    addToLeadNew(selectedDomains);
                   
                } else {
                    getCompanies();
                    
                }
            });
        }
   
        setUpEntriesListener("#entries-select-1")
        setUpEntriesListener("#entries-select-2")
        setUpEntriesListener("#entries-select-3")

    // Show/hide pagination based on active content
    function showPagination(paginationIndex) {
        const paginations = [
            customElement.shadowRoot.querySelector('#paginationContainer1'),
            customElement.shadowRoot.querySelector('#paginationContainer2'),
            customElement.shadowRoot.querySelector('#paginationContainer3')
        ];
    
        // Show/hide pagination containers based on the active content
        for (let i = 0; i < paginations.length; i++) {
            if (i === paginationIndex) {
                $(paginations[i]).removeClass('d-none');
            } else {
                $(paginations[i]).addClass('d-none');
            }
        }
    
        // Additional logic for pagination controls (e.g., generating pagination, previous, next buttons)
        generatePagination(total_pages);
        prev(paginationIndex);
        next(paginationIndex);
    }
    
    // Show pagination for the initial content (index 0)
    showPagination(0);
 

    // For company Sorting Data
    let sortElements = customElement.shadowRoot.querySelectorAll(".sort_data");

    sortElements.forEach(function(element) {
        $(element).click(function () {
            sortOrder = $(this).data("sort-order") || "asc";
            sortOrder = sortOrder === "asc" ? "desc" : "asc";

            $(this).data("sort-order", sortOrder);
            $(sortElements).removeClass("asc desc");
            $(this).addClass(sortOrder);

            fieldName = $(this).data("type");
            current_page = 1;
            getCompanies();
        });
    });
    $(document).ready(function() {

        if(window.globalConfig.source == 'customer_linking'){
            $.ajax({
                type: "GET",
                url: 'https://api.zylererp.com/api/sales/get_sales_rep',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdGFmZmlkIjo0MywicGhwc2VydmVyIjoiZ3JlZW5qZWV2YS56eWxlcmVycC5jb20iLCJpYXQiOjE3MDQ3ODgwMjV9.FKaT3Ku1Y4hSCnYHZaqRFhI9LxvJvKBO9tLWtPqbvu0'  // or any other MIME type you want to set
                }
            }).done(function (response) {
                let optionsHTML = '<option value="" selected>Select an option</option>';
                response.data.map((data) => {
                    optionsHTML += `<option value="`+data.staffid+`">${data.alias_name}</option>`
                })
                $(customElement.shadowRoot.querySelectorAll('.staff_select')).each(function() {
                    $(this).html(optionsHTML);
                });                
            })
        }

        $(customElement.shadowRoot.querySelector('#back-btn')).on('click', function () {
            if ($(customElement.shadowRoot.querySelector('#find_people_content')).hasClass('active')) {
                $(customElement.shadowRoot.querySelector('#back-btn')).removeClass('active')
                $(customElement.shadowRoot.querySelector('#back-btn')).prop('disabled', true)
                $(customElement.shadowRoot.querySelector('#people_count')).addClass('d-none')
                // $(customElement.shadowRoot.querySelector('#review_count')).addClass('d-none')
                $(customElement.shadowRoot.querySelector('#companies_count')).removeClass('d-none')
                $(customElement.shadowRoot.querySelector('#people-listing-data')).addClass('d-none')
                $(customElement.shadowRoot.querySelector('#company-listing-data')).removeClass('d-none')
                $(customElement.shadowRoot.querySelector('#find_companies_content')).addClass('active')
                $(customElement.shadowRoot.querySelector('#find_people_content')).removeClass('active')
                $(customElement.shadowRoot.querySelector('#review-prospects-btn')).addClass('d-none')
                $(customElement.shadowRoot).find('#find-btn').html('Find People <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 320 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"/></svg>')
                $(customElement.shadowRoot.querySelector('#find-btn')).removeClass('d-none')
                $(customElement.shadowRoot.querySelector('#find-btn')).addClass('active')
                $(customElement.shadowRoot.querySelector('#find-btn')).prop('disabled', false)
            } else if($(customElement.shadowRoot.querySelector('#review_prospects_content')).hasClass('active')) {
                $(customElement.shadowRoot.querySelector('#people_count')).removeClass('d-none')
                $(customElement.shadowRoot.querySelector('#review_count')).addClass('d-none')
                $(customElement.shadowRoot.querySelector('#totalCountReview')).addClass('d-none')
                $(customElement.shadowRoot.querySelector('#review-prospects-listing-data')).addClass('d-none')
                $(customElement.shadowRoot.querySelector('#people-listing-data')).removeClass('d-none')
                $(customElement.shadowRoot.querySelector('#review-prospects-btn')).removeClass('d-none')
                $(customElement.shadowRoot.querySelector('#add-to-lead-btn')).addClass('d-none')
                $(customElement.shadowRoot.querySelector('#find_people_content')).addClass('active')
                $(customElement.shadowRoot.querySelector('#review_prospects_content')).removeClass('active')
                // $(customElement.shadowRoot.querySelector('#review-prospects-btn')).addClass('active')
                // $(customElement.shadowRoot.querySelector('#review-prospects-btn')).prop('disabled', false)
                // filter_data = ''
                // selectedItems = []
                // getPeople(selectedDomains);
            } else {
                getCompanies();
            }
        })
    });

});
setTimeout(() => {
// for people sort

let sortElementspeople = customElement.shadowRoot.querySelectorAll(".sort_people_data");

sortElementspeople.forEach(function(elementpeople) {
    $(elementpeople).click(function () {
        sortOrder = $(this).data("sort-order") || "asc";
        sortOrder = sortOrder === "asc" ? "desc" : "asc";
        $(this).data("sort-order", sortOrder);
        $(sortElementspeople).removeClass("asc desc");
        $(this).addClass(sortOrder);

        fieldName = $(this).data("type");
        current_page = 1;
        getPeople(selectedDomains);
    });
});
},1000)

$(document).ready(function () {
    $(customElement.shadowRoot.querySelector("#wishlist-span")).hide();
    $(customElement.shadowRoot.querySelector("#visited-span")).hide();
    $(customElement.shadowRoot.querySelector("#clear_all_company")).hide();
    $(customElement.shadowRoot.querySelector("#clear_all_company")).on('click', function () {
        location.reload();
    });
    $(customElement.shadowRoot.querySelector("#clear_all_people")).hide();
    $(customElement.shadowRoot.querySelector("#clear_all_people")).on('click', function () {
        //location.reload();
        $(customElement.shadowRoot.querySelector('.people_name_suggest')).val('')
        $(customElement.shadowRoot.querySelector("#designation_suggest_list")).empty();
        $(customElement.shadowRoot.querySelector("#pcompany_type_suggest_list")).empty();
        $(customElement.shadowRoot.querySelector("#company_suggest_list")).empty();
        $(customElement.shadowRoot.querySelector("#country_suggest_list")).empty();
        $(customElement.shadowRoot.querySelector("#state_suggest_list")).empty();
        $(customElement.shadowRoot.querySelector("#city_suggest_list")).empty();
        $(customElement.shadowRoot.querySelector("#industry_suggest_list")).empty();
        $(customElement.shadowRoot.querySelector("#seniority_suggest_list")).empty();
        $(customElement.shadowRoot.querySelector("#clear_all_people")).hide();
        filter_data = ''
        selectedItems = []
        getPeople(selectedDomains);
    });
    $(customElement.shadowRoot.querySelector('.company_name_suggest')).on('keydown', function (e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            $(customElement.shadowRoot.querySelector('.companies-name-filter')).trigger('click');
        }
    });
    $(customElement.shadowRoot.querySelector('.people_name_suggest')).on('keydown', function (e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            $(customElement.shadowRoot.querySelector('.people-name-filter')).trigger('click');
        }
    });
    getCompanies()
});

function removeQueryParamAndReload() {
    var currentUrl = window.location.href;
    var indexOfCompany = currentUrl.indexOf('companies');
    if (indexOfCompany !== -1 && currentUrl.charAt(indexOfCompany + 'companies'.length) === '?') {
        var updatedUrl = currentUrl.substring(0, indexOfCompany + 'companies'.length);
        history.replaceState(null, '', updatedUrl);
        location.reload();
    } else {
        location.reload();
    }
}

function headSearch(event) {
    if (event.key == 'Enter') {
        if ($(customElement.shadowRoot.querySelector('#top_search')).val() != '') {
            current_page = 1
            
            $(customElement.shadowRoot.querySelector('html, body')).scrollTop(0);
            filter_data = 'wildcard[]=' + $(customElement.shadowRoot.querySelector('#top_search')).val() + '&'
            if ($(customElement.shadowRoot.querySelector('#find_people_content')).hasClass('active')) {
                getPeople(selectedDomains);
            } else if ($(customElement.shadowRoot.querySelector("#review_prospects_content")).hasClass('active')) {
                addToLeadNew(selectedDomains);
            } else {
                getCompanies();
            }
        }
    }
}
setTimeout(() => {
    $(customElement.shadowRoot.querySelectorAll('.companies-name-filter')).on('click', function (e) {
        current_page = 1
        e.preventDefault();
        let entries_selector = ["#entries-select-1", "#entries-select-2", "#entries-select-3"];
       
        for (let selector of entries_selector) {
            let element = customElement.shadowRoot.querySelector(selector);
        
            if (element) {
                $(element).val(total_entries);
                break;
            }
        }        
        // $(customElement.shadowRoot.querySelector("#entries-select-1")).val(total_entries);
        var name = $(customElement.shadowRoot.querySelector('input[name="name[]"]')).val();
        var CompanyTypeselectedValue = $(customElement.shadowRoot.querySelector('#company_type_suggest_list')).val();
        var CompanyselectedValue = $(customElement.shadowRoot.querySelector('#company_country_suggest_list')).val();
        var CityselectedValue = $(customElement.shadowRoot.querySelector('#company_city_suggest_list')).val();
        var StateselectedValue = $(customElement.shadowRoot.querySelector('#company_state_suggest_list')).val();
        var IndustryselectedValue = $(customElement.shadowRoot.querySelector('#industry_suggest_list')).val();
        var KeywordselectedValue = $(customElement.shadowRoot.querySelector('#keyword_suggest_list')).val();
        var PeopleCountselectedValue = $(customElement.shadowRoot.querySelector('#people_count_suggest_list')).val();
        var ProductCountselectedValue = $(customElement.shadowRoot.querySelector('#product_count_suggest_list')).val();
        var IngredientCountselectedValue = $(customElement.shadowRoot.querySelector('#ingredient_count_suggest_list')).val();
        var AssigntomeselectedValue = $(customElement.shadowRoot.querySelector('#assigned_to_me_suggest_list')).val();
        var TechnologiesselectedValue = $(customElement.shadowRoot.querySelector('#technologies_suggest_list')).val();
        if (name == "" && CompanyTypeselectedValue.length == 0 && CompanyselectedValue.length == 0 && StateselectedValue.length == 0 && CityselectedValue.length == 0 && IndustryselectedValue.length == 0 && KeywordselectedValue.length == 0 && PeopleCountselectedValue.length == 0 && ProductCountselectedValue.length == 0 && IngredientCountselectedValue.length == 0 && AssigntomeselectedValue.length == 0 && TechnologiesselectedValue.length == 0) {
            $(customElement.shadowRoot.querySelector("#clear_all_company")).hide();
        } else {
            $(customElement.shadowRoot.querySelector("#clear_all_company")).show();
        }
        filter_data = '';
        if (name) {
            filter_data += getFilterfields('company_name', 'class') + $(customElement.shadowRoot.querySelector("#companies-filter-form")).find("").filter(function () {
                return $(this).val() != "";
            }).serialize();
        }
        filter_data += getFilterfields('company_location', 'class') + $(customElement.shadowRoot.querySelector("#companies-filter-form")).find("").filter(function () {
            return $(this).val() != "";
        }).serialize();
        filter_data += getFilterfields('state_company_data', 'class') + $(customElement.shadowRoot.querySelector("#companies-filter-form")).find("").filter(function () {
            return $(this).val() != "";
        }).serialize();
        filter_data += getFilterfields('city_company_data', 'class') + $(customElement.shadowRoot.querySelector("#companies-filter-form")).find("").filter(function () {
            return $(this).val() != "";
        }).serialize();
        filter_data += getFilterfields('industry', 'class') + $(customElement.shadowRoot.querySelector("#companies-filter-form")).find("").filter(function () {
            return $(this).val() != "";
        }).serialize();
        filter_data += getFilterfields('keywords', 'class') + $(customElement.shadowRoot.querySelector("#companies-filter-form")).find("").filter(function () {
            return $(this).val() != "";
        }).serialize();
        filter_data += getFilterfields('people_count', 'class') + $(customElement.shadowRoot.querySelector("#companies-filter-form")).find("").filter(function () {
            return $(this).val() != "";
        }).serialize();
        filter_data += getFilterfields('product_count', 'class') + $(customElement.shadowRoot.querySelector("#companies-filter-form")).find("").filter(function () {
            return $(this).val() != "";
        }).serialize();
        filter_data += getFilterfields('ingredient_count', 'class') + $(customElement.shadowRoot.querySelector("#companies-filter-form")).find("").filter(function () {
            return $(this).val() != "";
        }).serialize();
        filter_data += getFilterfields('assigned_to_me', 'class') + $(customElement.shadowRoot.querySelector("#companies-filter-form")).find("").filter(function () {
            return $(this).val() != "";
        }).serialize();
        if(window.globalConfig.source == 'customer_linking'){
            filter_data += getFilterfields('assigned_staff_select', 'class') + $(customElement.shadowRoot.querySelector("#companies-filter-form")).find("").filter(function () {
                return $(this).val() != "";
            }).serialize();
        }
        filter_data += getFilterfields('technologies', 'class') + $(customElement.shadowRoot.querySelector("#companies-filter-form")).find("").filter(function () {
            return $(this).val() != "";
        }).serialize();

        $(customElement.shadowRoot.querySelector('html, body')).scrollTop(0);
        getCompanies();
    })

    $(customElement.shadowRoot.querySelectorAll('.people-name-filter')).on('click', function (e) {
        e.preventDefault();
        current_page = 1
        let entries_selector = ["#entries-select-1", "#entries-select-2", "#entries-select-3"];
        // $("#entries-select").val(total_entries);
        for (let selector of entries_selector) {
            let element = customElement.shadowRoot.querySelector(selector);
        
            if (element) {
                $(element).val(total_entries);
                break;
            }
        }        
        var name = $(customElement.shadowRoot.querySelector('input[name="people_name[]"]')).val();
        var people_title = $(customElement.shadowRoot.querySelector('#designation_suggest_list')).val();
        var people_company_type = $(customElement.shadowRoot.querySelector('#pcompany_type_suggest_list')).val();
        var people_company = $(customElement.shadowRoot.querySelector('#company_suggest_list')).val();
        var people_country = $(customElement.shadowRoot.querySelector('#country_suggest_list')).val();
        var people_state = $(customElement.shadowRoot.querySelector('#state_suggest_list')).val();
        var people_city = $(customElement.shadowRoot.querySelector('#city_suggest_list')).val();
        var people_industry = $(customElement.shadowRoot.querySelector('#industry_suggest_list')).val();
        var people_seniority = $(customElement.shadowRoot.querySelector('#seniority_suggest_list')).val();
        var people_keyword = $(customElement.shadowRoot.querySelector('#keyword_people_suggest_list')).val();
        if(name == '' && people_title.length == 0  && people_company_type.length == 0 &&  people_company.length == 0 && people_country.length == 0 && people_state.length == 0 && people_city.length == 0 && people_industry.length == 0 && people_seniority.length == 0 && people_keyword.length == 0){
            $(customElement.shadowRoot.querySelector("#clear_all_people")).hide();

        }else{
            $(customElement.shadowRoot.querySelector("#clear_all_people")).show();
        }
        filter_data='';
        let filter_field = $(this).attr('filter_data_id');
        if(name){
            filter_data +=getFilterfields('people_name','class') + $('#people-filter-form').find("").filter(function(){ return $(this).val() != ""; }).serialize();
        }
        filter_data +=getFilterfields('designation_data','class') + $('#people-filter-form').find("").filter(function(){ return $(this).val() != ""; }).serialize();
        filter_data +=getFilterfields('pcompany_type','class') + $('#people-filter-form').find("").filter(function(){ return $(this).val() != ""; }).serialize();
        filter_data +=getFilterfields('company_data','class') + $('#people-filter-form').find("").filter(function(){ return $(this).val() != ""; }).serialize();
        filter_data +=getFilterfields('country_data','class') + $('#people-filter-form').find("").filter(function(){ return $(this).val() != ""; }).serialize();
        filter_data +=getFilterfields('state_data','class') + $('#people-filter-form').find("").filter(function(){ return $(this).val() != ""; }).serialize();
        filter_data +=getFilterfields('city_data','class') + $('#people-filter-form').find("").filter(function(){ return $(this).val() != ""; }).serialize();
        filter_data +=getFilterfields('industry_data','class') + $('#people-filter-form').find("").filter(function(){ return $(this).val() != ""; }).serialize();
        filter_data +=getFilterfields('keyword_data','class') + $('#people-filter-form').find("").filter(function(){ return $(this).val() != ""; }).serialize();
        filter_data +=getFilterfields('seniority_data','class') + $('#people-filter-form').find("").filter(function(){ return $(this).val() != ""; }).serialize();
        $('html, body').scrollTop(0);
        getPeople(selectedDomains);

    })
}, 1000)


setTimeout(() => {
    $(customElement.shadowRoot.querySelectorAll('.companies-filter')).on('change', function (e) {
        current_page = 1
        e.preventDefault();
        let entries_selector = ["#entries-select-1", "#entries-select-2", "#entries-select-3"];
       
        for (let selector of entries_selector) {
            let element = customElement.shadowRoot.querySelector(selector);
        
            if (element) {
                $(element).val(total_entries);
                break;
            }
        }        
        var name = $(customElement.shadowRoot.querySelector('input[name="name[]"]')).val();
        var CompanyTypeselectedValue = $(customElement.shadowRoot.querySelector('#company_type_suggest_list')).val();
        var CompanyselectedValue = $(customElement.shadowRoot.querySelector('#company_country_suggest_list')).val();
        var CityselectedValue = $(customElement.shadowRoot.querySelector('#company_city_suggest_list')).val();
        var StateselectedValue = $(customElement.shadowRoot.querySelector('#company_state_suggest_list')).val();
        var IndustryselectedValue = $(customElement.shadowRoot.querySelector('#industry_suggest_list')).val();
        var KeywordselectedValue = $(customElement.shadowRoot.querySelector('#keyword_suggest_list')).val();
        var PeopleCountselectedValue = $(customElement.shadowRoot.querySelector('#people_count_suggest_list')).val();
        var ProductCountselectedValue = $(customElement.shadowRoot.querySelector('#product_count_suggest_list')).val();
        var IngredientCountselectedValue = $(customElement.shadowRoot.querySelector('#ingredient_count_suggest_list')).val();
        var AssigntomeselectedValue = $(customElement.shadowRoot.querySelector('#assigned_to_me_suggest_list')).val();
        if (name == "" && CompanyTypeselectedValue.length == 0 && CompanyselectedValue.length == 0 && StateselectedValue.length == 0 && CityselectedValue.length == 0 && IndustryselectedValue.length == 0 && KeywordselectedValue.length == 0 && PeopleCountselectedValue.length == 0 && ProductCountselectedValue.length == 0 && IngredientCountselectedValue.length == 0 && AssigntomeselectedValue.length == 0) {
            $(customElement.shadowRoot.querySelector("#clear_all_company")).hide();

        } else {
            $(customElement.shadowRoot.querySelector("#clear_all_company")).show();
        }
        filter_data = '';
        if (name) {
            filter_data += getFilterfields('company_name', 'class') + $(customElement.shadowRoot.querySelector("#companies-filter-form")).find("").filter(function () {
                return $(this).val() != "";
            }).serialize();
        }
        filter_data += getFilterfields('company_location', 'class') + $(customElement.shadowRoot.querySelector("#companies-filter-form")).find("").filter(function () {
            return $(this).val() != "";
        }).serialize();
        filter_data += getFilterfields('company_type', 'class') + $(customElement.shadowRoot.querySelector("#companies-filter-form")).find("").filter(function () {
            return $(this).val() !="";
        }).serialize();
        filter_data += getFilterfields('state_company_data', 'class') + $(customElement.shadowRoot.querySelector("#companies-filter-form")).find("").filter(function () {
            return $(this).val() != "";
        }).serialize();
        filter_data += getFilterfields('city_company_data', 'class') + $(customElement.shadowRoot.querySelector("#companies-filter-form")).find("").filter(function () {
            return $(this).val() != "";
        }).serialize();
        filter_data += getFilterfields('industry', 'class') + $(customElement.shadowRoot.querySelector("#companies-filter-form")).find("").filter(function () {
            return $(this).val() != "";
        }).serialize();
        filter_data += getFilterfields('keywords', 'class') + $(customElement.shadowRoot.querySelector("#companies-filter-form")).find("").filter(function () {
            return $(this).val() != "";
        }).serialize();
        filter_data += getFilterfields('people_count', 'class') + $(customElement.shadowRoot.querySelector("#companies-filter-form")).find("").filter(function () {
            return $(this).val() != "";
        }).serialize();
        filter_data += getFilterfields('product_count', 'class') + $(customElement.shadowRoot.querySelector("#companies-filter-form")).find("").filter(function () {
            return $(this).val() != "";
        }).serialize();
        filter_data += getFilterfields('ingredient_count', 'class') + $(customElement.shadowRoot.querySelector("#companies-filter-form")).find("").filter(function () {
            return $(this).val() != "";
        }).serialize();
        filter_data += getFilterfields('assigned_to_me', 'class') + $(customElement.shadowRoot.querySelector("#companies-filter-form")).find("").filter(function () {
            return $(this).val() != "";
        }).serialize();
        if(window.globalConfig.source == 'customer_linking'){
            filter_data += getFilterfields('assigned_staff_select', 'class') + $(customElement.shadowRoot.querySelector("#companies-filter-form")).find("").filter(function () {
                return $(this).val() != "";
            }).serialize();
        }
        filter_data += getFilterfields('technologies', 'class') + $(customElement.shadowRoot.querySelector("#companies-filter-form")).find("").filter(function () {
            return $(this).val() != "";
        }).serialize();
        $(customElement.shadowRoot.querySelector('html, body')).scrollTop(0);
        getCompanies();

    })

    $(customElement.shadowRoot.querySelectorAll('.people-filter')).on('change', function (e) {
        current_page = 1
        e.preventDefault();
        let entries_selector = ["#entries-select-1", "#entries-select-2", "#entries-select-3"];
       
        for (let selector of entries_selector) {
            let element = customElement.shadowRoot.querySelector(selector);
        
            if (element) {
                $(element).val(total_entries);
                break;
            }
        }        
        var name = $(customElement.shadowRoot.querySelector('input[name="people_name[]"]')).val();
        var people_title = $(customElement.shadowRoot.querySelector('#designation_suggest_list')).val();
        var people_company_type = $(customElement.shadowRoot.querySelector('#pcompany_type_suggest_list')).val();
        var people_company = $(customElement.shadowRoot.querySelector('#company_suggest_list')).val();
        var people_country = $(customElement.shadowRoot.querySelector('#country_suggest_list')).val();
        var people_state = $(customElement.shadowRoot.querySelector('#state_suggest_list')).val();
        var people_city = $(customElement.shadowRoot.querySelector('#city_suggest_list')).val();
        var people_industry = $(customElement.shadowRoot.querySelector('#industry_suggest_list')).val();
        var people_seniority = $(customElement.shadowRoot.querySelector('#seniority_suggest_list')).val();
        if(name == '' && people_company_type.length == 0 && people_title.length == 0 && people_company.length == 0 && people_country.length == 0 && people_state.length == 0 && people_city.length == 0 && people_industry.length == 0 && people_seniority.length == 0){
            $(customElement.shadowRoot.querySelector("#clear_all_people")).hide();
        }else{
            $(customElement.shadowRoot.querySelector("#clear_all_people")).show();
        }
        filter_data='';
        let filter_field = $(this).attr('filter_data_id');
        if(name){
            filter_data +=getFilterfields('people_name','class') + $('#people-filter-form').find("").filter(function(){ return $(this).val() != ""; }).serialize();
        }
        filter_data +=getFilterfields('designation_data','class') + $('#people-filter-form').find("").filter(function(){ return $(this).val() != ""; }).serialize();
        filter_data +=getFilterfields('pcompany_type','class') + $('#people-filter-form').find("").filter(function(){ return $(this).val() != ""; }).serialize();
        filter_data +=getFilterfields('company_data','class') + $('#people-filter-form').find("").filter(function(){ return $(this).val() != ""; }).serialize();
        filter_data +=getFilterfields('country_data','class') + $('#people-filter-form').find("").filter(function(){ return $(this).val() != ""; }).serialize();
        filter_data +=getFilterfields('state_data','class') + $('#people-filter-form').find("").filter(function(){ return $(this).val() != ""; }).serialize();
        filter_data +=getFilterfields('city_data','class') + $('#people-filter-form').find("").filter(function(){ return $(this).val() != ""; }).serialize();
        filter_data +=getFilterfields('industry_data','class') + $('#people-filter-form').find("").filter(function(){ return $(this).val() != ""; }).serialize();
        filter_data +=getFilterfields('keyword_data','class') + $('#people-filter-form').find("").filter(function(){ return $(this).val() != ""; }).serialize();
        filter_data +=getFilterfields('seniority_data','class') + $('#people-filter-form').find("").filter(function(){ return $(this).val() != ""; }).serialize();
        $('html, body').scrollTop(0);
        getPeople(selectedDomains);

    })
}, 1000)

function generatePagination(total_pages) {
    let entries_selector = ["#entries-select-1", "#entries-select-2", "#entries-select-3"];
    let total_entries;

    for (let selector of entries_selector) {
        let element = customElement.shadowRoot.querySelector(selector);

        if (element) {
            total_entries = $(element).val();
            break;
        }
    }

    if (total_pages >= 100) {
        var visible_pages = 100;
    } else {
        var visible_pages = Math.ceil(total_pages);
    }

    let options = '';
    let previousButtonId = 'previousButton1';
    let nextButtonId = 'nextButton1';
    let previousButton = customElement.shadowRoot.querySelector('#' + previousButtonId);
    let nextButton = customElement.shadowRoot.querySelector('#' + nextButtonId);

    if (current_page == 1) {
        previousButton.classList.add('disabled');
    } else {
        previousButton.classList.remove('disabled');
    }

    let selected;
    for (var i = 1; i <= visible_pages; i++) {
        if (total_entries * i === 1000) {
            if (current_page === i) {
                selected = 'selected';
                nextButton.classList.add('disabled');
            } else {
                selected = '';
                nextButton.classList.remove('disabled');
            }
            options += '<option value="' + i + '" ' + selected + '>' + i + '</option>';
            break;
        } else {
            if (current_page === i) {
                selected = 'selected';
                nextButton.classList.add('disabled');
            } else {
                selected = '';
                nextButton.classList.remove('disabled');
            }
            options += '<option value="' + i + '" ' + selected + '>' + i + '</option>';
        }
    }

    let pageSelectSelector = ["#pageSelect1", "#pageSelect2", "#pageSelect3"];

    for (let selector of pageSelectSelector) {
        let element = customElement.shadowRoot.querySelector(selector);
        if(element) {
            $(element).html(options);
            
        }
    }
}



function prev(paginationIndex) {
    if (current_page > 1) {
        current_page--;
        if ($(customElement.shadowRoot.querySelector('#find_people_content')).hasClass('active')) {
            getPeople(selectedDomains)
        } else if($(customElement.shadowRoot.querySelector('#review_prospects_content')).hasClass('active')){
            addToLeadNew(selectedDomains)
        }
        else {
            getCompanies();
        }
        // showPagination(paginationIndex)
        // updateCheckAllCheckbox()
    }
}

function next(paginationIndex) {
    if (current_page < total_pages) {
        current_page++;
        if ($(customElement.shadowRoot.querySelector('#find_people_content')).hasClass('active')) {
            getPeople(selectedDomains)
        }else if($(customElement.shadowRoot.querySelector('#review_prospects_content')).hasClass('active')){
            addToLeadNew(selectedDomains)
        } else {
            getCompanies();
        }
        // showPagination(paginationIndex)
        // var checkAllCheckbox = customElement.shadowRoot.querySelector('#checkAllCompany');

        // // Set the checked property of 'checkAllCompany' based on the state of other checkboxes
        // checkAllCheckbox.checked = false;
        // updateCheckAllCheckbox()
    }
}

$(function () {
    $(customElement.shadowRoot.querySelector('.filter-scroll')).slimScroll({
        height: '250px'
    });
});

function changeValueStr(value) {
    var dd = value;
    dd = dd.replace('&', '|');
    dd = dd.replace(',', '#');
    return dd;
}

function encryptData(data) {
    let encryptedData = '';
    for (let i = 0; i < data.length; i++) {
        encryptedData += '&#' + data.charCodeAt(i) + ';';
    }
    return encryptedData;
}

function sanitizeCompanyName(companyName) {
    if (typeof companyName !== 'undefined' && companyName !== null) {
        var sanitizedName = companyName.replace(/\s/g, '-');
        sanitizedName = sanitizedName.replace(/'s/g, '-s');
        sanitizedName = sanitizedName.replace(/[,'"]/g, '');
        sanitizedName = sanitizedName.replace(/[^a-zA-Z0-9-]/g, '-');
        sanitizedName = sanitizedName.toLowerCase();
        return sanitizedName;
    } else {
        return '';
    }
}


function getCompanies() {
    let total_entries;
    let entries_selector = ["#entries-select-1", "#entries-select-2", "#entries-select-3"];
    for (let selector of entries_selector) {
        let element = customElement.shadowRoot.querySelector(selector);

        if (element) {
            total_entries = $(element).val();
            break;
        }
    }

    // Default to 10 if no matching element is found
    total_entries = total_entries || 10;

    $(customElement.shadowRoot.querySelector('#loader')).fadeIn();
    if(fieldName == ""){
        var field_name = 'product_count';
    }else {
        var field_name = fieldName;
    }
    if(sortOrder == ""){
        var sort_order = 'desc';
    }else {
        var sort_order = sortOrder;
    }

    $.ajax({
        type: "POST",
        url: window.envConfig.masterapi_url +  "/ajax_companies_listing",
        //url: 'http://18.118.9.80:5002/zyler_org',
        data: JSON.stringify({
            params: {
                'page': current_page,
                'filters': filter_data,
                'length': total_entries,
                'fieldName': field_name,
                'sortOrder': sort_order,
                'user_id': window.globalConfig.user_id
            }
        }),
        headers: {
            "Content-Type": "application/json",
            "x-api-key": window.envConfig.api_key  // or any other MIME type you want to set
        }
    }).done(function (response) {
        if (response.fetched_count == 0){
            var nodatafound = 'No results found';
        }
        let table = '';
        var itr=0;
        $.each(response.items, function (key, data) {

            var imgtag = '';
            var svgimg = '';
            if (data.organization.svg_content != null || data.organization.svg_content != undefined || data.organization.svg_content != '') {
                var company_logo = '';
                var imgtag = '';
                var svgimg = data.organization.svg_content;
            }
            if (data.organization.svg_content == null || data.organization.svg_content == undefined || data.organization.svg_content == '') {
                var company_logo = data.organization.logo_url;
                var imgtag = '<img src="' + company_logo + '" alt="" width="50px" height="50px" class="default_companyimg"/>';
                var svgimg = '';
            }
            if (data.organization.logo_url == '' || data.organization.logo_url == undefined || data.organization.logo_url == null) {
                var imgtag = '<img src="'+ window.envConfig.base_url + 'assets/img/default_company.png" alt="" width="50px" height="50px" class="default_companyimg"/>';
                var svgimg = '';
            }

            const org = data.organization;
            table += '<tr class="accordion-header collapsed  accordion-item" id="flush-headingOne' + key + '" >\n' +
              '<td>' + (org.assigned_to_me == 1 ?
          '<div class="form-group form-check">'+
          (window.globalConfig.source == 'customer_linking' ? data.organization.account_owner == '' ? '<input type="checkbox" class="form-check-input company_checkbox" name="client_checkbox[]" value="" data-primary-domain="'+ data.organization.primary_domain+'" data-organization="'+JSON.stringify(data.organization).replace(/"/g, "'")+'">' : '' : '<input type="checkbox" class="form-check-input company_checkbox" name="client_checkbox[]" value="" data-primary-domain="'+ data.organization.primary_domain+'" data-organization="'+JSON.stringify(data.organization).replace(/"/g, "'")+'">')
          +
          '</div>': '')+'</td>\n'+
                '                        <td class="person-details d-flex align-items-center">\n'+
                '                            <div class="profile-image">\n' +
                '                                <a href="#">\n' +
                '                                    ' + imgtag + '\n' + '' + svgimg + ' \n' +
                '                                </a>\n' +
                '                            </div>\n' +
                '                            <div class="profile-caption">\n' +
                '                                <a href="https://nexus-data.io/dictionary/details/companies/'+data.organization.primary_domain+'/'+sanitizeCompanyName(data.organization.name)+'" target="_blank">\n' +
                '                                    <h3 data-bs-toggle="tooltip" title="' + data.organization.name + '">' + data.organization.name + '</h3>\n' +
                '                                </a>\n' +
                '                                <ul class="links social-rr-icons icon-circle list-unstyled list-inline">\n' +
                '                                    ' + (data.organization.website_url == undefined || data.organization.website_url == null || data.organization.website_url == '' ? '': '<li class="website-url" title="Website">\n' +
                    '                                        <a target="_blank" href="' + data.organization.website_url + '">\n' +
                    '                                           <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 640 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M579.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L422.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C206.5 251.2 213 330 263 380c56.5 56.5 148 56.5 204.5 0L579.8 267.7zM60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C74 372 74 321 105.5 289.5L217.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C433.5 260.8 427 182 377 132c-56.5-56.5-148-56.5-204.5 0L60.2 244.3z"/></svg>\n' +
                    '                                        </a>\n' +
                    '                                    </li>\n') + '\n' + '' + (data.organization.linkedin_url == undefined || data.organization.linkedin_url == null || data.organization.linkedin_url == '' ? '': '<li class="linkedin" title="Linked In">\n' +
                    '                                        <a target="_blank" href="' + data.organization.linkedin_url + '">\n' +
                    '                                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"/></svg>\n' +
                    '                                        </a>\n' +
                    '                                    </li>\n') + '\n' + '' + (data.organization.facebook_url == undefined || data.organization.facebook_url == null || data.organization.facebook_url == '' ? '': '<li class="facebook" title="Facebook In">\n' +
                    '                                        <a target="_blank" href="' + data.organization.facebook_url + '">\n' +
                    '                                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z"/></svg>\n' +
                    '                                        </a>\n' +
                    '                                    </li>\n') + '\n' + '' + (data.organization.twitter_url == undefined || data.organization.twitter_url == null || data.organization.twitter_url == '' ? '': '<li class="twitter" title="Twitter In">\n' +
                    '                                        <a target="_blank" href="' + data.organization.twitter_url + '">\n' +
                    '                                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"/></svg>\n' +
                    '                                        </a>\n' +
                    '                                    </li>\n') + '\n' +
                '                                </ul>\n' +
                '                            </div>\n' +
                '                        </td>\n' +
                '                        <td>\n' +
                '                            <span data-bs-toggle="tooltip" title="' + data.organization.industry + '">' + (data.organization.industry == null ? "N/A" : data.organization.industry) + '</span>\n' +
                '                        </td>\n' +
                '                        <td>\n' +
                '                            <span data-bs-toggle="tooltip" title="' + data.organization.merged_keywords + '">' + data.organization.merged_keywords + '</span>\n' +
                '                        </td>\n' +
                '                        <td class="location"><span data-bs-toggle="tooltip" title="' +data.organization.company_location+'">' +data.organization.company_location+'</span></td>\n' +
                '                        <td class="company_type"><span data-bs-toggle="tooltip" title="' +data.organization.company_type+'">' +data.organization.company_type+'</span></td>\n' +
                '                        <td class="EmployeeSize">\n' +
                '                            <span>' + data.organization.people_count_printed + '</span>\n' +
                '                        </td>\n' +
                '                        <td class="IngredientCount">\n' +
                '                        ' + data.organization.ingredient_count_printed + ' \n' +
                '                        </td>\n' +
                '                        <td class="productcount">\n' +
                '                            <span>' + data.organization.product_count_printed + '</span>\n' +
                '                        </td>\n' +
                '                        <td class="companyRevenue">\n' +
                '                            <div class="metric-value">$' + data.organization.annual_revenue_printed + '</div>\n' +
                '                        </td>\n' +
                (window.globalConfig.source == 'customer_linking' ? '                        <td class="account_owner">\n' +
                '                            <span>' + data.organization.account_owner + '</span>\n' +
                '                        </td>\n' : '')
                '                        <td class="lastupdated">\n' +
                '                            <div class="metric-value">' + data.organization.last_update + '</div>\n' +
                '                        </td>\n' +
                '<td class="action-arrow" id="deptchart_keypeople"  >' +
                '</div>' +
                '</td>' +
                '                    </tr>\n' +


            itr++;
        })
        $(customElement.shadowRoot.querySelector('#loader')).fadeOut();
        $(customElement.shadowRoot.querySelector('#companies-data-table')).html(table);
        $(customElement.shadowRoot.querySelector('#companies-data-table')).text(nodatafound);
        $(customElement.shadowRoot.querySelector('#totalCountCompanies')).removeClass('d-none');
        var checkAllCheckbox = customElement.shadowRoot.querySelector('#checkAllCompany');
        if (checkAllCheckbox.checked===true) {
            // checkAllCheckbox.checked = allChecked;
            let selectCompanyCount = JSON.parse(localStorage.getItem('dataPrimaryDomain')) || [];
        }
        if (response.fetched_count == response.total_count) {
            $(customElement.shadowRoot.querySelector('#totalCountCompanies')).text(response.fetched_count.toLocaleString());
            $(customElement.shadowRoot.querySelector('#totalSelectedCountCompany')).text(response.fetched_count.toLocaleString());
        } else {
            $(customElement.shadowRoot.querySelector('#totalCountCompanies')).text(response.fetched_count.toLocaleString() + ' of ' + response.total_count.toString());
            $(customElement.shadowRoot.querySelector('#totalSelectedCountCompany')).text(response.fetched_count.toLocaleString() + ' of ' + response.total_count.toString());
        }
        $(customElement.shadowRoot.querySelector('#total_pages')).text(parseInt(response.total_pages).toLocaleString());
        total_pages = response.total_pages
        generatePagination(total_pages, 1);
        CheckSavedPrimaryDomain();

    })
}

function searchList($id, $FilterClass) {
    var input, filter, ul, li, a, i;
    input = document.getElementById("myInput");
    filter = $(customElement.shadowRoot.querySelector('.' + $FilterClass)).val().toUpperCase();
    ul = document.getElementById($id);
    li = ul.getElementsByTagName("li");
    for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("label")[0];
        if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";

        }
    }
}

function getFilterfields(field, selector = '') {
    let value = '';
    if (selector == 'class') {
        value = $(customElement.shadowRoot.querySelector("." + field + '_suggest')).val();
    } else {
        value = $(customElement.shadowRoot.querySelector("#" + field + '_suggest')).val();
    }

    if (typeof value == 'string') {
        value = value.split(",");
    }
    if (value.length != 0 && value.length != undefined) {
        var str = '';
        for (var i = 0; i < value.length; i++) {
            var data = value[i].split('|');
            var dd = value[i];
            dd = dd.replace(/&/g, '|@#$@#$@#$');
            str = str + field + '[]=' + encodeURIComponent(dd);
            if (i < value.length - 1)
                str = str + '&';
        }
        if (str)
            return str + '&';
        else
            return str;
    } else {
        return '';
    }
}

// Function to save the checkbox data-primary-domain to localStorage
function saveDataPrimaryDomain() {
    const checkboxes = customElement.shadowRoot.querySelectorAll('.company_checkbox');
    let dataPrimaryDomain = JSON.parse(localStorage.getItem('dataPrimaryDomain')) || [];
    let dataOrganization = JSON.parse(localStorage.getItem('dataOrganization')) || [];

    checkboxes.forEach(checkbox => {
        const dataPrimaryDomainValue = checkbox.getAttribute('data-primary-domain');
        if (checkbox.checked && !dataPrimaryDomain.includes(dataPrimaryDomainValue)) {
            dataPrimaryDomain.push(dataPrimaryDomainValue);
        } else if (!checkbox.checked) {
            const index = dataPrimaryDomain.indexOf(dataPrimaryDomainValue);
            if (index !== -1) {
                dataPrimaryDomain.splice(index, 1);
            }
        }

        const dataOrganizationValue = checkbox.getAttribute('data-organization');
        if (dataOrganizationValue !== null && checkbox.checked && !dataOrganization.includes(dataOrganizationValue)) {
            dataOrganization.push(dataOrganizationValue);
        } else if (!checkbox.checked) {
            const index = dataOrganization.indexOf(dataOrganizationValue);
            if (index !== -1) {
                dataOrganization.splice(index, 1);
            }
        }
    });

    // Remove duplicates and filter out null values
    dataPrimaryDomain = [...new Set(dataPrimaryDomain)];
    dataOrganization = [...new Set(dataOrganization)].filter(item => item !== null);

    // Save the data to localStorage
    localStorage.setItem('dataPrimaryDomain', JSON.stringify(dataPrimaryDomain));
    localStorage.setItem('dataOrganization', JSON.stringify(dataOrganization));
}



function saveDataLinkedinUrl() {
    const checkboxes = customElement.shadowRoot.querySelectorAll('.people_checkbox');
    const dataLinkedinUrl = JSON.parse(localStorage.getItem('dataLinkedinUrl')) || [];

    checkboxes.forEach(checkbox => {
        const dataLinkedinUrlValue = checkbox.getAttribute('data-linkedin-url');

        // Check if the LinkedIn URL is already in the array
        const existingEntryIndex = dataLinkedinUrl.findIndex(entry => entry.linkedin_url === dataLinkedinUrlValue);

        if (checkbox.checked) {
            // If not in the array, add a new entry
            if (existingEntryIndex === -1) {
                const data = {
                    'first_name': checkbox.getAttribute('data-first-name'),
                    'last_name': checkbox.getAttribute('data-last-name'),
                    'email': checkbox.getAttribute('data-email'),
                    'phonenumber': checkbox.getAttribute('data-phone'),
                    'company': checkbox.getAttribute('data-company_name'),
                    'user_id': window.globalConfig.user_id,
                    'linkedin': dataLinkedinUrlValue,
                    'facebook': checkbox.getAttribute('data-facebook-url'),
                    'twitter': checkbox.getAttribute('data-twitter-url'),
                    'company_website': checkbox.getAttribute('data-company_website'),
                    'primary_domain': checkbox.getAttribute('data-primary_domain'),
                    'email': checkbox.getAttribute('data-email'),
                    
                    'contact_user_country': checkbox.getAttribute('data-contact_user_country'),
                    'contact_user_phonenumber': checkbox.getAttribute('data-contact_user_phonenumber'),
                    'state': checkbox.getAttribute('data-state'),
                    'city': checkbox.getAttribute('data-city'),
                    'company_country': checkbox.getAttribute('data-company_country')
                };
                dataLinkedinUrl.push(data);
            }
        } else {
            // If unchecked and in the array, remove the entry
            if (existingEntryIndex !== -1) {
                dataLinkedinUrl.splice(existingEntryIndex, 1);
            }
        }
    });

    // Save the data to localStorage
    localStorage.setItem('dataLinkedinUrl', JSON.stringify(dataLinkedinUrl));
}

function clearLocalStorageOnUnload() {
    localStorage.removeItem('dataPrimaryDomain');
    localStorage.removeItem('dataLinkedinUrl');
    localStorage.removeItem('dataOrganization');
}

// Set the clearLocalStorageOnUnload function to run when the page is unloaded
window.onbeforeunload = clearLocalStorageOnUnload;

function CheckSavedPrimaryDomain() {
    const checkboxes = customElement.shadowRoot.querySelectorAll('.company_checkbox');
    const savedDataPrimaryDomain = JSON.parse(localStorage.getItem('dataPrimaryDomain')) || [];

    checkboxes.forEach(checkbox => {
        const dataPrimaryDomainValue = checkbox.getAttribute('data-primary-domain');
        if (savedDataPrimaryDomain.includes(dataPrimaryDomainValue)) {
            checkbox.checked = true;
        }
    });

    // Push the entire saved data from localStorage into selectedDomains
    selectedDomains.push(...savedDataPrimaryDomain);

    // Remove duplicates from selectedDomains using Set
    selectedDomains = Array.from(new Set(selectedDomains));
}



function checkSavedLinkedinUrl() {
    const checkboxes = customElement.shadowRoot.querySelectorAll('.people_checkbox');
    const savedDataLinkedinUrl = JSON.parse(localStorage.getItem('dataLinkedinUrl')) || [];

    checkboxes.forEach(checkbox => {
        const dataLinkedinUrlValue = checkbox.getAttribute('data-linkedin-url');
        if (savedDataLinkedinUrl.includes(dataLinkedinUrlValue)) {
            checkbox.checked = true;
        }
    });

    dataLinkedinUrl.push(...savedDataLinkedinUrl);
    selectedItems.push(...savedDataLinkedinUrl);
}

// Attach change event listener to checkboxes
const checkboxes = customElement.shadowRoot.querySelectorAll('.company_checkbox');
checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', handleCheckboxChange);
});
const peoplecheckboxes = customElement.shadowRoot.querySelectorAll('.people_checkbox');
    peoplecheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', ReviewCheckboxChange);
    });
// Function to retrieve data from localStorage and update checkboxes
function retrieveDataPrimaryDomain() {
    const checkboxes = customElement.shadowRoot.querySelectorAll('.company_checkbox');
    const savedDataPrimaryDomain = JSON.parse(localStorage.getItem('dataPrimaryDomain')) || [];

    checkboxes.forEach(checkbox => {
        const dataPrimaryDomain = checkbox.getAttribute('data-primary-domain');
        if (savedDataPrimaryDomain.includes(dataPrimaryDomain)) {
            checkbox.checked = true;
        }
    });
}

function retrieveDataLinkedinUrl() {
    const checkboxes = customElement.shadowRoot.querySelectorAll('.people_checkbox');
    const savedDataLinkedinUrl = JSON.parse(localStorage.getItem('dataLinkedinUrl')) || [];

    checkboxes.forEach(checkbox => {
        const dataLinkedinUrl = checkbox.getAttribute('data-linkedin-url');

        // Check if dataLinkedinUrl exists in any of the objects' linkedin_url key
        const existsInSavedData = savedDataLinkedinUrl.some(obj => obj.linkedin_url === dataLinkedinUrl);

        if (existsInSavedData) {
            checkbox.checked = true;
        }
    });
}


// Update checkboxes from localStorage when the page loads
window.addEventListener('load', retrieveDataPrimaryDomain);
function handleCheckboxChange() {
    saveDataPrimaryDomain();
    const checkboxes = customElement.shadowRoot.querySelectorAll('.company_checkbox');

    // Check if every checkbox in the NodeList is checked
    var allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);

    // Get the 'checkAllCompany' checkbox
    var checkAllCheckbox = customElement.shadowRoot.querySelector('#checkAllCompany');

    // Set the checked property of 'checkAllCompany' based on the state of other checkboxes
    checkAllCheckbox.checked = allChecked;


    const findPeopleBtn = customElement.shadowRoot.querySelector('#find-btn');
    const assignBtn = customElement.shadowRoot.querySelector('#assign_companies');
    const isAnyChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);
    if(assignBtn){
        assignBtn.disabled = !isAnyChecked;
    }
    if(findPeopleBtn){
        // Check if at least one checkbox is checked
    findPeopleBtn.disabled = !isAnyChecked;
    if(isAnyChecked){
        $(customElement.shadowRoot.querySelector('#find-btn')).addClass('active')
        // $(customElement.shadowRoot.querySelector('#find-btn')).prop('disabled', false)
    } else {
        $(customElement.shadowRoot.querySelector('#find-btn')).removeClass('active')
        // $(customElement.shadowRoot.querySelector('#find-btn')).prop('disabled', true)
    }
    }
    // const find_btn = $(customElement.shadowRoot.querySelector('#find-btn')).hasClass('active')
    // const backBtn = $(customElement.shadowRoot.querySelector('#back-btn'))
}
//  window.addEventListener('load', retrieveDataLinkedinUrl);

function ReviewCheckboxChange() {
    saveDataLinkedinUrl()
    //checkSavedLinkedinUrl()
    const checkboxes = JSON.parse(localStorage.getItem('dataLinkedinUrl'));
    const findReviewPrBtn = customElement.shadowRoot.querySelector('#review-prospects-btn');

    // Check if at least one checkbox is checked
    if(checkboxes.length > 0){
        findReviewPrBtn.disabled = false
        $(customElement.shadowRoot.querySelector('#review-prospects-btn')).addClass('active')
        $(customElement.shadowRoot.querySelector('#review-prospects-btn')).removeClass('d-none')
        $(customElement.shadowRoot.querySelector('#find-btn')).addClass('d-none')
    } else{
        findReviewPrBtn.disabled = true
        $(customElement.shadowRoot.querySelector('#review-prospects-btn')).removeClass('active')
    }
}

function reviewProspects(){
    $('#loader').fadeIn()
    $(customElement.shadowRoot.querySelector('#find_people_content')).removeClass('active')
    $(customElement.shadowRoot.querySelector('#review_prospects_content')).addClass('active')
    // $(customElement.shadowRoot.querySelector('#totalCountPeople')).html(JSON.parse(localStorage.getItem('dataLinkedinUrl')).length)
    $(customElement.shadowRoot.querySelector('#totalCountReview')).html(JSON.parse(localStorage.getItem('dataLinkedinUrl')).length)
    $(customElement.shadowRoot).find('#find-btn').addClass('d-none')
    $(customElement.shadowRoot).find('#review-prospects-btn').addClass('d-none')
    if(window.globalConfig.source == 'zyler'){
        $(customElement.shadowRoot).find('#add-to-contact-btn').removeClass('d-none')
    } else{
        $(customElement.shadowRoot).find('#add-to-lead-btn').removeClass('d-none')
    }
    $(customElement.shadowRoot.querySelector('#people-listing-data')).addClass('d-none')
    $(customElement.shadowRoot.querySelector('#review-prospects-listing-data')).removeClass('d-none')
    addToLeadNew(selectedDomains)
    $('#loader').fadeOut()
}

function addToLeadNew(selectedDomains){
    let entries_selector = ["#entries-select-1", "#entries-select-2", "#entries-select-3"];
    let total_entries;

    for (let selector of entries_selector) {
        let element = customElement.shadowRoot.querySelector(selector);

        if (element) {
            total_entries = $(element).val();
            break;
        }
    }

    // Default to 10 if no matching element is found
    total_entries = total_entries || 10;

    $(customElement.shadowRoot.querySelector('#loader')).fadeIn();
    if(fieldName == ""){
        var field_name = 'name';
    }else {
        var field_name = fieldName;
    }
    if(sortOrder == ""){
        var sort_order = 'desc';
    }else {
        var sort_order = sortOrder;
    }
    $.ajax({
        type: "POST",
        url: window.envConfig.masterapi_url + "/ajax_people_listing/" + window.globalConfig.user_id,
        data: JSON.stringify({
            params: {
                'page': current_page,
                'filters': filter_data,
                'length': total_entries,
                'primary_domains': selectedDomains,
                'linkdein_urls': selectedItems,
                'fieldName': field_name,
                'sortOrder': sort_order
            }
        }),
        headers: {
            "Content-Type": "application/json" ,
            "x-api-key": window.envConfig.api_key
        }
    }).done(function (response) {
            let table = '';
            if (response.fetched_count == 0){
                var nodatafound = 'No results found';
            }
            $.each(response.items, function (key, data) {
            table += '<tr class="accordion-header collapsed  accordion-item"  id="flush-heading' + key + '" >\n' +
                '                        <td class="person-details d-flex align-items-center">\n' +
                '<div class="form-group form-check">'+
                    '</div>' +
            '</div>'+
                '                            <div class="profile-image">\n' +
                '                               <a href="#" title="" >\n' +
                                            (data.person.photo_url == null || data.person.photo_url == undefined || data.person.photo_url == '' ?
                                                '<img alt="" width="50" height="50" src="'+ window.envConfig.base_url + 'assets/img/default_people.png" class="default_peopleimg" />' :
                                                '<img alt="" width="50" height="50" src="'+data.person.photo_url+'" class="default_peopleimg" />') +
                '                               </a>\n' +
                '                            </div>\n'+
                '                            <div class="profile-caption">\n' +
                '                                <h3 data-bs-toggle="tooltip" title="' + data.person.name + '">'+data.person.name+'</h3>\n' +
                '                                <ul class="links social-rr-icons icon-circle list-unstyled list-inline">\n' +
                '                                    ' + (data.person.linkedin_url == undefined || data.person.linkedin_url == null || data.person.linkedin_url == '' ? '': '<li class="linkedin" title="Linked In">\n' +
                    '                                        <a target="_blank" href="' + data.person.linkedin_url + '">\n' +
                    '                                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"/></svg>\n' +
                    '                                        </a>\n' +
                    '                                    </li>\n') + '\n' +
                '                                </ul>\n' +
                '                            </div>\n' +
                '                        </td>\n' +
                //'                        <td class="email"><span data-bs-toggle="tooltip" title="' +data.person.email+'">' +data.person.email+'</span></td>\n' +
                '                        <td> <a href="#" data-bs-toggle="tooltip" data-bs-title="'+data.person.title+'">'+data.person.title+'</a> </td>\n' +
                '\n' +
                '                        <td class="person-details d-flex align-items-center">\n' +
                '                            <div class="profile-image">\n' +
                '                                <a href="#">\n' +
                '                                    '+(data.person.organization == undefined || data.person.organization == null || data.person.organization == '' ?
                    '<img src="'+ window.envConfig.base_url + 'assets/img/default_company.png" alt="" width="50px" height="50px" />' :
                    (data.person.organization.svg_content != null && data.person.organization.svg_content != undefined && data.person.organization.svg_content != '' ?
                        data.person.organization.svg_content :
                        (data.person.organization.logo_url == '' || data.person.organization.logo_url == undefined || data.person.organization.logo_url == null ?
                            '<img src="'+ window.envConfig.base_url + 'assets/img/default_company.png" alt="" width="50px" height="50px" />' :
                            '<img src="'+data.person.organization.logo_url+'" alt="" width="50px" height="50px" />'))) +' \n' +
                '                                </a>\n' +
                '                            </div>\n' +
                '                            <div class="profile-caption">\n' +
                '                                <a href="#">\n' +
                '                                    <h3 class="text-truncate" data-bs-toggle="tooltip" title="' + data.person.organization.name + '">' + data.person.organization.name + '</h3>\n' +
                '                                </a>\n' +
                '                                <ul class="links social-rr-icons icon-circle list-unstyled list-inline">\n' +
                '                                    ' + (data.person.organization.website_url == undefined || data.person.organization.website_url == null || data.person.organization.website_url == '' ? '': '<li class="website-url" title="Website">\n' +
                    '                                        <a target="_blank" href="' + data.person.organization.website_url + '">\n' +
                    '                                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 640 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M579.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L422.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C206.5 251.2 213 330 263 380c56.5 56.5 148 56.5 204.5 0L579.8 267.7zM60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C74 372 74 321 105.5 289.5L217.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C433.5 260.8 427 182 377 132c-56.5-56.5-148-56.5-204.5 0L60.2 244.3z"/></svg>\n' +
                    '                                        </a>\n' +
                    '                                    </li>\n') + '\n' + '' + (data.person.organization.linkedin_url == undefined || data.person.organization.linkedin_url == null || data.person.organization.linkedin_url == '' ? '': '<li class="linkedin" title="Linked In">\n' +
                    '                                        <a target="_blank" href="' + data.person.organization.linkedin_url + '">\n' +
                    '                                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"/></svg>\n' +
                    '                                        </a>\n' +
                    '                                    </li>\n') + '\n' + '' + (data.person.organization.facebook_url == undefined || data.person.organization.facebook_url == null || data.person.organization.facebook_url == '' ? '': '<li class="facebook" title="Facebook In">\n' +
                    '                                        <a target="_blank" href="' + data.person.organization.facebook_url + '">\n' +
                    '                                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z"/></svg>\n' +
                    '                                        </a>\n' +
                    '                                    </li>\n') + '\n' + '' + (data.person.organization.twitter_url == undefined || data.person.organization.twitter_url == null || data.person.organization.twitter_url == '' ? '': '<li class="twitter" title="Twitter In">\n' +
                    '                                        <a target="_blank" href="' + data.person.organization.twitter_url + '">\n' +
                    '                                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"/></svg>\n' +
                    '                                        </a>\n' +
                    '                                    </li>\n') + '\n' +
                '                                </ul>\n' +
                '                            </div>\n' +
                '                        </td>\n' +
                '                        <td class="company_type"><span data-bs-toggle="tooltip" title="' +data.person.organization.company_type+'">' +data.person.organization.company_type+'</span></td>\n' +
                '<td class="location">' +
                ((data.person.state == null || data.person.state == undefined || data.person.state == '') && (data.person.city == null || data.person.city == undefined || data.person.city == '') && (data.person.country == null || data.person.country == undefined || data.person.country == '') ?
                    'N/A' :
                    (data.person.city == "" && data.person.state == "" && data.person.country != null ?
                        data.person.country :
                        (data.person.city == '' && data.person.state != null && data.person.country != null ?
                            data.person.state + ',' + data.person.country :
                            (data.person.city != null && data.person.state == '' && data.person.country != null ?
                                data.person.city + ',' + data.person.country :
                                (data.person.city != null && data.person.state != null && data.person.country != null ?
                                    data.person.city + ',' + data.person.state + ',' + data.person.country :
                                    (data.person.city == "" && data.person.country != null ?
                                        data.person.country :
                                        (data.person.city != null && data.person.country != null ?
                                            data.person.city + ',' + data.person.country :
                                            data.person.country))))))) +
                '</td>\n' +
                '                        <td><span data-bs-toggle="tooltip" title="'+data.person.organization.industry+'">'+data.person.organization.industry+'</span></td>\n' +
                '                        <td><span data-bs-toggle="tooltip" title="'+data.person.organization.keywords+'">'+data.person.organization.keywords+'</span></td>\n' +
                '<td class="action-arrow"  >' +
                '</div>' +
                '</td>' +
                '                    </tr>\n'

            })
            $(customElement.shadowRoot.querySelector('#loader')).fadeOut();
        $(customElement.shadowRoot.querySelector('#review-prospects-data-table')).html(table);
        $(customElement.shadowRoot.querySelector('#review-prospects-data-table')).text(nodatafound);
        $(customElement.shadowRoot.querySelector('#totalCountReview')).removeClass('d-none');
        if(response.fetched_count !== response.total_count){
            $(customElement.shadowRoot.querySelector('#totalCountReview')).text(response.fetched_count.toLocaleString());
        } else{
            $(customElement.shadowRoot.querySelector('#totalCountReview')).text(response.fetched_count.toLocaleString() + ' of ' + response.total_count.toString());
        }
        total_pages = response.total_pages
        generatePagination(total_pages);
        checkSavedLinkedinUrl()
        })
}

$(document).on('ajaxComplete', (event) => {
    updateCheckAllCheckbox()
    // setTimeout(() => {
    //     $('[data-bs-toggle="tooltip"]').tooltip();
    // }, 2000)
    const findPeopleBtn = customElement.shadowRoot.querySelector('#find-btn');
    if(findPeopleBtn){
        findPeopleBtn.addEventListener('click', function() {
            // $(customElement.shadowRoot.querySelector('#find-btn'))
            $(customElement.shadowRoot.querySelector('#paginationContainer1')).addClass('d-none')
            $(customElement.shadowRoot.querySelector('#paginationContainer2')).removeClass('d-none')
            if($(customElement.shadowRoot.querySelector('#find_companies_content')).hasClass('active')){
                 CheckSavedPrimaryDomain();
        current_page = 1
                $(customElement.shadowRoot.querySelector('#find_companies_content')).removeClass('active')
                $(customElement.shadowRoot.querySelector('#find_people_content')).addClass('active')
                $(customElement.shadowRoot).find('#find-btn').html('Review Prospects  <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 320 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"/></svg>');
                $(customElement.shadowRoot.querySelector('#find-btn')).removeClass('active')
                $(customElement.shadowRoot.querySelector('#find-btn')).prop('disabled', true)
                $(customElement.shadowRoot.querySelector('#find_people_content')).addClass('active')
                $(customElement.shadowRoot.querySelector('#find_people_content')).addClass('active')
                $(customElement.shadowRoot.querySelector('#company-listing-data')).addClass('d-none')
                $(customElement.shadowRoot.querySelector('#company_filter_sidebar')).addClass('d-none')
                $(customElement.shadowRoot.querySelector('#companies_count')).addClass('d-none')
                $(customElement.shadowRoot.querySelector('#people-listing-data')).removeClass('d-none')
                $(customElement.shadowRoot.querySelector('#people_filter_sidebar')).removeClass('d-none')
                $(customElement.shadowRoot.querySelector('#people_count')).removeClass('d-none')
    
                $(customElement.shadowRoot.querySelectorAll('.select2-show-search')).each(function() {
                    var selectElement = $(this);
                    var isSelect2Clicked = false;
                    selectElement.select2({
                        ajax: {
                            url: window.envConfig.masterapi_url + '/people_aggregation_data',
                            type: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                "x-api-key": window.envConfig.api_key
                            },
                            delay: 250,
                            data: function (params) {
                                return JSON.stringify({
                                        'filter_value': params.term,
                                        'filter_type': selectElement.attr('data-type')
                                });
                            },
                            processResults: function (data, params) {
                                return {
                                    results: $.map(data.unique_names, function (item, key) {
                                        return {
                                            text: item.key,
                                            id: item.key
                                        }
                                    })
                                };
                            }
                        },
                        // dropdownParent: selectElement.parent(),
                        // minimumInputLength: 1,
                        multiple: true,
                        width: '100%'
                    });
                })
                getPeople(selectedDomains)
            }
            $('#loader').fadeOut()
        });
    }

    $(customElement.shadowRoot.querySelectorAll('#review-prospects-btn')).on('click', function() {
        selectedItems = JSON.parse(localStorage.getItem('dataLinkedinUrl'))
        current_page = 1
        reviewProspects();
        $(customElement.shadowRoot.querySelector('#people_count')).addClass('d-none')
        $(customElement.shadowRoot.querySelector('#review_count')).removeClass('d-none')
        
        // $(customElement.shadowRoot.querySelector('#totalCountReviewProspects')).removeClass('d-none')
    });
    const checkboxes = customElement.shadowRoot.querySelectorAll('.company_checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleCheckboxChange.bind(this));
    });

    const peoplecheckboxes = customElement.shadowRoot.querySelectorAll('.people_checkbox');
    peoplecheckboxes.forEach(checkbox => {
        checkbox.addEventListener('click', ReviewCheckboxChange.bind(this));
    });

    $(customElement.shadowRoot.querySelector('#add-to-contact-btn')).off('click').on('click', function() {
        data = []
        for(person of JSON.parse(localStorage.getItem('dataLinkedinUrl'))){
            person.staffid = window.globalConfig.staffid
            person.password = '12345'
            data.push(person)
        }
        data = Array.from(new Set(data));
        $.ajax({
            type: "POST",
            url: 'http://3.16.184.89:5004/add_user_contacts',
            headers: {
                "Content-Type": "application/json",  // or any other MIME type you want to set
                "x-api-key": window.envConfig.api_key
            },
            data: JSON.stringify(data),
        }).done(function (response) {
            $(customElement.shadowRoot.querySelector("#success-alert")).html('<strong>Lead Added Successfully</strong> ');
            $(customElement.shadowRoot.querySelector("#success-alert")).fadeIn();
            setTimeout(function () {
                $(customElement.shadowRoot.querySelector("#success-alert")).fadeOut();
                location.reload();
            }, 5000);
        })
    })

    const addToLeadBtn = customElement.shadowRoot.querySelector('#add-to-lead-btn');
    let grpdatamodal = '';
    $(addToLeadBtn).off('click').on('click', function() {
        $.ajax({
            type: "GET",
            url: window.envConfig.sales_automation_api_url + "/group/" + window.globalConfig.user_id,
            headers: {
                "Content-Type": "application/json",  // or any other MIME type you want to set
                "x-api-key": window.envConfig.api_key
            }
        }).done(function (dropdownOptions) {
            dropdownOptions = dropdownOptions.map((group) => {
                return {
                  value: group._id,
                  label: group.group_name
                };
            });
            let optionsHTML = dropdownOptions && dropdownOptions.map(option => `<option value="${option.value}">${option.label}</option>`).join('');
            grpdatamodal +='<div class="small-modal">' +
                    '<select class="form-control js-example-basic-multiple" multiple="multiple" name="group_select_lead[]" id="group_select_lead">' +
                    optionsHTML +
                    '</select>' +
                    '<button class="btn btn-sm btn-primary close-modal-btn ms-1" id="close_modal" disabled>Save</button>' +
                    '</div>';
            $(customElement.shadowRoot.querySelector('#add-to-lead-modal')).html(grpdatamodal);
            const groupSelectValue = $(customElement.shadowRoot.querySelectorAll('.js-example-basic-multiple'));
            groupSelectValue.select2();
            groupSelectValue.on('select2:select', function (e) {
                var saveButton = customElement.shadowRoot.querySelector('#close_modal');
            // Check if any option is selected
            if (groupSelectValue.val() && groupSelectValue.val().length > 0) {
                saveButton.disabled = false; // Enable the button
            } else {
                saveButton.disabled = true; // Disable the button
            }
                
                // const selectedValue = e.params.data.id; // Get the selected value
                // const optionToRemove = groupSelectValue.find(`option[value="${selectedValue}"]`);
                // if (optionToRemove.length > 0) {
                //     optionToRemove.prop('disabled', true); // Disable the option

                // } else{
                //     optionToRemove.prop('disabled', false);
                // }
            });

            groupSelectValue.on('select2:select select2:unselect', function(e) {
                var saveButton = customElement.shadowRoot.querySelector('#close_modal');
            // Check if any option is selected
            if (groupSelectValue.val() && groupSelectValue.val().length > 0) {
                saveButton.disabled = false; // Enable the button
            } else {
                saveButton.disabled = true; // Disable the button
            }
            });

            $(customElement.shadowRoot.querySelectorAll('#close_modal')).on('click', function() {
                // Close the modal
                $(this).parent('.small-modal').hide();

                // Log the state of the checkboxes and selected options
                tempLinkedInUrls = []
                    const selectedOption = $(this).next('.small-modal').find('select').val();
                    // tempLinkedInUrls.push({
                    //     group_id: selectedOption,
                    //     user_id: window.globalConfig.user_id
                    // });
                    tempLinkedInUrls.push({
                        first_name: $(this).attr('data-first-name'),
                        last_name: $(this).attr('data-last-name'),
                        company_name: $(this).attr('data-company_name'),
                        email: $(this).attr('data-email'),
                        phone: $(this).attr('data-phone'),
                        linkedin_url: $(this).attr('data-linkedin-url'),
                        group_id: selectedOption,
                        user_id: window.globalConfig.user_id
                    });
                if (tempLinkedInUrls.length > 0) {
                    addToLead()
                }
            });
        });

        const modal = $(this).next('.small-modal');
        if ($(this).is(':checked')) {
            modal.show();
        } else {
            modal.hide();
        }


        $(customElement.shadowRoot.querySelector('#add-to-lead-btn')).prop('disabled', true)
    })

    // retrieveDataLinkedinUrl()
    // $(customElement.shadowRoot.querySelector('#group_select_lead')).on('change', function(){
    // })

});

function addToLead() {
    var selectedGroupNames = $(customElement.shadowRoot.querySelector('#group_select_lead')).find('option:selected').map(function () {
        return $(this).text();
    }).get();

    var selectedGroupIds = $(customElement.shadowRoot.querySelector('#group_select_lead')).find('option:selected').map(function () {
        return $(this).val();
    }).get();
    selectedItems = Array.from(new Map(selectedItems.map(item => [item['email'], item])).values());

    if (selectedGroupNames.length > 0) {

        for(selectedGroupId of selectedGroupIds){
            $.ajax({
                type: "GET",
                url: window.envConfig.sales_automation_api_url + "/get_lead_count_by_group/" + selectedGroupId,
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": window.envConfig.api_key
                }
            }).done((count) => {
                if((count.count + selectedItems.length) > 250){
                    $(customElement.shadowRoot.querySelector("#error-alert")).html('<strong>Max limit reached for group '+selectedGroupNames.join(',')+'</strong> ');
                    $(customElement.shadowRoot.querySelector("#error-alert")).fadeIn();
                    setTimeout(function () {
                        $(customElement.shadowRoot.querySelector("#error-alert")).fadeOut();
                        location.reload();
                    }, 5000);
                    return;
                } else{
                    var processedItems = [];

                    selectedItems.map((selectedItem) => {
                        // Check if the item has already been processed
                        if (!processedItems.includes(selectedItem.linkedin)) {
            
                            $.ajax({
                                type: "POST",
                                url: window.envConfig.sales_automation_api_url + "/recipient",
                                data: JSON.stringify({
                                    'first_name': selectedItem.first_name,
                                    'last_name': selectedItem.last_name,
                                    'email': selectedItem.email,
                                    'phone': selectedItem.phonenumber,
                                    'company_name': selectedItem.company,
                                    'group_ids': selectedGroupIds,
                                    'group_names': selectedGroupNames,
                                    'user_id': window.globalConfig.user_id
                                }),
                                headers: {
                                    "Content-Type": "application/json",
                                    "x-api-key": window.envConfig.api_key
                                }
                            })
                            processedItems.push(selectedItem.linkedin);
                        }
                    });
            
                    $(customElement.shadowRoot.querySelector("#success-alert")).html('<strong>Lead Added Successfully</strong> ');
                    $(customElement.shadowRoot.querySelector("#success-alert")).fadeIn();
                    setTimeout(function () {
                        $(customElement.shadowRoot.querySelector("#success-alert")).fadeOut();
                        // location.reload();
                    }, 5000);
                }
            })
        }
    }
}

function getSelectedOptionForLinkedInURL(linkedin_url) {
    const selectedItem = selectedItems.find(item => item.linkedin_url === linkedin_url);
    return selectedItem ? selectedItem.group_id : null;
}

function updateCheckAllCheckbox() {
    var checkboxes = customElement.shadowRoot.querySelectorAll('.company_checkbox');
    var checkAllCheckbox = customElement.shadowRoot.querySelector('#checkAllCompany');
    var allChecked = true;

    // Iterate through checkboxes to check if all are checked
    for (var i = 0; i < checkboxes.length; i++) {
        if (!checkboxes[i].checked) {
            allChecked = false;
            break;  // Exit the loop if at least one checkbox is not checked
        }
    }

    // Set the checked property of the "Check All" checkbox
    if (checkAllCheckbox) {
        checkAllCheckbox.checked = allChecked;
    }
}

function updateCheckAllCheckboxPeople() {
    var checkboxes = customElement.shadowRoot.querySelectorAll('.people_checkbox');
    var checkAllCheckbox = customElement.shadowRoot.querySelector('#checkAllPeople');

    var allChecked = true;

    // Iterate through checkboxes to check if all are checked
    for (var i = 0; i < checkboxes.length; i++) {
        if (!checkboxes[i].checked) {
            allChecked = false;
            break;  // Exit the loop if at least one checkbox is not checked
        }
    }

    // Set the checked property of the "Check All" checkbox
    if (checkAllCheckbox) {
        checkAllCheckbox.checked = allChecked;
    }
}

let totalCheckboxCount = 0;
function getPeople(selectedDomains) {
    //CheckSavedPrimaryDomain()
    //updateCheckAllCheckboxPeople()
    selectedDomains = Array.from(new Set(selectedDomains));
    let entries_selector = ["#entries-select-1", "#entries-select-2", "#entries-select-3"];
    let total_entries;

    for (let selector of entries_selector) {
        let element = customElement.shadowRoot.querySelector(selector);

        if (element) {
            total_entries = $(element).val();
            break;
        }
    }

    // Default to 10 if no matching element is found
    total_entries = total_entries || 10;

    $(customElement.shadowRoot.querySelector('#loader')).fadeIn();
    $(customElement.shadowRoot.querySelector('#find_people_content')).addClass('active')
    $(customElement.shadowRoot.querySelector('#review_prospects_content')).removeClass('active')
    $(customElement.shadowRoot).find('.checkAllPeople').removeClass('d-none')
    $(customElement.shadowRoot).find('#find-btn').addClass('d-none')
    $(customElement.shadowRoot.querySelector('#review-prospects-btn')).removeClass('d-none')
    const checkboxes = JSON.parse(localStorage.getItem('dataLinkedinUrl'));
    // totalCheckboxCount = checkboxes ? checkboxes.length : 0;
    const findReviewPrBtn = customElement.shadowRoot.querySelector('#review-prospects-btn');
    // Check if at least one checkbox is checked
    if(checkboxes?.length > 0){
        findReviewPrBtn.disabled = false
        $(customElement.shadowRoot.querySelector('#review-prospects-btn')).addClass('active')
        $(customElement.shadowRoot.querySelector('#find-btn')).addClass('d-none')
    } else{
        findReviewPrBtn.disabled = true
        $(customElement.shadowRoot.querySelector('#review-prospects-btn')).removeClass('active')
    }
    $(customElement.shadowRoot).find('#add-to-lead-btn').addClass('d-none')
    $(customElement.shadowRoot.querySelector('#back-btn')).addClass('active')
    $(customElement.shadowRoot.querySelector('#back-btn')).prop('disabled', false)
    if(fieldName == ""){
        var field_name = 'name';
    }else {
        var field_name = fieldName;
    }
    if(sortOrder == ""){
        var sort_order = 'desc';
    }else {
        var sort_order = sortOrder;
    }
    $.ajax({
        type: "POST",
        url: window.envConfig.masterapi_url + "/ajax_people_listing/" + window.globalConfig.user_id,
        data: JSON.stringify({
            params: {
                'page': current_page,
                'filters': filter_data,
                'length': total_entries,
                'primary_domains': selectedDomains,
                'linkdein_urls': go_to_review ? selectedItems : [],
                'fieldName': field_name,
                'sortOrder': sort_order
            }
        }),
        headers: {
            "Content-Type": "application/json" ,
            "x-api-key": window.envConfig.api_key
        }
    }).done(function (response) {
            let table = '';

            if (response.fetched_count == 0){
                var nodatafound = 'No results found';
            }
            $.each(response.items, function (key, data) {

                // var getcheckBoxdata = '';
                // var checkboxTitle = '';

                if (data.person.checked == true) {
                    getcheckBoxdata = 'disabled';
                    checkboxTitle = 'You have already selected';
                } else {
                    getcheckBoxdata = '';
                    checkboxTitle = '';
                }

            table += '<tr class="accordion-header collapsed  accordion-item"  id="flush-heading' + key + '" >\n' +

              '<td><div class="form-group form-check" data-bs-toggle="tooltip" data-placement="top" title="'+checkboxTitle+'">'+
              '<input type="checkbox" class="form-check-input disable people_checkbox" '+getcheckBoxdata+' data-first-name="'+data.person.first_name+'" data-last-name="'+data.person.last_name+'" data-email="'+data.person.email+'" data-phone="'+data.person.organization.phone+'" data-company_name="'+data.person.organization.name+'" data-linkedin-url="'+data.person.linkedin_url+'" data-company_country="'+data.person.organization.country+'" data-city="'+data.person.city+'" data-state="'+data.person.state+'" data-phone-number="'+data.person.phone_numbers[0]+'" data-company_website="'+data.person.organization.website_url+'" data-contact_user_phonenumber="'+data.person.phone_numbers[0]+'" data-contact_user_country="'+data.person.country+'" data-primary_domain="'+data.person.organization.primary_domain+'"  name="client_checkbox[]" value="">'+
              '</div></td>'+
                '                        <td class="person-details d-flex align-items-center">\n' +
                '                            <div class="profile-image">\n' +
                '                               <a href="#" title="" >\n' +
                                            (data.person.photo_url == null || data.person.photo_url == undefined || data.person.photo_url == '' ?
                                                '<img alt="" width="50" height="50" src="'+ window.envConfig.base_url + 'assets/img/default_people.png" class="default_peopleimg" />' :
                                                '<img alt="" width="50" height="50" src="'+data.person.photo_url+'" class="default_peopleimg" />') +
                '                               </a>\n' +
                '                            </div>\n'+
                '                            <div class="profile-caption">\n' +
                '                                <h3 data-bs-toggle="tooltip" title="' + data.person.name + '">'+data.person.name+'</h3>\n' +
                '                                <ul class="links social-rr-icons icon-circle list-unstyled list-inline">\n' +
                '                                    ' + (data.person.linkedin_url == undefined || data.person.linkedin_url == null || data.person.linkedin_url == '' ? '': '<li class="linkedin" title="Linked In">\n' +
                    '                                        <a target="_blank" href="' + data.person.linkedin_url + '">\n' +
                    '                                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"/></svg>\n' +
                    '                                        </a>\n' +
                    '                                    </li>\n') + '\n' +
                '                                </ul>\n' +
                '                            </div>\n' +
                '                        </td>\n' +
                // '                        <td class="email"><span data-bs-toggle="tooltip" title="' +data.person.email+'">' +data.person.email+'</span></td>\n' +
                '                        <td> <a href="#" data-bs-toggle="tooltip" data-bs-title="'+data.person.title+'">'+data.person.title+'</a> </td>\n' +
                '\n' +
                '                        <td class="person-details d-flex align-items-center">\n' +
                '                            <div class="profile-image">\n' +
                '                                <a href="#">\n' +
                '                                    '+(data.person.organization == undefined || data.person.organization == null || data.person.organization == '' ?
                    '<img src="'+ window.envConfig.base_url + 'assets/img/default_company.png" alt="" width="50px" height="50px" />' :
                    (data.person.organization.svg_content != null && data.person.organization.svg_content != undefined && data.person.organization.svg_content != '' ?
                        data.person.organization.svg_content :
                        (data.person.organization.logo_url == '' || data.person.organization.logo_url == undefined || data.person.organization.logo_url == null ?
                            '<img src="'+ window.envConfig.base_url + 'assets/img/default_company.png" alt="" width="50px" height="50px" />' :
                            '<img src="'+data.person.organization.logo_url+'" alt="" width="50px" height="50px" />'))) +' \n' +
                '                                </a>\n' +
                '                            </div>\n' +
                '                            <div class="profile-caption">\n' +
                '                                <a href="https://nexus-data.io/dictionary/details/companies/'+data.person.organization.primary_domain+'/'+sanitizeCompanyName(data.person.organization.name)+'" target="_blank">\n' +
                '                                    <h3 class="text-truncate" data-bs-toggle="tooltip" title="' + data.person.organization.name + '">' + data.person.organization.name + '</h3>\n' +
                '                                </a>\n' +
                '                                <ul class="links social-rr-icons icon-circle list-unstyled list-inline">\n' +
                '                                    ' + (data.person.organization.website_url == undefined || data.person.organization.website_url == null || data.person.organization.website_url == '' ? '': '<li class="website-url" title="Website">\n' +
                    '                                        <a target="_blank" href="' + data.person.organization.website_url + '">\n' +
                    '                                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 640 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M579.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L422.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C206.5 251.2 213 330 263 380c56.5 56.5 148 56.5 204.5 0L579.8 267.7zM60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C74 372 74 321 105.5 289.5L217.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C433.5 260.8 427 182 377 132c-56.5-56.5-148-56.5-204.5 0L60.2 244.3z"/></svg>\n' +
                    '                                        </a>\n' +
                    '                                    </li>\n') + '\n' + '' + (data.person.organization.linkedin_url == undefined || data.person.organization.linkedin_url == null || data.person.organization.linkedin_url == '' ? '': '<li class="linkedin" title="Linked In">\n' +
                    '                                        <a target="_blank" href="' + data.person.organization.linkedin_url + '">\n' +
                    '                                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"/></svg>\n' +
                    '                                        </a>\n' +
                    '                                    </li>\n') + '\n' + '' + (data.person.organization.facebook_url == undefined || data.person.organization.facebook_url == null || data.person.organization.facebook_url == '' ? '': '<li class="facebook" title="Facebook In">\n' +
                    '                                        <a target="_blank" href="' + data.person.organization.facebook_url + '">\n' +
                    '                                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z"/></svg>\n' +
                    '                                        </a>\n' +
                    '                                    </li>\n') + '\n' + '' + (data.person.organization.twitter_url == undefined || data.person.organization.twitter_url == null || data.person.organization.twitter_url == '' ? '': '<li class="twitter" title="Twitter In">\n' +
                    '                                        <a target="_blank" href="' + data.person.organization.twitter_url + '">\n' +
                    '                                            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"/></svg>\n' +
                    '                                        </a>\n' +
                    '                                    </li>\n') + '\n' +
                '                                </ul>\n' +
                '                            </div>\n' +
                '                        </td>\n' +
                '                        <td class="company_type"><span data-bs-toggle="tooltip" title="' +data.person.organization.company_type+'">' +data.person.organization.company_type+'</span></td>\n' +

                '<td class="location">' +
                ((data.person.state == null || data.person.state == undefined || data.person.state == '') && (data.person.city == null || data.person.city == undefined || data.person.city == '') && (data.person.country == null || data.person.country == undefined || data.person.country == '') ?
                    'N/A' :
                    (data.person.city == "" && data.person.state == "" && data.person.country != null ?
                        data.person.country :
                        (data.person.city == '' && data.person.state != null && data.person.country != null ?
                            data.person.state + ',' + data.person.country :
                            (data.person.city != null && data.person.state == '' && data.person.country != null ?
                                data.person.city + ',' + data.person.country :
                                (data.person.city != null && data.person.state != null && data.person.country != null ?
                                    data.person.city + ',' + data.person.state + ',' + data.person.country :
                                    (data.person.city == "" && data.person.country != null ?
                                        data.person.country :
                                        (data.person.city != null && data.person.country != null ?
                                            data.person.city + ',' + data.person.country :
                                            data.person.country))))))) +
                '</td>\n' +
                '                        <td><span data-bs-toggle="tooltip" title="'+data.person.organization.industry+'">'+data.person.organization.industry+'</span></td>\n' +
                '                        <td><span data-bs-toggle="tooltip" title="'+data.person.organization.keywords+'">'+data.person.organization.keywords+'</span></td>\n' +
                '<td class="action-arrow"  >' +
                '</div>' +
                '</td>' +
                '                    </tr>\n'

            })
            $(customElement.shadowRoot.querySelector('#loader')).fadeOut();
        $(customElement.shadowRoot.querySelector('#people-data-table')).html(table);
        $(customElement.shadowRoot.querySelector('#people-data-table')).text(nodatafound);
        $(customElement.shadowRoot.querySelector('#totalCountPeople')).removeClass('d-none');
        if(response.fetched_count == response.total_count){
            $(customElement.shadowRoot.querySelector('#totalCountPeople')).text(response.fetched_count.toLocaleString());
        } else{
            $(customElement.shadowRoot.querySelector('#totalCountPeople')).text(response.fetched_count.toLocaleString() + ' of ' + response.total_count.toString());
        }
        total_pages = response.total_pages
        generatePagination(total_pages);
        //saveDataLinkedinUrl()
        retrieveDataLinkedinUrl()
        checkSavedLinkedinUrl()
        })
        // retrieveDataLinkedinUrl()
    }

    $(document).ready(function() {
        // for default image
        $(document).ajaxComplete(function() {
            $(customElement.shadowRoot.querySelector(".default_peopleimg")).on("error", function() {
                $(this).prop("src", ''+window.envConfig.base_url+'assets/img/default_people.png');
            });
        });
        $(document).ajaxComplete(function() {
            $(customElement.shadowRoot.querySelector(".default_companyimg")).on("error", function() {
                $(this).prop("src", ''+window.envConfig.base_url+'assets/img/default_company.png');
            });
        });
        $(document).ajaxComplete(function() {
            // Assuming you already have an event listener for the Check All checkbox
            const checkAllCheckbox = customElement.shadowRoot.querySelector('#checkAllCompany');
            checkAllCheckbox.addEventListener('change', function () {
                // Check or uncheck all company checkboxes based on the Check All checkbox state
                $(customElement.shadowRoot.querySelectorAll('.company_checkbox')).prop('checked', $(this).prop('checked'));
                checkboxes.forEach(checkbox => {
                    checkbox.checked = checkAllCheckbox.checked;
                });

                // Call saveDataPrimaryDomain function when Check All checkbox is checked
                if (checkAllCheckbox.checked) {
                    saveDataPrimaryDomain();
                }else{
                    saveDataPrimaryDomain();
                }

                // Update the class of #find-btn based on the state of the Check All checkbox
                const findBtn = customElement.shadowRoot.querySelector('#find-btn');
                if(findBtn){
                    findBtn.classList.toggle('active', checkAllCheckbox.checked);
                }
                if(checkAllCheckbox.checked){
                    $(customElement.shadowRoot.querySelector('#find-btn')).prop('disabled', false)
                } else{
                    $(customElement.shadowRoot.querySelector('#find-btn')).prop('disabled', true)
                }
            });

            // Add your existing event listener for individual company checkboxes here, if needed
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', handleCheckboxChange);
            });

        });

        $(document).ajaxComplete(function() {
            const checkAllPeopleCheckbox = customElement.shadowRoot.querySelector('#checkAllPeople');
            checkAllPeopleCheckbox.addEventListener('change', function () {
                const enabledCheckboxes = customElement.shadowRoot.querySelectorAll('.people_checkbox:not([disabled])');
                $(enabledCheckboxes).prop('checked', $(this).prop('checked'));
                enabledCheckboxes.forEach(checkbox => {
                    checkbox.checked = checkAllPeopleCheckbox.checked;
                });
                if (checkAllPeopleCheckbox.checked) {
                    saveDataLinkedinUrl();
                }else{
                    saveDataLinkedinUrl();
                }
                checkedCheckboxes = JSON.parse(localStorage.getItem('dataLinkedinUrl'))
                if(checkedCheckboxes.length > 0){
                    $(customElement.shadowRoot.querySelector('#review-prospects-btn')).prop('disabled', false);
                } else{
                    $(customElement.shadowRoot.querySelector('#review-prospects-btn')).prop('disabled', true);
                }
                // rvwPrspctBtn.classList.toggle('active', checkAllPeopleCheckbox.checked);
            });

            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', ReviewCheckboxChange);
            });
            updateCheckAllCheckboxPeople()
        });


    });

    function assign_companies() {
        let dataOrganizationStrings = JSON.parse(localStorage.getItem('dataOrganization'));
        let dataOrganizations = [];
    
        if (dataOrganizationStrings && Array.isArray(dataOrganizationStrings)) {
            dataOrganizationStrings.forEach(itemString => {
    
                // Replacing all single quotes with double quotes
                let modifiedItemString = itemString.replace(/'/g, '"');
    
                try {
                    let itemObject = JSON.parse(modifiedItemString);
                    dataOrganizations.push(itemObject);
                } catch (e) {
                    console.log("Error parsing item:", modifiedItemString, e);
                }
            });
        }
    
        var settings = {
            "url": "https://api.zylererp.com/api/entity/user/client_staff_linking",
            "method": "POST",
            "timeout": 0,
            "headers": {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdGFmZmlkIjoxMzIsInBocHNlcnZlciI6ImdyZWVuamVldmEuenlsZXJlcnAuY29tIiwiaWF0IjoxNzA1NjYzNjgwfQ.NhgjmgSxXh0YzctxGplf6gONpVB9JtlCd4vVMFdIQFY"
            },
            "data": JSON.stringify({
              "data": dataOrganizations,
              "staffid": $(customElement.shadowRoot.querySelector('#staff_select')).val()
            }),
    };
    
    $.ajax(settings).done(function (response) {
        $(customElement.shadowRoot.querySelector("#success-alert")).html('<strong>Prospect Assigned Successfully</strong> ');
            $(customElement.shadowRoot.querySelector("#success-alert")).fadeIn();
            setTimeout(function () {
                $(customElement.shadowRoot.querySelector("#success-alert")).fadeOut();
                location.reload()
            }, 3000);
    });
    }
    


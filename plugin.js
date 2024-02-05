class CompaniesList extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
	console.log(window.envConfig)
    }

    async connectedCallback() {
        if (this.getAttribute('data-config')) {
            this._config = JSON.parse(this.getAttribute('data-config'));
            window.globalConfig = this._config;
            await this.render();
            this.initAccordion();
        }
    }

    // async render(config) {
    async render() {

        const style = `
    :host, :host * {
        --primary: #1991eb;
        --active: #FF7800;
        --white: #ffffff;
        --gray: #707070;
        --green: #9AD407;
        --red: #FA4C4C;
        --title: #424242;
        --icon: #374957;
        --border-color:  #e3e3e3;

        --primary-font: 'Inter', sans-serif;
        --secondary-font: 'Inter', sans-serif;
        --font-xxs: 12px;
        --font-xs: 13px;
        --font-sm: 14px;
        --font-md: 15px;
        --font-lg: 16px;
        --font-xl: 18px;
        --font-xxl: 22px;
        --font-weight-5:500;

        --shadow:0 2px 6px rgb(0 0 0 / 11%);
    }
    ...  // other component styles
   
    
`;

const styleEl = document.createElement('style');
styleEl.textContent = style;
this.shadowRoot.appendChild(styleEl);


                // Utility function to check if a script has been loaded
                const isScriptLoaded = (src) => {
                    return !!document.querySelector(`script[src="${src}"]`);
                };

                // Utility function to check if a stylesheet has been loaded
                const isStyleLoaded = (href) => {
                    return !!document.querySelector(`link[href="${href}"]`);
                };

                // Your existing fetchCSS function (assuming it's something like this)
                async function fetchCSS(url) {
                    const response = await fetch(url);
                    return response.text();
                }

                // Your existing loadScript function
                async function loadScript(src, onLoadCallback) {
                    return new Promise((resolve, reject) => {
                        if (isScriptLoaded(src)) {
                            resolve();
                            return;
                        }
                        const script = document.createElement('script');
                        script.src = src;
                        script.onload = () => {
                            if (onLoadCallback) onLoadCallback();
                            resolve();
                        };
                        script.onerror = reject;
                        document.body.appendChild(script);
                    });
                }

                // Load CSS conditionally
                if (!isStyleLoaded('https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.1.3/css/bootstrap.min.css')) {
                    const bootstrapCSS = await fetchCSS("https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.1.3/css/bootstrap.min.css");
                    const bootstrapStyleEl = document.createElement('style');
                    bootstrapStyleEl.textContent = bootstrapCSS;
                    this.shadowRoot.appendChild(bootstrapStyleEl);
                }

                if (!isStyleLoaded('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css')) {
                    const linkEl = document.createElement('link');
                    linkEl.rel = 'stylesheet';
                    linkEl.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css';
                    this.shadowRoot.appendChild(linkEl);
                }

                if (!isStyleLoaded('https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css')) {
                    const select2CSS = await fetchCSS("https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css");
                    const select2StyleEl = document.createElement('style');
                    select2StyleEl.textContent = select2CSS;
                    this.shadowRoot.appendChild(select2StyleEl);
                }
                
                if (!isStyleLoaded('https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css')) {
                    const bxCSS = await fetchCSS("https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css");
                    const bxStyleEl = document.createElement('style');
                    bxStyleEl.textContent = bxCSS;
                    this.shadowRoot.appendChild(bxStyleEl);
                }

                // if (!isStyleLoaded('https://cdn.jsdelivr.net/npm/select2@4.0.13/dist/css/select2.min.css')) {
                //     const bxCSS = await fetchCSS("https://cdn.jsdelivr.net/npm/select2@4.0.13/dist/css/select2.min.css");
                //     const bxStyleEl = document.createElement('style');
                //     bxStyleEl.textContent = bxCSS;
                //     this.shadowRoot.appendChild(bxStyleEl);
                // }
                        // Conditionally load main.css
                if (!isStyleLoaded(window.envConfig.base_url + 'assets/css/main.css')) {
                    const localMainCssLink = document.createElement('link');
                    localMainCssLink.rel = 'stylesheet';
                    localMainCssLink.href = window.envConfig.base_url + 'assets/css/main.css';
                    this.shadowRoot.appendChild(localMainCssLink);
                }

                // Conditionally load style.css
                if (!isStyleLoaded(window.envConfig.base_url + 'assets/css/style.css')) {
                    const localStyleCssLink = document.createElement('link');
                    localStyleCssLink.rel = 'stylesheet';
                    localStyleCssLink.href = window.envConfig.base_url + 'assets/css/style.css';
                    this.shadowRoot.appendChild(localStyleCssLink);
                }



                  // Conditionally fetch and append the font style
                  //if (!isStyleLoaded("'Inter', sans-serif")) {
                      const fontCSS = await fetch("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap")
                                             .then(response => response.text());

                      const fontStyleEl = document.createElement('style');
                      fontStyleEl.textContent = fontCSS;
                      this.shadowRoot.appendChild(fontStyleEl);
                  //}


                // Load scripts conditionally
                if (!isScriptLoaded("https://code.jquery.com/jquery-3.7.1.min.js")) {
                    await loadScript("https://code.jquery.com/jquery-3.7.1.min.js");
                }

                if (!isScriptLoaded("https://cdnjs.cloudflare.com/ajax/libs/popper.js/2.10.2/umd/popper.min.js")) {
                    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/popper.js/2.10.2/umd/popper.min.js");
                }

                if (!isScriptLoaded("https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.2.3/js/bootstrap.min.js")) {
                    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.2.3/js/bootstrap.min.js");
                }

                if (!isScriptLoaded("https://cdnjs.cloudflare.com/ajax/libs/jQuery-slimScroll/1.3.8/jquery.slimscroll.min.js")) {
                    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jQuery-slimScroll/1.3.8/jquery.slimscroll.min.js");
                }

                if (!isScriptLoaded("https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/js/select2.full.min.js")) {
                    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/js/select2.full.min.js");
                }

                if (!isScriptLoaded("https://cdn.amcharts.com/lib/4/core.js")) {
                    await loadScript("https://cdn.amcharts.com/lib/4/core.js");
                }

                if (!isScriptLoaded("https://cdn.amcharts.com/lib/4/charts.js")) {
                    await loadScript("https://cdn.amcharts.com/lib/4/charts.js");
                }

                if (!isScriptLoaded("https://cdn.amcharts.com/lib/4/themes/animated.js")) {
                    await loadScript("https://cdn.amcharts.com/lib/4/themes/animated.js");
                }

                if (!isScriptLoaded("https://unpkg.com/boxicons@2.1.4/dist/boxicons.js")) {
                    await loadScript("https://unpkg.com/boxicons@2.1.4/dist/boxicons.js");
                }

                if (!isScriptLoaded("https://cdn.jsdelivr.net/npm/select2@4.0.13/dist/js/select2.min.js")) {
                    await loadScript("https://cdn.jsdelivr.net/npm/select2@4.0.13/dist/js/select2.min.js");
                }

                if (!isScriptLoaded(window.envConfig.base_url + "plugin-logic.js")) {
                    await loadScript(window.envConfig.base_url + "plugin-logic.js");
                }

                if(window.globalConfig.source == 'customer_linking'){

                }

        this.shadowRoot.innerHTML += (window.globalConfig.source != 'customer_linking' ? `
        <div class="d-flex tab-section align-items-center justify-content-between">

                <div class="prospects-steps">
                    <button id="back-btn" type="button" class="btn me-3 btn-sm" disabled><svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 320 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"/></svg> Back 
                    </button>
                    <div class="prospects-steps-icon"  id="companies_selected">
                        <div id="find_companies_content" class="icon active text-center"><i class='bx bx-buildings' ></i></div>
                        <h4>Find Companies</h4>
                        <div class="next-ic">
                            <i class='bx bxs-chevron-right'></i>
                        </div>
                    </div>
                    <div class="prospects-steps-icon" >
                        <div id="find_people_content" class="icon  text-center"><i class='bx bx-user-pin'></i></div>
                        <h4>Find People</h4>
                        <div class="next-ic">
                            <i class='bx bxs-chevron-right'></i>
                        </div>
                    </div>
                    <div class="prospects-steps-icon">
                        <div id="review_prospects_content" class="icon  text-center">
                            <i class='bx bx-revision' ></i>
                        </div>
                        <h4>Review Prospects</h4>
                        <div class="next-ic">
                            <i class='bx bxs-chevron-right'></i>
                        </div>
                    </div>
                <div>
                <div id="add-to-lead-modal">
                </div>
                <div class=" text-right">
                    <button id="find-btn" type="button" class="btn btn-sm" disabled>Find People <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 320 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"/></svg>
                    </button>
                    <button id="review-prospects-btn" type="button" class="btn btn-sm d-none active">Review Prospects <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 320 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"/></svg>
                    </button>
                    <button id="add-to-lead-btn" type="button" class="btn btn-sm d-none active">Add to Lead <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 320 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"/></svg>
                    </button>
                    <button id="add-to-contact-btn" type="button" class="btn btn-sm d-none active">Add to Contact  <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 320 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"/></svg></button>
                </div>
                <div class="alert alert-success" id="success-alert" style="display: none;">      
                </div>
                <div class="alert alert-danger" id="error-alert" style="display: none;">
                </div>  
            
        </div>` : ``)
        this.shadowRoot.innerHTML += `
        </div>
        <div class="alert alert-success" id="success-alert" style="display: none;">
        </div>
        
    </div>
</div>

<div class="filter-sidebar d-none" id="people_filter_sidebar">
    <div class="filter-header">
        <div class="filter-title">
            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M3.9 54.9C10.5 40.9 24.5 32 40 32H472c15.5 0 29.5 8.9 36.1 22.9s4.6 30.5-5.2 42.5L320 320.9V448c0 12.1-6.8 23.2-17.7 28.6s-23.8 4.3-33.5-3l-64-48c-8.1-6-12.8-15.5-12.8-25.6V320.9L9 97.3C-.7 85.4-2.8 68.8 3.9 54.9z"/></svg>
            <h6>Filters</h6>
        </div>
        <span class="clear-filter reset-all" id="clear_all_people">
            Clear all 
            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c-9.4 9.4-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47c-9.4-9.4-24.6-9.4-33.9 0z"/></svg>
        </span>
<!--        <button class="btn filter-collapse"><span class="icon-collapse_icon"></span></button>-->
    </div>
    <div class="filter-item filter__slimScroll">
        <form class="accordion" id="people-filter-form">
            <div class="accordion" id="">
                <div class="accordion-item">
                    <h2 class="accordion-header" id="accordionExample">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                data-bs-target="#collapse11" aria-expanded="true" aria-controls="collapse11">
                            People Name
                        </button>
                    </h2>
                    <div id="collapse11" class="accordion-collapse collapse ">
                        <div class="accordion-body">
                            <div class="filter-search">
                                <input type="text" name="people_name[]" class="form-control people_name_suggest" placeholder="Search People Name"/>
                                <button class="btn btn-search people-name-filter" type="button">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="accordion-item">
                    <h2 class="accordion-header" id="">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                data-bs-target="#collapse12" aria-expanded="false" aria-controls="collapse12">
                            Job Titles
                        </button>
                    </h2>

                    <div id="collapse12" class="accordion-collapse collapse" aria-labelledby="heading12">
                        <div class="accordion-body">
                            <div class="filter-select-custom">
                                <select id="designation_suggest_list" name="designation_data[]"
                                        class="form-control select2-show-search form-select people-filter designation_data_suggest filter_data" filter_data_id= "designation_data"
                                        data-placeholder="Choose " data-type="title" data-endpoint="people" multiple>
                                    <!-- Add more options as needed -->
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="accordion-item">
                    <h2 class="accordion-header" id="">
                        <button
                                class="accordion-button collapsed"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target="#collapse13"
                                aria-expanded="false"
                                aria-controls="collapse13"
                        >
                            Company
                        </button>
                    </h2>

                    <div
                            id="collapse13"
                            class="accordion-collapse collapse"
                            aria-labelledby="heading13"
                    >
                        <div class="accordion-body">
                            <div class="filter-select-custom">
                                <select id="company_suggest_list" name="company_data[]"
                                        class="form-control select2-show-search form-select people-filter company_data_suggest filter_data" filter_data_id="company_data"
                                        data-placeholder="Choose " data-type="organization.name" data-endpoint="people" multiple>

                                    <!-- Add more options as needed -->
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="accordion-item">
                <h2 class="accordion-header" >
                    <button
                            class="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#collapse21"
                            aria-expanded="false"
                            aria-controls="collapse21"
                    >
                        Company Type
                    </button>
                </h2>

                <div id="collapse21" class="accordion-collapse collapse " aria-labelledby="heading21"  >
                    <div class="accordion-body">
                        <div class="filter-select-custom">
                            <select id="pcompany_type_suggest_list" name="pcompany_type[]"
                            class="form-control select2-show-search form-select people-filter pcompany_type_suggest filter_data" filter_data_id="pcompany_type"
                            data-placeholder="Choose " data-type="organization.company_type" data-endpoint="people" multiple>

                        
                            </select>
                        </div>
                    </div>
                </div>
            </div>
                <div class="accordion-item">
                    <h2 class="accordion-header" id="">
                        <button
                                class="accordion-button collapsed"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target="#collapse14"
                                aria-expanded="false"
                                aria-controls="collapse14"
                        >
                            Country
                        </button>
                    </h2>

                    <div
                            id="collapse14"
                            class="accordion-collapse collapse"
                            aria-labelledby="heading14"
                    >
                        <div class="accordion-body">
                            <div class="filter-select-custom">
                                <select id="country_suggest_list" name="country_data[]"
                                        class="form-control select2-show-search form-select people-filter country_data_suggest filter_data" filter_data_id="country_data"
                                        data-placeholder="Choose " data-type="country" data-endpoint="people" multiple>

                                    <!-- Add more options as needed -->
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="accordion-item">
                    <h2 class="accordion-header" id="">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                data-bs-target="#collapse15" aria-expanded="false" aria-controls="collapse15">
                            State
                        </button>
                    </h2>

                    <div id="collapse15" class="accordion-collapse collapse" aria-labelledby="heading15">
                        <div class="accordion-body">
                            <div class="filter-select-custom">
                                <select id="state_suggest_list" name="state_data_people[]"
                                        class="form-control select2-show-search form-select people-filter state_data_suggest filter_data" filter_data_id="state_data"
                                        data-placeholder="Choose " data-type="state" data-endpoint="people" multiple>
                                    <!-- Add more options as needed -->
                                </select>
                            </div>
                        </div>
                    </div>
                </div><!-- State end -->
                <div class="accordion-item">
                    <h2 class="accordion-header" id="">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                data-bs-target="#collapse16" aria-expanded="false" aria-controls="collapse16">
                            City
                        </button>
                    </h2>

                    <div id="collapse16" class="accordion-collapse collapse" aria-labelledby="heading16">
                        <div class="accordion-body">
                            <div class="filter-select-custom">
                                <select id="city_suggest_list" name="city_data_people[]"
                                        class="form-control select2-show-search form-select people-filter city_data_suggest filter_data" filter_data_id="city_data"
                                        data-placeholder="Choose " data-type="city" data-endpoint="people" multiple>
                                    <!-- Add more options as needed -->
                                </select>
                            </div>
                        </div>
                    </div>
                </div><!-- City end -->

                <div class="accordion-item">
                    <h2 class="accordion-header" id="">
                        <button
                                class="accordion-button collapsed"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target="#collapse17"
                                aria-expanded="false"
                                aria-controls="collapse17"
                        >
                            Industry
                        </button>
                    </h2>
                    <div id="collapse17" class="accordion-collapse collapse" aria-labelledby="heading17" >
                        <div class="accordion-body">
                            <div class="filter-select-custom">
                                <select id="industry_suggest_list_people" name="industry_data[]"
                                        class="form-control select2-show-search form-select people-filter industry_data_suggest filter_data" filter_data_id="industry_data"
                                        data-placeholder="Choose " data-type ="organization.industry" data-endpoint="people" multiple>

                                    <!-- Add more options as needed -->
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="accordion-item">
                <h2 class="accordion-header" id="">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                            data-bs-target="#collapse19" aria-expanded="false" aria-controls="collapse19">
                        Keywords
                    </button>
                </h2>

                <div id="collapse19" class="accordion-collapse collapse" aria-labelledby="heading19">
                    <div class="accordion-body">
                        <div class="filter-select-custom">
                            <select id="keyword_people_suggest_list" name="keyword_data[]"
                                    class="form-control select2-show-search form-select people-filter keyword_data_suggest filter_data" filter_data_id="keyword_data"
                                    data-placeholder="Choose " data-type ="organization.keywords" data-endpoint="people" multiple>

                                <!-- Add more options as needed -->
                            </select>
                        </div>
                    </div>
                </div>
            </div> 
                <div class="accordion-item">
                    <h2 class="accordion-header" id="">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                data-bs-target="#collapse18" aria-expanded="false" aria-controls="collapse18">
                            Seniority
                        </button>
                    </h2>

                    <div id="collapse18" class="accordion-collapse collapse" aria-labelledby="heading18">
                        <div class="accordion-body">
                            <div class="filter-select-custom">
                                <select id="seniority_suggest_list" name="seniority_data[]"
                                        class="form-control select2-show-search form-select people-filter seniority_data_suggest filter_data"
                                        data-placeholder="Choose " data-type = "seniority" data-endpoint="people" multiple>
                                    <!-- Add more options as needed -->
                                </select>
                            </div>
                        </div>
                    </div>
                </div><!-- Seniority end -->




            </div>
        </form>
    </div>
</div>


        <div class="filter-sidebar" id="company_filter_sidebar" >
    <div class="filter-header">
        <div class="filter-title">
            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M3.9 54.9C10.5 40.9 24.5 32 40 32H472c15.5 0 29.5 8.9 36.1 22.9s4.6 30.5-5.2 42.5L320 320.9V448c0 12.1-6.8 23.2-17.7 28.6s-23.8 4.3-33.5-3l-64-48c-8.1-6-12.8-15.5-12.8-25.6V320.9L9 97.3C-.7 85.4-2.8 68.8 3.9 54.9z"/></svg>
            <h6>Filters</h6>
        </div>
        <span class="clear-filter reset-all" id="clear_all_company">
            Clear all 
            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c-9.4 9.4-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47c-9.4-9.4-24.6-9.4-33.9 0z"/></svg>
        </span>
<!--        <button class="btn filter-collapse"> <span class="icon-collapse_icon"></span></button>-->
    </div>
    <div class="filter-item filter__slimScroll">
        <form id="companies-filter-form">
         <div class="accordion" id="filter-accordian">
            <div class="accordion-item">
                <h2 class="accordion-header" >
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse1" aria-expanded="true" aria-controls="collapse1" >
                    Company Name
                    </button>
                </h2>
                <div id="collapse1" class="accordion-collapse collapse">
                    <div class="accordion-body">
                        <div class="filter-search">
                            <input type="text" name="name[]" class="form-control company_name_suggest" placeholder="Search Company Name"/>
                            <button class="btn btn-search companies-name-filter" type="button">
                                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="accordion-item">
                <h2 class="accordion-header" >
                    <button
                            class="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#collapse20"
                            aria-expanded="false"
                            aria-controls="collapse20"
                    >
                        Company Type
                    </button>
                </h2>

                <div id="collapse20" class="accordion-collapse collapse " aria-labelledby="heading20"  >
                    <div class="accordion-body">
                        <div class="filter-select-custom">
                            <select id="company_type_suggest_list" name="company_type[]" class="form-control select2-show-search form-select company_type_suggest companies-filter" data-placeholder="Choose " data-type="organization.company_type" data-endpoint="companies" data-index="index_for_company_master_new" multiple>

                            </select>
                        </div>
                    </div>
                </div>
            </div>
            <div class="accordion-item">
                <h2 class="accordion-header" >
                    <button
                            class="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#collapse2"
                            aria-expanded="false"
                            aria-controls="collapse2"
                    >
                        Country
                    </button>
                </h2>

                <div id="collapse2" class="accordion-collapse collapse " aria-labelledby="heading2"  >
                    <div class="accordion-body">
                        <div class="filter-select-custom">
                            <select id="company_country_suggest_list" name="company_location[]" class="pt-2 form-control select2-show-search form-select company_location_suggest companies-filter" data-placeholder="Choose " data-type="organization.country" data-endpoint="companies" data-index="index_for_company_master_new" multiple>

                            </select>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="accordion-item">
                <h2 class="accordion-header" >
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse3" aria-expanded="false" aria-controls="collapse3" >
                        State
                    </button>
                </h2>
                <div id="collapse3" class="accordion-collapse collapse " aria-labelledby="heading3"  >
                    <div class="accordion-body">
                        <div class="filter-select-custom">
                             <select id="company_state_suggest_list" name="state_data[]"
                                     class="form-control select2-show-search form-select state_company_data_suggest companies-filter"
                                     data-placeholder="Choose " data-type="organization.state" data-endpoint="companies" data-index="index_for_company_master_new" multiple>
                                 <!-- Add more options as needed -->
                             </select>
                         </div>
                    </div>
                </div>
            </div>            
            <!-- State end -->
            
            
            
             <div class="accordion-item">
                 <h2 class="accordion-header">
                     <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                             data-bs-target="#collapse4" aria-expanded="false" aria-controls="collapse4">
                         City
                     </button>
                 </h2>

                 <div id="collapse4" class="accordion-collapse collapse" aria-labelledby="heading4">
                     <div class="accordion-body">
                         <div class="filter-select-custom">
                             <select id="company_city_suggest_list" name="city_company_data[]"
                                     class="form-control select2-show-search form-select city_company_data_suggest companies-filter"
                                     data-placeholder="Choose " data-type="organization.city" data-index="index_for_company_master_new" data-endpoint="companies" multiple>
                                 <!-- Add more options as needed -->
                             </select>
                         </div>
                     </div>
                 </div>
             </div>
             <!-- City end -->
             <div class="accordion-item">
                 <h2 class="accordion-header" id="">
                     <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                             data-bs-target="#collapse5" aria-expanded="false" aria-controls="collapse5">
                             Industry
                     </button>
                 </h2>

                 <div id="collapse5" class="accordion-collapse collapse" aria-labelledby="heading5">
                     <div class="accordion-body">
                         <div class="filter-select-custom">
                             <select id="industry_suggest_list" name="industry[]"
                                     class="form-control select2-show-search form-select industry_suggest companies-filter"
                                     data-placeholder="Choose " data-type="organization.industry" data-index="index_for_company_master_new" data-endpoint="companies"  multiple>
                                 <!-- Add more options as needed -->
                             </select>
                         </div>
                     </div>
                 </div>
             </div><!-- Address end -->
            
            <div class="accordion-item">
                <h2 class="accordion-header" id>
                    <button
                            class="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#collapse7"
                            aria-expanded="false"
                            aria-controls="collapse7"
                    >
                        Keywords
                    </button>
                </h2>

                <div id="collapse7"
                        class="accordion-collapse collapse"
                        aria-labelledby="heading7"
                >
                    <div class="accordion-body">
                        <div class="filter-select-custom">
                            <select id="keyword_suggest_list" name="keywords[]" class="form-control select2-show-search form-select keywords_suggest companies-filter"  data-placeholder="Choose " data-type="keyword" data-index="filter_index_keyword" data-endpoint="companies" multiple></select>
                        </div>
                    </div>
                </div>
            </div>
            <div class="accordion-item">
                <h2 class="accordion-header" id>
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse8"
                            aria-expanded="false" aria-controls="collapse8" >
                        Technologies
                    </button>
                </h2>

                <div id="collapse8" class="accordion-collapse collapse" aria-labelledby="heading8"  >
                    <div class="accordion-body">
                        <div class="filter-select-custom">
                            <select id="technologies_suggest_list" name="technologies[]" class="form-control select2-show-search form-select technologies_suggest companies-filter" data-placeholder="Choose "  data-type="technology_name" data-endpoint="companies" data-index="filter_index_technology"  multiple></select>
                        </div>
                    </div>
                </div>
             </div>
            <div class="accordion-item">
                 <h2 class="accordion-header" id>
                     <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse9"
                             aria-expanded="false" aria-controls="collapse9" >
                         People Count
                     </button>
                 </h2>

                 <div id="collapse9" class="accordion-collapse collapse" aria-labelledby="heading9"  >
                     <div class="accordion-body">
                         <div class="filter-select-custom">
                             <select id="people_count_suggest_list" name="people_count[]" class="form-control form-select people_count_suggest companies-filter" data-placeholder="Choose "  data-type="organization.people_count" data-endpoint="companies" data-index="index_for_company_master_new">
                                 <option value="0-5000000"> Choose </option>
                                 <option value="0-0"> 0 </option>
                                <option value="1-50"> 1 - 50 </option>
                                 <option value="51-100"> 51 - 100 </option>
                                 <option value="101-500"> 101 - 500 </option>
                                 <option value="501-1000"> 501 - 1000 </option>
                                 <option value="1001-500000"> > 1000 </option>
                             </select>
                         </div>
                     </div>
                 </div>
             </div>

             <div class="accordion-item">
                 <h2 class="accordion-header" id>
                     <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse10"
                             aria-expanded="false" aria-controls="collapse10" >
                         Product Count
                     </button>
                 </h2>

                 <div id="collapse10" class="accordion-collapse collapse" aria-labelledby="heading10"  >
                     <div class="accordion-body">
                         <div class="filter-select-custom">
                             <select id="product_count_suggest_list" name="product_count[]" class="form-control form-select product_count_suggest companies-filter" data-placeholder="Choose "  data-type="organization.product_count" data-endpoint="companies" data-index="index_for_company_master_new">
                                 <option value="0-5000000"> Choose </option>
                                 <option value="0-0"> 0 </option>
                                <option value="1-50"> 1 - 50 </option>
                                 <option value="51-100"> 51 - 100 </option>
                                 <option value="101-500"> 101 - 500 </option>
                                 <option value="501-1000"> 501 - 1000 </option>
                                 <option value="1001-500000"> > 1000 </option>
                             </select>
                         </div>
                     </div>
                 </div>
             </div>

             <div class="accordion-item">
                 <h2 class="accordion-header" id>
                     <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse26"
                             aria-expanded="false" aria-controls="collapse26" >
                         Ingredient Count
                     </button>
                 </h2>

                 <div id="collapse26" class="accordion-collapse collapse" aria-labelledby="heading10"  >
                     <div class="accordion-body">
                         <div class="filter-select-custom">
                             <select id="ingredient_count_suggest_list" name="ingredient_count[]" class="form-control form-select ingredient_count_suggest companies-filter" data-placeholder="Choose "  data-type="organization.ingredient_count" data-endpoint="companies" data-index="index_for_company_master_new">
                                 <option value="0-5000000"> Choose </option>
                                 <option value="0-0"> 0 </option>
                                <option value="1-50"> 1 - 50 </option>
                                <option value="51-100"> 51 - 100 </option>
                                 <option value="101-500"> 101 - 500 </option>
                                 <option value="501-1000"> 501 - 1000 </option>
                                 <option value="1001-500000"> > 1000 </option>
                             </select>
                         </div>
                     </div>
                 </div>
             </div>

             <div class="accordion-item">
                 <h2 class="accordion-header" id>
                     <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse27"
                             aria-expanded="false" aria-controls="collapse26" >
                         Assigned/Unassigned
                     </button>
                 </h2>
 
                 <div id="collapse27" class="accordion-collapse collapse" aria-labelledby="heading22"  >
                     <div class="accordion-body">
                         <div class="filter-select-custom">
                             <select id="assigned_to_me_suggest_list" name="assigned_to_me[]" class="form-control form-select assigned_to_me_suggest companies-filter" data-placeholder="Choose ">
                                 <option value="0" selected>All</option>
                                 `+
                                (window.globalConfig.source == 'customer_linking' ? `<option value="2">Assigned</option><option value="3">Unassigned</option>` : `<option value="1">Assigned to me</option>`)+
                             `</select>
                         </div>
                     </div>
                 </div>
             </div>`+
             (window.globalConfig.source == 'customer_linking' ? 

             `<div class="accordion-item">
                 <h2 class="accordion-header" id>
                     <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse28"
                             aria-expanded="false" aria-controls="collapse28" >
                         Staff
                     </button>
                 </h2>
 
                 <div id="collapse28" class="accordion-collapse collapse" aria-labelledby="heading28"  >
                     <div class="accordion-body">
                         <div class="filter-select-custom">
                             <select id="assigned_staff_select_suggest_list" name="assigned_staff_select[]" class="form-control form-select staff_select assigned_staff_select_suggest companies-filter" data-placeholder="Select Staff "></select>
                         </div>
                     </div>
                 </div>
             </div>` : ``)+

        `</div>
        </form>
    </div>
</div>

<style>
    #topcountries {{
        width: 100%;
        height: 350px;
    }}
    #topcompanies {{
        width: 100%;
        height: 350px;
    }}
     #topcompanies_allcategory {{
         width: 100%;
         height: 400px;
     }}
</style>
    <!-- Page Content -->
    <div id="page-content-wrapper">
        <!-- filter sidebar end -->


        <div class="page-content p-3">
            <!-- quick filter start -->
            <div>
            <div class="company-quick-filter">
                <button class="btn filter-main-button d-none">
                    <span class="icon-filter_icon"></span>
                    <h6>Filters</h6>
                </button>
                <div class="manas d-flex justify-content-between align-items-center">
                    <div class="d-sm-flex justify-content-between table-top ">
                        <h4 class="text-md-start mb-0" id="companies_count">Companies
                            <Span class="d-none" id="searchTitle">Total</Span>
                            <Span class="d-none" id="searchCountCompanies"></Span>
                            <Span class="d-none" id="totalCountCompanies"></Span>
                            <Span class="d-none" id="totalSelectedCountCompany"></Span>
                        </h4>
                        <h4 class="text-md-start d-none mb-0" id="people_count">People
                            <Span class="d-none" id="searchTitle">Total</Span>
                            <Span class="d-none" id="searchCountPeople"></Span>
                            <Span class="d-none" id="totalCountPeople"></Span>
                        </h4>
                        <h4 class="text-md-start d-none mb-0" id="review_count">Prospects
                            <Span class="d-none" id="searchTitle">Total</Span>
                            <Span class="d-none" id="searchCountProspect"></Span>
                            <Span class="d-none" id="totalCountReview"></Span>
                        </h4>
                    </div>
                    <div class="search-select-wildcard d-flex" style="width:55%">
                        <div class="wildcard-search d-flex justify-content-between pe-0" style="width:50%" id="search-nav">
                            <div class="search-box">
                                <div class=" d-flex justify-content-between">
                                    <div class="input-group">
                                        <input type="text" placeholder="Search ..." id="top_search" class="form-control" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" value="" onkeydown="headSearch(event)">
                                    </div>
                                </div>
                            </div>
                    </div>`+
                (window.globalConfig.source == 'customer_linking' ? `
                <div class="wildcard-search d-flex justify-content-between" style="width:50%" id="search-nav">
                    <div class="search-box">
                        <div class="d-flex  Select_staff_assign">
                            <select id="staff_select" name="staff_select[]"  style="width:90%; max-width: 90%;" class="staff_select form-control me-3 form-select" data-placeholder="Select Staff "></select>
                            <button type="button" class="btn btn-primary" id="assign_companies" onclick="assign_companies()" disabled>Assign</button>
                        </div>
                    </div>
                </div>` : ``)+`
            </div>
                </div>
            </div>
            <div class="clearfix"></div>
            <!-- quick filter end -->
            <div class="company-listing-data" id="company-listing-data">
            
            
            <!-- datatable start -->
            <div class="table-responsive">
                <table class="accordion accordion-flush" id="accordionFlushExample">
                    <thead>
                        <tr>
                        <th width="20px"><input type="checkbox" id="checkAllCompany" class="form-check-input"></th>
                        <th class="sort_data" data-type="name.keyword">Company</th>
                        <th class="sort_data" data-type="industry.keyword">Industry</th>
                            <th>Keywords</th>
                            <th>Company Location</th>
                            <th class="sort_data" data-type="company_type.keyword">Company Type</th>
                            <th class="sort_data" data-type="people_count"># People</th>
                            <th class="sort_data" data-type="ingredient_count"># Ingredient</th>
                            <th class="sort_data" data-type="product_count"># Product</th>
                            <th class="sort_data" data-type="annual_revenue">Revenue</th>
                            `+(window.globalConfig.source == 'customer_linking' ? `<th class="sort_data" data-type="account_owner">Account Owner</th>` : ``)+`
                            <th class="sort_data" data-type="last_update">Last Updated At</th>
                            <th><span class="icon-info" data-bs-toggle="tooltip"  title="Company details"></span></th>
                        </tr>
                    </thead>
                    <tbody id="companies-data-table"></tbody>
                </table>
            </div>
            <!-- datatable end -->
        </div>
        <div class="people-listing-data d-none" id="people-listing-data">
        <!-- datatable start -->
        <div class="table-responsive my-3 people_listing">
            <table class="accordion accordion-flush">
                <thead>
                    <tr>
                        <th class="checkAllPeople"><input type="checkbox" id="checkAllPeople" class="form-check-input"></th>
                        <th class="sort_people_data" data-type="name" id="sort_people_name">Name</th>
                        <!-- <th>Email</th> -->
                        <th class="sort_people_data" data-type="title">Title</th>
                        <th class="sort_people_data" data-type="organization.name">Company</th>
                        <th class="sort_people_data" data-type="organization.company_type">Company Type</th>
                        <th>Contact Location</th>
                        <th class="sort_people_data" data-type="organization.industry">Industry</th>
                        <th>Keywords</th>
                        <th><span class="icon-info" data-bs-toggle="tooltip"  title="People details"></span></th>
                    </tr>
                </thead>
                <tbody id="people-data-table"></tbody>
            </table>
        </div>
        <!-- datatable end -->
        </div>
        <div class="review-prospects-listing-data d-none" id="review-prospects-listing-data">
        <div class="table-responsive my-3 people_listing">
            <table class="accordion accordion-flush">
                <thead>
                    <tr>
                        <th class="sort_people_data" data-type="name" id="sort_people_name">Name</th>
                        <!-- <th>Email</th> -->
                        <th class="sort_people_data" data-type="title">Title</th>
                        <th class="sort_people_data" data-type="organization.name">Company</th>
                        <th class="sort_people_data" data-type="organization.company_type">Company Type</th>
                        <th>Contact Location</th>
                        <th class="sort_people_data" data-type="organization.industry">Industry</th>
                        <th>Keywords</th>
                        <th><span class="icon-info" data-bs-toggle="tooltip"  title="People details"></span></th>
                    </tr>
                </thead>
                <tbody id="review-prospects-data-table"></tbody>
            </table>
        </div>
        </div>
        <div id="loader" class="loader-new"><img src="`+window.envConfig.base_url+`assets/img/Infinity-2s-86px.svg"></div>

        <!-- Pagination -->
        <div class="pagination-container d-flex justify-content-between align-items-center mt-3 mb-3" id="paginationContainer1">
            <div id="entries-per-page1" class="d-flex align-items-center">
                <label class="text-nowrap pe-2">Show entries: </label>
                <select id="entries-select-1" class="form-select form-select-sm">
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                </select>
            </div>
            <nav aria-label="Page navigation">
                <ul class="pagination" id="pagination_new1">
                    <li class="page-item" id="previousButton1">
                        <a class="page-link" href="#" aria-label="Previous" onclick="prev(1)"> Previous </a>
                    </li>
                    <li class="page-item">
                        <select id="pageSelect1" class="form-select" aria-label="Page number"></select>
                    </li>
                    <li class="page-item" id="nextButton1">
                        <a class="page-link" href="#" aria-label="Next" onclick="next(1)">Next</a>
                    </li>
                </ul>
            </nav>
        </div>

        <div class="pagination-container d-flex justify-content-between align-items-center mt-3 mb-3" id="paginationContainer2">
            <div id="entries-per-page2" class="d-flex align-items-center">
                <label class="text-nowrap pe-2">Show entries: </label>
                <select id="entries-select-2" class="form-select form-select-sm">
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                </select>
            </div>
            <nav aria-label="Page navigation">
                <ul class="pagination" id="pagination_new2">
                    <li class="page-item" id="previousButton2">
                        <a class="page-link" href="#" aria-label="Previous" onclick="prev(2)"> Previous </a>
                    </li>
                    <li class="page-item">
                        <select id="pageSelect2" class="form-select" aria-label="Page number"></select>
                    </li>
                    <li class="page-item" id="nextButton2">
                        <a class="page-link" href="#" aria-label="Next" onclick="next(2)">Next</a>
                    </li>
                </ul>
            </nav>
        </div>

        <div class="pagination-container d-flex justify-content-between align-items-center mt-3 mb-3" id="paginationContainer3">
            <div id="entries-per-page3" class="d-flex align-items-center">
                <label class="text-nowrap pe-2">Show entries: </label>
                <select id="entries-select-3" class="form-select form-select-sm">
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                </select>
            </div>
            <nav aria-label="Page navigation">
                <ul class="pagination" id="pagination_new3">
                    <li class="page-item" id="previousButton3">
                        <a class="page-link" href="#" aria-label="Previous" onclick="prev(3)"> Previous </a>
                    </li>
                    <li class="page-item">
                        <select id="pageSelect3" class="form-select" aria-label="Page number"></select>
                    </li>
                    <li class="page-item" id="nextButton3">
                        <a class="page-link" href="#" aria-label="Next" onclick="next(3)">Next</a>
                    </li>
                </ul>
            </nav>
        </div>
    </div>
`;
    }

    initAccordion() {
        this.shadowRoot.addEventListener('click', (e) => {
            if (e.target.classList.contains('accordion-button')) {
                const accordionButton = e.target;
                const panel = this.shadowRoot.querySelector(accordionButton.getAttribute('data-bs-target'));
                // const panel = this.shadowRoot.querySelector(e.target.getAttribute('data-bs-target'));
                accordionButton.classList.toggle('collapsed');
                panel.classList.toggle('show');
            }
        });
    }

    fetchCSS(url) {
        return fetch(url).then(response => response.text());
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            this.shadowRoot.appendChild(script);
        });
    }
}

customElements.define('companies-list', CompaniesList);
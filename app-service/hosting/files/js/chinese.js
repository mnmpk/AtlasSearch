

const userAPIKey = "0P0b3hjgzsIhnT0Pq30ffMwOSI6FFQGLCUjvi8dFZZS81AzN3MPLm0jkFw3V8CHX";
const app = new Realm.App({ id: "search-app-nthoe" });
let timer = null;

function init() {
    login();
    $('.btn-search').click(function () {
        call();
    });
    $('#ddl').on('change', function () {
        call();
    });
    $('#search').on("keyup", function () {
        /*if ($('#search').val().length > 1) {
            clearTimeout(timer);
            timer = setTimeout(autoComplete, 200);
        }*/
    });
}

async function login() {
    try {
        if (!app.currentUser) {
            let credentials;
            if (userAPIKey.length > 0) {
                credentials = Realm.Credentials.apiKey(userAPIKey);
            } else {
                credentials = Realm.Credentials.anonymous();
            }
            await app.logIn(credentials);
        }
    } catch (error) {
        console.error(error);
    }
}
/*async function autoComplete() {
    await app.currentUser.refreshCustomData();
    let query = { "c": "autocomplete", "q": $('#search').val(), "s": $("#ddl").val() };
    renderAutoComplete($('#search').val(), await app.currentUser.functions.chinese(query));
}

function renderAutoComplete(query, results) {
    var placholder = $('#autocomplete');
    placholder.empty();

    $.each(results, function (index, item) {
        var e = $(`
        <li class="option input-group">
        <span class="option-text">${item.title}</span>
    </li>`);

        e.on("click", function () {
            $('#search').val(item.title);
            call();
        });
        placholder.append(e);
    });

    var e = $(`
    <li class="option input-group">
        See Full Results for "${query}"
    </li>`);
    e.on("click", function () {
        $('#search').val(query);
        call();
    });
    placholder.append(e);
    placholder.show();
}*/

async function call() {
    $('#autocomplete').hide();
    await app.currentUser.refreshCustomData();
    let query = { "c": $("input[name='search']:checked").val(), "q": $('#search').val(), "s": $("#ddl").val(), "types": $.map($('input[name="Types"]:checked'), function (c) { return c.value; }), "districts": $.map($('input[name="Districts"]:checked'), function (c) { return c.value; }) };
    render(await app.currentUser.functions.chinese(query));
    renderFacets(await app.currentUser.functions.chinese({ "c": "facets", "q": $('#search').val() }));
}

function render(results) {

    var placholder = $('#results');
    placholder.empty();

    $.each(results, function (index, item) {
        var e = $(`
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">${item.name["zh-hk"]} - ${item.name.en}</h5>
                <h6 class="card-subtitle mb-2 text-muted">${item.district?item.district["zh-hk"]+"("+item.district.en+")":""}</h6>
                ${item.photo ? '<img class="img-fluid" src="' + item.photo + '" />' : ""}
                ${highlight(item)}
                
                Description:
                <p class="card-text">${item.merits?item.merits["zh-hk"]+"("+item.merits.en+")":""}</p>
                <p class="card-text">${item.address?item.address["zh-hk"]+"("+item.address.en+")":""}</p>
                <p class="card-text">${item.op_date?item.op_date.toLocaleDateString():""}</p>
                <p class="card-text">${item.bldg_types?item.bldg_types.join(", "):""}</p>

                
                <div class="mlt row">
                    <button class="btn btn-leafy btn-sm">Find More Like This</button>
                </div>
                <!--button class="btn btn-leafy btn-sm" @onclick="LearnMoreClicked" data-bs-toggle="modal"
                    data-bs-target="#ctr_modal">Learn More</button-->

                <div class="card-footer text-muted">
                    Score: ${item.score}
                </div>

            </div>
        </div>`);
        e.find(".mlt button").on("click", function () {
            mlt(e, item);
        });
        placholder.append(e);
    });
    /*setTimeout(function () {
        $("#overlay").fadeOut(300);
    }, 500);*/
}

function renderFacets(results) {
    var placholder = $('#facets');
    let html = ``;
    for (const facet in results[0]) {
        html += `<div>
        <h2>${facet}</h2>`;
        $.each(results[0][facet], function (index, item) {
            html += `<div class="form-check">
            <input class="form-check-input" type="checkbox" name="${facet}" value="${item._id}" id="${facet + index}" ${$("#" + facet + index).prop('checked') ? "checked" : ""}>
            <label class="form-check-label" for="${facet + index}">
                ${item._id} (${item.count})
            </label>
        </div>`;

        });
        html += `</div>`;
    }
    placholder.empty();
    placholder.append(html);

    placholder.find("input").on("change", function () {
        call();
    });
}

async function mlt(e, item) {
    const mlt = await app.currentUser.functions.chinese({ "c": "mlt", "n": item.name, "t": item.bldg_types, "m": item.merits, "d": item.district })
    e.find(".mlt").empty();
    if (mlt.length) {
        $.each(mlt, function (index, i) {
            e.find(".mlt").append(`<div class="col">${i.photo ? '<img class="img-fluid" src="' + i.photo + '" />' : ""}${i.name["zh-hk"]}</div>`);
        });
    } else {
        e.find(".mlt").append(`<p>This is unique!</p>`);
    }

}


function highlight(item) {
    let txt = `Matched:`;
    if (item.highlights) {
        var hs = item.highlights.filter(h => h.path == "merits.en"||h.path == "merits.zh-hk"||
        h.path == "address.en"||h.path == "address.zh-hk");
        if (hs.length) {
            txt += `<p class="card-text">`;
            hs.forEach(function (highlight) {
                highlight.texts.forEach(function (item) {
                    if (item.type == 'hit') {
                        txt += `<span class="highlight-hit">${item.value}</span>`;
                    }
                    else {
                        txt += `<span>${item.value}</span>`;
                    }
                });
            });
            txt += `</p>`;
        } 
    } 
    return txt;
}
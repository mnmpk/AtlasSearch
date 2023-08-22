

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
    $("input[name='search']").on('change', function () {
        var autocomplete = $('#autocomplete');
        var sort = $('#sort');
        var facets = $('#facets');
        autocomplete.hide();
        sort.hide();
        facets.hide();
        $('#search').off();

        if (this.value == "id") {

        } else if (this.value == "dynamic") {

        } else if (this.value == "final") {
            $('#search').on("keyup", function () {
                if ($('#search').val().length > 1) {
                    clearTimeout(timer);
                    timer = setTimeout(autoComplete, 200);
                }
            });
        } else if (this.value == "chi") {

        }
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
async function autoComplete() {
    await app.currentUser.refreshCustomData();
    let query = { "c": "autocomplete", "q": $('#search').val(), "s": $("#ddl").val() };
    renderAutoComplete($('#search').val(), await app.currentUser.functions.local(query));
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
    /*setTimeout(function () {
        $("#overlay").fadeOut(300);
    }, 500);*/
}

async function call() {
    $('#autocomplete').hide();
    await app.currentUser.refreshCustomData();
    let query = { "c": $("input[name='search']:checked").val(), "q": $('#search').val(), "s": $("#ddl").val(), "casts": $.map($('input[name="casts"]:checked'), function (c) { return c.value; }), "genres": $.map($('input[name="genres"]:checked'), function (c) { return c.value; }) };
    render(await app.currentUser.functions.local(query));
    if (query.c == "final") {
        renderFacets(await app.currentUser.functions.local({ "c": "facets", "q": $('#search').val() }));
    }
    /*
        var letters = $('#search').val();
        var collection = $('#collection').val();
        var index = $('#index').val();
        var operator = $('input[name="operator"]:checked').val();
        var path = $('#path').val();
        var k = $('#keyword').prop('checked');
        var e = $('#english').prop('checked');
        var c = $('#chinese').prop('checked');
        var j = $('#japanese').prop('checked');
        if ((e || c || j) && !path) {
            alert("path cannot empty if using analyzer");
            return;
        }
        var fuzzy = $('#fuzzy').val();
        var limit = $('#limit').val();
        var radius = $('#radius').val();
        if ((letters) || $('#geo').prop('checked')) {
            $("#overlay").fadeIn(300);
            await app.currentUser.refreshCustomData();
            let query = { "coll": collection, "i": index, "q": letters, "o": operator, "f": fuzzy, "l": limit, "k": k, "e": e, "c": c, "j": j };
            if ($('#geo').prop('checked')) {
                query.lat = circle.getCenter().lat();
                query.lng = circle.getCenter().lng();
                query.r = radius;
            }
            if (path) {
                query.p = path;
            }
    
            render(letters, await app.currentUser.functions.search(query));
        }*/
}
function renderFacets(results) {
    var placholder = $('#autocomplete');
    console.log(results);
}

async function mlt(e, item) {
    const mlt = await app.currentUser.functions.local({ "c": "mlt", "t": item.title, "g": item.genres, "fp": item.fullplot })
    e.find(".mlt").empty();
    if (mlt.length) {
        $.each(mlt, function (index, i) {
            e.find(".mlt").append(`<div class="col">${i.poster ? '<img class="img-fluid" src="' + i.poster + '" />' : ""}${i.title}</div>`);
        });
    } else {
        e.find(".mlt").append(`<p>This is unique!</p>`);
    }

}


function render(results) {

    var placholder = $('#results');
    placholder.empty();

    $.each(results, function (index, item) {
        var e = $(`
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">${item.title} (${item.year})</h5>
                ${item.poster ? '<img class="img-fluid" src="' + item.poster + '" />' : ""}
                ${highlight(item)}
                
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
    $('#facets').show();
    $('#sort').show();
    /*setTimeout(function () {
        $("#overlay").fadeOut(300);
    }, 500);*/
}

function highlight(item) {
    let txt = ``;
    if (item.highlights) {
        var hs = item.highlights.filter(h => h.path == "fullplot");
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
        } else {
            txt += `<p class="card-text">${item.fullplot}</p>`;
        }
    } else {
        txt += `<p class="card-text">${item.fullplot}</p>`;
    }
    return txt;
}
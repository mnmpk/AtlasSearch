

const userAPIKey = "0P0b3hjgzsIhnT0Pq30ffMwOSI6FFQGLCUjvi8dFZZS81AzN3MPLm0jkFw3V8CHX";
const app = new Realm.App({ id: "search-app-nthoe" });
let timer = null;

function init() {
    login();
    $('.btn-search').click(function () {
        call();
    });
    $('#search').keyup(function () {
        clearTimeout(timer);
        timer = setTimeout(call, 1000)
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

async function call() {
    await app.currentUser.refreshCustomData();
    let query = { "c": $("input[name='search']:checked").val(), "q": $('#search').val(), "s": $("#ddl").val() };
    render(await app.currentUser.functions.local(query));
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

async function mlt(e, item) {
    const mlt = await app.currentUser.functions.local({ "c": "4", "t": item.title, "g":item.genres, "fp": item.fullplot })
    e.find(".mlt").empty();
    if(mlt.length){
        $.each(mlt, function (index, item) {
            e.find(".mlt").append(`<div>${item.poster?'<img class="img-fluid" src="${item.poster} />':""}${item.title}</div>`);
        });
    }else{
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
                <h5 class="card-title">${item.title}(${item.year})</h5>
                <img class="img-fluid" src="${item.poster}" />
                ${highlight(item)}
                
                <div class="mlt">
                    <button class="btn btn-leafy btn-sm">Find More Like This</button>
                </div>

                <div class="card-footer text-muted">
                    Score: ${item.score}
                </div>

                <button class="btn btn-leafy btn-sm" @onclick="LearnMoreClicked" data-bs-toggle="modal"
                    data-bs-target="#ctr_modal">Learn More</button>
            </div>
        </div>`);
        e.find(".mlt button").on("click",function(){
            mlt(e, item);
        });
        placholder.append(e);
    });
    /*setTimeout(function () {
        $("#overlay").fadeOut(300);
    }, 500);*/
}

function highlight(item) {
    let txt = ``;
    if (item.highlights) {
        item.highlights.forEach(function (highlight) {
            highlight.texts.forEach(function (item) {
                if (item.type == 'hit') {
                    txt += `<span class="highlight-hit">${item.value}</span>`;
                }
                else {
                    txt += `<span>${item.value}</span>`;
                }
            });
        });
    } else {
        txt += `<p class="card-text">${item.Plot}</p>`;
    }
    return txt;
}
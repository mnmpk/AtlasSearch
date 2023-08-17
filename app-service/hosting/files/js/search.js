

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
    let query = { "s": $("input[name='search']:checked").val(), "q": $('#search').val() };
    render(await app.currentUser.functions.search(query));
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


function render(results) {

    var placholder = $('#results');
    placholder.empty();

    let html = '';
    $.each(results, function (index, item) {

        let doc = item.document;

        html += `
        <div class="card">
        <div class="card-body">
            <h5 class="card-title">${item.year}</h5>
            ${highlight(item)}
            
            <button class="btn btn-leafy btn-sm" @onclick="RunSearch">Find More Like This</button>
            ${item.poster?`<img class="moviePoster" src="${item.poster}" width="50px" />`:""}
            <div class="moviePoster">${item.title}</div>
            <p>This is unique!</p>

            <div class="card-footer text-muted">
                Score: ${item.score}
            </div>

            <button class="btn btn-leafy btn-sm" @onclick="LearnMoreClicked" data-bs-toggle="modal"
                data-bs-target="#ctr_modal">Learn More</button>
        </div>
    </div>
    `;
    });
    placholder.append(html);
    /*setTimeout(function () {
        $("#overlay").fadeOut(300);
    }, 500);
    var placholder = $('#search-results-placholder');
    placholder.empty();
    deleteMarkers();

    // update count
    $('#result-count').html(results.length)
    // update search query
    $('#search-query').html(letters)

    let html = '';
    $.each(results, function (index, item) {

        let doc = item.document;

        html += `
      <article class="search-result row">
        <div class="col-md-5" style="height:200px;overflow:auto;">
          <pre><code>${JSON.stringify(doc.content, null, 4)}</code></pre>
        </div>
        <div class="col-md-7 excerpet">
          ${item.highlights ? highlight(item.highlights) : ""}
          <p>Search score: ${item.score}</p>
        </div>
        <span class="clearfix borda"></span>
      </article>
    `
        if (map && doc.location) {
            var marker = new google.maps.Marker({ map: map, position: { lat: doc.location.coordinates[1], lng: doc.location.coordinates[0] } });
            markers.push(marker);
        }
    });
    // place in html
    placholder.append(html);*/
}

function highlight(item) {
    let txt = ``;
    if(item.highlights){
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
    }else{
        txt += `<p class="card-text">${item.Plot}</p>`;
    }
    /*highlights_arr.forEach(function (highlight) {
        if (highlight.path instanceof Object) {
            txt += `<h3>matched path: ${highlight.path.value}, analyzer: ${highlight.path.multi}</h3><p>`;
        } else {
            txt += `<h3>matched path: ${highlight.path}</h3><p>`;
        }
        highlight.texts.forEach(function (item) {
            if (item.type == 'hit') {
                txt += `<b><span class="highlight"> ${item.value} </span></b>`;
            }
            else {
                txt += item.value;
            }
        });
    });
    txt += `</p>`;*/
    return txt;
}
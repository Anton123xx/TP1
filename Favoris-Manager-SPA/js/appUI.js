//<span class="cmdIcon fa-solid fa-ellipsis-vertical"></span>
let contentScrollPosition = 0;
var choixCategorie = "tout";
Init_UI();

function Init_UI() {
    renderFavoris();
    renderCategorie();
    $('#createFavori').on("click", async function () {
        saveContentScrollPosition();
        renderCreateFavoriForm();
    });
    $('#abort').on("click", async function () {
        renderFavoris();
    });
    $('#aboutCmd').on("click", function () {
        renderAbout();
    });



    ////////le choix de categorie fonctionne seulement pour l'option ''toute les categories'' 
    //je ne sais pas pourquoi
    $('#choixCategorie').on("click", function () {
        choixCategorie = $(this).attr("value");
        console.log(choixCategorie);
        renderFavoris();
    });

    $(".cate").on("click", function (e) {
        choixCategorie = $(this).attr("value");
        renderFavoris();
    });

}


async function renderCategorie() {
    eraseContent();
    let favoris = await Favoris_API.Get();
    let listeCategorie = getListeCategorie(favoris)
    console.log(listeCategorie);
    listeCategorie.forEach(Categorie => {
        $("#optionCategorie").append(
            $(`  
                <div class="dropdown-item cate" id="choixCategorie" value="${Categorie}"> 
                <i class="menuIcon fa fa-sign-in mx-2"></i> ${Categorie}      
                </div>
                `));
    });

}

function getListeCategorie(favoris) {

    var listeCategorie = [];
    if (favoris !== null) {
        favoris.forEach(favori => {
            if (listeCategorie == undefined) {
                listeCategorie.push(favori.Categorie);
                console.log(favori.Categorie);
            }
            else if (listeCategorie.includes(favori.Categorie) == false) {
                listeCategorie.push(favori.Categorie);
            }
        });

        return listeCategorie;
    };

}




function renderAbout() {
    saveContentScrollPosition();
    eraseContent();
    $("#createFavori").hide();
    $("#abort").show();
    $("#actionTitle").text("À propos...");
    $("#content").append(
        $(`
            <div class="aboutContainer">
                <h2>Liste de favoris</h2>
                <hr>
                <p>
                    Petite application de liste de favoris.
                </p>
                <p>
                    Auteur: Anton S. Messmer
                </p>
                <p>
                    Collège Lionel-Groulx, automne 2023
                </p>
            </div>
        `))
}


async function renderFavoris() {
    showWaitingGif();
    $("#actionTitle").text("Liste des favoris");
    $("#createFavori").show();
    $("#abort").hide();
    let favoris = await Favoris_API.Get();
    eraseContent();
    if (favoris !== null) {
        if (choixCategorie == "tout") {
            favoris.forEach(favori => {
                $("#content").append(renderFavori(favori));
            });
        }
        else {
            favoris.forEach(favori => {
                if (favori.Categorie == choixCategorie) {
                    console.log(choixCategorie);
                    $("#content").append(renderFavori(favori));
                }

            });
        }

        restoreContentScrollPosition();
        // Attached click events on command icons
        $(".editCmd").on("click", function () {
            saveContentScrollPosition();
            renderEditFavoriForm(parseInt($(this).attr("editFavoriId")));
        });
        $(".deleteCmd").on("click", function () {
            saveContentScrollPosition();
            renderDeleteFavoriForm(parseInt($(this).attr("deleteFavoriId")));
        });
        $(".favoriRow").on("click", function (e) { e.preventDefault(); })
    } else {
        renderError("Service introuvable");
    }
}
function showWaitingGif() {
    $("#content").empty();
    $("#content").append($("<div class='waitingGifcontainer'><img class='waitingGif' src='Loading_icon.gif' /></div>'"));
}
function eraseContent() {
    $("#content").empty();
}
function saveContentScrollPosition() {
    contentScrollPosition = $("#content")[0].scrollTop;
}
function restoreContentScrollPosition() {
    $("#content")[0].scrollTop = contentScrollPosition;
}
function renderError(message) {
    eraseContent();
    $("#content").append(
        $(`
            <div class="errorContainer">
                ${message}
            </div>
        `)
    );
}
function renderCreateFavoriForm() {
    renderFavorisForm();
}
async function renderEditFavoriForm(id) {
    showWaitingGif();
    let contact = await Favoris_API.Get(id);
    if (contact !== null)
        renderFavorisForm(contact);
    else
        renderError("Favoris introuvable!");
}
async function renderDeleteFavoriForm(id) {
    showWaitingGif();
    $("#createFavori").hide();
    $("#abort").show();
    $("#actionTitle").text("Retrait");
    let favori = await Favoris_API.Get(id);
    eraseContent();
    if (favori !== null) {
        $("#content").append(`
        <div class="favorideleteForm">
            <h4>Effacer le favori suivant?</h4>
            <br>
            <div class="favoriRow" favori_id=${favori.Id}">
                <div class="favoriContainer">
                    <div class="favoriLayout">
                    <span href="${favori.Url}"><div class="small-favicon" style="display: inline-block; background-image: url('http://www.google.com/s2/favicons?sz=64&amp;domain=${favori.Url}/');"></div></span>
                        <div class="favoriTitle">${favori.Title}</div>
                        <div class="favoriCategorie">${favori.Categorie}</div>
                    </div>
                </div>  
            </div>   
            <br>
            <input type="button" value="Effacer" id="deleteFavori" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </div>    
        `);
        $('#deleteFavori').on("click", async function () {
            showWaitingGif();
            let result = await Favoris_API.Delete(favori.Id);
            if (result)
                renderFavoris();
            else
                renderError("Une erreur est survenue!");
        });
        $('#cancel').on("click", function () {
            renderFavoris();
        });
    } else {
        renderError("Favori introuvable!");
    }
}
function newFavori() {
    favori = {};
    favori.Id = 0;
    favori.Title = "";
    favori.Url = "";
    favori.Categorie = "";
    return favori;
}
function renderFavorisForm(favori = null) {
    $("#createFavori").hide();
    $("#abort").show();
    eraseContent();
    let create = favori == null;

    var icon = "bookmark_logo.png"; 
    if (create) {
        favori = newFavori()
    }

    $("#actionTitle").text(create ? "Création" : "Modification");
    $("#content").append(`
  
        <form class="form" id="favoriForm">
            <input type="hidden" name="Id" value="${favori.Id}"/>
            <span href="${icon}">
            <div class="big-favicon" style="display: inline-block; background-image: ${icon};">  </div>
            </span>
             <br>
            <label for="Title" class="form-label">Titre </label>
            <input 
                class="form-control Alpha"
                name="Title" 
                id="Title" 
                placeholder="Titre"
                required
                RequireMessage="Veuillez entrer un titre"
                InvalidMessage="Le titre comporte un caractère illégal" 
                value="${favori.Title}"
            />
            <label for="Url" class="form-label">Url </label>
            <input
                class="form-control URL"
                name="Url"
                id="Url"
                placeholder="Url"
                required
                RequireMessage="Veuillez entrer un url" 
                InvalidMessage="Veuillez entrer un url valide"
                value="${favori.Url}" 
            />
            <label for="Categorie" class="form-label">Catégorie</label>
            <input 
                class="form-control Categorie"
                name="Categorie"
                id="Categorie"
                placeholder="Catégorie"
                required
                RequireMessage="Veuillez entrer une catégorie" 
                InvalidMessage="Veuillez entrer une catégorie valide"
                value="${favori.Categorie}"
            />
            <hr>
            <input type="submit" value="Enregistrer" id="saveFavori" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </form>
    `);

    initFormValidation();
    $('#favoriForm').on("submit", async function (event) {
        event.preventDefault();
        let favoris = getFormData($("#favoriForm"));
        favoris.Id = parseInt(favoris.Id);

        ///////////////////
        console.log(favoris.Id);
        console.log(favoris.Url);
        console.log(favoris.Categorie);
        //////////////////

        showWaitingGif();
        let result = await Favoris_API.Save(favoris, create);
        if (result)
            renderFavoris();
        else
            renderError("Une erreur est survenue!");
    });
    $('#cancel').on("click", function () {
        renderFavoris();
    });


}

function getFormData($form) {
    const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
    var jsonObject = {};
    $.each($form.serializeArray(), (index, control) => {
        jsonObject[control.name] = control.value.replace(removeTag, "");
    });
    return jsonObject;
}

function renderFavori(favori) {

    return $(`
     <div class="favoriRow" favori_id=${favori.Id}">
        <div class="favoriContainer noselect">
     
            <div class="favoriLayout">
                <span class="favoriTitle"><i class="small-favicon" style="display: inline-block; background-image: url('http://www.google.com/s2/favicons?sz=64&amp;domain=${favori.Url}/');"></i>${favori.Title}</span>
                <span class="favoriCategorie">${favori.Categorie}</span>
            <div class="favoriCommandPanel">
                <span class="editCmd cmdIcon fa fa-pencil" editFavoriId="${favori.Id}" title="Modifier ${favori.Title}"></span>
                <span class="deleteCmd cmdIcon fa fa-trash" deleteFavoriId="${favori.Id}" title="Effacer ${favori.Title}"></span>
            </div>
       
    </div>           
    `);
}
class Favoris_API {
    static API_URL() { return "http://localhost:5000/api/favoris" };

    static async Get(id = null) {
        return new Promise(resolve => {
            $.ajax({
                url: this.API_URL() + (id != null ? "/" + id : ""),
                success: favoris => { resolve(favoris); },
                error: (xhr) => { console.log(xhr); resolve(null); }
            });
        });
    }

    static async Save(favoris, create = true) {
        return new Promise(resolve => {
            $.ajax({
                url: this.API_URL(),
                type: create ? "POST" : "PUT",
                contentType: 'application/json',
                data: JSON.stringify(favoris),
                success: (/*data*/) => { resolve(true); },
                error: (/*xhr*/) => { resolve(false /*xhr.status*/); }
            });
        });
    }

    static async Delete(id) {
        return new Promise(resolve => {
            $.ajax({
                url: this.API_URL() + "/" + id,
                type: "DELETE",
                success: () => { resolve(true); },
                error: (/*xhr*/) => { resolve(false /*xhr.status*/); }
            });
        });
    }
}


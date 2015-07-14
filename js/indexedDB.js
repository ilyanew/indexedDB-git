var db,
    dbName = 'myPersonalData',
    dbObject_1 = 'table_1';

function indexedDBOk() {
    return "indexedDB" in window;
}

document.addEventListener("DOMContentLoaded", function() {

    if(!indexedDBOk) return;

    //indexedDB.deleteDatabase(dbName);
    var openRequest = indexedDB.open(dbName,1);

    openRequest.onupgradeneeded = function(e) {
        var thisDB = e.target.result;

        if(!thisDB.objectStoreNames.contains(dbObject_1)) {
            thisDB.createObjectStore(dbObject_1, {autoIncrement:true});
        }
    };

    openRequest.onsuccess = function(e) {
        console.log("running onsuccess");

        db = e.target.result;

        var transaction = db.transaction([dbObject_1],"readwrite"),
            store = transaction.objectStore(dbObject_1),
            request = store.add({count: 0}, 0);

        updateTable('load');

        document.querySelector("#addButton").addEventListener("click", addContact, false);
    };

    openRequest.onerror = function(e) {
        console.log("running onerror");
    }


},false);


function addContact(e) {
    var name = document.querySelector("#name").value,
        email = document.querySelector("#email").value,
        transaction = db.transaction([dbObject_1],"readwrite"),
        store = transaction.objectStore(dbObject_1),
        contact = {
            name:name,
            email:email
        },
        request = store.add(contact);

    request.onerror = function(e) {
        console.log("Error",e.target.error.name);
    };

    request.onsuccess = function(e) {
        updateTable('add', name, email); //add 1 to count
    }
}

function updateTable(incCount, name, email) {
    var transaction = db.transaction([dbObject_1],"readwrite"),
        store = transaction.objectStore(dbObject_1),
        request = store.get(Number(0));

    request.onsuccess = function(){
        var count = this.result.count,
            requestLoad,
            requestUpdateCount;

        if (incCount === 'add') {
            requestUpdateCount = store.put( {'count': count + 1}, 0 );
            requestUpdateCount.onerror = function(e) {};
            requestUpdateCount.onsuccess = function(e) {
                count++;
                updateTableView(name, email);
            };
        } else if (incCount === 'load') {
            for (var i = 1; i <= count; i++) {
                requestLoad = store.get(Number(i));
                requestLoad.onerror = function(e) {};
                requestLoad.onsuccess = function(e) {
                    var result = this.result;
                    updateTableView(result.name, result.email);
                };
            }
        }
    };

}

function updateTableView(name, email) {
    var tr = document.createElement('tr');
    tr.innerHTML = '<td>' + name + '</td><td>' + email + '</td><td></td>';
    document.querySelector("#results tbody").appendChild(tr);
}
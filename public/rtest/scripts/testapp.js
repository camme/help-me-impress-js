require(['config'], function() {

    require(['cssorder'], function() {
    
        console.log("done");

        var done = document.createElement("div");
        done.setAttribute("id", "done");
        document.body.appendChild(done);
           
    });

});

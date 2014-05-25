define(function(require) {

    var overlay = null;
    var modals = [];

    var Modal = function(dom) {
        this.dom = dom;
        this.wrapper;
        this.shown = false;
    };

    Modal.prototype.show = function() {

        if (!overlay) {
           overlay = document.createElement("div");
           overlay.id = "overlay";
           overlay.classList.add("show");
           document.body.appendChild(overlay);
        }
   
        this.wrapper = document.createElement("div");
        this.dom.style.display = "block";
        this.wrapper.appendChild(this.dom);
        this.wrapper.classList.add("modal-wrapper");
        this.wrapper.classList.add("modal-show");
        document.body.appendChild(this.wrapper);
        this.shown = true;

    };

    Modal.prototype.hide = function() {

        if (!this.shown) {
            return;
        }

        if (overlay) {
           overlay.classList.remove("show");
        }

        document.body.removeChild(this.wrapper);

        this.shown = false;
    
    };



    return function(dom) {
        return new Modal(dom);    
    };

});

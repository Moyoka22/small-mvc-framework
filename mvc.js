// ! Steps are:
// 1. Add the route information
// 2. Create an update view function
// Wire up the update view function with the hash changes
// Fetch the view HTML
// Call the controller function
// Replace the tokens
// render the view html in the view container
(function (w, d) {
  var _viewElement = null, // References the view element
    _defaultRoute = null, // Holds the default route for when  one is not supplied
    _rendered = false; // true if the view has been rendered
  var jsMvc = function () {
    // Constructor function for mvc plug-in
    this._routeMap = {}; // Constructor function creates object for the plugic, the routeMap object holds the routes.
  };

  jsMvc.prototype.AddRoute = function (controller, route, template) {
    this._routeMap[route] = new routeObj(controller, route, template);
  };

  jsMvc.prototype.Initialize = function () {
    // Create an update view delegate which is called whenever the hash change event is fired; i.e., when the view hash is changed.
    var updateViewDelegate = updateView.bind(this);
    // Get the view element
    this._viewElement = d.getElementById("view");
    if (!this._viewElement) return;
    // Set a default route
    _defaultRoute = this._routeMap[
      Object.getOwnPropertyNames(this._routeMap)[0]
    ];
    // Wire up the hash change event with the update view delegate
    w.onhashchange = updateViewDelegate;

    // Call the update view delegate
    updateViewDelegate();
  };

  function updateView() {
    // Get the route name from the address bar hash
    var pageHash = w.location.hash.replace("#", ""); // Access the windows hash value and removes the leading #
    routeName = null;
    routeObj = null;

    routeName = pageHash.replace("/", "");
    _rendered = false;

    // Fetch the route object using the route name
    routeObj = this._routeMap[routeName];
    routeObj = routeObj ? routeObj : this._defaultRoute;

    // Render the view html associated with the route
    loadTemplate(routeObj, this._viewElement);
  }

  function loadTemplate(routeObj, viewElement) {
    var xmlhttp = window.XMLHttpRequest
      ? new XMLHttpRequest()
      : new ActiveXObject("Microsoft.XMLHTTP"); // Later provides support for IE5 and IE6
    xmlhttp.onreadystatechange = () => {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        // load the view
        var viewHtml = xmlhttp.response;
        loadView(routeObj, viewElement, viewHtml);
      }
    };
    xmlhttp.open("GET", routeObj.template, true);
    xmlhttp.send();
  }
  // Route name is found then use default route
  // Render the view html associated with the route

  function loadView(routeObj, viewElement, viewHtml) {
    // create the model object
    var model = {};

    // call the controller function for the route
    routeObj.controller(model);

    // Replace the view HTML tokens with the model properties
    viewHtml = replaceTokens(viewHtml, model);
    // Render the view
    if (!_rendered) {
      viewElement.innerHTML = viewHtml;
      _rendered = true;
    }
  }

  function replaceTokens(viewHtml, model) {
    var modelProps = Object.getOwnPropertyNames(model);
    modelProps.forEach((element) => {
      viewHtml = viewHtml.replace(`{{${element}}}`, model[element]); // Loop through the model and replace any instances in the template which require values
    });
    return viewHtml;
  }

  var routeObj = function (c, r, t) {
    // Constructor for route objects
    this.controller = c;
    this.route = r;
    this.template = t;
  };

  w["jsMvc"] = new jsMvc();
})(window, document);

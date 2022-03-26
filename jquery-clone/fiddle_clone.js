(function(global) {
    function Plugins(selector) {
        var type = typeOf(selector);
        var methods = Plugins.prototype[type];
        this.target = type == 'string' ? document.querySelector(selector) : selector;
        
        for ([key, value] of Object.entries(methods)) {
            methods[key] = methods[key].bind(methods, this.target);
        }
        return methods;  
    }

    function addEvent(obj, event, func) {
        if (obj.addEventListener) {
            obj.addEventListener(event, function(e) {
                return func.bind(obj, e);
            });
        } else if (obj.addEvent) {
            obj.addEvent(event, function(e) {
                return func.bind(obj, e);
            });
        } else {
            var evt = event.replace('on', '');
            obj[evt] = function(e) {
                return func.bind(obj, e);
            };
        }
    }
    Plugins.prototype = {
        document: {
            ready: function(self, callback) {
                addEvent(self, 'load', callback);
            }
        },
        window: {
            ready: function(self, callback) {
                addEvent(self, 'load', callback);
            }
        },
        string: {
            click: function(self, callback) {
                addEvent('click', function(e) {
                    callback(e);
                });
                return this;
            },
            blur: function(self, callback) {
                var tag = this.target.tagName.toLowerCase(),
                    editable = this.attr('contenteditable');
                if (tag === "input" || editable) this.target.onblur = callback;
                return this;
            },
            input: function(self, callback) {
                if ("onpropertychange" in inp) {
                    inp.attachEvent($.proxy(function() {
                        if (event.propertyName == "value") callback.apply(this.target);
                    }, inp));
                } else {
                    inp.addEventListener("input", function() {
                        callback.apply(this.target);
                    }, false);
                }
            },
            mouseout: function(self, callback) {
                this.target.onmouseout = callback;
                return this;
            },
            kids: function(self) {
                var t = self.tagName.toLowerCase();
                if (t !== "input" && t !== "br" && t !== "button") {
                    return [].slice.call(self.childNodes);
                }
                return null;
            },
            empty: function(self) {
                var children = this.kids();
                children.forEach(function(e) {
                    e.remove();
                });
            },
            hide: function(self) {
                this.css('display', 'none');
            },
            show: function(self) {
                this.css('display', 'block');
                return this;
            },
            putBefore: function(self, a) {
                a.parentNode.insertBefore(this.target, a);
            },
            putAfter: function(self, a) {
                function sibiling(n) {
                    while ((x = n.nextSibling) && x.nodeType !== 1) {
                        x = x.nextSibling;
                        return x;
                    }
                    return false;
                }
                if (sibiling(this.target, a)) {
                    this.target.parentNode.insertBefore(sibiling(a), this);
                } else a.parentNode.append(this);

                return this;
            },
            html: function(self) {
                var len = arguments.length;
                switch (true) {
                case len === 0:
                    return this.target.innerHTML;
                case arguments[0] === "":
                    this.target.innerHTML = '';
                    return;
                default:
                    for (var i = 0; i < len; i++) {
                        this.target.innerHTML += arguments[i];
                    }
                    break;
                }
                return this;
            },
            text: function(self) {
                var len = arguments.length;
                if (len === 0) {
                    return this.target.textContent;
                } else if (arguments[0] === "") {
                    this.target.textContent = "";
                } else {
                    for (var i = 0; i < len; i++) {
                        this.target.textContent += arguments[i];
                    }
                }
                return this;
            },
            outer: function(self) {
                var len = arguments.length;
                switch (true) {
                case len === 0:
                    return this.target.outerHTML;
                case arguments[0] === "":
                    this.target.outerHTML = '';
                    return;
                default:
                    for (var i = 0; i < len; i++) {
                        this.target.outerHTML += arguments[i];
                    }
                    break;

                }
                return this;
            },
            data: function(self, a) {
                return this.target.dataset ? this.target.dataset[a] : this.attr('data-' + a);
            },
            css: function(self) {
                var args = Array.prototype.slice.call(arguments),
                    len = args.length,
                    style_com = window.getComputedStyle,
                    current = this.target.currentStyle;
                if (len === 1) {
                    if (typeOf(args[0]) == "object") {
                        var F = function() {},
                            val;
                        F.prototype = args[0];
                        for (var i in F.prototype) {
                            val = F.prototype[i];
                            this.target.style[i] = val;
                        }
                        return this;
                    }
                    if (style_com) return style_com(this.target).getPropertyValue(args[0]);
                    else if (current) return current[args[0]];
                } else {
                    for (var i = 0; i < args.length; i++) {
                        this.target.style[args[i]] = args[i + 1];
                        i++;
                    }
                }
                return this;
            },
            attr: function(self) {
                var args = Array.prototype.slice.call(arguments),
                    len = args.length,
                    get_attr = this.target.getAttribute(args[0]),
                    set_attr = function(a) {
                        this.setAttribute(args[a], args[a + 1]);
                    };

                if (len === 1) return get_attr;
                args.forEach(function(e, i) {
                    set_attr(i);
                    i++;
                });
                return this;
            },
            append: function(self, a) {
                if (typeOf(a) == "string") {
                    if (this.kids().length) {
                        var child = this.kids()[this.kids().length - 1];
                        
                        child.insertAdjacentHTML('afterEnd', a);
                        this.kids().forEach(function(elem) {
                            addPlugins(elem);
                        });
                    } else {
                        self.innerHTML += a;
                    }
                } else {
                    self.appendChild(a);
                }
                return this;
            },
            prepend: function(self, elem) {
                var d;
                if (typeOf(elem) == "string") {
                    if (this.kids().length) {
                        d = this.kids()[0];
                        d.insertAdjacentHTML('beforeBegin', elem);
                        this.kids().forEach(function(elem) {
                            addPlugins(elem);
                        });
                    } else {
                        this.append(elem);
                        this.kids().forEach(function(elem) {
                            addPlugins(elem);
                        });
                    }
                } else {
                    d = this.html();
                    this.html('');
                    this.append(elem);
                    this.kids().forEach(function(elem) {
                        addPlugins(elem);
                    });
                    elem.insertAdjacentHTML('afterEnd', d);
                }
                return this;
            },
            appendTo: function(self, a) {
                a.append(this);
            },
            prependTo: function(self, a) {
                a.prepend(this);
            },
            addClass: function(self, a) {
                if (this.attr('class') == null) {
                    this.target.className = a;
                } else {
                    this.target.className += ' ' + a;
                }
                return this;
            },
            removeClass: function(self, name) {
                var classlist = this.className.split(/\s/),
                    newlist = [],
                    idx = 0;

                for (; idx < classlist.length; idx++) {
                    if (classlist[idx] !== name) {
                        newlist.push(classlist[idx]);
                    }
                }
                this.className = newlist.join(" ");
                return this;
            },
            remove: function(self) {
                this.parentNode.removeChild(this);
                return this;
            },
            toggle: (function() {
                var old, usingColor = false;
                return function(self, obj) {
                    if (typeof elem == "string") {
                        elem = document.getElementById(elem);
                    }
                    if (!obj) {
                        this.target.style.display = (this.target.style.display == "none") ? "block" : "none";
                    }

                    var len = function(o) {

                        var measure = [];
                        for (var i in o) {
                            if (o.hasOwnProperty(i)) measure.push(i);
                        }
                        return function() {
                            measure.length;
                        };

                    }();

                    if (len(obj) == 0) return;

                    for (var i in obj) {
                        if (obj.hasOwnProperty(i) && elem.getAttribute(i)) {
                            if (!old) old = elem[i];
                            elem[i] = (elem[i] == obj[i]) ? old : obj[i];
                        } else if (i in elem.style) {
                            function rgbToHex(rgb) {
                                var i = 0,
                                    c, hex = '#',
                                    rgb = String(rgb).match(/\d+(\.\d+)?%?/g);
                                if (rgb === null) return null;
                                while (i < 3) {
                                    c = rgb[i++];
                                    if (c.indexOf('%') != -1) {
                                        c = Math.round(parseFloat(c) * 2.55);
                                    }
                                    c = (+c).toString(16);
                                    if (c.length == 1) c = '0' + c;
                                    hex += c;
                                }
                                return hex;
                            }
                            if (!old) {
                                old = rgbToHex(styleMethod(elem, i));
                                if (!old) old = styleMethod(elem, i);
                                else usingColor = true;
                            }
                            if (usingColor) {
                                if (rgbToHex(styleMethod(elem, i)) !== old) {
                                    elem.style[i] = old;
                                } else {
                                    elem.style[i] = obj[i];
                                }
                            } else {
                                if (styleMethod(elem, i) !== old) {
                                    elem.style[i] = old;
                                } else {
                                    elem.style[i] = obj[i];
                                }
                            }
                        }
                    }
                };
            })(),
            hover: function(self, onState, offState) {
                event.hover = event.hover ||
                function() {
                    if (onState || offState) {
                        if (onState) onState();
                        if (offState) offState();
                    }
                    else return false;
                }
                if (!(onState || offState)) {
                    event.hover(events);
                }
                addEvent('mouseover', (onState ||
                function() {
                    return false;
                }));
                addEvent('mouseout', (offState ||
                function() {
                    return false;
                }));
                return this;
            },
            fadeIn: function(self, that) {
                var s;
                that.style.display = "block";
                that.style.zoom = 1; // needed for IE
                that.style.opacity = 0;
                that.style.filter = "alpha(opacity = 0)";
                s = 600 / 20;
                var i = 0;
                var intervalId = setInterval(function() {
                    if (i <= 100) {
                        that.style.opacity = i / 100;
                        that.style.filter = 'alpha(opacity=' + i + ')';
                        i += 5;
                    } else {
                        clearInterval(intervalId);
                        return false;
                    }
                }, s);
                return that;
            },
            fadeOut: function(self, that) {
                var self = that,
                    t;
                if (!self instanceof Element) return false;
                self.style.opacity = ".90";
                t = setInterval(function() {
                    if (self.style.opacity == ".0") {
                        self.toggleVisibility();
                        clearInterval(t);
                    } else self.style.opacity -= .2;
                }, 30);
                return this;
            }
        }
    };

    function typeOf(obj) {
      var type = {}.toString.call(obj).slice(8, -1).toLowerCase();
      if (type == 'htmldocument')
        return 'document';
      return type;
    }

    function id(id) {
        if (typeOf(id) == "string") return document.getElementById(id);
        return id;
    }

    global.$ = function(selector) {
        return new Plugins(selector);
    }
})(this);

$(window).ready(function() {
    $('#myDiv').append('<div id="next">Hello World</div>');
});

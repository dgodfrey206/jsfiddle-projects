(function(global) {
    function Plugins(selector) {
        var a;
        if (typeOf(selector) == "string") {
            a = typeOf(document.getElementById(selector));
        } else a = typeOf(selector);
        var methods = Plugins.prototype[a];
        var keys = Object.keys(methods);
        keys.forEach(function(method) {
        console.log(method);
        	Plugins.prototype[a][method].bind(a == 'document' ? document : document.getElementById(selector));
        });
        return methods;
    }

    function addEvent(obj, event, func) {
        var evt = event.replace('on', '');
        if (obj.addEventListener) {
            obj.addEventListener(event, function(e) {
                return func.apply(obj, [e]);
            });
        } else if (obj.addEvent) {
            obj.addEvent(event, function(e) {
                return func.apply(obj, [e]);
            });
        } else {
            obj[evt] = function(e) {
                return func.apply(obj, [e]);
            };
        }
    }
    Plugins.prototype = {
        domwindow: {
            ready: function(callback) {

            }
        },
        document: {
            ready: function(callback) {
                addEvent(window, 'load', callback());
            }
        },
        element: {
            click: function(callback) {
                event.click = (event.click || callback) ||
                function() {
                    return false;
                };
                if (!callback) {
                    event.click(events);
                }
                addEvent('click', function() {
                    callback(events);
                });
                return that;
            },
            blur: function(callback) {
                var tag = that.tagName.toLowerCase(),
                    editable = that.attr('contenteditable');
                if (tag === "input" || editable) that.onblur = callback;
                return that;
            },
            input: function(callback) {
                if ("onpropertychange" in inp) {
                    inp.attachEvent($.proxy(function() {
                        if (event.propertyName == "value") callback.apply(that);
                    }, inp));
                } else {
                    inp.addEventListener("input", function() {
                        callback.apply(that);
                    }, false);
                }
            },
            mouseout: function(callback) {
                that.onmouseout = callback;
                return this;
            },
            kids: function() {
                var t = this.tagName.toLowerCase();
                if (t !== "input" && t !== "br" && t !== "button") {
                    return [].slice.call(this.childNodes);
                }
                return null;
            },
            empty: function() {
                var children = that.kids();
                children.forEach(function(e) {
                    e.remove();
                });
            },
            hide: function() {
                that.css('display', 'none');
            },
            show: function() {
                that.css('display', 'block');
                return this;
            },
            putBefore: function(a) {
                a.parentNode.insertBefore(that, a);
            },
            putAfter: function(a) {
                function sibiling(n) {
                    while ((x = n.nextSibling) && x.nodeType !== 1) {
                        x = x.nextSibling;
                        return x;
                    }
                    return false;
                }
                if (sibiling(a)) {
                    that.parentNode.insertBefore(sibiling(a), this);
                } else a.parentNode.append(this);

                return this;
            },
            html: function() {
                var len = arguments.length;
                switch (true) {
                case len === 0:
                    return that.innerHTML;
                case arguments[0] === "":
                    that.innerHTML = '';
                    return;
                default:
                    for (var i = 0; i < len; i++) {
                        that.innerHTML += arguments[i];
                    }
                    break;
                }
                return that;
            },
            text: function() {
                var len = arguments.length;
                if (len === 0) {
                    return that.textContent;
                } else if (arguments[0] === "") {
                    that.textContent = "";
                } else {
                    for (var i = 0; i < len; i++) {
                        that.textContent += arguments[i];
                    }
                }
                return that;
            },
            outer: function() {
                var len = arguments.length;
                switch (true) {
                case len === 0:
                    return that.outerHTML;
                case arguments[0] === "":
                    that.outerHTML = '';
                    return;
                default:
                    for (var i = 0; i < len; i++) {
                        that.outerHTML += arguments[i];
                    }
                    break;

                }
                return that;
            },
            data: function(a) {
                return that.dataset ? that.dataset[a] : that.attr('data-' + a);
            },
            css: function() {
                var args = Array.prototype.slice.call(arguments),
                    len = args.length,
                    style_com = window.getComputedStyle,
                    current = that.currentStyle;
                if (len === 1) {
                    if (typeOf(args[0]) == "object") {
                        var F = function() {},
                            val;
                        F.prototype = args[0];
                        for (var i in F.prototype) {
                            val = F.prototype[i];
                            that.style[i] = val;
                        }
                        return that;
                    }
                    if (style_com) return style_com(that).getPropertyValue(args[0]);
                    else if (current) return current[args[0]];
                } else {
                    for (var i = 0; i < args.length; i++) {
                        that.style[args[i]] = args[i + 1];
                        i++;
                    }
                }
                return that;
            },
            attr: function() {
                var args = Array.prototype.slice.call(arguments),
                    len = args.length,
                    get_attr = that.getAttribute(args[0]),
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
            append: function(a) {
                if (typeOf(a) == "string") {
                    if (this.kids().length) {
                        var child = this.kids()[this.kids().length - 1];
                        
                        child.insertAdjacentHTML('afterEnd', a);
                        this.kids().forEach(function(elem) {
                            addPlugins(elem);
                        });
                    } else {
                        this.innerHTML += a;
                    }
                } else {
                    this.appendChild(a);
                }
                return this;
            },
            prepend: function(elem) {
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
            appendTo: function(a) {
                a.append(this);
            },
            prependTo: function(a) {
                a.prepend(this);
            },
            addClass: function(a) {
                if (this.attr('class') == null) {
                    this.className = a;
                } else {
                    this.className += ' ' + a;
                }
                return this;
            },
            removeClass: function(name) {
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
            remove: function() {
                this.parentNode.removeChild(this);
                return this;
            },
            toggle: (function() {
                var old, usingColor = false;
                return function(obj) {
                    if (typeof elem == "string") {
                        elem = document.getElementById(elem);
                    }
                    if (!obj) {
                        that.style.display = (that.style.display == "none") ? "block" : "none";
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
            hover: function(onState, offState) {
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
                return that;
            },
            fadeIn: function() {
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
            fadeOut: function() {
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
    global.$ = function(selector) {
        return Plugins(selector);
    }
})(this);

$(document).ready(function() {
    $('myDiv').append('<div id="next">Hello World</div>');
});

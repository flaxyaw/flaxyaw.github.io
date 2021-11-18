particlesJS("particles-js", {
    "particles": {
        "number": {
            "value": 30,
            "density": {
                "enable": true,
                "value_area": 1750
            }
        },
        "color": {
            "value": "#fff"
        },
        "shape": {
            "type": "circle",
            "stroke": {
                "width": 0,
                "color": "#000000"
            },
            "polygon": {
                "nb_sides": 5
            },
            "image": {
                "src": "img/github.svg",
                "width": 100,
                "height": 100
            }
        },
        "opacity": {
            "value": 0.5,
            "random": false,
            "anim": {
                "enable": false,
                "speed": 1,
                "opacity_min": 0.1,
                "sync": false
            }
        },
        "size": {
            "value": 2,
            "random": true,
            "anim": {
                "enable": false,
                "speed": 30,
                "size_min": 0.1,
                "sync": false
            }
        },
        "line_linked": {
            "enable": true,
            "distance": 150,
            "color": "#ffffff",
            "opacity": 0.4,
            "width": 1
        },
        "move": {
            "enable": true,
            "speed": 3,
            "direction": "none",
            "random": false,
            "straight": false,
            "out_mode": "out",
            "bounce": false,
            "attract": {
                "enable": false,
                "rotateX": 600,
                "rotateY": 1000
            }
        }
    },
    "interactivity": {
        "detect_on": "window",
        "events": {
            "onhover": {
                "enable": false,
                "mode": "repulse"
            },
            "onclick": {
                "enable": false,
                "mode": "push"
            },
            "resize": true
        },
        "modes": {
            "grab": {
                "distance": 400,
                "line_linked": {
                    "opacity": 1
                }
            },
            "bubble": {
                "distance": 400,
                "size": 30,
                "duration": 2,
                "opacity": 8,
                "speed": 3
            },
            "repulse": {
                "distance": 200,
                "duration": 0.4
            },
            "push": {
                "particles_nb": 4
            },
            "remove": {
                "particles_nb": 2
            }
        }
    },
    "retina_detect": true
});


var rev = "fwd";
function titlebar(val) {
    var msg = "miraii.net  | Best player on the server | Scroll Down";
    var res = " ";
    var speed = 200;
    var pos = val;
    msg = "   " + msg + "";
    var le = msg.length;
    if (rev == "fwd") {
        if (pos < le) {
            pos = pos + 1;
            scroll = msg.substr(0, pos);
            document.title = scroll;
            timer = window.setTimeout("titlebar(" + pos + ")", speed);
        }
        else {
            rev = "bwd";
            timer = window.setTimeout("titlebar(" + pos + ")", speed);
        }
    }
    else {
        if (pos > 0) {
            pos = pos - 1;
            var ale = le - pos;
            scrol = msg.substr(ale, le);
            document.title = scrol;
            timer = window.setTimeout("titlebar(" + pos + ")", speed);
        }
        else {
            rev = "fwd";
            timer = window.setTimeout("titlebar(" + pos + ")", speed);
        }
    }
}

titlebar(0);

AOS.init();

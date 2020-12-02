/*! gorescript / http://gorescript.com */
var GS = GS || {};
GS.inherit = function(classObj, members) {
        var base = Object.create(classObj.prototype);
        return Object.getOwnPropertyNames(members).forEach(function(prop) {
            var desc = Object.getOwnPropertyDescriptor(members, prop);
            void 0 !== desc.get ? base.__defineGetter__(prop, desc.get) : base[prop] = members[prop], void 0 !== desc.set && base.__defineSetter__(prop, desc.set)
        }), base
    }, GS.pushArray = function(dst, src) {
        src.forEach(function(x) {
            this.push(x)
        }, dst)
    }, GS.msToFrames = function(ms) {
        return Math.round(ms / 16.66)
    }, GS.pad = function(n, width, z) {
        return z = z || "0", n += "", n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
    }, GS.logOnce = function(id, str) {
        GS.logOnce[id.toString()] !== !0 && (GS.logOnce[id.toString()] = !0, console.log(str))
    }, GS.isFirefox = "undefined" != typeof InstallTrigger, GS.isIFrame = function() {
        try {
            return window.self !== window.top
        } catch (e) {
            return !0
        }
    }(), GS.Base = function() {
        this.clearColor = 0, this.antialias = !0, this.cameraFov = 90, this.cameraNear = .1, this.cameraFar = 1e3, this.timeStep = .01666, this.fpsCounter = {
            updateRate: 0,
            frameRate: 0,
            updates: 0,
            frames: 0,
            currentTime: this.getCurrentTime()
        }, this.requestAnimationFrameId = null
    }, GS.Base.prototype = {
        constructor: GS.Base,
        init: function() {
            var that = this;
            this.renderer = new THREE.WebGLRenderer({
                antialias: this.antialias
            }), this.renderer.setClearColor(this.clearColor, 1), this.renderer.setSize(window.innerWidth, window.innerHeight), this.renderer.domElement.id = "game-canvas", this.camera = new THREE.PerspectiveCamera(this.cameraFov, window.innerWidth / window.innerHeight, this.cameraNear, this.cameraFar), this.scene = new THREE.Scene, window.addEventListener("resize", function() {
                that.onResize()
            }, !1), this.onResize(), document.body.appendChild(this.renderer.domElement), this.load()
        },
        load: function() {
            null !== this.requestAnimationFrameId && cancelAnimationFrame(this.requestAnimationFrameId), this.currentTime = this.getCurrentTime(), this.accumulator = 0, this.gameLoop()
        },
        update: function() {},
        draw: function() {
            this.renderer.render(this.scene, this.camera)
        },
        gameLoop: function() {
            var that = this,
                newTime = this.getCurrentTime(),
                frameTime = (newTime - this.currentTime) / 1e3;
            for (frameTime > .33 && (frameTime = .33), this.currentTime = newTime, this.accumulator += frameTime; this.accumulator >= this.timeStep;) this.update(), this.fpsCounter.updates++, this.accumulator -= this.timeStep;
            this.draw(), this.fpsCounter.frames++, newTime - this.fpsCounter.currentTime >= 1e3 && (this.fpsCounter.updateRate = this.fpsCounter.updates, this.fpsCounter.frameRate = this.fpsCounter.frames, this.fpsCounter.updates = 0, this.fpsCounter.frames = 0, this.fpsCounter.currentTime = newTime, GS.DebugUI.trackNumericValue("fps", this.fpsCounter.frameRate)), this.requestAnimationFrameId = requestAnimationFrame(function() {
                that.gameLoop()
            })
        },
        onResize: function() {
            this.camera.aspect = window.innerWidth / window.innerHeight, this.camera.updateProjectionMatrix(), this.renderer.setSize(window.innerWidth, window.innerHeight)
        },
        getCurrentTime: function() {
            return void 0 !== self.performance && void 0 !== self.performance.now ? self.performance.now() : Date.now()
        },
        set showFPS(value) {
            GS.DebugUI.setStaticLineVisibility("fps", value)
        },
        get showFPS() {
            return GS.DebugUI.getStaticLineVisibility("fps")
        }
    }, GS.Canvas2d = function(hideOnStart) {
        this.canvasId = "canvas2d", this.hideOnStart = void 0 !== hideOnStart && hideOnStart, this.minWidth = 1280, this.minHeight = 720, this.alpha = 1, this.redrawOnResize = !0
    }, GS.Canvas2d.prototype = {
        constructor: GS.Canvas2d,
        init: function() {
            var that = this,
                screenCanvas = document.createElement("canvas");
            screenCanvas.width = window.innerWidth, screenCanvas.height = window.innerHeight, screenCanvas.style.backgroundColor = "rgba(0, 0, 0, " + this.alpha + ")", screenCanvas.id = this.canvasId, this.screenCanvas = screenCanvas, this.hideOnStart && this.hide(), document.body.appendChild(this.screenCanvas);
            var screenCtx = screenCanvas.getContext("2d");
            screenCtx.globalCompositeOperation = "source-over", screenCtx.save(), this.screenCtx = screenCtx;
            var bufferCanvas = document.createElement("canvas");
            bufferCanvas.width = window.innerWidth, bufferCanvas.height = window.innerHeight, bufferCanvas.style.backgroundColor = "rgba(0, 0, 0, 1)", this.bufferCanvas = bufferCanvas;
            var bufferCtx = bufferCanvas.getContext("2d");
            bufferCtx.globalCompositeOperation = "source-over", bufferCtx.save(), this.bufferCtx = bufferCtx, $(window).on("resize." + this.canvasId, function() {
                that.onResize()
            }), this.onResize()
        },
        show: function() {
            this.screenCanvas.style.display = ""
        },
        hide: function() {
            this.screenCanvas.style.display = "none"
        },
        clear: function() {
            this.bufferCtx.clearRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height)
        },
        flip: function() {
            this.screenCtx.clearRect(0, 0, this.screenCanvas.width, this.screenCanvas.height), this.screenCtx.drawImage(this.bufferCanvas, 0, 0)
        },
        line: function(p0, p1, color, lineWidth) {
            color = void 0 !== color ? color : "#fff", lineWidth = lineWidth || 3, this.bufferCtx.save(), this.bufferCtx.strokeStyle = color, this.bufferCtx.lineWidth = lineWidth, this.bufferCtx.beginPath(), this.bufferCtx.moveTo(p0.x, p0.y), this.bufferCtx.lineTo(p1.x, p1.y), this.bufferCtx.closePath(), this.bufferCtx.stroke(), this.bufferCtx.restore()
        },
        box: function(p0, p1, color, lineWidth) {
            color = void 0 !== color ? color : "#fff", lineWidth = lineWidth || 3, this.bufferCtx.save(), this.bufferCtx.strokeStyle = color, this.bufferCtx.lineWidth = lineWidth, this.bufferCtx.beginPath(), this.bufferCtx.moveTo(p0.x, p0.y), this.bufferCtx.lineTo(p1.x, p0.y), this.bufferCtx.lineTo(p1.x, p1.y), this.bufferCtx.lineTo(p0.x, p1.y), this.bufferCtx.closePath(), this.bufferCtx.stroke(), this.bufferCtx.restore()
        },
        boxFill: function(p0, p1, color) {
            color = void 0 !== color ? color : "#fff";
            var x0 = Math.min(p0.x, p1.x),
                y0 = Math.min(p0.y, p1.y),
                x1 = Math.max(p0.x, p1.x),
                y1 = Math.max(p0.y, p1.y),
                w = x1 - x0,
                h = y1 - y0;
            this.bufferCtx.save(), this.bufferCtx.fillStyle = color, this.bufferCtx.fillRect(x0, y0, w, h), this.bufferCtx.restore()
        },
        _roundedBox: function(p0, p1, radius, filled, color, lineWidth) {
            color = void 0 !== color ? color : "#fff", lineWidth = lineWidth || 3;
            var x0 = Math.min(p0.x, p1.x),
                y0 = Math.min(p0.y, p1.y),
                x1 = Math.max(p0.x, p1.x),
                y1 = Math.max(p0.y, p1.y);
            this.bufferCtx.save(), filled ? this.bufferCtx.fillStyle = color : (this.bufferCtx.strokeStyle = color, this.bufferCtx.lineWidth = lineWidth), this.bufferCtx.beginPath(), this.bufferCtx.moveTo(x0, y0 + radius), this.bufferCtx.lineTo(x0, y1 - radius), this.bufferCtx.quadraticCurveTo(x0, y1, x0 + radius, y1), this.bufferCtx.lineTo(x1 - radius, y1), this.bufferCtx.quadraticCurveTo(x1, y1, x1, y1 - radius), this.bufferCtx.lineTo(x1, y0 + radius), this.bufferCtx.quadraticCurveTo(x1, y0, x1 - radius, y0), this.bufferCtx.lineTo(x0 + radius, y0), this.bufferCtx.quadraticCurveTo(x0, y0, x0, y0 + radius), this.bufferCtx.closePath(), filled ? this.bufferCtx.fill() : this.bufferCtx.stroke(), this.bufferCtx.restore()
        },
        roundedBox: function(p0, p1, radius, color, lineWidth) {
            this._roundedBox(p0, p1, radius, !1, color, lineWidth)
        },
        roundedBoxFill: function(p0, p1, radius, color) {
            this._roundedBox(p0, p1, radius, !0, color)
        },
        polygon: function(points, color, lineWidth) {
            color = void 0 !== color ? color : "#fff", lineWidth = lineWidth || 3, this.bufferCtx.save(), this.bufferCtx.strokeStyle = color, this.bufferCtx.lineWidth = lineWidth, this.bufferCtx.beginPath(), this.bufferCtx.moveTo(points[0].x, points[0].y);
            for (var i = 1; i < points.length; i++) this.bufferCtx.lineTo(points[i].x, points[i].y);
            this.bufferCtx.closePath(), this.bufferCtx.stroke(), this.bufferCtx.restore()
        },
        polygonFill: function(points, color) {
            color = void 0 !== color ? color : "#fff", this.bufferCtx.save(), this.bufferCtx.fillStyle = color, this.bufferCtx.beginPath(), this.bufferCtx.moveTo(points[0].x, points[0].y);
            for (var i = 1; i < points.length; i++) this.bufferCtx.lineTo(points[i].x, points[i].y);
            this.bufferCtx.closePath(), this.bufferCtx.fill(), this.bufferCtx.restore()
        },
        circle: function(pos, radius, color, lineWidth) {
            color = void 0 !== color ? color : "#fff", lineWidth = lineWidth || 3, this.bufferCtx.save(), this.bufferCtx.beginPath(), this.bufferCtx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI), this.bufferCtx.strokeStyle = color, this.bufferCtx.lineWidth = lineWidth, this.bufferCtx.stroke(), this.bufferCtx.restore()
        },
        circleFill: function(pos, radius, color) {
            color = void 0 !== color ? color : "#fff", this.bufferCtx.save(), this.bufferCtx.beginPath(), this.bufferCtx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI), this.bufferCtx.fillStyle = color, this.bufferCtx.fill(), this.bufferCtx.restore()
        },
        text: function(pos, str, color, fontSize, textBaseline, textAlign, fontFamily) {
            color = void 0 !== color ? color : "#fff", fontSize = void 0 !== fontSize ? fontSize : 16, textBaseline = textBaseline || "top", textAlign = textAlign || "left", fontFamily = fontFamily || "'Lucida Console', Monaco, monospace", this.bufferCtx.save();
            var offset = GS.isFirefox ? 4 : 0;
            this.bufferCtx.textBaseline = textBaseline, this.bufferCtx.textAlign = textAlign, this.bufferCtx.font = fontSize + "px " + fontFamily, this.bufferCtx.fillStyle = color, this.bufferCtx.fillText(str, pos.x, pos.y + offset), this.bufferCtx.restore()
        },
        drawImage: function(pos, img, size) {
            this.bufferCtx.drawImage(img, pos.x, pos.y, size.x, size.y)
        },
        drawImageFromAtlas: function(pos, img, atlasOffset, atlasSize) {
            this.bufferCtx.drawImage(img, atlasOffset.x, atlasOffset.y, atlasSize.x, atlasSize.y, pos.x, pos.y, atlasSize.x, atlasSize.y)
        },
        getTextWidth: function(str, fontSize, fontFamily) {
            fontSize = void 0 !== fontSize ? fontSize : 16, fontFamily = fontFamily || "'Lucida Console', Monaco, monospace", this.bufferCtx.save(), this.bufferCtx.font = fontSize + "px '" + fontFamily + "'";
            var width = this.bufferCtx.measureText(str).width;
            return this.bufferCtx.restore(), width
        },
        onResize: function() {
            var canvas;
            this.redrawOnResize && (canvas = this.clone()), this.screenCanvas.width = Math.max(window.innerWidth, this.minWidth), this.screenCanvas.height = Math.max(window.innerHeight, this.minHeight), this.bufferCanvas.width = Math.max(window.innerWidth, this.minWidth), this.bufferCanvas.height = Math.max(window.innerHeight, this.minHeight), $(this.screenCanvas).css("width", window.innerWidth + "px").css("height", window.innerHeight + "px"), this.redrawOnResize && this.screenCtx.drawImage(canvas, 0, 0)
        },
        clone: function() {
            var canvas = document.createElement("canvas");
            canvas.width = this.screenCanvas.width, canvas.height = this.screenCanvas.height;
            var ctx = canvas.getContext("2d");
            return ctx.globalCompositeOperation = "source-over", ctx.save(), ctx.drawImage(this.screenCanvas, 0, 0), canvas
        },
        dispose: function() {
            $(window).off("resize." + this.canvasId), $("#" + this.canvasId).remove()
        }
    }, GS.Cube = {
        getVertices: function() {
            var vertices = [new THREE.Vector3(1, 1, (-1)), new THREE.Vector3(1, 1, 1), new THREE.Vector3(1, (-1), (-1)), new THREE.Vector3(1, 1, 1), new THREE.Vector3(1, (-1), 1), new THREE.Vector3(1, (-1), (-1)), new THREE.Vector3((-1), 1, 1), new THREE.Vector3((-1), 1, (-1)), new THREE.Vector3((-1), (-1), 1), new THREE.Vector3((-1), 1, (-1)), new THREE.Vector3((-1), (-1), (-1)), new THREE.Vector3((-1), (-1), 1), new THREE.Vector3((-1), 1, 1), new THREE.Vector3(1, 1, 1), new THREE.Vector3((-1), 1, (-1)), new THREE.Vector3(1, 1, 1), new THREE.Vector3(1, 1, (-1)), new THREE.Vector3((-1), 1, (-1)), new THREE.Vector3((-1), (-1), (-1)), new THREE.Vector3(1, (-1), (-1)), new THREE.Vector3((-1), (-1), 1), new THREE.Vector3(1, (-1), (-1)), new THREE.Vector3(1, (-1), 1), new THREE.Vector3((-1), (-1), 1), new THREE.Vector3(1, 1, 1), new THREE.Vector3((-1), 1, 1), new THREE.Vector3(1, (-1), 1), new THREE.Vector3((-1), 1, 1), new THREE.Vector3((-1), (-1), 1), new THREE.Vector3(1, (-1), 1), new THREE.Vector3((-1), 1, (-1)), new THREE.Vector3(1, 1, (-1)), new THREE.Vector3((-1), (-1), (-1)), new THREE.Vector3(1, 1, (-1)), new THREE.Vector3(1, (-1), (-1)), new THREE.Vector3((-1), (-1), (-1))];
            return vertices
        }
    }, GS.Detector = {
        run: function(callback) {
            var canvas = document.createElement("canvas");
            if (void 0 === canvas.getContext) return void this.displayErrorMessage("HTML5 canvas");
            var webGL = function() {
                try {
                    var canvas = document.createElement("canvas");
                    return !!window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
                } catch (e) {
                    return !1
                }
            }();
            if (!webGL) return void this.displayErrorMessage("WebGL, or WebGL failed to initialize");
            var webAudio = "undefined" != typeof AudioContext || "undefined" != typeof webkitAudioContext;
            if (!webAudio) return void this.displayErrorMessage("the Web Audio API");
            var pointerLock = "pointerLockElement" in document || "mozPointerLockElement" in document || "webkitPointerLockElement" in document;
            if (!pointerLock) return void this.displayErrorMessage("the Pointer Lock API");
            var localStorage;
            try {
                localStorage = "localStorage" in window && null !== window.localStorage
            } catch (e) {
                localStorage = !1
            }
            return localStorage ? void callback() : void this.displayErrorMessage("HTML5 local storage")
        },
        displayErrorMessage: function(html) {
            var div = document.createElement("div");
            div.style.width = "450px", div.style.height = "150px", div.style.marginLeft = "-225px", div.style.marginTop = "-75px", div.style.position = "absolute", div.style.top = "50%", div.style.left = "50%", div.style.backgroundColor = "#000", div.style.color = "#fff", div.style.fontSize = "20px", div.style.fontFamily = "Arial, Helvetica, sans-serif", div.style.fontWeight = "normal", div.style.textAlign = "center", div.style.border = "1px dashed #fff";
            var span = document.createElement("span");
            span.style.display = "block", span.style.marginTop = "50px", span.innerHTML = "Your browser does not support<br/>" + html + ".", div.appendChild(span), document.body.appendChild(div)
        }
    },
    function() {
        THREE.Vector3.prototype.toVector2 = function(optionalTarget) {
            var v = optionalTarget || new THREE.Vector2;
            return v.x = this.x, v.y = this.z, v
        }, THREE.Vector3.prototype.toString = function(d) {
            return d = d || 0, ["[", this.x.toFixed(d), this.y.toFixed(d), this.z.toFixed(d), "]"].join(" ")
        }, THREE.Vector3.prototype.equalsEpsilon = function(v, e) {
            return e = e || 1e-4, Math.abs(v.x - this.x) < e && Math.abs(v.y - this.y) < e && Math.abs(v.z - this.z) < e
        }, THREE.Vector3.prototype.minCoord = function() {
            return Math.min(Math.min(this.x, this.y), Math.min(this.y, this.z))
        }, THREE.Vector3.prototype.maxCoord = function() {
            return Math.max(Math.max(this.x, this.y), Math.max(this.y, this.z))
        }, THREE.Box3.prototype.isIntersectionBoxSwept = function() {
            var aux1 = new THREE.Vector3,
                aux2 = new THREE.Vector3,
                auxBox = new THREE.Box3,
                velocity = new THREE.Vector3,
                invEntry = new THREE.Vector3,
                invExit = new THREE.Vector3,
                entry = new THREE.Vector3,
                exit = new THREE.Vector3,
                size1 = new THREE.Vector3,
                size2 = new THREE.Vector3;
            return function(oldPos, newPos, box, boxPos, point) {
                if (velocity.copy(newPos).sub(oldPos), aux1.copy(this.min).add(velocity), aux2.copy(this.max).add(velocity), auxBox.setFromPoints([this.min, this.max, aux1, aux2]), !auxBox.isIntersectionBox(box)) return !1;
                if (this.isIntersectionBox(box)) return point.copy(oldPos), !0;
                if (auxBox.min.copy(this.min).add(velocity), auxBox.max.copy(this.max).add(velocity), auxBox.isIntersectionBox(box)) return point.copy(newPos), !0;
                size1.copy(this.max).sub(this.min), size2.copy(box.max).sub(box.min), velocity.x > 0 ? (invEntry.x = box.min.x - (this.min.x + size1.x), invExit.x = box.min.x + size2.x - this.min.x) : (invEntry.x = box.min.x + size2.x - this.min.x, invExit.x = box.min.x - (this.min.x + size1.x)), velocity.y > 0 ? (invEntry.y = box.min.y - (this.min.y + size1.y), invExit.y = box.min.y + size2.y - this.min.y) : (invEntry.y = box.min.y + size2.y - this.min.y, invExit.y = box.min.y - (this.min.y + size1.y)), velocity.z > 0 ? (invEntry.z = box.min.z - (this.min.z + size1.z), invExit.z = box.min.z + size2.z - this.min.z) : (invEntry.z = box.min.z + size2.z - this.min.z, invExit.z = box.min.z - (this.min.z + size1.z)), 0 === velocity.x ? (entry.x = -(1 / 0), exit.x = 1 / 0) : (entry.x = invEntry.x / velocity.x, exit.x = invExit.x / velocity.x), 0 === velocity.y ? (entry.y = -(1 / 0), exit.y = 1 / 0) : (entry.y = invEntry.y / velocity.y, exit.y = invExit.y / velocity.y), 0 === velocity.z ? (entry.z = -(1 / 0), exit.z = 1 / 0) : (entry.z = invEntry.z / velocity.z, exit.z = invExit.z / velocity.z);
                var entryTime = entry.maxCoord(),
                    exitTime = exit.minCoord();
                return !(entryTime > exitTime || entry.x < 0 && entry.y < 0 && entry.z < 0 || entry.x > 1 || entry.y > 1 || entry.z > 1) && (velocity.multiplyScalar(entryTime), point.copy(oldPos).add(velocity), !0)
            }
        }(), THREE.Ray.prototype.intersectsOrStartsInBox = function(box, optionalTarget) {
            var result = optionalTarget || new THREE.Vector3;
            return box.containsPoint(this.origin) ? result.copy(this.origin) : this.intersectBox(box, result), result
        }, THREE.Vector2.prototype.toString = function(d) {
            return d = d || 0, ["[", this.x.toFixed(d), this.y.toFixed(d), "]"].join(" ")
        }, THREE.Vector2.prototype.equalsEpsilon = function(v, e) {
            return e = e || 1e-4, Math.abs(v.x - this.x) < e && Math.abs(v.y - this.y) < e
        }, THREE.Vector2.prototype.minCoord = function() {
            return Math.min(this.x, this.y)
        }, THREE.Vector2.prototype.maxCoord = function() {
            return Math.max(this.x, this.y)
        }, THREE.Box2.prototype.isIntersectionBoxSwept = function() {
            var aux1 = new THREE.Vector2,
                aux2 = new THREE.Vector2,
                auxBox = new THREE.Box2,
                velocity = new THREE.Vector2,
                invEntry = new THREE.Vector2,
                invExit = new THREE.Vector2,
                entry = new THREE.Vector2,
                exit = new THREE.Vector2,
                size1 = new THREE.Vector2,
                size2 = new THREE.Vector2;
            return function(oldPos, newPos, box, boxPos, point) {
                if (velocity.copy(newPos).sub(oldPos), aux1.copy(this.min).add(velocity), aux2.copy(this.max).add(velocity), auxBox.setFromPoints([this.min, this.max, aux1, aux2]), !auxBox.isIntersectionBox(box)) return !1;
                if (this.isIntersectionBox(box)) return point.copy(oldPos), !0;
                if (auxBox.min.copy(this.min).add(velocity), auxBox.max.copy(this.max).add(velocity), auxBox.isIntersectionBox(box)) return point.copy(newPos), !0;
                size1.copy(this.max).sub(this.min), size2.copy(box.max).sub(box.min), velocity.x > 0 ? (invEntry.x = box.min.x - (this.min.x + size1.x), invExit.x = box.min.x + size2.x - this.min.x) : (invEntry.x = box.min.x + size2.x - this.min.x, invExit.x = box.min.x - (this.min.x + size1.x)), velocity.y > 0 ? (invEntry.y = box.min.y - (this.min.y + size1.y), invExit.y = box.min.y + size2.y - this.min.y) : (invEntry.y = box.min.y + size2.y - this.min.y, invExit.y = box.min.y - (this.min.y + size1.y)), 0 === velocity.x ? (entry.x = -(1 / 0), exit.x = 1 / 0) : (entry.x = invEntry.x / velocity.x, exit.x = invExit.x / velocity.x), 0 === velocity.y ? (entry.y = -(1 / 0), exit.y = 1 / 0) : (entry.y = invEntry.y / velocity.y, exit.y = invExit.y / velocity.y);
                var entryTime = entry.maxCoord(),
                    exitTime = exit.minCoord();
                return !(entryTime > exitTime || entry.x < 0 && entry.y < 0 || entry.x > 1 || entry.y > 1) && (velocity.multiplyScalar(entryTime), point.copy(oldPos).add(velocity), !0)
            }
        }(), THREE.Box2.prototype.isIntersectionLineSwept = function() {
            var velocity = new THREE.Vector2,
                boxExtent = new THREE.Vector2,
                boxCenter = new THREE.Vector2,
                lineNormal = new THREE.Vector2,
                lineDir = new THREE.Vector2,
                lineMin = new THREE.Vector2,
                lineMax = new THREE.Vector2,
                aux = new THREE.Vector2;
            return function(oldPos, newPos, line) {
                var result = {
                    foundCollision: !1,
                    pos: new THREE.Vector2,
                    distance: 0,
                    normal: new THREE.Vector2
                };
                if (velocity.copy(newPos).sub(oldPos), boxExtent.copy(this.max).sub(this.min).multiplyScalar(.5), boxCenter.copy(this.max).add(this.min).multiplyScalar(.5), GS.MathHelper.vec2Normal(line.start, line.end, lineNormal), lineNormal.dot(velocity) >= 0) return result;
                lineDir.copy(line.end).sub(line.start), lineDir.x > 0 ? (lineMin.x = line.start.x, lineMax.x = line.end.x) : (lineMin.x = line.end.x, lineMax.x = line.start.x), lineDir.y > 0 ? (lineMin.y = line.start.y, lineMax.y = line.end.y) : (lineMin.y = line.end.y, lineMax.y = line.start.y);
                var hitTime = 0,
                    outTime = 1,
                    r = boxExtent.x * Math.abs(lineNormal.x) + boxExtent.y * Math.abs(lineNormal.y);
                aux.copy(line.start).sub(boxCenter);
                var boxProj = aux.dot(lineNormal),
                    velProj = velocity.dot(lineNormal);
                if (velProj < 0 && (r *= -1), hitTime = Math.max((boxProj - r) / velProj, hitTime), outTime = Math.min((boxProj + r) / velProj, outTime), velocity.x < 0) {
                    if (this.max.x < lineMin.x) return result;
                    hitTime = Math.max((lineMax.x - this.min.x) / velocity.x, hitTime), outTime = Math.min((lineMin.x - this.max.x) / velocity.x, outTime)
                } else if (velocity.x > 0) {
                    if (this.min.x > lineMax.x) return result;
                    hitTime = Math.max((lineMin.x - this.max.x) / velocity.x, hitTime), outTime = Math.min((lineMax.x - this.min.x) / velocity.x, outTime)
                } else if (lineMin.x > this.max.x || lineMax.x < this.min.x) return result;
                if (hitTime > outTime) return result;
                if (velocity.y < 0) {
                    if (this.max.y < lineMin.y) return result;
                    hitTime = Math.max((lineMax.y - this.min.y) / velocity.y, hitTime), outTime = Math.min((lineMin.y - this.max.y) / velocity.y, outTime)
                } else if (velocity.y > 0) {
                    if (this.min.y > lineMax.y) return result;
                    hitTime = Math.max((lineMin.y - this.max.y) / velocity.y, hitTime), outTime = Math.min((lineMax.y - this.min.y) / velocity.y, outTime)
                } else if (lineMin.y > this.max.y || lineMax.y < this.min.y) return result;
                return hitTime > outTime ? result : (result.foundCollision = !0, result.pos.copy(oldPos).add(velocity.multiplyScalar(hitTime)), result.distance = velocity.length() * hitTime, result.normal.copy(lineNormal), result)
            }
        }(), THREE.Geometry.prototype.merge = function(geometry, matrix, materialIndexOffset) {
            if (geometry instanceof THREE.Geometry == !1) return void console.error("THREE.Geometry.merge(): geometry not an instance of THREE.Geometry.", geometry);
            var normalMatrix, vertexOffset = this.vertices.length,
                vertices1 = this.vertices,
                vertices2 = geometry.vertices,
                faces1 = this.faces,
                faces2 = geometry.faces,
                uvs1 = this.faceVertexUvs[0],
                uvs2 = geometry.faceVertexUvs[0];
            void 0 === materialIndexOffset && (materialIndexOffset = 0), void 0 !== matrix && (normalMatrix = (new THREE.Matrix3).getNormalMatrix(matrix));
            for (var i = 0, il = vertices2.length; i < il; i++) {
                var vertex = vertices2[i],
                    vertexCopy = vertex.clone();
                void 0 !== matrix && vertexCopy.applyMatrix4(matrix), vertices1.push(vertexCopy)
            }
            for (i = 0, il = faces2.length; i < il; i++) {
                var faceCopy, normal, color, face = faces2[i],
                    faceVertexNormals = face.vertexNormals,
                    faceVertexColors = face.vertexColors;
                faceCopy = new THREE.Face3(face.a + vertexOffset, face.b + vertexOffset, face.c + vertexOffset), faceCopy.normal.copy(face.normal), void 0 !== normalMatrix && faceCopy.normal.applyMatrix3(normalMatrix).normalize();
                for (var j = 0, jl = faceVertexNormals.length; j < jl; j++) normal = faceVertexNormals[j].clone(), void 0 !== normalMatrix && normal.applyMatrix3(normalMatrix).normalize(), faceCopy.vertexNormals.push(normal);
                faceCopy.color.copy(face.color), faceCopy.emissive = face.emissive.clone();
                for (var j = 0, jl = faceVertexColors.length; j < jl; j++) color = faceVertexColors[j], faceCopy.vertexColors.push(color.clone());
                faceCopy.materialIndex = face.materialIndex + materialIndexOffset, faces1.push(faceCopy)
            }
            for (i = 0, il = uvs2.length; i < il; i++) {
                var uv = uvs2[i],
                    uvCopy = [];
                if (void 0 !== uv) {
                    for (var j = 0, jl = uv.length; j < jl; j++) uvCopy.push(new THREE.Vector2(uv[j].x, uv[j].y));
                    uvs1.push(uvCopy)
                }
            }
        }, THREE.BufferGeometry.prototype.fromGeometry = function(geometry, settings) {
            settings = settings || {
                vertexColors: THREE.NoColors
            };
            var vertices = geometry.vertices,
                faces = geometry.faces,
                faceVertexUvs = geometry.faceVertexUvs,
                vertexColors = settings.vertexColors,
                hasFaceVertexUv = faceVertexUvs[0].length > 0,
                hasFaceVertexNormals = 3 == faces[0].vertexNormals.length,
                positions = new Float32Array(3 * faces.length * 3);
            this.addAttribute("position", new THREE.BufferAttribute(positions, 3));
            var normals = new Float32Array(3 * faces.length * 3);
            if (this.addAttribute("normal", new THREE.BufferAttribute(normals, 3)), vertexColors !== THREE.NoColors) {
                var colors = new Float32Array(3 * faces.length * 3);
                this.addAttribute("color", new THREE.BufferAttribute(colors, 3));
                var emissives = new Float32Array(3 * faces.length * 3);
                this.addAttribute("emissive", new THREE.BufferAttribute(emissives, 3))
            }
            if (hasFaceVertexUv === !0) {
                var uvs = new Float32Array(3 * faces.length * 2);
                this.addAttribute("uv", new THREE.BufferAttribute(uvs, 2))
            }
            for (var i = 0, i2 = 0, i3 = 0; i < faces.length; i++, i2 += 6, i3 += 9) {
                var face = faces[i],
                    a = vertices[face.a],
                    b = vertices[face.b],
                    c = vertices[face.c];
                if (positions[i3] = a.x, positions[i3 + 1] = a.y, positions[i3 + 2] = a.z, positions[i3 + 3] = b.x, positions[i3 + 4] = b.y, positions[i3 + 5] = b.z, positions[i3 + 6] = c.x, positions[i3 + 7] = c.y, positions[i3 + 8] = c.z, hasFaceVertexNormals === !0) {
                    var na = face.vertexNormals[0],
                        nb = face.vertexNormals[1],
                        nc = face.vertexNormals[2];
                    normals[i3] = na.x, normals[i3 + 1] = na.y, normals[i3 + 2] = na.z, normals[i3 + 3] = nb.x, normals[i3 + 4] = nb.y, normals[i3 + 5] = nb.z, normals[i3 + 6] = nc.x, normals[i3 + 7] = nc.y, normals[i3 + 8] = nc.z
                } else {
                    var n = face.normal;
                    normals[i3] = n.x, normals[i3 + 1] = n.y, normals[i3 + 2] = n.z, normals[i3 + 3] = n.x, normals[i3 + 4] = n.y, normals[i3 + 5] = n.z, normals[i3 + 6] = n.x, normals[i3 + 7] = n.y, normals[i3 + 8] = n.z
                }
                if (vertexColors === THREE.FaceColors) {
                    var fc = face.color;
                    colors[i3] = fc.r, colors[i3 + 1] = fc.g, colors[i3 + 2] = fc.b, colors[i3 + 3] = fc.r, colors[i3 + 4] = fc.g, colors[i3 + 5] = fc.b, colors[i3 + 6] = fc.r, colors[i3 + 7] = fc.g, colors[i3 + 8] = fc.b;
                    var em = face.emissive;
                    emissives[i3] = em.r, emissives[i3 + 1] = em.g, emissives[i3 + 2] = em.b, emissives[i3 + 3] = em.r, emissives[i3 + 4] = em.g, emissives[i3 + 5] = em.b, emissives[i3 + 6] = em.r, emissives[i3 + 7] = em.g, emissives[i3 + 8] = em.b
                } else if (vertexColors === THREE.VertexColors) {
                    var vca = face.vertexColors[0],
                        vcb = face.vertexColors[1],
                        vcc = face.vertexColors[2];
                    colors[i3] = vca.r, colors[i3 + 1] = vca.g, colors[i3 + 2] = vca.b, colors[i3 + 3] = vcb.r, colors[i3 + 4] = vcb.g, colors[i3 + 5] = vcb.b, colors[i3 + 6] = vcc.r, colors[i3 + 7] = vcc.g, colors[i3 + 8] = vcc.b
                }
                if (hasFaceVertexUv === !0) {
                    var uva = faceVertexUvs[0][i][0],
                        uvb = faceVertexUvs[0][i][1],
                        uvc = faceVertexUvs[0][i][2];
                    uvs[i2] = uva.x, uvs[i2 + 1] = uva.y, uvs[i2 + 2] = uvb.x, uvs[i2 + 3] = uvb.y, uvs[i2 + 4] = uvc.x, uvs[i2 + 5] = uvc.y
                }
            }
            return this.computeBoundingSphere(), this
        }
    }(), GS.InputHelper = {
        keyState: [],
        leftMouseDown: !1,
        middleMouseDown: !1,
        rightMouseDown: !1,
        mouseX: 0,
        mouseY: 0,
        screenRatioX: 1,
        screenRatioY: 1,
        mouseWheelEvents: [],
        ctrl: !1,
        shift: !1,
        alt: !1,
        pressedKeys: [],
        keysPressed: !1,
        init: function() {
            var that = this;
            $(document).on("contextmenu", function() {
                return !1
            }), $(document).keydown(function(e) {
                if (that.keyState[e.keyCode] = !0, that.ctrl = e.ctrlKey, that.alt = e.altKey, that.shift = e.shiftKey, 9 == e.keyCode || 65 == e.keyCode && e.ctrlKey || 90 == e.keyCode && e.ctrlKey || 71 == e.keyCode && e.ctrlKey || 189 == e.keyCode && e.ctrlKey || 187 == e.keyCode && e.ctrlKey || 48 == e.keyCode && e.ctrlKey) return e.stopPropagation(), e.preventDefault(), !1
            }), $(document).keyup(function(e) {
                that.keyState[e.keyCode] = !1, that.ctrl = e.ctrlKey, that.alt = e.altKey, that.shift = e.shiftKey
            }), $(document).mousedown(function(e) {
                1 == e.which && (that.leftMouseDown = !0), 2 == e.which && (that.middleMouseDown = !0), 3 == e.which && (that.rightMouseDown = !0)
            }), $(document).mouseup(function(e) {
                1 == e.which && (that.leftMouseDown = !1), 2 == e.which && (that.middleMouseDown = !1), 3 == e.which && (that.rightMouseDown = !1)
            }), $(document).mousemove(function(e) {
                that.mouseX = e.pageX * that.screenRatioX, that.mouseY = e.pageY * that.screenRatioY
            }), document.addEventListener("mousewheel", function(e) {
                that.mouseWheelEvents.push(e.wheelDelta)
            }, !1), document.addEventListener("DOMMouseScroll", function(e) {
                that.mouseWheelEvents.push(e.detail * -1)
            }, !1)
        },
        isKeyUp: function(keyCode) {
            return !this.keyState[keyCode]
        },
        isKeyDown: function(keyCode, dontModifyPressed) {
            return dontModifyPressed || this.keyState[keyCode] && (this.pressedKeys.indexOf(keyCode) == -1 && this.pressedKeys.push(keyCode), this.keysPressed = !0), this.keyState[keyCode]
        },
        checkPressedKeys: function() {
            if (this.pressedKeys.length > 0) {
                for (var n = 0, i = 0; i < this.pressedKeys.length; i++) {
                    if (!this.isKeyUp(this.pressedKeys[i])) return;
                    n++
                }
                n == this.pressedKeys.length && (this.keysPressed = !1)
            }
        }
    }, GS.InputHelper.init(), GS.LineHelper = {
        compare: function(p, q) {
            return p.x == q.x ? p.y - q.y : p.x - q.x
        },
        slope: function(s) {
            return (s.end.y - s.start.y) / (s.end.x - s.start.x)
        },
        intersectionLineSegments: function() {
            var p0 = new THREE.Vector2;
            return function(s1, s2, p) {
                return p = p || p0, this.intersectionLines(s1, s2, p, !0)
            }
        }(),
        intersectionLines: function(s1, s2, p, compareLineSegments) {
            var x1 = s1.start.x,
                x2 = s1.end.x,
                x3 = s2.start.x,
                x4 = s2.end.x,
                y1 = s1.start.y,
                y2 = s1.end.y,
                y3 = s2.start.y,
                y4 = s2.end.y,
                denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
            if (0 === denom) return !1;
            var ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom,
                ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
            return (!compareLineSegments || ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) && (p.x = x1 + ua * (x2 - x1), p.y = y1 + ua * (y2 - y1), !0)
        },
        intersectionLineSegmentBox: function() {
            var box0 = new THREE.Box2,
                seg0 = {
                    start: new THREE.Vector2,
                    end: new THREE.Vector2
                },
                p = new THREE.Vector2;
            return function(seg, box) {
                return box0.setFromPoints([seg.start, seg.end]), !!box.isIntersectionBox(box0) && (!(!box.containsPoint(seg.start) || !box.containsPoint(seg.end)) || (seg0.start.x = box.min.x, seg0.start.y = box.min.y, seg0.end.x = box.max.x, seg0.end.y = box.min.y, !!this.intersectionLineSegments(seg, seg0, p) || (seg0.start.x = box.max.x, seg0.start.y = box.min.y, seg0.end.x = box.max.x, seg0.end.y = box.max.y, !!this.intersectionLineSegments(seg, seg0, p) || (seg0.start.x = box.max.x, seg0.start.y = box.max.y, seg0.end.x = box.min.x, seg0.end.y = box.max.y, !!this.intersectionLineSegments(seg, seg0, p) || (seg0.start.x = box.min.x, seg0.start.y = box.max.y, seg0.end.x = box.min.x, seg0.end.y = box.min.y, !!this.intersectionLineSegments(seg, seg0, p))))))
            }
        }(),
        lineSegmentsToGraph: function(segments, gridCellSize) {
            function sort(a, b) {
                return that.compare(a, b)
            }
            for (var that = this, graph = new GS.PlanarGraph, p = new THREE.Vector2, i = 0; i < segments.length; i++) {
                var cuts = [];
                cuts.push(segments[i].start.clone()), cuts.push(segments[i].end.clone());
                for (var j = 0; j < segments.length; j++)
                    if (i != j) {
                        var result = this.intersectionLineSegments(segments[i], segments[j], p);
                        result && cuts.push(p.clone())
                    } cuts.sort(sort);
                for (var j = 0; j < cuts.length - 1; j++) graph.addEdge(cuts[j], cuts[j + 1])
            }
            if (void 0 !== gridCellSize)
                for (var i = 0; i < graph.vertices.length; i++) {
                    var v = graph.vertices[i];
                    v.x = Math.floor(v.x / gridCellSize) * gridCellSize, v.y = Math.floor(v.y / gridCellSize) * gridCellSize
                }
            return graph
        },
        pointOnLineSegment: function(seg, p) {
            var offset = this.pointOffsetOnLineSegment(seg, p);
            return offset != -1
        },
        pointOffsetOnLineSegment: function(seg, p) {
            var epsilon = 1e-4,
                cross = (p.y - seg.start.y) * (seg.end.x - seg.start.x) - (p.x - seg.start.x) * (seg.end.y - seg.start.y);
            if (Math.abs(cross) > epsilon) return -1;
            var dot = (p.x - seg.start.x) * (seg.end.x - seg.start.x) + (p.y - seg.start.y) * (seg.end.y - seg.start.y);
            if (dot < 0) return -1;
            var lengthSq = (seg.end.x - seg.start.x) * (seg.end.x - seg.start.x) + (seg.end.y - seg.start.y) * (seg.end.y - seg.start.y);
            if (dot > lengthSq) return -1;
            var offset = 0 !== lengthSq ? dot / lengthSq : 1;
            return offset
        },
        arePointsCollinear: function(p1, p2, p3) {
            return (p1.y - p2.y) * (p1.x - p3.x) == (p1.y - p3.y) * (p1.x - p2.x)
        }
    }, GS.MapLayers = {
        Segment: 0,
        Sector: 2,
        Entity: 3,
        Zone: 4
    }, GS.SegmentTypes = {
        User: 0,
        InteriorFloor: 1,
        InteriorCeiling: 2,
        Exterior: 3,
        TVScreen: 4,
        Switch: 5
    }, GS.MapEntities = {
        M: {
            name: "medkit",
            type: "Item"
        },
        A: {
            name: "ammo",
            type: "Item"
        },
        H: {
            name: "hyper_blaster",
            type: "Item"
        },
        D: {
            name: "double_shotgun",
            type: "Item"
        },
        N: {
            name: "nom",
            type: "Monster",
            animations: {
                walk: 6,
                death: 4
            }
        },
        E: {
            name: "eye",
            type: "Monster",
            animations: {
                walk: 4,
                death: 4,
                attack: 2
            }
        }
    }, GS.MathHelper = {
        clamp: function(x, min, max) {
            return x < min && (x = min), x > max && (x = max), x
        },
        getConvexHullPoints: function(P) {
            var cross = function(O, A, B) {
                    return (A.x - O.x) * (B.y - O.y) - (A.y - O.y) * (B.x - O.x)
                },
                n = P.length,
                k = 0,
                H = [];
            P.sort(function(a, b) {
                return a.x == b.x ? a.y - b.y : a.x - b.x
            });
            for (var i = 0; i < n; i++) {
                for (; k >= 2 && cross(H[k - 2], H[k - 1], P[i]) <= 0;) k--;
                H[k++] = P[i]
            }
            for (var t = k + 1, i = n - 2; i >= 0; i--) {
                for (; k >= t && cross(H[k - 2], H[k - 1], P[i]) <= 0;) k--;
                H[k++] = P[i]
            }
            return H.length = k - 1, H
        },
        pointInTriangle: function(P, A, B, C) {
            var result = this.getTriangleBarycentricCoordinates(P, A, B, C);
            return result.inTriangle
        },
        getTriangleBarycentricCoordinates: function(P, A, B, C) {
            var v0 = (new THREE.Vector2).subVectors(C, A),
                v1 = (new THREE.Vector2).subVectors(B, A),
                v2 = (new THREE.Vector2).subVectors(P, A),
                dot00 = v0.dot(v0),
                dot01 = v0.dot(v1),
                dot02 = v0.dot(v2),
                dot11 = v1.dot(v1),
                dot12 = v1.dot(v2),
                invDenom = 1 / (dot00 * dot11 - dot01 * dot01),
                u = (dot11 * dot02 - dot01 * dot12) * invDenom,
                v = (dot00 * dot12 - dot01 * dot02) * invDenom,
                inTriangle = u >= 0 && v >= 0 && u + v < 1;
            return {
                u: u,
                v: v,
                inTriangle: inTriangle
            }
        },
        vec2Rotate: function(v, angle) {
            var sn = Math.sin(Math.PI / 180 * angle),
                cs = Math.cos(Math.PI / 180 * angle),
                x = v.x * cs - v.y * sn,
                y = v.x * sn + v.y * cs;
            v.x = x, v.y = y
        },
        vec2RotateRadians: function(v, radians) {
            var sn = Math.sin(radians),
                cs = Math.cos(radians),
                x = v.x * cs - v.y * sn,
                y = v.x * sn + v.y * cs;
            v.x = x, v.y = y
        },
        vec2Angle: function(v0, v1) {
            return -Math.atan2(v1.y - v0.y, v1.x - v0.x) * (180 / Math.PI) * 2
        },
        vec2AngleRadians: function(v0, v1) {
            return 2 * -Math.atan2(v1.y - v0.y, v1.x - v0.x)
        },
        vec2AngleDirected: function(v0, v1) {
            return Math.atan2(v0.y, v0.x) - Math.atan2(v1.y, v1.x)
        },
        vec2Normal: function(v0, v1, optionalTarget) {
            var result = optionalTarget || new THREE.Vector2,
                dx = v1.x - v0.x,
                dy = v1.y - v0.y;
            return result.set(dy, -dx).normalize(), result
        },
        vec2PointSide: function(a, b, c) {
            return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x) > 0
        }
    }, GS.SmoothNumber = function(initialValue, speed) {
        this.value = initialValue, this.targetValue = initialValue, this.speed = speed
    }, GS.SmoothNumber.prototype = {
        setTargetValue: function(targetValue) {
            this.targetValue = targetValue
        },
        update: function() {
            this.value < this.targetValue && (this.value += this.speed, this.value > this.targetValue && (this.value = this.targetValue)), this.value > this.targetValue && (this.value -= this.speed, this.value < this.targetValue && (this.value = this.targetValue))
        }
    }, GS.SmoothVector3 = function(x, y, z, speed) {
        THREE.Vector3.call(this, x, y, z), this.targetValue = this.clone(), this.speed = void 0 !== speed ? speed : .1, this.color = new THREE.Color
    }, GS.SmoothVector3.prototype = GS.inherit(THREE.Vector3, {
        setTargetValue: function(targetValue) {
            this.targetValue = targetValue.clone()
        },
        update: function() {
            this.updateProperty("x"), this.updateProperty("y"),
                this.updateProperty("z"), this.updateColor()
        },
        updateColor: function() {
            this.color.r = this.x, this.color.g = this.y, this.color.b = this.z
        },
        updateProperty: function(name) {
            this[name] < this.targetValue[name] && (this[name] += this.speed, this[name] > this.targetValue[name] && (this[name] = this.targetValue[name])), this[name] > this.targetValue[name] && (this[name] -= this.speed, this[name] < this.targetValue[name] && (this[name] = this.targetValue[name]))
        }
    }), GS.PolygonHelper = {
        getPolygonsFromLineSegments: function(segments, gridCellSize) {
            var graph = GS.LineHelper.lineSegmentsToGraph(segments, gridCellSize);
            graph.computeShortestPaths(), graph.computeMinimumCycleBasis(), graph.removeNonCycleEdges();
            for (var vertices = graph.vertices, polygons = [], mcb = graph.minimumCycleBasis, i = 0; i < mcb.length; i++) {
                var cycle = graph.cycles[mcb[i]].elements;
                polygons[i] = [];
                for (var j = 0; j < cycle.length; j++) polygons[i].push(vertices[cycle[j].start])
            }
            return {
                vertices: vertices,
                polygons: polygons,
                graph: graph
            }
        },
        getTriangulatedPolygonsFromLineSegments: function(segments, gridCellSize) {
            for (var result = this.getPolygonsFromLineSegments(segments, gridCellSize), i = 0; i < result.polygons.length; i++) {
                var polygon = result.polygons[i],
                    vertices = this.vector2ToVertexArray(polygon);
                this.areVerticesClockwise(vertices) && this.reverseVertices(vertices), result.polygons[i] = {
                    vertices: this.vertexToVector2Array(vertices),
                    indices: PolyK.Triangulate(vertices),
                    area: PolyK.GetArea(vertices)
                }
            }
            return result.polygons.sort(function(a, b) {
                return b.area - a.area
            }), result
        },
        vector2ToVertexArray: function(vectors) {
            for (var vertices = [], j = 0; j < vectors.length; j++) vertices.push(vectors[j].x), vertices.push(vectors[j].y);
            return vertices
        },
        vertexToVector2Array: function(vertices) {
            for (var vectors = [], i = 0; i < vertices.length; i += 2) vectors.push(new THREE.Vector2(vertices[i], vertices[i + 1]));
            return vectors
        },
        reverseVertices: function(vertices) {
            for (var i = 0; i < vertices.length / 2; i += 2) {
                var j = vertices.length - i - 2,
                    x = vertices[i];
                vertices[i] = vertices[j], vertices[j] = x;
                var y = vertices[i + 1];
                vertices[i + 1] = vertices[j + 1], vertices[j + 1] = y
            }
        },
        areVerticesClockwise: function(vertices) {
            for (var sum = 0, i = 0; i < vertices.length - 2; i += 2) {
                var x1 = vertices[i],
                    y1 = vertices[i + 1],
                    x2 = vertices[i + 2],
                    y2 = vertices[i + 3];
                sum += (x2 - x1) * (y2 + y1)
            }
            var x1 = vertices[vertices.length - 2],
                y1 = vertices[vertices.length - 1],
                x2 = vertices[0],
                y2 = vertices[1];
            return sum += (x2 - x1) * (y2 + y1), sum >= 0
        },
        sectorContainsPoint: function(sector, p, useCollisionVertices) {
            var i, v = useCollisionVertices ? sector.collisionVertices : sector.vertices,
                n = v.length,
                c = !1,
                j = 0;
            for (i = 0, j = n - 1; i < n; j = i++) {
                var start = v[i],
                    end = v[j];
                start.y > p.y != end.y > p.y && p.x < (end.x - start.x) * (p.y - start.y) / (end.y - start.y) + start.x && (c = !c)
            }
            return c
        },
        intersectionSectorBox: function() {
            var box0 = new THREE.Box2,
                seg0 = {
                    start: new THREE.Vector2,
                    end: new THREE.Vector2
                },
                boxPoints = (new THREE.Vector2, [new THREE.Vector2, new THREE.Vector2, new THREE.Vector2, new THREE.Vector2]);
            return function(sector, box) {
                if (box0.setFromPoints(sector.vertices), !box.isIntersectionBox(box0)) return !1;
                if (box.containsBox(box0)) return !0;
                boxPoints[0].x = box.min.x, boxPoints[0].y = box.min.y, boxPoints[1].x = box.max.x, boxPoints[1].y = box.min.y, boxPoints[2].x = box.max.x, boxPoints[2].y = box.max.y, boxPoints[3].x = box.min.x, boxPoints[3].y = box.max.y;
                for (var v0, v1, v2, i = 0; i < sector.indices.length; i += 3) {
                    v0 = sector.vertices[sector.indices[i]], v1 = sector.vertices[sector.indices[i + 1]], v2 = sector.vertices[sector.indices[i + 2]];
                    for (var j = 0; j < 4; j++)
                        if (GS.MathHelper.pointInTriangle(boxPoints[j], v0, v1, v2)) return !0
                }
                for (var i = 0; i < sector.vertices.length - 1; i++)
                    if (seg0.start.copy(sector.vertices[i]), seg0.end.copy(sector.vertices[i + 1]), GS.LineHelper.intersectionLineSegmentBox(seg0, box)) return !0;
                return seg0.start.copy(sector.vertices[sector.vertices.length - 1]), seg0.end.copy(sector.vertices[0]), !!GS.LineHelper.intersectionLineSegmentBox(seg0, box)
            }
        }(),
        retriangulateSectors: function(sectors) {
            function sectorEdgeContainsVertex(a, v) {
                var i, offset, result = {
                    edgeIndex: 0,
                    offset: 0
                };
                for (i = 0; i < a.vertices.length - 1; i++) {
                    if (a.vertices[i].equalsEpsilon(v) || a.vertices[i + 1].equalsEpsilon(v)) return;
                    if (offset = GS.LineHelper.pointOffsetOnLineSegment({
                            start: a.vertices[i],
                            end: a.vertices[i + 1]
                        }, v), offset != -1) return result.edgeIndex = i, result.offset = offset, result
                }
                if (!a.vertices[i].equalsEpsilon(v) && !a.vertices[0].equalsEpsilon(v)) return offset = GS.LineHelper.pointOffsetOnLineSegment({
                    start: a.vertices[i],
                    end: a.vertices[0]
                }, v), offset != -1 ? (result.edgeIndex = i, result.offset = offset, result) : void 0
            }

            function edgeSetEquals(a, b) {
                return a.vertex.equalsEpsilon(b.vertex)
            }

            function sortCompare(a, b) {
                return b.offset - a.offset
            }

            function getSectorEdgeIndex(a, start, end) {
                for (var i = 0; i < a.vertices.length - 1; i++)
                    if (a.vertices[i].equalsEpsilon(start) && a.vertices[i + 1].equalsEpsilon(end)) return i;
                return a.vertices[i].equalsEpsilon(start) && a.vertices[0].equalsEpsilon(end) ? i : -1
            }

            function addVerticesToSector(a, v) {
                var edgeIndex = getSectorEdgeIndex(a, v.edgeStart, v.edgeEnd);
                if (edgeIndex != -1)
                    for (var i = 0; i < v.vertices.length; i++) a.vertices.splice(edgeIndex + 1, 0, v.vertices[i])
            }

            function addVertices(aIndex, bIndex) {
                for (var a = sectors[aIndex], b = sectors[bIndex], i = 0; i < b.vertices.length; i++) {
                    var result = sectorEdgeContainsVertex(a, b.vertices[i]);
                    if (void 0 !== result) {
                        var edges = sectorEdges[aIndex];
                        edges[result.edgeIndex].add({
                            vertex: b.vertices[i],
                            offset: result.offset
                        })
                    }
                }
            }
            for (var sectorEdges = [], i = 0; i < sectors.length; i++) {
                for (var edges = [], j = 0; j < sectors[i].vertices.length; j++) edges.push(new GS.Set([], edgeSetEquals));
                sectorEdges.push(edges)
            }
            for (var i = 0; i < sectors.length - 1; i++)
                for (var j = i + 1; j < sectors.length; j++) i != j && (addVertices(i, j), addVertices(j, i));
            for (var i = 0; i < sectors.length; i++) {
                for (var toAdd = [], n = sectors[i].vertices.length, j = 0; j < n; j++) {
                    var newPoints = sectorEdges[i][j].elements;
                    if (newPoints.length > 0) {
                        newPoints.sort(sortCompare);
                        for (var item = {
                                vertices: [],
                                edgeStart: sectors[i].vertices[j],
                                edgeEnd: sectors[i].vertices[j == n - 1 ? 0 : j + 1]
                            }, k = 0; k < newPoints.length; k++) item.vertices.push(newPoints[k].vertex);
                        toAdd.push(item)
                    }
                }
                for (var j = 0; j < toAdd.length; j++) addVerticesToSector(sectors[i], toAdd[j]);
                var vertices = this.vector2ToVertexArray(sectors[i].vertices);
                this.areVerticesClockwise(vertices) && this.reverseVertices(vertices), sectors[i].vertices = this.vertexToVector2Array(vertices), sectors[i].indices = PolyK.Triangulate(vertices)
            }
        },
        retriangulateSegments: function(segments) {
            function rightSideCompare(a, b) {
                return b - a
            }

            function leftSideCompare(a, b) {
                return a - b
            }

            function addVertices(seg, endPoint, compare) {
                for (var points = new GS.Set, i = 0; i < segments.length; i++) {
                    var s = segments[i];
                    s !== seg && (s.start.equalsEpsilon(endPoint) || s.end.equalsEpsilon(endPoint)) && (s.topY < seg.topY && s.topY > seg.bottomY && points.add(s.topY), s.bottomY < seg.topY && s.bottomY > seg.bottomY && points.add(s.bottomY))
                }
                if (points.elements.length > 0) {
                    points.elements.sort(compare);
                    for (var i = 0; i < points.elements.length; i++) seg.vertices.push(new THREE.Vector3(endPoint.x, points.elements[i], endPoint.y))
                }
                return points.elements.length
            }
            for (var i = 0; i < segments.length; i++) {
                var seg = segments[i];
                if (seg.type !== GS.SegmentTypes.TVScreen && seg.type !== GS.SegmentTypes.Switch) {
                    seg.indices = [0, 1, 2], seg.vertices = [new THREE.Vector3(seg.start.x, seg.topY, seg.start.y), new THREE.Vector3(seg.end.x, seg.topY, seg.end.y)];
                    var n = addVertices(seg, seg.end, rightSideCompare);
                    if (n > 0)
                        for (var j = 0; j < n; j++) seg.indices.push(0), seg.indices.push(j + 2), seg.indices.push(j + 3);
                    seg.vertices.push(new THREE.Vector3(seg.end.x, seg.bottomY, seg.end.y)), seg.vertices.push(new THREE.Vector3(seg.start.x, seg.bottomY, seg.start.y));
                    var m = seg.vertices.length - 2;
                    if (n = addVertices(seg, seg.start, leftSideCompare), n > 0)
                        for (var j = 0; j < n; j++) seg.indices.push(m), seg.indices.push(m + j + 1), seg.indices.push(m + j + 2);
                    seg.indices.push(m), seg.indices.push(m + n + 1), seg.indices.push(0), seg.bottomRightIndex = m
                }
            }
        },
        detriangulateSectors: function(sectors) {
            for (var i = 0; i < sectors.length; i++) {
                for (var sector = sectors[i], points = [sector.vertices[0]], n = sector.vertices.length, j = 1; j < n; j++) j < n - 1 ? GS.LineHelper.arePointsCollinear(sector.vertices[j - 1], sector.vertices[j], sector.vertices[j + 1]) || points.push(sector.vertices[j]) : points.push(sector.vertices[j]);
                var vertices = this.vector2ToVertexArray(points);
                this.areVerticesClockwise(vertices) && this.reverseVertices(vertices), sector.collisionVertices = this.vertexToVector2Array(vertices), sector.collisionIndices = PolyK.Triangulate(vertices)
            }
        },
        getSectorCentroid: function(sector) {
            function getPoint(n) {
                return n === sector.vertices.length && (n = 0), sector.vertices[n]
            }
            for (var p1, p2, f, twicearea = 0, x = 0, y = 0, nPts = sector.vertices.length, i = 0, j = nPts - 1; i < nPts; j = i++) p1 = getPoint(i), p2 = getPoint(j), f = p1.x * p2.y - p2.x * p1.y, twicearea += f, x += (p1.x + p2.x) * f, y += (p1.y + p2.y) * f;
            return f = 3 * twicearea, new THREE.Vector2(x / f, y / f)
        }
    }, GS.Graph = function(equalsFunc) {
        this.equalsFunc = equalsFunc || function(a, b) {
            return a == b
        }, this.vertices = [], this.edges = []
    }, GS.Graph.prototype = {
        addEdge: function(start, end) {
            this.equalsFunc(start, end) || this.edges.push({
                start: this.addVertex(start),
                end: this.addVertex(end)
            })
        },
        removeEdge: function(start, end) {
            function equals(a, b) {
                return that.equalsFunc(a.start, b.start) && that.equalsFunc(a.end, b.end) || that.equalsFunc(a.end, b.start) && that.equalsFunc(a.start, b.end)
            }
            if (!this.equalsFunc(start, end))
                for (var that = this, edge = {
                        start: start,
                        end: end
                    }, i = this.edges.length - 1; i >= 0; i--) equals(edge, this.edges[i]) && this.edges.splice(i, 1)
        },
        addVertex: function(vertex) {
            var result = this.vertexExists(vertex);
            return result > -1 ? result : (this.vertices.push(vertex), this.vertices.length - 1)
        },
        vertexExists: function(vertex) {
            for (var i = 0; i < this.vertices.length; i++)
                if (this.equalsFunc(this.vertices[i], vertex)) return i;
            return -1
        },
        computeShortestPaths: function() {
            for (var dist = [], i = 0; i < this.vertices.length; i++) {
                dist[i] = [];
                for (var j = 0; j < this.vertices.length; j++) dist[i].push(1 / 0)
            }
            this.dist = dist;
            for (var next = [], i = 0; i < this.vertices.length; i++) {
                next[i] = [];
                for (var j = 0; j < this.vertices.length; j++) next[i].push(null)
            }
            this.next = next;
            for (var i = 0; i < this.vertices.length; i++) dist[i][i] = 0;
            for (var i = 0; i < this.edges.length; i++) {
                var edge = this.edges[i];
                dist[edge.start][edge.end] = 1, dist[edge.end][edge.start] = 1
            }
            this.initNextArray();
            for (var k = 0; k < this.vertices.length; k++)
                for (var i = 0; i < this.vertices.length; i++)
                    for (var j = 0; j < this.vertices.length; j++) dist[i][k] + dist[k][j] < dist[i][j] && (dist[i][j] = dist[i][k] + dist[k][j], next[i][j] = next[k][j])
        },
        initNextArray: function() {
            for (var i = 0; i < this.vertices.length; i++)
                for (var j = 0; j < this.vertices.length; j++) i == j || this.dist[i][j] == 1 / 0 ? this.next[i][j] = 0 : this.next[i][j] = i
        },
        getPath: function(i, j) {
            if (i == j) return [];
            var path = this.constructPath(i, j);
            return void 0 !== path && (path.unshift(i), path.push(j)), path
        },
        constructPath: function(i, j) {
            if (this.dist[i][j] != 1 / 0) {
                var intermediate = this.next[i][j];
                if (intermediate == i) return [];
                var prev = this.constructPath(i, intermediate),
                    path = [intermediate],
                    next = this.constructPath(intermediate, j);
                if (void 0 !== prev)
                    for (var i = prev.length - 1; i >= 0; i--) path.unshift(prev[i]);
                if (void 0 !== next)
                    for (var i = 0; i < next.length; i++) path.push(next[i]);
                return path
            }
        },
        computeVertexNeighborSets: function() {
            for (var neighborSets = [], i = 0; i < this.vertices.length; i++) {
                for (var v = this.vertices[i], neighbors = new GS.Set, j = 0; j < this.edges.length; j++) {
                    var edge = this.edges[j];
                    this.equalsFunc(v, this.vertices[edge.start]) ? neighbors.add(this.vertices[edge.end]) : this.equalsFunc(v, this.vertices[edge.end]) && neighbors.add(this.vertices[edge.start])
                }
                neighborSets.push(neighbors)
            }
            this.neighborSets = neighborSets
        },
        computeMaximalCliques: function() {
            function bronKerbosch(R, P, X) {
                0 === P.elements.length && 0 === X.elements.length && that.maximalCliques.push(R);
                for (var i = 0; i < P.elements.length; i++) {
                    var v = P.elements[i],
                        N = that.neighborSets[v];
                    bronKerbosch(R.clone().add(v), P.clone().intersection(N), X.clone().intersection(N)), P.remove(v), X.add(v)
                }
            }
            var that = this;
            this.maximalCliques = [], this.computeVertexNeighborSets();
            var R = new GS.Set((void 0), this.equalsFunc),
                P = new GS.Set(this.vertices, this.equalsFunc),
                X = new GS.Set((void 0), this.equalsFunc);
            bronKerbosch(R, P, X), this.maximalCliques.sort(function(a, b) {
                return a.length - b.length
            })
        },
        getVertexIndex: function(vertex) {
            for (var i = 0; i < this.vertices.length; i++)
                if (this.equalsFunc(this.vertices[i], vertex)) return i;
            return -1
        }
    }, GS.PlanarGraph = function() {
        GS.Graph.call(this);
        var epsilon = 1e-4;
        this.equalsFunc = function(a, b) {
            return Math.abs(a.x - b.x) < epsilon && Math.abs(a.y - b.y) < epsilon
        }
    }, GS.PlanarGraph.prototype = GS.inherit(GS.Graph, {
        computeMinimumCycleBasis: function() {
            this.computeAllCycles(), this.cycles.length > 100 ? (console.log("cycle count > 100; using horton"), this.selectCyclesHorton()) : this.selectCyclesNonOverlapping()
        },
        computeAllCycles: function() {
            function inCycles(cycle) {
                for (var i = 0; i < cycles.length; i++)
                    if (cycles[i].equals(cycle)) return !0;
                return !1
            }

            function equals(a, b) {
                return a.start == b.start && a.end == b.end || a.end == b.start && b.end == a.start
            }

            function fromPathSet(set) {
                for (var a = new GS.Set((void 0), equals), e = set.elements, n = e.length, i = 0; i < n - 1; i++) a.add({
                    start: e[i],
                    end: e[i + 1]
                });
                return a.add({
                    start: e[n - 1],
                    end: e[0]
                }), a
            }
            for (var that = this, cycles = [], path0 = new GS.Set, path1 = new GS.Set, i = 0; i < this.vertices.length; i++)
                for (var j = 0; j < this.edges.length; j++) {
                    var edge = this.edges[j];
                    path0.elements = this.getPath(edge.start, i) || [], path1.elements = this.getPath(i, edge.end) || [];
                    var it = path0.intersection(path1);
                    if (1 == it.elements.length && it.elements[0] == i) {
                        var cycle = fromPathSet(path0.union(path1));
                        cycle.add(edge), inCycles(cycle) || cycles.push(cycle)
                    }
                }
            cycles.sort(function(a, b) {
                var weightA = that.getCycleWeight(a),
                    weightB = that.getCycleWeight(b);
                return weightA - weightB
            }), this.cycles = cycles
        },
        getCycleWeight: function(cycle) {
            return cycle.elements.length
        },
        pointInCycle: function(p, cycle) {
            var i, v = this.vertices,
                idx = cycle.elements,
                n = idx.length - 1,
                c = !1,
                j = 0;
            for (i = 0, j = n - 1; i < n; j = i++) {
                var start = v[idx[i].start],
                    end = v[idx[j].start];
                start.y > p.y != end.y > p.y && p.x < (end.x - start.x) * (p.y - start.y) / (end.y - start.y) + start.x && (c = !c)
            }
            return c
        },
        cyclesOverlap: function(a, b) {
            for (var center = new THREE.Vector2, edgesA = a.difference(b).elements, v = this.vertices, i = 0; i < edgesA.length; i++) {
                var edge = edgesA[i];
                if (center.x = (v[edge.start].x + v[edge.end].x) / 2, center.y = (v[edge.start].y + v[edge.end].y) / 2, this.pointInCycle(center, b)) return !0
            }
            for (var edgesB = b.difference(a).elements, i = 0; i < edgesB.length; i++) {
                var edge = edgesB[i];
                if (center.x = (v[edge.start].x + v[edge.end].x) / 2, center.y = (v[edge.start].y + v[edge.end].y) / 2, this.pointInCycle(center, a)) return !0
            }
            return !1
        },
        selectCyclesNonOverlapping: function() {
            for (var n = this.cycles.length, graph = new GS.Graph, i = 0; i < n; i++) graph.addVertex(i);
            for (var i = 0; i < n - 1; i++)
                for (var j = i + 1; j < n; j++) graph.addEdge(i, j);
            for (var i = 0; i < n - 1; i++)
                for (var j = i + 1; j < n; j++) this.cyclesOverlap(this.cycles[i], this.cycles[j]) && graph.removeEdge(i, j);
            graph.computeMaximalCliques(), graph.maximalCliques.length > 0 && (this.minimumCycleBasis = graph.maximalCliques[0].elements)
        },
        selectCyclesHorton: function() {
            for (var m = this.cycles.length, n = this.edges.length, matrix = new GS.Matrix(m, n), i = 0; i < m; i++)
                for (var j = 0; j < n; j++) this.cycles[i].elemExists(this.edges[j]) && (matrix.matrix[i][j] = 1);
            matrix.binaryGaussianElimination(), this.minimumCycleBasis = matrix.getNonZeroRowIndices()
        },
        removeNonCycleEdges: function() {
            this.nonCycleVertices = [];
            for (var i = this.vertices.length - 1; i >= 0; i--) {
                for (var exists = !1, j = 0; j < this.cycles.length; j++) {
                    var cycle = this.cycles[j];
                    if (cycle.elemExists(i)) {
                        exists = !0;
                        break
                    }
                }
                if (!exists) {
                    this.nonCycleVertices.push(i);
                    for (var j = this.edges.length - 1; j >= 0; j--) {
                        var edge = this.edges[j];
                        edge.start != i && edge.end != i || this.edges.splice(j, 1)
                    }
                }
            }
        }
    }), GS.Set = function(source, equalsFunc) {
        this.equalsFunc = equalsFunc || function(a, b) {
            return a == b
        }, this.elements = void 0 !== source ? source : []
    }, GS.Set.prototype = {
        add: function(elem) {
            return this.elemExists(elem) || this.elements.push(elem), this
        },
        remove: function(elem) {
            for (var i = 0; i < this.elements.length; i++)
                if (this.equalsFunc(this.elements[i], elem)) {
                    this.elements.splice(i, 1);
                    break
                } return this
        },
        elemExists: function(elem) {
            for (var i = 0; i < this.elements.length; i++)
                if (this.equalsFunc(this.elements[i], elem)) return !0;
            return !1
        },
        intersection: function(set) {
            for (var elements = set.elements, it = [], i = 0; i < this.elements.length; i++)
                for (var j = 0; j < elements.length; j++) this.equalsFunc(this.elements[i], elements[j]) && it.push(this.elements[i]);
            return new GS.Set(it, this.equalsFunc)
        },
        union: function(set) {
            for (var un = new GS.Set(this.elements.slice(), this.equalsFunc), elements = set.elements, i = 0; i < elements.length; i++) un.add(elements[i]);
            return un
        },
        difference: function(set) {
            for (var diff = [], i = 0; i < this.elements.length; i++) set.elemExists(this.elements[i]) || diff.push(this.elements[i]);
            return new GS.Set(diff, this.equalsFunc)
        },
        equals: function(set) {
            var diff1 = this.difference(set),
                diff2 = set.difference(this);
            return 0 === diff1.elements.length && 0 === diff2.elements.length
        },
        clone: function() {
            return new GS.Set(this.elements.slice(), this.equalsFunc)
        }
    }, GS.Matrix = function(m, n) {
        for (var matrix = [], i = 0; i < m; i++) {
            matrix[i] = [];
            for (var j = 0; j < n; j++) matrix[i].push(0)
        }
        this.matrix = matrix, this.rowCount = m, this.columnCount = n
    }, GS.Matrix.prototype = {
        binaryGaussianElimination: function() {
            for (var that = this, addRow = function(r0, r1) {
                    for (var i = 0; i < that.columnCount; i++) that.matrix[r0][i] = that.matrix[r0][i] ^ that.matrix[r1][i]
                }, i = 0; i < this.rowCount; i++) {
                for (var found = !1, j = 0; j < this.columnCount; j++)
                    if (1 == this.matrix[i][j]) {
                        found = !0;
                        break
                    } if (found)
                    for (var k = 0; k < this.rowCount; k++) k != i && 1 == this.matrix[k][j] && addRow(k, i)
            }
        },
        clear: function(value) {
            value = value || 0;
            for (var i = 0; i < this.rowCount; i++)
                for (var j = 0; j < this.columnCount; j++) this.matrix[i][j] = value
        },
        getNonZeroRowIndices: function() {
            for (var rowIndices = [], i = 0; i < this.rowCount; i++) {
                for (var nonZero = !1, j = 0; j < this.columnCount; j++)
                    if (this.matrix[i][j] > 0) {
                        nonZero = !0;
                        break
                    } nonZero && rowIndices.push(i)
            }
            return rowIndices
        },
        toString: function() {
            for (var str = "", i = 0; i < this.rowCount; i++) {
                for (var j = 0; j < this.columnCount; j++) str += this.matrix[i][j] + " ";
                str += "\n"
            }
            return str
        }
    }, GS.Rebound = function(keybinds) {
        this.keybinds = keybinds, this.modifyingKeybind = !1, this.onModifyingKeybindStart = function() {}, this.onModifyingKeybindStop = function() {}
    }, GS.Rebound.prototype = {
        init: function() {
            var that = this;
            $(document).on("keydown.keybindUse", function(e) {
                if (!that.modifyingKeybind) {
                    var keybind = _.find(that.keybinds, {
                        code: e.keyCode
                    });
                    keybind && (keybind.inUse = !0, e.preventDefault())
                }
            }), $(document).on("keyup.keybindUse", function(e) {
                if (!that.modifyingKeybind) {
                    var keybind = _.find(that.keybinds, {
                        code: e.keyCode
                    });
                    keybind && (keybind.inUse = !1, e.preventDefault())
                }
            }), $(document).on("mousedown.keybindUse", function(e) {
                if (!that.modifyingKeybind) {
                    var keybind = _.find(that.keybinds, {
                        mouse: !0,
                        button: e.which
                    });
                    keybind && (keybind.inUse = !0, e.preventDefault())
                }
            }), $(document).on("mouseup.keybindUse", function(e) {
                if (!that.modifyingKeybind) {
                    var keybind = _.find(that.keybinds, {
                        mouse: !0,
                        button: e.which
                    });
                    keybind && (keybind.inUse = !1, e.preventDefault())
                }
            })
        },
        getKeybindByActionName: function(actionName) {
            return _.find(this.keybinds, {
                actionName: actionName
            })
        },
        modifyKeybind: function(keybind) {
            var that = this;
            this.modifyingKeybind || (this.modifyingKeybind = !0, this.onModifyingKeybindStart({
                keybind: keybind
            }), $(document).on("keydown.modifyKeybind", function(e) {
                e.keyCode || e.which;
                $(document).off("keydown.modifyKeybind"), $(document).off("mousedown.modifyKeybind");
                var ok = that.changeKey(keybind, e);
                that.modifyingKeybind = !1, that.onModifyingKeybindStop({
                    keybind: keybind,
                    success: ok
                }), e.preventDefault()
            }), $(document).on("mousedown.modifyKeybind", function(e) {
                e.keyCode || e.which;
                $(document).off("keydown.modifyKeybind"), $(document).off("mousedown.modifyKeybind");
                var ok = that.changeMouse(keybind, e);
                that.modifyingKeybind = !1, that.onModifyingKeybindStop({
                    keybind: keybind,
                    success: ok
                }), e.preventDefault()
            }))
        },
        changeKey: function(keybind, e) {
            var name = this.isKeyAllowed(e);
            if (!name) return !1;
            e.preventDefault();
            var code = e.keyCode,
                existing = _.find(this.keybinds, {
                    code: code
                });
            return existing && (existing.code = void 0, existing.mouse = void 0, existing.button = void 0, existing.controlName = "NOT BOUND"), keybind.code = code, keybind.mouse = void 0, keybind.button = void 0, keybind.controlName = name, !0
        },
        changeMouse: function(keybind, e) {
            var name;
            if (1 === e.which ? name = "MOUSE LEFT" : 2 === e.which && (name = "MOUSE MIDDLE"), !name) return !1;
            var existing = _.find(this.keybinds, {
                mouse: !0,
                button: e.which
            });
            return existing && (existing.code = void 0, existing.mouse = void 0, existing.button = void 0, existing.controlName = "NOT BOUND"), keybind.code = void 0, keybind.mouse = !0, keybind.button = e.which, keybind.controlName = name, !0
        },
        isKeyAllowed: function(e) {
            if (e.keyCode >= 65 && e.keyCode <= 90) return String.fromCharCode(e.keyCode);
            if (e.keyCode >= 48 && e.keyCode <= 57) return String.fromCharCode(e.keyCode);
            if (e.keyCode >= 37 && e.keyCode <= 40) return e.originalEvent.keyIdentifier.toUpperCase();
            if (e.keyCode >= 16 && e.keyCode <= 18) return e.originalEvent.keyIdentifier.toUpperCase();
            switch (e.keyCode) {
                case 32:
                    return "SPACE";
                case 13:
                    return "ENTER";
                case 8:
                    return "BACKSPACE";
                case 91:
                case 93:
                    return "COMMAND"
            }
            return !1
        }
    }, GS.DebugUI = {
        fontSize: 24,
        maxTempLines: 5,
        defaultTimeout: GS.msToFrames(5e3),
        overlayMargin: 10,
        overlayPadding: 5,
        overlayWidth: 0,
        overlayHeight: 0,
        overlayX: 0,
        overlayY: 0,
        visibleStaticLines: 0,
        staticLines: {},
        tempLines: [],
        valueTracking: {},
        hasChanged: !1,
        _visible: !1,
        set visible(value) {
            this._visible = value, !value && this.ctx && this.ctx.clearRect(0, 0, this.width, this.height)
        },
        get visible() {
            return this._visible
        },
        init: function() {
            var that = this;
            this.minWidth = 1280, this.minHeight = 720, this.width = window.innerWidth, this.height = window.innerHeight, window.addEventListener("resize", function() {
                that.onResize()
            }, !1);
            var canvas = document.createElement("canvas");
            canvas.id = "debug-ui-canvas", canvas.width = this.width, canvas.height = this.height, canvas.style.backgroundColor = "rgba(0, 0, 0, 0)", canvas.style.zIndex = 100, this.canvas = canvas;
            var ctx = canvas.getContext("2d");
            ctx.globalCompositeOperation = "source-over", ctx.save(), this.ctx = ctx, this.updateFont(), document.body.appendChild(this.canvas), this.onResize()
        },
        update: function() {
            for (var i = this.tempLines.length - 1; i >= 0; i--) {
                var line = this.tempLines[i];
                line.timeout--, 0 === line.timeout && (this.tempLines.splice(i, 1), this.hasChanged = !0)
            }
            this.hasChanged && (this.calculateOverlayCoords(), this.draw(), this.hasChanged = !1)
        },
        draw: function() {
            if (this._visible && (this.ctx.clearRect(0, 0, this.width, this.height), this.visibleStaticLines > 0 || this.tempLines.length > 0)) {
                this.ctx.save(), this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)", this.ctx.fillRect(this.overlayX, this.overlayY, this.overlayWidth, this.overlayHeight), this.ctx.fillStyle = "#fff";
                var y = this.overlayY + this.overlayPadding;
                for (var i in this.staticLines) this.staticLines[i].visible && (this.ctx.fillText(this.staticLines[i].text, this.overlayX + this.overlayPadding, y), y += this.fontSize + this.overlayPadding);
                for (var i = 0; i < this.tempLines.length; i++) this.ctx.fillText(this.tempLines[i].text, this.overlayX + this.overlayPadding, y), y += this.fontSize + this.overlayPadding;
                this.ctx.restore()
            }
        },
        updateFont: function() {
            this.ctx.font = this.fontSize + "px 'Lucida Console', Monaco, monospace", this.ctx.textBaseline = "top"
        },
        calculateOverlayCoords: function() {
            this.overlayWidth = 0, this.visibleStaticLines = 0;
            for (var i in this.staticLines) this.staticLines[i].visible && this.visibleStaticLines++;
            this.overlayHeight = (this.visibleStaticLines + this.tempLines.length) * (this.fontSize + this.overlayPadding) + this.overlayPadding, this.overlayX = this.overlayMargin, this.overlayY = this.overlayMargin;
            for (var i in this.staticLines) this.staticLines[i].visible && (this.overlayWidth = Math.max(this.overlayWidth, this.ctx.measureText(this.staticLines[i].text).width + 2 * this.overlayPadding));
            for (var i = 0; i < this.tempLines.length; i++) this.overlayWidth = Math.max(this.overlayWidth, this.ctx.measureText(this.tempLines[i].text).width + 2 * this.overlayPadding)
        },
        trackNumericValue: function(id, numericValue) {
            void 0 === this.valueTracking[id] && (this.valueTracking[id] = {}, this.valueTracking[id].min = 1 / 0, this.valueTracking[id].max = -(1 / 0), this.valueTracking[id].avg = 0, this.valueTracking[id].count = 0);
            var v = this.valueTracking[id];
            v.min = Math.min(v.min, numericValue), v.max = Math.max(v.max, numericValue), v.count++, v.avg += (numericValue - v.avg) / v.count, this.setStaticLine(id, numericValue + " (min: " + v.min + ", max: " + v.max + ", avg: " + v.avg.toFixed(0) + ")")
        },
        setStaticLine: function(id, text) {
            text = id + ": " + text, id in this.staticLines ? this.staticLines[id].text = text : this.staticLines[id] = {
                text: text,
                visible: !0
            }, this.hasChanged = !0
        },
        removeStaticLine: function(id) {
            delete this.staticLines[id], this.hasChanged = !0
        },
        setStaticLineVisibility: function(id, value) {
            id in this.staticLines ? this.staticLines[id].visible = value === !0 : this.staticLines[id] = {
                text: "",
                visible: value
            }
        },
        getStaticLineVisibility: function(id) {
            if (id in this.staticLines) return this.staticLines[id].visible
        },
        addTempLine: function(text, timeout) {
            this.tempLines.length == this.maxTempLines && this.tempLines.shift(), timeout = void 0 !== timeout ? timeout : this.defaultTimeout;
            var line = {
                text: text,
                timeout: timeout
            };
            this.tempLines.push(line), this.hasChanged = !0
        },
        onResize: function() {
            this.width = Math.max(window.innerWidth, this.minWidth), this.height = Math.max(window.innerHeight, this.minHeight), this.canvas.width = this.width, this.canvas.height = this.height, $(this.canvas).css("width", window.innerWidth + "px").css("height", window.innerHeight + "px"), this.ctx.font = this.fontSize + "px 'Lucida Console', Monaco, monospace", this.ctx.textBaseline = "top", this.draw()
        }
    }, GS.LoadingUI = function() {
        this.redraw = !0, this.hidden = !0, this.spinnerOnly = !1, this.screenInfo = {
            width: null,
            height: null,
            center: new THREE.Vector2
        }, this.loadingBox = {
            width: .5,
            height: .05,
            contentPadding: .005,
            topLeft: new THREE.Vector2,
            bottomRight: new THREE.Vector2,
            contentTopLeft: new THREE.Vector2,
            contentBottomRight: new THREE.Vector2,
            contentCurrentBottomRight: new THREE.Vector2
        }, this.percentLoaded = 0
    }, GS.LoadingUI.prototype = {
        init: function() {
            this.cvs = new GS.Canvas2d((!0)), this.cvs.canvasId = "loading-canvas", this.cvs.init(), this.cvs.screenCanvas.style.zIndex = 50, this.onResize()
        },
        draw: function() {
            !this.hidden && this.redraw && (this.redraw = !1, this.cvs.clear(), this.spinnerOnly ? this.cvs.text(this.screenInfo.center, "Imagine it's 1994...", "#fff", 40, "middle", "center", GS.UIFont) : (this.cvs.box(this.loadingBox.topLeft, this.loadingBox.bottomRight, "#fff", 3), this.cvs.boxFill(this.loadingBox.contentTopLeft, this.loadingBox.contentCurrentBottomRight, "#fff")), this.cvs.flip())
        },
        updateProgress: function(e) {
            this.percentLoaded = e.percentLoaded
        },
        updateLoadingBoxContent: function() {
            var width = this.loadingBox.contentBottomRight.x - this.loadingBox.contentTopLeft.x;
            this.loadingBox.contentCurrentBottomRight.x = this.loadingBox.contentTopLeft.x + Math.floor(width * this.percentLoaded * .01), this.redraw = !0
        },
        show: function() {
            this.cvs.show(), this.hidden = !1
        },
        hide: function() {
            this.cvs.hide(), this.hidden = !0
        },
        onResize: function() {
            this.screenInfo.width = this.cvs.bufferCanvas.width, this.screenInfo.height = this.cvs.bufferCanvas.height, this.screenInfo.center.set(Math.floor(this.screenInfo.width / 2), Math.floor(this.screenInfo.height / 2)), this.loadingBox.topLeft.copy(this.screenInfo.center), this.loadingBox.topLeft.x -= Math.floor(.5 * this.loadingBox.width * this.screenInfo.width), this.loadingBox.topLeft.y -= Math.floor(.5 * this.loadingBox.height * this.screenInfo.height), this.loadingBox.bottomRight.copy(this.screenInfo.center), this.loadingBox.bottomRight.x += Math.floor(.5 * this.loadingBox.width * this.screenInfo.width), this.loadingBox.bottomRight.y += Math.floor(.5 * this.loadingBox.height * this.screenInfo.height), this.loadingBox.contentTopLeft.copy(this.loadingBox.topLeft), this.loadingBox.contentTopLeft.x += Math.floor(this.loadingBox.contentPadding * this.screenInfo.width), this.loadingBox.contentTopLeft.y += Math.floor(this.loadingBox.contentPadding * this.screenInfo.width), this.loadingBox.contentBottomRight.copy(this.loadingBox.bottomRight), this.loadingBox.contentBottomRight.x -= Math.floor(this.loadingBox.contentPadding * this.screenInfo.width), this.loadingBox.contentBottomRight.y -= Math.floor(this.loadingBox.contentPadding * this.screenInfo.width), this.loadingBox.contentCurrentBottomRight.y = this.loadingBox.contentBottomRight.y, this.updateLoadingBoxContent()
        },
        set percentLoaded(value) {
            this._percentLoaded = value, this.updateLoadingBoxContent()
        },
        get percentLoaded() {
            return this._percentLoaded
        }
    }, GS.UIColors = {
        background: "rgba(0, 0, 0, 0.75)",
        menuBackground: "rgba(0, 0, 0, 0.9)",
        foreground: "rgba(255, 255, 255, 1)",
        foregroundDisabled: "rgba(64, 64, 64, 1)",
        buttonHover: "rgba(128, 0, 0, 0.5)",
        buttonActive: "rgba(255, 0, 0, 0.5)"
    }, GS.UIFont = "hudFont", GS.UIComponents = GS.UIComponents || {}, GS.UIManager = function() {
        this.reset(), this.menuOnly = !0, this.menuActive = !1, this.menuBackOffset = new THREE.Vector2(0, 0), this.menuBackPos = new THREE.Vector2(0, 0), this.menuBackSize = new THREE.Vector2(1, 1), this.showHUD = GS.Settings.showHUD
    }, GS.UIManager.prototype = {
        constructor: GS.UIManager,
        reset: function() {
            this.grid = void 0, this.hidden = !0
        },
        init: function() {
            this.cvs = new GS.Canvas2d((!0)), this.cvs.alpha = 0, this.cvs.canvasId = "ui-canvas", this.cvs.redrawOnResize = !1, this.cvs.init(), this.cvs.screenCanvas.style.zIndex = 30, this.vectorCanvas = new GS.VectorCanvas(this.cvs), this.vectorCanvas.init()
        },
        initComponents: function(assets, grid) {
            this.grid = grid, this.assets = {
                images: assets[GS.AssetTypes.UIWidget]
            }, this.components = [], void 0 !== this.grid && (this.powerBars = new GS.UIComponents.PowerBars(this.vectorCanvas, this.assets, this.grid.player), this.powerBars.init(), this.components.push(this.powerBars), this.crosshair = new GS.UIComponents.Crosshair(this.vectorCanvas, this.assets, this.grid.player), this.crosshair.init(), this.components.push(this.crosshair), this.notifications = new GS.UIComponents.Notifications(this.vectorCanvas, this.assets, this.grid.player), this.notifications.init(), this.components.push(this.notifications), this.winScreen = new GS.UIComponents.WinScreen(this.vectorCanvas, this.assets, this.grid.player), this.winScreen.init(), this.components.push(this.winScreen), this.automap = new GS.UIComponents.Automap(this.vectorCanvas, this.assets, this.grid.player), this.automap.init(), this.components.push(this.automap)), void 0 === this.menu && (this.menu = new GS.UIComponents.Menu(this.vectorCanvas, this.assets), this.menu.init()), this.overrideRedraw = !0
        },
        show: function() {
            this.overrideRedraw = !0, this.cvs.show(), this.hidden = !1
        },
        hide: function() {
            this.cvs.hide(), this.hidden = !0
        },
        update: function() {
            for (var i = 0; i < this.components.length; i++) this.components[i].update();
            this.menuActive && this.menu.update()
        },
        draw: function() {
            if (this.menuActive) this.cvs.clear(), this.menuOnly && this.vectorCanvas.drawImage(this.menuBackOffset, this.menuBackPos, this.assets.images.menu_back, this.menuBackSize, !1), this.menu.draw(), this.cvs.flip();
            else if (this.winScreen.visible) this.cvs.clear(), this.winScreen.draw(), this.cvs.flip();
            else if (this.automap.visible)(this.overrideRedraw || this.automap.needsRedraw) && (this.overrideRedraw && (this.overrideRedraw = !1), this.cvs.clear(), this.automap.draw(), this.automap.needsRedraw = !1, this.cvs.flip());
            else if (!this.hidden && this.checkIfRedraw()) {
                if (this.cvs.clear(), this.showHUD)
                    for (var i = 0; i < this.components.length; i++) this.components[i].visible && (this.components[i].draw(), this.components[i].needsRedraw = !1);
                this.cvs.flip()
            }
        },
        checkIfRedraw: function() {
            if (this.overrideRedraw) return this.overrideRedraw = !1, !0;
            for (var i = 0; i < this.components.length; i++)
                if (this.components[i].visible && this.components[i].needsRedraw) return !0;
            return !1
        },
        removeNewsBox: function() {
            this.menu.removeNewsBox()
        },
        useIngameMenu: function() {
            this.menuOnly = !1, this.menu.switchToIngame()
        },
        onResize: function() {
            this.overrideRedraw = !0, this.vectorCanvas.onResize(), GS.InputHelper.screenRatioX = this.cvs.bufferCanvas.width / window.innerWidth, GS.InputHelper.screenRatioY = this.cvs.bufferCanvas.height / window.innerHeight
        },
        dispose: function() {
            this.grid = void 0, this.powerBars = void 0, this.crosshair = void 0, this.notifications = void 0, this.winScreen = void 0, this.components = []
        }
    }, GS.VectorCanvas = function(canvas2d) {
        this.cvs = canvas2d, this.ratio = new THREE.Vector2
    }, GS.VectorCanvas.prototype = {
        constructor: GS.VectorCanvas,
        init: function() {
            this.onResize()
        },
        onResize: function() {
            this.ratio.set(this.cvs.bufferCanvas.width, this.cvs.bufferCanvas.height)
        },
        convertToScreenCoords: function(v0, v, fixedOffset) {
            v.x = Math.floor(v0.x * this.ratio.x), v.y = Math.floor(v0.y * this.ratio.y), void 0 !== fixedOffset && (v.x += fixedOffset.x, v.y += fixedOffset.y)
        },
        fixedLine: function() {
            var v0 = new THREE.Vector2,
                v1 = new THREE.Vector2;
            return function(pos, p0, p1, color, lineWidth) {
                this.convertToScreenCoords(pos, v0, p0), this.convertToScreenCoords(pos, v1, p1), this.cvs.line(v0, v1, color, lineWidth)
            }
        }(),
        line: function() {
            var v0 = new THREE.Vector2,
                v1 = new THREE.Vector2;
            return function(fixedOffset, pos, lineOffset, isFixedLineOffset, color, lineWidth) {
                this.convertToScreenCoords(pos, v0, fixedOffset), isFixedLineOffset ? v1.copy(v0).add(lineOffset) : (this.convertToScreenCoords(lineOffset, v1), v1.add(v0)), this.cvs.line(v0, v1, color, lineWidth)
            }
        }(),
        box: function() {
            var v0 = new THREE.Vector2,
                v1 = new THREE.Vector2;
            return function(fixedOffset, pos, size, isFixedSize, color, lineWidth) {
                this.convertToScreenCoords(pos, v0, fixedOffset), isFixedSize ? v1.copy(v0).add(size) : (this.convertToScreenCoords(size, v1), v1.add(v0)), this.cvs.box(v0, v1, color, lineWidth)
            }
        }(),
        boxFill: function() {
            var v0 = new THREE.Vector2,
                v1 = new THREE.Vector2;
            return function(fixedOffset, pos, size, isFixedSize, color) {
                this.convertToScreenCoords(pos, v0, fixedOffset), isFixedSize ? v1.copy(v0).add(size) : (this.convertToScreenCoords(size, v1), v1.add(v0)), this.cvs.boxFill(v0, v1, color)
            }
        }(),
        circle: function() {
            var v = new THREE.Vector2;
            return function(fixedOffset, pos, radius, color, lineWidth) {
                this.convertToScreenCoords(pos, v, fixedOffset), this.cvs.circle(v, radius, color, lineWidth)
            }
        }(),
        circleFill: function() {
            var v = new THREE.Vector2;
            return function(fixedOffset, pos, radius, color) {
                this.convertToScreenCoords(pos, v, fixedOffset), this.cvs.circleFill(v, radius, color)
            }
        }(),
        text: function() {
            var v = new THREE.Vector2;
            return function(fixedOffset, pos, str, color, fontSize, textBaseline, textAlign, fontFamily) {
                this.convertToScreenCoords(pos, v, fixedOffset), this.cvs.text(v, str, color, fontSize, textBaseline, textAlign, fontFamily)
            }
        }(),
        drawImage: function() {
            var v0 = new THREE.Vector2,
                v1 = new THREE.Vector2;
            return function(fixedOffset, pos, img, size, isFixedSize) {
                this.convertToScreenCoords(pos, v0, fixedOffset), isFixedSize ? v1.copy(size) : this.convertToScreenCoords(size, v1), this.cvs.drawImage(v0, img, v1)
            }
        }(),
        drawImageFromAtlas: function() {
            var v = new THREE.Vector2;
            return function(fixedOffset, pos, img, atlasOffset, atlasSize) {
                this.convertToScreenCoords(pos, v, fixedOffset), this.cvs.drawImageFromAtlas(v, img, atlasOffset, atlasSize)
            }
        }(),
        getTextWidth: function(str, fontSize, fontFamily) {
            return this.cvs.getTextWidth(str, fontSize, fontFamily)
        },
        roundedBox: function() {
            var v0 = new THREE.Vector2,
                v1 = new THREE.Vector2;
            return function(fixedOffset, pos, size, isFixedSize, radius, color, lineWidth) {
                this.convertToScreenCoords(pos, v0, fixedOffset), isFixedSize ? v1.copy(v0).add(size) : (this.convertToScreenCoords(size, v1), v1.add(v0)), this.cvs.roundedBox(v0, v1, radius, color, lineWidth)
            }
        }(),
        roundedBoxFill: function() {
            var v0 = new THREE.Vector2,
                v1 = new THREE.Vector2;
            return function(fixedOffset, pos, size, isFixedSize, radius, color) {
                this.convertToScreenCoords(pos, v0, fixedOffset), isFixedSize ? v1.copy(v0).add(size) : (this.convertToScreenCoords(size, v1), v1.add(v0)), this.cvs.roundedBoxFill(v0, v1, radius, color)
            }
        }()
    }, GS.UIComponents.Automap = function(vectorCanvas, assets, player) {
        this.cvs = vectorCanvas, this.assets = assets, this.player = player, this.aiManager = player.grid.aiManager, this.background = {
            offset: new THREE.Vector2(0, 0),
            pos: new THREE.Vector2(0, 0),
            size: new THREE.Vector2(1, 1)
        }, this.playerDraw = {
            offset: new THREE.Vector2(0, 0),
            pos: new THREE.Vector2(.5, .5)
        }, this.mapDraw = {
            offset: new THREE.Vector2(0, 0),
            pos: new THREE.Vector2(.5, .5)
        }, this.backgroundColor = GS.UIColors.menuBackground, this.oldRegionsDiscovered = Object.keys(this.aiManager.regionsDiscovered).length, this.oldPlayerPosition = this.player.position.toVector2(), this.currentPlayerPosition = this.player.position.toVector2(), this.oldPlayerDirection = this.player.direction.toVector2(), this.currentPlayerDirection = this.player.direction.toVector2(), this.zoomSpeed = .25, this.minZoom = .5, this.maxZoom = 4, this.zoom = 2, this.visible = !1
    }, GS.UIComponents.Automap.prototype = {
        constructor: GS.UIComponents.Automap,
        init: function() {},
        update: function() {
            var regionsDiscovered = Object.keys(this.aiManager.regionsDiscovered).length;
            for (regionsDiscovered > this.oldRegionsDiscovered && (this.needsRedraw = !0, this.oldRegionsDiscovered = regionsDiscovered), this.player.position.toVector2(this.currentPlayerPosition), this.currentPlayerPosition.equalsEpsilon(this.oldPlayerPosition) || (this.needsRedraw = !0, this.oldPlayerPosition.copy(this.currentPlayerPosition)), this.player.direction.toVector2(this.currentPlayerDirection), this.currentPlayerDirection.equalsEpsilon(this.oldPlayerDirection) || (this.needsRedraw = !0, this.oldPlayerDirection.copy(this.currentPlayerDirection)); GS.InputHelper.mouseWheelEvents.length > 0;) {
                var delta = GS.InputHelper.mouseWheelEvents.shift();
                delta < 0 && (this.zoom -= this.zoomSpeed), delta > 0 && (this.zoom += this.zoomSpeed), this.zoom = GS.MathHelper.clamp(this.zoom, this.minZoom, this.maxZoom), this.needsRedraw = !0
            }
        },
        draw: function() {
            this.cvs.boxFill(this.background.offset, this.background.pos, this.background.size, !1, this.backgroundColor);
            var regionsDiscovered = this.aiManager.regionsDiscovered;
            for (var i in regionsDiscovered) this.drawRegion(regionsDiscovered[i]);
            this.drawPlayer()
        },
        drawPlayer: function() {
            var p0 = new THREE.Vector2,
                p1 = new THREE.Vector2,
                p2 = new THREE.Vector2,
                color = (new THREE.Vector2, "rgba(192, 192, 192, 1)");
            return function() {
                var size = this.player.size.x * this.zoom,
                    xAngle = this.player.xAngle;
                p0.x = size * Math.sin(Math.PI / 180 * (450 - xAngle)), p0.y = size * Math.cos(Math.PI / 180 * (450 - xAngle)), p1.x = size * Math.sin(Math.PI / 180 * (300 - xAngle)), p1.y = size * Math.cos(Math.PI / 180 * (300 - xAngle)), p2.x = size * Math.sin(Math.PI / 180 * (240 - xAngle)), p2.y = size * Math.cos(Math.PI / 180 * (240 - xAngle)), this.cvs.fixedLine(this.mapDraw.pos, p0, p1, color, 3), this.cvs.fixedLine(this.mapDraw.pos, p1, p2, color, 3), this.cvs.fixedLine(this.mapDraw.pos, p2, p0, color, 3)
            }
        }(),
        drawRegion: function() {
            var p0 = new THREE.Vector2,
                p1 = new THREE.Vector2,
                wallColor = "rgba(64, 64, 64, 1)",
                doorColor = "rgba(128, 0, 0, 1)";
            return function(region) {
                function drawSectorLine(sector, x0, x1, color, lineWidth) {
                    p0.copy(sector.collisionVertices[x0]), p1.copy(sector.collisionVertices[x1]), p0.sub(that.currentPlayerPosition).multiplyScalar(that.zoom), p1.sub(that.currentPlayerPosition).multiplyScalar(that.zoom), p1.sub(p0), that.cvs.line(p0, that.mapDraw.pos, p1, !0, color, lineWidth)
                }
                var that = this,
                    sectorDict = this.aiManager.sectorDict;
                for (var i in region.sectorIds) {
                    var sector = sectorDict[i].sector;
                    if (!sector.door) {
                        for (var j = 0; j < sector.collisionVertices.length - 1; j++) drawSectorLine(sector, j, j + 1, wallColor, 1);
                        drawSectorLine(sector, j, 0, wallColor, 1)
                    }
                }
                for (var i in region.sectorIds) {
                    var sector = sectorDict[i].sector;
                    if (sector.door && sector.doorOpenedEver) {
                        for (var j = 0; j < sector.collisionVertices.length - 1; j++) drawSectorLine(sector, j, j + 1, doorColor, 3);
                        drawSectorLine(sector, j, 0, doorColor, 3)
                    }
                }
            }
        }()
    }, GS.UIComponents.Crosshair = function(vectorCanvas, assets, player) {
        this.cvs = vectorCanvas, this.assets = assets, this.player = player, this.size = 10, this.lineWidth = 3, this.pos = new THREE.Vector2(.5, .5), this.hOffset = new THREE.Vector2((-this.size), 0), this.hLineOffset = new THREE.Vector2(2 * this.size, 0), this.vOffset = new THREE.Vector2(0, (-this.size)), this.vLineOffset = new THREE.Vector2(0, 2 * this.size), this.visible = !0
    }, GS.UIComponents.Crosshair.prototype = {
        constructor: GS.UIComponents.Crosshair,
        init: function() {},
        update: function() {},
        draw: function() {
            this.cvs.line(this.hOffset, this.pos, this.hLineOffset, !0, GS.UIColors.foreground, this.lineWidth), this.cvs.line(this.vOffset, this.pos, this.vLineOffset, !0, GS.UIColors.foreground, this.lineWidth)
        }
    }, GS.UIComponents.Menu = function(vectorCanvas, assets) {
        this.cvs = vectorCanvas, this.assets = assets, this.fontSize = 60, this.boxCornerRadius = 10, this.background = {
            offset: new THREE.Vector2(0, 0),
            pos: new THREE.Vector2(0, 0),
            size: new THREE.Vector2(1, 1)
        }, this.text = {
            offset: new THREE.Vector2(0, 0),
            pos: new THREE.Vector2(.5, .5)
        }, this.logo = {
            offset: new THREE.Vector2((-300), (-384)),
            pos: new THREE.Vector2(.5, .5),
            size: new THREE.Vector2(600, 200),
            image: this.assets.images.logo
        }, this.children = [], this.activePanel = null, this.backgroundColor = GS.UIColors.menuBackground, this.ingame = !1, this.visible = !0
    }, GS.UIComponents.Menu.prototype = {
        constructor: GS.UIComponents.Menu,
        init: function() {
            this.initTopPanel(), this.initOptionsPanel(), this.initGraphicsPanel(), this.initSoundPanel(), this.initGameplayPanel(), this.initControlsPanel(), this.initCreditsPanel(), this.initCheatsPanel(), this.initLevelSelectPanel(), this.initFooter(), this.initNewsBox(), this.activePanel = this.topPanel
        },
        initTopPanel: function() {
            var that = this;
            this.topPanel = new GS.UIComponents.MenuPanel(this.cvs, new THREE.Vector2((-400), (-160)), new THREE.Vector2(.5, .5), new THREE.Vector2(800, 520), 72, 80), this.btnNewGame = this.topPanel.addButton("new game"), this.btnNewGame.onClick = function() {
                GAME.newGame()
            }, this.btnSteamPage = this.topPanel.addButton("steam page"), this.btnSteamPage.onClick = function() {
                var a = document.createElement("a");
                a.href = "https://goo.gl/akICRV", document.body.appendChild(a), a.click(), document.body.removeChild(a)
            }, this.btnLevelSelect = this.topPanel.addButton("level select"), this.btnLevelSelect.onClick = function() {
                that.activePanel = that.levelSelectPanel
            }, this.btnOptions = this.topPanel.addButton("options"), this.btnOptions.onClick = function() {
                that.activePanel = that.optionsPanel
            }, this.btnCredits = this.topPanel.addButton("credits"), this.btnCredits.onClick = function() {
                that.activePanel = that.creditsPanel
            }, this.btnSubscribe = this.topPanel.addButton("subscribe"), this.btnSubscribe.onClick = function() {
                var a = document.createElement("a");
                a.href = "http://eepurl.com/cEkb3T", document.body.appendChild(a), a.click(), document.body.removeChild(a)
            }
        },
        initOptionsPanel: function() {
            var that = this;
            this.optionsPanel = new GS.UIComponents.MenuPanel(this.cvs, new THREE.Vector2((-400), (-160)), new THREE.Vector2(.5, .5), new THREE.Vector2(800, 520), 60, 65), this.btnGraphics = this.optionsPanel.addButton("graphics"), this.btnGraphics.onClick = function() {
                that.activePanel = that.graphicsPanel
            }, this.btnSound = this.optionsPanel.addButton("sound"), this.btnSound.onClick = function() {
                that.activePanel = that.soundPanel
            }, this.btnGameplay = this.optionsPanel.addButton("gameplay"), this.btnGameplay.onClick = function() {
                that.activePanel = that.gameplayPanel
            }, this.btnControls = this.optionsPanel.addButton("controls"), this.btnControls.onClick = function() {
                that.activePanel = that.controlsPanel
            }, this.btnCheats = this.optionsPanel.addButton("cheats"), this.btnCheats.disabled = !0, this.btnCheats.onClick = function() {
                that.activePanel = that.cheatsPanel
            }, this.optionsPanel.addEmptyRow(), this.btnOptionsBack = this.optionsPanel.addButton("back"), this.btnOptionsBack.onClick = function() {
                that.activePanel = that.topPanel
            }
        },
        initGraphicsPanel: function() {
            var that = this;
            this.graphicsPanel = new GS.UIComponents.MenuPanel(this.cvs, new THREE.Vector2((-400), (-160)), new THREE.Vector2(.5, .5), new THREE.Vector2(800, 520), 40, 43), this.btnToggleHalfSize = this.graphicsPanel.addToggleButton("half-size rendering"), this.btnToggleHalfSize.button.currentStateIndex = GS.Settings.halfSize === !0 ? 0 : 1, this.btnToggleHalfSize.button.onClick = function(e) {
                GS.Settings.halfSize = "on" === e.state
            }, this.graphicsPanel.addEmptyRow(), this.btnToggleSSAO = this.graphicsPanel.addToggleButton("SSAO"), this.btnToggleSSAO.button.currentStateIndex = GS.Settings.ssao === !0 ? 0 : 1, this.btnToggleSSAO.button.onClick = function(e) {
                GS.Settings.ssao = "on" === e.state
            }, this.btnToggleBloom = this.graphicsPanel.addToggleButton("bloom"), this.btnToggleBloom.button.currentStateIndex = GS.Settings.bloom === !0 ? 0 : 1, this.btnToggleBloom.button.onClick = function(e) {
                GS.Settings.bloom = "on" === e.state
            }, this.btnToggleNoise = this.graphicsPanel.addToggleButton("noise filter"), this.btnToggleNoise.button.currentStateIndex = GS.Settings.noise === !0 ? 0 : 1, this.btnToggleNoise.button.onClick = function(e) {
                GS.Settings.noise = "on" === e.state
            }, this.btnToggleVignette = this.graphicsPanel.addToggleButton("vignette"), this.btnToggleVignette.button.currentStateIndex = GS.Settings.vignette === !0 ? 0 : 1, this.btnToggleVignette.button.onClick = function(e) {
                GS.Settings.vignette = "on" === e.state
            }, this.btnToggleFXAA = this.graphicsPanel.addToggleButton("FXAA"), this.btnToggleFXAA.button.currentStateIndex = GS.Settings.fxaa === !0 ? 0 : 1, this.btnToggleFXAA.button.onClick = function(e) {
                GS.Settings.fxaa = "on" === e.state
            }, this.graphicsPanel.addEmptyRow(), this.numberPickerFOV = this.graphicsPanel.addNumberPicker("field of view", GS.Settings.fov, GS.Settings.fovMin, GS.Settings.fovMax, 5), this.numberPickerFOV.numberPicker.onChange = function(e) {
                GS.Settings.fov = e.value
            }, this.btnToggleShowFPS = this.graphicsPanel.addToggleButton("show FPS"), this.btnToggleShowFPS.button.currentStateIndex = GS.Settings.showFPS === !0 ? 0 : 1, this.btnToggleShowFPS.button.onClick = function(e) {
                GS.Settings.showFPS = "on" === e.state
            }, this.graphicsPanel.addEmptyRow(), this.btnGraphicsBack = this.graphicsPanel.addButton("back"), this.btnGraphicsBack.onClick = function() {
                that.activePanel = that.optionsPanel
            }
        },
        initSoundPanel: function() {
            var that = this;
            this.soundPanel = new GS.UIComponents.MenuPanel(this.cvs, new THREE.Vector2((-400), (-160)), new THREE.Vector2(.5, .5), new THREE.Vector2(800, 520), 40, 43), this.numberPickerSound = this.soundPanel.addNumberPicker("sound volume", GS.Settings.sound, GS.Settings.soundMin, GS.Settings.soundMax, 1), this.numberPickerSound.numberPicker.onChange = function(e) {
                GS.Settings.sound = e.value
            }, this.numberPickerMusic = this.soundPanel.addNumberPicker("music volume", GS.Settings.music, GS.Settings.musicMin, GS.Settings.musicMax, 1), this.numberPickerMusic.numberPicker.onChange = function(e) {
                GS.Settings.music = e.value
            }, this.soundPanel.addEmptyRow(), this.btnSoundBack = this.soundPanel.addButton("back"), this.btnSoundBack.onClick = function() {
                that.activePanel = that.optionsPanel
            }
        },
        initGameplayPanel: function() {
            var that = this;
            this.gameplayPanel = new GS.UIComponents.MenuPanel(this.cvs, new THREE.Vector2((-400), (-160)), new THREE.Vector2(.5, .5), new THREE.Vector2(800, 520), 40, 43), this.btnToggleViewBob = this.gameplayPanel.addToggleButton("view bobbing"), this.btnToggleViewBob.button.currentStateIndex = GS.Settings.viewBob === !0 ? 0 : 1, this.btnToggleViewBob.button.onClick = function(e) {
                GS.Settings.viewBob = "on" === e.state
            }, this.btnToggleWeaponBob = this.gameplayPanel.addToggleButton("weapon bobbing"), this.btnToggleWeaponBob.button.currentStateIndex = GS.Settings.weaponBob === !0 ? 0 : 1, this.btnToggleWeaponBob.button.onClick = function(e) {
                GS.Settings.weaponBob = "on" === e.state
            }, this.gameplayPanel.addEmptyRow(), this.btnToggleShowHUD = this.gameplayPanel.addToggleButton("show HUD"), this.btnToggleShowHUD.button.currentStateIndex = GS.Settings.showHUD === !0 ? 0 : 1, this.btnToggleShowHUD.button.onClick = function(e) {
                GS.Settings.showHUD = "on" === e.state
            }, this.btnToggleShowWeapon = this.gameplayPanel.addToggleButton("show weapon"), this.btnToggleShowWeapon.button.currentStateIndex = GS.Settings.showWeapon === !0 ? 0 : 1, this.btnToggleShowWeapon.button.onClick = function(e) {
                GS.Settings.showWeapon = "on" === e.state
            }, this.gameplayPanel.addEmptyRow(), this.btnGameplayBack = this.gameplayPanel.addButton("back"), this.btnGameplayBack.onClick = function() {
                that.activePanel = that.optionsPanel
            }
        },
        initCheatsPanel: function() {
            var that = this;
            this.cheatsPanel = new GS.UIComponents.MenuPanel(this.cvs, new THREE.Vector2((-400), (-160)), new THREE.Vector2(.5, .5), new THREE.Vector2(800, 520), 40, 43), this.btnToggleGod = this.cheatsPanel.addToggleButton("god mode"), this.btnToggleGod.button.currentStateIndex = 1, this.btnToggleGod.button.onClick = function(e) {
                GAME.grid.player.god(), GS.DebugUI.addTempLine("god mode " + e.state)
            }, this.btnToggleFly = this.cheatsPanel.addToggleButton("fly mode"), this.btnToggleFly.button.currentStateIndex = 1, this.btnToggleFly.button.onClick = function(e) {
                GAME.grid.player.fly(), GS.DebugUI.addTempLine("fly mode " + e.state)
            }, this.btnToggleNoclip = this.cheatsPanel.addToggleButton("noclip mode"), this.btnToggleNoclip.button.currentStateIndex = 1, this.btnToggleNoclip.button.onClick = function(e) {
                GAME.grid.player.noClip(), GS.DebugUI.addTempLine("noclip mode " + e.state)
            }, this.cheatsPanel.addEmptyRow(), this.btnCheatsGiveAll = this.cheatsPanel.addButton("give ammo and all weapons"), this.btnCheatsGiveAll.onClick = function() {
                GAME.grid.player.giveAll(), GS.DebugUI.addTempLine("all weapons and max ammo given")
            }, this.cheatsPanel.addEmptyRow(), this.btnCheatsBack = this.cheatsPanel.addButton("back"), this.btnCheatsBack.onClick = function() {
                that.activePanel = that.optionsPanel
            }
        },
        initLevelSelectPanel: function() {
            var that = this;
            this.levelSelectPanel = new GS.UIComponents.MenuPanel(this.cvs, new THREE.Vector2((-400), (-160)), new THREE.Vector2(.5, .5), new THREE.Vector2(800, 520), 60, 140), this.btnLevel1 = this.levelSelectPanel.addImageButton("airstrip one", this.assets.images.thumb_airstrip1), this.btnLevel1.onClick = function() {
                GAME.loadLevel("airstrip1")
            }, this.btnLevel1 = this.levelSelectPanel.addImageButton("drencrom", this.assets.images.thumb_drencrom), this.btnLevel1.onClick = function() {
                GAME.loadLevel("drencrom")
            }, this.btnLevel2 = this.levelSelectPanel.addImageButton("sacrosanct", this.assets.images.thumb_sacrosanct), this.btnLevel2.onClick = function() {
                GAME.loadLevel("sacrosanct")
            }, this.levelSelectPanel.fontSize = 40, this.levelSelectPanel.rowHeight = 43, this.levelSelectPanel.addEmptyRow(), this.btnLevelSelectBack = this.levelSelectPanel.addButton("back"), this.btnLevelSelectBack.onClick = function() {
                that.activePanel = that.topPanel
            }
        },
        initControlsPanel: function() {
            var that = this;
            this.controlsPanel = new GS.UIComponents.MenuPanel(this.cvs, new THREE.Vector2((-400), (-160)), new THREE.Vector2(.5, .5), new THREE.Vector2(800, 520), 28, 31), this.btnToggleMouseInvertY = this.controlsPanel.addToggleButton("invert mouse y axis"), this.btnToggleMouseInvertY.button.currentStateIndex = GS.Settings.mouseInvertY === !0 ? 0 : 1, this.btnToggleMouseInvertY.button.onClick = function(e) {
                GS.Settings.mouseInvertY = "on" === e.state
            }, this.numberPickerMouse = this.controlsPanel.addNumberPicker("mouse sensitivity", GS.Settings.mouse, GS.Settings.mouseMin, GS.Settings.mouseMax, 1), this.numberPickerMouse.numberPicker.onChange = function(e) {
                GS.Settings.mouse = e.value
            }, this.controlsPanel.addEmptyRow(), this.btnToggleMoveForward = this.controlsPanel.addToggleButton("move forward", ["W"]), this.btnToggleMoveBackward = this.controlsPanel.addToggleButton("move backward", ["S"]), this.btnToggleStrafeLeft = this.controlsPanel.addToggleButton("strafe left", ["A"]), this.btnToggleStrafeRight = this.controlsPanel.addToggleButton("strafe right", ["D"]), this.btnToggleUse = this.controlsPanel.addToggleButton("use", ["E"]), this.btnToggleShoot = this.controlsPanel.addToggleButton("shoot", ["mouse left"]), this.btnTogglePistol = this.controlsPanel.addToggleButton("pistol", ["2"]), this.btnToggleShotgun = this.controlsPanel.addToggleButton("shotgun", ["3"]), this.btnToggleHyperBlaster = this.controlsPanel.addToggleButton("hyperblaster", ["4"]), this.btnToggleAutomap = this.controlsPanel.addToggleButton("automap", ["TAB"]), this.btnToggleAutomap.button.disabled = !0, this.btnToggleMenu = this.controlsPanel.addToggleButton("menu", ["ESC"]), this.btnToggleMenu.button.disabled = !0, this.controlsPanel.addEmptyRow(), this.btnControlsBack = this.controlsPanel.addButton("back"), this.btnControlsBack.onClick = function() {
                that.activePanel = that.optionsPanel
            }, this.attachReboundEventHandlers()
        },
        attachReboundEventHandlers: function() {
            function getOnClickEventHandler(actionName) {
                return function() {
                    GS.KeybindSettings.rebound.modifyKeybind(GS.Keybinds[actionName])
                }
            }
            var keyButtonMap = {
                moveForward: this.btnToggleMoveForward,
                moveBackward: this.btnToggleMoveBackward,
                strafeLeft: this.btnToggleStrafeLeft,
                strafeRight: this.btnToggleStrafeRight,
                use: this.btnToggleUse,
                shoot: this.btnToggleShoot,
                pistol: this.btnTogglePistol,
                shotgun: this.btnToggleShotgun,
                hyperblaster: this.btnToggleHyperBlaster
            };
            for (var i in keyButtonMap) {
                var button = keyButtonMap[i].button;
                button.onClick = getOnClickEventHandler(i), button.states = [GS.Keybinds[i].controlName], button.currentStateIndex = 0
            }
            GS.KeybindSettings.rebound.onModifyingKeybindStart = function(e) {
                var button = keyButtonMap[e.keybind.actionName].button;
                button.states = ["press new key"], button.currentStateIndex = 0
            }, GS.KeybindSettings.rebound.onModifyingKeybindStop = function(e) {
                for (var i in keyButtonMap) {
                    var button = keyButtonMap[i].button;
                    button.states = [GS.Keybinds[i].controlName], button.currentStateIndex = 0
                }
                if (e.success) {
                    var button2 = keyButtonMap[e.keybind.actionName].button,
                        onClickEventHandler = button2.onClick;
                    button2.onClick = function() {}, setTimeout(function() {
                        button2.onClick = onClickEventHandler
                    }, 100), GS.Settings.saveSettings();
                    var notifications = GAME.uiManager.notifications;
                    notifications && (notifications.useText = "[" + GS.Keybinds.use.controlName + "] to use", notifications.calculateSizes())
                }
            }
        },
        initCreditsPanel: function() {
            var that = this;
            this.creditsPanel = new GS.UIComponents.MenuPanel(this.cvs, new THREE.Vector2((-400), (-160)), new THREE.Vector2(.5, .5), new THREE.Vector2(800, 520), 30, 33), this.dblLabelCredits1 = this.creditsPanel.addDoubleLabel('code, "art"', "sergiu valentin bucur"), this.creditsPanel.addEmptyRow(), this.dblLabelCredits23 = this.creditsPanel.addDoubleLabel("music", "DST"), this.dblLabelCredits24 = this.creditsPanel.addDoubleLabel("", "3uhox"), this.creditsPanel.addEmptyRow(), this.dblLabelCredits3 = this.creditsPanel.addDoubleLabel("sound effects", "freesound.org"), this.dblLabelCredits4 = this.creditsPanel.addDoubleLabel("", "opengameart.org"), this.creditsPanel.addEmptyRow(), this.dblLabelCredits5 = this.creditsPanel.addDoubleLabel("skybox texture", "alexcpeterson.com/spacescape"), this.creditsPanel.addEmptyRow(), this.dblLabelCredits6 = this.creditsPanel.addDoubleLabel("frameworks", "three.js"), this.dblLabelCredits7 = this.creditsPanel.addDoubleLabel("", "tween.js"), this.dblLabelCredits8 = this.creditsPanel.addDoubleLabel("", "jszip"), this.creditsPanel.addEmptyRow(), this.btnCreditsBack = this.creditsPanel.addButton("back"), this.btnCreditsBack.onClick = function() {
                that.activePanel = that.topPanel
            }
        },
        initFooter: function() {
            this.label1 = new GS.UIComponents.MenuLabel(this.cvs, GS.GameVersion, new THREE.Vector2((-20), (-70)), new THREE.Vector2(1, 1)), this.label1.textAlign = "right", this.label1.fontSize = 30, this.children.push(this.label1), this.label2 = new GS.UIComponents.MenuLabel(this.cvs, GS.ReleaseDate, new THREE.Vector2((-20), (-35)), new THREE.Vector2(1, 1)), this.label2.textAlign = "right", this.label2.fontSize = 30, this.children.push(this.label2)
        },
        initNewsBox: function() {
            this.newsBox = $(".news-box"), this.newsBox.show()
        },
        switchToIngame: function() {
            this.ingame = !0, this.btnCheats.disabled = !1, this.btnToggleGod.button.currentStateIndex = 1, this.btnToggleFly.button.currentStateIndex = 1, this.btnToggleNoclip.button.currentStateIndex = 1
        },
        update: function() {
            this.activePanel.update();
            for (var i = 0; i < this.children.length; i++) this.children[i].update()
        },
        draw: function() {
            this.ingame && this.cvs.boxFill(this.background.offset, this.background.pos, this.background.size, !1, this.backgroundColor), this.cvs.drawImage(this.logo.offset, this.logo.pos, this.logo.image, this.logo.size, !0), this.activePanel.draw();
            for (var i = 0; i < this.children.length; i++) this.children[i].draw()
        },
        removeNewsBox: function() {
            this.newsBox.remove(), this.newsBox = void 0
        }
    }, GS.UIComponents.MenuButton = function(vectorCanvas, text, offset, pos, size, onClick, states) {
        this.cvs = vectorCanvas, this.fontSize = 40, this.text = text, this.textBaseline = "middle", this.textAlign = "center", this.offset = offset, this.pos = pos, this.size = size, this.borderRadius = 10, this.onClick = onClick || function() {}, this.states = states, this._currentStateIndex = 0, this.min = new THREE.Vector2, this.max = new THREE.Vector2, this.textOffset = this.offset.clone().add(this.size.clone().multiplyScalar(.5)), this.hover = !1, this.active = !1, this.disabled = !1, this.backgroundColor = GS.UIColors.buttonHover, this.foregroundColor = GS.UIColors.foregroundDisabled
    }, GS.UIComponents.MenuButton.prototype = {
        constructor: GS.UIComponents.MenuButton,
        init: function() {},
        update: function() {
            var mx = GS.InputHelper.mouseX,
                my = GS.InputHelper.mouseY;
            this.cvs.convertToScreenCoords(this.pos, this.min, this.offset), this.max.copy(this.min).add(this.size), this.disabled ? this.foregroundColor = GS.UIColors.foregroundDisabled : (this.foregroundColor = GS.UIColors.foreground, mx >= this.min.x && my >= this.min.y && mx < this.max.x && my < this.max.y ? (this.hover = !0, this.backgroundColor = GS.UIColors.buttonHover) : this.hover = !1, this.hover && (GS.InputHelper.leftMouseDown ? (this.active = !0, this.backgroundColor = GS.UIColors.buttonActive) : this.active && (void 0 !== this.states ? (this._currentStateIndex++, this._currentStateIndex >= this.states.length && (this._currentStateIndex = 0), this.text = this.states[this._currentStateIndex], this.onClick({
                state: this.text,
                stateIndex: this._currentStateIndex
            })) : this.onClick(), this.active = !1, this.backgroundColor = GS.UIColors.buttonHover)))
        },
        draw: function() {
            !this.disabled && this.hover && this.cvs.roundedBoxFill(this.offset, this.pos, this.size, !0, this.borderRadius, this.backgroundColor), this.cvs.text(this.textOffset, this.pos, this.text, this.foregroundColor, this.fontSize, this.textBaseline, this.textAlign, GS.UIFont)
        },
        set currentStateIndex(value) {
            void 0 !== this.states && value >= 0 && value < this.states.length && (this._currentStateIndex = value, this.text = this.states[this._currentStateIndex])
        },
        get currentStateIndex() {
            return this._currentStateIndex
        }
    }, GS.UIComponents.MenuImageButton = function(vectorCanvas, offset, pos, size, fontSize, text, image, onClick) {
        this.cvs = vectorCanvas, this.fontSize = fontSize || 40, this.offset = offset, this.pos = pos, this.size = size, this.text = text, this.image = image, this.onClick = onClick || function() {}, this.init()
    }, GS.UIComponents.MenuImageButton.prototype = {
        constructor: GS.UIComponents.MenuImageButton,
        init: function() {
            var that = this,
                buttonOffset = this.offset.clone(),
                buttonSize = new THREE.Vector2(this.size.x, this.size.y),
                button = new GS.UIComponents.MenuButton(this.cvs, this.text, buttonOffset, this.pos, buttonSize, function() {
                    that.onClick()
                });
            button.textOffset.x -= .1 * this.size.x, button.textAlign = "left", button.fontSize = this.fontSize, this.button = button, this.imageSize = new THREE.Vector2(231, 130), this.imageOffset = this.offset.clone(), this.imageOffset.x += .2 * this.size.x - this.imageSize.x / 2, this.imageOffset.y += .5 * this.size.y - this.imageSize.y / 2
        },
        update: function() {
            this.button.update()
        },
        draw: function() {
            this.button.draw(), this.cvs.drawImage(this.imageOffset, this.pos, this.image, this.imageSize, !0)
        }
    }, GS.UIComponents.MenuLabel = function(vectorCanvas, text, offset, pos) {
        this.cvs = vectorCanvas, this.fontSize = 40, this.text = text, this.textBaseline = "middle", this.textAlign = "center", this.offset = offset, this.pos = pos, this.foregroundColor = GS.UIColors.foreground
    }, GS.UIComponents.MenuLabel.prototype = {
        constructor: GS.UIComponents.MenuLabel,
        init: function() {},
        update: function() {},
        draw: function() {
            this.cvs.text(this.offset, this.pos, this.text, this.foregroundColor, this.fontSize, this.textBaseline, this.textAlign, GS.UIFont)
        }
    }, GS.UIComponents.MenuNumberPicker = function(vectorCanvas, offset, pos, size, fontSize, value, min, max, step, onChange) {
        this.cvs = vectorCanvas, this.fontSize = fontSize || 40, this.offset = offset, this.pos = pos, this.size = size, this.value = void 0 !== value ? value : 5, this.min = void 0 !== min ? min : 1, this.max = void 0 !== max ? max : 10, this.step = void 0 !== step ? step : 1, this.onChange = onChange || function() {}, this.init()
    }, GS.UIComponents.MenuNumberPicker.prototype = {
        constructor: GS.UIComponents.MenuNumberPicker,
        init: function() {
            var that = this,
                size = new THREE.Vector2(.2 * this.size.x, this.size.y),
                leftOffset = this.offset.clone();
            this.leftButton = new GS.UIComponents.MenuButton(this.cvs, "<", leftOffset, this.pos, size), this.leftButton.fontSize = this.fontSize, this.leftButton.onClick = function() {
                that.value -= that.step, that.value = Math.max(that.min, that.value), that.label.text = that.value, that.onChange({
                    value: that.value
                })
            };
            var rightOffset = this.offset.clone();
            rightOffset.x += .8 * this.size.x, this.rightButton = new GS.UIComponents.MenuButton(this.cvs, ">", rightOffset, this.pos, size), this.rightButton.fontSize = this.fontSize, this.rightButton.onClick = function() {
                that.value += that.step, that.value = Math.min(that.max, that.value), that.label.text = that.value, that.onChange({
                    value: that.value
                })
            };
            var labelOffset = this.offset.clone();
            labelOffset.x += .5 * this.size.x, labelOffset.y += .5 * this.size.y, this.label = new GS.UIComponents.MenuLabel(this.cvs, this.value, labelOffset, this.pos), this.label.fontSize = this.fontSize
        },
        update: function() {
            this.leftButton.update(), this.rightButton.update()
        },
        draw: function() {
            this.leftButton.draw(), this.rightButton.draw(), this.label.draw()
        }
    }, GS.UIComponents.MenuPanel = function(vectorCanvas, offset, pos, size, fontSize, rowHeight) {
        this.cvs = vectorCanvas, this.children = [], this.fontSize = fontSize || 40, this.offset = offset, this.pos = pos, this.size = size, this.rowHeight = rowHeight || 40, this.rowOffset = 0
    }, GS.UIComponents.MenuPanel.prototype = {
        constructor: GS.UIComponents.MenuPanel,
        init: function() {},
        addButton: function(text, onClick) {
            var offset = this.getRowOffset(),
                size = new THREE.Vector2(this.size.x, this.rowHeight),
                button = new GS.UIComponents.MenuButton(this.cvs, text, offset, this.pos, size, onClick);
            return button.fontSize = this.fontSize, this.children.push(button), this.rowOffset += this.rowHeight, button
        },
        addToggleButton: function(text, states, buttonSize, onClick) {
            buttonSize = buttonSize || .2;
            var offset = this.getRowOffset(),
                labelOffset = offset.clone();
            labelOffset.x += .5 * this.size.x - 10, labelOffset.y += .5 * this.rowHeight;
            var label = new GS.UIComponents.MenuLabel(this.cvs, text, labelOffset, this.pos);
            label.fontSize = this.fontSize, label.textAlign = "right", this.children.push(label);
            var buttonOffset = offset.clone(),
                buttonSize = new THREE.Vector2(this.size.x * buttonSize, this.rowHeight);
            buttonOffset.x += .5 * this.size.x + 10, states = states || ["on", "off"];
            var button = new GS.UIComponents.MenuButton(this.cvs, states[0], buttonOffset, this.pos, buttonSize, onClick, states);
            return button.fontSize = this.fontSize, this.children.push(button), this.rowOffset += this.rowHeight, {
                label: label,
                button: button
            }
        },
        addDoubleLabel: function(text1, text2) {
            var offset = this.getRowOffset(),
                label1Offset = offset.clone();
            label1Offset.x += .5 * this.size.x - 30, label1Offset.y += .5 * this.rowHeight;
            var label1 = new GS.UIComponents.MenuLabel(this.cvs, text1, label1Offset, this.pos);
            label1.fontSize = this.fontSize, label1.textAlign = "right", this.children.push(label1);
            var label2Offset = offset.clone();
            label2Offset.x += .5 * this.size.x + 30, label2Offset.y += .5 * this.rowHeight;
            var label2 = new GS.UIComponents.MenuLabel(this.cvs, text2, label2Offset, this.pos);
            return label2.fontSize = this.fontSize, label2.textAlign = "left", this.children.push(label2), this.rowOffset += this.rowHeight, {
                label1: label1,
                label2: label2
            }
        },
        addNumberPicker: function(text, value, min, max, step, onChange) {
            var offset = this.getRowOffset(),
                labelOffset = offset.clone();
            labelOffset.x += .5 * this.size.x - 10, labelOffset.y += .5 * this.rowHeight;
            var label = new GS.UIComponents.MenuLabel(this.cvs, text, labelOffset, this.pos);
            label.fontSize = this.fontSize, label.textAlign = "right", this.children.push(label);
            var numberPickerOffset = offset.clone(),
                numberPickerSize = new THREE.Vector2(.2 * this.size.x, this.rowHeight);
            numberPickerOffset.x += .5 * this.size.x + 10;
            var numberPicker = new GS.UIComponents.MenuNumberPicker(this.cvs, numberPickerOffset, this.pos, numberPickerSize, this.fontSize, value, min, max, step, onChange);
            return this.children.push(numberPicker), this.rowOffset += this.rowHeight, {
                label: label,
                numberPicker: numberPicker
            }
        },
        addImageButton: function(text, image, onClick) {
            var offset = this.getRowOffset(),
                imageButtonOffset = offset.clone(),
                imageButtonSize = new THREE.Vector2(this.size.x, this.rowHeight),
                imageButton = new GS.UIComponents.MenuImageButton(this.cvs, imageButtonOffset, this.pos, imageButtonSize, this.fontSize, text, image, onClick);
            return this.children.push(imageButton), this.rowOffset += this.rowHeight, imageButton
        },
        addEmptyRow: function() {
            this.rowOffset += this.rowHeight
        },
        getRowOffset: function() {
            var offset = this.offset.clone();
            return offset.y += this.rowOffset, Math.abs(offset.y - this.offset.y) > this.size.y ? void GAME.handleFatalError("menu panel exceeds height") : offset
        },
        update: function() {
            for (var i = 0; i < this.children.length; i++) this.children[i].update()
        },
        draw: function() {
            for (var i = 0; i < this.children.length; i++) this.children[i].draw()
        },
        add: function(menuComponent) {
            this.children.push(menuComponent)
        }
    }, GS.UIComponents.Notifications = function(vectorCanvas, assets, player) {
        this.cvs = vectorCanvas, this.assets = assets, this.player = player, this.fontSize = 40, this.boxCornerRadius = 10, this.useText = "[" + GS.Keybinds.use.controlName + "] to use", this.pointerLockText = "right-click to enable pointer lock", this.restartText = "[ENTER] to restart level", this.usePopup = {
            originalOffset: new THREE.Vector2(0, 100),
            offset: new THREE.Vector2,
            pos: new THREE.Vector2(.5, .5),
            size: new THREE.Vector2(0, 60),
            textOffset: new THREE.Vector2(0, 0)
        }, this.pointerLockPopup = {
            originalOffset: new THREE.Vector2(0, 100),
            offset: new THREE.Vector2,
            pos: new THREE.Vector2(.5, .5),
            size: new THREE.Vector2(0, 60),
            textOffset: new THREE.Vector2(0, 0)
        }, this.restartPopup = {
            originalOffset: new THREE.Vector2(0, 100),
            offset: new THREE.Vector2,
            pos: new THREE.Vector2(.5, .5),
            size: new THREE.Vector2(0, 60),
            textOffset: new THREE.Vector2(0, 0)
        }, this.calculateSizes(), this.visible = !0, this.oldShowUsePopup = !1, this.showUsePopup = !1, this.oldShowPointerLockPopup = !1, this.showPointerLockPopup = !1, this.oldShowRestartPopup = !1, this.showRestartPopup = !1
    }, GS.UIComponents.Notifications.prototype = {
        constructor: GS.UIComponents.Notifications,
        init: function() {},
        update: function() {
            this.showUsePopup = this.player.canUse, this.showUsePopup != this.oldShowUsePopup && (this.needsRedraw = !0, this.oldShowUsePopup = this.showUsePopup), this.showPointerLockPopup = !this.player.controls.pointerLockEnabled, this.showPointerLockPopup != this.oldShowPointerLockPopup && (this.needsRedraw = !0, this.oldShowPointerLockPopup = this.showPointerLockPopup), this.showRestartPopup = this.player.dead, this.showRestartPopup != this.oldShowRestartPopup && (this.needsRedraw = !0, this.oldShowRestartPopup = this.showRestartPopup)
        },
        draw: function() {
            this.showRestartPopup ? this.drawPopup(this.restartText, this.restartPopup) : this.showPointerLockPopup ? this.drawPopup(this.pointerLockText, this.pointerLockPopup) : this.showUsePopup && this.drawPopup(this.useText, this.usePopup)
        },
        drawPopup: function(text, popup) {
            this.cvs.roundedBoxFill(popup.offset, popup.pos, popup.size, !0, this.boxCornerRadius, GS.UIColors.background), this.cvs.text(popup.textOffset, popup.pos, text, GS.UIColors.foreground, this.fontSize, "middle", "center", GS.UIFont)
        },
        calculateSizes: function() {
            this.calculatePopupSize(this.useText, this.usePopup), this.calculatePopupSize(this.pointerLockText, this.pointerLockPopup), this.calculatePopupSize(this.restartText, this.restartPopup)
        },
        calculatePopupSize: function(text, popup, textWidth) {
            void 0 === textWidth && (textWidth = this.cvs.getTextWidth(text, this.fontSize, GS.UIFont));
            var padding = 15,
                width = textWidth + 2 * padding;
            popup.size.x = width, popup.offset.x = -width / 2, popup.offset.y = popup.originalOffset.y - popup.size.y, popup.textOffset.copy(popup.offset).add(popup.size.clone().multiplyScalar(.5))
        }
    }, GS.UIComponents.PowerBars = function(vectorCanvas, assets, player) {
        this.cvs = vectorCanvas, this.assets = assets, this.player = player, this.fontSize = 60, this.boxCornerRadius = 10, this.healthBar = {
            offset: new THREE.Vector2(20, (-20)),
            pos: new THREE.Vector2(0, 1),
            size: new THREE.Vector2(220, 90),
            textOffset: new THREE.Vector2(95, 4),
            imageOffset: new THREE.Vector2(20, 20),
            imageAtlasOffset: new THREE.Vector2(0, 0),
            imageAtlasSize: new THREE.Vector2(64, 64)
        }, this.healthBar.offset.y -= this.healthBar.size.y, this.healthBar.imageOffset.add(this.healthBar.offset), this.healthBar.textOffset.add(this.healthBar.offset).add(this.healthBar.size.clone().multiplyScalar(.5)), this.ammoBar = {
            offset: new THREE.Vector2((-20), (-20)),
            pos: new THREE.Vector2(1, 1),
            size: new THREE.Vector2(220, 90),
            textOffset: new THREE.Vector2(95, 4),
            imageOffset: new THREE.Vector2(20, 20),
            imageAtlasOffset: new THREE.Vector2(64, 0),
            imageAtlasSize: new THREE.Vector2(64, 64)
        }, this.ammoBar.offset.sub(this.ammoBar.size), this.ammoBar.imageOffset.add(this.ammoBar.offset), this.ammoBar.textOffset.add(this.ammoBar.offset).add(this.ammoBar.size.clone().multiplyScalar(.5)), this.tex = this.assets.images.hud, this.visible = !0, this.ammo = void 0, this.health = "", this.oldHealth = -1, this.oldAmmo = -1
    }, GS.UIComponents.PowerBars.prototype = {
        constructor: GS.UIComponents.PowerBars,
        init: function() {},
        update: function() {
            this.health = Math.floor(this.player.health), void 0 === this.player.weapon || this.player.weapon.infiniteAmmo ? this.ammo = void 0 : this.ammo = this.player.weapon.ammo, this.health == this.oldHealth && this.ammo == this.oldAmmo || (this.needsRedraw = !0, this.oldHealth = this.health, this.oldAmmo = this.ammo)
        },
        draw: function() {
            this.cvs.roundedBoxFill(this.healthBar.offset, this.healthBar.pos, this.healthBar.size, !0, this.boxCornerRadius, GS.UIColors.background), this.cvs.text(this.healthBar.textOffset, this.healthBar.pos, this.health, GS.UIColors.foreground, this.fontSize, "middle", "right", GS.UIFont), this.cvs.drawImageFromAtlas(this.healthBar.imageOffset, this.healthBar.pos, this.tex, this.healthBar.imageAtlasOffset, this.healthBar.imageAtlasSize), void 0 !== this.ammo && (this.cvs.roundedBoxFill(this.ammoBar.offset, this.ammoBar.pos, this.ammoBar.size, !0, this.boxCornerRadius, GS.UIColors.background), this.cvs.text(this.ammoBar.textOffset, this.ammoBar.pos, this.ammo, GS.UIColors.foreground, this.fontSize, "middle", "right", GS.UIFont), this.cvs.drawImageFromAtlas(this.ammoBar.imageOffset, this.ammoBar.pos, this.tex, this.ammoBar.imageAtlasOffset, this.ammoBar.imageAtlasSize))
        }
    }, GS.UIComponents.WinScreen = function(vectorCanvas, assets, player) {
        this.cvs = vectorCanvas, this.assets = assets, this.player = player, this.fontSize = 40, this.rowHeight = 45, this.boxCornerRadius = 10, this.aiManager = player.grid.aiManager, this.mapName = "map name", this.hasNextMap = !1, this.monstersKilled = 0, this.maxMonsters = 0, this.itemsPickedUp = 0, this.maxItems = 0, this.secretsFound = 0, this.maxSecrets = 0, this.minutes = "00", this.seconds = "00", this.popup = {
            offset: new THREE.Vector2((-480), (-315)),
            pos: new THREE.Vector2(.5, .5),
            size: new THREE.Vector2(960, 630)
        }, this.textOffsetLeft = new THREE.Vector2((-30), (-247)), this.textOffsetRight = new THREE.Vector2(30, (-247)), this.textOffsetCenter = new THREE.Vector2(0, (-247)), this.visible = !1
    }, GS.UIComponents.WinScreen.prototype = {
        constructor: GS.UIComponents.WinScreen,
        init: function() {},
        update: function() {
            !this.visible && void 0 !== this.aiManager.script && this.aiManager.script.mapWon && (this.collectData(), this.visible = !0)
        },
        collectData: function() {
            var script = this.aiManager.script;
            this.mapName = script.mapName, this.hasNextMap = void 0 !== script.nextMap, this.monstersKilled = this.aiManager.monstersKilled, this.maxMonsters = this.aiManager.maxMonsters, this.itemsPickedUp = this.aiManager.itemsPickedUp, this.maxItems = this.aiManager.maxItems, this.secretsFound = script.secretsFound, this.maxSecrets = script.maxSecrets, this.minutes = GS.pad(this.aiManager.minutes, 2), this.seconds = GS.pad(this.aiManager.seconds, 2)
        },
        draw: function() {
            this.cvs.roundedBoxFill(this.popup.offset, this.popup.pos, this.popup.size, !0, this.boxCornerRadius, GS.UIColors.menuBackground), this.drawMessage('"' + this.mapName + '" complete', 0), this.drawField("monsters killed", this.monstersKilled + " / " + this.maxMonsters, 2), this.drawField("items picked up", this.itemsPickedUp + " / " + this.maxItems, 3), this.drawField("secrets found", this.secretsFound + " / " + this.maxSecrets, 4), this.drawField("time spent", this.minutes + ":" + this.seconds, 6), this.hasNextMap ? this.drawMessage("[ENTER] to continue to the next level", 11) : (this.drawMessage("congrats!", 10), this.drawMessage("this concludes the current release", 11))
        },
        drawField: function() {
            var left = new THREE.Vector2,
                right = new THREE.Vector2;
            return function(name, value, row) {
                left.copy(this.textOffsetLeft), left.y += row * this.rowHeight, right.copy(this.textOffsetRight), right.y += row * this.rowHeight, this.cvs.text(left, this.popup.pos, name, GS.UIColors.foreground, this.fontSize, "middle", "right", GS.UIFont), this.cvs.text(right, this.popup.pos, value, GS.UIColors.foreground, this.fontSize, "middle", "left", GS.UIFont)
            }
        }(),
        drawMessage: function() {
            var center = new THREE.Vector2;
            return function(message, row) {
                center.copy(this.textOffsetCenter), center.y += row * this.rowHeight, this.cvs.text(center, this.popup.pos, message, GS.UIColors.foreground, this.fontSize, "middle", "center", GS.UIFont)
            }
        }()
    }, GS.CollisionHelper = {
        gravity: new THREE.Vector3(0, (-1.5), 0),
        unitsPerMeter: 100,
        handleCollisionsSliding: function(oldPos, newPos, gravityFactor, ellipsoid, triangleIterator) {
            return this.handleCollisions(oldPos, newPos, gravityFactor, ellipsoid, triangleIterator, !1, !1)
        },
        handleCollisionsFirstHit: function(oldPos, newPos, gravityFactor, ellipsoid, triangleIterator) {
            return this.handleCollisions(oldPos, newPos, gravityFactor, ellipsoid, triangleIterator, !0, !1)
        },
        handleCollisions: function() {
            var p = {
                ellipsoidSpace: new THREE.Vector3,
                worldPosition: new THREE.Vector3,
                worldVelocity: new THREE.Vector3,
                lspPosition: new THREE.Vector3,
                lspVelocity: new THREE.Vector3,
                lspNormalizedVelocity: new THREE.Vector3,
                normal: new THREE.Vector3,
                foundCollision: !1,
                nearestDistance: 0,
                intersectionPoint: new THREE.Vector3,
                collisionRecursionDepth: 0,
                stopOnFirstHit: !1,
                gravityFactor: 0
            };
            return function(oldPos, newPos, gravityFactor, ellipsoid, triangleIterator, stopOnFirstHit, horizontalOnly) {
                p.ellipsoidSpace.copy(ellipsoid), p.worldPosition.copy(oldPos), p.worldVelocity.subVectors(newPos, oldPos), p.foundCollision = !1, p.nearestDistance = 0, p.collisionRecursionDepth = 0, p.stopOnFirstHit = stopOnFirstHit, p.gravityFactor = gravityFactor;
                var result = this.collisionSlide(p, triangleIterator);
                return newPos.copy(result.pos), result
            }
        }(),
        collisionSlide: function(p, triangleIterator) {
            p.lspVelocity.copy(p.worldVelocity).divide(p.ellipsoidSpace), p.lspPosition.copy(p.worldPosition).divide(p.ellipsoidSpace);
            var oldY = p.lspPosition.y;
            p.collisionRecursionDepth = 0;
            var finalPosition = this.collideWithWorld(p, triangleIterator),
                climbing = oldY < finalPosition.y;
            0 === p.gravityFactor || climbing || p.horizontalOnly || (p.lspVelocity.copy(this.gravity), p.lspVelocity.y *= p.gravityFactor, p.lspVelocity.divide(p.ellipsoidSpace), p.lspPosition.copy(finalPosition), p.collisionRecursionDepth = 0, finalPosition = this.collideWithWorld(p, triangleIterator)), finalPosition.multiply(p.ellipsoidSpace), p.horizontalOnly && (finalPosition.y = p.originalHeight);
            var result = {
                pos: finalPosition,
                climbing: climbing,
                foundCollision: p.foundCollision,
                gridObject: p.gridObject,
                normal: p.normal
            };
            return result
        },
        collideWithWorld: function() {
            var normal = new THREE.Vector3,
                aux = new THREE.Vector3,
                result = new THREE.Vector3,
                destinationPoint = new THREE.Vector3,
                newPosition = new THREE.Vector3,
                slidePlaneOrigin = new THREE.Vector3,
                slidePlaneNormal = new THREE.Vector3,
                newDestinationPoint = new THREE.Vector3,
                newVelocityVector = new THREE.Vector3,
                v0 = new THREE.Vector3,
                v1 = new THREE.Vector3,
                v2 = new THREE.Vector3;
            return function(p, triangleIterator) {
                var that = this,
                    unitScale = this.unitsPerMeter / 100,
                    veryCloseDistance = .005 * unitScale;
                if (p.collisionRecursionDepth > 5) return p.lspPosition;
                if (p.lspNormalizedVelocity.copy(p.lspVelocity).normalize(), p.foundCollision = !1, p.nearestDistance = 0, triangleIterator(function(gridObject, t0, t1, t2, triangleOffset) {
                        GAME.grid.totalSphereTriangleChecks++, v0.copy(t0).divide(p.ellipsoidSpace), v1.copy(t1).divide(p.ellipsoidSpace), v2.copy(t2).divide(p.ellipsoidSpace), aux.subVectors(v2, v0), normal.copy(v1).sub(v0).cross(aux).normalize(), that.sphereCollidingWithTriangle(gridObject, p, v0, v1, v2, normal)
                    }), !p.foundCollision) return result.copy(p.lspPosition).add(p.lspVelocity), result;
                if (destinationPoint.copy(p.lspPosition).add(p.lspVelocity), newPosition.copy(p.lspPosition), p.nearestDistance >= veryCloseDistance && (aux.copy(p.lspVelocity).normalize(), aux.multiplyScalar(p.nearestDistance - veryCloseDistance), newPosition.copy(p.lspPosition).add(aux), aux.normalize().multiplyScalar(veryCloseDistance), p.intersectionPoint.sub(aux)), p.stopOnFirstHit) return p.lspPosition.copy(newPosition), p.lspPosition;
                slidePlaneOrigin.copy(p.intersectionPoint), slidePlaneNormal.copy(newPosition).sub(p.intersectionPoint).normalize();
                var x = slidePlaneOrigin.x,
                    y = slidePlaneOrigin.y,
                    z = slidePlaneOrigin.z,
                    A = slidePlaneNormal.x,
                    B = slidePlaneNormal.y,
                    C = slidePlaneNormal.z,
                    D = -(A * x + B * y + C * z),
                    planeConstant = D,
                    signedDistFromDestPointToSlidingPlane = slidePlaneNormal.dot(destinationPoint) + planeConstant;
                return aux.copy(slidePlaneNormal).multiplyScalar(signedDistFromDestPointToSlidingPlane), newDestinationPoint.copy(destinationPoint).sub(aux), newVelocityVector.copy(newDestinationPoint).sub(p.intersectionPoint), newVelocityVector.length() < veryCloseDistance ? newPosition : (p.collisionRecursionDepth++, p.lspPosition.copy(newPosition), p.lspVelocity.copy(newVelocityVector), this.collideWithWorld(p, triangleIterator))
            }
        }(),
        sphereCollidingWithTriangle: function() {
            var velocity = new THREE.Vector3,
                position = new THREE.Vector3,
                aux = new THREE.Vector3,
                planeIntersectionPoint = new THREE.Vector3,
                collisionPoint = new THREE.Vector3,
                edge = new THREE.Vector3,
                spherePositionToVertex = new THREE.Vector3;
            return function(gridObject, p, v0, v1, v2, normal) {
                var facing = normal.dot(p.lspNormalizedVelocity);
                if (facing <= 0) {
                    velocity.copy(p.lspVelocity), position.copy(p.lspPosition);
                    var t0, t1, sphereInPlane = !1,
                        A = normal.x,
                        B = normal.y,
                        C = normal.z,
                        D = -(A * v0.x + B * v0.y + C * v0.z),
                        planeConstant = D,
                        signedDistFromPositionToTriPlane = position.dot(normal) + planeConstant,
                        planeNormalDotVelocity = normal.dot(velocity);
                    if (0 === planeNormalDotVelocity) {
                        if (Math.abs(signedDistFromPositionToTriPlane) >= 1) return !1;
                        sphereInPlane = !0
                    } else {
                        if (t0 = (1 - signedDistFromPositionToTriPlane) / planeNormalDotVelocity, t1 = (-1 - signedDistFromPositionToTriPlane) / planeNormalDotVelocity, t0 > t1) {
                            var temp = t0;
                            t0 = t1, t1 = temp
                        }
                        if (t0 > 1 || t1 < 0) return !1;
                        t0 < 0 && (t0 = 0), t1 > 1 && (t1 = 1)
                    }
                    var collidingWithTri = !1,
                        t = 1;
                    if (sphereInPlane || (aux.copy(velocity).multiplyScalar(t0), planeIntersectionPoint.copy(position).add(aux).sub(normal), this.checkPointInTriangle(planeIntersectionPoint, v0, v1, v2) && (collidingWithTri = !0, t = t0, collisionPoint.copy(planeIntersectionPoint))), !collidingWithTri) {
                        var a, b, c, velocityLengthSquared = velocity.lengthSq();
                        a = velocityLengthSquared;
                        var result = {};
                        aux.copy(position).sub(v0), b = 2 * velocity.dot(aux), aux.copy(v0).sub(position), c = aux.length(), c = c * c - 1, this.getLowestRoot(a, b, c, t, result) && (t = result.root, collidingWithTri = !0, collisionPoint.copy(v0)), aux.copy(position).sub(v1), b = 2 * velocity.dot(aux), aux.copy(v1).sub(position), c = aux.length(), c = c * c - 1, this.getLowestRoot(a, b, c, t, result) && (t = result.root, collidingWithTri = !0, collisionPoint.copy(v1)), aux.copy(position).sub(v2), b = 2 * velocity.dot(aux), aux.copy(v2).sub(position), c = aux.length(), c = c * c - 1, this.getLowestRoot(a, b, c, t, result) && (t = result.root, collidingWithTri = !0, collisionPoint.copy(v2)), edge.copy(v1).sub(v0), spherePositionToVertex.copy(v0).sub(position);
                        var edgeLengthSquared = edge.lengthSq(),
                            edgeDotVelocity = edge.dot(velocity),
                            edgeDotSpherePositionToVertex = edge.dot(spherePositionToVertex),
                            spherePositionToVertexLengthSquared = spherePositionToVertex.lengthSq();
                        if (a = edgeLengthSquared * -velocityLengthSquared + edgeDotVelocity * edgeDotVelocity, b = 2 * edgeLengthSquared * velocity.dot(spherePositionToVertex) - 2 * edgeDotVelocity * edgeDotSpherePositionToVertex, c = edgeLengthSquared * (1 - spherePositionToVertexLengthSquared) + edgeDotSpherePositionToVertex * edgeDotSpherePositionToVertex, this.getLowestRoot(a, b, c, t, result)) {
                            var f = (edgeDotVelocity * result.root - edgeDotSpherePositionToVertex) / edgeLengthSquared;
                            f >= 0 && f <= 1 && (t = result.root, collidingWithTri = !0, edge.multiplyScalar(f), collisionPoint.copy(v0).add(edge))
                        }
                        if (edge.copy(v2).sub(v1), spherePositionToVertex.copy(v1).sub(position), edgeLengthSquared = edge.lengthSq(), edgeDotVelocity = edge.dot(velocity), edgeDotSpherePositionToVertex = edge.dot(spherePositionToVertex), spherePositionToVertexLengthSquared = spherePositionToVertex.lengthSq(), a = edgeLengthSquared * -velocityLengthSquared + edgeDotVelocity * edgeDotVelocity, b = 2 * edgeLengthSquared * velocity.dot(spherePositionToVertex) - 2 * edgeDotVelocity * edgeDotSpherePositionToVertex, c = edgeLengthSquared * (1 - spherePositionToVertexLengthSquared) + edgeDotSpherePositionToVertex * edgeDotSpherePositionToVertex, this.getLowestRoot(a, b, c, t, result)) {
                            var f = (edgeDotVelocity * result.root - edgeDotSpherePositionToVertex) / edgeLengthSquared;
                            f >= 0 && f <= 1 && (t = result.root, collidingWithTri = !0, edge.multiplyScalar(f), collisionPoint.copy(v1).add(edge))
                        }
                        if (edge.copy(v0).sub(v2), spherePositionToVertex.copy(v2).sub(position), edgeLengthSquared = edge.lengthSq(), edgeDotVelocity = edge.dot(velocity), edgeDotSpherePositionToVertex = edge.dot(spherePositionToVertex), spherePositionToVertexLengthSquared = spherePositionToVertex.lengthSq(), a = edgeLengthSquared * -velocityLengthSquared + edgeDotVelocity * edgeDotVelocity, b = 2 * edgeLengthSquared * velocity.dot(spherePositionToVertex) - 2 * edgeDotVelocity * edgeDotSpherePositionToVertex, c = edgeLengthSquared * (1 - spherePositionToVertexLengthSquared) + edgeDotSpherePositionToVertex * edgeDotSpherePositionToVertex, this.getLowestRoot(a, b, c, t, result)) {
                            var f = (edgeDotVelocity * result.root - edgeDotSpherePositionToVertex) / edgeLengthSquared;
                            f >= 0 && f <= 1 && (t = result.root, collidingWithTri = !0, edge.multiplyScalar(f), collisionPoint.copy(v2).add(edge))
                        }
                    }
                    if (collidingWithTri) {
                        var distToCollision = t * velocity.length();
                        if (!p.foundCollision || distToCollision < p.nearestDistance) return p.nearestDistance = distToCollision, p.intersectionPoint.copy(collisionPoint), p.foundCollision = !0, p.normal.copy(normal), p.gridObject = gridObject, !0
                    }
                }
                return !1
            }
        }(),
        checkPointInTriangle: function() {
            var cp1 = new THREE.Vector3,
                cp2 = new THREE.Vector3,
                aux = new THREE.Vector3,
                aux2 = new THREE.Vector3;
            return function(point, v1, v2, v3) {
                if (aux.copy(v3).sub(v2), aux2.copy(point).sub(v2), cp1.crossVectors(aux, aux2), aux.copy(v3).sub(v2), aux2.copy(v1).sub(v2), cp2.crossVectors(aux, aux2), cp1.dot(cp2) >= 0 && (aux.copy(v3).sub(v1), aux2.copy(point).sub(v1), cp1.crossVectors(aux, aux2), aux.copy(v3).sub(v1), aux2.copy(v2).sub(v1), cp2.crossVectors(aux, aux2), cp1.dot(cp2) >= 0 && (aux.copy(v2).sub(v1), aux2.copy(point).sub(v1), cp1.crossVectors(aux, aux2), aux.copy(v2).sub(v1), aux2.copy(v3).sub(v1), cp2.crossVectors(aux, aux2), cp1.dot(cp2) >= 0))) return !0
            }
        }(),
        getLowestRoot: function(a, b, c, maxR, result) {
            var determinant = b * b - 4 * a * c;
            if (determinant < 0) return !1;
            var sqrtD = Math.sqrt(determinant),
                r1 = (-b - sqrtD) / (2 * a),
                r2 = (-b + sqrtD) / (2 * a);
            if (r1 > r2) {
                var temp = r2;
                r2 = r1, r1 = temp
            }
            return r1 > 0 && r1 < maxR ? (result.root = r1, !0) : r2 > 0 && r2 < maxR && (result.root = r2, !0)
        }
    }, GS.HitscanHelper = {
        unitLength: 64,
        steps: 5,
        spread: function(weapon, xAngle, yAngle, callback) {
            for (var angleForX = weapon.spread.angleOffset + 20 * (Math.abs(yAngle - 90) / 90) * (Math.abs(yAngle - 90) / 90), angleForY = weapon.spread.angleOffset, i = 0; i < weapon.spread.shots; i++) {
                var xAngleOffset = xAngle + Math.random() * angleForX * 2 - angleForX,
                    yAngleOffset = yAngle + Math.random() * angleForY * 2 - angleForY,
                    x = Math.sin(Math.PI / 180 * yAngleOffset) * Math.cos(Math.PI / 180 * xAngleOffset),
                    y = Math.cos(Math.PI / 180 * yAngleOffset),
                    z = Math.sin(Math.PI / 180 * yAngleOffset) * Math.sin(Math.PI / 180 * xAngleOffset),
                    dir = new THREE.Vector3(x, y, z);
                dir.normalize(), callback(dir)
            }
        },
        getIntersection: function() {
            var newPos = new THREE.Vector3,
                step = new THREE.Vector3,
                endPoint = new THREE.Vector3,
                points = [new THREE.Vector2, new THREE.Vector2],
                ray = new THREE.Ray;
            new THREE.Vector3;
            return function(pos, dir, grid, typesEnvironment, typesEntity, steps, except) {
                steps = steps || this.steps, newPos.copy(pos), step.copy(dir).multiplyScalar(this.unitLength);
                var result = {
                    type: GS.CollisionTypes.None,
                    pos: new THREE.Vector3,
                    gridObject: null,
                    distance: 1 / 0,
                    normal: new THREE.Vector3
                };
                ray.set(pos, dir);
                for (var i = 0; i < steps; i++) {
                    endPoint.copy(newPos).add(step), newPos.toVector2(points[0]), endPoint.toVector2(points[1]);
                    var gridLocation = grid.getGridLocationFromPoints(points);
                    if (void 0 === gridLocation) break;
                    if (this.checkEnvironmentIntersection(ray, grid, gridLocation, typesEnvironment, result, except), this.checkEntityIntersection(ray, grid, gridLocation, typesEntity, result, except), result.type !== GS.CollisionTypes.None) break;
                    newPos.add(step)
                }
                return result
            }
        }(),
        checkEnvironmentIntersection: function() {
            var aux = new THREE.Vector3,
                point = new THREE.Vector3;
            return function(ray, grid, gridLocation, types, result, except) {
                var triangleIterator = grid.getTriangleIterator(gridLocation, types);
                triangleIterator(function(gridObject, v0, v1, v2) {
                    if (gridObject !== except && null !== ray.intersectTriangle(v0, v1, v2, !0, point)) {
                        var dist = point.distanceToSquared(ray.origin);
                        dist < result.distance && (result.type = GS.CollisionTypes.Environment, aux.subVectors(v2, v0), result.normal.copy(v1).sub(v0).cross(aux).normalize(), result.pos.copy(point).add(result.normal), result.distance = dist, result.gridObject = gridObject)
                    }
                })
            }
        }(),
        checkEntityIntersection: function() {
            var point = new THREE.Vector3;
            return function(ray, grid, gridLocation, types, result, except) {
                var cells = grid.getCellsFromGridLocation(gridLocation);
                grid.forEachUniqueGridObjectInCells(cells, types, function(gridObject) {
                    if (!gridObject.dead && gridObject !== except && null !== ray.intersectBox(gridObject.view.collisionData.boundingBox, point)) {
                        var dist = point.distanceToSquared(ray.origin);
                        dist < result.distance && (result.type = GS.CollisionTypes.Entity, result.pos.copy(point), result.distance = dist, result.gridObject = gridObject)
                    }
                })
            }
        }()
    }, GS.RegionHelper = function() {
        this.material = new GS.MeshVertexColorMaterial
    }, GS.RegionHelper.prototype = {
        constructor: GS.RegionHelper,
        getRegions: function(sectors, sectorLinks) {
            var result = this.getSectorGraph(sectors, sectorLinks);
            return result.regions = this.constructRegions(result.sectorDict, result.sectorGraph), result
        },
        getSectorGraph: function(sectors, sectorLinks) {
            for (var sectorGraph = new GS.Graph(function(a, b) {
                    return a.id == b.id
                }), sectorDict = {}, i = 0; i < sectorLinks.length; i += 2) {
                var s1 = this.getSectorById(sectors, sectorLinks[i]),
                    s2 = this.getSectorById(sectors, sectorLinks[i + 1]);
                sectorDict[s1.id] = {
                    index: -1,
                    sector: s1,
                    center: GS.PolygonHelper.getSectorCentroid(s1)
                }, sectorDict[s2.id] = {
                    index: -1,
                    sector: s2,
                    center: GS.PolygonHelper.getSectorCentroid(s2)
                }, sectorGraph.addEdge(s1, s2)
            }
            for (var keys = Object.keys(sectorDict), i = 0; i < keys.length; i++) {
                var obj = sectorDict[keys[i]];
                obj.index = sectorGraph.getVertexIndex(obj.sector)
            }
            return sectorGraph.computeVertexNeighborSets(), {
                sectorGraph: sectorGraph,
                sectorDict: sectorDict
            }
        },
        constructRegions: function(sectorDict, sectorGraph) {
            this.regionIdCount = 0;
            var toVisit = [],
                doorCount = 0,
                seeds = {};
            for (var i in sectorDict)
                if (sectorDict[i].sector.door) {
                    for (var neighbors = sectorGraph.neighborSets[sectorDict[i].index].elements, j = 0; j < neighbors.length; j++) {
                        var id = neighbors[j].id;
                        toVisit.push({
                            id: id,
                            seed: id
                        }), seeds[id] = {
                            doorIds: {},
                            sectorIds: {}
                        }
                    }
                    doorCount++
                } var regions = [];
            if (doorCount > 0) {
                for (var visited = {}; toVisit.length > 0;) {
                    var current = toVisit.pop(),
                        id = current.id,
                        seedId = current.seed;
                    if (sectorDict[id].sector.door && (seeds[seedId].doorIds[id] = !0), !visited[id] && (visited[id] = !0, seeds[seedId].sectorIds[id] = !0, !sectorDict[id].sector.door))
                        for (var neighbors = sectorGraph.neighborSets[sectorDict[id].index].elements, i = 0; i < neighbors.length; i++) {
                            var info = sectorDict[neighbors[i].id],
                                id = info.sector.id;
                            toVisit.push({
                                id: id,
                                seed: seedId
                            })
                        }
                }
                for (var i in seeds) {
                    var sectorIds = seeds[i].sectorIds;
                    Object.keys(sectorIds).length > 0 && regions.push(this.getNewRegion(seeds[i].doorIds, sectorIds))
                }
                for (var i = 0; i < regions.length; i++) {
                    var region = regions[i];
                    region.linkedRegions = [];
                    for (var j in region.doorIds)
                        for (var k = 0; k < regions.length; k++)
                            if (k !== i) {
                                var region2 = regions[k];
                                for (var e in region2.doorIds)
                                    if (e === j) {
                                        region.linkedRegions.push({
                                            doorId: e,
                                            region: region2
                                        });
                                        break
                                    }
                            }
                }
            } else {
                var region = this.getNewRegion();
                for (var i in this.sectorDict) region.sectorIds[i] = !0;
                regions.push(region)
            }
            return regions
        },
        getNewRegion: function(doorIds, sectorIds) {
            var region = {
                    id: this.regionIdCount,
                    doorIds: doorIds || {},
                    sectorIds: sectorIds || {},
                    monsters: []
                },
                mesh = new THREE.Mesh(new THREE.Geometry, this.material);
            return mesh.matrixAutoUpdate = !1, region.mesh = mesh, this.regionIdCount++, region
        },
        getSectorById: function(sectors, id) {
            for (var i = 0; i < sectors.length; i++)
                if (sectors[i].id == id) return sectors[i];
            GAME.handleFatalError("sector " + id + " not found")
        }
    }, GS.BrightnessFilterShader = {
        uniforms: {
            tDiffuse: {
                type: "t",
                value: null
            }
        },
        vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);", "}"].join("\n"),
        fragmentShader: ["uniform sampler2D tDiffuse;", "varying vec2 vUv;", "void main() {", "vec4 texel = texture2D(tDiffuse, vUv);", "float lum = dot(texel, vec4(0.299, 0.587, 0.114, 0.0));", "lum = step(0.9999, lum);", "gl_FragColor = vec4(texel.xyz * lum, 1.0);", "}"].join("\n")
    }, GS.ColorShader = {
        uniforms: {
            tDiffuse: {
                type: "t",
                value: null
            },
            color: {
                type: "c",
                value: new THREE.Color(16777215)
            }
        },
        vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);", "}"].join("\n"),
        fragmentShader: ["uniform vec3 color;", "uniform sampler2D tDiffuse;", "varying vec2 vUv;", "void main() {", "vec4 texel = texture2D(tDiffuse, vUv);", "gl_FragColor = vec4(texel.xyz + color.xyz * 0.75, 1.0);", "}"].join("\n")
    }, GS.GlowShader = {
        uniforms: {
            tDiffuse: {
                type: "t",
                value: null
            },
            tGlow: {
                type: "t",
                value: null
            },
            intensity: {
                type: "f",
                value: 1
            }
        },
        vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);", "}"].join("\n"),
        fragmentShader: ["uniform float intensity;", "uniform sampler2D tDiffuse;", "uniform sampler2D tGlow;", "varying vec2 vUv;", "void main() {", "vec4 texel = texture2D(tDiffuse, vUv);", "vec4 glow = texture2D(tGlow, vUv);", "gl_FragColor = vec4(texel.xyz + glow.xyz * intensity, 1.0);", "}"].join("\n")
    }, GS.MeshPhongGlowMaterial = function(map, glow, normal, emissive, glowIntensity) {
        this.shader = GS.PhongGlowShader, this.uniforms = THREE.UniformsUtils.clone(this.shader.uniforms), this.uniforms.map.value = map, this.uniforms.glowMap.value = glow, this.uniforms.normalMap.value = normal, this.uniforms.emissive.value = new THREE.Color(emissive || 0), this.uniforms.glowIntensity.value = void 0 !== glowIntensity ? glowIntensity : 1, THREE.ShaderMaterial.call(this, {
            uniforms: this.uniforms,
            fragmentShader: this.shader.fragmentShader,
            vertexShader: this.shader.vertexShader,
            lights: !0
        }), this.map = !0, this.normalMap = void 0 !== normal && null !== normal
    }, GS.MeshPhongGlowMaterial.prototype = GS.inherit(THREE.ShaderMaterial, {
        constructor: GS.MeshPhongGlowMaterial,
        clone: function() {
            var material = new GS.MeshPhongGlowMaterial(this.uniforms.map.value, this.uniforms.glowMap.value, this.uniforms.normalMap.value, this.uniforms.emissive.value, this.uniforms.glowIntensity.value);
            return material
        },
        get emissive() {
            return this.uniforms.emissive.value
        },
        set glowIntensity(value) {
            this.uniforms.glowIntensity.value = value
        },
        get glowIntensity() {
            return this.uniforms.glowIntensity.value
        }
    }), GS.MeshVertexColorMaterial = function() {
        this.shader = GS.VertexColorShader, this.uniforms = THREE.UniformsUtils.clone(this.shader.uniforms), THREE.ShaderMaterial.call(this, {
            uniforms: this.uniforms,
            attributes: {
                emissive: {
                    type: "c",
                    value: []
                }
            },
            fragmentShader: this.shader.fragmentShader,
            vertexShader: this.shader.vertexShader,
            vertexColors: THREE.FaceColors,
            lights: !0
        })
    }, GS.MeshVertexColorMaterial.prototype = GS.inherit(THREE.ShaderMaterial, {
        constructor: GS.MeshVertexColorMaterial,
        clone: function() {
            var material = new GS.MeshVertexColorMaterial;
            return material
        }
    }), GS.NoiseShader = {
        uniforms: {
            tDiffuse: {
                type: "t",
                value: null
            },
            tNoise: {
                type: "t",
                value: null
            },
            ratio: {
                type: "v2",
                value: new THREE.Vector2(1, 1)
            },
            intensity: {
                type: "f",
                value: .05
            }
        },
        vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);", "}"].join("\n"),
        fragmentShader: ["uniform sampler2D tDiffuse;", "uniform sampler2D tNoise;", "uniform vec2 ratio;", "uniform float intensity;", "varying vec2 vUv;", "void main() {", "vec4 cDiffuse = texture2D(tDiffuse, vUv);", "vec4 cNoise = texture2D(tNoise, vUv * ratio);", "gl_FragColor = vec4(cDiffuse.xyz + cNoise.xyz * intensity - intensity * 0.5, 1.0);", "}"].join("\n")
    }, GS.PhongGlowShader = {
        uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.common, THREE.UniformsLib.normalmap, THREE.UniformsLib.fog, THREE.UniformsLib.lights, {
            ambient: {
                type: "c",
                value: new THREE.Color(16777215)
            },
            emissive: {
                type: "c",
                value: new THREE.Color(0)
            },
            specular: {
                type: "c",
                value: new THREE.Color(1118481)
            },
            shininess: {
                type: "f",
                value: 30
            },
            wrapRGB: {
                type: "v3",
                value: new THREE.Vector3(1, 1, 1)
            },
            glowMap: {
                type: "t",
                value: null
            },
            glowIntensity: {
                type: "f",
                value: 1
            }
        }]),
        vertexShader: ["#define PHONG", "varying vec3 vViewPosition;", "varying vec3 vNormal;", THREE.ShaderChunk.map_pars_vertex, THREE.ShaderChunk.lightmap_pars_vertex, THREE.ShaderChunk.envmap_pars_vertex, THREE.ShaderChunk.lights_phong_pars_vertex, THREE.ShaderChunk.color_pars_vertex, THREE.ShaderChunk.logdepthbuf_pars_vertex, "void main() {", THREE.ShaderChunk.map_vertex, THREE.ShaderChunk.lightmap_vertex, THREE.ShaderChunk.color_vertex, THREE.ShaderChunk.defaultnormal_vertex, "\tvNormal = normalize( transformedNormal );", THREE.ShaderChunk.default_vertex, THREE.ShaderChunk.logdepthbuf_vertex, "\tvViewPosition = -mvPosition.xyz;", THREE.ShaderChunk.worldpos_vertex, THREE.ShaderChunk.envmap_vertex, THREE.ShaderChunk.lights_phong_vertex, "}"].join("\n"),
        fragmentShader: ["uniform vec3 diffuse;", "uniform float opacity;", "uniform vec3 ambient;", "uniform vec3 emissive;", "uniform vec3 specular;", "uniform float shininess;", "uniform sampler2D glowMap;", "uniform float glowIntensity;", THREE.ShaderChunk.color_pars_fragment, THREE.ShaderChunk.map_pars_fragment, THREE.ShaderChunk.lightmap_pars_fragment, THREE.ShaderChunk.envmap_pars_fragment, THREE.ShaderChunk.fog_pars_fragment, THREE.ShaderChunk.lights_phong_pars_fragment, THREE.ShaderChunk.normalmap_pars_fragment, THREE.ShaderChunk.specularmap_pars_fragment, THREE.ShaderChunk.logdepthbuf_pars_fragment, "void main() {", "\tgl_FragColor = vec4( vec3( 1.0 ), opacity );", THREE.ShaderChunk.logdepthbuf_fragment, THREE.ShaderChunk.map_fragment, THREE.ShaderChunk.alphatest_fragment, THREE.ShaderChunk.specularmap_fragment, THREE.ShaderChunk.lights_phong_fragment, "\tfloat glow = texture2D(glowMap, vUv).x * glowIntensity * 2.0;", "\tgl_FragColor.xyz = texelColor.xyz * clamp(emissive + totalDiffuse + ambientLightColor * ambient + glow, 0.0, 2.0) + totalSpecular;", THREE.ShaderChunk.lightmap_fragment, THREE.ShaderChunk.color_fragment, THREE.ShaderChunk.envmap_fragment, THREE.ShaderChunk.linear_to_gamma_fragment, THREE.ShaderChunk.fog_fragment, "}"].join("\n")
    }, GS.RandomNoiseShader = {
        uniforms: {
            tDiffuse: {
                type: "t",
                value: null
            },
            intensity: {
                type: "f",
                value: .05
            },
            seed: {
                type: "v2",
                value: new THREE.Vector2(Math.random(), Math.random())
            }
        },
        vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);", "}"].join("\n"),
        fragmentShader: ["uniform sampler2D tDiffuse;", "uniform float intensity;", "uniform vec2 seed;", "varying vec2 vUv;", "highp float rand(vec2 co)", "{", "highp float a = 12.9898;", "highp float b = 78.233;", "highp float c = 43758.5453;", "highp float dt = dot(co.xy, vec2(a,b));", "highp float sn = mod(dt, 3.14);", "return fract(sin(sn) * c);", "}", "void main() {", "vec4 cDiffuse = texture2D(tDiffuse, vUv);", "gl_FragColor = vec4(cDiffuse.xyz - rand(vUv + seed) * intensity, 1.0);", "}"].join("\n")
    }, GS.VertexColorShader = {
        uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.common, THREE.UniformsLib.normalmap, THREE.UniformsLib.fog, THREE.UniformsLib.lights, {
            ambient: {
                type: "c",
                value: new THREE.Color(16777215)
            },
            specular: {
                type: "c",
                value: new THREE.Color(1118481)
            },
            shininess: {
                type: "f",
                value: 30
            },
            wrapRGB: {
                type: "v3",
                value: new THREE.Vector3(1, 1, 1)
            }
        }]),
        vertexShader: ["#define PHONG", "varying vec3 vViewPosition;", "varying vec3 vNormal;", THREE.ShaderChunk.lights_phong_pars_vertex, "#ifdef USE_COLOR", "attribute vec3 emissive;", "varying vec3 vColor;", "varying vec3 vEmissive;", "#endif", "void main() {", "#ifdef USE_COLOR", "#ifdef GAMMA_INPUT", "vColor = color * color;", "#else", "vColor = color;", "#endif", "vEmissive = emissive;", "#endif", THREE.ShaderChunk.defaultnormal_vertex, "vNormal = normalize( transformedNormal );", THREE.ShaderChunk.default_vertex, "vViewPosition = -mvPosition.xyz;", THREE.ShaderChunk.worldpos_vertex, THREE.ShaderChunk.lights_phong_vertex, "}"].join("\n"),
        fragmentShader: ["#define PHONG", "uniform vec3 diffuse;", "uniform float opacity;", "uniform vec3 ambient;", "uniform vec3 specular;", "uniform float shininess;", "#ifdef USE_COLOR", "varying vec3 vColor;", "varying vec3 vEmissive;", "#endif", THREE.ShaderChunk.fog_pars_fragment, THREE.ShaderChunk.lights_phong_pars_fragment, THREE.ShaderChunk.normalmap_pars_fragment, THREE.ShaderChunk.specularmap_pars_fragment, "void main() {", "gl_FragColor = vec4( vec3( 1.0 ), opacity );", THREE.ShaderChunk.specularmap_fragment, "vec3 emissive = vEmissive;", THREE.ShaderChunk.lights_phong_fragment, THREE.ShaderChunk.color_fragment, THREE.ShaderChunk.linear_to_gamma_fragment, THREE.ShaderChunk.fog_fragment, "}"].join("\n")
    }, GS.AssetTypes = {
        Texture: 0,
        Mesh: 1,
        Sound: 2,
        CubeTexture: 3,
        UIWidget: 4,
        Map: 5,
        Script: 6,
        MusicTrack: 7
    }, GS.TextureTypes = {
        Map: 0,
        TVScreen: 1,
        Entity: 2
    }, GS.CubeTextureExtension = ".jpg", GS.CubeTextureNames = ["left", "right", "top", "bottom", "front", "back"], GS.CustomFontFile = "capsuula.woff", GS.Assets = {}, GS.Assets[GS.AssetTypes.Texture] = {
        cyan_wall: {
            filename: "cyan_wall.png",
            type: GS.TextureTypes.Map
        },
        red_wall: {
            filename: "red_wall.png",
            type: GS.TextureTypes.Map
        },
        blue_metal: {
            filename: "blue_metal.png",
            type: GS.TextureTypes.Map
        },
        white: {
            filename: "white.png",
            type: GS.TextureTypes.Map
        },
        wall: {
            filename: "wall.png",
            type: GS.TextureTypes.Map
        },
        metal: {
            filename: "metal.png",
            type: GS.TextureTypes.Map
        },
        light: {
            filename: "light.png",
            type: GS.TextureTypes.Map
        },
        red: {
            filename: "red.png",
            type: GS.TextureTypes.Map
        },
        blue: {
            filename: "blue.png",
            type: GS.TextureTypes.Map
        },
        cyan: {
            filename: "cyan.png",
            type: GS.TextureTypes.Map
        },
        brown: {
            filename: "brown.png",
            type: GS.TextureTypes.Map
        },
        exit: {
            filename: "exit.png",
            type: GS.TextureTypes.TVScreen,
            showInMapEditor: !0
        },
        switch_off: {
            filename: "switch_off.png",
            type: GS.TextureTypes.TVScreen
        },
        switch_on: {
            filename: "switch_on.png",
            type: GS.TextureTypes.TVScreen
        },
        ammo: {
            filename: "ammo.png",
            type: GS.TextureTypes.Entity
        },
        ammo_glow: {
            filename: "ammo_glow.png",
            type: GS.TextureTypes.Entity
        },
        medkit: {
            filename: "medkit.png",
            type: GS.TextureTypes.Entity
        },
        medkit_glow: {
            filename: "medkit_glow.png",
            type: GS.TextureTypes.Entity
        },
        pistol: {
            filename: "pistol.png",
            type: GS.TextureTypes.Entity
        },
        pistol_glow: {
            filename: "pistol_glow.png",
            type: GS.TextureTypes.Entity
        },
        double_shotgun: {
            filename: "double_shotgun.png",
            type: GS.TextureTypes.Entity
        },
        double_shotgun_glow: {
            filename: "double_shotgun_glow.png",
            type: GS.TextureTypes.Entity
        },
        hyper_blaster: {
            filename: "hyper_blaster.png",
            type: GS.TextureTypes.Entity
        },
        hyper_blaster_glow: {
            filename: "hyper_blaster_glow.png",
            type: GS.TextureTypes.Entity
        },
        nom: {
            filename: "nom.png",
            type: GS.TextureTypes.Entity
        },
        nom_glow: {
            filename: "nom_glow.png",
            type: GS.TextureTypes.Entity
        },
        eye: {
            filename: "eye.png",
            type: GS.TextureTypes.Entity
        },
        eye_glow: {
            filename: "eye_glow.png",
            type: GS.TextureTypes.Entity
        }
    }, GS.Assets[GS.AssetTypes.CubeTexture] = {
        skybox1: {
            filename: "skybox1"
        }
    }, GS.Assets[GS.AssetTypes.UIWidget] = {
        hud: {
            filename: "hud.png"
        },
        logo: {
            filename: "logo.png"
        },
        menu_back: {
            filename: "menu_back.png"
        },
        thumb_airstrip1: {
            filename: "thumb_airstrip1.png"
        },
        thumb_drencrom: {
            filename: "thumb_drencrom.png"
        },
        thumb_sacrosanct: {
            filename: "thumb_sacrosanct.png"
        }
    }, GS.Assets[GS.AssetTypes.Mesh] = {
        ammo: {
            filename: "ammo.js"
        },
        medkit: {
            filename: "medkit.js"
        },
        pistol: {
            filename: "pistol.js"
        },
        double_shotgun: {
            filename: "double_shotgun.js"
        },
        hyper_blaster: {
            filename: "hyper_blaster.js"
        },
        nom_walk0: {
            filename: "nom_walk0.js"
        },
        nom_walk1: {
            filename: "nom_walk1.js"
        },
        nom_walk2: {
            filename: "nom_walk2.js"
        },
        nom_walk3: {
            filename: "nom_walk3.js"
        },
        nom_walk4: {
            filename: "nom_walk4.js"
        },
        nom_walk5: {
            filename: "nom_walk5.js"
        },
        nom_death0: {
            filename: "nom_death0.js"
        },
        nom_death1: {
            filename: "nom_death1.js"
        },
        nom_death2: {
            filename: "nom_death2.js"
        },
        nom_death3: {
            filename: "nom_death3.js"
        },
        eye_walk0: {
            filename: "eye_walk0.js"
        },
        eye_walk1: {
            filename: "eye_walk1.js"
        },
        eye_walk2: {
            filename: "eye_walk2.js"
        },
        eye_walk3: {
            filename: "eye_walk3.js"
        },
        eye_death0: {
            filename: "eye_death0.js"
        },
        eye_death1: {
            filename: "eye_death1.js"
        },
        eye_death2: {
            filename: "eye_death2.js"
        },
        eye_death3: {
            filename: "eye_death3.js"
        },
        eye_attack0: {
            filename: "eye_attack0.js"
        },
        eye_attack1: {
            filename: "eye_attack1.js"
        }
    }, GS.Assets[GS.AssetTypes.Sound] = {
        door_close: {
            filename: "door_close.ogg",
            allowMultipleAtOnce: !0
        },
        door_open: {
            filename: "door_open.ogg",
            allowMultipleAtOnce: !0
        },
        elevator_move: {
            filename: "elevator_move.ogg",
            allowMultipleAtOnce: !0
        },
        elevator_stop: {
            filename: "elevator_stop.ogg",
            allowMultipleAtOnce: !0
        },
        hyper_blaster_fire: {
            filename: "hyper_blaster_fire.ogg",
            allowMultipleAtOnce: !0
        },
        hyper_blaster_hit: {
            filename: "hyper_blaster_hit.ogg",
            allowMultipleAtOnce: !0
        },
        monster_pain: {
            filename: "monster_pain.ogg",
            allowMultipleAtOnce: !1
        },
        monster_roar: {
            filename: "monster_roar.ogg",
            allowMultipleAtOnce: !0
        },
        monster_bite: {
            filename: "monster_bite.ogg",
            allowMultipleAtOnce: !0
        },
        monster_death: {
            filename: "monster_death.ogg",
            allowMultipleAtOnce: !0
        },
        eye_charging: {
            filename: "eye_charging.ogg",
            allowMultipleAtOnce: !0
        },
        pickup_ammo: {
            filename: "pickup_ammo.ogg",
            allowMultipleAtOnce: !0
        },
        pickup_item: {
            filename: "pickup_item.ogg",
            allowMultipleAtOnce: !0
        },
        pickup_weapon: {
            filename: "pickup_weapon.ogg",
            allowMultipleAtOnce: !0
        },
        shotgun_fire: {
            filename: "shotgun_fire.ogg",
            allowMultipleAtOnce: !0
        },
        player_death: {
            filename: "player_death.ogg",
            allowMultipleAtOnce: !0
        },
        switch_on: {
            filename: "switch_on.ogg",
            allowMultipleAtOnce: !0
        },
        none: {
            filename: "none.ogg",
            allowMultipleAtOnce: !0
        }
    }, GS.Assets[GS.AssetTypes.MusicTrack] = {
        simple_action_beat: {
            filename: "simple_action_beat.ogg"
        },
        tower_defense_theme: {
            filename: "tower_defense_theme.ogg"
        },
        angry_robot_3: {
            filename: "angry_robot_3.ogg"
        }
    }, GS.Assets[GS.AssetTypes.Map] = {
        testMap: {
            filename: ""
        },
        airstrip1: {
            filename: "airstrip1.js"
        },
        drencrom: {
            filename: "drencrom.js"
        },
        sacrosanct: {
            filename: "sacrosanct.js"
        }
    }, GS.Assets[GS.AssetTypes.Script] = {
        airstrip1: {
            filename: "airstrip1.js"
        },
        drencrom: {
            filename: "drencrom.js"
        },
        sacrosanct: {
            filename: "sacrosanct.js"
        }
    }, GS.MonsterAttackTypes = {
        Melee: 0,
        Ranged: 1
    }, GS.Monsters = {
        nom: {
            size: new THREE.Vector3(7.2, 8, 7.2),
            scale: new THREE.Vector3(.9, .9, .9),
            offset: new THREE.Vector3(3.6, 8.03, 3.6),
            speed: .75,
            rotationOffset: Math.PI,
            painChance: .25,
            attackType: GS.MonsterAttackTypes.Melee,
            maxHealth: 160,
            meleeDamage: 10,
            meleeAttackMaxCooldown: GS.msToFrames(500),
            meleeRange: 15,
            walkDelay: 5,
            bloodColor: (new THREE.Color).setRGB(1, 0, 0).getHex(),
            roarSound: "monster_roar",
            meleeAttackSound: "monster_bite",
            painSound: "monster_pain",
            deathSound: "monster_death"
        },
        eye: {
            size: new THREE.Vector3(5.6, 8, 5.6),
            scale: new THREE.Vector3(.5, .5, .5),
            offset: new THREE.Vector3(2.8, 8.03, 2.8),
            speed: .25,
            rotationOffset: Math.PI,
            painChance: .75,
            attackType: GS.MonsterAttackTypes.Ranged,
            maxHealth: 50,
            meleeRange: 15,
            rangedAttackMaxCooldown: GS.msToFrames(1500),
            rangedAttackCooldownRandomModifier: GS.msToFrames(1e3),
            rangedAttackRange: 200,
            rangedAttackProjectile: "eye_bolt",
            rangedAttackChargeMaxCooldown: GS.msToFrames(500),
            preferredMaxDistance: 100,
            walkDelay: 15,
            bloodColor: (new THREE.Color).setRGB(0, 1, 1).getHex(),
            roarSound: "monster_roar",
            rangedAttackChargeUpSound: "eye_charging",
            painSound: "monster_pain",
            deathSound: "monster_death"
        }
    }, GS.Projectiles = {
        pistol_bolt: {
            hitSound: "hyper_blaster_hit",
            size: new THREE.Vector3(1, 1, 1),
            visualSize: new THREE.Vector3(1, 1, 3),
            rotating: !1,
            speed: 5,
            maxDistance: 500,
            color: (new THREE.Color).setRGB(1, 1, 1).getHex(),
            damage: 10
        },
        hyper_blaster_bolt: {
            hitSound: "hyper_blaster_hit",
            size: new THREE.Vector3(1, 1, 1),
            visualSize: new THREE.Vector3(1, 1, 3),
            rotating: !1,
            speed: 5,
            maxDistance: 500,
            color: (new THREE.Color).setRGB(1, 1, 1).getHex(),
            damage: 10
        },
        eye_bolt: {
            hitSound: "hyper_blaster_hit",
            size: new THREE.Vector3(2, 2, 2),
            visualSize: new THREE.Vector3(3, 3, 3),
            rotating: !0,
            speed: 2,
            maxDistance: 500,
            color: (new THREE.Color).setRGB(1, 1, 1).getHex(),
            damage: 20
        }
    }, GS.Weapons = {
        pistol: {
            name: "pistol",
            powerLevel: 2,
            ammo: 0,
            infiniteAmmo: !0,
            cooldown: 400,
            hitscan: !1
        },
        double_shotgun: {
            name: "shotgun",
            powerLevel: 3,
            ammo: 0,
            ammoMax: 50,
            ammoClip: 8,
            bulletsPerShot: 2,
            cooldown: 1e3,
            hitscan: !0,
            spread: {
                shots: 8,
                angleOffset: 5
            },
            damage: 10,
            impactParticleColor: (new THREE.Color).setRGB(1, 1, 1).getHex(),
            impactParticleCount: 1
        },
        hyper_blaster: {
            name: "hyperblaster",
            powerLevel: 4,
            ammo: 0,
            ammoMax: 200,
            ammoClip: 20,
            bulletsPerShot: 1,
            cooldown: 80,
            hitscan: !1
        }
    }, GS.GridObject = function(grid, layer, sourceObj) {
        this.id = GS.gridObjectIdCount, this.grid = grid, this.type = layer, this.sourceObj = sourceObj, this.linkedGridCells = [], this.view = null, this.removed = !1, this.usable = !1, this.lightLevelFactor = .1, this.minLightLevel = .1, this.maxLightLevel = .75, GS.gridObjectIdCount++
    }, GS.GridObject.prototype = {
        constructor: GS.GridObject,
        init: function() {},
        update: function() {},
        updateCollisionData: function(newPos) {},
        updateBoundingBox: function() {
            var min = new THREE.Vector3,
                max = new THREE.Vector3,
                points = [new THREE.Vector2, new THREE.Vector2],
                aux = new THREE.Vector2;
            return function() {
                var data = this.view.collisionData;
                min.copy(this.position).sub(this.size), max.copy(this.position).add(this.size), data.boundingBox.set(min, max);
                var debugMesh = this.view.debugMesh;
                void 0 !== debugMesh && (debugMesh.userData.isTriangleMesh !== !0 ? (debugMesh.scale.subVectors(max, min), debugMesh.position.copy(this.position)) : (debugMesh.geometry.vertices.length = 0, GS.pushArray(debugMesh.geometry.vertices, data.triangles), debugMesh.geometry.verticesNeedUpdate = !0)), void 0 !== data.boundingSquare && (this.size.toVector2(aux), this.position.toVector2(points[0]), points[0].sub(aux), this.size.toVector2(aux), this.position.toVector2(points[1]), points[1].add(aux), data.boundingSquare.setFromPoints(points))
            }
        }(),
        updateTriangles: function(velocity) {
            for (var triangles = this.view.collisionData.triangles, i = 0; i < triangles.length; i++) triangles[i].add(velocity)
        },
        updateSegments: function(yVelocity) {
            for (var segs = this.view.collisionData.segments, i = 0; i < segs.length; i++) segs[i].bottomY += yVelocity, segs[i].topY += yVelocity
        },
        assignToCells: function(gridLocation) {
            void 0 !== gridLocation ? void 0 !== this.gridLocation ? gridLocation.gridMin.equals(this.gridLocation.gridMin) && gridLocation.gridMax.equals(this.gridLocation.gridMax) || (this.unlinkFromCells(), this.linkToCells(gridLocation)) : this.linkToCells(gridLocation) : this.unlinkFromCells()
        },
        linkToCells: function(gridLocation) {
            for (var min = gridLocation.gridMin, max = gridLocation.gridMax, i = min.y; i <= max.y; i++)
                for (var j = min.x; j <= max.x; j++) this.grid.cells[i][j].children.push(this), this.linkedGridCells.push(this.grid.cells[i][j]);
            this.gridLocation = gridLocation
        },
        unlinkFromCells: function() {
            for (var i = 0; i < this.linkedGridCells.length; i++) {
                var cell = this.linkedGridCells[i],
                    idx = cell.children.indexOf(this);
                idx != -1 && cell.children.splice(idx, 1)
            }
            this.linkedGridCells.length = 0, this.gridLocation = void 0
        },
        getLightColorFromSector: function(optionalTarget, optionalSector) {
            var sector = optionalSector || this.getSector();
            if (void 0 !== sector) {
                var color = optionalTarget || new THREE.Color,
                    x = sector.lightLevel * this.lightLevelFactor;
                x *= x, x = GS.MathHelper.clamp(x, this.minLightLevel, this.maxLightLevel), color.setHex(16777215).multiplyScalar(x)
            }
        },
        computeYFromSector: function() {
            var sector = this.getSector();
            void 0 !== sector && (this.position.y = sector.floorTopY + this.size.y + .03)
        },
        getSector: function() {
            var position2d = new THREE.Vector2;
            return function() {
                var sector, currentSector;
                return this.position.toVector2(position2d), this.grid.forEachUniqueGridObjectInCells(this.linkedGridCells, [GS.Concrete, GS.Elevator], function(gridObject) {
                    if (void 0 === sector) {
                        if (gridObject instanceof GS.Concrete) {
                            if (gridObject.type !== GS.MapLayers.Sector) return;
                            currentSector = gridObject.sourceObj
                        } else currentSector = gridObject.sector;
                        GS.PolygonHelper.sectorContainsPoint(currentSector, position2d, !0) && (sector = currentSector)
                    }
                }), sector
            }
        }(),
        onHit: function() {},
        remove: function() {
            this.removed = !0, this.unlinkFromCells()
        }
    }, GS.gridObjectIdCount = 0, GS.Concrete = function(grid, layer, sourceObj) {
        GS.GridObject.apply(this, arguments), layer === GS.MapLayers.Sector && (this.sector = this.sourceObj), this.view = {
            collisionData: {
                triangles: null
            }
        }
    }, GS.Concrete.prototype = GS.inherit(GS.GridObject, {
        constructor: GS.Concrete
    }), GS.DoorStates = {
        Open: 0,
        Closed: 1,
        Opening: 2,
        Closing: 3
    }, GS.Door = function(grid, sector) {
        GS.GridObject.call(this, grid), this.sector = sector, this.sector.doorGridObject = this, this.lightColor = new THREE.Color, this.speed = .5, this.state = GS.DoorStates.Closed, this.automatic = !0, this.view = {
            collisionData: {
                boundingBox: new THREE.Box3,
                triangles: null,
                segments: null
            }
        }, this.maxCooldown = GS.msToFrames(5e3), this.cooldown = this.maxCooldown
    }, GS.Door.prototype = GS.inherit(GS.GridObject, {
        constructor: GS.Door,
        init: function() {
            this.closedY = this.position.y, this.openY = this.closedY + this.sector.doorMaxHeight, this.usable = !0, this.updateBoundingBox()
        },
        update: function() {
            var velocity = new THREE.Vector3;
            switch (this.state) {
                case GS.DoorStates.Open:
                    this.automatic ? (this.cooldown--, this.cooldown <= 0 && (this.cooldown = this.maxCooldown, this.state = GS.DoorStates.Closing, this.grid.soundManager.playSound("door_close"))) : this.cooldown = this.maxCooldown;
                    break;
                case GS.DoorStates.Closed:
                    break;
                case GS.DoorStates.Opening:
                    this.position.y += this.speed, velocity.y = this.speed, this.position.y >= this.openY && (this.position.y = this.openY, this.state = GS.DoorStates.Open);
                    break;
                case GS.DoorStates.Closing:
                    this.grid.collisionManager.isEntityNearDoor(this) ? (this.sector.doorOpenedEver = !0, this.state = GS.DoorStates.Opening) : (this.position.y -= this.speed, velocity.y = -this.speed, this.position.y <= this.closedY && (this.position.y = this.closedY, this.state = GS.DoorStates.Closed))
            }
            if (this.usable = this.state === GS.DoorStates.Closed && this._automatic === !0, 0 !== velocity.y && (this.updateBoundingBox(), this.updateTriangles(velocity), this.updateSegments(velocity.y), this.updateMesh()), !this.sector.useVertexColors) {
                this.getLightColorFromSector(this.lightColor, this.sector);
                for (var i = 0; i < this.view.mesh.children.length; i++) {
                    var material = this.view.mesh.children[i].material;
                    void 0 !== material.emissive && material.emissive.copy(this.lightColor)
                }
            }
        },
        updateMesh: function() {
            for (var i = 0; i < this.view.mesh.children.length; i++) this.view.mesh.children[i].position.copy(this.position)
        },
        onUse: function() {
            this.state == GS.DoorStates.Closed && (this.sector.doorOpenedEver = !0, this.state = GS.DoorStates.Opening, this.grid.soundManager.playSound("door_open"), this.grid.aiManager.onPlayerOpenDoor(this))
        },
        open: function() {
            return this.sector.doorOpenedEver = !0, this.state = GS.DoorStates.Opening, this.grid.soundManager.playSound("door_open"), this
        },
        openSilent: function() {
            return this.sector.doorOpenedEver = !0, this.state = GS.DoorStates.Opening, this
        },
        close: function() {
            return this.state = GS.DoorStates.Closing, this.grid.soundManager.playSound("door_close"), this
        },
        set automatic(value) {
            this._automatic = value, this.usable = this._automatic === !0
        },
        get automatic() {
            return this._automatic
        }
    }), GS.ElevatorStates = {
        Down: 0,
        Up: 1,
        GoindDown: 2,
        GoingUp: 3
    }, GS.Elevator = function(grid, sector) {
        GS.GridObject.call(this, grid), this.sector = sector, this.speed = .25, this.state = GS.ElevatorStates.Down, this.automatic = !0, this.lightColor = new THREE.Color, this.view = {
            collisionData: {
                boundingBox: new THREE.Box3,
                triangles: null,
                segments: null
            }
        }, this.maxCooldown = GS.msToFrames(0), this.cooldown = this.maxCooldown, this.velocity = new THREE.Vector3
    }, GS.Elevator.prototype = GS.inherit(GS.GridObject, {
        constructor: GS.Elevator,
        init: function() {
            this.downY = this.position.y, this.upY = this.downY + this.sector.elevatorMaxHeight, this.updateBoundingBox()
        },
        update: function() {
            this.velocity.set(0, 0, 0);
            var oldY = 0;
            switch (this.state) {
                case GS.ElevatorStates.Down:
                    this.automatic && (this.cooldown--, this.cooldown <= 0 && (this.cooldown = this.maxCooldown, this.state = GS.ElevatorStates.GoingUp));
                    break;
                case GS.ElevatorStates.Up:
                    this.automatic && (this.cooldown--, this.cooldown <= 0 && (this.cooldown = this.maxCooldown, this.state = GS.ElevatorStates.GoingDown));
                    break;
                case GS.ElevatorStates.GoingDown:
                    oldY = this.position.y, this.position.y -= this.speed, this.position.y <= this.downY ? (this.position.y = this.downY, this.velocity.y = this.downY - oldY, this.state = GS.ElevatorStates.Down, this.grid.soundManager.playSound("elevator_stop")) : this.velocity.y = -this.speed;
                    break;
                case GS.ElevatorStates.GoingUp:
                    oldY = this.position.y, this.position.y += this.speed, this.position.y >= this.upY ? (this.position.y = this.upY, this.velocity.y = this.upY - oldY, this.state = GS.ElevatorStates.Up, this.grid.soundManager.playSound("elevator_stop")) : this.velocity.y = this.speed
            }
            this.updateChange()
        },
        updateChange: function() {
            if (0 !== this.velocity.y && (this.updateBoundingBox(), this.updateTriangles(this.velocity), this.updateSegments(this.velocity.y), this.updateSector(this.velocity.y), this.updateMesh(), this.grid.collisionManager.elevatorMove(this, this.velocity.y)), !this.sector.useVertexColors) {
                this.getLightColorFromSector(this.lightColor, this.sector);
                for (var i = 0; i < this.view.mesh.children.length; i++) {
                    var material = this.view.mesh.children[i].material;
                    void 0 !== material.emissive && material.emissive.copy(this.lightColor)
                }
            }
        },
        updateSector: function(yVelocity) {
            this.sector.floorTopY += yVelocity, this.sector.ceilBottomY += yVelocity
        },
        setPositionUp: function() {
            return this.velocity.y = this.upY - this.position.y, this.position.y = this.upY, this.state = GS.ElevatorStates.Up, this.updateChange(), this
        },
        setPositionDown: function() {
            return this.velocity.y = this.downY - this.position.y, this.position.y = this.downY, this.state = GS.ElevatorStates.Down, this.updateChange(), this
        },
        goDown: function() {
            return this.state = GS.ElevatorStates.GoingDown, this.grid.soundManager.playSound("elevator_move"), this
        },
        goUp: function() {
            return this.state = GS.ElevatorStates.GoingUp, this.grid.soundManager.playSound("elevator_move"), this
        },
        updateMesh: function() {
            for (var i = 0; i < this.view.mesh.children.length; i++) this.view.mesh.children[i].position.copy(this.position)
        },
        onUse: function() {
            this.state == GS.ElevatorStates.Closed && (this.state = GS.ElevatorStates.Opening)
        }
    }), GS.Item = function(grid, layer, sourceObj) {
        GS.GridObject.apply(this, arguments), this.size = new THREE.Vector3(5, 5, 5), this.scale = new THREE.Vector3(.4, .4, .4), this.offset = new THREE.Vector3(4, 3, 4), this.animation = {
            rotationSpeed: .01,
            floatYDelta: .25,
            floatAngle: 0,
            floatSpeed: 2
        }, this.view = {
            collisionData: {
                boundingBox: new THREE.Box3
            }
        }
    }, GS.Item.prototype = GS.inherit(GS.GridObject, {
        constructor: GS.Item,
        init: function() {
            this.updateBoundingBox(), this.sector = this.getSector(), this.getLightColorFromSector(this.view.mesh.material.emissive, this.sector)
        },
        update: function() {
            this.updateLightLevel(), this.view.mesh.rotation.y += this.animation.rotationSpeed, this.animation.floatAngle += this.animation.floatSpeed;
            var pos = this.view.mesh.position;
            pos.y = this.position.y + this.animation.floatYDelta * Math.sin(Math.PI / 180 * this.animation.floatAngle)
        },
        updateLightLevel: function() {
            this.getLightColorFromSector(this.view.mesh.material.emissive, this.sector)
        },
        updateCollisionData: function(newPos) {
            this.position.copy(newPos), this.view.mesh.position.copy(this.position), this.updateBoundingBox()
        },
        remove: function() {
            this.grid.removeEntityMesh(this.view.mesh), GS.GridObject.prototype.remove.call(this)
        }
    }), GS.MonsterStates = {
        Scripted: 0,
        Inactive: 1,
        Awake: 2,
        Active: 3
    }, GS.Monster = function(grid, layer, sourceObj) {
        GS.GridObject.apply(this, arguments), this.monsterType = GS.MapEntities[sourceObj.type].name, $.extend(!0, this, GS.Monsters[this.monsterType]), this.xAngle = THREE.Math.degToRad(360 - sourceObj.rotation), this.direction = new THREE.Vector3, this.view = {
            collisionData: {
                boundingBox: new THREE.Box3,
                boundingSquare: new THREE.Box2,
                ellipsoid: this.size,
                triangles: null
            }
        }, this.dead = !1, this.health = this.maxHealth, this.scatterCooldown = 0, this.state = GS.MonsterStates.Inactive, this.moving = !1, this.inPain = !1, this.changeTargetMaxCooldown = GS.msToFrames(500), this.changeTargetCooldown = 1, this.meleeAttackCooldown = 0, this.rangedAttackCooldown = Math.floor(Math.random() * this.rangedAttackCooldownRandomModifier), this.rangedAttackChargeCooldown = 0, this.chargingUpRangedAttack = !1
    }, GS.Monster.prototype = GS.inherit(GS.GridObject, {
        constructor: GS.Monster,
        init: function() {
            this.animationView = new GS.AnimationView(this), this.animationView.init(), this.animationView.setLoop("inactive"), this.updateBoundingBox(), this.updateMesh(), this.sector = this.getSector()
        },
        update: function() {
            this.animationView.update(), this.dead || (this.state === GS.MonsterStates.Awake ? this.updateScan() : this.state === GS.MonsterStates.Active && (this.updateMove(), this.attackType === GS.MonsterAttackTypes.Melee ? this.updateAttackMelee() : this.attackType === GS.MonsterAttackTypes.Ranged && this.updateAttackRanged())), this.updateLightLevel()
        },
        updateLightLevel: function() {
            this.getLightColorFromSector(this.animationView.currentMesh.material.emissive, this.sector)
        },
        updateMesh: function() {
            this.view.mesh.position.copy(this.position), this.view.mesh.position.y += this.animationView.positionYOffset, this.view.mesh.rotation.y = this.xAngle + this.rotationOffset + this.animationView.rotationYOffset
        },
        updateScan: function() {
            var target = this.grid.player;
            return this.inMeleeRange(target.position) ? void this.activate() : this.isFacing(target.position) ? void this.activate() : void this.updateMesh()
        },
        updateMove: function() {
            var target = this.grid.player;
            this.chargingUpRangedAttack ? (this.calculateDirection(target.position), this.calculateRotation(), this.updateMesh()) : (this.scatterCooldown > 0 ? this.scatterCooldown-- : target.dead ? this.scatter() : this.attackType === GS.MonsterAttackTypes.Melee ? this.updateMoveMelee() : this.attackType === GS.MonsterAttackTypes.Ranged && this.updateMoveRanged(), this.inPain ? this.updateMesh() : this.move())
        },
        updateMoveMelee: function() {
            var aux = new THREE.Vector3,
                targetPos = new THREE.Vector3;
            return function() {
                var target = this.grid.player;
                if (this.changeTargetCooldown > 0 && (this.changeTargetCooldown--, 0 === this.changeTargetCooldown)) {
                    this.changeTargetCooldown = this.changeTargetMaxCooldown, targetPos.copy(target.position);
                    var distanceToTarget = this.position.distanceTo(targetPos);
                    distanceToTarget > 20 && (aux.set(Math.random() - .5, 0, Math.random() - .5).normalize().multiplyScalar(20), targetPos.add(aux)), this.calculateDirection(targetPos), this.calculateRotation()
                }
            }
        }(),
        updateMoveRanged: function() {
            var aux = new THREE.Vector3,
                targetPos = new THREE.Vector3;
            return function() {
                var target = this.grid.player;
                if (this.changeTargetCooldown > 0 && (this.changeTargetCooldown--, 0 === this.changeTargetCooldown)) {
                    this.changeTargetCooldown = this.changeTargetMaxCooldown, targetPos.copy(target.position);
                    var distanceToTarget = this.position.distanceTo(targetPos);
                    distanceToTarget > 30 && distanceToTarget < this.preferredMaxDistance && (targetPos.copy(this.position), aux.set(Math.random() - .5, 0, Math.random() - .5).normalize().multiplyScalar(20), targetPos.add(aux)), this.calculateDirection(targetPos), this.calculateRotation()
                }
            }
        }(),
        move: function() {
            var newPos = new THREE.Vector3;
            return function() {
                this.moving = !0, newPos.copy(this.direction).multiplyScalar(this.speed).add(this.position), this.grid.collisionManager.collideMonster(this, this.position, newPos)
            }
        }(),
        updateAttackMelee: function() {
            var target = this.grid.player;
            this.meleeAttackCooldown > 0 ? this.meleeAttackCooldown-- : target.dead || this.inPain || this.inMeleeRange(target.position) && this.isFacing(target.position) && this.grid.collisionManager.checkMonsterLineOfSight(this, target, this.meleeRange) && this.meleeAttack()
        },
        meleeAttack: function() {
            var target = this.grid.player;
            this.grid.soundManager.playSound("monster_bite"), this.meleeAttackCooldown = this.meleeAttackMaxCooldown, target.onHit(this.meleeDamage), this.grid.addEntityImpactParticles(target.position, target.bloodColor)
        },
        updateAttackRanged: function() {
            var target = this.grid.player;
            this.rangedAttackCooldown > 0 ? this.rangedAttackCooldown-- : target.dead || this.inPain || (this.rangedAttackChargeCooldown > 0 ? (this.rangedAttackChargeCooldown--, 0 === this.rangedAttackChargeCooldown && this.rangedAttack()) : this.isFacing(target.position) && this.grid.collisionManager.checkMonsterLineOfSight(this, target, this.rangedAttackRange) && this.chargeUpRangedAttack())
        },
        chargeUpRangedAttack: function() {
            this.grid.soundManager.playSound(this.rangedAttackChargeUpSound), this.moving = !1, this.chargingUpRangedAttack = !0, this.rangedAttackChargeCooldown = this.rangedAttackChargeMaxCooldown, this.animationView.setLoop("attack")
        },
        cancelRangedAttack: function() {
            this.chargingUpRangedAttack = !1, this.rangedAttackChargeCooldown = 0, this.animationView.setLoop("walk")
        },
        rangedAttack: function() {
            var direction = new THREE.Vector3;
            return function() {
                this.moving = !1;
                var target = this.grid.player;
                this.chargingUpRangedAttack = !1, this.animationView.setLoop("walk"), this.rangedAttackCooldown = this.rangedAttackMaxCooldown + Math.floor(Math.random() * this.rangedAttackCooldownRandomModifier), direction.copy(target.position).sub(this.position).normalize(), this.grid.addProjectile(this, this.rangedAttackProjectile, this.position.clone(), direction.clone())
            }
        }(),
        inMeleeRange: function(pos) {
            return this.position.distanceTo(pos) < this.meleeRange
        },
        inRangedAttackRange: function(pos) {
            return this.position.distanceTo(pos) < this.rangedAttackRange
        },
        isFacing: function() {
            var p = new THREE.Vector2,
                t = new THREE.Vector2,
                a = new THREE.Vector2,
                b = new THREE.Vector2;
            return function(pos) {
                this.position.toVector2(p), pos.toVector2(t);
                var x = this.xAngle + this.rotationOffset;
                return a.set(Math.sin(x - Math.PI / 2), Math.cos(x - Math.PI / 2)).add(p), b.set(Math.sin(x + Math.PI / 2), Math.cos(x + Math.PI / 2)).add(p), GS.MathHelper.vec2PointSide(a, b, t)
            }
        }(),
        scatter: function() {
            var target = this.grid.player;
            if (!(this.scatterCooldown > 20)) {
                var distance = target.position.distanceTo(this.position);
                (target.dead || distance > 10 * (1 + this.scale.x)) && (this.direction = new THREE.Vector3(2 * Math.random() - 1, 0, 2 * Math.random() - 1), this.direction.normalize(), this.calculateRotation(), this.scatterCooldown = 30)
            }
        },
        calculateDirection: function(targetPos) {
            this.direction.copy(targetPos).sub(this.position), this.direction.y = 0, this.direction.normalize()
        },
        calculateRotation: function() {
            this.xAngle = Math.atan2(this.direction.x, this.direction.z) + Math.PI
        },
        updateCollisionData: function() {
            var velocity = new THREE.Vector3;
            return function(newPos) {
                velocity.copy(newPos).sub(this.position);
                var currentSpeed = newPos.distanceTo(this.position);
                this.position.copy(newPos), this.updateTriangles(velocity), this.updateBoundingBox(), this.updateMesh(), currentSpeed / this.speed < .1 && this.scatter(), this.sector = this.getSector()
            }
        }(),
        wakeUp: function(script) {
            this.state !== GS.MonsterStates.Awake && (script !== !0 && this.state === GS.MonsterStates.Scripted || (this.state = GS.MonsterStates.Awake, this.animationView.setLoop("inactive")))
        },
        activate: function(script) {
            this.state !== GS.MonsterStates.Active && (script !== !0 && this.state === GS.MonsterStates.Scripted || (this.state = GS.MonsterStates.Active, this.animationView.setLoop("walk"), this.grid.soundManager.playSound(this.roarSound)))
        },
        onHit: function(damage) {
            this.state !== GS.MonsterStates.Active && this.activate(!0), Math.random() <= this.painChance && (this.inPain = !0, this.moving = !1, this.attackType === GS.MonsterAttackTypes.Ranged && this.cancelRangedAttack(), this.animationView.pain(), this.grid.soundManager.playSound(this.painSound)), this.health -= damage, this.health < 0 && (this.health = 0, this.onDeath())
        },
        onDeath: function() {
            this.moving = !1;
            var target = this.grid.player;
            this.calculateDirection(target.position), this.calculateRotation(), this.dead = !0, this.grid.soundManager.playSound(this.deathSound), this.grid.aiManager.onMonsterDeath(), this.animationView.setLoop("death"), this.updateMesh()
        }
    }), GS.Player = function(grid, camera, playerView) {
        GS.GridObject.call(this, grid), this.camera = camera, this.playerView = playerView, this.playerView.player = this, this.moveSpeed = 1.5, this.godEnabled = !1, this.flyEnabled = !1, this.noClipEnabled = !1, this.inMenu = !1, this.health = 100, this.dead = !1, this.size = new THREE.Vector3(3, 7, 3), this.useRange = this.size.x + 15, this.bloodColor = (new THREE.Color).setRGB(1, 0, 0).getHex(), this.direction = new THREE.Vector3, this.view = {
            collisionData: {
                boundingBox: new THREE.Box3,
                boundingSquare: new THREE.Box2,
                ellipsoid: this.size,
                triangles: null
            }
        }, this.moving = !1, this.shooting = !1, this.canUse = !0, this.ySmoothingMaxCooldown = GS.msToFrames(500), this.ySmoothingCooldown = 0, this.swapWeaponsOnPickup = !0
    }, GS.Player.prototype = GS.inherit(GS.GridObject, {
        constructor: GS.Player,
        init: function() {
            var that = this;
            this.availableWeapons = $.extend(!0, {}, GS.Weapons), Object.keys(this.availableWeapons).forEach(function(key) {
                that.availableWeapons[key].pickedUp = !1, that.availableWeapons[key].cooldownRemaining = 0
            }), this.computeYFromSector(), this.initTriangles(), this.updateBoundingBox(), this.controls = new GS.FPSControls(this.camera), this.controls.eye.copy(this.position), this.controls.followingEye.copy(this.position), this.controls.moveSpeed = this.moveSpeed, this.controls.init(), this.controls.onHandleCollisions = function(oldPos, newPos) {
                that.noClipEnabled ? that.updateCollisionData(newPos) : that.grid.collisionManager.collidePlayer(that, oldPos, newPos)
            }, that.availableWeapons.pistol.pickedUp = !0, that.availableWeapons.pistol.cooldownRemaining = 0, this.weapon = this.availableWeapons.pistol, this.weaponName = "pistol", this.playerView.changeToWeaponInstant("pistol")
        },
        getPersistencePackage: function() {
            var pkg = {
                health: this.health,
                weapons: {},
                currentWeapon: this.weaponName
            };
            for (var i in this.availableWeapons) pkg.weapons[i] = {}, pkg.weapons[i].pickedUp = this.availableWeapons[i].pickedUp, pkg.weapons[i].ammo = this.availableWeapons[i].ammo;
            return pkg
        },
        applyPersistencePackage: function(pkg) {
            this.health = pkg.health;
            for (var i in this.availableWeapons) this.availableWeapons[i].pickedUp = pkg.weapons[i].pickedUp, this.availableWeapons[i].ammo = pkg.weapons[i].ammo;
            this.weapon = this.availableWeapons[pkg.currentWeapon], this.weaponName = pkg.currentWeapon, this.playerView.changeToWeaponInstant(pkg.currentWeapon)
        },
        giveAll: function() {
            var that = this;
            Object.keys(this.availableWeapons).forEach(function(key) {
                var weapon = that.availableWeapons[key];
                weapon.pickedUp = !0, weapon.cooldownRemaining = 0, weapon.infiniteAmmo || (weapon.ammo = weapon.ammoMax)
            })
        },
        fly: function(value) {
            void 0 === value ? this.flyEnabled = !this.flyEnabled : this.flyEnabled = value, this.controls.fly = this.flyEnabled, this.flyEnabled ? (this.playerView.viewBob.enabled = !1, this.playerView.weaponBob.enabled = !1) : (this.playerView.viewBob.enabled = !0, this.playerView.weaponBob.enabled = !0)
        },
        noClip: function(value) {
            void 0 === value ? this.noClipEnabled = !this.noClipEnabled : this.noClipEnabled = value
        },
        god: function(value) {
            void 0 === value ? this.godEnabled = !this.godEnabled : this.godEnabled = value
        },
        initTriangles: function() {
            for (var triangles = GS.Cube.getVertices(), i = 0; i < triangles.length; i++) triangles[i].multiply(this.size).add(this.position);
            this.view.collisionData.triangles = triangles
        },
        update: function() {
            this.dead || (this.updateControls(), this.updateUse(), this.updateShoot(), this.updateChangeWeapon())
        },
        afterCollision: function(result) {
            !result.climbing || result.gridObject instanceof GS.Elevator || (this.ySmoothingCooldown = this.ySmoothingMaxCooldown)
        },
        onHit: function(damage) {
            this.godEnabled || (this.health -= damage, this.health <= 0 && (this.health = 0, this.onDeath()), this.playerView.onDamage())
        },
        onDeath: function() {
            this.dead = !0, this.grid.soundManager.playSound("player_death"), void 0 !== this.weapon && this.playerView.onDeath()
        },
        onItemCollision: function(item) {
            var name = GS.MapEntities[item.sourceObj.type].name;
            (this.pickupWeapon(name) || this.pickupAmmo(name) || this.pickupMedkit(name)) && (this.grid.aiManager.onPlayerItemPickup(this, item), item.remove(), this.playerView.onItemPickup())
        },
        pickupWeapon: function(name) {
            if (void 0 !== this.availableWeapons[name]) {
                var weapon = this.availableWeapons[name];
                return weapon.pickedUp || (weapon.pickedUp = !0, GS.DebugUI.addTempLine("picked up " + weapon.name), (void 0 === this.weapon || this.swapWeaponsOnPickup && weapon.powerLevel > this.weapon.powerLevel) && (this.weapon = weapon, this.weaponName = name, this.playerView.changeToWeapon(name))), weapon.ammo += weapon.ammoClip, this.grid.soundManager.playSound("pickup_weapon"), weapon.ammo > weapon.ammoMax && (weapon.ammo = weapon.ammoMax), GS.DebugUI.addTempLine("picked up " + weapon.ammoClip + " " + weapon.name + " ammo"), !0
            }
            return !1
        },
        pickupAmmo: function(name) {
            var that = this,
                once = !1;
            return !("ammo" != name || (Object.keys(this.availableWeapons).forEach(function(key) {
                var weapon = that.availableWeapons[key];
                !weapon.infiniteAmmo && weapon.ammo < weapon.ammoMax && (weapon.ammo += weapon.ammoClip, weapon.ammo > weapon.ammoMax && (weapon.ammo = weapon.ammoMax), GS.DebugUI.addTempLine("picked up " + weapon.ammoClip + " " + weapon.name + " ammo"), once = !0)
            }), !once)) && (this.grid.soundManager.playSound("pickup_ammo"), !0)
        },
        pickupMedkit: function(name) {
            return "medkit" == name && this.health < 100 && (GS.DebugUI.addTempLine("picked up medkit"), this.health += 25, this.health > 100 && (this.health = 100), this.grid.soundManager.playSound("pickup_item"), !0)
        },
        updateUse: function() {
            this.canUse && GS.Keybinds.use.inUse && this.useTarget.onUse()
        },
        updateShoot: function() {
            if (void 0 !== this.weapon) {
                if (this.weapon.cooldownRemaining > 0) return void(this.weapon.cooldownRemaining -= 1);
                var oldShooting = this.shooting;
                if (GS.Keybinds.shoot.inUse && this.playerView.weaponReady) {
                    if (this.weapon.infiniteAmmo || this.weapon.ammo > 0) {
                        this.shooting = !0, this.shooting && !oldShooting && this.shootStart(), this.weapon.infiniteAmmo || (this.weapon.ammo -= this.weapon.bulletsPerShot), this.playerView.shoot(), this.playShootSound(), this.weapon.cooldownRemaining = GS.msToFrames(this.weapon.cooldown);
                        var projectileStart = this.getProjectileStart();
                        this.weapon.hitscan ? this.grid.collisionManager.hitscan(this, projectileStart, this.weapon, this.xAngle, this.yAngle) : "hyper_blaster" == this.weaponName ? this.grid.addProjectile(this, "hyper_blaster_bolt", projectileStart, this.direction.clone()) : "pistol" == this.weaponName && this.grid.addProjectile(this, "pistol_bolt", projectileStart, this.direction.clone())
                    }
                    this.weapon.infiniteAmmo || 0 !== this.weapon.ammo || this.trySwapToWeaponWithAmmo()
                } else this.shooting = !1, !this.shooting && oldShooting && this.shootEnd()
            }
        },
        playShootSound: function() {
            var name;
            "double_shotgun" == this.weaponName ? name = "shotgun_fire" : "hyper_blaster" == this.weaponName ? name = "hyper_blaster_fire" : "pistol" == this.weaponName && (name = "hyper_blaster_fire"), this.grid.soundManager.playSound(name)
        },
        shootStart: function() {
            this.grid.aiManager.onPlayerShoot(this)
        },
        shootEnd: function() {},
        trySwapToWeaponWithAmmo: function() {
            for (var keys = Object.keys(this.availableWeapons), i = keys.length - 1; i >= 0; i--) {
                var name = keys[i],
                    weapon = this.availableWeapons[name];
                if (weapon.pickedUp && (weapon.infiniteAmmo || weapon.ammo > 0)) {
                    this.changeToWeapon(name);
                    break
                }
            }
        },
        getProjectileStart: function() {
            var projectileStart = this.position.clone();
            return projectileStart.y += this.controls.eyeOffsetY, projectileStart
        },
        updateChangeWeapon: function() {
            var that = this;
            Object.keys(this.availableWeapons).forEach(function(key) {
                var weapon = that.availableWeapons[key];
                weapon.pickedUp && weapon !== that.weapon && void 0 !== that.weapon && that.playerView.weaponReady && GS.Keybinds[weapon.name].inUse && that.changeToWeapon(key)
            })
        },
        changeToWeapon: function(name) {
            this.weapon = this.availableWeapons[name], this.weaponName = name, this.playerView.changeToWeapon(name)
        },
        updateControls: function(e) {
            this.ySmoothingCooldown > 0 ? (this.ySmoothingCooldown--, this.controls.ySmoothing = !0) : this.controls.ySmoothing = !1, this.controls.update(), this.direction.copy(this.controls.lookNoOffset).sub(this.controls.followingEye).normalize(), this.xAngle = this.controls.xAngle, this.yAngle = this.controls.yAngle, this.playerView.update()
        },
        moveStart: function() {},
        moveEnd: function() {},
        updateCollisionData: function(newPos) {
            this.playerView.updateThrottle(this.position, newPos);
            var velocity = newPos.clone().sub(this.position);
            this.updateTriangles(velocity);
            var oldMoving = this.moving;
            this.moving = !this.position.equals(newPos), this.position.copy(newPos), this.controls.eye.copy(newPos), this.moving && !oldMoving ? this.moveStart() : !this.moving && oldMoving && this.moveEnd(), this.updateBoundingBox()
        }
    }), GS.Projectile = function(grid, sourceGridObject, type, position, direction) {
        GS.GridObject.call(this, grid), $.extend(!0, this, GS.Projectiles[type]), this.sourceGridObject = sourceGridObject, this.type = type, this.position = position, this.direction = direction, this.steps = 0, this.maxSteps = Math.floor(this.maxDistance / this.speed), this.view = {
            collisionData: {
                boundingBox: new THREE.Box3,
                ellipsoid: this.size
            }
        }
    }, GS.Projectile.prototype = GS.inherit(GS.GridObject, {
        constructor: GS.Projectile,
        init: function() {
            this.updateBoundingBox(), this.particle = this.grid.particleView.addParticle(this.visualSize.x, this.visualSize.y, this.visualSize.z, this.color), this.view.mesh = this.particle.mesh, this.view.mesh.lookAt(this.direction), this.view.mesh.visible = !1;
            var points = [new THREE.Vector2(this.position.x - this.size.x, this.position.z - this.size.z), new THREE.Vector2(this.position.x + this.size.x, this.position.z + this.size.z)],
                gridLocation = this.grid.getGridLocationFromPoints(points);
            this.assignToCells(gridLocation)
        },
        update: function() {
            this.steps++;
            var newPos = this.position.clone().add(this.direction.clone().multiplyScalar(this.speed));
            this.grid.collisionManager.collideProjectile(this, this.position, newPos), this.view.mesh.position.copy(this.position), this.rotating && (this.view.mesh.rotation.x += .1, this.view.mesh.rotation.y += .1), (this.steps > this.maxSteps || 0 === this.linkedGridCells.length) && this.remove()
        },
        updateCollisionData: function(newPos) {
            this.distanceTravelled += newPos.distanceTo(this.position), this.steps > 1 && (this.view.mesh.visible = !0), this.position.copy(newPos), this.updateBoundingBox()
        },
        onHit: function() {
            this.grid.soundManager.playSound(this.hitSound), this.remove()
        },
        remove: function() {
            this.particle.toBeRemoved = !0, GS.GridObject.prototype.remove.call(this)
        }
    }), GS.Switch = function(grid, seg) {
        GS.GridObject.call(this, grid), this.segment = seg, this.on = !1, this.usable = !0, this.view = {
            collisionData: {
                boundingBox: new THREE.Box3
            }
        }
    }, GS.Switch.prototype = GS.inherit(GS.GridObject, {
        constructor: GS.Switch,
        init: function() {},
        onUse: function() {
            this.on = !0, this.view.mesh.material.map = this.view.textureOn, this.usable = !1, this.grid.aiManager.onSwitchStateChange(this), this.grid.soundManager.playSound("switch_on")
        },
        block: function() {
            this.on = !0, this.view.mesh.material.map = this.view.textureOn, this.usable = !1
        }
    }), GS.TVScreen = function(grid, seg) {
        GS.GridObject.call(this, grid), this.segment = seg, this.view = {}
    }, GS.TVScreen.prototype = GS.inherit(GS.GridObject, {
        constructor: GS.TVScreen,
        init: function() {}
    }), GS.FontLoader = function() {
        this.fontPath = ""
    }, GS.FontLoader.prototype = {
        constructor: GS.FontLoader,
        load: function(name, filename, callback) {
            var path = this.fontPath + filename;
            $("head").prepend(["<style type='text/css'>", "@font-face {", "font-family: '" + name + "';", "src: url('" + path + "') format('woff');", "font-weight: normal;", "font-style: normal;", "}", "</style>"].join("\n"));
            var node = document.createElement("span");
            node.innerHTML = "giItT1WQy@!-/#", node.style.position = "absolute", node.style.left = "-10000px", node.style.top = "-10000px", node.style.fontSize = "300px", node.style.fontFamily = "sans-serif", node.style.fontVariant = "normal", node.style.fontStyle = "normal", node.style.fontWeight = "normal", node.style.letterSpacing = "0", document.body.appendChild(node);
            var width = node.offsetWidth;
            node.style.fontFamily = name;
            var intervalId = setInterval(function() {
                node.offsetWidth != width && (node.parentNode.removeChild(node), clearInterval(intervalId), callback())
            }, 50)
        }
    }, GS.MapScripts = {}, GS.MapLoader = function() {
        this.mapPath = "assets/maps/"
    }, GS.MapLoader.prototype = {
        constructor: GS.MapLoader,
        loadTestMap: function() {
            var testMap = window.localStorage.testMap;
            return testMap || alert("testMap not found in localStorage"), testMap
        },
        load: function(name, filename, callback) {
            var path = this.mapPath + filename;
            $.ajax({
                url: path,
                dataType: "text",
                success: function(jsonStr) {
                    callback(jsonStr)
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    throw errorThrown
                }
            })
        },
        parse: function(text) {
            var map;
            try {
                map = JSON.parse(text, function(k, v) {
                    if (v instanceof Object) {
                        if (void 0 !== v.x && void 0 !== v.y && void 0 !== v.z) return new THREE.Vector3(v.x, v.y, v.z);
                        if (void 0 !== v.x && void 0 !== v.y) return new THREE.Vector2(v.x, v.y)
                    }
                    return v
                })
            } catch (ex) {
                GAME.handleFatalError("invalid map - parse error")
            }
            return map.bounds = this.getMapBounds(map), map
        },
        getMapBounds: function(map) {
            var points = [];
            map.layerObjects || GAME.handleFatalError("invalid map - no layer objects");
            for (var segs = map.layerObjects[GS.MapLayers.Segment], i = 0; i < segs.length; i++) {
                var seg = segs[i];
                points.push((new THREE.Vector2).copy(seg.start)), points.push((new THREE.Vector2).copy(seg.end))
            }
            for (var sectors = map.layerObjects[GS.MapLayers.Sector], i = 0; i < sectors.length; i++)
                for (var sector = sectors[i], j = 0; j < sector.vertices.length; j++) {
                    var vertex = sector.vertices[j];
                    points.push((new THREE.Vector2).copy(vertex))
                }
            var bounds = new THREE.Box2;
            return bounds.setFromPoints(points), bounds
        }
    }, GS.ZipAssetLoader = function(audioContext) {
        this.audioContext = audioContext, this.objLoader = new THREE.OBJLoader, this.mapLoader = new GS.MapLoader, this.fontLoader = new GS.FontLoader, this.fontLoader.fontPath = "", this.zipPath = "assets.zip", this.path = {}, this.path[GS.AssetTypes.Texture] = "textures/", this.path[GS.AssetTypes.CubeTexture] = "textures/", this.path[GS.AssetTypes.UIWidget] = "textures/widgets/", this.path[GS.AssetTypes.Mesh] = "meshes/", this.path[GS.AssetTypes.Sound] = "sounds/", this.path[GS.AssetTypes.Map] = "maps/", this.path[GS.AssetTypes.Script] = "scripts/", this.path[GS.AssetTypes.MusicTrack] = "music/", this.reset()
    }, GS.ZipAssetLoader.prototype = {
        reset: function() {
            this.loaded = !1, this.assetsToLoad = 0, this.queue = [], this.assets = {}, this.assets[GS.AssetTypes.Texture] = {}, this.assets[GS.AssetTypes.CubeTexture] = {}, this.assets[GS.AssetTypes.UIWidget] = {}, this.assets[GS.AssetTypes.Mesh] = {}, this.assets[GS.AssetTypes.Sound] = {}, this.assets[GS.AssetTypes.Map] = {}, this.assets[GS.AssetTypes.Script] = {}, this.assets[GS.AssetTypes.MusicTrack] = {}
        },
        init: function() {
            for (var j in GS.AssetTypes) {
                var assetDict = GS.Assets[GS.AssetTypes[j]];
                for (var i in assetDict) this.add(i, assetDict[i].filename, GS.AssetTypes[j])
            }
        },
        add: function(name, filename, type) {
            this.queue.push({
                name: name,
                filename: filename,
                type: type
            }), this.assetsToLoad++
        },
        loadZip: function() {
            var that = this,
                xhr = new XMLHttpRequest;
            xhr.open("GET", this.zipPath, !0), xhr.responseType = "arraybuffer", xhr.onreadystatechange = function(e) {
                4 == this.readyState && 200 == this.status && (that.zip = new JSZip(this.response), setTimeout(function() {
                    that._load()
                }, 0))
            }, xhr.onprogress = function(e) {
                that.zipOnProgress(e)
            }, xhr.send()
        },
        _load: function() {
            var that = this;
            this.totalAssets = this.queue.length + 1, this.assetsToLoad++, this.fontLoader.load("hudFont", GS.CustomFontFile, function() {
                that.checkIfFullyLoaded()
            });
            for (var asset; this.queue.length > 0;) asset = this.queue.pop(), asset.name in this.assets[asset.type] ? this.assetsToLoad-- : this.loadAsset(asset)
        },
        load: function() {
            this.loadZip()
        },
        loadAsset: function(asset) {
            switch (asset.type) {
                case GS.AssetTypes.Texture:
                    this.loadTexture(asset.name, asset.filename);
                    break;
                case GS.AssetTypes.CubeTexture:
                    this.loadCubeTexture(asset.name, asset.filename);
                    break;
                case GS.AssetTypes.UIWidget:
                    this.loadUIWidget(asset.name, asset.filename);
                    break;
                case GS.AssetTypes.Mesh:
                    this.loadMesh(asset.name, asset.filename);
                    break;
                case GS.AssetTypes.Sound:
                    this.loadSound(asset.name, asset.filename, GS.AssetTypes.Sound);
                    break;
                case GS.AssetTypes.Map:
                    this.loadMap(asset.name, asset.filename);
                    break;
                case GS.AssetTypes.Script:
                    this.loadScript(asset.name, asset.filename);
                    break;
                case GS.AssetTypes.MusicTrack:
                    this.loadSound(asset.name, asset.filename, GS.AssetTypes.MusicTrack)
            }
        },
        getImageFromZip: function(path) {
            var buffer = this.zip.file(path).asArrayBuffer(),
                blob = new Blob([buffer], {
                    type: "image/png"
                }),
                urlCreator = window.URL || window.webkitURL,
                imageUrl = urlCreator.createObjectURL(blob),
                img = new Image;
            return img.src = imageUrl, img
        },
        getTextureFromZip: function(path) {
            var img = this.getImageFromZip(path),
                tex = new THREE.Texture(img);
            return tex.needsUpdate = !0, tex
        },
        loadTexture: function(name, filename) {
            var path = this.path[GS.AssetTypes.Texture] + filename;
            this.assets[GS.AssetTypes.Texture][name] = this.getTextureFromZip(path), this.checkIfFullyLoaded()
        },
        loadCubeTexture: function(name, folder) {
            var path = this.path[GS.AssetTypes.CubeTexture] + folder + "/",
                tex = new THREE.Texture;
            tex.image = [], tex.flipY = !1;
            for (var i = 0; i < GS.CubeTextureNames.length; i++) tex.image[i] = this.getImageFromZip(path + GS.CubeTextureNames[i] + GS.CubeTextureExtension);
            tex.needsUpdate = !0, this.assets[GS.AssetTypes.CubeTexture][name] = tex, this.checkIfFullyLoaded()
        },
        loadUIWidget: function(name, filename) {
            var path = this.path[GS.AssetTypes.UIWidget] + filename;
            this.assets[GS.AssetTypes.UIWidget][name] = this.getImageFromZip(path), this.checkIfFullyLoaded()
        },
        loadMesh: function(name, filename) {
            var path = this.path[GS.AssetTypes.Mesh] + filename,
                text = this.zip.file(path).asText();
            this.assets[GS.AssetTypes.Mesh][name] = this.objLoader.parse(text).children[0], this.checkIfFullyLoaded()
        },
        loadSound: function(name, filename, assetType) {
            var that = this,
                path = this.path[assetType] + filename,
                encodedBuffer = this.zip.file(path).asArrayBuffer();
            this.audioContext.decodeAudioData(encodedBuffer, function(buffer) {
                that.assets[assetType][name] = buffer, that.checkIfFullyLoaded()
            })
        },
        loadMap: function(name, filename) {
            var path = this.path[GS.AssetTypes.Map] + filename;
            "testMap" !== name ? this.assets[GS.AssetTypes.Map][name] = this.zip.file(path).asText() : GAME.isTestMap() && (this.assets[GS.AssetTypes.Map][name] = this.mapLoader.loadTestMap()), this.checkIfFullyLoaded()
        },
        loadScript: function(name, filename) {
            var path = this.path[GS.AssetTypes.Script] + filename,
                scriptTag = document.createElement("script");
            scriptTag.text = this.zip.file(path).asText(), document.body.appendChild(scriptTag), this.checkIfFullyLoaded()
        },
        zipOnProgress: function(e) {
            var percentLoaded = e.loaded / e.total * 50;
            this.dispatchEvent({
                type: "progress",
                percentLoaded: percentLoaded.toFixed(0)
            })
        },
        checkIfFullyLoaded: function() {
            this.assetsToLoad--;
            var percentLoaded = 100 * (.5 + (this.totalAssets - this.assetsToLoad) / this.totalAssets * .5);
            this.dispatchEvent({
                type: "progress",
                percentLoaded: percentLoaded.toFixed(0)
            }), 0 === this.assetsToLoad && (this.loaded = !0, this.dispatchEvent({
                type: "load",
                percentLoaded: 100,
                assets: this.assets
            }))
        }
    }, THREE.EventDispatcher.prototype.apply(GS.ZipAssetLoader.prototype), GS.GridFactory = function(viewFactory, soundManager, renderer, scene, camera) {
        this.viewFactory = viewFactory, this.soundManager = soundManager, this.renderer = renderer, this.scene = scene, this.camera = camera, this.gridCellSize = 8
    }, GS.GridFactory.prototype = {
        constructor: GS.GridFactory,
        getGrid: function(map) {
            for (var hCells = Math.ceil((map.bounds.max.x - map.bounds.min.x) / this.gridCellSize), vCells = Math.ceil((map.bounds.max.y - map.bounds.min.y) / this.gridCellSize), cells = [], i = 0; i < vCells; i++) {
                cells[i] = [];
                for (var j = 0; j < hCells; j++) {
                    var min = new THREE.Vector2(j * this.gridCellSize, i * this.gridCellSize).add(map.bounds.min),
                        max = new THREE.Vector2((j + 1) * this.gridCellSize, (i + 1) * this.gridCellSize).add(map.bounds.min),
                        box2 = new THREE.Box2(min, max);
                    cells[i][j] = {
                        box2: box2,
                        children: [],
                        x: j,
                        y: i
                    }
                }
            }
            var grid = new GS.Grid(this.renderer, this.scene);
            return grid.clearScene(), grid.cellSize = this.gridCellSize, grid.cells = cells, grid.width = hCells, grid.height = vCells, grid.map = map, grid.regionInfo = this.getRegions(map), grid.soundManager = this.soundManager, this.assignMapEntitiesToGrid(grid), this.addPlayerToGrid(grid), grid.initSkybox(this.viewFactory.getSkyboxMesh()), grid.init(), grid
        },
        getRegions: function(map) {
            var sectors = map.layerObjects[GS.MapLayers.Sector],
                sectorLinks = map.sectorLinks;
            if (void 0 === sectorLinks) return void GAME.handleFatalError("invalid map - sector links not found");
            var regionHelper = new GS.RegionHelper;
            return regionHelper.getRegions(sectors, sectorLinks)
        },
        addPlayerToGrid: function(grid) {
            var playerView = this.viewFactory.getPlayerView();
            grid.player = new GS.Player(grid, this.camera, playerView);
            var position = new THREE.Vector3;
            position.x = grid.map.playerStartPosition.x, position.y = 0, position.z = grid.map.playerStartPosition.y - 1e-4, grid.player.position = position;
            var gridLocation = grid.getGridLocationFromPoints([grid.map.playerStartPosition]);
            grid.player.assignToCells(gridLocation), grid.player.view.debugMesh = this.viewFactory.getDebugMesh(position, grid.player.size)
        },
        assignMapEntitiesToGrid: function(grid) {
            for (var sectorDict = {}, sectors = grid.map.layerObjects[GS.MapLayers.Sector], i = 0; i < sectors.length; i++) {
                var sector = sectors[i];
                sectorDict[sector.id] = sector;
                var hasFloor = sector.elevator !== !0,
                    hasCeiling = sector.ceiling === !0 && sector.door !== !0,
                    gridLocation = grid.getGridLocationFromPoints(sector.collisionVertices);
                if (hasFloor || hasCeiling) {
                    if (hasFloor) {
                        var floor = new GS.Concrete(grid, GS.MapLayers.Sector, sector);
                        floor.region = this.getRegionBySectorId(grid, sector.id), this.viewFactory.applySectorView(floor, !1), floor.assignToCells(gridLocation)
                    }
                    if (hasCeiling) {
                        var ceiling = new GS.Concrete(grid, GS.MapLayers.Sector, sector);
                        ceiling.region = this.getRegionBySectorId(grid, sector.id), this.viewFactory.applySectorView(ceiling, !0), ceiling.assignToCells(gridLocation)
                    }
                }
                sector.door === !0 ? this.addDoor(grid, gridLocation, sector) : sector.elevator === !0 && this.addElevator(grid, gridLocation, sector)
            }
            for (var segs = grid.map.layerObjects[GS.MapLayers.Segment], i = 0; i < segs.length; i++) {
                var seg = segs[i],
                    points = [];
                points.push((new THREE.Vector2).copy(seg.start)), points.push((new THREE.Vector2).copy(seg.end));
                var gridLocation = grid.getGridLocationFromPoints(points);
                if (seg.type !== GS.SegmentTypes.TVScreen && seg.type !== GS.SegmentTypes.Switch) {
                    var gridObject = new GS.Concrete(grid, GS.MapLayers.Segment, seg);
                    gridObject.sector = sectorDict[seg.sectorId], gridObject.region = this.getRegionBySectorId(grid, seg.sectorId), this.viewFactory.applySegmentView(gridObject), gridObject.assignToCells(gridLocation)
                } else seg.type === GS.SegmentTypes.TVScreen ? this.addTVScreen(grid, gridLocation, seg) : seg.type === GS.SegmentTypes.Switch && this.addSwitch(grid, gridLocation, seg)
            }
            for (var entities = grid.map.layerObjects[GS.MapLayers.Entity], i = 0; i < entities.length; i++) {
                var ntt = entities[i],
                    type = GS.MapEntities[ntt.type].type,
                    gridObject = new GS[type](grid, GS.MapLayers.Entity, ntt),
                    offset = gridObject.offset,
                    size = gridObject.size;
                gridObject.position = offset.clone(), gridObject.position.x += ntt.pos.x, gridObject.position.y += ntt.y || 0, gridObject.position.z += ntt.pos.y, gridObject.isStatic = ntt.isStatic;
                var points = [ntt.pos.clone().add(new THREE.Vector2(offset.x, offset.z)).sub(new THREE.Vector2(size.x, size.z)), ntt.pos.clone().add(new THREE.Vector2(offset.x, offset.z)).add(new THREE.Vector2(size.x, size.z))],
                    gridLocation = grid.getGridLocationFromPoints(points);
                this.viewFactory.applyEntityView(gridObject), gridObject.assignToCells(gridLocation), gridObject.startingSector = gridObject.getSector()
            }
        },
        addDoor: function(grid, gridLocation, sector) {
            var door = new GS.Door(grid, sector);
            this.viewFactory.applyDoorView(door), door.assignToCells(gridLocation), sector.doorOpenedEver = !1
        },
        addElevator: function(grid, gridLocation, sector) {
            var elevator = new GS.Elevator(grid, sector);
            this.viewFactory.applyElevatorView(elevator), elevator.assignToCells(gridLocation)
        },
        addTVScreen: function(grid, gridLocation, seg) {
            var tvScreen = new GS.TVScreen(grid, seg);
            this.viewFactory.applyTVScreenView(tvScreen), tvScreen.assignToCells(gridLocation)
        },
        addSwitch: function(grid, gridLocation, seg) {
            var switchObj = new GS.Switch(grid, seg);
            this.viewFactory.applySwitchView(switchObj), switchObj.assignToCells(gridLocation)
        },
        getRegionBySectorId: function(grid, sectorId) {
            for (var regions = grid.regionInfo.regions, i = 0; i < regions.length; i++)
                if (sectorId in regions[i].sectorIds) return regions[i];
            GAME.handleFatalError("sector has no corresponding region")
        }
    }, GS.ViewFactory = function(renderer, map, assets) {
        this.renderer = renderer, this.map = map, this.textures = assets[GS.AssetTypes.Texture], this.cubeTextures = assets[GS.AssetTypes.CubeTexture], this.meshes = assets[GS.AssetTypes.Mesh], this.anisotropy = renderer.getMaxAnisotropy(), this.debugBoundingBoxMaterial = new THREE.MeshBasicMaterial({
            color: 16777215,
            wireframe: !0
        }), this.debugTriangleMaterial = new THREE.MeshBasicMaterial({
            color: 49407,
            wireframe: !0
        }), this.texScale = 16, this.triangleCount = 0
    }, GS.ViewFactory.prototype = {
        constructor: GS.ViewFactory,
        init: function() {
            var that = this;
            Object.keys(this.textures).forEach(function(key) {
                that.textures[key].anisotropy = that.anisotropy
            }), this.materials = {};
            var textureAssets = GS.Assets[GS.AssetTypes.Texture];
            for (var i in textureAssets) {
                var tex = textureAssets[i];
                tex.type === GS.TextureTypes.Map ? (this.wrap(this.textures[i]), this.materials[i] = new THREE.MeshPhongMaterial({
                    map: this.textures[i]
                })) : tex.type === GS.TextureTypes.TVScreen && (this.textures[i].flipY = !1)
            }
            for (var entities = this.map.layerObjects[GS.MapLayers.Entity], entityMaterials = {}, i = 0; i < entities.length; i++) {
                var ntt = entities[i],
                    desc = GS.MapEntities[ntt.type],
                    name = desc.name;
                void 0 === entityMaterials[name] && (entityMaterials[name] = !0, this.materials[name] = new GS.MeshPhongGlowMaterial(this.textures[name], this.textures[name + "_glow"]))
            }
            this.vertexColorMaterial = new GS.MeshVertexColorMaterial;
            for (var i in GS.Weapons) this.wrap(this.textures[i]), this.materials[i] = new GS.MeshPhongGlowMaterial(this.textures[i], this.textures[i + "_glow"])
        },
        getSkyboxMesh: function() {
            var name = "skybox1",
                tex = this.cubeTextures[name];
            tex.format = THREE.RGBFormat;
            var shader = THREE.ShaderLib.cube,
                uniforms = THREE.UniformsUtils.clone(shader.uniforms);
            uniforms.tCube.value = tex;
            var material = new THREE.ShaderMaterial({
                    fragmentShader: shader.fragmentShader,
                    vertexShader: shader.vertexShader,
                    uniforms: uniforms,
                    depthWrite: !1,
                    side: THREE.BackSide
                }),
                geometry = new THREE.BoxGeometry(1e3, 1e3, 1e3),
                mesh = new THREE.Mesh(geometry, material);
            return mesh
        },
        wrap: function(tex) {
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping
        },
        applySegmentView: function(gridObject) {
            var seg = gridObject.sourceObj,
                geometry = new THREE.Geometry,
                triangles = this.getSegmentDefinedTriangles(seg);
            GS.pushArray(geometry.vertices, triangles);
            var length, distance = seg.start.distanceTo(seg.end);
            length = distance > this.texScale ? Math.round(distance / (this.texScale * this.texScale) * this.texScale) : distance / this.texScale;
            for (var color = new THREE.Color(seg.lightColor), emissive = this.getEmissiveColor(gridObject.sector.lightLevel), i = 0; i < triangles.length; i += 3) {
                var face = new THREE.Face3(i, i + 1, i + 2, null, color);
                face.emissive = emissive, geometry.faces.push(face)
            }
            geometry.computeFaceNormals(), geometry.computeVertexNormals(), gridObject.region.mesh.geometry.merge(geometry), gridObject.view.collisionData.triangles = this.getSegmentTriangles(seg), this.applyConcreteBoundingBox(gridObject, triangles), this.triangleCount += gridObject.view.collisionData.triangles.length / 3
        },
        getEmissiveColor: function(lightLevel) {
            var lightLevelFactor = .1,
                minLightLevel = .1,
                maxLightLevel = .75,
                x = lightLevel * lightLevelFactor;
            return x *= x, x = GS.MathHelper.clamp(x, minLightLevel, maxLightLevel), new THREE.Color(16777215).multiplyScalar(x)
        },
        applySectorView: function(gridObject, ceiling) {
            var geometry, sector = gridObject.sourceObj,
                triangles = [];
            if (ceiling) {
                var hasCeiling = void 0 === sector.ceiling || sector.ceiling;
                hasCeiling && (geometry = this.getSectorGeometry(sector, triangles, !0), gridObject.region.mesh.geometry.merge(geometry))
            } else sector.elevator !== !0 && (geometry = this.getSectorGeometry(sector, triangles, !1), gridObject.region.mesh.geometry.merge(geometry));
            gridObject.view.collisionData.triangles = triangles, this.applyConcreteBoundingBox(gridObject, triangles), this.triangleCount += triangles.length / 3
        },
        applyConcreteBoundingBox: function(gridObject, triangles) {
            var boundingBox = (new THREE.Box3).setFromPoints(triangles),
                center = boundingBox.min.clone().add(boundingBox.max).divideScalar(2),
                debugMesh = this.getDebugMesh(center);
            debugMesh.scale.copy(boundingBox.max).sub(boundingBox.min).addScalar(.01), gridObject.view.collisionData.boundingBox = boundingBox, gridObject.view.debugMesh = debugMesh
        },
        getSectorGeometry: function(sector, sectorTriangles, ceiling) {
            var geometry = new THREE.Geometry,
                triangles = this.getSectorTriangles(sector, ceiling);
            GS.pushArray(geometry.vertices, triangles), GS.pushArray(sectorTriangles, this.getSectorTriangles(sector, ceiling, !0));
            for (var emissive = this.getEmissiveColor(sector.lightLevel), color = new THREE.Color(ceiling ? sector.ceilingCatColor : sector.lightColor), j = 0; j < triangles.length; j += 3) {
                var face = new THREE.Face3(j, j + 1, j + 2, null, color);
                face.emissive = emissive, geometry.faces.push(face)
            }
            return geometry.computeFaceNormals(), geometry.computeVertexNormals(), geometry
        },
        getSegmentDefinedTriangles: function(seg) {
            for (var triangles = [], bottomRightIndex = 0, i = 0; i < seg.indices.length; i += 3) triangles.push(seg.vertices[seg.indices[i]]), triangles.push(seg.vertices[seg.indices[i + 1]]), triangles.push(seg.vertices[seg.indices[i + 2]]), seg.indices[i + 2] == seg.bottomRightIndex && (bottomRightIndex = i + 3);
            return seg.bottomRightIndex = bottomRightIndex, triangles
        },
        getSegmentTriangles: function(seg) {
            var triangles = [];
            return triangles.push(new THREE.Vector3(seg.start.x, seg.topY, seg.start.y)), triangles.push(new THREE.Vector3(seg.end.x, seg.topY, seg.end.y)), triangles.push(new THREE.Vector3(seg.start.x, seg.bottomY, seg.start.y)), triangles.push(new THREE.Vector3(seg.end.x, seg.topY, seg.end.y)), triangles.push(new THREE.Vector3(seg.end.x, seg.bottomY, seg.end.y)), triangles.push(new THREE.Vector3(seg.start.x, seg.bottomY, seg.start.y)), triangles
        },
        getSectorTriangles: function(sector, ceiling, getCollisionTriangles) {
            var triangles = [],
                v = sector.vertices,
                idx = sector.indices;
            if (getCollisionTriangles && (v = sector.collisionVertices, idx = sector.collisionIndices), ceiling)
                for (var i = 0; i < idx.length; i += 3) triangles.push(new THREE.Vector3(v[idx[i]].x, sector.ceilBottomY, v[idx[i]].y)), triangles.push(new THREE.Vector3(v[idx[i + 1]].x, sector.ceilBottomY, v[idx[i + 1]].y)), triangles.push(new THREE.Vector3(v[idx[i + 2]].x, sector.ceilBottomY, v[idx[i + 2]].y));
            else
                for (var i = 0; i < idx.length; i += 3) triangles.push(new THREE.Vector3(v[idx[i + 2]].x, sector.floorTopY, v[idx[i + 2]].y)), triangles.push(new THREE.Vector3(v[idx[i + 1]].x, sector.floorTopY, v[idx[i + 1]].y)), triangles.push(new THREE.Vector3(v[idx[i]].x, sector.floorTopY, v[idx[i]].y));
            return triangles
        },
        applyEntityView: function(gridObject) {
            var vertices = GS.Cube.getVertices();
            return function(gridObject) {
                var mesh, that = this,
                    ntt = gridObject.sourceObj,
                    desc = GS.MapEntities[ntt.type],
                    name = GS.MapEntities[ntt.type].name,
                    offset = gridObject.offset,
                    scale = gridObject.scale,
                    size = gridObject.size,
                    material = this.materials[name].clone();
                if (void 0 === desc.animations) mesh = this.meshes[name].clone(), mesh.material = material;
                else {
                    mesh = new THREE.Object3D;
                    var data = mesh.userData;
                    data.animations = {}, Object.keys(desc.animations).forEach(function(key) {
                        var count = desc.animations[key];
                        data.animations[key] = [];
                        for (var i = 0; i < count; i++) {
                            var animationName = name + "_" + key + i,
                                animMesh = that.meshes[animationName].clone();
                            animMesh.visible = !1, animMesh.material = material, data.animations[key].push(animMesh), mesh.add(animMesh)
                        }
                    })
                }
                if (mesh.position.copy(offset), mesh.position.copy(gridObject.position), mesh.scale.copy(scale), gridObject.view.mesh = mesh, gridObject.view.debugMesh = this.getDebugMesh(gridObject.position), gridObject instanceof GS.Monster) {
                    gridObject.view.collisionData.triangles = [];
                    for (var i = 0; i < vertices.length; i++) {
                        var v = vertices[i].clone();
                        v.multiply(size).add(gridObject.view.mesh.position), gridObject.view.collisionData.triangles.push(v)
                    }
                    gridObject.view.collisionData.boundingSquare.setFromPoints([gridObject.position.toVector2().sub(gridObject.size.toVector2()), gridObject.position.toVector2().add(gridObject.size.toVector2())])
                }
            }
        }(),
        getSegmentsForMovingSector: function(gridObject, elevator) {
            for (var sector = gridObject.sector, segs = [], i = 0; i < sector.collisionVertices.length - 1; i++) segs.push({
                start: sector.collisionVertices[i].clone(),
                end: sector.collisionVertices[i + 1].clone()
            });
            if (segs.push({
                    start: sector.collisionVertices[i].clone(),
                    end: sector.collisionVertices[0].clone()
                }), elevator !== !0)
                for (var i = 0; i < segs.length; i++) segs[i].bottomY = sector.floorTopY, segs[i].topY = sector.ceilBottomY;
            else
                for (var i = 0; i < segs.length; i++) segs[i].bottomY = sector.floorTopY - sector.elevatorMaxHeight, segs[i].topY = sector.floorTopY;
            return segs
        },
        applyDoorView: function(door) {
            var triangles = [];
            door.position = this.getMovingSectorPosition(door), door.view.collisionData.segments = this.getSegmentsForMovingSector(door, !1);
            var centerMaterial = this.vertexColorMaterial,
                sideMaterial = this.vertexColorMaterial;
            door.sector.useVertexColors || (centerMaterial = this.materials[door.sector.ceilTexId].clone(), sideMaterial = this.materials[door.sector.sideTexId].clone());
            var mesh = new THREE.Object3D;
            mesh.children.push(this.getMovingSectorCenterMesh(door, triangles, centerMaterial)), mesh.children.push(this.getMovingSectorSideMesh(door, triangles, sideMaterial)), mesh.children[0].position.copy(door.position), mesh.children[1].position.copy(door.position), door.view.mesh = mesh, door.view.collisionData.triangles = triangles, door.view.debugMesh = this.getDebugMesh(door.position);
            var box = door.view.collisionData.boundingBox;
            box.setFromPoints(triangles), door.size = box.max.clone().sub(box.min).divideScalar(2), this.triangleCount += triangles.length / 3
        },
        applyElevatorView: function(elevator) {
            var triangles = [];
            elevator.position = this.getMovingSectorPosition(elevator, !0), elevator.view.collisionData.segments = this.getSegmentsForMovingSector(elevator, !0);
            var centerMaterial = this.vertexColorMaterial,
                sideMaterial = this.vertexColorMaterial;
            elevator.sector.useVertexColors || (centerMaterial = this.materials[elevator.sector.floorTexId].clone(), sideMaterial = this.materials[elevator.sector.sideTexId].clone());
            var mesh = new THREE.Object3D;
            mesh.children.push(this.getMovingSectorCenterMesh(elevator, triangles, centerMaterial, !0)), mesh.children.push(this.getMovingSectorSideMesh(elevator, triangles, sideMaterial, !0)), mesh.children[0].position.copy(elevator.position), mesh.children[1].position.copy(elevator.position), elevator.view.mesh = mesh, elevator.view.collisionData.triangles = triangles, elevator.view.debugMesh = this.getDebugMesh(elevator.position);
            var box = elevator.view.collisionData.boundingBox;
            box.setFromPoints(triangles), elevator.size = box.max.clone().sub(box.min).divideScalar(2), this.triangleCount += triangles.length / 3
        },
        getMovingSectorPosition: function(movingSector, elevator) {
            var box = (new THREE.Box2).setFromPoints(movingSector.sector.vertices),
                center = box.min.clone().add(box.max).divideScalar(2),
                pos = new THREE.Vector3(center.x, 0, center.y);
            return elevator !== !0 ? pos.y = (movingSector.sector.floorTopY + movingSector.sector.ceilBottomY) / 2 : pos.y = movingSector.sector.floorTopY - movingSector.sector.elevatorMaxHeight / 2, pos
        },
        getMovingSectorSideMesh: function(movingSector, movingSectorTriangles, material, elevator) {
            var bottomY, topY;
            elevator !== !0 ? (bottomY = movingSector.sector.floorTopY, topY = movingSector.sector.ceilBottomY) : (bottomY = movingSector.sector.floorTopY - movingSector.sector.elevatorMaxHeight, topY = movingSector.sector.floorTopY);
            for (var geometry = new THREE.Geometry, color = new THREE.Color(movingSector.sector.lightColor), emissive = this.getEmissiveColor(movingSector.sector.lightLevel), triangles = [], k = 0, i = 0; i < movingSector.sector.vertices.length; i++) {
                var length, next = i < movingSector.sector.vertices.length - 1 ? i + 1 : 0,
                    start = movingSector.sector.vertices[i],
                    end = movingSector.sector.vertices[next],
                    distance = start.distanceTo(end);
                length = distance > this.texScale ? Math.round(distance / (this.texScale * this.texScale) * this.texScale) : distance / this.texScale;
                for (var vertices = [new THREE.Vector3(start.x, topY, start.y), new THREE.Vector3(end.x, topY, end.y), new THREE.Vector3(start.x, bottomY, start.y), new THREE.Vector3(end.x, topY, end.y), new THREE.Vector3(end.x, bottomY, end.y), new THREE.Vector3(start.x, bottomY, start.y)], j = 0; j < vertices.length; j++) triangles.push(vertices[j].clone());
                for (var j = 0; j < vertices.length; j++) vertices[j].sub(movingSector.position);
                if (GS.pushArray(geometry.vertices, vertices), movingSector.sector.useVertexColors) {
                    var face1 = new THREE.Face3(k, k + 1, k + 2, null, color);
                    face1.emissive = emissive, geometry.faces.push(face1);
                    var face2 = new THREE.Face3(k + 3, k + 4, k + 5, null, color);
                    face2.emissive = emissive, geometry.faces.push(face2)
                } else geometry.faces.push(new THREE.Face3(k, k + 1, k + 2)), geometry.faces.push(new THREE.Face3(k + 3, k + 4, k + 5)), geometry.faceVertexUvs[0].push([new THREE.Vector2(0, topY / this.texScale), new THREE.Vector2(length, topY / this.texScale), new THREE.Vector2(0, bottomY / this.texScale)]), geometry.faceVertexUvs[0].push([new THREE.Vector2(length, topY / this.texScale), new THREE.Vector2(length, bottomY / this.texScale), new THREE.Vector2(0, bottomY / this.texScale)]);
                k += 6
            }
            if (GS.pushArray(movingSectorTriangles, triangles), geometry.computeFaceNormals(), geometry.computeVertexNormals(), movingSector.sector.useVertexColors) {
                var bufferGeo = (new THREE.BufferGeometry).fromGeometry(geometry, {
                    vertexColors: THREE.FaceColors
                });
                return new THREE.Mesh(bufferGeo, material)
            }
            return new THREE.Mesh(geometry, material)
        },
        getMovingSectorCenterMesh: function(movingSector, movingSectorTriangles, material, elevator) {
            for (var v0, v1, v2, minHeight = movingSector.sector.floorTopY, geometry = new THREE.Geometry, color = new THREE.Color(movingSector.sector.lightColor), emissive = this.getEmissiveColor(movingSector.sector.lightLevel), v = movingSector.sector.vertices, idx = movingSector.sector.indices, i = 0; i < idx.length; i += 3) {
                if (elevator === !0 ? (v0 = new THREE.Vector3(v[idx[i + 2]].x, minHeight, v[idx[i + 2]].y), v1 = new THREE.Vector3(v[idx[i + 1]].x, minHeight, v[idx[i + 1]].y), v2 = new THREE.Vector3(v[idx[i]].x, minHeight, v[idx[i]].y)) : (v0 = new THREE.Vector3(v[idx[i]].x, minHeight, v[idx[i]].y), v1 = new THREE.Vector3(v[idx[i + 1]].x, minHeight, v[idx[i + 1]].y), v2 = new THREE.Vector3(v[idx[i + 2]].x, minHeight, v[idx[i + 2]].y)), movingSector.sector.useVertexColors) {
                    var face = new THREE.Face3(i, i + 1, i + 2, null, color);
                    face.emissive = emissive, geometry.faces.push(face)
                } else geometry.faces.push(new THREE.Face3(i, i + 1, i + 2)), geometry.faceVertexUvs[0].push([new THREE.Vector2(v0.x / this.texScale, v0.z / this.texScale), new THREE.Vector2(v1.x / this.texScale, v1.z / this.texScale), new THREE.Vector2(v2.x / this.texScale, v2.z / this.texScale)]);
                v0.sub(movingSector.position), v1.sub(movingSector.position), v2.sub(movingSector.position), geometry.vertices.push(v0), geometry.vertices.push(v1), geometry.vertices.push(v2)
            }
            v = movingSector.sector.collisionVertices, idx = movingSector.sector.collisionIndices;
            for (var i = 0; i < idx.length; i += 3) elevator === !0 ? (v0 = new THREE.Vector3(v[idx[i + 2]].x, minHeight, v[idx[i + 2]].y), v1 = new THREE.Vector3(v[idx[i + 1]].x, minHeight, v[idx[i + 1]].y), v2 = new THREE.Vector3(v[idx[i]].x, minHeight, v[idx[i]].y)) : (v0 = new THREE.Vector3(v[idx[i]].x, minHeight, v[idx[i]].y), v1 = new THREE.Vector3(v[idx[i + 1]].x, minHeight, v[idx[i + 1]].y), v2 = new THREE.Vector3(v[idx[i + 2]].x, minHeight, v[idx[i + 2]].y)), movingSectorTriangles.push(v0), movingSectorTriangles.push(v1), movingSectorTriangles.push(v2);
            if (geometry.computeFaceNormals(), geometry.computeVertexNormals(), movingSector.sector.useVertexColors) {
                var bufferGeo = (new THREE.BufferGeometry).fromGeometry(geometry, {
                    vertexColors: THREE.FaceColors
                });
                return new THREE.Mesh(bufferGeo, material)
            }
            return new THREE.Mesh(geometry, material)
        },
        applyTVScreenView: function(tvScreen) {
            tvScreen.view.mesh = this.getTVScreenMesh(tvScreen), tvScreen.view.mesh.material = new THREE.MeshBasicMaterial({
                map: this.textures[tvScreen.segment.texId],
                depthWrite: !1,
                polygonOffset: !0,
                polygonOffsetFactor: -4,
                transparent: !0
            })
        },
        applySwitchView: function(switchObj) {
            switchObj.segment.bottomY += 8, switchObj.segment.topY = switchObj.segment.bottomY + 8, switchObj.view.mesh = this.getTVScreenMesh(switchObj), switchObj.view.collisionData.boundingBox.setFromPoints([new THREE.Vector3(switchObj.segment.start.x, switchObj.segment.bottomY, switchObj.segment.start.y), new THREE.Vector3(switchObj.segment.end.x, switchObj.segment.topY, switchObj.segment.end.y)]), switchObj.view.textureOn = this.textures.switch_on, switchObj.view.textureOff = this.textures.switch_off, switchObj.view.mesh.material = new THREE.MeshBasicMaterial({
                map: switchObj.view.textureOff,
                depthWrite: !1,
                polygonOffset: !0,
                polygonOffsetFactor: -4,
                transparent: !0
            })
        },
        getTVScreenMesh: function(tvScreen) {
            var seg = tvScreen.segment,
                geometry = new THREE.Geometry,
                triangles = this.getSegmentTriangles(seg);
            GS.pushArray(geometry.vertices, triangles), geometry.faces.push(new THREE.Face3(0, 1, 2)), geometry.faces.push(new THREE.Face3(3, 4, 5)), geometry.faceVertexUvs[0].push([new THREE.Vector2(1, 0), new THREE.Vector2(0, 0), new THREE.Vector2(1, 1)]), geometry.faceVertexUvs[0].push([new THREE.Vector2(0, 0), new THREE.Vector2(0, 1), new THREE.Vector2(1, 1)]), geometry.computeFaceNormals(), geometry.computeVertexNormals();
            var mesh = new THREE.Mesh(geometry, (void 0));
            return mesh.matrixAutoUpdate = !1, mesh.renderDepth = 1e3, mesh
        },
        getPlayerView: function() {
            for (var playerView = new GS.PlayerView, weapons = Object.keys(GS.Weapons), i = 0; i < weapons.length; i++) {
                var name = weapons[i];
                if (void 0 !== this.meshes[name]) {
                    var material = this.materials[name].clone(),
                        mesh = this.meshes[name].clone();
                    mesh.material = material, playerView.addWeaponMesh(name, mesh)
                }
            }
            return playerView.init(), playerView
        },
        getDebugMesh: function(position) {
            var debugGeometry = new THREE.BoxGeometry(1, 1, 1),
                debugMesh = new THREE.Mesh(debugGeometry, this.debugBoundingBoxMaterial);
            return debugMesh.position.copy(position), debugMesh
        },
        getDebugTriangleMesh: function(triangles) {
            var debugGeometry = new THREE.Geometry;
            GS.pushArray(debugGeometry.vertices, triangles);
            for (var i = 0; i < triangles.length; i += 3) debugGeometry.faces.push(new THREE.Face3(i, i + 1, i + 2));
            var debugMesh = new THREE.Mesh(debugGeometry, this.debugTriangleMaterial);
            return debugMesh.userData.isTriangleMesh = !0, debugMesh.matrixAutoUpdate = !1, debugMesh
        }
    }, THREE.EventDispatcher.prototype.apply(GS.ViewFactory.prototype), GS.AIManager = function(grid) {
        this.grid = grid, this.map = grid.map, this.mapWon = !1, this.monstersKilled = 0, this.maxMonsters = 0, this.itemsPickedUp = 0, this.maxItems = 0, this.lastFrameTime = performance.now(), this.timeSpent = 0, this.minutes = 0, this.seconds = 0, this.regionsDiscovered = {}
    }, GS.AIManager.prototype = {
        init: function() {
            this.initZones(), this.sectorDict = this.grid.regionInfo.sectorDict, this.regions = this.grid.regionInfo.regions;
            for (var i = 0; i < this.regions.length; i++) this.regions[i].mesh.visible = !1;
            this.assignMonstersToRegions(), this.initGridObjectLibrary(), this.initScripts()
        },
        initZones: function() {
            this.zones = this.map.layerObjects[GS.MapLayers.Zone];
            for (var i = 0; i < this.zones.length; i++) {
                var zone = this.zones[i];
                zone.boundingSquare = (new THREE.Box2).setFromPoints([zone.start, zone.end])
            }
        },
        assignMonstersToRegions: function() {
            var that = this;
            this.grid.forEachUniqueGridObject([GS.Monster], function(monster) {
                if (void 0 === monster.startingSector) return void GAME.handleFatalError("monster " + monster.id + " has no starting sector");
                var region = that.getRegionBySectorId(monster.startingSector.id);
                return void 0 === region ? void GAME.handleFatalError("sector not in region") : void region.monsters.push(monster)
            })
        },
        initGridObjectLibrary: function() {
            var library = {
                items: {},
                doors: {},
                elevators: {},
                monsters: {},
                sectors: {},
                switches: {}
            };
            this.grid.forEachUniqueGridObject([GS.Item, GS.Door, GS.Elevator, GS.Monster, GS.Concrete, GS.Switch], function(gridObject) {
                gridObject instanceof GS.Item ? library.items[gridObject.sourceObj.id] = gridObject : gridObject instanceof GS.Door ? library.doors[gridObject.sector.id] = gridObject : gridObject instanceof GS.Elevator ? library.elevators[gridObject.sector.id] = gridObject : gridObject instanceof GS.Monster ? library.monsters[gridObject.sourceObj.id] = gridObject : gridObject instanceof GS.Concrete && gridObject.type == GS.MapLayers.Sector ? library.sectors[gridObject.sourceObj.id] = gridObject : gridObject instanceof GS.Switch && (library.switches[gridObject.segment.id] = gridObject)
            }), this.gridObjectLibrary = library
        },
        initScripts: function() {
            if (this.map.hasScript === !0) {
                this.script = new GS.MapScripts[this.map.name](this.gridObjectLibrary), this.script.init();
                for (var entities = this.grid.map.layerObjects[GS.MapLayers.Entity], i = 0; i < entities.length; i++) {
                    var entity = entities[i],
                        type = GS.MapEntities[entity.type].type;
                    "Monster" === type ? this.maxMonsters++ : "Item" === type && this.maxItems++
                }
            }
        },
        update: function() {
            void 0 !== this.script && (this.script.update(), this.script.mapWon && !this.mapWon && (this.mapWon = !0)), this.mapWon || this.updateTime()
        },
        updateTime: function() {
            this.grid.player.inMenu || (this.timeSpent += performance.now() - this.lastFrameTime, this.minutes = Math.floor(Math.floor(this.timeSpent) / 6e4), this.seconds = Math.floor(Math.floor(this.timeSpent) / 1e3 - 60 * this.minutes)), this.lastFrameTime = performance.now()
        },
        resume: function() {
            this.lastFrameTime = performance.now()
        },
        onMonsterDeath: function() {
            this.monstersKilled++
        },
        onPlayerMove: function(player, oldPos, newPos) {
            void 0 !== this.script && this.checkZones(player, oldPos, newPos), this.wakeUpNearbyMonsters(player), this.applyRegionVisibility(player)
        },
        onPlayerShoot: function(player) {
            this.activateNearbyMonsters(player)
        },
        onPlayerOpenDoor: function(door) {
            void 0 !== this.script && this.script.onPlayerOpenDoor(door)
        },
        onPlayerItemPickup: function(player, item) {
            this.itemsPickedUp++, void 0 !== this.script && this.script.onItemPickup(item)
        },
        onSwitchStateChange: function(switchObj) {
            void 0 !== this.script && this.script.onSwitchStateChange(switchObj)
        },
        applyRegionVisibility: function(player) {
            for (var i = 0; i < this.regions.length; i++) this.regions[i].reachedThisFrame = !1;
            var visibleRegions = 0;
            this.propagateRegions(player, function(region) {
                region.reachedThisFrame = !0, region.mesh.visible = !0, visibleRegions++
            });
            for (var i = 0; i < this.regions.length; i++) {
                var region = this.regions[i];
                region.mesh.visible && !region.reachedThisFrame && (region.mesh.visible = !1)
            }
        },
        checkZones: function() {
            var oldPos2d = new THREE.Vector2,
                newPos2d = new THREE.Vector2;
            return function(player, oldPos, newPos) {
                oldPos.toVector2(oldPos2d), newPos.toVector2(newPos2d);
                for (var i = 0; i < this.zones.length; i++) {
                    var zone = this.zones[i],
                        c1 = zone.boundingSquare.containsPoint(oldPos2d),
                        c2 = zone.boundingSquare.containsPoint(newPos2d);
                    c1 && !c2 ? this.script.onZoneLeave(zone) : !c1 && c2 && this.script.onZoneEnter(zone)
                }
            }
        }(),
        wakeUpNearbyMonsters: function(player) {
            var that = this;
            this.propagateRegions(player, function(region) {
                that.wakeUpMonsters(region)
            })
        },
        activateNearbyMonsters: function(player) {
            var that = this;
            this.propagateRegions(player, function(region) {
                that.activateMonsters(region)
            })
        },
        propagateRegions: function(player, callback) {
            var sector = player.getSector();
            if (void 0 !== sector)
                for (var toVisit = [this.getRegionBySectorId(sector.id)], visited = {}; toVisit.length > 0;) {
                    var region = toVisit.pop();
                    if (!(region.id in visited) && (visited[region.id] = !0, this.regionsDiscovered[region.id] = region, callback(region), void 0 !== region.linkedRegions))
                        for (var i = 0; i < region.linkedRegions.length; i++) {
                            var linked = region.linkedRegions[i],
                                sector = this.sectorDict[linked.doorId].sector;
                            sector.doorGridObject.state !== GS.DoorStates.Closed && toVisit.push(linked.region)
                        }
                }
        },
        wakeUpMonsters: function(region) {
            if (!region.awake) {
                for (var i = 0; i < region.monsters.length; i++) region.monsters[i].wakeUp();
                region.awake = !0
            }
        },
        activateMonsters: function(region) {
            if (!region.active) {
                for (var i = 0; i < region.monsters.length; i++) region.monsters[i].activate();
                region.active = !0
            }
        },
        getRegionBySectorId: function(sectorId) {
            for (var i = 0; i < this.regions.length; i++) {
                var region = this.regions[i];
                if (sectorId in region.sectorIds) return region
            }
            GAME.handleFatalError("sector has no corresponding region")
        }
    }, GS.ChromeAppFPSControls = function(camera) {
        this.camera = camera, this.eye = new THREE.Vector3, this.followingEye = new THREE.Vector3, this.look = new THREE.Vector3(0, 0, (-10)).add(this.eye), this.lookNoOffset = this.look.clone(), this.moveSpeed = 1, this.lookSpeed = .066 * (GS.Settings.mouse / 5), this.mouseInvertY = GS.Settings.mouseInvertY, this.forwardLookVector = new THREE.Vector3(0, 0, (-1)), this.forwardMoveVector = new THREE.Vector3(0, 0, (-1)), this.rightLookVector = new THREE.Vector3(1, 0, 0), this.rightMoveVector = new THREE.Vector3(1, 0, 0), this.xAngle = 270, this.yAngle = 90, this.viewOffsetY = 0, this.eyeOffsetY = 3.5, this.pointerLockEnabled = !1, this.onHandleCollisions = function(oldPos, newPos) {}, this.enabled = !0, this.fly = !1, this.ySmoothing = !1, this.ySmoothingFactor = .1
    }, GS.ChromeAppFPSControls.prototype = {
        constructor: GS.ChromeAppFPSControls,
        init: function() {
            var pointerLock = "pointerLockElement" in document;
            return pointerLock ? (this.canvas = $("#game-canvas")[0], this.debugCanvas = $("#debug-ui-canvas")[0], void this.setViewAngles(this.xAngle, this.yAngle)) : void GAME.handleFatalError("Pointer Lock API not supported")
        },
        enable: function() {
            var that = this;
            this.canvas.requestPointerLock(), $(document).off("mousemove.fpsControls"), $(document).on("mousemove.fpsControls", function(e) {
                that.onMouseMove(e.originalEvent)
            })
        },
        disable: function() {
            document.exitPointerLock(), $(document).off("mousemove.fpsControls")
        },
        onMouseMove: function(e) {
            if (this.enabled) {
                var mx = e.movementX || e.mozMovementX || e.webkitMovementX || 0,
                    my = e.movementY || e.mozMovementY || e.webkitMovementY || 0,
                    invertY = this.mouseInvertY ? -1 : 1;
                this.setViewAngles(this.xAngle + mx * this.lookSpeed, this.yAngle + invertY * my * this.lookSpeed)
            }
        },
        setViewOffsetY: function(y) {
            this.viewOffsetY = y
        },
        update: function() {
            if (this.enabled) {
                var x = 0,
                    z = 0;
                GS.Keybinds.moveForward.inUse && z++, GS.Keybinds.moveBackward.inUse && z--, GS.Keybinds.strafeLeft.inUse && x--, GS.Keybinds.strafeRight.inUse && x++, this.move(x, z), this.dispatchEvent({
                    type: "update",
                    pos: this.eye,
                    xAngle: this.xAngle,
                    yAngle: this.yAngle,
                    look: this.lookNoOffset
                })
            }
        },
        moveTo: function(pos) {
            this.eye.copy(pos), this.updateCamera()
        },
        move: function() {
            var newPos = new THREE.Vector3,
                aux = new THREE.Vector3;
            return function(x, z) {
                newPos.copy(this.eye), 0 === x && 0 === z || (aux.copy(this.rightMoveVector).multiplyScalar(this.moveSpeed * x), newPos.add(aux), aux.copy(this.forwardMoveVector).multiplyScalar(this.moveSpeed * z), newPos.add(aux)), this.onHandleCollisions(this.eye, newPos), this.eye.copy(newPos), this.updateCamera()
            }
        }(),
        updateCamera: function() {
            this.followingEye.x = this.eye.x, this.followingEye.z = this.eye.z, this.ySmoothing ? this.followingEye.y != this.eye.y && (this.followingEye.y = this.followingEye.y + this.ySmoothingFactor * (this.eye.y - this.followingEye.y)) : this.followingEye.y = this.eye.y, this.camera.position.copy(this.followingEye), this.camera.position.y += this.viewOffsetY + this.eyeOffsetY, this.lookNoOffset.addVectors(this.followingEye, this.forwardLookVector), this.look.addVectors(this.camera.position, this.forwardLookVector), this.camera.lookAt(this.look)
        },
        setViewAngles: function() {
            var right = new THREE.Vector3,
                forward = new THREE.Vector3;
            return function(x, y) {
                this.xAngle = x, this.yAngle = GS.MathHelper.clamp(y, 10, 170);
                var x = Math.sin(Math.PI / 180 * this.yAngle) * Math.cos(Math.PI / 180 * this.xAngle),
                    y = Math.cos(Math.PI / 180 * this.yAngle),
                    z = Math.sin(Math.PI / 180 * this.yAngle) * Math.sin(Math.PI / 180 * this.xAngle);
                forward.set(x, y, z), x = Math.sin(Math.PI / 180 * this.yAngle) * Math.cos(Math.PI / 180 * (this.xAngle + 90)), z = Math.sin(Math.PI / 180 * this.yAngle) * Math.sin(Math.PI / 180 * (this.xAngle + 90)), right.set(x, 0, z), this.forwardLookVector.copy(forward), this.fly ? this.forwardMoveVector.copy(forward).normalize() : this.forwardMoveVector.set(forward.x, 0, forward.z).normalize(), this.rightLookVector.copy(right).normalize(), this.rightMoveVector.copy(right).normalize(), this.updateCamera()
            }
        }(),
        dispose: function(callback) {
            this.onHandleCollisions = void 0, this.disable()
        }
    }, THREE.EventDispatcher.prototype.apply(GS.ChromeAppFPSControls.prototype), GS.CollisionTypes = {
        None: 0,
        Environment: 1,
        Entity: 2
    }, GS.CollisionManager = function(grid) {
        this.grid = grid, this.gravity = 1.33
    }, GS.CollisionManager.prototype = {
        init: function() {},
        collidePlayer: function() {
            var oldPosBeforeMove = new THREE.Vector3;
            return function(player, oldPos, newPos) {
                oldPosBeforeMove.copy(oldPos), this.collidePlayerEnvironment(player, oldPos, newPos), this.updateGridLocationEllipsoid(player, newPos), this.collidePlayerItems(player), this.updatePlayerUseTarget(player), this.grid.aiManager.onPlayerMove(player, oldPosBeforeMove, newPos)
            }
        }(),
        collidePlayerEnvironment: function() {
            var points = [new THREE.Vector2, new THREE.Vector2, new THREE.Vector2, new THREE.Vector2],
                points3d = [new THREE.Vector3, new THREE.Vector3, new THREE.Vector3, new THREE.Vector3],
                velocityBoundingBox = new THREE.Box3,
                types = [GS.Monster, GS.Concrete, GS.Door, GS.Elevator];
            return function(player, oldPos, newPos) {
                var lsp = player.view.collisionData.ellipsoid;
                points[0].set(oldPos.x + lsp.x, oldPos.z + lsp.z), points[1].set(oldPos.x - lsp.x, oldPos.z - lsp.z), points[2].set(newPos.x + lsp.x, newPos.z + lsp.z), points[3].set(newPos.x - lsp.x, newPos.z - lsp.z);
                var gridLocation = this.grid.getGridLocationFromPoints(points);
                if (points3d[0].copy(oldPos).sub(player.size), points3d[1].copy(oldPos).add(player.size), points3d[2].copy(newPos).sub(player.size), points3d[3].copy(newPos).add(player.size), velocityBoundingBox.setFromPoints(points3d), velocityBoundingBox.expandByScalar(2 * this.gravity), void 0 !== gridLocation) {
                    var triangleIterator = this.grid.getTriangleIterator(gridLocation, types, function(gridObject) {
                            return !(gridObject instanceof GS.Monster && gridObject.dead) && gridObject.view.collisionData.boundingBox.isIntersectionBox(velocityBoundingBox)
                        }),
                        gravity = player.flyEnabled ? 0 : this.gravity,
                        result = GS.CollisionHelper.handleCollisionsSliding(oldPos, newPos, gravity, lsp, triangleIterator);
                    player.afterCollision(result)
                }
            }
        }(),
        slidingBoxLineCollision: function() {
            var newPos0 = new THREE.Vector2,
                aux = new THREE.Vector2,
                slideVelocity = new THREE.Vector2,
                epsilon = .005;
            return function(oldPos, newPos, box, lineSegmentIterator) {
                function iterator(seg) {
                    GAME.grid.totalBoxSegmentChecks++;
                    var result = box.isIntersectionLineSwept(oldPos, newPos0, seg);
                    if (result.foundCollision) {
                        foundCollision = !0, aux.copy(newPos0).sub(result.pos);
                        var m = -aux.dot(result.normal);
                        slideVelocity.copy(aux), aux.copy(result.normal).multiplyScalar(m), slideVelocity.add(aux), aux.copy(result.pos).sub(newPos0).normalize().multiplyScalar(epsilon), result.pos.add(aux), newPos0.copy(result.pos).add(slideVelocity)
                    }
                }
                newPos0.copy(newPos);
                for (var foundCollision, k = 0; k < 5 && (foundCollision = !1, lineSegmentIterator(iterator), foundCollision);) k++;
                newPos.copy(newPos0)
            }
        }(),
        collidePlayerItems: function(player) {
            this.grid.forEachUniqueGridObjectInCells(player.linkedGridCells, [GS.Item], function(item) {
                player.view.collisionData.boundingBox.isIntersectionBox(item.view.collisionData.boundingBox) && player.onItemCollision(item)
            })
        },
        updatePlayerUseTarget: function(player) {
            var ray = new THREE.Ray,
                position = new THREE.Vector3,
                endPoint = new THREE.Vector3,
                aux = new THREE.Vector3,
                points = [new THREE.Vector2, new THREE.Vector2],
                usableTypes = [GS.Door, GS.Switch];
            return function(player) {
                player.useTarget = null, position.copy(player.position), position.y += player.controls.eyeOffsetY, ray.set(position, player.direction), aux.copy(player.direction).multiplyScalar(player.useRange), endPoint.copy(position).add(aux), position.toVector2(points[0]), endPoint.toVector2(points[1]);
                var gridLocation = this.grid.getGridLocationFromPoints(points);
                if (void 0 !== gridLocation) {
                    var cells = this.grid.getCellsFromGridLocation(gridLocation),
                        minDist = 1 / 0,
                        minObject = null;
                    this.grid.forEachUniqueGridObjectInCells(cells, usableTypes, function(gridObject) {
                        if (null !== ray.intersectsOrStartsInBox(gridObject.view.collisionData.boundingBox, aux)) {
                            var dist = aux.distanceTo(position);
                            dist <= player.useRange && dist < minDist && (minDist = dist, minObject = gridObject)
                        }
                    }), player.useTarget = minObject, player.canUse = null !== minObject && minObject.usable
                }
            }
        }(),
        checkMonsterLineOfSight: function() {
            var direction = new THREE.Vector3,
                position = new THREE.Vector3,
                typesEnvironment = [GS.Elevator, GS.Door, GS.Concrete],
                typesEntity = [GS.Player];
            return function(monster, target, range) {
                position.copy(monster.position), direction.copy(target.position).sub(monster.position).normalize();
                var steps = Math.ceil(range / GS.HitscanHelper.unitLength),
                    result = GS.HitscanHelper.getIntersection(position, direction, this.grid, typesEnvironment, typesEntity, steps, monster);
                return result.type === GS.CollisionTypes.Entity && result.gridObject === target
            }
        }(),
        collideMonster: function(monster, oldPos, newPos) {
            this.collideMonsterPlayerEnvironment(monster, oldPos, newPos), this.updateGridLocationEllipsoid(monster, newPos)
        },
        collideMonsterPlayerEnvironment: function() {
            var points = [new THREE.Vector2, new THREE.Vector2, new THREE.Vector2, new THREE.Vector2],
                types = [GS.Player, GS.Monster],
                aux = new THREE.Vector3,
                velocity = new THREE.Vector2,
                velocityBox = new THREE.Box2;
            return function(monster, oldPos, newPos) {
                var lsp = monster.view.collisionData.ellipsoid;
                points[0].set(oldPos.x + lsp.x, oldPos.z + lsp.z), points[1].set(oldPos.x - lsp.x, oldPos.z - lsp.z), points[2].set(newPos.x + lsp.x, newPos.z + lsp.z), points[3].set(newPos.x - lsp.x, newPos.z - lsp.z);
                var gridLocation = this.grid.getGridLocationFromPoints(points);
                if (void 0 !== gridLocation && (this.handleConcreteCollisions(gridLocation, oldPos, newPos, monster.size), points[0].set(oldPos.x + lsp.x, oldPos.z + lsp.z), points[1].set(oldPos.x - lsp.x, oldPos.z - lsp.z), points[2].set(newPos.x + lsp.x, newPos.z + lsp.z), points[3].set(newPos.x - lsp.x, newPos.z - lsp.z), gridLocation = this.grid.getGridLocationFromPoints(points), void 0 !== gridLocation)) {
                    var cells = this.grid.getCellsFromGridLocation(gridLocation);
                    aux.subVectors(newPos, oldPos).toVector2(velocity), velocityBox.copy(monster.view.collisionData.boundingSquare), velocityBox.min.add(velocity), velocityBox.max.add(velocity);
                    var foundCollision = !1,
                        collisionGridObject = null;
                    if (this.grid.forEachUniqueGridObjectInCells(cells, types, function(gridObject) {
                            foundCollision || gridObject === monster || gridObject instanceof GS.Monster && gridObject.dead || velocityBox.isIntersectionBox(gridObject.view.collisionData.boundingSquare) && (foundCollision = !0, collisionGridObject = gridObject)
                        }), foundCollision) {
                        var y = newPos.y;
                        newPos.copy(oldPos), newPos.y = y, collisionGridObject instanceof GS.Monster && monster.scatter()
                    } else;
                }
            }
        }(),
        handleConcreteCollisions: function() {
            var oldPos2d = new THREE.Vector2,
                newPos2d = new THREE.Vector2,
                size2d = new THREE.Vector2,
                box = new THREE.Box2,
                boxNew = new THREE.Box2;
            return function(gridLocation, oldPos, newPos, size) {
                oldPos.toVector2(oldPos2d), newPos.toVector2(newPos2d), size.toVector2(size2d), box.min.copy(oldPos2d).sub(size2d), box.max.copy(oldPos2d).add(size2d), boxNew.min.copy(newPos2d).sub(size2d), boxNew.max.copy(newPos2d).add(size2d);
                var cells = this.grid.getCellsFromGridLocation(gridLocation),
                    newSector = this.getSectorHeights(cells, boxNew),
                    condition = function() {
                        return !0
                    };
                if (void 0 !== newSector) {
                    var newHeight = (newPos.y - size.y, newSector.floorHeight);
                    if (Math.abs(newSector.ceilHeight - newSector.floorHeight) >= 2 * size.y) {
                        newPos.y = newHeight + size.y;
                        var minHeight = newPos.y - size.y + .03,
                            maxHeight = newPos.y + size.y + .03;
                        condition = function(seg) {
                            return seg.bottomY >= minHeight && seg.bottomY <= maxHeight || seg.topY >= minHeight && seg.topY <= maxHeight || seg.bottomY < minHeight && seg.topY > maxHeight
                        }
                    }
                    var segmentIterator = this.grid.getSegmentIterator(gridLocation, condition);
                    this.slidingBoxLineCollision(oldPos2d, newPos2d, box, segmentIterator), newPos.x = newPos2d.x, newPos.z = newPos2d.y
                } else newPos.copy(oldPos)
            }
        }(),
        getSectorHeights: function(cells, box) {
            var sector, heights = [],
                result = {
                    floorHeight: -(1 / 0),
                    ceilHeight: 1 / 0
                };
            if (this.grid.forEachUniqueGridObjectInCells(cells, [GS.Concrete, GS.Elevator], function(gridObject) {
                    if (gridObject instanceof GS.Concrete) {
                        if (gridObject.type !== GS.MapLayers.Sector) return;
                        sector = gridObject.sourceObj
                    } else sector = gridObject.sector;
                    if (GAME.grid.totalBoxSectorChecks++, GS.PolygonHelper.intersectionSectorBox(sector, box)) {
                        var floorHeight = sector.floorTopY;
                        floorHeight > result.floorHeight && (result.floorHeight = floorHeight, result.ceilHeight = sector.ceiling === !0 ? sector.ceilBottomY : 1 / 0), heights.push(floorHeight)
                    }
                }), heights.length > 0) {
                heights.sort();
                for (var distance, maxDistance = 0, i = 0; i < heights.length - 1; i++) distance = Math.abs(heights[i + 1] - heights[i]), distance > maxDistance && (maxDistance = distance);
                if (maxDistance <= 6) return result
            }
        },
        isEntityNearDoor: function(door, types) {
            types = types || [GS.Monster, GS.Player];
            var collided = !1,
                doorBoundingBox = door.view.collisionData.boundingBox;
            return this.grid.forEachUniqueGridObjectInCells(door.linkedGridCells, types, function(gridObject) {
                collided || !gridObject.dead && doorBoundingBox.isIntersectionBox(gridObject.view.collisionData.boundingBox) && (collided = !0)
            }), collided
        },
        elevatorMove: function() {
            var newPos = new THREE.Vector3,
                pos2d = new THREE.Vector2;
            return function(elevator, velocity) {
                var types = [GS.Item];
                velocity > 0 && (types.push(GS.Monster), types.push(GS.Player));
                var boundingBox, elevatorBoundingBox = elevator.view.collisionData.boundingBox;
                this.grid.forEachUniqueGridObjectInCells(elevator.linkedGridCells, types, function(gridObject) {
                    if (!(gridObject instanceof GS.Item && gridObject.isStatic === !0) && (boundingBox = gridObject.view.collisionData.boundingBox, boundingBox.isIntersectionBox(elevatorBoundingBox))) {
                        if (gridObject instanceof GS.Item)
                            if (void 0 !== gridObject.elevatorId) {
                                if (gridObject.elevatorId != elevator.id) return
                            } else {
                                if (gridObject.position.toVector2(pos2d), !GS.PolygonHelper.sectorContainsPoint(elevator.sector, pos2d, !0)) return;
                                gridObject.elevatorId = elevator.id
                            } newPos.copy(gridObject.position), newPos.y += velocity, gridObject.updateCollisionData(newPos)
                    }
                })
            }
        }(),
        collideProjectile: function() {
            var points = [new THREE.Vector2, new THREE.Vector2, new THREE.Vector2, new THREE.Vector2],
                normal = new THREE.Vector3;
            return function(projectile, oldPos, newPos) {
                var lsp = projectile.view.collisionData.ellipsoid;
                points[0].set(oldPos.x + lsp.x, oldPos.z + lsp.z), points[1].set(oldPos.x - lsp.x, oldPos.z - lsp.z), points[2].set(newPos.x + lsp.x, newPos.z + lsp.z), points[3].set(newPos.x - lsp.x, newPos.z - lsp.z);
                var gridLocation = this.grid.getGridLocationFromPoints(points);
                if (void 0 !== gridLocation) {
                    var result = {
                        type: GS.CollisionTypes.None,
                        pos: new THREE.Vector3,
                        gridObject: null,
                        distance: 1 / 0,
                        normal: new THREE.Vector3
                    };
                    this.collideProjectileEnvironment(projectile, gridLocation, oldPos, newPos, result), this.collideProjectileEntities(projectile, gridLocation, oldPos, newPos, result), result.type !== GS.CollisionTypes.None ? (result.type === GS.CollisionTypes.Environment ? (this.grid.addEnvironmentImpactParticles(result.pos, result.normal, projectile.color), result.gridObject.onHit()) : result.type === GS.CollisionTypes.Entity && (result.gridObject.constructor === projectile.sourceGridObject.constructor ? (normal.copy(result.pos).sub(projectile.position).normalize(), this.grid.addEnvironmentImpactParticles(result.pos, normal, projectile.color)) : (this.grid.addEntityImpactParticles(result.pos, result.gridObject.bloodColor), result.gridObject.onHit(projectile.damage))), projectile.updateCollisionData(result.pos), projectile.onHit()) : projectile.updateCollisionData(newPos), projectile.removed || this.updateGridLocationEllipsoid(projectile, newPos)
                }
            }
        }(),
        collideProjectileEnvironment: function() {
            var points3d = [new THREE.Vector3, new THREE.Vector3, new THREE.Vector3, new THREE.Vector3],
                velocityBoundingBox = new THREE.Box3,
                types = [GS.Concrete, GS.Door, GS.Elevator];
            return function(projectile, gridLocation, oldPos, newPos, result) {
                var lsp = projectile.view.collisionData.ellipsoid;
                points3d[0].copy(oldPos).sub(projectile.size), points3d[1].copy(oldPos).add(projectile.size), points3d[2].copy(newPos).sub(projectile.size), points3d[3].copy(newPos).add(projectile.size), velocityBoundingBox.setFromPoints(points3d);
                var triangleIterator = this.grid.getTriangleIterator(gridLocation, types, function(gridObject) {
                        return gridObject.view.collisionData.boundingBox.isIntersectionBox(velocityBoundingBox)
                    }),
                    triangleResult = GS.CollisionHelper.handleCollisionsFirstHit(oldPos, newPos, 0, lsp, triangleIterator);
                if (triangleResult.foundCollision) {
                    var dist = oldPos.distanceToSquared(triangleResult.pos);
                    dist < result.distance && (result.type = GS.CollisionTypes.Environment, result.pos.copy(triangleResult.pos), result.normal.copy(triangleResult.normal), result.distance = dist, result.gridObject = triangleResult.gridObject)
                }
            }
        }(),
        collideProjectileEntities: function() {
            var collisionPoint = (new THREE.Vector3, new THREE.Vector3),
                types = [GS.Monster, GS.Player];
            return function(projectile, gridLocation, oldPos, newPos, result) {
                var gridObjectBox, projectileBox = projectile.view.collisionData.boundingBox,
                    cells = this.grid.getCellsFromGridLocation(gridLocation);
                this.grid.forEachUniqueGridObjectInCells(cells, types, function(gridObject) {
                    if (!gridObject.dead && projectile.sourceGridObject !== gridObject && (gridObjectBox = gridObject.view.collisionData.boundingBox, projectileBox.isIntersectionBoxSwept(oldPos, newPos, gridObjectBox, gridObject.position, collisionPoint))) {
                        var dist = oldPos.distanceToSquared(collisionPoint);
                        dist < result.distance && (result.type = GS.CollisionTypes.Entity, result.pos.copy(collisionPoint), result.distance = dist, result.gridObject = gridObject)
                    }
                })
            }
        }(),
        updateGridLocationEllipsoid: function() {
            var points = [new THREE.Vector2, new THREE.Vector2];
            return function(gridObject, newPos) {
                var lsp = gridObject.view.collisionData.ellipsoid;
                points[0].set(newPos.x + lsp.x, newPos.z + lsp.z), points[1].set(newPos.x - lsp.x, newPos.z - lsp.z);
                var gridLocation = this.grid.getGridLocationFromPoints(points);
                gridObject.assignToCells(gridLocation), gridObject.updateCollisionData(newPos)
            }
        }(),
        hitscan: function(sourceGridObject, projectileStart, weapon, xAngle, yAngle) {
            var that = this,
                typesEnvironment = [GS.Concrete, GS.Door, GS.Elevator],
                typesEntity = [];
            sourceGridObject instanceof GS.Player && typesEntity.push(GS.Monster), GS.HitscanHelper.spread(weapon, xAngle, yAngle, function(dir) {
                var result = GS.HitscanHelper.getIntersection(projectileStart, dir, that.grid, typesEnvironment, typesEntity);
                result.type === GS.CollisionTypes.Environment ? (that.grid.addEnvironmentImpactParticles(result.pos, result.normal, weapon.impactParticleColor, weapon.impactParticleCount), result.gridObject.onHit()) : result.type === GS.CollisionTypes.Entity && (that.grid.addEntityImpactParticles(result.pos, result.gridObject.bloodColor), result.gridObject.onHit(weapon.damage))
            })
        }
    }, GS.FPSControls = function(camera) {
        this.camera = camera, this.eye = new THREE.Vector3, this.followingEye = new THREE.Vector3, this.look = new THREE.Vector3(0, 0, (-10)).add(this.eye), this.lookNoOffset = this.look.clone(), this.moveSpeed = 1, this.lookSpeed = .066 * (GS.Settings.mouse / 5), this.mouseInvertY = GS.Settings.mouseInvertY, this.forwardLookVector = new THREE.Vector3(0, 0, (-1)), this.forwardMoveVector = new THREE.Vector3(0, 0, (-1)), this.rightLookVector = new THREE.Vector3(1, 0, 0), this.rightMoveVector = new THREE.Vector3(1, 0, 0), this.xAngle = 270, this.yAngle = 90, this.viewOffsetY = 0, this.eyeOffsetY = 3.5, this.pointerLockEnabled = !1, this.onHandleCollisions = function(oldPos, newPos) {}, this.enabled = !0, this.fly = !1, this.ySmoothing = !1, this.ySmoothingFactor = .1
    }, GS.FPSControls.prototype = {
        constructor: GS.FPSControls,
        init: function() {
            var pointerLock = "pointerLockElement" in document || "mozPointerLockElement" in document || "webkitPointerLockElement" in document;
            if (!pointerLock) throw "Pointer Lock API not supported";
            this.attachEvents(), this.setViewAngles(this.xAngle, this.yAngle)
        },
        attachEvents: function() {
            var that = this;
            $(document).on("pointerlockchange.fpsControls", function(e) {
                that.onPointerLockChange(e)
            }), $(document).on("mozpointerlockchange.fpsControls", function(e) {
                that.onPointerLockChange(e)
            }), $(document).on("webkitpointerlockchange.fpsControls", function(e) {
                that.onPointerLockChange(e)
            }), $(document).on("pointerlockerror.fpsControls", function(e) {
                that.onPointerLockError(e)
            }), $(document).on("mozpointerlockerror.fpsControls", function(e) {
                that.onPointerLockError(e)
            }), $(document).on("webkitpointerlockerror.fpsControls", function(e) {
                that.onPointerLockError(e)
            }), this.canvas = $("#game-canvas")[0], this.debugCanvas = $("#debug-ui-canvas")[0];
            var rightMouseDown = !1;
            $(this.debugCanvas).on("mousedown.fpsControls", function(e) {
                3 == e.which && (rightMouseDown = !0)
            }), $(this.debugCanvas).on("mouseup.fpsControls", function(e) {
                3 == e.which && rightMouseDown && (rightMouseDown = !1, that.enable())
            })
        },
        detachEvents: function() {
            $(this.debugCanvas).off("mousedown.fpsControls"), $(this.debugCanvas).off("mouseup.fpsControls"), $(document).off("pointerlockchange.fpsControls"), $(document).off("mozpointerlockchange.fpsControls"), $(document).off("webkitpointerlockchange.fpsControls"), $(document).off("pointerlockerror.fpsControls"), $(document).off("mozpointerlockerror.fpsControls"), $(document).off("webkitpointerlockerror.fpsControls")
        },
        enable: function() {
            this.pointerLockEnabled || (this.canvas.requestPointerLock = this.canvas.requestPointerLock || this.canvas.mozRequestPointerLock || this.canvas.webkitRequestPointerLock, this.canvas.requestPointerLock())
        },
        disable: function() {
            this.pointerLockEnabled && (document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock, document.exitPointerLock())
        },
        onPointerLockChange: function(e) {
            var that = this,
                isCanvas = document.pointerLockElement === this.canvas || document.mozPointerLockElement === this.canvas || document.webkitPointerLockElement === this.canvas;
            isCanvas ? (this.pointerLockEnabled = !0, $(document).on("mousemove.fpsControls", function(e) {
                that.onMouseMove(e.originalEvent)
            }), this.dispatchEvent({
                type: "pointerLockEnabled"
            })) : (this.pointerLockEnabled = !1, $(document).off("mousemove.fpsControls"), void 0 !== this.disposeCallback ? (this.detachEvents(), this.disposeCallback()) : this.dispatchEvent({
                type: "pointerLockDisabled"
            }))
        },
        onPointerLockError: function() {},
        onMouseMove: function(e) {
            if (this.enabled) {
                var mx = e.movementX || e.mozMovementX || e.webkitMovementX || 0,
                    my = e.movementY || e.mozMovementY || e.webkitMovementY || 0,
                    invertY = this.mouseInvertY ? -1 : 1;
                this.setViewAngles(this.xAngle + mx * this.lookSpeed, this.yAngle + invertY * my * this.lookSpeed)
            }
        },
        setViewOffsetY: function(y) {
            this.viewOffsetY = y
        },
        update: function() {
            if (this.enabled) {
                var x = 0,
                    z = 0;
                GS.Keybinds.moveForward.inUse && z++, GS.Keybinds.moveBackward.inUse && z--, GS.Keybinds.strafeLeft.inUse && x--, GS.Keybinds.strafeRight.inUse && x++, this.move(x, z), this.dispatchEvent({
                    type: "update",
                    pos: this.eye,
                    xAngle: this.xAngle,
                    yAngle: this.yAngle,
                    look: this.lookNoOffset
                })
            }
        },
        moveTo: function(pos) {
            this.eye.copy(pos), this.updateCamera()
        },
        move: function() {
            var newPos = new THREE.Vector3,
                aux = new THREE.Vector3;
            return function(x, z) {
                newPos.copy(this.eye), 0 === x && 0 === z || (aux.copy(this.rightMoveVector).multiplyScalar(this.moveSpeed * x), newPos.add(aux), aux.copy(this.forwardMoveVector).multiplyScalar(this.moveSpeed * z), newPos.add(aux)), this.onHandleCollisions(this.eye, newPos), this.eye.copy(newPos), this.updateCamera()
            }
        }(),
        updateCamera: function() {
            this.followingEye.x = this.eye.x, this.followingEye.z = this.eye.z, this.ySmoothing ? this.followingEye.y != this.eye.y && (this.followingEye.y = this.followingEye.y + this.ySmoothingFactor * (this.eye.y - this.followingEye.y)) : this.followingEye.y = this.eye.y, this.camera.position.copy(this.followingEye), this.camera.position.y += this.viewOffsetY + this.eyeOffsetY, this.lookNoOffset.addVectors(this.followingEye, this.forwardLookVector), this.look.addVectors(this.camera.position, this.forwardLookVector), this.camera.lookAt(this.look)
        },
        setViewAngles: function() {
            var right = new THREE.Vector3,
                forward = new THREE.Vector3;
            return function(x, y) {
                this.xAngle = x, this.yAngle = GS.MathHelper.clamp(y, 10, 170);
                var x = Math.sin(Math.PI / 180 * this.yAngle) * Math.cos(Math.PI / 180 * this.xAngle),
                    y = Math.cos(Math.PI / 180 * this.yAngle),
                    z = Math.sin(Math.PI / 180 * this.yAngle) * Math.sin(Math.PI / 180 * this.xAngle);
                forward.set(x, y, z), x = Math.sin(Math.PI / 180 * this.yAngle) * Math.cos(Math.PI / 180 * (this.xAngle + 90)), z = Math.sin(Math.PI / 180 * this.yAngle) * Math.sin(Math.PI / 180 * (this.xAngle + 90)), right.set(x, 0, z), this.forwardLookVector.copy(forward), this.fly ? this.forwardMoveVector.copy(forward).normalize() : this.forwardMoveVector.set(forward.x, 0, forward.z).normalize(), this.rightLookVector.copy(right).normalize(), this.rightMoveVector.copy(right).normalize(), this.updateCamera()
            }
        }(),
        dispose: function(callback) {
            this.pointerLockEnabled && (this.disposeCallback = callback), this.onHandleCollisions = void 0, this.disable(), this.pointerLockEnabled || (this.detachEvents(), callback())
        }
    }, THREE.EventDispatcher.prototype.apply(GS.FPSControls.prototype), GS.GraphicsManager = function(renderer, camera) {
        this.renderer = renderer, this.camera = camera, this.noPostProcessing = !1, this.noiseTextureSize = 256,
            this.showWeapon = GS.Settings.showWeapon
    }, GS.GraphicsManager.prototype = {
        init: function() {
            this.initEffectComposer(), this.bloomEnabled = GS.Settings.bloom, this.fxaaEnabled = GS.Settings.fxaa, this.ssaoEnabled = GS.Settings.ssao, this.noiseEnabled = GS.Settings.noise, this.vignetteEnabled = GS.Settings.vignette, this.halfSizeEnabled = GS.Settings.halfSize, this.monochromeEnabled = !1
        },
        setGrid: function(grid) {
            var that = this;
            this.grid = grid, this.scene = grid.scene, that.effectColor.uniforms.color.value.setRGB(0, 0, 0), grid.player.playerView.addEventListener("screenOverlayColorChange", function(e) {
                that.effectColor.uniforms.color.value.copy(e.color)
            })
        },
        initEffectComposer: function() {
            this.composer = new THREE.EffectComposer(this.renderer);
            var depthShader = THREE.ShaderLib.depthRGBA,
                depthUniforms = THREE.UniformsUtils.clone(depthShader.uniforms);
            this.depthMaterial = new THREE.ShaderMaterial({
                fragmentShader: depthShader.fragmentShader,
                vertexShader: depthShader.vertexShader,
                uniforms: depthUniforms
            }), this.depthMaterial.blending = THREE.NoBlending, this.depthTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
                minFilter: THREE.NearestFilter,
                magFilter: THREE.NearestFilter,
                format: THREE.RGBAFormat
            }), this.effectSSAO = new THREE.ShaderPass(THREE.SSAOShader), this.effectSSAO.uniforms.tDepth.value = this.depthTarget, this.effectSSAO.uniforms.size.value.set(window.innerWidth, window.innerHeight), this.effectSSAO.uniforms.cameraNear.value = this.camera.near, this.effectSSAO.uniforms.cameraFar.value = this.camera.far, this.effectFilter = new THREE.ShaderPass(GS.BrightnessFilterShader), this.effectBloom = new THREE.BloomPass(1, 25, 4, 512), this.effectBloom.needsSwap = !0, this.effectGlow = new THREE.ShaderPass(GS.GlowShader), this.effectGlow.uniforms.tGlow.value = this.effectBloom.renderTargetY, this.effectGlow.uniforms.intensity.value = 1, this.effectColor = new THREE.ShaderPass(GS.ColorShader), this.effectColor.uniforms.color.value = new THREE.Color(0), this.effectFXAA = new THREE.ShaderPass(THREE.FXAAShader), this.effectFXAA.uniforms.resolution.value.set(1 / window.innerWidth, 1 / window.innerHeight), this.effectVignette = new THREE.ShaderPass(THREE.VignetteShader), this.effectNoise = new THREE.ShaderPass(GS.NoiseShader), this.effectNoise.uniforms.tNoise.value = this.getNoiseTexture(this.noiseTextureSize), this.effectNoise.uniforms.ratio.value.set(window.innerWidth / this.noiseTextureSize, window.innerHeight / this.noiseTextureSize), this.effectMonochrome = new THREE.ShaderPass(THREE.LuminosityShader);
            var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
            effectCopy.renderToScreen = !0, this.composer.addPass(this.effectFilter), this.composer.addPass(this.effectBloom), this.composer.addPass(this.effectNoise), this.composer.addPass(this.effectGlow), this.composer.addPass(this.effectSSAO), this.composer.addPass(this.effectColor), this.composer.addPass(this.effectFXAA), this.composer.addPass(this.effectVignette), this.composer.addPass(this.effectMonochrome), this.composer.addPass(effectCopy)
        },
        renderToScreen: function() {
            this.renderer.autoClear = !1, this.renderer.clear(!0, !0, !1), this.renderer.render(this.grid.skybox.scene, this.grid.skybox.camera), this.renderer.render(this.scene, this.camera), this.renderer.clear(!1, !0, !1);
            var playerView = this.grid.player.playerView;
            this.renderer.render(playerView.scene, playerView.camera)
        },
        render: function() {
            var renderTarget = this.composer.renderTarget2;
            if (this.renderer.autoClear = !1, this.renderer.clearTarget(renderTarget, !0, !0, !1), this.renderer.render(this.grid.skybox.scene, this.grid.skybox.camera, renderTarget), this.renderer.render(this.scene, this.camera, renderTarget), this.renderer.clearTarget(renderTarget, !1, !0, !1), this.showWeapon) {
                var playerView = this.grid.player.playerView;
                this.renderer.render(playerView.scene, playerView.camera, renderTarget)
            }
        },
        renderDepthTarget: function() {
            var renderTarget = this.depthTarget;
            if (this.renderer.autoClear = !1, this.renderer.clearTarget(renderTarget, !0, !0, !1), this.scene.overrideMaterial = this.depthMaterial, this.renderer.render(this.scene, this.camera, renderTarget), this.scene.overrideMaterial = null, this.renderer.clearTarget(renderTarget, !1, !0, !1), this.showWeapon) {
                var playerView = this.grid.player.playerView;
                playerView.scene.overrideMaterial = this.depthMaterial, this.renderer.render(playerView.scene, playerView.camera, renderTarget), playerView.scene.overrideMaterial = null
            }
        },
        draw: function() {
            this.noPostProcessing ? this.renderToScreen() : (this.render(), this.ssaoEnabled && this.renderDepthTarget(), this.composer.render())
        },
        onResize: function() {
            var width = window.innerWidth,
                height = window.innerHeight;
            this._halfSizeEnabled && (width *= .5, height *= .5);
            var depthTarget = this.depthTarget.clone();
            depthTarget.width = width, depthTarget.height = height, this.depthTarget = depthTarget, this.effectSSAO.uniforms.tDepth.value = this.depthTarget, this.effectSSAO.uniforms.size.value.set(width, height), this.effectFXAA.uniforms.resolution.value.set(1 / width, 1 / height), this.effectNoise.uniforms.ratio.value.set(width / this.noiseTextureSize, height / this.noiseTextureSize), this.composer.setSize(width, height), $(this.renderer.domElement).css("width", window.innerWidth + "px").css("height", window.innerHeight + "px")
        },
        getNoiseTexture: function(size) {
            size = size || 256;
            var canvas = document.createElement("canvas");
            canvas.width = size, canvas.height = size, canvas.style.backgroundColor = "rgba(255, 255, 255, 1)";
            var ctx = canvas.getContext("2d");
            ctx.globalCompositeOperation = "source-over", ctx.save();
            for (var imageData = ctx.getImageData(0, 0, size, size), i = 0, n = size * size * 4; i < n; i += 4) {
                var x = Math.floor(255 * Math.random());
                imageData.data[i] = x, imageData.data[i + 1] = x, imageData.data[i + 2] = x, imageData.data[i + 3] = 255
            }
            ctx.putImageData(imageData, 0, 0);
            var tex = new THREE.Texture(canvas);
            return tex.wrapS = tex.wrapT = THREE.RepeatWrapping, tex.needsUpdate = !0, tex
        },
        reset: function() {
            this.grid = void 0, this.scene = void 0
        },
        set ssaoEnabled(value) {
            void 0 !== this.effectSSAO && (this.effectSSAO.enabled = value)
        },
        get ssaoEnabled() {
            return this.effectSSAO.enabled
        },
        set bloomEnabled(value) {
            void 0 !== this.effectBloom && (this.effectFilter.enabled = value, this.effectBloom.enabled = value, this.effectGlow.enabled = value)
        },
        get bloomEnabled() {
            return this.effectBloom.enabled
        },
        set fxaaEnabled(value) {
            void 0 !== this.effectFXAA && (this.effectFXAA.enabled = value)
        },
        get fxaaEnabled() {
            return this.effectFXAA.enabled
        },
        set vignetteEnabled(value) {
            void 0 !== this.effectVignette && (this.effectVignette.enabled = value)
        },
        get vignetteEnabled() {
            return this.effectVignette.enabled
        },
        set monochromeEnabled(value) {
            void 0 !== this.effectMonochrome && (this.effectMonochrome.enabled = value)
        },
        get monochromeEnabled() {
            return this.effectMonochrome.enabled
        },
        set noiseEnabled(value) {
            void 0 !== this.effectNoise && (this.effectNoise.enabled = value)
        },
        get noiseEnabled() {
            return this.effectNoise.enabled
        },
        set halfSizeEnabled(value) {
            this._halfSizeEnabled = value, this.onResize()
        },
        get halfSizeEnabled() {
            return this._halfSizeEnabled
        }
    }, GS.Grid = function(renderer, scene) {
        this.renderer = renderer, this.scene = scene, this.concreteMeshes = new THREE.Object3D, this.entityMeshes = new THREE.Object3D, this.stopMonsters = !1, this.debugEntityMeshes = !1, this.debugConcreteMeshes = !1, this.debugCellLines = !1
    }, GS.Grid.prototype = {
        constructor: GS.Grid,
        init: function() {
            this.particleView = new GS.ParticleView(this), this.particleView.init(), this.collisionManager = new GS.CollisionManager(this), this.collisionManager.init(), this.lightingView = new GS.LightingView(this), this.lightingView.init(), this.forEachUniqueGridObject(void 0, function(gridObject) {
                gridObject.init()
            }), this.aiManager = new GS.AIManager(this), this.aiManager.init(), this.addConcreteMeshesToScene(), this.addEntityMeshesToScene(), this.debugCellLines && this.addDebugCellLines()
        },
        initSkybox: function(skyboxMesh) {
            this.skybox = {
                mesh: skyboxMesh,
                scene: new THREE.Scene,
                camera: new THREE.PerspectiveCamera(GS.Settings.fov, window.innerWidth / window.innerHeight, 1, 2e3)
            }, this.skybox.scene.add(skyboxMesh)
        },
        update: function() {
            var that = this;
            this.particleView.update(), this.lightingView.update(), this.aiManager.update(), this.totalSphereTriangleChecks = 0, this.totalBoxSectorChecks = 0, this.totalBoxSegmentChecks = 0;
            this.forEachUniqueGridObject(void 0, function(gridObject) {
                gridObject instanceof GS.Monster ? that.stopMonsters || gridObject.update() : gridObject.update()
            }), 0 === this.player.linkedGridCells.length && this.player.update();
            var rotationMatrix = (new THREE.Matrix4).extractRotation(this.player.camera.matrixWorld);
            this.skybox.camera.rotation.setFromRotationMatrix(rotationMatrix, this.skybox.camera.rotation.order)
        },
        addConcreteMeshesToScene: function() {
            var that = this;
            this.forEachUniqueGridObject([GS.Concrete], function(gridObject) {
                that.debugConcreteMeshes && that.concreteMeshes.children.push(gridObject.view.debugMesh)
            });
            for (var regions = this.regionInfo.regions, i = 0; i < regions.length; i++) {
                var mesh = regions[i].mesh,
                    bufferGeo = new THREE.BufferGeometry;
                bufferGeo.fromGeometry(mesh.geometry, {
                    vertexColors: THREE.FaceColors
                }), mesh.geometry = bufferGeo, this.concreteMeshes.children.push(mesh)
            }
            this.scene.add(this.concreteMeshes)
        },
        addEntityMeshesToScene: function() {
            var that = this;
            this.forEachUniqueGridObject([GS.Item, GS.Monster, GS.Door, GS.Elevator, GS.TVScreen, GS.Switch], function(gridObject) {
                that.debugEntityMeshes && void 0 !== gridObject.view.debugMesh && gridObject.view.mesh.children.push(gridObject.view.debugMesh), that.entityMeshes.children.push(gridObject.view.mesh)
            }), this.scene.add(this.entityMeshes)
        },
        addDebugLine: function(pos0, pos1, color) {
            color = void 0 !== color ? color : 16777215;
            var geometry = new THREE.Geometry;
            geometry.vertices.push(pos0), geometry.vertices.push(pos1);
            var material = new THREE.LineBasicMaterial({
                    color: color
                }),
                line = new THREE.Line(geometry, material);
            this.scene.add(line)
        },
        addDebugCellLines: function() {
            var height = 2,
                color = (new THREE.Color).setRGB(0, 0, .5).getHex(),
                geometry = new THREE.PlaneGeometry(this.width * this.cellSize, this.height * this.cellSize, this.width, this.height),
                material = new THREE.MeshBasicMaterial({
                    color: color,
                    wireframe: !0
                }),
                mesh = new THREE.Mesh(geometry, material);
            mesh.rotation.x = -Math.PI / 2;
            var v = this.map.bounds.min.clone().multiplyScalar(-1);
            v.sub(this.map.bounds.max.clone().sub(this.map.bounds.min).divideScalar(2)), mesh.position.x = -v.x, mesh.position.y = height, mesh.position.z = -v.y, this.scene.add(mesh)
        },
        addProjectile: function(sourceGridObject, type, position, direction) {
            var projectile = new GS.Projectile(this, sourceGridObject, type, position, direction);
            projectile.init(), this.debugEntityMeshes && (projectile.view.debugMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({
                color: 16777215,
                wireframe: !0
            })), this.scene.add(projectile.view.debugMesh)), this.lightingView.addProjectileLight(projectile)
        },
        addEnvironmentImpactParticles: function(position, normal, color, n) {
            n = n || 5;
            for (var i = 0; i < n; i++) {
                var particle = this.particleView.addParticle(1, 1, 1, color, GS.ParticleMovementTypes.Falling, position);
                this.particleView.alignParticleTrajectoryToNormal(particle, normal), particle.mesh.position.copy(position)
            }
        },
        addEntityImpactParticles: function(position, color, n) {
            n = n || 3;
            for (var i = 0; i < n; i++) {
                var particle = this.particleView.addParticle(1, 1, 1, color, GS.ParticleMovementTypes.Gushing, position);
                particle.mesh.position.copy(position)
            }
        },
        getMeshFromBox2: function(box2, material) {
            var geometry = new THREE.Geometry;
            geometry.vertices.push(new THREE.Vector3(box2.min.x, 0, box2.min.y)), geometry.vertices.push(new THREE.Vector3(box2.max.x, 0, box2.min.y)), geometry.vertices.push(new THREE.Vector3(box2.min.x, 0, box2.max.y)), geometry.vertices.push(new THREE.Vector3(box2.max.x, 0, box2.max.y)), geometry.faces.push(new THREE.Face3(0, 1, 2)), geometry.faces.push(new THREE.Face3(1, 3, 2));
            var mesh = new THREE.Mesh(geometry, material);
            return mesh
        },
        addDebugGridLocation: function(gridLocation) {
            var material = new THREE.MeshBasicMaterial({
                    color: 16711935,
                    wireframe: !0
                }),
                mesh = this.getMeshFromBox2(gridLocation.box2, material);
            this.scene.add(mesh)
        },
        forEachUniqueGridObjectInCells: function(cells, types, callback) {
            var gridObjects = {};
            if (void 0 !== types && types.length > 0)
                for (var i = 0; i < cells.length; i++)
                    for (var cell = cells[i], k = 0; k < cell.children.length; k++)
                        for (var gridObject = cell.children[k], e = 0; e < types.length; e++) gridObject instanceof types[e] && (gridObjects[gridObject.id] = gridObject);
            else
                for (var i = 0; i < cells.length; i++)
                    for (var cell = cells[i], k = 0; k < cell.children.length; k++) {
                        var gridObject = cell.children[k];
                        gridObjects[gridObject.id] = gridObject
                    }
            Object.keys(gridObjects).forEach(function(key) {
                callback(gridObjects[key])
            })
        },
        forEachUniqueGridObject: function(types, callback) {
            var gridObjects = {};
            if (void 0 !== types && types.length > 0)
                for (var i = 0; i < this.height; i++)
                    for (var j = 0; j < this.width; j++)
                        for (var cell = this.cells[i][j], k = 0; k < cell.children.length; k++)
                            for (var gridObject = cell.children[k], e = 0; e < types.length; e++) gridObject instanceof types[e] && (gridObjects[gridObject.id] = gridObject);
            else
                for (var i = 0; i < this.height; i++)
                    for (var j = 0; j < this.width; j++)
                        for (var cell = this.cells[i][j], k = 0; k < cell.children.length; k++) {
                            var gridObject = cell.children[k];
                            gridObjects[gridObject.id] = gridObject
                        }
            Object.keys(gridObjects).forEach(function(key) {
                callback(gridObjects[key])
            })
        },
        removeEntityMesh: function(mesh) {
            this.entityMeshes.remove(mesh)
        },
        isPointInMapBounds: function(point) {
            return this.map.bounds.containsPoint(point)
        },
        getGridLocationFromPoints: function(points) {
            var box2 = (new THREE.Box2).setFromPoints(points);
            if (this.map.bounds.isIntersectionBox(box2)) {
                var gridMin = this.getGridCoords(box2.min),
                    gridMax = this.getGridCoords(box2.max);
                return gridMin.x = GS.MathHelper.clamp(gridMin.x, 0, this.width - 1), gridMin.y = GS.MathHelper.clamp(gridMin.y, 0, this.height - 1), gridMax.x = GS.MathHelper.clamp(gridMax.x, 0, this.width - 1), gridMax.y = GS.MathHelper.clamp(gridMax.y, 0, this.height - 1), {
                    box2: box2,
                    gridMin: gridMin,
                    gridMax: gridMax
                }
            }
        },
        getGridCoords: function(point) {
            var p = point.clone().sub(this.map.bounds.min);
            return p.x = Math.floor(p.x / this.cellSize), p.y = Math.floor(p.y / this.cellSize), p
        },
        getCellsFromGridLocation: function(gridLocation) {
            for (var cells = [], min = gridLocation.gridMin, max = gridLocation.gridMax, i = min.y; i <= max.y; i++)
                for (var j = min.x; j <= max.x; j++) cells.push(this.cells[i][j]);
            return cells
        },
        getTriangleIterator: function(gridLocation, types, condition) {
            var that = this,
                cells = that.getCellsFromGridLocation(gridLocation);
            return void 0 === condition ? function(callback) {
                that.forEachUniqueGridObjectInCells(cells, types, function(gridObject) {
                    for (var triangles = gridObject.view.collisionData.triangles, i = 0; i < triangles.length; i += 3) callback(gridObject, triangles[i], triangles[i + 1], triangles[i + 2], i)
                })
            } : function(callback) {
                that.forEachUniqueGridObjectInCells(cells, types, function(gridObject) {
                    if (condition(gridObject))
                        for (var triangles = gridObject.view.collisionData.triangles, i = 0; i < triangles.length; i += 3) callback(gridObject, triangles[i], triangles[i + 1], triangles[i + 2], i)
                })
            }
        },
        getSegmentIterator: function(gridLocation, condition) {
            var that = this,
                cells = that.getCellsFromGridLocation(gridLocation);
            return void 0 === condition ? function(callback) {
                that.forEachUniqueGridObjectInCells(cells, [GS.Concrete, GS.Elevator, GS.Door], function(gridObject) {
                    if (gridObject instanceof GS.Concrete && gridObject.type === GS.MapLayers.Segment) callback(gridObject.sourceObj);
                    else if (gridObject instanceof GS.Elevator || gridObject instanceof GS.Door)
                        for (var segs = gridObject.view.collisionData.segments, i = 0; i < segs.length; i++) callback(segs[i])
                })
            } : function(callback) {
                that.forEachUniqueGridObjectInCells(cells, [GS.Concrete, GS.Elevator, GS.Door], function(gridObject) {
                    if (gridObject instanceof GS.Concrete && gridObject.type === GS.MapLayers.Segment) condition(gridObject.sourceObj) && callback(gridObject.sourceObj);
                    else if (gridObject instanceof GS.Elevator || gridObject instanceof GS.Door)
                        for (var segs = gridObject.view.collisionData.segments, i = 0; i < segs.length; i++) condition(segs[i]) && callback(segs[i])
                })
            }
        },
        clearScene: function() {
            for (var i = this.scene.children.length - 1; i >= 0; i--) {
                var obj = this.scene.children[i];
                this.scene.remove(obj)
            }
        },
        onResize: function() {
            this.skybox.camera.aspect = window.innerWidth / window.innerHeight, this.skybox.camera.updateProjectionMatrix()
        },
        updateFov: function() {
            this.skybox.camera.fov = GS.Settings.fov, this.skybox.camera.updateProjectionMatrix()
        }
    }, GS.MapScript = function(gridObjectLibrary) {
        this.lib = gridObjectLibrary, this.mapName = "map name", this.mapWon = !1, this.nextMap = void 0, this.secretsFound = 0, this.maxSecrets = 0, this.musicTrack = "simple_action_beat"
    }, GS.MapScript.prototype = {
        constructor: GS.MapScript,
        init: function() {},
        update: function() {},
        onZoneEnter: function(zone) {},
        onZoneLeave: function(zone) {},
        onItemPickup: function(item) {},
        onPlayerOpenDoor: function(door) {},
        onSwitchStateChange: function(switchObj) {},
        foundSecret: function() {
            this.secretsFound++, GS.DebugUI.addTempLine("secret found")
        },
        getGridObjectsById: function(type, idArray) {
            var list = [],
                source = this.lib[type];
            for (var i in source) idArray.indexOf(parseInt(i, 10)) != -1 && list.push(source[i]);
            return list
        }
    }, GS.MusicManager = function() {
        this.volume = GS.Settings.music / 10
    }, GS.MusicManager.prototype = {
        init: function() {
            var ctx;
            if ("undefined" != typeof AudioContext) ctx = new AudioContext;
            else {
                if ("undefined" == typeof webkitAudioContext) return void GAME.handleFatalError("No AudioContext support");
                ctx = new webkitAudioContext
            }
            this.ctx = ctx, this.ctx.createGain || (this.ctx.createGain = ctx.createGainNode), this.gainNode = this.ctx.createGain(), this.gainNode.gain.value = this._volume, this.gainNode.connect(this.ctx.destination), this.initTracks()
        },
        playTrack: function(name) {
            this.currentTrack = this.tracks[name], void 0 !== this.source && this.source.stop(0), this.source = this.ctx.createBufferSource(), this.source.buffer = this.currentTrack.buffer, this.source.loop = !0, this.source.connect(this.gainNode), this.source.start || (this.source.start = source.noteOn), this.source.start(0)
        },
        initTracks: function(soundBuffers) {
            this.tracks = {};
            for (var i in soundBuffers) this.tracks[i] = {
                buffer: soundBuffers[i],
                duration: Math.ceil(soundBuffers[i].length / this.ctx.sampleRate * 1e3)
            }
        },
        set volume(value) {
            this._volume = value, void 0 !== this.gainNode && (this.gainNode.gain.value = this._volume)
        },
        get volume() {
            return this._volume
        }
    }, GS.SoundManager = function() {
        this.volume = GS.Settings.sound / 10
    }, GS.SoundManager.prototype = {
        init: function() {
            var ctx;
            if ("undefined" != typeof AudioContext) ctx = new AudioContext;
            else {
                if ("undefined" == typeof webkitAudioContext) return void GAME.handleFatalError("No AudioContext support");
                ctx = new webkitAudioContext
            }
            this.ctx = ctx, this.ctx.createGain || (this.ctx.createGain = ctx.createGainNode), this.gainNode = this.ctx.createGain(), this.gainNode.gain.value = this._volume, this.compressor = this.ctx.createDynamicsCompressor(), this.gainNode.connect(this.compressor), this.compressor.connect(this.ctx.destination), this.initSounds()
        },
        playSound: function(name) {
            var sound = this.sounds[name];
            if (!sound.isPlaying || sound.allowMultipleAtOnce) {
                var source = this.ctx.createBufferSource();
                source.buffer = this.sounds[name].buffer, source.connect(this.gainNode), source.start || (source.start = source.noteOn), source.start(0), setTimeout(function() {
                    sound.isPlaying = !1
                }, sound.duration), sound.isPlaying = !0
            }
        },
        initSounds: function(soundBuffers) {
            this.sounds = {};
            for (var i in soundBuffers) this.sounds[i] = {
                buffer: soundBuffers[i],
                duration: Math.ceil(soundBuffers[i].length / this.ctx.sampleRate * 1e3),
                isPlaying: !1,
                allowMultipleAtOnce: GS.Assets[GS.AssetTypes.Sound][i].allowMultipleAtOnce
            }
        },
        set volume(value) {
            this._volume = value, void 0 !== this.gainNode && (this.gainNode.gain.value = this._volume)
        },
        get volume() {
            return this._volume
        }
    }, GS.AnimationView = function(gridObject) {
        this.gridObject = gridObject, this.loops = {
            attack: {
                delay: 10
            },
            inactive: {
                delay: 30
            },
            walk: {
                delay: gridObject.walkDelay
            },
            death: {
                delay: 30,
                runOnce: !0
            }
        }, this.floatYDelta = .5, this.floatAngle = 0, this.floatSpeed = .175, this.inactiveFloatSpeed = .0875, this.painMaxAngle = Math.PI / 2, this.painAngle = 0, this.painSpeed = .05, this.painSgn = 1, this.rotationYOffset = 0, this.positionYOffset = 0, this.currentMesh = new THREE.Object3D
    }, GS.AnimationView.prototype = {
        init: function() {
            var that = this;
            $.extend(!0, this, this.gridObject.view.mesh.userData), Object.keys(this.animations).forEach(function(key) {
                var loop = that.loops[key];
                return void 0 === that.loops[key] ? void GAME.handleFatalError("animation loop not found") : (loop.index = 0, loop.frames = that.animations[key], loop.max = loop.frames.length, void(loop.cooldown = Math.floor(Math.random() * (loop.delay - 1)) + 1))
            }), this.initInactiveLoop()
        },
        update: function() {
            var loop = this.currentLoop;
            loop.runOnce && loop.index === loop.max - 1 || loop.cooldown > 0 && (loop.cooldown--, 0 === loop.cooldown && (loop.cooldown = loop.delay, loop.index++, loop.index === loop.max && (loop.index = 0), this.switchMesh())), this.gridObject.dead || (this.gridObject.moving ? this.floatAngle += this.floatSpeed : loop === this.loops.inactive && (this.floatAngle += this.inactiveFloatSpeed), this.positionYOffset = this.floatYDelta * Math.sin(this.floatAngle), Math.abs(this.painAngle) > 0 && (this.painAngle -= this.painSgn * this.painSpeed, 1 == this.painSgn && this.painAngle < 0 ? (this.gridObject.inPain = !1, this.painAngle = 0) : this.painSgn == -1 && this.painAngle > 0 && (this.gridObject.inPain = !1, this.painAngle = 0)), this.rotationYOffset = this.painAngle)
        },
        initInactiveLoop: function() {
            var walk = this.loops.walk,
                loop = this.loops.inactive;
            loop.index = 0, loop.frames = [], loop.cooldown = loop.delay, loop.frames.push(walk.frames[0]), loop.frames.push(walk.frames[2]), loop.max = loop.frames.length
        },
        pain: function() {
            0 === Math.floor(2 * Math.random()) ? (this.painAngle = this.painMaxAngle, this.painSgn = 1) : (this.painAngle = -this.painMaxAngle, this.painSgn = -1)
        },
        death: function() {
            this.setLoop("death"), this.rotationYOffset = 0, this.positionYOffset = 0
        },
        setLoop: function(name) {
            this.currentLoop = this.loops[name], this.switchMesh()
        },
        switchMesh: function() {
            var loop = this.currentLoop;
            this.currentMesh.visible = !1, this.currentMesh = loop.frames[loop.index], this.currentMesh.visible = !0
        }
    }, GS.LightingView = function(grid) {
        this.grid = grid, this.player = grid.player, this.worldScene = grid.scene, this.playerScene = grid.player.playerView.scene, this.ambientColor = (new THREE.Color).setRGB(0, 0, 0), this.directionalColor = (new THREE.Color).setRGB(1, 1, 1).getHex(), this.directionalPosition = new THREE.Vector3(1, 1, 1), this.directionalIntensity = 0, this.muzzleFlashPosition = new THREE.Vector3(0, (-3), (-12)), this.muzzleFlashDistance = 256, this.muzzleFlashMaxIntensity = 1, this.muzzleFlashIntensity = new GS.SmoothNumber(0, .1), this.projectileIntensity = 1, this.projectileDistance = 32, this.maxProjectilePointLights = 10, this.playerTorchDistance = 256, this.playerTorchIntensity = .5, this.playerTorchColor = (new THREE.Color).setRGB(1, 1, 1), this.worldLights = {}, this.playerLights = {}, this.projectileLights = []
    }, GS.LightingView.prototype = {
        init: function() {
            this.initWorldLights(), this.initPlayerLights()
        },
        initWorldLights: function() {
            var ambientLight = new THREE.AmbientLight(this.ambientColor);
            this.worldScene.add(ambientLight), this.worldLights.ambient = ambientLight;
            var pointLight = new THREE.PointLight;
            pointLight.intensity = this.muzzleFlashIntensity.value, pointLight.distance = this.muzzleFlashDistance, this.worldScene.add(pointLight), this.worldLights.muzzleFlash = pointLight;
            var dirLight = new THREE.DirectionalLight(this.directionalColor, this.directionalIntensity);
            dirLight.position.copy(this.directionalPosition), this.worldScene.add(dirLight), this.worldLights.directional = dirLight;
            for (var i = 0; i < this.maxProjectilePointLights; i++) {
                var pointLight = new THREE.PointLight;
                pointLight.intensity = 0, pointLight.distance = this.projectileDistance;
                var light = {
                    active: !1,
                    pointLight: pointLight,
                    intensity: new GS.SmoothNumber(this.projectileIntensity, .1)
                };
                this.worldScene.add(pointLight), this.projectileLights.push(light)
            }
            var playerTorch = new THREE.PointLight;
            playerTorch.color.copy(this.playerTorchColor), playerTorch.intensity = this.playerTorchIntensity, playerTorch.distance = this.playerTorchDistance, this.worldScene.add(playerTorch), this.worldLights.playerTorch = playerTorch;
            var playerSceneTorch = new THREE.PointLight;
            playerSceneTorch.color.copy(this.playerTorchColor), playerSceneTorch.intensity = this.playerTorchIntensity, playerSceneTorch.distance = this.playerTorchDistance, this.playerScene.add(playerSceneTorch), this.playerLights.playerTorch = playerSceneTorch
        },
        initPlayerLights: function() {
            var ambientLight = new THREE.AmbientLight(this.ambientColor);
            this.playerScene.add(ambientLight), this.playerLights.ambient = ambientLight;
            var pointLight = new THREE.PointLight;
            pointLight.position.copy(this.muzzleFlashPosition), pointLight.intensity = this.muzzleFlashIntensity.value, pointLight.distance = this.muzzleFlashDistance, this.playerScene.add(pointLight), this.playerLights.muzzleFlash = pointLight;
            var dirLight = new THREE.DirectionalLight(this.directionalColor, this.directionalIntensity);
            dirLight.position.copy(this.directionalPosition), this.playerScene.add(dirLight), this.playerLights.directional = dirLight, this.player.playerView.lightingView = this
        },
        updatePlayerLights: function() {
            var xAngle = Math.PI / 180 * (this.player.yAngle - 90),
                yAngle = Math.PI / 180 * (this.player.xAngle + 90),
                matrix = (new THREE.Matrix4).makeRotationX(xAngle).multiply((new THREE.Matrix4).makeRotationY(yAngle)),
                dirPos = this.worldLights.directional.position;
            this.playerLights.directional.position.copy(dirPos).applyMatrix4(matrix), this.muzzleFlashIntensity.update(), this.worldLights.muzzleFlash.position.copy(this.player.position), this.worldLights.muzzleFlash.position.y += .5 * this.player.size.y, this.worldLights.muzzleFlash.intensity = this.muzzleFlashIntensity.value, this.playerLights.muzzleFlash.intensity = this.muzzleFlashIntensity.value, this.worldLights.playerTorch.position.copy(this.player.position)
        },
        beginMuzzleFlash: function(color) {
            this.muzzleFlashIntensity.value = this.muzzleFlashMaxIntensity, this.worldLights.muzzleFlash.color.copy(color), this.playerLights.muzzleFlash.color.copy(color)
        },
        endMuzzleFlash: function() {
            this.muzzleFlashIntensity.setTargetValue(0)
        },
        addProjectileLight: function(projectile) {
            var light;
            light = this.projectileLights.shift(), light.active = !0, light.projectile = projectile, light.intensity.value = this.projectileIntensity, light.intensity.setTargetValue(this.projectileIntensity), light.pointLight.color.setHex(projectile.color), light.pointLight.position.copy(projectile.position), light.pointLight.intensity = light.intensity.value, this.projectileLights.push(light)
        },
        update: function() {
            for (var i = 0; i < this.projectileLights.length; i++) {
                var light = this.projectileLights[i];
                light.active && (light.projectile.removed && light.intensity.setTargetValue(0), light.intensity.update(), light.pointLight.intensity = light.intensity.value, light.pointLight.position.copy(light.projectile.position), 0 === light.intensity.value && (light.active = !1))
            }
        }
    }, GS.ParticleMovementTypes = {
        Static: 0,
        Falling: 1,
        Gushing: 2
    }, GS.ParticleView = function(grid) {
        this.grid = grid, this.scene = grid.scene, this.particles = [], this.geometries = {}, this.materials = {}, this.particleSpeed = 75e-5, this.particleGravity = new THREE.Vector3(0, (-.003), 0)
    }, GS.ParticleView.prototype = {
        constructor: GS.ParticleView,
        init: function() {
            this.root = new THREE.Object3D, this.root.userData = "particle root", this.scene.add(this.root)
        },
        update: function() {
            for (var i = 0; i < this.particles.length; i++) {
                var particle = this.particles[i];
                particle.movementType != GS.ParticleMovementTypes.Static && (particle.landed !== !0 ? (particle.acceleration.add(particle.gravity), particle.velocity.add(particle.acceleration), particle.mesh.position.add(particle.velocity), particle.mesh.rotation.y += particle.rotationSpeed, particle.life++, void 0 !== particle.floorImpactY && particle.mesh.position.y < particle.floorImpactY && (particle.mesh.position.y = particle.floorImpactY + .5, particle.landed = !0)) : (particle.decayTime -= .01, particle.mesh.scale.set(particle.decayTime, particle.decayTime, particle.decayTime), particle.decayTime <= 0 && (particle.toBeRemoved = !0)))
            }
            for (var i = this.particles.length - 1; i >= 0; i--) this.particles[i].toBeRemoved && this.removeParticle(this.particles[i], i)
        },
        addParticle: function(width, height, depth, color, movementType, position) {
            var geometry = this.getGeometry(width, height, depth),
                material = this.getMaterial(color),
                mesh = new THREE.Mesh(geometry, material);
            movementType = void 0 !== movementType ? movementType : GS.ParticleMovementTypes.Static;
            var particle = {
                mesh: mesh,
                position: position,
                rotationSpeed: .25 * Math.random(),
                movementType: movementType,
                color: color,
                decayTime: 1
            };
            return movementType != GS.ParticleMovementTypes.Static && (particle.gravity = this.particleGravity.clone(), movementType == GS.ParticleMovementTypes.Falling ? (particle.horizontalSpeed = 15, particle.verticalSpeed = 10 * Math.random()) : movementType == GS.ParticleMovementTypes.Gushing && (particle.horizontalSpeed = 20, particle.verticalSpeed = 10 * Math.random() + 60), this.calculateAcceleration(particle), particle.velocity = new THREE.Vector3, this.calculateFloorImpactY(particle)), this.root.add(mesh), this.particles.push(particle), particle
        },
        removeParticle: function(particle, index) {
            var i = void 0 !== index ? index : this.particles.indexOf(particle);
            i > -1 && (this.root.remove(particle.mesh), this.particles.splice(i, 1))
        },
        calculateFloorImpactY: function() {
            var fauxGridObject = {
                    grid: null,
                    position: new THREE.Vector3,
                    linkedGridCells: null
                },
                position2d = new THREE.Vector2;
            return function(particle) {
                particle.position.toVector2(position2d);
                var gridLocation = this.grid.getGridLocationFromPoints([position2d]);
                if (void 0 !== gridLocation) {
                    fauxGridObject.grid = this.grid, fauxGridObject.position.copy(particle.position), fauxGridObject.linkedGridCells = this.grid.getCellsFromGridLocation(gridLocation);
                    var sector = GS.GridObject.prototype.getSector.call(fauxGridObject);
                    void 0 !== sector && (particle.floorImpactY = sector.floorTopY), fauxGridObject.grid = null, fauxGridObject.linkedGridCells = null
                }
            }
        }(),
        calculateAcceleration: function(particle) {
            particle.acceleration = new THREE.Vector3(2 * Math.random() - 1, 0, 2 * Math.random() - 1), particle.acceleration.normalize(), particle.acceleration.multiplyScalar(particle.horizontalSpeed), particle.acceleration.y = particle.verticalSpeed, particle.acceleration.multiplyScalar(this.particleSpeed)
        },
        alignParticleTrajectoryToNormal: function() {
            var normal2d = new THREE.Vector2,
                axis = new THREE.Vector2(1, 0);
            return function(particle, normal) {
                if (0 === normal.x && 0 === normal.z) {
                    if (normal.y == -1) return;
                    return particle.horizontalSpeed = 20, particle.verticalSpeed = 10 * Math.random() + 30, void this.calculateAcceleration(particle)
                }
                normal.toVector2(normal2d);
                var angle = GS.MathHelper.vec2AngleDirected(axis, normal2d) + Math.PI,
                    k = angle - Math.random() * Math.PI;
                normal2d.set(Math.sin(k), Math.cos(k)), particle.acceleration.x = normal2d.x, particle.acceleration.z = normal2d.y, particle.acceleration.multiplyScalar(particle.horizontalSpeed * this.particleSpeed), particle.acceleration.y = particle.verticalSpeed * this.particleSpeed, particle.mesh.rotation.y += angle, this.calculateFloorImpactY(particle)
            }
        }(),
        getGeometry: function(width, height, depth) {
            var id = width.toFixed(2) + height.toFixed(2) + depth.toFixed(2);
            return id in this.geometries || (this.geometries[id] = new THREE.BoxGeometry(width, height, depth)), this.geometries[id]
        },
        getMaterial: function(color) {
            var id = color.toString();
            return id in this.materials || (this.materials[id] = new THREE.MeshBasicMaterial({
                color: color
            })), this.materials[id]
        }
    }, GS.PlayerView = function() {
        this.weapons = {
                pistol: {
                    position: new THREE.Vector3(2.75, (-2.5), (-4)),
                    startPosition: new THREE.Vector3(2.5, (-6.5), 1),
                    scale: new THREE.Vector3(.4, .4, .4),
                    rotation: new THREE.Vector3(0, THREE.Math.degToRad(-90), 0),
                    pushback: 1,
                    shootBackwardFactor: .5,
                    shootForwardFactor: .5,
                    muzzleDuration: GS.msToFrames(250),
                    muzzleFlashColor: (new THREE.Color).setRGB(1, 1, 1)
                },
                double_shotgun: {
                    position: new THREE.Vector3(2.25, (-3.5), (-3)),
                    startPosition: new THREE.Vector3(2.5, (-6.5), 1),
                    scale: new THREE.Vector3(.4, .4, .4),
                    rotation: new THREE.Vector3(0, THREE.Math.degToRad(180), 0),
                    pushback: 2,
                    shootBackwardFactor: .1,
                    shootForwardFactor: .9,
                    muzzleDuration: GS.msToFrames(250),
                    muzzleFlashColor: (new THREE.Color).setRGB(1, 1, 1)
                },
                hyper_blaster: {
                    position: new THREE.Vector3(2.75, (-2.5), (-3)),
                    startPosition: new THREE.Vector3(2.5, (-6.5), 1),
                    scale: new THREE.Vector3(.4, .4, .4),
                    rotation: new THREE.Vector3(0, THREE.Math.degToRad(-90), 0),
                    pushback: 1,
                    shootBackwardFactor: .5,
                    shootForwardFactor: .5,
                    muzzleDuration: GS.msToFrames(125),
                    muzzleFlashColor: (new THREE.Color).setRGB(1, 1, 1)
                }
            }, $.extend(!0, this.weapons, GS.Weapons), this.scene = new THREE.Scene, this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, .1, 100), this.screenOverlayColor = new THREE.Color(0), this.screenOverlayColorFadeSpeed = .02, this.muzzleCooldown = 0, this.weaponReady = !1, this.weaponBob = {
                enabled: GS.Settings.weaponBob,
                magnitudeX: .5,
                magnitudeY: .5,
                offset: new THREE.Vector3,
                radian: 0,
                speed: .1
            }, this.viewBob = {
                enabled: GS.Settings.viewBob,
                magnitude: 1.5,
                offset: 0,
                radian: 0,
                speed: .2
            }, this.viewThrottle = new GS.SmoothNumber(0, .1), this.weaponThrottle = new GS.SmoothNumber(0, .1),
            this.tweens = {
                shoot: {
                    easing: TWEEN.Easing.Sinusoidal.InOut
                },
                show: {
                    easing: TWEEN.Easing.Back.Out,
                    duration: 500
                },
                hide: {
                    easing: TWEEN.Easing.Back.InOut,
                    duration: 250
                }
            }
    }, GS.PlayerView.prototype = {
        init: function() {
            var that = this;
            Object.keys(this.weapons).forEach(function(key) {
                that.initWeaponMesh(key)
            })
        },
        addWeaponMesh: function(name, mesh) {
            this.weapons[name].mesh = mesh
        },
        getWeaponMeshes: function() {
            var that = this,
                meshes = [];
            return Object.keys(this.weapons).forEach(function(key) {
                var weapon = that.weapons[key];
                meshes.push(weapon.mesh)
            }), meshes
        },
        initWeaponMesh: function(name) {
            var weapon = this.weapons[name];
            void 0 !== weapon.mesh && (weapon.mesh.visible = !1, weapon.mesh.position.copy(weapon.position), weapon.mesh.rotation.x = weapon.rotation.x, weapon.mesh.rotation.y = weapon.rotation.y, weapon.mesh.rotation.z = weapon.rotation.z, weapon.mesh.scale.copy(weapon.scale), this.scene.add(weapon.mesh))
        },
        update: function() {
            this.lightingView.updatePlayerLights(), this.updateMuzzleFlash(), this.updateLightLevel(), this.updateViewBob(), this.updateWeaponBob(), this.updateScreenOverlay()
        },
        updateMuzzleFlash: function() {
            this.muzzleCooldown > 0 && (this.muzzleCooldown--, 0 === this.muzzleCooldown && this.lightingView.endMuzzleFlash())
        },
        updateLightLevel: function() {
            void 0 !== this.weapon && this.player.getLightColorFromSector(this.weapon.mesh.material.emissive)
        },
        updateThrottle: function(oldPos, newPos) {
            var velocity = oldPos.toVector2().distanceTo(newPos.toVector2());
            this.viewThrottle.setTargetValue(velocity / this.player.moveSpeed), this.viewThrottle.update(), !this.player.shooting && this.weaponReady && (this.weaponThrottle.setTargetValue(velocity / this.player.moveSpeed), this.weaponThrottle.update())
        },
        resetWeaponThrottle: function() {
            this.weaponThrottle.value = 0, this.weaponBob.radian = 0
        },
        updateViewBob: function() {
            this.viewBob.enabled && (this.player.controls.setViewOffsetY(this.viewBob.offset), this.viewBob.radian += this.viewBob.speed, this.viewBob.offset = this.viewThrottle.value * this.viewBob.magnitude * Math.sin(this.viewBob.radian))
        },
        updateWeaponBob: function() {
            if (this.weaponBob.enabled && !this.player.shooting) {
                this.weaponBob.radian += this.weaponBob.speed;
                var x = this.weaponThrottle.value * this.weaponBob.magnitudeX * Math.sin(this.weaponBob.radian),
                    y = -Math.abs(this.weaponThrottle.value * this.weaponBob.magnitudeY * Math.sin(this.weaponBob.radian));
                this.weaponBob.offset.set(x, y, 0), void 0 !== this.weapon && this.weapon.mesh.position.copy(this.weapon.position.clone().add(this.weaponBob.offset))
            }
        },
        shoot: function() {
            this.resetWeaponThrottle(), this.weapon.mesh.position.copy(this.weapon.position);
            var backward = this.weapon.position.clone();
            backward.z += this.weapon.pushback;
            var tweenShootBackward = new TWEEN.Tween(this.weapon.mesh.position).to(backward, this.weapon.cooldown * this.weapon.shootBackwardFactor);
            tweenShootBackward.easing(this.tweens.shoot.easing);
            var tweenShootForward = new TWEEN.Tween(this.weapon.mesh.position).to(this.weapon.position, this.weapon.cooldown * this.weapon.shootForwardFactor);
            tweenShootForward.easing(this.tweens.shoot.easing), tweenShootBackward.chain(tweenShootForward), tweenShootBackward.start(), this.showMuzzleFlash()
        },
        showMuzzleFlash: function() {
            this.lightingView.beginMuzzleFlash(this.weapon.muzzleFlashColor), this.muzzleCooldown = this.weapon.muzzleDuration
        },
        changeToWeaponInstant: function(name) {
            this.resetWeaponThrottle(), void 0 !== this.weapon && (this.weapon.mesh.visible = !1), this.weaponReady = !0, this.weapon = this.weapons[name], this.weapon.mesh.visible = !0, this.weapon.mesh.position.copy(this.weapon.startPosition)
        },
        changeToWeapon: function(name) {
            var that = this;
            this.resetWeaponThrottle(), this.weaponReady = !1, void 0 !== this.weapon ? this.hideWeapon(function() {
                that.showWeapon(name)
            }) : this.showWeapon(name)
        },
        showWeapon: function(name, callback) {
            var that = this;
            this.weapon = this.weapons[name], this.weapon.mesh.visible = !0, this.weapon.mesh.position.copy(this.weapon.startPosition);
            var tween = new TWEEN.Tween(this.weapon.mesh.position).to(this.weapon.position, this.tweens.show.duration);
            tween.easing(this.tweens.show.easing), tween.onComplete(function() {
                tween.onComplete(null), that.weaponReady = !0, void 0 !== callback && callback()
            }), tween.start()
        },
        hideWeapon: function(callback) {
            var that = this;
            this.weaponReady = !1;
            var tween = new TWEEN.Tween(this.weapon.mesh.position).to(this.weapon.startPosition, this.tweens.hide.duration);
            tween.easing(this.tweens.hide.easing), tween.onComplete(function() {
                tween.onComplete(null), that.weapon.mesh.visible = !1, void 0 !== callback && callback()
            }), tween.start()
        },
        onResize: function() {
            this.camera.aspect = window.innerWidth / window.innerHeight, this.camera.updateProjectionMatrix()
        },
        onItemPickup: function() {
            this.screenOverlayColor.setRGB(.3, .3, 0), this.dispatchEvent({
                type: "screenOverlayColorChange",
                color: this.screenOverlayColor
            })
        },
        onDamage: function() {
            this.screenOverlayColor.setRGB(.6, 0, 0), this.dispatchEvent({
                type: "screenOverlayColorChange",
                color: this.screenOverlayColor
            })
        },
        onDeath: function() {
            this.player.controls.eye.y -= this.player.size.y, this.player.controls.updateCamera(), void 0 !== this.weapon && this.hideWeapon()
        },
        updateScreenOverlay: function() {
            (this.screenOverlayColor.r > 0 || this.screenOverlayColor.g > 0 || this.screenOverlayColor.b > 0) && (this.screenOverlayColor.addScalar(-this.screenOverlayColorFadeSpeed), this.screenOverlayColor.r < 0 && (this.screenOverlayColor.r = 0), this.screenOverlayColor.g < 0 && (this.screenOverlayColor.g = 0), this.screenOverlayColor.b < 0 && (this.screenOverlayColor.b = 0), this.dispatchEvent({
                type: "screenOverlayColorChange",
                color: this.screenOverlayColor
            }))
        }
    }, THREE.EventDispatcher.prototype.apply(GS.PlayerView.prototype), GS.GameVersion = "v1.2.2", GS.ReleaseDate = "april 2017", GS.GameStates = {
        Dispose: 0,
        PreLoad: 1,
        Loading: 2,
        PostLoad: 3,
        Play: 4,
        Menu: 5
    }, GS.Game = function() {
        GS.Base.call(this)
    }, GS.Game.prototype = GS.inherit(GS.Base, {
        constructor: GS.Game,
        preInit: function() {
            GS.Settings.loadSettings(), this.state = GS.GameStates.PreLoad, this.nextState = null, this.updated = !1, this.firstLoad = !0, this.firstPlay = !0, this.mapWon = !1, this.restartedLevel = !1, this.antialias = !1, this.clearColor = 3368601, this.cameraFov = GS.Settings.fov, this.cameraFar = 1500, this.isTestMap() ? this.noMenu = !0 : this.noMenu = !1, this.firstTimeInMenu = !0, this.showFPS = GS.Settings.showFPS, this.showPerformanceDebugMeters = !1
        },
        init: function() {
            GS.DebugUI.init(), GS.DebugUI.visible = !1, this.loadingUI = new GS.LoadingUI, this.loadingUI.init(), this.uiManager = new GS.UIManager, this.uiManager.init(), this.soundManager = new GS.SoundManager, this.soundManager.init(), this.musicManager = new GS.MusicManager, this.musicManager.init(), this.initAssetLoader(), this.keys = {
                Enter: 13,
                Escape: 27,
                Tab: 9
            }, GS.Base.prototype.init.call(this), this.graphicsManager = new GS.GraphicsManager(this.renderer, this.camera), this.graphicsManager.init()
        },
        preLoad: function() {
            this.uiManager.reset(), this.loadingUI.percentLoaded = 0, this.loadingUI.show(), this.scene = new THREE.Scene, this.scene.fog = new THREE.Fog((new THREE.Color).setRGB(0, 0, 0).getHex(), 500, 900), this.assetLoader.loaded ? this.nextState = GS.GameStates.PostLoad : (this.assetLoader.load(), this.nextState = GS.GameStates.Loading)
        },
        initAssetLoader: function() {
            var that = this;
            this.assetLoader = new GS.ZipAssetLoader(this.soundManager.ctx), this.assetLoader.init(), this.assetLoader.addEventListener("progress", function(e) {
                that.loadingUI.updateProgress(e)
            }), this.assetLoader.addEventListener("load", function(e) {
                that.loadingUI.updateProgress(e), that.nextState = GS.GameStates.PostLoad
            })
        },
        postLoad: function() {
            this.firstLoad ? (this.loadingUI.spinnerOnly = !0, this.uiManager.initComponents(this.assetLoader.assets), this.openMenu(), this.firstLoad = !1, this.noMenu && this.newGame()) : (this.initComponents(this.assetLoader.assets), this.uiManager.initComponents(this.assetLoader.assets, this.grid), this.uiManager.useIngameMenu(), this.nextState = GS.GameStates.Play, this.graphicsManager.monochromeEnabled = !1, void 0 === this.grid.aiManager.script || this.restartedLevel || this.musicManager.playTrack(this.grid.aiManager.script.musicTrack), this.restartedLevel = !1, this.firstPlay && (this.firstPlay = !1))
        },
        play: function() {
            GS.InputHelper.checkPressedKeys(), !GS.InputHelper.keysPressed && GS.InputHelper.isKeyDown(this.keys.Escape) && this.openMenu(), this.grid.aiManager.mapWon || GS.InputHelper.keysPressed || !GS.InputHelper.isKeyDown(this.keys.Tab) || (this.uiManager.automap.visible = !this.uiManager.automap.visible, this.uiManager.overrideRedraw = !0, this.graphicsManager.monochromeEnabled = this.uiManager.automap.visible), this.grid.player.dead && !GS.InputHelper.keysPressed && GS.InputHelper.isKeyDown(this.keys.Enter) && this.restartLevel(), this.grid.aiManager.mapWon && !GS.InputHelper.keysPressed && GS.InputHelper.isKeyDown(this.keys.Enter) && void 0 !== this.grid.aiManager.script.nextMap && (this.playerPersistencePackage = this.grid.player.getPersistencePackage(), this.loadLevel(this.grid.aiManager.script.nextMap)), !this.mapWon && this.grid.aiManager.mapWon && (this.mapWon = !0, this.onMapWon()), this.grid.aiManager.mapWon || (this.grid.update(), TWEEN.update()), GS.DebugUI.update(), this.uiManager.update()
        },
        onMapWon: function() {
            this.graphicsManager.monochromeEnabled = !1
        },
        menu: function() {
            GS.InputHelper.checkPressedKeys(), !GS.InputHelper.keysPressed && GS.InputHelper.isKeyDown(this.keys.Escape) && void 0 !== this.grid && this.closeMenu(), this.uiManager.update()
        },
        openMenu: function() {
            this.nextState = GS.GameStates.Menu, void 0 !== this.grid && (this.grid.player.inMenu = !0, this.grid.player.controls.disable(), this.grid.player.controls.detachEvents()), this.graphicsManager.monochromeEnabled = !0, this.uiManager.menuActive = !0, GS.DebugUI.visible = !1
        },
        closeMenu: function() {
            this.nextState = GS.GameStates.Play, void 0 !== this.grid ? (this.grid.player.inMenu = !1, this.grid.player.controls.attachEvents(), this.grid.player.controls.enable(), this.grid.aiManager.resume(), !this.mapWon && this.uiManager.automap.visible || (this.graphicsManager.monochromeEnabled = !1)) : this.graphicsManager.monochromeEnabled = !1, this.firstTimeInMenu && (this.uiManager.removeNewsBox(), this.firstTimeInMenu = !1), this.uiManager.menuActive = !1, GS.DebugUI.visible = GS.Settings.showHUD
        },
        restartLevel: function() {
            this.nextState = GS.GameStates.Dispose, this.restartedLevel = !0
        },
        loadLevel: function(name) {
            this.uiManager.menuActive && this.closeMenu(), this.mapName = name, this.nextState = GS.GameStates.Dispose
        },
        newGame: function() {
            this.uiManager.menuActive && this.closeMenu(), this.isTestMap() ? this.mapName = "testMap" : this.mapName = "airstrip1", this.nextState = GS.GameStates.Dispose
        },
        isTestMap: function() {
            return window.location.search.toLowerCase().indexOf("testmap") > -1
        },
        initComponents: function(assets) {
            var that = this,
                map = this.assetLoader.mapLoader.parse(assets[GS.AssetTypes.Map][this.mapName]);
            this.mapWon = !1;
            var viewFactory = new GS.ViewFactory(this.renderer, map, assets);
            viewFactory.init();
            var gridFactory = new GS.GridFactory(viewFactory, this.soundManager, this.renderer, this.scene, this.camera);
            this.grid = gridFactory.getGrid(map), this.soundManager.initSounds(assets[GS.AssetTypes.Sound]), this.musicManager.initTracks(assets[GS.AssetTypes.MusicTrack]), void 0 !== this.playerPersistencePackage && (this.grid.player.applyPersistencePackage(this.playerPersistencePackage), this.playerPersistencePackage = void 0), this.grid.update(), this.graphicsManager.setGrid(this.grid), this.grid.player.controls.addEventListener("pointerLockDisabled", function() {
                that.openMenu()
            })
        },
        update: function() {
            var time;
            this.showPerformanceDebugMeters && (time = window.performance.now()), this.state == GS.GameStates.Dispose ? this.updated || (this.updated = !0, this.dispose()) : this.state == GS.GameStates.PreLoad ? this.updated || (this.updated = !0, this.preLoad()) : this.state == GS.GameStates.Loading ? this.updated = !0 : this.state == GS.GameStates.PostLoad ? this.updated || (this.updated = !0, this.postLoad()) : this.state == GS.GameStates.Play ? (this.updated = !0, this.play()) : this.state == GS.GameStates.Menu && (this.updated = !0, this.menu()), null !== this.nextState && this.updated && (this.nextState != GS.GameStates.Play && this.nextState != GS.GameStates.Menu || (this.loadingUI.hide(), this.uiManager.show()), this.state = this.nextState, this.nextState = null, this.updated = !1), this.showPerformanceDebugMeters && (this.updateTime = (window.performance.now() - time).toFixed(2), GS.DebugUI.trackNumericValue("updateTime", this.updateTime))
        },
        draw: function() {
            var time;
            this.showPerformanceDebugMeters && (time = window.performance.now()), this.state == GS.GameStates.PreLoad ? this.loadingUI.draw() : this.state == GS.GameStates.Loading ? this.loadingUI.draw() : this.state == GS.GameStates.PostLoad ? this.loadingUI.draw() : this.state != GS.GameStates.Play && this.state != GS.GameStates.Menu || (void 0 !== this.grid && this.graphicsManager.draw(), this.uiManager.draw()), this.showPerformanceDebugMeters && (this.drawTime = (window.performance.now() - time).toFixed(2), GS.DebugUI.trackNumericValue("drawTime", this.drawTime))
        },
        onResize: function() {
            GS.Base.prototype.onResize.call(this), this.uiManager.onResize(), this.loadingUI.onResize(), void 0 !== this.graphicsManager && this.graphicsManager.onResize(), void 0 !== this.grid && (this.grid.onResize(), this.grid.player.playerView.onResize())
        },
        customMap: function() {
            var that = this,
                customMapInput = $("#customMapInput"),
                files = customMapInput[0].files;
            if (void 0 === files || 0 === files.length) return void customMapInput.trigger("click");
            var file = files[0],
                fileReader = new FileReader;
            fileReader.onload = function(e) {
                that.assetLoader.assets[GS.AssetTypes.Map].customMap = e.target.result, that.loadLevel("customMap")
            }, fileReader.onerror = function(e) {
                GAME.handleFatalError("file read error - " + e.target.error.code)
            }, fileReader.readAsText(file), customMapInput.val("")
        },
        handleFatalError: function(message) {
            document.body.innerHTML = "<span class='fatal-error'> fatal error: '" + message + "'</span><br/>", document.body.style.padding = "20px";
            var a = document.createElement("a");
            a.innerHTML = "click here or refresh page to restart", a.className = "fatal-error-link", a.onclick = function() {
                window.location.reload()
            }, document.body.appendChild(a), this.nextState = GS.GameStates.Dispose
        },
        updateFov: function() {
            this.cameraFov = GS.Settings.fov, this.camera.fov = GS.Settings.fov, this.camera.updateProjectionMatrix(), this.state == GS.GameStates.Play && this.grid.updateFov()
        },
        disposeEnd: function() {
            TWEEN.removeAll(), this.grid = void 0, this.graphicsManager.reset(), this.scene = void 0, this.uiManager.dispose(), this.nextState = GS.GameStates.PreLoad
        },
        dispose: function() {
            var that = this;
            void 0 !== this.grid ? this.grid.player.controls.dispose(function() {
                that.disposeEnd()
            }) : this.disposeEnd()
        }
    });
var GAME;
window.addEventListener("load", function() {
    GS.Detector.run(function() {
        GAME = new GS.Game, GAME.preInit(), GAME.init()
    })
}, !1), GS.KeybindSettings = {
    keybinds: [{
        actionName: "moveForward",
        controlName: "W",
        code: 87
    }, {
        actionName: "moveBackward",
        controlName: "S",
        code: 83
    }, {
        actionName: "strafeLeft",
        controlName: "A",
        code: 65
    }, {
        actionName: "strafeRight",
        controlName: "D",
        code: 68
    }, {
        actionName: "use",
        controlName: "E",
        code: 69
    }, {
        actionName: "shoot",
        controlName: "MOUSE LEFT",
        mouse: !0,
        button: 1
    }, {
        actionName: "pistol",
        controlName: "2",
        code: 50
    }, {
        actionName: "shotgun",
        controlName: "3",
        code: 51
    }, {
        actionName: "hyperblaster",
        controlName: "4",
        code: 52
    }],
    init: function() {
        this.rebound = new GS.Rebound(GS.KeybindSettings.keybinds), this.rebound.init(), GS.Keybinds = {};
        for (var i = 0; i < this.keybinds.length; i++) {
            var keybind = this.keybinds[i];
            GS.Keybinds[keybind.actionName] = keybind
        }
    }
}, GS.Settings = function() {
    var settings = {
        fovMin: 60,
        fovMax: 120,
        fov: 75,
        ssao: !0,
        bloom: !0,
        noise: !0,
        vignette: !0,
        fxaa: !0,
        halfSize: !0,
        showFPS: !0,
        viewBob: !0,
        weaponBob: !0,
        showHUD: !0,
        showWeapon: !0,
        soundMin: 0,
        soundMax: 10,
        sound: 5,
        musicMin: 0,
        musicMax: 10,
        music: 5,
        mouseMin: 1,
        mouseMax: 10,
        mouse: 5,
        mouseInvertY: !1,
        keybinds: null
    };
    return {
        loadSettings: function() {
            var jsonStr = localStorage["gs-settings"];
            if (void 0 !== jsonStr) {
                var loadedSettings = JSON.parse(jsonStr);
                for (var i in loadedSettings) i in settings && (settings[i] = loadedSettings[i]);
                loadedSettings.keybinds && (GS.KeybindSettings.keybinds = loadedSettings.keybinds)
            }
            GS.KeybindSettings.init(), settings.keybinds = GS.KeybindSettings.keybinds
        },
        saveSettings: function() {
            var jsonStr = JSON.stringify(settings);
            localStorage["gs-settings"] = jsonStr
        },
        get fovMin() {
            return settings.fovMin
        },
        get fovMax() {
            return settings.fovMax
        },
        set fov(value) {
            var n = parseInt(value);
            isNaN(n) || (n = Math.floor(GS.MathHelper.clamp(n, settings.fovMin, settings.fovMax)), settings.fov = n, GAME.updateFov(), this.saveSettings())
        },
        get fov() {
            return settings.fov
        },
        set ssao(value) {
            settings.ssao = value === !0, GAME.graphicsManager.ssaoEnabled = settings.ssao, this.saveSettings()
        },
        get ssao() {
            return settings.ssao
        },
        set bloom(value) {
            settings.bloom = value === !0, GAME.graphicsManager.bloomEnabled = settings.bloom, this.saveSettings()
        },
        get bloom() {
            return settings.bloom
        },
        set noise(value) {
            settings.noise = value === !0, GAME.graphicsManager.noiseEnabled = settings.noise, this.saveSettings()
        },
        get noise() {
            return settings.noise
        },
        set vignette(value) {
            settings.vignette = value === !0, GAME.graphicsManager.vignetteEnabled = settings.vignette, this.saveSettings()
        },
        get vignette() {
            return settings.vignette
        },
        set fxaa(value) {
            settings.fxaa = value === !0, GAME.graphicsManager.fxaaEnabled = settings.fxaa, this.saveSettings()
        },
        get fxaa() {
            return settings.fxaa
        },
        set viewBob(value) {
            settings.viewBob = value === !0, this.saveSettings(), void 0 !== GAME.grid && (GAME.grid.player.playerView.viewBob.enabled = settings.viewBob)
        },
        get viewBob() {
            return settings.viewBob
        },
        set weaponBob(value) {
            settings.weaponBob = value === !0, this.saveSettings(), void 0 !== GAME.grid && (GAME.grid.player.playerView.weaponBob.enabled = settings.weaponBob)
        },
        get weaponBob() {
            return settings.weaponBob
        },
        set halfSize(value) {
            settings.halfSize = value === !0, this.saveSettings(), GAME.graphicsManager.halfSizeEnabled = settings.halfSize
        },
        get halfSize() {
            return settings.halfSize
        },
        set showFPS(value) {
            settings.showFPS = value === !0, this.saveSettings(), GAME.showFPS = settings.showFPS
        },
        get showFPS() {
            return settings.showFPS
        },
        get soundMin() {
            return settings.soundMin
        },
        get soundMax() {
            return settings.soundMax
        },
        set sound(value) {
            var n = parseInt(value);
            isNaN(n) || (n = Math.floor(GS.MathHelper.clamp(n, settings.soundMin, settings.soundMax)), settings.sound = n, GAME.soundManager.volume = settings.sound / 10, this.saveSettings())
        },
        get sound() {
            return settings.sound
        },
        get musicMin() {
            return settings.musicMin
        },
        get musicMax() {
            return settings.musicMax
        },
        set music(value) {
            var n = parseInt(value);
            isNaN(n) || (n = Math.floor(GS.MathHelper.clamp(n, settings.musicMin, settings.musicMax)), settings.music = n, GAME.musicManager.volume = settings.music / 10, this.saveSettings())
        },
        get music() {
            return settings.music
        },
        get mouseMin() {
            return settings.mouseMin
        },
        get mouseMax() {
            return settings.mouseMax
        },
        set mouse(value) {
            var n = parseInt(value);
            isNaN(n) || (n = Math.floor(GS.MathHelper.clamp(n, settings.mouseMin, settings.mouseMax)), settings.mouse = n, void 0 !== GAME.grid && (GAME.grid.player.controls.lookSpeed = .066 * (settings.mouse / 5)), this.saveSettings())
        },
        get mouse() {
            return settings.mouse
        },
        set showHUD(value) {
            settings.showHUD = value === !0, this.saveSettings(), GAME.uiManager.showHUD = settings.showHUD, GAME.uiManager.overrideRedraw = !0
        },
        get showHUD() {
            return settings.showHUD
        },
        set showWeapon(value) {
            settings.showWeapon = value === !0, this.saveSettings(), GAME.graphicsManager.showWeapon = settings.showWeapon
        },
        get showWeapon() {
            return settings.showWeapon
        },
        set mouseInvertY(value) {
            settings.mouseInvertY = value === !0, this.saveSettings(), void 0 !== GAME.grid && (GAME.grid.player.controls.mouseInvertY = settings.mouseInvertY)
        },
        get mouseInvertY() {
            return settings.mouseInvertY
        }
    }
}();

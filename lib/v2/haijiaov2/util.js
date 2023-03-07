module.exports = function haijiaoencrypt() {
    var e = "ABCD*EFGHIJKLMNOPQRSTUVWX#YZabcdefghijklmnopqrstuvwxyz1234567890",
         t = (this.encode = function (i) {
            let a, n, o, r, s, c, l = "", d = 0;
            for (i = t(i); d < i.length;)
                {o = (a = i.charCodeAt(d++)) >> 2,
                    r = (3 & a) << 4 | (a = i.charCodeAt(d++)) >> 4,
                    s = (15 & a) << 2 | (n = i.charCodeAt(d++)) >> 6,
                    c = 63 & n,
                    isNaN(a) ? s = c = 64 : isNaN(n) && (c = 64),
                    l = l + e.charAt(o) + e.charAt(r) + e.charAt(s) + e.charAt(c);}
            return l;
        }
            ,
            this.decode = function (t) {
                let a, n, o, r, s, c, l = "", d = 0;
                for (t = t.replace(/[^A-Za-z0-9\*\#]/g, ""); d < t.length;)
                    {o = e.indexOf(t.charAt(d++)),
                        a = (15 & (r = e.indexOf(t.charAt(d++)))) << 4 | (s = e.indexOf(t.charAt(d++))) >> 2,
                        n = (3 & s) << 6 | (c = e.indexOf(t.charAt(d++))),
                        l += String.fromCharCode(o << 2 | r >> 4),
                        64 != s && (l += String.fromCharCode(a)),
                        64 != c && (l += String.fromCharCode(n));}
                return i(l);
            }
            ,
            function (e) {
                e = e.replace(/\r\n/g, "\n");
                for (var t = "", i = 0; i < e.length; i++) {
                    const a = e.charCodeAt(i);
                    a < 128 ? t += String.fromCharCode(a) : t = 127 < a && a < 2048 ? (t += String.fromCharCode(a >> 6 | 192)) + String.fromCharCode(63 & a | 128) : (t = (t += String.fromCharCode(a >> 12 | 224)) + String.fromCharCode(a >> 6 & 63 | 128)) + String.fromCharCode(63 & a | 128);
                }
                return t;
            }
        ),
         i = function (e) {
            for (var t, i, a = "", n = 0, o = 0; n < e.length;)
                {(t = e.charCodeAt(n)) < 128 ? (a += String.fromCharCode(t),
                    n++) : 191 < t && t < 224 ? (o = e.charCodeAt(n + 1),
                        a += String.fromCharCode((31 & t) << 6 | 63 & o),
                        n += 2) : (o = e.charCodeAt(n + 1),
                            i = e.charCodeAt(n + 2),
                            a += String.fromCharCode((15 & t) << 12 | (63 & o) << 6 | 63 & i),
                            n += 3);}
            return a;
        };
};
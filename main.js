/**
 * İlgili nesne üzerindeki name parametresine ait bilgiyi getirir
 * @param name
 */
HTMLElement.prototype.getAttr = function (name) {
    return this.getAttribute(name);
};
/**
 * İlgili nesne üzerindeki name parametresine ait [data-<name>] bilgisini getirir
 * @param name
 */
HTMLElement.prototype.getData = function (name) {
    return this.getAttribute('data-' + name);
};
/**
 *
 * İlgili nesne üzerindeki name parametresine ait data bilgisini siler
 * @param name
 */
HTMLElement.prototype.remData = function (name) {
    this.removeAttribute('data-' + name);
};
/**
 * İlgili nesne üzerindeki name parametresine ait bilgiyi kontrol eder
 * @param name
 */
HTMLElement.prototype.hasAttr = function (name) {
    return this.hasAttribute(name);
};
/**
 * İlgili nesne üzerindeki name parametresine ait data bilgisini kontrol eder
 * @param name
 */
HTMLElement.prototype.hasData = function (name) {
    return this.hasAttribute('data-' + name);
};
/**
 * İlgili nesneye yeni Event ekler.
 * @param name <click>|<change>|<keyup>|..... gibi tanımları alır
 * @param action Olayın tetiklendiğinde çalıştırılması istenen method
 */
HTMLElement.prototype.setAction = function (name, action) {
    this.addEventListener(name, action);
};
/**
 * İlgili nesneye yeni sınıf değerleri atar
 * Virgül (,) ile bir den fazla parametre ile sınıf atanabilir. Örnek: .setClass('one','two','three');
 */
HTMLElement.prototype.setClass = function () {
    var self = this;
    for (var i = 0; i < arguments.length; i++) {
        if (arguments[i]) {
            self.classList.add(arguments[i]);
        }
    }
    return this;
};
/**
 * İlgili nesneye style özellikleri girmek için kullanılır
 * @param args Object tipinde değerler alır. Örnek : .setCSS({ border:1px solid #fff, fontSize:'2em'})
 */
HTMLElement.prototype.setCSS = function (args) {
    var self = this;
    Object.keys(args).forEach(function (f) {
        self.style[f] = args[f];
    });
    return this;
};
/**
 * İlgili nesnenin alt elementlerini verir
 * @param index Index değeri belirtilmek istenirse, ilgili nesnenin belirtilen katmanındaki nesne geri döndürülür
 */
HTMLElement.prototype.getChildren = function (index) {
    var el = this;
    return this.children;
};
var Coco = (function () {
    function Coco() {
    }
    /**
     *
     * @param url Bağlanılmak istenen URL bilgisi. http://...
     * @param action Bağlantı sağlandığında çalıştırılması istenen method.
     */
    Coco.url = function (url, action) {
        var result = [];
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                action(JSON.parse(xhttp.responseText));
            }
        };
        xhttp.open("GET", url, true);
        xhttp.send();
        return result;
    };
    Coco.getSubitems = function (root, search) {
        if (search != null) {
            for (var i = 0; i < search.length; i++) {
                root.push(search[i]);
                this.getSubitems(root, search[i].getChildren());
            }
        }
    };
    Coco.props = function (name, $item, $data, $index, $currentIndex) {
        var result = $item.getData(name);
        $item.remData(name);
        if (result) {
            result = eval(result);
            if (result) {
                this.list[name]($item, result);
            }
        }
    };
    Coco.propClass = function ($item, args) {
        $item.setClass(args);
    };
    Coco.propShow = function ($item, args) {
        $item.setCSS({ 'display': 'block' });
    };
    Coco.propHide = function ($item, args) {
        $item.setCSS({ 'display': 'none' });
    };
    Coco.properties = function ($root, $item, $data, $index, $currentIndex) {
        var o = Object.keys(this.list);
        o.forEach(function (f) {
            Coco.props(f, $item, $data, $index, $currentIndex);
            Coco.props(f, $root, $data, $index, $currentIndex);
        });
    };
    Coco.append = function (root, item, $data, $index, $currentIndex) {
        var clone = item.cloneNode(true);
        var list = Array();
        var _data = $data;
        this.getSubitems(list, clone.getChildren());
        for (var i = 0; i < list.length; i++) {
            var element = list[i];
            Coco.properties(clone, element, $data, $index, $currentIndex);
            var html = element.getData('html');
            if (html) {
                var index = html.indexOf('.') != -1;
                if (index) {
                    element.innerHTML = eval('_data.' + html);
                }
                else
                    element.innerHTML = _data[html];
            }
            var click = element.getData('click');
            if (click) {
                this.setBind(element, 'click', click, _data);
            }
        }
        root.parentNode.insertBefore(clone, root.nextSibling);
        return clone;
    };
    Coco.create = function (root, el, data) {
        // Gösterilmek istenen kayıt sayısı
        var _count = el.getData('count');
        // Gösterilmek istenen kayıt sayısı varsa al ve dönüştür. Eğer yoksa data sayısını al.
        var $count = _count ? parseInt(_count) : data.length;
        // Sayıyı kontrol et. Eğer data sayısı count'dan küçükse data sayısına eşitle. Değilse normal devam et
        $count = data.length < $count ? data.length : $count;
        el.remData('count');
        // Açılmak istenen sayfa bilgisini al
        var _page = el.getData('page');
        // Eğer varsa dönüştür. Yoksa 1'e eşitle
        var page = _page ? parseInt(_page) : 1;
        page = page < 0 ? 0 : page - 1;
        el.remData('page');
        // Kaydın başlangıç ve bitir aralığını oluşturalım
        var $start = page * $count;
        var $end = $start + $count;
        var $currentIndex = 0;
        for (var $index = $start; $index < $end; $index++) {
            root = Coco.append(root, el, data[$index], $index, $currentIndex);
            $currentIndex++;
        }
    };
    Coco.next = function (sample, source, name) {
        // Örnekteki bilgiyi sil
        sample.remData(name);
        // Örnek dosya ile data sayısınca çoğaltalım
        Coco.create(sample, sample, source);
        // Örneği Sil
        sample.parentNode.removeChild(sample);
    };
    Coco.find = function (name) {
        var sources = document.querySelectorAll('[data-' + name + ']');
        if (sources) {
            var _loop_1 = function () {
                // Örneği al
                var sample = sources[i];
                // Örnek bilgisi
                var sourceName = sample.getData(name);
                if (name == 'api-url') {
                    this_1.url(sourceName, function (data) {
                        Coco.next(sample, data, name);
                    });
                }
                else {
                    Coco.next(sample, eval(sourceName), name);
                }
            };
            var this_1 = this;
            for (var i = 0; i < sources.length; i++) {
                _loop_1();
            }
        }
    };
    Coco.init = function () {
        this.find('api-url');
        this.find('api-source');
    };
    Coco.setBind = function (item, name, action, data) {
        item.setAction(name, function (e) {
            eval(action)({ event: e, item: data });
        });
    };
    return Coco;
}());
Coco.list = {
    "class": Coco.propClass,
    show: Coco.propShow,
    hide: Coco.propHide
};
Coco.init();

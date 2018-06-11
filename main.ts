
interface HTMLElement {
    getAttr(name: string): string;
    getData(name: string): string;
    getChildren(): NodeListOf<HTMLElement>;
    hasAttr(name: string): boolean;
    hasData(name: string): boolean;
    remData(name: string): void;
    setAction(name: string, action: Function);
    setClass(...name): HTMLElement;
    setCSS(args: Object): HTMLElement;
}


HTMLElement.prototype.getAttr = function (name: string): string {
    return this.getAttribute(name);
}

HTMLElement.prototype.getData = function (name: string): string {
    return this.getAttribute('data-' + name);
}

HTMLElement.prototype.remData = function (name: string): void {
    this.removeAttribute('data-' + name);
}

HTMLElement.prototype.hasAttr = function (name): boolean {
    return this.hasAttribute(name);
}

HTMLElement.prototype.hasData = function (name): boolean {
    return this.hasAttribute('data-' + name);
}

HTMLElement.prototype.setAction = function (name: string, action: Function): void {
    this.addEventListener(name, action);
}

HTMLElement.prototype.setClass = function (): HTMLElement {
    var self = this;
    for (let i = 0; i < arguments.length; i++) {
        if (arguments[i]) { self.classList.add(arguments[i]); }
    }
    return this;
}

HTMLElement.prototype.setCSS = function (args: Object): HTMLElement {
    var self = this as HTMLElement;
    Object.keys(args).forEach(f => {
        self.style[f] = args[f];
    });
    return this;
}

HTMLElement.prototype.getChildren = function (index?: number): NodeListOf<HTMLElement> {
    var el = this as HTMLElement;
    return this.children;
}

class Coco {

    constructor() {

    }

    static list: Object = {
        class: Coco.propClass,
        show: Coco.propShow,
        hide:Coco.propHide
    }

    static url(url: string, action: Function): Object[] {

        let result = [];

        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                action(JSON.parse(xhttp.responseText));
            }
        };
        xhttp.open("GET", url, true);
        xhttp.send();


        return result;
    }

    static getSubitems(root: Array<HTMLElement>, search: NodeListOf<HTMLElement>) {
        if (search != null) {
            for (var i = 0; i < search.length; i++) {
                root.push(search[i]);
                this.getSubitems(root, search[i].getChildren());
            }
        }
    }

    static props(name: string, $item: HTMLElement, $data: Object, $index: number, $currentIndex: number) {
        var result = $item.getData(name);
        $item.remData(name);
        if (result) {
            result = eval(result);
            if (result) { this.list[name]($item, result); }
        }
    }

    static propClass($item: HTMLElement, args: any) {
        $item.setClass(args);
    }

    static propShow($item: HTMLElement, args: any) {
        $item.setCSS({ 'display': 'block' });
    }

    static propHide($item: HTMLElement, args: any) {
        $item.setCSS({ 'display': 'none' });
    }

    static properties($root: HTMLElement, $item: HTMLElement, $data: Object, $index: number, $currentIndex: number) {

        var o = Object.keys(this.list);
        o.forEach(f => {
            Coco.props(f, $item, $data, $index, $currentIndex);
            Coco.props(f, $root, $data, $index, $currentIndex);
        });
    }

    static append(root: HTMLElement, item: HTMLElement, $data: Object, $index: number, $currentIndex: number) {
        var clone = item.cloneNode(true) as HTMLElement;
        var list = Array<HTMLElement>();
        var _data = $data;
        this.getSubitems(list, clone.getChildren());

        for (let i = 0; i < list.length; i++) {

            const element = list[i];
            Coco.properties(clone, element, $data, $index, $currentIndex);
            const html = element.getData('html');
            if (html) {
                var index = html.indexOf('.') != -1;
                if (index) {
                    element.innerHTML = eval('_data.' + html);
                } else
                    element.innerHTML = _data[html];
            }

            var click = element.getData('click');
            if (click) {
                this.setBind(element, 'click', click, _data);
            }
        }

        root.parentNode.insertBefore(clone, root.nextSibling);
        return clone;
    }

    static create(root: HTMLElement, el: HTMLElement, data: Object[]): any {

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
        let $currentIndex = 0;
        for (let $index = $start; $index < $end; $index++) {
            root = Coco.append(root, el, data[$index], $index, $currentIndex);
            $currentIndex++;
        }
    }

    static next(sample: HTMLElement, source: Object[], name: string) {
        // Örnekteki bilgiyi sil
        sample.remData(name);
        // Örnek dosya ile data sayısınca çoğaltalım
        Coco.create(sample, sample, source);
        // Örneği Sil
        sample.parentNode.removeChild(sample);
    }

    static find(name: string) {

        var sources = document.querySelectorAll('[data-' + name + ']') as NodeListOf<HTMLElement>;
        if (sources) {

            for (var i = 0; i < sources.length; i++) {

                // Örneği al
                const sample = sources[i];
                // Örnek bilgisi
                const sourceName = sample.getData(name);

                if (name == 'api-url') {
                    this.url(sourceName, function (data) {
                        Coco.next(sample, data, name);
                    });
                } else {
                    Coco.next(sample, eval(sourceName), name);
                }
            }
        }
    }

    static init() {
        this.find('api-url');
        this.find('api-source');
    }

    static setBind(item: HTMLElement, name: string, action: any, data: Object) {
        item.setAction(name, function (e) {
            eval(action)({ event: e, item: data });
        });
    }
}


Coco.init();
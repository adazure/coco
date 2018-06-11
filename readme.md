## Kullanım

### Özellikler

* **data-api-url** :
  Parametre olarak verilen URL adresinden ilgili datayı çeker. Gelen data sayısı kadar ilgili nesneyi ekranda oluşturur.
  
  * **data-html** :
    İlgili döngü içerisindeki gelen dataya ait <alanadi> bilgiyi ekranda gösterir.

  * **data-count**:
    Gelen datanın ekranda kaç tanesinin görüntüleneceği sayısını tutar.

  * **data-page**:
    Gösterilmesi istenen sayfanın numarasını tutar. Varsayılan olarak 1'dir.
  
  * **data-click**:
    İlgili nesne üzerine tıklandığında çalıştırılacak methodu barındırır.

* **data-show**:
  Belirli bir koşulun sağlanması sonucunda gösterilmesi istenen nesneler için kullanılır.
  
* **data-hide**:
  Belirli bir koşulun sağlanması sorunucunda gizlenmesi istenen nesneler için kullanılır.
  
 
### Örnek Kullanım
  
> <script>function onClick(e){
      console.log(e);
      console.log(e.items);
      console.log(e.event);
    }</script>
    
> <div class="item" data-api-url="https://jsonplaceholder.typicode.com/comments">
            <div class="name" data-html="name"></div>
            <div class="email"><span data-html="email"></span><i class="premium" data-show="$data.premium == true">Premium</i></div>
            <div class="body" data-html="body"></div>
            <div>
                <input type="button" data-click="onClick" value="More details" />
            </div>
        </div>

# ESL Makina Taşlama Tezgahları — Web Sitesi

Statik HTML/CSS/JS ile hazırlanmış, çoklu sayfa yapısına sahip, SEO uyumlu kurumsal site.

## Sayfalar
- `index.html` — Anasayfa
- `hakkimizda.html` — Hakkımızda
- `hizmetlerimiz.html` — Hizmetlerimiz
- `projelerimiz.html` — Projelerimiz (önce/sonra)
- `teklif-al.html` — Teklif Al (form)
- `iletisim.html` — İletişim

Not: `vercel.json` içinde `cleanUrls` açık olduğu için site yayında `/hakkimizda`, `/hizmetlerimiz` gibi uzantısız adreslerle çalışır; dosyaların `.html` uzantılı olması sorun oluşturmaz.

## 1) GitHub'a Yükleme

Bu klasörde (tüm dosyaların bulunduğu yerde) sırasıyla:

```bash
git init
git add .
git commit -m "İlk sürüm: ESL Makina web sitesi"
```

GitHub'da yeni, **boş** bir repo oluşturun (README/gitignore eklemeden), sonra:

```bash
git branch -M main
git remote add origin https://github.com/KULLANICI_ADINIZ/REPO_ADI.git
git push -u origin main
```

## 2) Vercel'e Bağlama

1. https://vercel.com adresinde GitHub hesabınızla giriş yapın.
2. "Add New… → Project" deyip az önce push ettiğiniz repoyu seçin.
3. Framework olarak **Other / Static** seçilir (build adımı gerekmez, "Build Command" ve "Output Directory" boş bırakılabilir — proje kökünde `index.html` olduğu için Vercel otomatik statik site olarak sunar).
4. "Deploy" butonuna basın. Birkaç saniye içinde `xxx.vercel.app` adresiniz hazır olur.

## 3) Kendi Alan Adınızı Bağlama (opsiyonel)

Vercel projesinde **Settings → Domains** kısmından kendi alan adınızı (ör. `eslmakina.com.tr`) ekleyip, alan adı sağlayıcınızda gösterilen DNS kayıtlarını (genelde bir `A` ve/veya `CNAME` kaydı) tanımlamanız yeterli.

## 4) Domain Bağladıktan Sonra Güncellenecek Yerler

Kod içinde SEO amaçlı `https://www.eslmakina.com.tr` placeholder domaini kullanıldı. Gerçek alan adınızı bağladıktan sonra şu dosyalarda geçen adresi kendi alan adınızla değiştirin:

- Her sayfadaki `<link rel="canonical">` ve `<meta property="og:...">` etiketleri
- `sitemap.xml` içindeki tüm `<loc>` adresleri
- `robots.txt` içindeki `Sitemap:` satırı

İsterseniz "alan adım şu" diyerek bana bildirin, tüm dosyalarda toplu olarak güncelleyebilirim.

## 5) Teklif Formu

`teklif-al.html` içindeki form artık **kendi veritabanınıza** kaydediliyor (aşağıdaki Admin Paneli bölümüne bakın) ve ayrıca yedek olarak FormSubmit.co üzerinden `eşahin@mail.ru` adresine bir bildirim e-postası da gönderiliyor. FormSubmit ilk gönderimde e-postanıza bir onay linki yollar, o linke tıklandıktan sonra bildirim e-postaları düzenli gelmeye başlar (bu adım opsiyoneldir, atlarsanız talepler yine de panelde görünür).

## 6) Admin Paneli ve Veritabanı Kurulumu

Siteye şifreli bir yönetici paneli eklendi (`/admin`). Panelden, "Teklif Al" formuna gelen tüm talepleri görebilir ve kullanıcı adı/şifrenizi değiştirebilirsiniz. Bu özellik bir **Postgres veritabanı** ve bir **gizli anahtar (JWT_SECRET)** gerektirir. Vercel projenizde tek seferlik şu adımları uygulayın:

### a) Veritabanını bağlayın
1. Vercel projenizde **Storage** sekmesine gidin.
2. **Create Database → Postgres** seçip projeye bağlayın (Vercel gerekli `POSTGRES_URL` ortam değişkenlerini otomatik ekler).

### b) Gizli anahtarı ekleyin
1. **Settings → Environment Variables** kısmına gidin.
2. Adı `JWT_SECRET`, değeri rastgele/uzun bir metin (ör. `openssl rand -hex 32` ile üretebileceğiniz bir dize) olan yeni bir değişken ekleyin.
3. Kaydettikten sonra projeyi yeniden deploy edin (Deployments → sağ üstteki menüden "Redeploy").

### c) Giriş yapın
1. Siteniz yayında iken `https://SIZIN-ALAN-ADINIZ/admin-login` adresine gidin.
2. Varsayılan giriş bilgisi: **kullanıcı adı `admin`, şifre `123`** (veritabanı boşken otomatik oluşturulur).
3. Giriş yaptıktan sonra panelin altındaki **"Hesap Ayarları"** bölümünden kullanıcı adınızı ve şifrenizi değiştirin — bunu ilk girişte yapmanızı önemle tavsiye ederiz.

### Not
- Yönetici sayfaları (`/admin`, `/admin-login`) ve `/api/` uçları arama motorlarında indekslenmez (`robots.txt` ve `noindex` ile hariç tutuldu).
- Şifreler veritabanında düz metin değil, **bcrypt ile hash'lenmiş** olarak saklanır.
- Oturum, güvenli/HttpOnly bir çerez (JWT) ile 7 gün geçerli olacak şekilde tutulur.


## Google Search Console

Site yayına alındıktan sonra Google Search Console'a ekleyip `sitemap.xml` dosyasını göndermeniz, sitenin Google'da daha hızlı indekslenmesini sağlar.

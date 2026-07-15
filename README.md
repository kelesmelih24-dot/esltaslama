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

Vercel projesinde **Settings → Domains** kısmından kendi alan adınızı (ör. `eslmakine.com`) ekleyip, alan adı sağlayıcınızda gösterilen DNS kayıtlarını (genelde bir `A` ve/veya `CNAME` kaydı) tanımlamanız yeterli.

## 4) Domain Bağladıktan Sonra Güncellenecek Yerler

Kod içinde SEO amaçlı `https://www.eslmakine.com` placeholder domaini kullanıldı. Gerçek alan adınızı bağladıktan sonra şu dosyalarda geçen adresi kendi alan adınızla değiştirin:

- Her sayfadaki `<link rel="canonical">` ve `<meta property="og:...">` etiketleri
- `sitemap.xml` içindeki tüm `<loc>` adresleri
- `robots.txt` içindeki `Sitemap:` satırı

İsterseniz "alan adım şu" diyerek bana bildirin, tüm dosyalarda toplu olarak güncelleyebilirim.

## 5) Teklif Formu

`teklif-al.html` içindeki form artık **kendi veritabanınıza** kaydediliyor (aşağıdaki Admin Paneli bölümüne bakın) ve ayrıca yedek olarak FormSubmit.co üzerinden `eşahin@mail.ru` adresine bir bildirim e-postası da gönderiliyor. FormSubmit ilk gönderimde e-postanıza bir onay linki yollar, o linke tıklandıktan sonra bildirim e-postaları düzenli gelmeye başlar (bu adım opsiyoneldir, atlarsanız talepler yine de panelde görünür).

## 6) Admin Paneli ve Veritabanı Kurulumu (Supabase)

Siteye şifreli bir yönetici paneli eklendi (`/admin`). Panelden, "Teklif Al" formuna gelen tüm talepleri görebilir ve kullanıcı adı/şifrenizi değiştirebilirsiniz. Veritabanı olarak **Supabase** (Postgres) kullanılıyor. Tek seferlik şu adımları uygulayın:

### a) Supabase'de tabloları oluşturun
1. https://supabase.com adresinde projenize girin (siz zaten "esl" adında bir proje oluşturmuşsunuz).
2. Sol menüden **SQL Editor**'ü açın.
3. Bu repodaki `supabase/schema.sql` dosyasının tüm içeriğini kopyalayıp SQL Editor'e yapıştırın ve **Run** deyin.
   - Bu, `admin_users` ve `leads` adında iki tablo oluşturur ve varsayılan `admin / 123` giriş bilgisini ekler.

### b) API anahtarlarını alın
1. Supabase projenizde **Settings → API** sayfasına gidin.
2. **Project URL** değerini kopyalayın (örn. `https://xxxxx.supabase.co`).
3. **Project API keys** altındaki **`service_role`** anahtarını kopyalayın (⚠️ bu anahtar gizlidir, asla tarayıcıya/koda gömülmez — sadece Vercel ortam değişkeni olarak eklenecek).

### c) Vercel'de ortam değişkenlerini ekleyin
Vercel projenizde **Settings → Environment Variables** kısmına şu 3 değişkeni ekleyin:

| Değişken adı | Değer |
|---|---|
| `SUPABASE_URL` | Supabase'ten kopyaladığınız Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase'ten kopyaladığınız `service_role` anahtarı |
| `JWT_SECRET` | Rastgele/uzun bir metin (ör. `openssl rand -hex 32` ile üretilebilir) |

Ekledikten sonra projeyi yeniden deploy edin (Deployments → sağ üstteki menüden "Redeploy").

### d) Giriş yapın
1. Siteniz yayında iken `https://SIZIN-ALAN-ADINIZ/admin-login` adresine gidin.
2. Varsayılan giriş bilgisi: **kullanıcı adı `admin`, şifre `123`**.
3. Giriş yaptıktan sonra panelin altındaki **"Hesap Ayarları"** bölümünden kullanıcı adınızı ve şifrenizi değiştirin — bunu ilk girişte yapmanızı önemle tavsiye ederiz.

### Not
- Yönetici sayfaları (`/admin`, `/admin-login`) ve `/api/` uçları arama motorlarında indekslenmez (`robots.txt` ve `noindex` ile hariç tutuldu).
- Şifreler veritabanında düz metin değil, **bcrypt ile hash'lenmiş** olarak saklanır.
- Oturum, güvenli/HttpOnly bir çerez (JWT) ile 7 gün geçerli olacak şekilde tutulur.
- `service_role` anahtarı Supabase'in Row Level Security'yi (RLS) atlayan tam yetkili anahtarıdır; sadece sunucu tarafındaki (`/api`) kodda kullanılır, hiçbir zaman tarayıcıya gönderilmez.



## Google Search Console

Site yayına alındıktan sonra Google Search Console'a ekleyip `sitemap.xml` dosyasını göndermeniz, sitenin Google'da daha hızlı indekslenmesini sağlar.

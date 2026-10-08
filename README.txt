RASYA.
NETWORK ENTHUSIAST

Website portfolio personal premium untuk Rasya Ramadhan Sugandi.

Struktur utama:
- index.html
- style.css
- script.js
- assets/
  - favicon.svg
  - rasya-fallback.svg
  - rasya.png (gunakan foto asli Anda di sini)

Cara penggunaan:
1. Letakkan foto asli Anda di folder assets/rasya.png
2. Pastikan file ini tersimpan di folder /var/www/portfolio/assets/
3. Jalankan website sebagai static site di Apache
4. Gunakan folder /var/www/portfolio tanpa menyentuh /var/www/html

Catatan penting:
- Website dibuat tanpa Node.js, npm, build process, atau framework berat.
- Cocok untuk Apache pada Debian / Armbian / STB B860H.
- Ini adalah static website murni dari HTML, CSS, dan JS.

Contoh konfigurasi Apache:
<VirtualHost *:80>
    ServerName portfolio.DOMAIN.com

    DocumentRoot /var/www/portfolio

    <Directory /var/www/portfolio>
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/portfolio_error.log
    CustomLog ${APACHE_LOG_DIR}/portfolio_access.log combined
</VirtualHost>

Command:
sudo a2ensite portfolio.conf
sudo apache2ctl configtest
sudo systemctl reload apache2

Jangan mengubah konfigurasi PHPNuxBill yang ada di /var/www/html.

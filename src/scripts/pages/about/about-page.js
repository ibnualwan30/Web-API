export default class AboutPage {
  async render() {
    return `
      <section class="container">
        <h1>Tentang Story Map</h1>
        
        <div class="about-content">
          <p>Story Map adalah aplikasi berbagi cerita yang menggabungkan narasi dengan lokasi geografis. Aplikasi ini memungkinkan pengguna untuk:</p>
          
          <ul>
            <li>Melihat cerita-cerita dari seluruh dunia</li>
            <li>Menambahkan cerita dengan foto dan lokasi</li>
            <li>Menjelajahi peta interaktif yang menampilkan lokasi cerita</li>
          </ul>
          
          <h2>Teknologi yang Digunakan</h2>
          <p>Aplikasi ini dibuat dengan menggunakan:</p>
          
          <ul>
            <li>Vanilla JavaScript dengan arsitektur Single Page Application (SPA)</li>
            <li>Webpack sebagai module bundler</li>
            <li>Leaflet.js untuk peta interaktif</li>
            <li>Story API dari Dicoding sebagai backend dan penyimpanan data</li>
          </ul>
          
          <h2>Fitur Aksesibilitas</h2>
          <p>Aplikasi ini memiliki beberapa fitur aksesibilitas, di antaranya:</p>
          
          <ul>
            <li>Skip to content link untuk navigasi keyboard</li>
            <li>Markup HTML yang semantik</li>
            <li>Alt text untuk semua gambar</li>
            <li>Label yang terasosiasi dengan form control</li>
            <li>Kontras warna yang memadai</li>
          </ul>
        
      </section>
    `;
  }

  async afterRender() {
    // Tidak ada fungsionalitas khusus yang perlu ditambahkan di halaman About
  }
}
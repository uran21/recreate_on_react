"use client";
export default function Promo() {
  return (
    <footer id="footer" className="section promo">
      <div className="container promo__box">
        <div className="promo__copy">
          <h2 className="promo__title">
            Sip, Savor, Smile.
            <br />
            <span className="promo__accent">It’s coffee time!</span>
          </h2>

          <div className="promo__social">
            <a className="socbtn" href="#" aria-label="Twitter">
              <svg
                className="icon-svg"
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M18.244 2H21l-6.54 7.48L22.5 22h-6.9l-4.53-5.99L5.9 22H3.14l7.02-8.04L1.5 2h7.02l4.09 5.47L18.24 2Zm-1.2 18h1.86L7.02 4H5.16l11.884 16Z" />
              </svg>
            </a>

            <a className="socbtn" href="#" aria-label="Instagram">
              <svg
                className="icon-svg"
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.97.24 2.428.403a4.9 4.9 0 0 1 1.77 1.153 4.9 4.9 0 0 1 1.153 1.77c.163.458.349 1.258.403 2.428.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.24 1.97-.403 2.428a4.9 4.9 0 0 1-1.153 1.77 4.9 4.9 0 0 1-1.77 1.153c-.458.163-1.258.349-2.428.403-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.97-.24-2.428-.403a4.9 4.9 0 0 1-1.77-1.153 4.9 4.9 0 0 1-1.153-1.77c-.163-.458-.349-1.258-.403-2.428C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.054-1.17.24-1.97.403-2.428A4.9 4.9 0 0 1 3.789 2.95a4.9 4.9 0 0 1 1.77-1.153c.458-.163 1.258-.349 2.428-.403C9.254 1.175 9.634 1.163 12 1.163Zm0 1.8c-3.16 0-3.532.012-4.776.069-.997.046-1.538.213-1.898.354-.478.185-.82.406-1.178.764-.358.358-.579.7-.764 1.178-.141.36-.308.901-.354 1.898-.057 1.244-.069 1.616-.069 4.776s.012 3.532.069 4.776c.046.997.213 1.538.354 1.898.185.478.406.82.764 1.178.358.358.7.579 1.178.764.36.141.901.308 1.898.354 1.244.057 1.616.069 4.776.069s3.532-.012 4.776-.069c.997-.046 1.538-.213 1.898-.354.478-.185.82-.406 1.178-.764.358-.358.579-.7.764-1.178.141-.36.308-.901.354-1.898.057-1.244.069-1.616.069-4.776s-.012-3.532-.069-4.776c-.046-.997-.213-1.538-.354-1.898a3.1 3.1 0 0 0-.764-1.178 3.1 3.1 0 0 0-1.178-.764c-.36-.141-.901-.308-1.898-.354-1.244-.057-1.616-.069-4.776-.069ZM12 5.838a6.162 6.162 0 1 1 0 12.324 6.162 6.162 0 0 1 0-12.324Zm0 1.8a4.362 4.362 0 1 0 0 8.724 4.362 4.362 0 0 0 0-8.724Zm5.406-1.284a1.44 1.44 0 1 1 0 2.881 1.44 1.44 0 0 1 0-2.881Z" />
              </svg>
            </a>

            <a className="socbtn" href="#" aria-label="Facebook">
              <svg
                className="icon-svg"
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M22 12.06C22 6.48 17.52 2 11.94 2S2 6.48 2 12.06c0 5.02 3.66 9.19 8.44 9.94v-7.03H7.9V12.06h2.54V9.87c0-2.51 1.5-3.9 3.78-3.9 1.1 0 2.25.2 2.25.2v2.47h-1.27c-1.25 0-1.64.78-1.64 1.58v1.84h2.79l-.45 2.91h-2.34V22c4.78-.75 8.44-4.92 8.44-9.94Z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="promo__contact">
          <h3 className="promo__heading">Contact us</h3>
          <ul className="contact">
            <li>
              <a
                href="https://maps.app.goo.gl/BJAw4vf65HvVFdw36"
                target="_blank"
                rel="noopener"
              >
                <svg
                  className="icon-svg"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2a7 7 0 0 0-7 7c0 4.97 7 13 7 13s7-8.03 7-13a7 7 0 0 0-7-7Zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
                </svg>
                <span className="contact__text">8558 Green Rd., LA</span>
              </a>
            </li>
            <li>
              <a className="contact-link" href="tel:+15551234567">
                <svg
                  className="icon-svg"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.1.36 2.29.55 3.58.55a1 1 0 0 1 1 1V20a2 2 0 0 1-2 2A18 18 0 0 1 2 6a2 2 0 0 1 2-2h3.51a1 1 0 0 1 1 1c0 1.29.19 2.48.55 3.58a1 1 0 0 1-.24 1.01l-2.2 2.2Z" />
                </svg>
                <span className="contact__text">+1 (603) 555-0123</span>
              </a>
            </li>
            <li>
              <svg className="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Zm1 5h-2v6l5 3 1-1.73-4-2.27V7Z" />
              </svg>
              <span className="contact__text">Mon–Sat: 9:00 AM – 23:00 PM</span>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

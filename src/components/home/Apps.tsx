"use client";
export default function App() {
  return (
    <section id="app" className="section apps">
      <div className="container apps__grid">
        <div className="apps__copy">
          <h2 className="apps__title">
            <span className="apps__accent">Download</span> our apps
            <br />
            to start ordering
          </h2>
          <p className="text-medium apps__sub">
            Download the Resource app today and experience the comfort of
            ordering your favorite coffee from wherever you are.
          </p>

          <div className="apps__stores">
            <a
              className="store-link"
              href="#"
              aria-label="Download on the App Store"
            >
              <img
                className="icon icon--default"
                src="/assets/defaultapp.svg"
                alt=""
              />
              <img
                className="icon icon--hover"
                src="/assets/hoverapp.svg"
                alt=""
                aria-hidden="true"
              />
            </a>

            <a
              className="store-link"
              href="#"
              aria-label="Get it on Google Play"
            >
              <img
                className="icon icon--default"
                src="/assets/defaultplay.svg"
                alt=""
              />
              <img
                className="icon icon--hover"
                src="/assets/hoverplay.svg"
                alt=""
                aria-hidden="true"
              />
            </a>
          </div>
        </div>

        <div className="apps__media">
          <img
            src="/assets/mobile-screens.svg"
            alt="Preview of the Coffee House mobile application screens"
          />
        </div>
      </div>
    </section>
  );
}

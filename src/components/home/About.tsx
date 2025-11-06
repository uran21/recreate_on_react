"use client";
export default function About() {
  return (
    <section id="about" className="section about">
      <div className="container about__wrap">
        <h2 className="about__title">
          Resource is <em>the perfect and cozy place</em> where you can enjoy a
          variety of hot beverages, relax, catch up with friends, or get some
          work done.
        </h2>

        <div className="about-grid">
          <figure className="about-card ratio-1 hover-zoom">
            <img
              src="/assets/girl-cofee.jpg"
              alt="Smiling woman holding a cup of coffee"
            />
          </figure>

          <figure className="about-card ratio-2 u-hide-760 hover-zoom">
            <img
              src="/assets/man-coffee.jpg"
              alt="Man enjoying coffee by the window"
            />
          </figure>

          <figure className="about-card ratio-3 u-hide-760 hover-zoom">
            <img
              src="/assets/table-cofee.jpg"
              alt="Cup of coffee on a wooden table"
            />
          </figure>

          <figure className="about-card ratio-4 about-card--shift-up hover-zoom">
            <img
              src="/assets/couple-coffee.jpg"
              alt="Couple drinking coffee together"
            />
          </figure>
        </div>
      </div>
    </section>
  );
}

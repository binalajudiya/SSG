import sanityClient from '../../sanityClient';
import React from 'react';

export async function getStaticProps() {
  try {
    const aggTableQuery = `
      *[_type == "aggtable"] {
       brands[]{
          name,
          brand->{
            title,
            "brandLogo": brandLogo.asset->url,
            offerText,
            link
          },
          topBarMessage
        }
      }
    `;

    const bhassetsQuery = `
      *[_type == "bhassets"] {
        "cardicon": cardicon.asset->url,
        footer[]{
          "footer": asset->url,
        }
      }
    `;

    const aggTableData = await sanityClient.fetch(aggTableQuery);
    const bhassetsData = await sanityClient.fetch(bhassetsQuery);

    // Assuming you want the first aggtable and the first bhassets document
    const table = aggTableData ? aggTableData[0] : null;
    const assets = bhassetsData ? bhassetsData[0] : null;

    // console.log("Fetched aggTable data:", aggTableData[0].brands[0].brand);
    // console.log("Fetched bhassets data:", assets);

    if (!table || !assets) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        table,
        assets,
      },
      // revalidate: 60,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      props: {},
    };
  }
}

export default function Home({ table, assets }) {
  if (!table) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="body lp-template lp-template-mp-lp lp-template-lp lp-template-mp-lplp-php single single-lp postid-4523 logged-in admin-bar no-customize-support mp-lp-template-2 dark-mode-both et-tb-has-template et-tb-has-header et-tb-has-footer et_pb_button_helper_class et_cover_background et_pb_gutter osx et_pb_gutters3 et_right_sidebar et_divi_theme et-db">
        <div className="main">
          <div className="top-bar-message">Tested by Experts. Recommended by Players.</div>
          <div className="section section--hero hero-desktop-alignment-left hero-mobile-alignment-center has-mobile-hero has-hero-image">
            <div className="container">
              <div className="hero-container">
                <div className="hero-container__left-side">
                  <div className="hero-section-content hero-section--desktop content">
                    <h1><span>BEST RATED </span>ONLINE CASINOS IN AUSTRALIA</h1>
                    <p>Check out the best &amp; most trusted online casinos with <strong>exclusive deposit bonus offers, </strong>the<strong> highest payout rates </strong>on <strong>pokies, high quality live table games</strong> and more!</p>
                  </div>
                  <div className="features-icons-wrapper features-icons-wrapper--alt features-position-desktop-default features-position-mobile-center">
                    <div className="features-icons">
                      <div className="feature-icon-single">
                        <img src="https://wordpress-1369597-5246653.cloudwaysapps.com/wp-content/themes/Divi/mp-lp/assets/defaults/icon-wallet.png" className="feature-icon" alt="" />
                        <div className="feature-icon-label">96.8% RTP</div>
                      </div>
                      <div className="feature-icon-single">
                        <img src="https://wordpress-1369597-5246653.cloudwaysapps.com/wp-content/themes/Divi/mp-lp/assets/defaults/icon-check-charm-white.png" className="feature-icon" alt="" />
                        <div className="feature-icon-label">NO KYC REQUIRED</div>
                      </div>
                      <div className="feature-icon-single">
                        <img src="https://wordpress-1369597-5246653.cloudwaysapps.com/wp-content/themes/Divi/mp-lp/assets/defaults/icon-shield.png" className="feature-icon" alt="" />
                        <div className="feature-icon-label">TRUSTED & SECURE</div>
                      </div>
                    </div>
                  </div>
                  <div className="last-updated last-updated--both last-updated--pos-desktop-left last-updated--pos-mobile-right">Last Updated: 6 March 2025</div>
                </div>
                <div className="hero-container__right-side">
                  <img className="hero-image" src="https://wordpress-1369597-5246653.cloudwaysapps.com/wp-content/themes/Divi/mp-lp/assets/au-chip.png" alt="hero image" />
                </div>
              </div>
            </div>
          </div>
          <div className="section section--table">
            <div className="container">
              <div className="casino-table">
                <div className="casino-table__rows">
                  {table.brands.map((item, index) => (
                    <div className={`ctr ${item.topBarMessage ? 'ctr--has-ribbon' : ''}`} key={index} >
                      <div className="ctc ctc--pos">{index}</div>
                      <div className="ctc ctc--logo has-ribbon">
                        {item.topBarMessage && <div className="ribbon ribbon-logo">{item.topBarMessage}</div>}
                        <img src={item.brand.brandLogo} alt={item.brand.title} />
                      </div>

                      <div className="ctc ctc--offer" dangerouslySetInnerHTML={{ __html: item.brand.offerText }} />

                      <div className="ctc ctc--features">
                        <div className="brand-features">
                          <ul>
                            <li>96.8%+ RTP</li>
                            <li>1,000+ Pokies</li>
                            <li>No KYC required</li>
                          </ul>
                        </div>
                      </div>

                      <div className="ctc ctc--payment">
                        <div className="payment-methods">
                          <div className="pm-icon-outer-wrapper">
                            <div className="pm-icon-wrapper" data-tooltip="Visa">
                              <div className="pm-icon pm-visa"></div>
                            </div>
                            <div className="pm-icon-outer-label">Visa</div>
                          </div>
                          <div className="pm-icon-outer-wrapper">
                            <div className="pm-icon-wrapper" data-tooltip="MasterCard">
                              <div className="pm-icon pm-mastercard"></div>
                            </div>
                            <div className="pm-icon-outer-label">MasterCard</div>
                          </div>
                          <div className="pm-icon-outer-wrapper">
                            <div className="pm-icon-wrapper" data-tooltip="PayId">
                              <div className="pm-icon pm-payid"></div>
                            </div>
                            <div className="pm-icon-outer-label">PayId</div>
                          </div>
                          <div className="pm-icon-outer-wrapper">
                            <div className="pm-icon-wrapper" data-tooltip="Neosurf">
                              <div className="pm-icon pm-neosurf"></div>
                            </div>
                            <div className="pm-icon-outer-label">Neosurf</div>
                          </div>
                        </div>
                        <div className="more-pm more-pm--long">+9 more ways to deposit</div>
                        <div className="more-pm more-pm--short">+9 more</div>
                        <div className="more-pm-tooltip">
                          <div className="more-pm-list" data-mp-list="<div class=&quot;more-mp-item&quot;><div class=&quot;pm-icon-wrapper&quot;><div class=&quot;pm-icon pm-visa&quot;></div></div><div class=&quot;more-pm-label&quot;>Visa</div></div><div class=&quot;more-mp-item&quot;><div class=&quot;pm-icon-wrapper&quot;><div class=&quot;pm-icon pm-mastercard&quot;></div></div><div class=&quot;more-pm-label&quot;>MasterCard</div></div><div class=&quot;more-mp-item&quot;><div class=&quot;pm-icon-wrapper&quot;><div class=&quot;pm-icon pm-payid&quot;></div></div><div class=&quot;more-pm-label&quot;>PayId</div></div><div class=&quot;more-mp-item&quot;><div class=&quot;pm-icon-wrapper&quot;><div class=&quot;pm-icon pm-neosurf&quot;></div></div><div class=&quot;more-pm-label&quot;>Neosurf</div></div><div class=&quot;more-mp-item&quot;><div class=&quot;pm-icon-wrapper&quot;><div class=&quot;pm-icon pm-bitcoin&quot;></div></div><div class=&quot;more-pm-label&quot;>Bitcoin</div></div><div class=&quot;more-mp-item&quot;><div class=&quot;pm-icon-wrapper&quot;><div class=&quot;pm-icon pm-poli&quot;></div></div><div class=&quot;more-pm-label&quot;>POLi</div></div><div class=&quot;more-mp-item&quot;><div class=&quot;pm-icon-wrapper&quot;><div class=&quot;pm-icon pm-maestro&quot;></div></div><div class=&quot;more-pm-label&quot;>Maestro</div></div><div class=&quot;more-mp-item&quot;><div class=&quot;pm-icon-wrapper&quot;><div class=&quot;pm-icon pm-bank-transfer&quot;></div></div><div class=&quot;more-pm-label&quot;>Bank Transfer</div></div><div class=&quot;more-mp-item&quot;><div class=&quot;pm-icon-wrapper&quot;><div class=&quot;pm-icon pm-mifinity&quot;></div></div><div class=&quot;more-pm-label&quot;>MiFINITY</div></div><div class=&quot;more-mp-item&quot;><div class=&quot;pm-icon-wrapper&quot;><div class=&quot;pm-icon pm-litecoin&quot;></div></div><div class=&quot;more-pm-label&quot;>Litecoin</div></div><div class=&quot;more-mp-item&quot;><div class=&quot;pm-icon-wrapper&quot;><div class=&quot;pm-icon pm-ethereum&quot;></div></div><div class=&quot;more-pm-label&quot;>Ethereum</div></div><div class=&quot;more-mp-item&quot;><div class=&quot;pm-icon-wrapper&quot;><div class=&quot;pm-icon pm-tether&quot;></div></div><div class=&quot;more-pm-label&quot;>Tether</div></div><div class=&quot;more-mp-item&quot;><div class=&quot;pm-icon-wrapper&quot;><div class=&quot;pm-icon pm-ripple&quot;></div></div><div class=&quot;more-pm-label&quot;>Ripple</div></div>"></div>
                        </div>
                      </div>

                      <div className="ctc ctc--rating">
                        <div className="score-label">Our Score</div>
                        <div className="star-rating">
                          <div className="star">
                            <svg className="star-icon">
                              <use href="#star"></use>
                            </svg>
                          </div>
                          <div className="star">
                            <svg className="star-icon">
                              <use href="#star"></use>
                            </svg>
                          </div>
                          <div className="star">
                            <svg className="star-icon">
                              <use href="#star"></use>
                            </svg>
                          </div>
                          <div className="star">
                            <svg className="star-icon">
                              <use href="#star"></use>
                            </svg>
                          </div>
                          <div className="star">
                            <svg className="star-icon">
                              <use href="#star"></use>
                            </svg>
                          </div>
                        </div>
                        <div className="votes">Votes (6491)</div>
                      </div>

                      <div className="ctc ctc--clickout">
                        <a href={`https://clk.wordpress-1369597-5246653.cloudwaysapps.com/click/${item.brand.link}`} className="button button--claim" target="_blank" rel="noindex nofollow noopener noreferrer">GET BONUS</a>
                        {index === 0 && <div className="clickout-incentive clickout-incentive--under-cta">Over <strong>217</strong> chose this site today 🔥</div>}
                      </div>
                    </div>

                  ))
                  }
                </div>
              </div>
            </div>
          </div>
          <div className="section section--content">
            <div className="container">
              <div className="content-blocks">
                <div className="content-block">
                  <div className="content-block-image">
                    <img className="lazy" src={assets.cardicon} alt="" />
                  </div>
                  <div className="content-block-content content">
                    <h2>WHY USE OUR SITE ?</h2>
                    <p>When you need accurate information and useful tips, you ask the experts. Our team consists of a number of experienced casino enthusiasts with many years of experience in the industry. From passionate poker players and sports betting enthusiasts, to former employees of online casinos – our team knows what is in the industry and wants to share our expertise with you. Thanks to our broad network in the industry, we can also offer our visitors unique and fantastic benefits, both for new and recurring players. We also know which traps to avoid and always filter out the casinos that are not the best solution for serious players. In summary, if you are looking for quality, bonuses, free spins and a professional attitude towards gambling then you are in the right place.</p>
                  </div>
                </div>
                <div className="content-block">
                  <div className="content-block-image">
                    <img className="lazy" src={assets.cardicon} alt="" />
                  </div>
                  <div className="content-block-content content">
                    <h2>SECURITY</h2>
                    <p>Everything begins with safety. Your winnings mean nothing if your account is hacked or if the website is operated without a proper license. The online casino industry is heavily regulated, but nevertheless some rogue suppliers succeed market players to get away. To safeguard your security and peace of mind, we only offer casinos that meet the requirements for secure payment methods, have the right licenses for games and secure websites. In addition, we will never market casinos with consistently bad reviews. When choosing a casino from our website, you can feel confident that your personal information, payment details and most importantly – your money – are in safe hands.</p>
                  </div>
                </div>
                <div className="content-block">
                  <div className="content-block-image">
                    <img className="lazy" src={assets.cardicon} alt="" />
                  </div>
                  <div className="content-block-content content">
                    <h2>BONUSES</h2>
                    <p>It is difficult to think of online games today without the word “bonus” appearing. Every casino offers them. However, some are better than others. Is it an actual cash bonus, free spins or “fake money”? How do you compare which casino has the best deal for new players? Which games offer the best bonuses? Fortunately, we give you all that information. And not only that, our partnerships with the best providers of online casinos allow us to offer incredible registration bonuses for new players. Register today and enjoy incredible bonus offers that no other casino can match. There is really no better way to start your first exciting casino experience than with a generous bonus that doubles, triples or even quadruples your first deposit!</p>
                  </div>
                </div>
                <div className="content-block">
                  <div className="content-block-image">
                    <img className="lazy" src={assets.cardicon} alt="" />
                  </div>
                  <div className="content-block-content content">
                    <h2>PAYMENT OPTIONS</h2>
                    <p>Australia has always been at the forefront of technology and this is extra obvious when it comes to payment options for online casinos. There is something for everyone. From traditional credit card payment with VISA or Mastercard, direct bank transfer to e-wallets like Neosurf and Bitcoin. In many cases, the casinos offer several different alternatives to the respective payment methods. This is an obvious benefit to the players because some may not have a credit card, or you may feel more comfortable transferring money through your internet bank, rather than disclosing your credit card information. In summary, it has never been easier to deposit money and get started with the game of your favourite casino.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <picture>
          <source media="(max-width: 767px)" srcSet="https://wordpress-1369597-5246653.cloudwaysapps.com/wp-content/themes/Divi/mp-lp/assets/defaults/mobile-bg-2.jpg" />
          <img className="body-bg" src="https://wordpress-1369597-5246653.cloudwaysapps.com/wp-content/themes/Divi/mp-lp/assets/defaults/desktop-bg-2.jpg" alt="site background" />
        </picture>

        <footer className="footer">
          <div className="container">
            <p>We are a wholly independent third party that provides news, reviews, tips and tips related to casinos, and all of our opinions represent us, and somehow brands or brands do not appear on this site. All our information can be proved true. All casinos will display their own terms on their own websites and they should always be checked before they are played. All terms of use for this article are displayed at the bottom of this page and also on the operators&#8217; pages. In order to combine the casino listings and reviews on this site, we have collected information from a variety of sources, including user experiences and comments. In some cases, we have taken into account our own listing and rating algorithms, in addition to some third-party lists. In order for us to be able to keep this information free, we can in the meantime receive income from the current service providers. Despite the fact that we will do our utmost to ensure that all information we provide is up-to-date and accurate, we assume no responsibility for the warranties or permits in question. This applies to everything from knowledge transferability to its applicability and importance. This site, including its content and services, is provided as &#8220;it is&#8221;. Thus, the use or trust of the information provided is entirely at your own risk.</p>
            <div className="footer-icons">
              {assets.footer.map((footerIcon, index) => (
                <img
                  key={index}
                  className="lazy"
                  src={footerIcon.footer}
                  alt={`footer icon ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </footer>

        <svg className="svg-defs">
          <symbol xmlns="http://www.w3.org/2000/svg" viewBox="0 0 475.075 475.075" id="star">
            <path d="M475.075 186.573c0-7.043-5.328-11.42-15.992-13.135L315.766 152.6 251.529 22.694c-3.614-7.804-8.281-11.704-13.99-11.704-5.708 0-10.372 3.9-13.989 11.704L159.31 152.6 15.986 173.438C5.33 175.153 0 179.53 0 186.573c0 3.999 2.38 8.567 7.139 13.706l103.924 101.068L86.51 444.096c-.381 2.666-.57 4.575-.57 5.712 0 3.997.998 7.374 2.996 10.136 1.997 2.766 4.993 4.142 8.992 4.142 3.428 0 7.233-1.137 11.42-3.423l128.188-67.386 128.197 67.386c4.004 2.286 7.81 3.423 11.416 3.423 3.819 0 6.715-1.376 8.713-4.142 1.992-2.758 2.991-6.139 2.991-10.136 0-2.471-.096-4.374-.287-5.712l-24.555-142.749 103.637-101.068c4.956-4.949 7.427-9.519 7.427-13.706z"></path>
          </symbol>
        </svg>
        <svg className="svg-defs">
          <symbol xmlns="http://www.w3.org/2000/svg" viewBox="0 0 475.044 475.044" id="star-half">
            <path d="M474.487 183.276c-1.711-5.236-6.852-8.52-15.41-9.851l-143.323-20.839L251.52 22.681c-4-7.804-8.661-11.704-13.989-11.704-5.519 0-10.183 3.9-13.988 11.704l-64.241 129.905-143.324 20.839c-8.564 1.332-13.704 4.615-15.415 9.851-1.709 5.236.478 10.898 6.567 16.989l103.924 101.068-24.553 142.749c-.95 6.286-.381 11.173 1.715 14.702 2.092 3.524 5.33 5.283 9.707 5.283 3.237 0 7.043-1.14 11.42-3.433l128.194-67.382 128.19 67.382c4.377 2.286 8.186 3.433 11.423 3.433 4.381 0 7.622-1.759 9.709-5.283 2.088-3.529 2.659-8.416 1.708-14.702l-24.551-142.749 103.63-101.068c6.284-6.091 8.566-11.753 6.841-16.989zm-135.89 91.789l-13.99 13.421 3.43 18.843 17.128 101.357-90.786-47.965-16.848-8.856V76.927l45.395 91.933 8.559 17.128 18.85 2.856 101.642 14.844z"></path>
          </symbol>
        </svg>
        <svg className="svg-defs">
          <symbol xmlns="http://www.w3.org/2000/svg" viewBox="0 0 475.075 475.075" id="star-empty">
            <path d="M475.075 186.573c0-7.043-5.328-11.42-15.992-13.135L315.766 152.6 251.529 22.694c-3.614-7.804-8.281-11.704-13.99-11.704-5.708 0-10.372 3.9-13.989 11.704L159.31 152.6 15.986 173.438C5.33 175.153 0 179.53 0 186.573c0 3.999 2.38 8.567 7.139 13.706l103.924 101.068L86.51 444.096c-.381 2.666-.57 4.575-.57 5.712 0 3.997.998 7.374 2.996 10.136 1.997 2.766 4.993 4.142 8.992 4.142 3.428 0 7.233-1.137 11.42-3.423l128.188-67.386 128.194 67.379c4 2.286 7.806 3.43 11.416 3.43 7.812 0 11.714-4.75 11.714-14.271 0-2.471-.096-4.374-.287-5.716l-24.551-142.744 103.634-101.069c4.948-4.956 7.419-9.526 7.419-13.713zM324.619 288.5l20.551 120.2-107.634-56.821L129.614 408.7l20.843-120.2-87.365-84.799 120.484-17.7 53.959-109.064 53.957 109.064 120.494 17.7z"></path>
          </symbol>
        </svg>
      </div>
      {/* Your Vanilla JS Script */}
      <script dangerouslySetInnerHTML={{ __html: `
        document.addEventListener('DOMContentLoaded', function () {
          const keysToAppend = ['gclid', 'wbraid', 'gbraid'];
          const currentParams = new URLSearchParams(window.location.search);
          const appendParams = new URLSearchParams();
          keysToAppend.forEach(key => {
            const value = currentParams.get(key);
            if (value !== null) {
              appendParams.set(key, value);
            }
          });
          const targetHostname = "cf." + window.location.hostname;
          const clickPathRegex = /^\\/click\\/(?:[1-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9]|6[0-9])$/;
          document.querySelectorAll('a[href]').forEach(link => {
            try {
              const url = new URL(link.href);
              if (url.hostname === targetHostname && clickPathRegex.test(url.pathname)) {
                const linkParams = new URLSearchParams(url.search);
                appendParams.forEach((value, key) => {
                  linkParams.set(key, value);
                });
                url.search = linkParams.toString();
                link.href = url.toString();
              }
            } catch (e) {
              // Handlessasasa invalid URLs ifnmbb needed
            }
          });
        });
      `}} />
    </div>
  );
}

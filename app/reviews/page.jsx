import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import './reviews.css';
import ThemeToggle from '../theme-toggle';
import LanguageToggle from '../language-toggle';
import Text from '../i18n-text';

export const metadata = { title: 'Reviews | Unisanda' };

const reviews = [
  { title: 'Ashes of Creation', type: 'Game', typeAr: 'لعبة', date: '11 DEC', dateAr: '11 ديسمبر' },
  { title: 'The Game Awards', type: 'Event', typeAr: 'فعالية', date: '11 DEC', dateAr: '11 ديسمبر' },
  { title: 'Terminator 2 No Fate', type: 'Game', typeAr: 'لعبة', date: '12 DEC', dateAr: '12 ديسمبر' },
];

export default function Reviews() {
  return <div className="site-shell reviews-page"><div className="site-container">
    <header className="site-header"><Link href="/" className="site-name" aria-label="Unisanda home">unisanda<span>.</span></Link><nav aria-label="Main navigation"><Link href="/"><Text en="Links" ar="الروابط" /></Link><Link href="/reviews/" className="nav-current" aria-current="page"><Text en="Reviews" ar="المراجعات" /></Link><LanguageToggle /><ThemeToggle /></nav></header>
    <main><section className="reviews-intro"><div><span className="overline"><Text en="THE ARCHIVE" ar="الأرشيف" /></span><h1><Text en="Reviews" ar="المراجعات" /><span>.</span></h1><p><Text en="Games, events, and everything in between." ar="ألعاب وفعاليات وكل ما يستحق المراجعة." /></p></div><div className="logo-stage"><div className="animated-logo"><img src="/images/Logo.png" alt="Unisanda logo" /></div></div></section>
      <section className="review-section" aria-labelledby="review-list-title"><div className="section-top"><span><Text en="01 / REVIEWS" ar="01 / المراجعات" /></span><h2 id="review-list-title"><Text en="On the list" ar="قائمة المراجعات" /></h2></div><div className="review-list">{reviews.map((review, index) => <article className="review-row" key={review.title}><span className="review-index">0{index + 1}</span><div><span className="review-type"><Text en={review.type} ar={review.typeAr} /></span><h3 dir="ltr">{review.title}</h3></div><span className="review-date"><Text en={review.date} ar={review.dateAr} /></span><span className="review-soon"><Text en="Coming soon" ar="قريبًا" /> <ArrowUpRight size={15} aria-hidden="true" /></span></article>)}</div></section>
      <Link className="back-link" href="/"><ArrowLeft size={17} aria-hidden="true" /> <Text en="Back to links" ar="العودة للروابط" /></Link>
    </main><footer className="site-footer"><span>© {new Date().getFullYear()} unisanda</span><span><Text en="Made on the internet." ar="صُنع على الإنترنت." /></span></footer>
  </div></div>;
}
